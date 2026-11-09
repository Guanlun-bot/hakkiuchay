/**
 * 學鳩齋 新文章電子郵件通知（Google Apps Script，裝在 khoguanlun@gmail.com）
 *
 * 這份程式是獨立的 Apps Script 專案「學鳩齋訂閱通知」，讀寫試算表「學鳩齋訂閱名單」（SHEET_ID），部署成「網頁應用程式」。
 *   - 網站的訂閱欄、/subscribe/ 頁用 POST 呼叫它：subscribe / confirm / unsubscribe
 *   - 總控台用 GET ?action=stats 看人數（不含任何信箱）
 *   - 每 10 分鐘的觸發器跑 checkNewPosts()：讀 https://hakkiuchay.space/notify.json，
 *     有新文章就寄給所有「已確認」的訂閱者。第一次只記下現有文章，不寄信。
 *   - 一般 Gmail 帳號用 Apps Script 每天最多寄給 100 位收件人：寄不完的會在額度恢復後自動續寄。
 * 信件文字都來自 notify.json（也就是網站後台「網站文字」裡的 mail_* 欄位）。
 *
 * 第一次安裝：在編輯器上方選 setup 按「執行」，依畫面授權；之後部署成網頁應用程式
 * （執行身分：我；存取權：所有人），把網址填進學鳩齋 _config.yml 的 notify_url。
 */

const SITE = 'https://hakkiuchay.space';
const SHEET_ID = '';            // 名單試算表的 ID（網址 /d/ 與 /edit 之間那段）；程式綁在試算表裡時可以留空
const ss_ = () => (SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActive());
const SENDER_NAME = '許原綸（學鳩齋）';   // 預設；以網站文字 mail_sender_name 為準
const SUBS = '訂閱者';        // 欄：信箱｜狀態｜代碼｜訂閱時間｜確認時間｜退訂時間
const SENT = '已寄文章';      // 欄：文章 id｜標題｜開始寄送｜完成｜封數
const EMAIL = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[^\s@<>()",;:]{2,}$/;

/* ---------- 安裝 ---------- */
function setup() {
  sheet_(SUBS, ['信箱', '狀態', '代碼', '訂閱時間', '確認時間', '退訂時間']);
  sheet_(SENT, ['文章 id', '標題', '開始寄送', '完成', '封數']);
  ScriptApp.getProjectTriggers().forEach(t => { if (t.getHandlerFunction() === 'checkNewPosts') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('checkNewPosts').timeBased().everyMinutes(10).create();
  checkNewPosts(); // 第一次：記下現有文章
  Logger.log('完成：已建立每 10 分鐘的檢查，今天還能寄 ' + MailApp.getRemainingDailyQuota() + ' 封。');
}

function sheet_(name, header) {
  const ss = ss_();
  let sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); if (header.length) { sh.appendRow(header); sh.setFrozenRows(1); } }
  return sh;
}

/* ---------- 網頁呼叫 ---------- */
function out_(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }

function doGet(e) {
  if ((e.parameter.action || '') !== 'stats') return out_({ ok: true });
  const rows = sheet_(SUBS, []).getDataRange().getValues().slice(1);
  const sent = sheet_(SENT, []).getDataRange().getValues().slice(1).filter(r => r[3] && typeof r[4] === 'number' && r[4] > 0);
  const last = sent.length ? sent[sent.length - 1] : null;
  const pending = PropertiesService.getScriptProperties().getProperty('queue');
  return out_({
    active: rows.filter(r => r[1] === '已確認').length,
    pending: rows.filter(r => r[1] === '待確認').length,
    last: last ? { title: last[1], at: new Date(last[3]).toISOString(), count: last[4] } : null,
    sending: pending ? JSON.parse(pending).title : null,
    quota: MailApp.getRemainingDailyQuota(),
    ready: true,
  });
}

function doPost(e) {
  let b = {};
  try { b = JSON.parse(e.postData.contents || '{}'); } catch (err) { return out_({ ok: false, error: 'bad' }); }
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    if (b.action === 'subscribe') return subscribe_(b);
    if (b.action === 'confirm') return byToken_(b.t, '已確認', 5);
    if (b.action === 'unsubscribe') return byToken_(b.t, '已退訂', 6);
    return out_({ ok: false, error: 'action' });
  } finally { lock.releaseLock(); }
}

