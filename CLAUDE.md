# 學鳩齋：給協助編輯的 Claude 的交接說明

這是許原綸（Kho GuanLun）的個人書齋網站，網址 https://hakkiuchay.space/ （網域在 GoDaddy 購買，DNS 指向 GitHub Pages；根目錄的 CNAME 檔不要刪）。
用 Jekyll 寫，GitHub Pages 以「Deploy from a branch（main）」自動建置；推上 main 約一分鐘後上線。

## 最重要的規矩
- 網站上所有文字都要能在後台改：新增任何顯示文字，都放進 `_data/*.yml`，並同時在兩個後台設定加欄位：`.pages.yml`（Pages CMS，主要使用）與 `admin/config.yml`（Sveltia CMS）。
- 齋主常從後台直接存檔，推送前一定先 `git pull --rebase`；衝突時以後台（遠端）的內容為準。
- 公開信箱只能用 khoguanlun@gmail.com，不要放其他私人信箱。
- 不要索取、保存或寫入任何金鑰（token）。
- 齋主偏好：簡潔、日本傳統色、宋體（Noto Serif TC）、不要置中的大段文字、不要多餘的說明文字與裝飾。改版前先說明方案，取得同意再動手。

## 檔案在哪
- `_data/site.yml`：齋主資料（名字、大頭貼、簡介、信箱、所在、Discord、Signal、著作 books）。
- `_data/home.yml`：首頁《莊子》引文、書齋介紹、介紹下方的畫、輪播秒數。
- `_data/text.yml`：選單、標題、頁尾等網站文字。
- `_data/categories.yml`：分類（academic、study-talks、life）的名稱、索書號字頭、背景圖 cover、cover_caption、bg_whole、bg_gray、bg_fill。
- `_data/photos.yml`：首頁輪播照片與說明。
- `_posts/`：文章（front matter：title、subtitle、author、slug、cat、date、summary、keywords、source、notes、refs）。文章內的圖放 `assets/uploads/posts/<文章>/`，用 `figure.post-fig`。
- `_layouts/default.html`：外框、選單、頁尾、日夜模式、分類背景。`_layouts/post.html`：文章閱讀版（註腳、目錄）。`_layouts/category.html`：分類列表。
- `_includes/home-lower.html`：首頁下半（左：書齋介紹＋畫；右：齋主名片＋著作＋聯絡）。
- `assets/site.css`：全部樣式，依頁面分成 10 段（檔頭有目次）。修改時找到對應段落直接改，不要往檔尾疊加覆寫；顏色一律用 CSS 變數（`--ink`、`--paper`、`--rule`、`--seal` 等）以支援深色模式。
- `console/index.html`：總控台（https://hakkiuchay.space/console/ ）。自成一檔，不經 Jekyll 版型；欄位直接讀 `.pages.yml` 產生，所以在 `.pages.yml` 加欄位就會自動出現在總控台。金鑰由齋主在自己瀏覽器輸入，只存在該裝置。書庫狀態與「立即更新」請求放在私人儲存庫 `Guanlun-bot/hakkiuchay-ops`（`status/<電腦名>.json`、`requests/library.json`），由書庫櫃檯 `系統\bridge.ps1` 每 10 分鐘讀寫。總控台金鑰到期日記在 hakkiuchay-ops 的 `config/console.json`；該儲存庫的 `.github/workflows/check.yml` 每天 08:43 檢查，有狀況開 issue「書庫需要處理」通知齋主。文章草稿用 front matter `published: false`。
- 獺祭魚、禪修室是外部連結（`site.yml` 的 tajiyu_url、chanroom_url）：https://otterslibrary.pages.dev/、https://chanroom.pages.dev/
- `_chanroom/`：禪修室的完整程式（底線開頭，Jekyll 不會把它放上學鳩齋）。正式網址仍是 https://chanroom.pages.dev/ （Cloudflare Pages 專案 chanroom）。改禪修室就改這裡，並把 `_chanroom/sw.js` 的 VERSION 數字加一，否則已安裝的使用者會一直看到舊版快取。改完由齋主在總控台「禪修室」按「發布最新版」，書庫電腦的 bridge.ps1 會下載 `_chanroom/` 用 wrangler 上傳。`config.js` 內是 Supabase 公開金鑰（anon key，本來就會出現在網頁上），可以留在儲存庫。

- `_notify/Code.gs`：新文章電子郵件通知（Google Apps Script，裝在 khoguanlun@gmail.com 的試算表「學鳩齋訂閱名單」裡，部署成網頁應用程式；儲存庫這份是原始碼備份，改了要貼回 Apps Script 並「管理部署作業 › 編輯 › 新版本」）。Apps Script 專案：https://script.google.com/home/projects/1HzQGQWeAU8bg-rsUT-jYxsxuA3JKgvSvLUPFbBKtTUAoSjovOqTjIvj7/edit（瀏覽器若同時登入多個 Google 帳號，khoguanlun 要是第一個登入的，否則授權視窗會開錯帳號）。名單在試算表「訂閱者」分頁，寄送紀錄在「已寄文章」。每 10 分鐘讀 `/notify.json`（Jekyll 產生，含最新 20 篇與 `_data/text.yml` 的 `mail_*` 信件文字），有新文章就從齋主 Gmail 寄給已確認的訂閱者；Gmail 每天 100 封額度用完會隔天續寄；第一次執行只記下現有文章。`_config.yml` 的 `notify_url` 填網頁應用程式網址後，每頁頁底才會出現訂閱欄（`_includes/subscribe.html`，由 `_layouts/default.html` 的 footer 引入），確認與退訂連結導到 `/subscribe/`。網頁呼叫時不設 content-type（純文字），Apps Script 才收得到。

## 自動流程
- `.github/workflows/compress-images.yml`：只處理每次新上傳或更動的照片（舊照片不重壓）：HEIC→JPG、副檔名改小寫、不透明的 PNG 照片轉 JPG 並同步改文章／資料裡的連結、大於 500KB 或過大的縮小（`home/`、`covers/` 長邊 2000，其餘文章用 1600，品質 82）；`assets/uploads/home/` 的新照片自動加進首頁輪播。它可能自己多推一個 commit，記得再 pull。
- `.github/workflows/cancel-stuck-pages.yml`：Pages 發布卡住時手動執行。
- `deploy.yml` 目前停用。
- 圖片上傳：Pages CMS 傳大檔（手機照片幾 MB）會失敗，文章裡留下 `blob:` 開頭的暫時連結、圖片顯示不出來。請齋主先用 `/admin/resize.html`（瀏覽器內縮成長邊 1600px 的 JPG）再上傳。看到文章裡有 `blob:` 連結，代表那張圖沒上傳成功，檔案不在 repo 裡，無法替換，只能請齋主重傳。
- 文章裡連續多張各自成段的圖，`_layouts/post.html` 的程式會自動排成兩欄相簿（`.gallery`）。

## 預覽與確認
- `baseurl` 是空字串（自訂網域），連結仍一律用 `relative_url`，以便日後換網址。
- 上線後用 `?v=<commit>` 加在網址後避開快取。
- 圖片版權：只用公有領域或齋主有權使用的圖（例：故宮開放資料、作者過世逾 50 年的作品）。
