# 學鳩齋

許原綸的個人書齋網站：https://hakkiuchay.space/

以 Jekyll 撰寫，由 GitHub Pages 從 `main` 分支自動建置，推送後約一分鐘上線。

## 編輯後台

- **Pages CMS**（主要使用）：https://app.pagescms.org/
- **Sveltia CMS**：https://hakkiuchay.space/admin/ （上傳照片前會在瀏覽器裡自動縮圖）
- **縮圖工具**：https://hakkiuchay.space/admin/resize.html （照片太大、Pages CMS 上傳失敗時先用這個縮小）

## 目錄

| 位置 | 內容 |
|---|---|
| `_posts/` | 文章 |
| `_data/` | 網站文字、齋主資料、分類設定、首頁輪播照片（後台可改） |
| `_layouts/`、`_includes/` | 版型 |
| `assets/site.css` | 全部樣式，依頁面分段，檔頭有目次 |
| `assets/uploads/` | 上傳的圖片；`home/` 為首頁輪播、`covers/` 為分類背景 |
| `admin/` | Sveltia CMS 與縮圖工具 |
| `.github/workflows/` | 照片自動處理（轉檔、壓縮、加進首頁輪播） |

協助維護的說明見 `CLAUDE.md`。
