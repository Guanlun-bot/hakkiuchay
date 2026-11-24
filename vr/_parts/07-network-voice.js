// {% raw %}
/* ---------------- room (people here now) ---------------- */
let room=null, myName=((LS.get('hk-name')||'').trim()||'訪客').slice(0,12), myColor=LS.get('hk-color');
const AV_COLORS=['#3e5873','#3d6b4f','#86683c','#a8343a','#5b4b6b','#2f5f6b','#7a5a2e','#6c7163'];
if(!myColor){ myColor=AV_COLORS[Math.floor(Math.random()*AV_COLORS.length)]; LS.set('hk-color',myColor); }
const others=new Map(); // peer -> {av, p}
let lastSent='', peopleMarkup='';
let myHit=null, punchCooldown=0, punchAnimTimer=0;
function playPunch(){
  if(audioMode==='off') return;
  try{
    actx=actx||new (window.AudioContext||window.webkitAudioContext)();
    if(actx.state==='suspended') actx.resume().catch(()=>{});
    const t=actx.currentTime, o=actx.createOscillator(), g=actx.createGain();
    o.type='triangle'; o.frequency.setValueAtTime(140,t); o.frequency.exponentialRampToValueAtTime(42,t+0.11);
    g.gain.setValueAtTime(0.18,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.12);
    o.connect(g).connect(actx.destination); o.start(t); o.stop(t+0.13);
  }catch{}
}
const punchRay=new THREE.Raycaster();
function tryPunchCharacter(){
  if(VIEW.mode!=='walk'||renderer.xr.isPresenting||punchCooldown>0||!others.size) return;
  punchRay.setFromCamera(new THREE.Vector2(0,0),camera);
  punchRay.far=2.8;
  const cands=[];
  for(const [k,o] of others) if(!(o.fallenTimer>0)) cands.push({k,o,g:o.av.g});
  if(!cands.length) return;
  const groups=cands.map(c=>c.g);
  const hits=punchRay.intersectObjects(groups,true);
  let hit=null;
  if(hits.length){
    let obj=hits[0].object; while(obj&&!groups.includes(obj)) obj=obj.parent;
    if(obj) hit=cands.find(c=>c.g===obj)||null;
  }
  if(!hit){
    const fx=-Math.sin(ME.yaw), fz=-Math.cos(ME.yaw);
    let best=0.55;
    for(const c of cands){
      const dx=c.g.position.x-ME.x, dz=c.g.position.z-ME.z, d=Math.hypot(dx,dz);
      if(d>2.5||d<0.05) continue;
      const dot=(dx*fx+dz*fz)/d;
      if(dot>best){ best=dot; hit=c; }
    }
  }
  if(!hit) return;
  punchCooldown=0.22; punchAnimTimer=0.22; playPunch();
  const o=hit.o, dx=o.av.g.position.x-ME.x, dz=o.av.g.position.z-ME.z, len=Math.hypot(dx,dz)||1;
  const kx=(dx/len)*4.2, kz=(dz/len)*4.2;
  o.knockVx=kx; o.knockVz=kz; o.knockTime=0.22;
  o.hitStreak=(o.hitStreak||0)+1; o.hitResetTimer=4.0;
  if(o.hitStreak>=6){ o.hitStreak=0; o.fallenTimer=4.5; }
  myHit={to:hit.k,kx:+kx.toFixed(2),kz:+kz.toFixed(2),at:Date.now()};
  pushPresence(true);
}
function presenceObj(){ return {n:myName.slice(0,12),c:myColor,x:+ME.x.toFixed(2),z:+ME.z.toFixed(2),r:+ME.yaw.toFixed(2),vx:+(ME.vx||0).toFixed(2),vz:+(ME.vz||0).toFixed(2),s:ME.seat,m:focusMode,e:focusEnd,rd:ME.reading>=0?ME.reading:-1,dk:myDrink,bn:myDrink>=0?myBean:-1,dr:myDoors,rec:myRec,gf:myGF,ir:myIR,md:myMD,sp:mySip,av:myLook,sm:mySmoke,sk:mySmokeType,em:myEmote,sn:mySnack,cm:myChat,ac:myAct,cr:ME.crouch?1:0,lt:myLight,ht:myHit,bt:(window.__cineBt??-1),fx:myFx,pid:(typeof MY_PID==='string'?MY_PID:'')}; }
function pushPresence(force){ if(!room) return; const o=presenceObj(); const k=JSON.stringify(o); if(!force&&k===lastSent) return; lastSent=k; room.presence(o).catch(()=>{}); }
function str(v,n){ return typeof v==='string'?v.replace(/[\u0000-\u001f]/g,'').slice(0,n):''; }
function num(v,d=0){ return typeof v==='number'&&isFinite(v)?v:d; }
function statusOf(p){ const s=num(p.s,-1); const m=str(p.m,8), e=num(p.e);
  const dk=num(p.dk,-1), bn=num(p.bn,-1), sn=num(p.sn,-1), drink=(DRINKS[dk]?'・'+DRINKS[dk][0]+(BEANS[bn]?'（'+BEANS[bn][0]+'）':''):'')+(SNACKS[sn]?'・'+SNACKS[sn][0]:'');
  if(MODE_LABEL[m]&&e>Date.now()) return MODE_LABEL[m]+' '+mmss(e-Date.now())+drink;
  if(num(p.rd,-1)>=0&&POSTS[p.rd]) return '在讀文章'+drink; if(s>=0&&SEATS[s]) return SEAT_KIND[SEATS[s].kind].status(s)+drink;
  return (q=>{ const zn=zoneOf(q); if(zn!=='F') return ({C:'在第三進院子',S:'在學鳩齋',N:'在知了間',W:'在正廳',E:'在南廳'})[zn]; const az=Math.abs(q.z-courtAxis); return q.x>46.84?'在門前':q.x>25.1&&q.x<33.7&&az<5.3?'在過廳':q.x>31.56?'在第一進':q.x>27.2&&az>5.2?'在前過水':'在第二進'; })({x:num(p.x),z:num(p.z)})+drink; }
