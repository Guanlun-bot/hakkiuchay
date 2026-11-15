// 學鳩齋・線上書齋 多人伺服器
// 做法和 server.py 一樣：一個書齋房間由一台伺服器（一個 Durable Object）記住每個人的狀態，
// 大家都連到它，它把每個人的位置、狀態與語音片段轉給同房的其他人。差別是改用 WebSocket 一直連著，
// 而且放在 Cloudflare 上，任何地方都連得到。
//
// 連線：wss://<網址>/room/<房間代號>?id=<這個分頁的固定身分>
// 用戶端送：{t:'ping'}（伺服器自動回 {t:'pong'}，用來發現斷掉的連線）
//         {t:'u', p:{…狀態}, mic:bool, sp:bool, v:[{sr,b64},…]}（p、v 都可省略；什麼都沒變時每 2.5 秒送一次當心跳）
// 伺服器送：{t:'all', peers:[{id,p,mic,sp}]}  剛連上時的全員名單
//           {t:'u', id, p?, mic, sp, v?}       某人的更新（含語音片段）
//           {t:'bye', id}                      某人離開
//
// 語音另走一條連線（同一個網址加 &voice=1，由瀏覽器背景的 Worker 開，不受 3D 畫面忙碌影響）：
// 用戶端送 {t:'v', v:[{sr,b64},…]}，伺服器轉 {t:'v', id, v} 給其他人的語音連線（對方沒有語音連線時，改送到他的主連線）。

const MAX_PEERS = 40, MAX_STATE = 12000, MAX_CHUNKS = 8, MAX_CHUNK = 6000, STALE_MS = 20000;
const okRoom = s => /^[A-Z0-9-]{1,24}$/.test(s), okId = s => /^[A-Za-z0-9-]{4,64}$/.test(s);

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname === '/' || url.pathname === '/health') return new Response('hakkiuchay-vr ok', { headers: { 'content-type': 'text/plain; charset=utf-8', 'access-control-allow-origin': '*' } });
    const m = url.pathname.match(/^\/room\/([^/]+)$/);
    if (!m) return new Response('not found', { status: 404 });
    const room = decodeURIComponent(m[1]).toUpperCase();
    if (!okRoom(room)) return new Response('bad room', { status: 400 });
    if (req.headers.get('Upgrade') !== 'websocket') return new Response('expected websocket', { status: 426 });
    return env.ROOM.get(env.ROOM.idFromName(room)).fetch(req);
  }
};