function subscribe_(b) {
  if (b.hp) return out_({ ok: true });                       // 機器人填了隱藏欄：假裝成功
  const email = String(b.email || '').trim().toLowerCase();
  if (!EMAIL.test(email) || email.length > 200) return out_({ ok: false, error: 'email' });
  const cache = CacheService.getScriptCache();
  if (cache.get('c:' + email)) return out_({ ok: true });     // 10 分鐘內不重寄確認信
  if (Number(cache.get('burst') || 0) > 30) return out_({ ok: false, error: 'rate' }); // 防灌：10 分鐘最多 30 次
  cache.put('burst', String(Number(cache.get('burst') || 0) + 1), 600);

  const sh = sheet_(SUBS, []);
  const rows = sh.getDataRange().getValues();
  let i = rows.findIndex((r, k) => k > 0 && r[0] === email);
  if (i > 0 && rows[i][1] === '已確認') return out_({ ok: true }); // 已訂閱：不透露
  const t = i > 0 && rows[i][2] ? rows[i][2] : Utilities.getUuid().replace(/-/g, '');
  if (i > 0) sh.getRange(i + 1, 2, 1, 2).setValues([['待確認', t]]);
  else sh.appendRow([email, '待確認', t, new Date(), '', '']);
  if (MailApp.getRemainingDailyQuota() < 1) return out_({ ok: false, error: 'quota' });
  const T = feed_().texts;
  const link = SITE + '/subscribe/?c=' + t;
  // 信件寫得像私人來信：幾段文字、一條普通連結，不用按鈕與色塊，比較不會被當成垃圾郵件
  GmailApp.sendEmail(email, T.mail_confirm_subject || '請確認訂閱', T.mail_confirm_body + '\n\n' + link + '\n\n' + (T.mail_confirm_ignore || ''), {
    name: T.mail_sender_name || SENDER_NAME,
    htmlBody: page_(T, paras_(T.mail_confirm_body) + '<p><a href="' + esc_(link) + '">' + esc_(T.mail_confirm_button || '確認訂閱') + '</a></p><p style="color:#6e6866">' + esc_(T.mail_confirm_ignore) + '</p>', ''),
  });
  cache.put('c:' + email, '1', 600);
  return out_({ ok: true });
}

function byToken_(t, status, col) {
  t = String(t || '');
  if (!/^[0-9a-f]{20,}$/.test(t)) return out_({ ok: false, error: 'token' });
  const sh = sheet_(SUBS, []);
  const rows = sh.getDataRange().getValues();
  const i = rows.findIndex((r, k) => k > 0 && r[2] === t);
  if (i < 1) return out_({ ok: false, error: 'token' });
  sh.getRange(i + 1, 2).setValue(status);
  sh.getRange(i + 1, col).setValue(new Date());
  return out_({ ok: true });
}

/* ---------- 寄新文章 ---------- */
function feed_() {
  const r = UrlFetchApp.fetch(SITE + '/notify.json?t=' + Date.now(), { muteHttpExceptions: true });
  if (r.getResponseCode() !== 200) throw new Error('notify.json ' + r.getResponseCode());
  return JSON.parse(r.getContentText());
}

