// 學鳩齋 新文章電子郵件通知（Cloudflare Worker）
//
// 網址（由網站與總控台呼叫）：
//   POST /subscribe     {email, hp}   訂閱：寄確認信（hp 是防機器人的隱藏欄，有值就當作機器人）
//   POST /confirm       {t}           點確認信的連結後，由 /subscribe/ 頁呼叫
//   POST /unsubscribe   {t}           點退訂連結後，由 /subscribe/ 頁呼叫
//   GET  /stats                       訂閱人數與上次寄送（不含任何信箱）
// 排程：每 10 分鐘讀 https://hakkiuchay.space/notify.json，有新文章就寄給所有已確認的訂閱者。
//   第一次執行只記下現有文章，不寄信。
// 信件文字都來自 notify.json（也就是 _data/text.yml），在後台就能改。
// 名單存在 KV（binding SUBS）：sub:<email> → {email,status,token,created,confirmed}；tok:<token> → email；
//   state → {sent:[文章 id], last:{title,at,count}}。
// 需要的 secret：RESEND_API_KEY。

const J = (obj, status = 200, origin = "*") =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": origin, "access-control-allow-headers": "content-type", "access-control-allow-methods": "GET,POST,OPTIONS", vary: "origin" },
  });
const EMAIL = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[^\s@<>()",;:]{2,}$/;
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const fill = (tpl, v) => String(tpl ?? "").replace(/\{(\w+)\}/g, (_, k) => v[k] ?? "");
const token = () => [...crypto.getRandomValues(new Uint8Array(24))].map((b) => b.toString(16).padStart(2, "0")).join("");

async function feed(env) {
  const r = await fetch(env.SITE + "/notify.json?t=" + Date.now(), { cf: { cacheTtl: 0 } });
  if (!r.ok) throw new Error("notify.json " + r.status);
  return r.json();
}

function page(texts, bodyHtml, unsubUrl) {
  return `<!doctype html><html lang="zh-Hant"><body style="margin:0;background:#f1efe8">
<div style="max-width:560px;margin:0 auto;padding:28px 22px;font-family:'Noto Serif TC','Songti TC','PMingLiU',serif;color:#3f3a39;line-height:1.8;font-size:16px">
<div style="letter-spacing:.3em;font-size:18px;border-bottom:1px solid #d3cec3;padding-bottom:10px;margin-bottom:18px">${esc(texts.site_name || "學鳩齋")}</div>
${bodyHtml}
<div style="border-top:1px solid #d3cec3;margin-top:28px;padding-top:10px;font-size:12px;color:#6e6866">${esc(texts.mail_footer || "")}${unsubUrl ? `　<a href="${esc(unsubUrl)}" style="color:#6e6866">${esc(texts.mail_unsubscribe || "退訂")}</a>` : ""}</div>
</div></body></html>`;
}

async function resend(env, messages) {
  // Resend 批次 API：一次最多 100 封
  const out = [];
  for (let i = 0; i < messages.length; i += 100) {
    const r = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: { authorization: "Bearer " + env.RESEND_API_KEY, "content-type": "application/json" },
      body: JSON.stringify(messages.slice(i, i + 100)),
    });
    if (!r.ok) throw new Error("Resend " + r.status + " " + (await r.text()).slice(0, 300));
    out.push(await r.json());
  }
  return out;
}

async function activeSubs(env) {
  const subs = [];
  let cursor;
  do {
    const l = await env.SUBS.list({ prefix: "sub:", cursor });
    for (const k of l.keys) {
      const s = await env.SUBS.get(k.name, "json");
      if (s && s.status === "active") subs.push(s);
    }
    cursor = l.list_complete ? null : l.cursor;
  } while (cursor);
  return subs;
}

async function subscribe(req, env, origin) {
  let b;
  try { b = await req.json(); } catch { return J({ ok: false, error: "bad" }, 400, origin); }
  if (b.hp) return J({ ok: true }, 200, origin); // 機器人：假裝成功
  const email = String(b.email || "").trim().toLowerCase();
  if (!EMAIL.test(email) || email.length > 200) return J({ ok: false, error: "email" }, 400, origin);
  // 簡單限流：同一個 IP 10 分鐘內最多 5 次
  const ip = req.headers.get("cf-connecting-ip") || "x";
  const rk = "rl:" + ip;
  const n = Number((await env.SUBS.get(rk)) || 0);
  if (n >= 5) return J({ ok: false, error: "rate" }, 429, origin);
  await env.SUBS.put(rk, String(n + 1), { expirationTtl: 600 });

  const key = "sub:" + email;
  const cur = await env.SUBS.get(key, "json");
  if (cur && cur.status === "active") return J({ ok: true }, 200, origin); // 已經訂閱：不透露，照樣回成功
  const t = cur?.token || token();
  await env.SUBS.put(key, JSON.stringify({ email, status: "pending", token: t, created: cur?.created || new Date().toISOString() }));
  await env.SUBS.put("tok:" + t, email);
  const { texts } = await feed(env);
  const link = env.SITE + "/subscribe/?c=" + t;
  await resend(env, [{
    from: env.FROM, to: [email],
    subject: fill(texts.mail_confirm_subject, {}) || "請確認訂閱",
    html: page(texts, `<p>${esc(texts.mail_confirm_body)}</p><p><a href="${esc(link)}" style="display:inline-block;background:#3f3a39;color:#f1efe8;text-decoration:none;padding:8px 18px;border-radius:2px">${esc(texts.mail_confirm_button || "確認訂閱")}</a></p><p style="font-size:13px;color:#6e6866">${esc(texts.mail_confirm_ignore)}</p>`),
  }]);
  return J({ ok: true }, 200, origin);
}