function occupant(si){ if(ME.seat===si) return myName+'（你）'; for(const [,o] of others) if(num(o.p.s,-1)===si) return str(o.p.n,12)||'訪客'; return null; }
function occupied(si){ if(window.__seatNpc&&window.__seatNpc(si)) return true; for(const [,o] of others) if(num(o.p.s,-1)===si) return true; return false; }
function renderPeople(){ const list=[{n:myName+'（你）',c:myColor,st:statusOf(presenceObj())}]; for(const [,o] of others) list.push({n:str(o.p.n,12)||'訪客',c:/^#[0-9a-f]{6}$/i.test(o.p.c)?o.p.c:'#888',st:statusOf(o.p)});
  $('#pc').textContent=list.length+' 人'+(room?(room.mode&&room.mode()?'・'+room.mode():''):'・'+(NET.st||'離線')); const markup=list.map(p=>`<div class="p"><span class="dot" style="background:${p.c}"></span><span>${esc(p.n)}</span><span class="st">${esc(p.st)}</span></div>`).join('');
  if(markup!==peopleMarkup){ $('#pl').innerHTML=markup; peopleMarkup=markup; }
  for(const [,o] of others){ const st=statusOf(o.p), nm=str(o.p.n,12)||'訪客', key=nm+'|'+st+'|'+o.p.c; if(o.av.key!==key){ o.av.key=key; o.av.tag.material.map?.dispose(); o.av.tag.material.map=nameTex(nm,st,/^#[0-9a-f]{6}$/i.test(o.p.c)?o.p.c:'#888'); o.av.tag.material.needsUpdate=true; o.av.body.material.color.set(/^#[0-9a-f]{6}$/i.test(o.p.c)?o.p.c:'#888'); } } }
// On hakkiuchay.space there is no Claude room: share presence through a Supabase Realtime channel instead.
function loadScript(src){ return new Promise((res,rej)=>{ const s=document.createElement('script'); s.src=src; s.onload=()=>{clearTimeout(timeout);res();}; s.onerror=()=>{clearTimeout(timeout);s.remove();rej(new Error('載入失敗'));}; const timeout=setTimeout(()=>{s.remove();rej(new Error('載入逾時'));},10000); document.head.appendChild(s); }); }
async function supabaseRoom(){ const C=window.VR_CONFIG; if(!C||!C.url||!C.key){ NET.st='設定缺漏'; return null; }
  if(!window.supabase){ const pre=document.querySelector('script[src*="supabase-js"]'); if(pre) await new Promise(r=>{ const t=setTimeout(r,8000); pre.addEventListener('load',()=>{clearTimeout(t);r();}); pre.addEventListener('error',()=>{clearTimeout(t);r();}); }); }
  if(!window.supabase) await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js');
  const sb=window.supabase.createClient(C.url,C.key,{auth:{persistSession:false,autoRefreshToken:false}});
  const me=(crypto.randomUUID?crypto.randomUUID():String(Math.random()).slice(2)), ch=sb.channel((C.channel||'hakkiuchay-vr')+(playRoom&&playRoom!=='HAKKIUCHAY-01'?':'+playRoom:''),{config:{presence:{key:me},broadcast:{self:false,ack:false}}});
  // Two paths carry the same state: broadcast (fast, for walking) and presence (slower, but it also reaches anyone who joins later).
  // Whichever copy is newer wins, so the room works even if one path is blocked.
  const peers=new Map();   // key -> {p, t, heard, skews[], fast}
  let peersFn=null, lostFn=null, cur=null, sentAt=0, sentKey='', timer=null, emitT=null, ready=false, tracked='', trackAt=0, trackT=null, dead=false, heartbeat=null, sweep=null, wd=null;
  const shift=(p,d)=>{ if(!p) return {}; const o={...p}; const at=v=>typeof v==='number'&&v>0?v+d:v;
    if(o.rec) o.rec={...o.rec,at:at(o.rec.at)}; if(o.gf) o.gf={...o.gf,at:at(o.gf.at)}; if(o.ir) o.ir={...o.ir,at:at(o.ir.at)}; o.e=at(o.e);
    if(o.dr&&typeof o.dr==='object'){ const dr={}; for(const key in o.dr){ const r=o.dr[key]; dr[key]=Array.isArray(r)?[r[0],at(r[1])]:r; } o.dr=dr; } return o; };
  const calls=new Map();
  const voiceButton=$('#voice-toggle'), muteButton=$('#voice-mute'), voiceStatus=$('#voice-status');
  let mic=null, voicePending=false;
  function voiceUI(){
    voiceButton.disabled=!ready||voicePending;
    voiceButton.textContent=mic?'離開語音':'加入語音';
    muteButton.hidden=!mic;
    muteButton.textContent=mic?.getAudioTracks()[0]?.enabled?'靜音':'解除靜音';
    const connected=[...calls.values()].filter(({pc})=>pc.connectionState==='connected').length;
    voiceStatus.textContent=mic?(connected?'語音已連線 · '+connected+' 人':calls.size?'語音連線中':'等待其他人加入語音'):'';
  }
  function closeCall(id){
    const c=calls.get(id); if(!c) return;
    calls.delete(id); c.pc.close(); c.audio.remove(); voiceUI();
  }
  function stopVoice(){
    mic?.getTracks().forEach(track=>track.stop()); mic=null;
    for(const id of calls.keys()) closeCall(id);
    voiceUI();
  }
  function signal(id,data){
    return ch.send({type:'broadcast',event:'voice',payload:{from:me,to:id,...data}});
  }
  function call(id){
    const pc=new RTCPeerConnection({iceServers:C.iceServers||[{urls:'stun:stun.l.google.com:19302'}]});
    const audio=document.createElement('audio'); audio.autoplay=true; document.body.append(audio);
    const c={pc,audio,ice:[],busy:false}; calls.set(id,c);
    for(const track of mic.getAudioTracks()) pc.addTrack(track,mic);
    pc.onicecandidate=({candidate})=>{ if(candidate) signal(id,{ice:candidate.toJSON()}).catch(()=>{}); };
    pc.ontrack=({streams})=>{ audio.srcObject=streams[0]; audio.play().catch(()=>{voiceStatus.textContent='請點一下頁面以播放語音'; document.addEventListener('click',()=>audio.play().catch(()=>{}),{once:true});}); };
    pc.onconnectionstatechange=()=>{
      if(pc.connectionState==='failed'){closeCall(id); voiceStatus.textContent='語音連線失敗，可能需要中繼伺服器';}
      else voiceUI();
    };
    voiceUI(); return c;
  }
  function reconcileVoice(){
    for(const id of calls.keys()) if(!mic||!peers.get(id)?.p?.vc) closeCall(id);
    if(!ready||!mic) return;
    for(const [id,v] of peers){
      if(!v.p?.vc||me>=id||calls.has(id)) continue;
      try {
        const c=call(id);
        c.pc.createOffer().then(offer=>c.pc.setLocalDescription(offer))
          .then(()=>signal(id,{sdp:c.pc.localDescription.toJSON()})).catch(()=>closeCall(id));
      } catch { voiceStatus.textContent='此瀏覽器無法建立語音連線'; }
    }
  }
  ch.on('broadcast',{event:'voice'},async ({payload:m})=>{
    if(!mic||!ready||m?.to!==me||typeof m.from!=='string'||m.from===me) return;
    const id=m.from;
    try {
      let c=calls.get(id);
      if(!c){
        if(id>=me||(!m.ice&&m.sdp?.type!=='offer')) return;
        c=call(id);
      }
      const pc=c.pc;
      if(m.ice){
        if(!pc.remoteDescription||c.busy){if(c.ice.length<64)c.ice.push(m.ice);}
        else await pc.addIceCandidate(m.ice);
        return;
      }
      if(c.busy||!(m.sdp?.type==='offer'&&id<me||m.sdp?.type==='answer'&&me<id)) return;
      c.busy=true;
      try {
        await pc.setRemoteDescription(m.sdp);
        if(m.sdp.type==='offer'){
          await pc.setLocalDescription(await pc.createAnswer());
          await signal(id,{sdp:pc.localDescription.toJSON()});
        }
        while(c.ice.length) await pc.addIceCandidate(c.ice.shift()).catch(()=>{});
      } finally { c.busy=false; }
    } catch { closeCall(id); }
  });
  function bindVoice(){
    voiceButton.onclick=async()=>{
      if(mic){stopVoice(); pushPresence(true); return;}
      if(!ready||voicePending) return;
      voicePending=true; voiceUI();
      try {
        const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true},video:false});
        if(!ready){stream.getTracks().forEach(track=>track.stop()); return;}
        mic=stream;
        for(const track of mic.getAudioTracks()) track.onended=()=>{stopVoice();pushPresence(true);};
        pushPresence(true); reconcileVoice();
      } catch { voiceStatus.textContent='無法開啟麥克風，請檢查瀏覽器權限'; }
      finally { voicePending=false; voiceButton.disabled=!ready; if(mic) voiceUI(); }
    };
    muteButton.onclick=()=>{
      const track=mic?.getAudioTracks()[0]; if(!track) return;
      track.enabled=!track.enabled; voiceUI();
    };
    voiceUI();
  }
  let here=new Set();
  const emit=()=>{ emitT=null; if(!peersFn) return; const now=Date.now(), list=[];
    for(const [k,v] of peers){ if(!here.has(k)&&now-v.heard>8000){ peers.delete(k); continue; } list.push({peer:k,kind:'viewer',sameTab:false,presence:shift(v.p,Math.min(...v.skews))}); }
    reconcileVoice(); peersFn({peers:list}); };
  let lastEmit=0; const soon=()=>{ const d=Date.now()-lastEmit; if(d>100){ lastEmit=Date.now(); emit(); } else if(!emitT) emitT=setTimeout(()=>{ lastEmit=Date.now(); emit(); },100-d); };
  const take=(k,t,p,fast)=>{ if(!k||k===me||!p||typeof p!=='object') return; const v=peers.get(k)||{skews:[],t:0};
    // receive time minus send time = clock offset plus delay; the smallest recent value is the best guess at the offset
    if(fast||num(t)>v.t){ v.skews.push(Date.now()-num(t)); if(v.skews.length>12) v.skews.shift(); } if(fast) v.fast=Date.now();
    if(num(t)>=v.t){ v.t=num(t); v.p=p; } v.heard=Date.now(); peers.set(k,v); };
  ch.on('presence',{event:'sync'},()=>{ const st=ch.presenceState(); here=new Set(Object.keys(st));
    for(const k of here){ const m=st[k][st[k].length-1]; if(m&&m.p){ take(k,m.t,m.p,false); const v=peers.get(k); if(v) v.slow=Date.now(); } }
    for(const k of [...peers.keys()]) if(!here.has(k)&&Date.now()-peers.get(k).heard>8000) peers.delete(k); soon(); });
  ch.on('broadcast',{event:'b'},msg=>{ const m=msg&&(msg.payload||msg); if(!m||m.from===MY_PID||(m.to&&m.to!==MY_PID)||!m.d) return; try{ window.__clsRecv?.(m.d,m.from); window.__cineRecv?.(m.d,m.from); window.__blindRecv?.(m.d,m.from); window.__houseRecv?.(m.d,m.from); window.__phoneRecv?.(m.d,m.from); }catch(err){ console.warn(err); } });
  NET.bcast=(d,to)=>{ try{ ch.send({type:'broadcast',event:'b',payload:{from:MY_PID,to:to||'',d}}); return true; }catch{ return false; } };
  ch.on('broadcast',{event:'s'},msg=>{ const m=msg&&(msg.payload||msg); if(!m) return; take(m.k,m.t,m.p,true); soon(); if(m.hi) setTimeout(()=>send(true),Math.random()*400); });
  const moving=(a,b)=>{ if(!a||!b) return false; const x={...a}, y={...b}; for(const f of ['x','z','r']){ delete x[f]; delete y[f]; } return JSON.stringify(x)===JSON.stringify(y); };
  function track(){ trackT=null; if(!ready||!cur) return; const state={...cur,vc:!!mic}; const k=JSON.stringify(state); if(k===tracked) return; trackAt=Date.now(); ch.track({t:trackAt,p:state}).then(result=>{ if(result==='ok') tracked=k; else NET.errs++; }).catch(()=>{NET.errs++;}); }
  function send(force,hi){ timer=null; if(!ready||!cur) return; const state={...cur,vc:!!mic}; const k=JSON.stringify(state); if(!force&&k===sentKey) return; sentKey=k; sentAt=Date.now();
    try{ const r=ch.send({type:'broadcast',event:'s',payload:{k:me,t:Date.now(),p:state,hi:hi?1:0}}); if(r&&r.then) r.then(result=>{ if(result!=='ok') NET.errs++; }).catch(()=>{NET.errs++;}); }catch{NET.errs++;}
    if(!trackT) trackT=setTimeout(track,Math.max(0,1500-(Date.now()-trackAt))); }
  NET.st='連線中';
  try { await new Promise((res,rej)=>{ const to=setTimeout(()=>{ NET.st='連線逾時'; rej(new Error('timeout')); },15000);
    ch.subscribe(st=>{ if(dead) return; NET.st=st; if(st==='SUBSCRIBED'){ clearTimeout(to); ready=true; voiceUI(); tracked=''; track(); send(true,true); renderPeople(); res(); setTimeout(()=>{ window.__clsHello?.(); window.__cineHello?.(); window.__blindHello?.(); window.__houseHello?.(); },600); }
      else { ready=false; stopVoice(); NET.errs++; renderPeople(); if(heartbeat) lose(); } }); }); } catch(error){ dead=true; try{ await sb.removeChannel(ch); }catch{} sb.realtime.disconnect(); throw error; }
  // A channel that drops (phone asleep, wifi switch, server restart) is not always rejoined by the library, and someone stuck on
  // a dead channel sees nobody and is seen by nobody. So on any drop, or if nothing has been heard from the server for a while,
  // close this one completely and hand back to connectRoom, which opens a fresh channel.
  function close(){ if(dead) return; dead=true; ready=false; clearInterval(heartbeat); clearInterval(sweep); clearInterval(wd); clearTimeout(timer); clearTimeout(trackT); stopVoice(); try{ sb.removeChannel(ch); }catch{} try{ sb.realtime.disconnect(); }catch{} }
  function lose(){ if(dead) return; close(); NET.st='重新連線中'; peers.clear(); emit(); const f=lostFn; lostFn=null; f&&f(); }
  NET.peers=peers; bindVoice();
  heartbeat=setInterval(()=>send(true),2500);
  sweep=setInterval(soon,3000);
  wd=setInterval(()=>{ if(!dead&&(!ready||!sb.realtime.isConnected())) lose(); },8000);
  addEventListener('visibilitychange',()=>{ if(document.visibilityState==='visible'&&!dead){ if(!sb.realtime.isConnected()) lose(); else send(true,true); } });
  addEventListener('pagehide',event=>{ stopVoice(); if(event.persisted){pushPresence(true);return;} close(); });
  return { disconnect(){ lostFn=null; close(); peers.clear(); },
    presence(o){ const prev=cur; cur=o; if(timer) return Promise.resolve();
      const gap=moving(prev,o)?140:0, wait=Math.max(0,gap-(Date.now()-sentAt)); timer=setTimeout(()=>send(false),wait); return Promise.resolve(); },
    onPeers(fn,lost){ peersFn=fn; lostFn=lost||null; emit(); },
    mode(){ let fast=0, n=0; for(const v of peers.values()){ n++; if(v.fast&&Date.now()-v.fast<6000) fast++; } return n?(fast?'即時':'慢速'):''; } }; }
let audioMode=LS.get('hk-audio-mode')||'on';
const audioSel=$('#audio-mode');
if(audioSel){ audioSel.value=audioMode; audioSel.addEventListener('change',e=>{ audioMode=e.target.value; LS.set('hk-audio-mode',audioMode); }); }
function playStep(){
  if(audioMode!=='on') return;
  try{
    actx=actx||new (window.AudioContext||window.webkitAudioContext)();
    if(actx.state==='suspended') actx.resume().catch(()=>{});
    const t=actx.currentTime, o=actx.createOscillator(), g=actx.createGain();
    o.type='triangle'; o.frequency.setValueAtTime(95+Math.random()*20,t);
    o.frequency.exponentialRampToValueAtTime(45,t+0.05);
    g.gain.setValueAtTime(0.045,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.06);
    o.connect(g).connect(actx.destination); o.start(t); o.stop(t+0.065);
  }catch{}
}

// Local Python server multiplayer + PCM voice streaming (matches 範例code/server.py /api/mp/sync)
const MIC_SVG='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a1 1 0 1 0-2 0 3 3 0 0 1-6 0 1 1 0 1 0-2 0 5 5 0 0 0 4 4.9V19H9a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-2v-3.1A5 5 0 0 0 17 11z"/></svg>';
let voiceOutputGain=Math.max(0,Math.min(3,Number(LS.get('hk-voice-vol')??1.8)));
{ const vs=$('#voice-volume'), vl=$('#voice-vol-val');
  if(vs){ vs.value=String(voiceOutputGain); if(vl) vl.textContent=Math.round(voiceOutputGain*100)+'%';
    vs.addEventListener('input',e=>{ voiceOutputGain=Math.max(0,Math.min(3,Number(e.target.value)||0)); LS.set('hk-voice-vol',String(voiceOutputGain));
      if(vl) vl.textContent=Math.round(voiceOutputGain*100)+'%';
      if(localVoiceState.masterGain&&localVoiceState.playCtx) localVoiceState.masterGain.gain.setTargetAtTime(voiceOutputGain,localVoiceState.playCtx.currentTime,0.02); }); } }

const localVoiceState={playCtx:null,masterGain:null,comp:null,playerNode:null,ringBuffers:new Map()};
function ensureVoicePlayCtx(){
  const AudioCtx=window.AudioContext||window.webkitAudioContext;
  if(!AudioCtx) return null;
  const st=localVoiceState;
  if(!st.playCtx||st.playCtx.state==='closed'){
    st.playCtx=new AudioCtx();
    st.masterGain=st.playCtx.createGain(); st.masterGain.gain.value=voiceOutputGain;
    st.comp=st.playCtx.createDynamicsCompressor();
    st.comp.threshold.value=-18; st.comp.knee.value=12; st.comp.ratio.value=4; st.comp.attack.value=0.003; st.comp.release.value=0.15;
    st.playLp=st.playCtx.createBiquadFilter(); st.playLp.type='lowpass'; st.playLp.frequency.value=5800; st.playLp.Q.value=0.7;
    st.playLp.connect(st.masterGain); st.masterGain.connect(st.comp); st.comp.connect(st.playCtx.destination);
    st.playerNode=st.playCtx.createScriptProcessor(2048,1,1);
    const playSr=st.playCtx.sampleRate||48000, startThreshold=Math.floor(playSr*0.16);
    st.playerNode.onaudioprocess=ev=>{
      const out=ev.outputBuffer.getChannelData(0); out.fill(0);
      for(const [,rb] of st.ringBuffers.entries()){
        if(!rb.playing){ if(rb.queued<startThreshold) continue; rb.playing=true; }
        for(let i=0;i<out.length;i++){
          if(rb.queued>0){ const s=rb.buf[rb.readPos]; rb.readPos=(rb.readPos+1)%rb.size; rb.queued--; rb.lastSample=s; out[i]+=s; }
          else { rb.lastSample*=0.96; out[i]+=rb.lastSample; if(Math.abs(rb.lastSample)<0.0004){ rb.lastSample=0; rb.playing=false; break; } }
        }
      }
      for(let i=0;i<out.length;i++){ if(out[i]>1) out[i]=1; else if(out[i]<-1) out[i]=-1; }
    };
    st.playerNode.connect(st.playLp);
  }
  if(st.playCtx.state==='suspended') st.playCtx.resume().catch(()=>{});
  return st.playCtx;
}
function encodeInt16ToBase64(int16Arr){
  const bytes=new Uint8Array(int16Arr.buffer,int16Arr.byteOffset,int16Arr.byteLength);
  let bin=''; for(let i=0;i<bytes.length;i+=0x4000) bin+=String.fromCharCode.apply(null,bytes.subarray(i,i+0x4000));
  return btoa(bin);
}
function decodeBase64ToFloat32(b64){
  const bin=atob(b64), len=bin.length, bytes=new Uint8Array(len);
  for(let i=0;i<len;i++) bytes[i]=bin.charCodeAt(i);
  const int16=new Int16Array(bytes.buffer,0,Math.floor(len/2)), out=new Float32Array(int16.length);
  for(let i=0;i<int16.length;i++) out[i]=int16[i]/32768;
  return out;
}
function playRemoteVoiceChunks(chunks){
  if(!Array.isArray(chunks)||!chunks.length) return;
  const ctx=ensureVoicePlayCtx(); if(!ctx) return;
  const playSr=ctx.sampleRate||48000, maxLag=Math.floor(playSr*0.65), targetLag=Math.floor(playSr*0.20);
  for(const ch of chunks){
    if(!ch||!ch.b64||!ch.from) continue;
    try{
      const samples=decodeBase64ToFloat32(ch.b64); if(samples.length<2) continue;
      const srcSr=Math.max(8000,Math.min(48000,Number(ch.sr)||24000));
      let rb=localVoiceState.ringBuffers.get(ch.from);
      if(!rb){ const size=playSr*2; rb={buf:new Float32Array(size),size,readPos:0,writePos:0,queued:0,playing:false,lastSample:0}; localVoiceState.ringBuffers.set(ch.from,rb); }
      const outLen=Math.max(1,Math.round((samples.length*playSr)/srcSr)), step=(samples.length-1)/Math.max(1,outLen-1);
      for(let i=0;i<outLen;i++){
        const pos=i*step, idx=Math.floor(pos), frac=pos-idx, s0=samples[idx], s1=samples[Math.min(samples.length-1,idx+1)];
        rb.buf[rb.writePos]=s0+(s1-s0)*frac; rb.writePos=(rb.writePos+1)%rb.size;
        if(rb.queued<rb.size) rb.queued++; else rb.readPos=(rb.readPos+1)%rb.size;
      }
      if(rb.queued>maxLag){ const drop=rb.queued-targetLag; rb.readPos=(rb.readPos+drop)%rb.size; rb.queued-=drop; }
    }catch{}
  }
}

// The 學鳩齋 multiplayer server on Cloudflare (see _vrserver/): the same idea as server.py — one server per room keeps everyone's
// state and relays it, with the voice chunks — but over a WebSocket and reachable from anywhere. The voice capture and
// playback are the same as localRoom's. One id for the whole page, so a reconnect is the same person, never a second copy.
const MY_PID=(crypto.randomUUID?crypto.randomUUID():('p-'+Math.random().toString(36).slice(2,12)+Date.now().toString(36)));
async function cfRoom(){
  const me=MY_PID;
  const peers=new Map();
  let peersFn=null, cur=null, mpTimer=null, closed=false;
  let micEnabled=false, micMuted=false, localSpeaking=false, localMicStream=null, voiceAudioCtx=null, voiceProc=null, voiceZero=null, voiceHoldUntil=0;
  const outgoingVoiceChunks=[];
  const voiceButton=$('#voice-toggle'), muteButton=$('#voice-mute'), voiceStatus=$('#voice-status'), voiceHud=$('#voice-hud');

  function renderVoiceHud(){
    if(!voiceHud) return;
    const list=[];
    if(micEnabled) list.push({id:me,name:myName+'（你）',speaking:localSpeaking&&!micMuted});
    for(const [id,v] of peers) if(v.micActive) list.push({id,name:str(v.p?.n,12)||'訪客',speaking:!!v.speaking});
    voiceHud.innerHTML=list.map(u=>`<div class="voice-pill${u.speaking?' speaking':''}">${MIC_SVG}<span>${esc(u.name)}</span></div>`).join('');
  }
  function voiceUI(){
    voiceButton.disabled=closed;
    voiceButton.textContent=micEnabled?'離開語音 (M)':'加入語音 (M)';
    muteButton.hidden=!micEnabled;
    muteButton.textContent=micMuted?'解除靜音':'靜音';
    const vcCount=[...peers.values()].filter(v=>v.micActive).length;
    voiceStatus.textContent=micEnabled?(micMuted?'麥克風已靜音':(vcCount?`語音已連線 · ${vcCount+1} 人`:'麥克風已開啟（等待同伴加入）')):'';
    renderVoiceHud();
  }
  function disableVoiceMic(){
    micEnabled=false; micMuted=false; localSpeaking=false; outgoingVoiceChunks.length=0;
    if(voiceProc){ try{ voiceProc.disconnect(); }catch{} voiceProc.onaudioprocess=null; voiceProc=null; }
    if(voiceZero){ try{ voiceZero.disconnect(); }catch{} voiceZero=null; }
    if(voiceAudioCtx){ try{ voiceAudioCtx.close(); }catch{} voiceAudioCtx=null; }
    if(localMicStream){ localMicStream.getTracks().forEach(t=>{ try{ t.stop(); }catch{} }); localMicStream=null; }
    voiceUI();
  }
  async function enableVoiceMic(){
    if(micEnabled||closed) return;
    micEnabled=true; micMuted=false; localSpeaking=false;
    ensureVoicePlayCtx();
    voiceUI();
    if(!navigator.mediaDevices?.getUserMedia){ voiceStatus.textContent='此瀏覽器不支援麥克風'; micEnabled=false; voiceUI(); return; }
    try{
      const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true,channelCount:1},video:false});
      if(!micEnabled||closed){ stream.getTracks().forEach(t=>t.stop()); return; }
      localMicStream=stream;
      for(const tr of stream.getAudioTracks()) tr.onended=()=>disableVoiceMic();
      const AudioCtx=window.AudioContext||window.webkitAudioContext;
      if(AudioCtx){
        voiceAudioCtx=new AudioCtx();
        if(voiceAudioCtx.state==='suspended') await voiceAudioCtx.resume().catch(()=>{});
        const src=voiceAudioCtx.createMediaStreamSource(stream);
        const hp=voiceAudioCtx.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=110; hp.Q.value=0.7;
        const lp=voiceAudioCtx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=5500; lp.Q.value=0.7;
        const micComp=voiceAudioCtx.createDynamicsCompressor();
        micComp.threshold.value=-24; micComp.knee.value=16; micComp.ratio.value=4; micComp.attack.value=0.005; micComp.release.value=0.15;
        const proc=voiceAudioCtx.createScriptProcessor(2048,1,1), zero=voiceAudioCtx.createGain();
        zero.gain.value=0; voiceProc=proc; voiceZero=zero;
        const targetSr=16000, inSr=voiceAudioCtx.sampleRate||48000, ratio=Math.max(1,inSr/targetSr);
        let noiseFloor=0.006, gateGain=0;
        proc.onaudioprocess=ev=>{
          if(!micEnabled||micMuted) return;
          const input=ev.inputBuffer.getChannelData(0);
          let sumSq=0; for(let i=0;i<input.length;i++) sumSq+=input[i]*input[i];
          const rms=Math.sqrt(sumSq/input.length), now=performance.now();
          const gateThresh=Math.max(0.012,noiseFloor*2.3);
          if(rms>gateThresh) voiceHoldUntil=now+380;
          else if(now>=voiceHoldUntil) noiseFloor=Math.max(0.003,Math.min(0.025,noiseFloor*0.95+rms*0.05));
          const nextSp=now<voiceHoldUntil, wasSp=localSpeaking;
          if(nextSp!==localSpeaking){ localSpeaking=nextSp; renderVoiceHud(); }
          if(!nextSp&&!wasSp){ gateGain=0; return; }
          const targetGain=nextSp?1.15:0;
          const outLen=Math.max(1,Math.floor(input.length/ratio)), pcm=new Int16Array(outLen);
          for(let i=0;i<outLen;i++){
            gateGain+=(targetGain-gateGain)*(nextSp?0.08:0.04);
            const center=i*ratio, idx=Math.floor(center), frac=center-idx;
            const sA=input[Math.max(0,idx-1)]*0.2+input[idx]*0.6+input[Math.min(input.length-1,idx+1)]*0.2;
            const idx2=Math.min(input.length-1,idx+1);
            const sB=input[Math.max(0,idx2-1)]*0.2+input[idx2]*0.6+input[Math.min(input.length-1,idx2+1)]*0.2;
            const sample=Math.max(-1,Math.min(1,(sA+(sB-sA)*frac)*gateGain));
            pcm[i]=sample<0?sample*32768:sample*32767;
          }
          outgoingVoiceChunks.push({sr:targetSr,b64:encodeInt16ToBase64(pcm)});
          if(outgoingVoiceChunks.length>12) outgoingVoiceChunks.splice(0,outgoingVoiceChunks.length-12);
        };
        src.connect(hp); hp.connect(lp); lp.connect(micComp); micComp.connect(proc); proc.connect(zero); zero.connect(voiceAudioCtx.destination);
      }
      voiceUI();
    }catch{ micEnabled=false; voiceStatus.textContent='無法開啟麥克風，請檢查瀏覽器權限'; voiceUI(); }
  }
  function toggleVoiceMic(){ if(micEnabled) disableVoiceMic(); else enableVoiceMic(); }
  voiceButton.onclick=toggleVoiceMic;
  muteButton.onclick=()=>{ if(!micEnabled) return; micMuted=!micMuted; if(micMuted) localSpeaking=false;
    localMicStream?.getAudioTracks().forEach(t=>t.enabled=!micMuted); voiceUI(); };
  window.__toggleVoiceMic=toggleVoiceMic;

  function emit(){ if(!peersFn) return; const list=[];
    for(const [k,v] of peers) list.push({peer:k,kind:'viewer',sameTab:false,presence:v.p});
    peersFn({peers:list}); renderVoiceHud(); }

  function emitSoon(){ if(emitT) return; emitT=setTimeout(()=>{ emitT=null; emit(); },60); }
  let emitT=null, ws=null, wsOpen=false, retry=0, retryT=null, lastKey='', lastSendAt=0, offlineT=null;
  const base=String(window.VR_CONFIG.ws).replace(/\/+$/,'');
  let lastRx=Date.now();
  function onMsg(e){ lastRx=Date.now(); let m; try{ m=JSON.parse(e.data); }catch{ return; } if(!m||m.t==='pong') return;
    if(m.t==='all'){ peers.clear(); for(const q of (m.peers||[])) if(q&&q.id&&q.id!==me) peers.set(q.id,{p:q.p||{},micActive:!!q.mic,speaking:!!q.sp,fast:Date.now()}); emitSoon(); }
    else if(m.t==='u'&&m.id&&m.id!==me){ const v=peers.get(m.id)||{p:{}}; if(m.p&&typeof m.p==='object') v.p=m.p; v.micActive=!!m.mic; v.speaking=!!m.sp; v.fast=Date.now(); peers.set(m.id,v);
      if(Array.isArray(m.v)&&m.v.length) playRemoteVoiceChunks(m.v.map(c=>({sr:c.sr,b64:c.b64,from:m.id}))); emitSoon(); }
    else if(m.t==='bye'&&m.id){ peers.delete(m.id); localVoiceState.ringBuffers.delete(m.id); emitSoon(); }
    else if(m.t==='b'&&m.id&&m.id!==me&&m.d){ try{ window.__clsRecv?.(m.d,m.id); window.__cineRecv?.(m.d,m.id); window.__blindRecv?.(m.d,m.id); window.__houseRecv?.(m.d,m.id); window.__phoneRecv?.(m.d,m.id); }catch(err){ console.warn(err); } } }
  // ten times a second: what changed, plus any voice; when nothing changes, a heartbeat every 2.5 s
  function tick(){ if(!wsOpen||!cur||closed) return; const now=Date.now(), voice=outgoingVoiceChunks.splice(0,8);
    const st={...cur,vc:micEnabled}, k=JSON.stringify(st), changed=k!==lastKey;
    if(!changed&&!voice.length&&now-lastSendAt<2500) return;
    const msg={t:'u',mic:micEnabled,sp:localSpeaking&&!micMuted}; if(changed||now-lastSendAt>=2500) msg.p=st; if(voice.length) msg.v=voice;
    try{ ws.send(JSON.stringify(msg)); lastKey=k; lastSendAt=now; }catch{ NET.errs++; } }
  function connect(first){ clearTimeout(retryT); if(closed) return Promise.resolve(false);
    return new Promise(res=>{ let done=false; const fin=v=>{ if(!done){ done=true; res(v); } };
      try{ ws=new WebSocket(base+'/room/'+encodeURIComponent(playRoom)+'?id='+encodeURIComponent(me)); }catch{ fin(false); if(!first) later(); return; }
      // a busy page (the house just built, a slow phone) can hold the 'open' event back past the timer: an opened or still
      // connecting socket gets more time instead of being given up
      let waits=0; const sock=ws, check=()=>{ if(wsOpen||sock!==ws) return; if(sock.readyState===1||(sock.readyState===0&&waits++<2)){ to=setTimeout(check,3500); return; } try{ sock.close(); }catch{} fin(false); }; let to=setTimeout(check,first?6000:5000);
      sock.onopen=()=>{ if(sock!==ws) return; clearTimeout(to); wsOpen=true; lastRx=Date.now(); retry=0; clearTimeout(offlineT); NET.st=`房間 ${playRoom}`; lastKey=''; voiceUI(); tick(); fin(true); setTimeout(()=>{ window.__clsHello?.(); window.__cineHello?.(); window.__blindHello?.(); window.__houseHello?.(); },400); };
      sock.onmessage=e=>{ if(sock===ws) onMsg(e); };
      sock.onclose=ev=>{ if(sock!==ws) return; clearTimeout(to); const was=wsOpen; wsOpen=false; fin(false); if(closed||(first&&!was)) return;
        NET.st='重新連線中'; NET.errs++; renderPeople(); later(); };
      sock.onerror=()=>{}; }); }
  function later(){ clearTimeout(retryT); retryT=setTimeout(()=>connect(false),Math.min(8000,700*2**retry++));
    // still offline after a while: stop showing the others where they were
    if(!offlineT) offlineT=setTimeout(()=>{ offlineT=null; if(!wsOpen){ peers.clear(); localVoiceState.ringBuffers.clear(); emit(); } },15000); }
  if(!(await connect(true))){ closed=true; throw new Error('vr server unavailable'); }
  NET.peers=peers; voiceUI();
  // shared things in a room (the schoolroom's blackboard and projection): relayed to the others as they are
  NET.bcast=(d,to)=>{ if(!wsOpen||!ws||closed) return false; const s=JSON.stringify(to?{t:'b',d,to}:{t:'b',d}); if(s.length>900000) return false; try{ ws.send(s); return true; }catch{ return false; } };
  mpTimer=setInterval(tick,100);
  // every 4 s a ping (the server answers at once); nothing heard for 10 s means the line is dead even if the browser
  // hasn't noticed yet: drop it and open a new one
  const keep=setInterval(()=>{ if(closed||!wsOpen) return; try{ ws.send('{"t":"ping"}'); }catch{} if(Date.now()-lastRx>10000) revive(); },4000);
  function revive(){ const old=ws; wsOpen=false; ws=null; try{ old&&old.close(); }catch{} NET.st='重新連線中'; NET.errs++; retry=0; lastRx=Date.now(); connect(false); }
  addEventListener('visibilitychange',()=>{ if(document.visibilityState!=='visible'||closed) return; if(!wsOpen){ retry=0; connect(false); } else if(Date.now()-lastRx>6000) revive(); });
  addEventListener('online',()=>{ if(!closed&&!wsOpen){ retry=0; connect(false); } });

  function disconnect(){
    if(closed) return; closed=true;
    NET.bcast=null; if(mpTimer){ clearInterval(mpTimer); mpTimer=null; } clearInterval(keep); clearTimeout(retryT); clearTimeout(offlineT); clearTimeout(emitT);
    disableVoiceMic(); localVoiceState.ringBuffers.clear();
    if(voiceHud) voiceHud.innerHTML='';
    window.__toggleVoiceMic=null;
    try{ ws&&ws.close(1000,'bye'); }catch{}
    peers.clear();
  }
  addEventListener('pagehide',e=>{ if(!e.persisted) disconnect(); });
  return {
    presence(o){ cur=o; return Promise.resolve(); },
    onPeers(fn){ peersFn=fn; emit(); },
    mode(){ return wsOpen?(peers.size?'即時':''):'離線'; },
    disconnect
  };
}