function checkNewPosts() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return;
  try {
    const props = PropertiesService.getScriptProperties();
    const sentSh = sheet_(SENT, []);
    const known = sentSh.getDataRange().getValues().slice(1).map(r => String(r[0]));
    const f = feed_();

    if (!props.getProperty('initialized')) {                  // 第一次：只記下現有文章
      f.posts.forEach(p => { if (known.indexOf(p.id) < 0) sentSh.appendRow([p.id, p.title, new Date(), new Date(), '啟用前']); });
      props.setProperty('initialized', '1');
      return;
    }

    let q = props.getProperty('queue') ? JSON.parse(props.getProperty('queue')) : null;
    if (!q) {                                                 // 找三天內、還沒寄過的新文章（最舊的先寄）
      const fresh = f.posts
        .filter(p => known.indexOf(p.id) < 0 && Date.now() - Date.parse(p.date) < 3 * 86400e3)
        .sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
      if (!fresh.length) return;
      const p = fresh[0];
      const list = sheet_(SUBS, []).getDataRange().getValues().slice(1).filter(r => r[1] === '已確認').map(r => [r[0], r[2]]);
      sentSh.appendRow([p.id, p.title, new Date(), '', 0]);
      q = { id: p.id, title: p.title, post: p, todo: list, done: 0 };
    }

    const T = f.texts;
    const p = q.post;
    const subject = String(T.mail_post_subject || '{title}').replace(/\{title\}/g, p.title);
    while (q.todo.length && MailApp.getRemainingDailyQuota() > 0) {
      const [email, token] = q.todo[0];
      const unsub = SITE + '/subscribe/?u=' + token;
      try {
        GmailApp.sendEmail(email, subject, p.title + '\n\n' + (p.summary || '') + '\n\n' + p.url + '\n\n' + (T.mail_unsubscribe || '退訂') + '：' + unsub, {
          name: T.mail_sender_name || SENDER_NAME,
          htmlBody: page_(T,
            '<p><b>' + esc_(p.title) + '</b>' + (p.subtitle ? '<br><span style="color:#6e6866">' + esc_(p.subtitle) + '</span>' : '') + '<br><span style="color:#6e6866">' + esc_(p.cat) + '</span></p>' +
            (p.summary ? '<p>' + esc_(p.summary) + '</p>' : '') +
            '<p><a href="' + esc_(p.url) + '">' + esc_(T.mail_post_read || '閱讀全文') + '</a></p>', unsub),
        });
      } catch (err) { console.warn('寄給 ' + email + ' 失敗：' + err); }
      q.todo.shift(); q.done++;
      props.setProperty('queue', JSON.stringify(q));         // 每寄一封就記下進度，中斷也不會重複寄
    }

    const rows = sentSh.getDataRange().getValues();
    const i = rows.map(r => String(r[0])).lastIndexOf(q.id);
    if (q.todo.length) {                                      // 額度用完：隔天自動續寄
      if (i > 0) sentSh.getRange(i + 1, 5).setValue(q.done + '（續寄中）');
      return;
    }
    if (i > 0) sentSh.getRange(i + 1, 4, 1, 2).setValues([[new Date(), q.done]]);
    props.deleteProperty('queue');
  } finally { lock.releaseLock(); }
}

/* ---------- 信件外觀 ---------- */
function esc_(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]); }

function paras_(text) { return String(text || '').split(/\n\s*\n/).map(t => '<p>' + esc_(t).replace(/\n/g, '<br>') + '</p>').join(''); }

function page_(T, body, unsub) {
  // 樸素的信：只有文字與細線，像一般人寫的信
  return '<div style="font-family:\'Noto Serif TC\',\'Songti TC\',\'PMingLiU\',serif;color:#3f3a39;line-height:1.8;font-size:15px;max-width:560px">' +
    body +
    '<p style="border-top:1px solid #d3cec3;margin-top:24px;padding-top:8px;font-size:12px;color:#6e6866">' + esc_(T.mail_footer || '') +
    (unsub ? '　<a href="' + esc_(unsub) + '" style="color:#6e6866">' + esc_(T.mail_unsubscribe || '退訂') + '</a>' : '') + '</p></div>';
}
