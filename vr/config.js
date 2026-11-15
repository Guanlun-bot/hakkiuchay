// 線上書齋 設定檔：多人在線（誰在書齋、坐哪裡、喝什麼）走這個 Supabase 專案的 Realtime 頻道。
// 用的是禪修室同一個專案與公開金鑰（publishable / anon key，本來就會出現在網頁上），不寫入任何資料表。
window.VR_CONFIG = {
  url: "https://yoewdpbbfnkkxetyjqka.supabase.co",
  key: "sb_publishable_YX-CKztqTTIZJszfxoPXVg_q-YUTAez",
  channel: "hakkiuchay-vr",
  // 學鳩齋自己的多人伺服器（_vrserver/，Cloudflare）。發布後填 wss://… 網址；空白時用上面的 Supabase
  ws: ""
};