async function localRoom(){
  const me=(crypto.randomUUID?crypto.randomUUID():('p-'+Math.random().toString(36).slice(2,10)));
  const peers=new Map();
  let peersFn=null, cur=null, mpTimer=null, mpInFlight=false, closed=false;
  let micEnabled=false, micMuted=false, localSpeaking=false, localMicStream=null, voiceAudioCtx=null, voiceProc=null, voiceZero=null, voiceHoldUntil=0;
  const outgoingVoiceChunks=[];
  const voiceButton=$('#voice-toggle'), muteButton=$('#voice-mute'), voiceStatus=$('#voice-status'), voiceHud=$('#voice-hud');

  function renderVoiceHud(){
    if(!voiceHud) return;
    const list=[];
    if(micEnabled) list.push({id:me,name:myName+'（你）',speaking:localSpeaking&&!micMuted});
    for(const [id,v] of peers) if(v.micActive) list.push({id,name:str(v.p?.n,12)||'訪客',speaking:!!v.speaking});
    voiceHud.innerHTML=list.map(u=>`<div class="voice-pill${u.speaking?' speaking':''}">${MIC_SVG}<span>${esc(u.name)}</span></div>`).join('');
  }
  function voiceUI(){
    voiceButton.disabled=closed;
    voiceButton.textContent=micEnabled?'離開語音 (M)':'加入語音 (M)';
    muteButton.hidden=!micEnabled;
    muteButton.textContent=micMuted?'解除靜音':'靜音';
    const vcCount=[...peers.values()].filter(v=>v.micActive).length;
    voiceStatus.textContent=micEnabled?(micMuted?'麥克風已靜音':(vcCount?`語音已連線 · ${vcCount+1} 人`:'麥克風已開啟（等待同伴加入）')):'';
    renderVoiceHud();
  }
  function disableVoiceMic(){
    micEnabled=false; micMuted=false; localSpeaking=false; outgoingVoiceChunks.length=0;
    if(voiceProc){ try{ voiceProc.disconnect(); }catch{} voiceProc.onaudioprocess=null; voiceProc=null; }
    if(voiceZero){ try{ voiceZero.disconnect(); }catch{} voiceZero=null; }
    if(voiceAudioCtx){ try{ voiceAudioCtx.close(); }catch{} voiceAudioCtx=null; }
    if(localMicStream){ localMicStream.getTracks().forEach(t=>{ try{ t.stop(); }catch{} }); localMicStream=null; }
    voiceUI();
  }
  async function enableVoiceMic(){
    if(micEnabled||closed) return;
    micEnabled=true; micMuted=false; localSpeaking=false;
    ensureVoicePlayCtx();
    voiceUI();
    if(!navigator.mediaDevices?.getUserMedia){ voiceStatus.textContent='此瀏覽器不支援麥克風'; micEnabled=false; voiceUI(); return; }
    try{
      const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true,channelCount:1},video:false});
      if(!micEnabled||closed){ stream.getTracks().forEach(t=>t.stop()); return; }
      localMicStream=stream;
      for(const tr of stream.getAudioTracks()) tr.onended=()=>disableVoiceMic();
      const AudioCtx=window.AudioContext||window.webkitAudioContext;
      if(AudioCtx){
        voiceAudioCtx=new AudioCtx();
        if(voiceAudioCtx.state==='suspended') await voiceAudioCtx.resume().catch(()=>{});
        const src=voiceAudioCtx.createMediaStreamSource(stream);
        const hp=voiceAudioCtx.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=110; hp.Q.value=0.7;
        const lp=voiceAudioCtx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=5500; lp.Q.value=0.7;
        const micComp=voiceAudioCtx.createDynamicsCompressor();
        micComp.threshold.value=-24; micComp.knee.value=16; micComp.ratio.value=4; micComp.attack.value=0.005; micComp.release.value=0.15;
        const proc=voiceAudioCtx.createScriptProcessor(2048,1,1), zero=voiceAudioCtx.createGain();
        zero.gain.value=0; voiceProc=proc; voiceZero=zero;
        const targetSr=16000, inSr=voiceAudioCtx.sampleRate||48000, ratio=Math.max(1,inSr/targetSr);
        let noiseFloor=0.006, gateGain=0;
        proc.onaudioprocess=ev=>{
          if(!micEnabled||micMuted) return;
          const input=ev.inputBuffer.getChannelData(0);
          let sumSq=0; for(let i=0;i<input.length;i++) sumSq+=input[i]*input[i];
          const rms=Math.sqrt(sumSq/input.length), now=performance.now();
          const gateThresh=Math.max(0.012,noiseFloor*2.3);
          if(rms>gateThresh) voiceHoldUntil=now+380;
          else if(now>=voiceHoldUntil) noiseFloor=Math.max(0.003,Math.min(0.025,noiseFloor*0.95+rms*0.05));
          const nextSp=now<voiceHoldUntil, wasSp=localSpeaking;
          if(nextSp!==localSpeaking){ localSpeaking=nextSp; renderVoiceHud(); }
          if(!nextSp&&!wasSp){ gateGain=0; return; }
          const targetGain=nextSp?1.15:0;
          const outLen=Math.max(1,Math.floor(input.length/ratio)), pcm=new Int16Array(outLen);
          for(let i=0;i<outLen;i++){
            gateGain+=(targetGain-gateGain)*(nextSp?0.08:0.04);
            const center=i*ratio, idx=Math.floor(center), frac=center-idx;
            const sA=input[Math.max(0,idx-1)]*0.2+input[idx]*0.6+input[Math.min(input.length-1,idx+1)]*0.2;
            const idx2=Math.min(input.length-1,idx+1);
            const sB=input[Math.max(0,idx2-1)]*0.2+input[idx2]*0.6+input[Math.min(input.length-1,idx2+1)]*0.2;
            const sample=Math.max(-1,Math.min(1,(sA+(sB-sA)*frac)*gateGain));
            pcm[i]=sample<0?sample*32768:sample*32767;
          }
          outgoingVoiceChunks.push({sr:targetSr,b64:encodeInt16ToBase64(pcm)});
          if(outgoingVoiceChunks.length>12) outgoingVoiceChunks.splice(0,outgoingVoiceChunks.length-12);
        };
        src.connect(hp); hp.connect(lp); lp.connect(micComp); micComp.connect(proc); proc.connect(zero); zero.connect(voiceAudioCtx.destination);
      }
      voiceUI();
    }catch{ micEnabled=false; voiceStatus.textContent='無法開啟麥克風，請檢查瀏覽器權限'; voiceUI(); }
  }
  function toggleVoiceMic(){ if(micEnabled) disableVoiceMic(); else enableVoiceMic(); }
  voiceButton.onclick=toggleVoiceMic;
  muteButton.onclick=()=>{ if(!micEnabled) return; micMuted=!micMuted; if(micMuted) localSpeaking=false;
    localMicStream?.getAudioTracks().forEach(t=>t.enabled=!micMuted); voiceUI(); };
  window.__toggleVoiceMic=toggleVoiceMic;

  function emit(){ if(!peersFn) return; const list=[];
    for(const [k,v] of peers) list.push({peer:k,kind:'viewer',sameTab:false,presence:v.p});
    peersFn({peers:list}); renderVoiceHud(); }

  async function syncTick(){
    if(closed||mpInFlight||!cur) return;
    mpInFlight=true;
    const voiceOut=outgoingVoiceChunks.splice(0,12);
    try{
      const r=await fetch('/api/mp/sync',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({roomCode:playRoom,playerId:me,state:{...cur,vc:micEnabled},vx:ME.vx||0,vz:ME.vz||0,micActive:micEnabled,speaking:localSpeaking&&!micMuted,voiceChunks:voiceOut})});
      if(!r.ok) throw new Error('HTTP '+r.status);
      const data=await r.json();
      if(data&&data.ok){
        NET.st=`房間 ${playRoom}`;
        const seen=new Set();
        for(const p of (data.players||[])){
          if(!p||!p.playerId||p.playerId===me) continue;
          seen.add(p.playerId);
          const st=p.state&&typeof p.state==='object'?{...p.state,vx:num(p.vx),vz:num(p.vz)}:{};
          peers.set(p.playerId,{p:st,micActive:!!p.micActive,speaking:!!p.speaking,fast:Date.now()});
        }
        for(const k of [...peers.keys()]) if(!seen.has(k)){ peers.delete(k); localVoiceState.ringBuffers.delete(k); }
        playRemoteVoiceChunks(data.voiceChunks||[]);
        emit();
      }
    }catch{ NET.st='本機離線'; NET.errs++; }
    finally{ mpInFlight=false; }
  }

  // Test initial connection once
  const testRes=await fetch('/api/mp/sync',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({roomCode:playRoom,playerId:me,state:presenceObj(),vx:0,vz:0,micActive:false,speaking:false,voiceChunks:[]})});
  if(!testRes.ok) throw new Error('local server unavailable');
  NET.st=`房間 ${playRoom}`; NET.peers=peers; voiceUI();
  mpTimer=setInterval(syncTick,45);

  function disconnect(){
    if(closed) return; closed=true;
    if(mpTimer){ clearInterval(mpTimer); mpTimer=null; }
    disableVoiceMic(); localVoiceState.ringBuffers.clear();
    if(voiceHud) voiceHud.innerHTML='';
    window.__toggleVoiceMic=null;
    try{
      const payload=JSON.stringify({roomCode:playRoom,playerId:me});
      if(navigator.sendBeacon) navigator.sendBeacon('/api/mp/leave',payload);
      else fetch('/api/mp/leave',{method:'POST',body:payload}).catch(()=>{});
    }catch{}
  }
  addEventListener('pagehide',disconnect);
  addEventListener('beforeunload',disconnect);
  return {
    presence(o){ cur=o; return Promise.resolve(); },
    onPeers(fn){ peersFn=fn; emit(); },
    mode(){ return peers.size?'即時':''; },
    disconnect
  };
}