export class Room {
  constructor(ctx, env) {
    this.ctx = ctx;
    // keep-alive: answered by Cloudflare itself, without waking the room, so clients can tell a dead connection quickly
    ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair('{"t":"ping"}', '{"t":"pong"}'));
    this.peers = new Map();   // id -> {ws, p, mic, sp, seen}
    this.voice = new Map();   // id -> the voice socket
    // after a hibernation wake-up, sockets are still open: rebuild who is who (their states come back with the next heartbeat)
    for (const ws of ctx.getWebSockets()) { const a = ws.deserializeAttachment(); if (a && a.id) { if (a.voice) this.voice.set(a.id, ws); else this.peers.set(a.id, { ws, p: null, mic: false, sp: false, seen: Date.now() }); } }
  }

  async fetch(req) {
    const q = new URL(req.url).searchParams, id = q.get('id') || '';
    if (!okId(id)) return new Response('bad id', { status: 400 });
    if (q.get('voice') === '1') {
      const pair = new WebSocketPair(), [client, server] = Object.values(pair);
      this.ctx.acceptWebSocket(server); server.serializeAttachment({ id, voice: true });
      const old = this.voice.get(id); if (old) { try { old.close(4000, 'replaced'); } catch {} }
      this.voice.set(id, server);
      return new Response(null, { status: 101, webSocket: client });
    }
    const old = this.peers.get(id);
    if (!old && this.peers.size >= MAX_PEERS) return new Response('room full', { status: 503 });
    const pair = new WebSocketPair(), [client, server] = Object.values(pair);
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment({ id });
    // the same person reconnecting replaces their old connection: no second copy of them
    if (old) { try { old.ws.close(4000, 'replaced'); } catch {} }
    this.peers.set(id, { ws: server, p: old ? old.p : null, mic: old ? old.mic : false, sp: false, seen: Date.now() });
    const list = [];
    for (const [k, v] of this.peers) if (k !== id && v.p) list.push({ id: k, p: v.p, mic: v.mic, sp: v.sp });
    server.send(JSON.stringify({ t: 'all', peers: list }));
    return new Response(null, { status: 101, webSocket: client });
  }

  idOf(ws) { const a = ws.deserializeAttachment(); return a && a.id; }

  send(except, msg) {
    const s = JSON.stringify(msg);
    for (const [k, v] of this.peers) if (k !== except) { try { v.ws.send(s); } catch {} }
  }

  sweep(now) {
    for (const [k, v] of this.peers) if (now - v.seen > STALE_MS) { this.peers.delete(k); try { v.ws.close(4001, 'stale'); } catch {} this.send(k, { t: 'bye', id: k }); }
  }

  voiceIn(ws, a, data) {
    if (this.voice.get(a.id) !== ws || typeof data !== 'string' || data.length > MAX_CHUNKS * MAX_CHUNK + 200) return;
    let m; try { m = JSON.parse(data); } catch { return; }
    if (!m || m.t !== 'v' || !Array.isArray(m.v)) return;
    const v = [];
    for (const c of m.v.slice(0, MAX_CHUNKS)) if (c && typeof c.b64 === 'string' && c.b64.length <= MAX_CHUNK) v.push({ sr: Math.min(48000, Math.max(8000, c.sr | 0 || 16000)), b64: c.b64 });
    if (!v.length) return;
    const s = JSON.stringify({ t: 'v', id: a.id, v }), sent = new Set([a.id]);
    for (const [k, w] of this.voice) if (!sent.has(k)) { sent.add(k); try { w.send(s); } catch {} }
    // anyone without a voice line (an old browser) gets it on their main line, in the form they already understand
    const legacy = JSON.stringify({ t: 'u', id: a.id, mic: true, sp: true, v });
    for (const [k, p] of this.peers) if (!sent.has(k)) { try { p.ws.send(legacy); } catch {} }
  }

  async webSocketMessage(ws, data) {
    const a = ws.deserializeAttachment(); if (a && a.voice) return this.voiceIn(ws, a, data);
    const id = this.idOf(ws); if (!id) return;
    let me = this.peers.get(id);
    if (!me || me.ws !== ws) { if (me) return; me = { ws, p: null, mic: false, sp: false, seen: 0 }; this.peers.set(id, me); }
    if (typeof data !== 'string' || data.length > MAX_STATE + MAX_CHUNKS * MAX_CHUNK + 500) return;
    let m; try { m = JSON.parse(data); } catch { return; }
    if (!m || m.t !== 'u') return;
    const now = Date.now(); me.seen = now;
    const out = { t: 'u', id, mic: !!m.mic, sp: !!m.sp };
    if (m.p && typeof m.p === 'object' && JSON.stringify(m.p).length <= MAX_STATE) { me.p = m.p; out.p = m.p; }
    me.mic = out.mic; me.sp = out.sp;
    if (Array.isArray(m.v) && m.v.length) {
      const v = [];
      for (const c of m.v.slice(0, MAX_CHUNKS)) if (c && typeof c.b64 === 'string' && c.b64.length <= MAX_CHUNK) v.push({ sr: Math.min(48000, Math.max(8000, c.sr | 0 || 16000)), b64: c.b64 });
      if (v.length) out.v = v;
    }
    if (me.p) this.send(id, out);
    if (Math.random() < 0.05) this.sweep(now);
  }

  async webSocketClose(ws, code) { this.drop(ws); try { ws.close(code === 1005 || code === 1006 ? 1000 : code, 'bye'); } catch {} }
  async webSocketError(ws) { this.drop(ws); }
  drop(ws) {
    const a = ws.deserializeAttachment(); if (a && a.voice) { if (this.voice.get(a.id) === ws) this.voice.delete(a.id); return; }
    const id = this.idOf(ws); if (!id) return;
    const me = this.peers.get(id);
    if (me && me.ws === ws) { this.peers.delete(id); this.send(id, { t: 'bye', id }); }
  }
}
