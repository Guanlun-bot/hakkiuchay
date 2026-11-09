// =========================================================
// 禪修室 設定檔
// 依照 README.md 的步驟，把下面兩個值換成你 Supabase 專案的資料。
// 還沒填寫時，App 會以「本機模式」運作（不需登入，資料只存在該裝置）。
// =========================================================
window.ZEN_CONFIG = {
  // Supabase 後台 › Project Settings › API › Project URL
  supabaseUrl: "https://yoewdpbbfnkkxetyjqka.supabase.co",

  // Supabase 後台 › Project Settings › API › anon public key（可公開，資料由資料庫權限保護）
  supabaseAnonKey: "sb_publishable_YX-CKztqTTIZJszfxoPXVg_q-YUTAez",

  // 每日提醒推播的公開金鑰（VAPID public key，可公開）
  vapidPublicKey: "BLzVdViWaQRYmnSXmY_9KjCDBnvpggcxZVCS3B054d8Ppg2r22zeA6AvNLxkMKOjDt1dXWjMkVi7Ip8GlsyMWeA",

  // 第三方登入：在 Supabase › Authentication › Providers 設定好之後再改成 true
  enableApple: false,
  enableGoogle: false
};