let connecting=false, retryT=null;
function retryRoom(ms){ clearTimeout(retryT); retryT=setTimeout(connectRoom,ms); }
async function connectRoom(){
  if(connecting) return; clearTimeout(retryT);
  if(playMode==='solo'){
    room?.disconnect?.(); room=null;
    for(const [,o] of others) scene.remove(o.av.g);
    others.clear();
    NET.st='單人模式';
    const vb=$('#voice-toggle'), vs=$('#voice-status'), vh=$('#voice-hud');
    if(vb){ vb.disabled=true; vb.textContent='加入語音 (M)'; }
    if(vs) vs.textContent='';
    if(vh) vh.innerHTML='';
    renderPeople(); return;
  }
  connecting=true; try{ await connectRoomOnce(); } finally{ connecting=false; } }
async function connectRoomOnce(){
  await configReady;
  try{ if(window.claude&&typeof window.claude.use==='function') room=await window.claude.use('room'); }catch{ room=null; }
  if(!room&&window.VR_CONFIG?.ws){
    try{ room=await cfRoom(); window.__roomKind='學鳩齋伺服器'; }
    catch{
      try{ await new Promise(r=>setTimeout(r,800)); room=await cfRoom(); window.__roomKind='學鳩齋伺服器'; }
      catch{ room=null; NET.errs++; }
    }
  }
  if(!room&&window.VR_CONFIG?.url&&window.VR_CONFIG?.key){ try{ room=await supabaseRoom(); window.__roomKind='Supabase'; window.__toggleVoiceMic=()=>document.getElementById('voice-toggle')?.click(); }catch{ room=null; NET.errs++; if(!NET.st) NET.st='連線失敗'; } }
  if(!room){ try{ room=await localRoom(); }catch{ room=null; NET.errs++; NET.st=window.VR_CONFIG?.url?'連線失敗，稍後重試':'需透過 server.py 啟動'; } }
  if(!room) { renderPeople(); retryRoom(4000); return; }
  room.onPeers(ch=>{ const seen=new Set(); for(const p of ch.peers){ if(p.sameTab||p.kind!=='viewer') continue; seen.add(p.peer); let o=others.get(p.peer); if(!o){ o={av:makeAvatar(0x888888),p:{}}; others.set(p.peer,o); } o.p=p.presence||{}; o.lastNet=performance.now(); }
    for(const [k,o] of others) if(!seen.has(k)){ scene.remove(o.av.g); others.delete(k); } renderPeople(); }, ()=>{ room=null; renderPeople(); if(playMode!=='solo') retryRoom(1500); });
  lastSent=''; pushPresence(); renderPeople(); }

// {% endraw %}
