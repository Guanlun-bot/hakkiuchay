# 學鳩齋：給協助編輯的 Claude 的交接說明

這是許原綸（Kho GuanLun）的個人書齋網站，網址 https://guanlun-bot.github.io/hakkiuchay/ 。
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
- `assets/site.css`：全部樣式。新樣式一律加在檔尾覆寫，用 CSS 變數（`--ink`、`--paper`、`--rule`、`--seal` 等）以支援深色模式。
- 獺祭魚是外部連結：https://otterslibrary.pages.dev/

## 自動流程
- `.github/workflows/compress-images.yml`：上傳的新照片會自動 HEIC→JPG、副檔名改小寫、長邊大於 2000 像素或大於 1.5MB 的會縮小；`assets/uploads/home/` 的新照片自動加進首頁輪播。它可能自己多推一個 commit，記得再 pull。
- `.github/workflows/cancel-stuck-pages.yml`：Pages 發布卡住時手動執行。
- `deploy.yml` 目前停用。

## 預覽與確認
- `baseurl` 是 `/hakkiuchay`，連結一律用 `relative_url`。
- 上線後用 `?v=<commit>` 加在網址後避開快取。
- 圖片版權：只用公有領域或齋主有權使用的圖（例：故宮開放資料、作者過世逾 50 年的作品）。