async function byToken(req, env, origin, status) {
  let b;
  try { b = await req.json(); } catch { return J({ ok: false }, 400, origin); }
  const t = String(b.t || "");
  const email = t && (await env.SUBS.get("tok:" + t));
  if (!email) return J({ ok: false, error: "token" }, 404, origin);
  const s = await env.SUBS.get("sub:" + email, "json");
  if (!s) return J({ ok: false, error: "token" }, 404, origin);
  s.status = status;
  if (status === "active") s.confirmed = new Date().toISOString();
  if (status === "removed") s.removed = new Date().toISOString();
  await env.SUBS.put("sub:" + email, JSON.stringify(s));
  return J({ ok: true }, 200, origin);
}

async function stats(env, origin) {
  let active = 0, pending = 0, cursor;
  do {
    const l = await env.SUBS.list({ prefix: "sub:", cursor });
    for (const k of l.keys) {
      const s = await env.SUBS.get(k.name, "json");
      if (s?.status === "active") active++;
      else if (s?.status === "pending") pending++;
    }
    cursor = l.list_complete ? null : l.cursor;
  } while (cursor);
  const st = (await env.SUBS.get("state", "json")) || {};
  return J({ active, pending, last: st.last || null, ready: !!env.RESEND_API_KEY, initialized: !!st.sent }, 200, origin);
}

async function poll(env) {
  if (!env.RESEND_API_KEY) return;
  const { texts, posts } = await feed(env);
  const st = (await env.SUBS.get("state", "json")) || {};
  if (!st.sent) { // 第一次：只記下現有文章
    st.sent = posts.map((p) => p.id);
    await env.SUBS.put("state", JSON.stringify(st));
    return;
  }
  const fresh = posts
    .filter((p) => !st.sent.includes(p.id) && Date.now() - Date.parse(p.date) < 3 * 86400e3) // 只寄三天內的新文章
    .sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
  for (const p of fresh) {
    st.sent.push(p.id); // 先記下，避免寄信失敗時重複寄
    st.sent = st.sent.slice(-300);
    await env.SUBS.put("state", JSON.stringify(st));
    const subs = await activeSubs(env);
    const msgs = subs.map((s) => {
      const unsub = env.SITE + "/subscribe/?u=" + s.token;
      return {
        from: env.FROM, to: [s.email],
        subject: fill(texts.mail_post_subject || "{title}", p),
        headers: { "List-Unsubscribe": `<${unsub}>` },
        html: page(texts,
          `<p style="font-size:13px;color:#6e6866;margin:0">${esc(p.cat)}</p>
<h1 style="font-size:22px;font-weight:600;letter-spacing:.06em;margin:4px 0 2px">${esc(p.title)}</h1>
${p.subtitle ? `<p style="color:#6e6866;margin:0 0 8px">${esc(p.subtitle)}</p>` : ""}
${p.summary ? `<p>${esc(p.summary)}</p>` : ""}
<p><a href="${esc(p.url)}" style="color:#a8343a">${esc(texts.mail_post_read || "閱讀全文")}</a></p>`, unsub),
      };
    });
    if (msgs.length) await resend(env, msgs);
    st.last = { title: p.title, url: p.url, at: new Date().toISOString(), count: msgs.length };
    await env.SUBS.put("state", JSON.stringify(st));
  }
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const o = req.headers.get("origin") || "";
    const origin = o === env.SITE || o.startsWith("http://localhost") || o.startsWith("http://127.0.0.1") ? o : env.SITE;
    if (req.method === "OPTIONS") return J({}, 204, origin);
    try {
      if (url.pathname === "/stats" && req.method === "GET") return await stats(env, "*");
      if (req.method !== "POST") return J({ ok: false }, 405, origin);
      if (url.pathname === "/subscribe") return await subscribe(req, env, origin);
      if (url.pathname === "/confirm") return await byToken(req, env, origin, "active");
      if (url.pathname === "/unsubscribe") return await byToken(req, env, origin, "removed");
      return J({ ok: false }, 404, origin);
    } catch (e) {
      return J({ ok: false, error: "server", detail: String(e.message || e).slice(0, 200) }, 500, origin);
    }
  },
  async scheduled(_ev, env, ctx) {
    ctx.waitUntil(poll(env));
  },
};
