# 線上書齋 多人伺服器（hakkiuchay-vr）

一個書齋房間 = 一個 Cloudflare Durable Object，作用和 `server.py` 相同：記住房間裡每個人的位置與狀態，並把位置、狀態、語音片段轉給同房的其他人。用 WebSocket 連線，任何地方都連得到。

## 發布

已設定好：這台伺服器在 khoguanlun@gmail.com 的 Cloudflare 帳號，專案 hakkiuchay-vr 連著 GitHub，`_vrserver/` 推上 main 後會自動重新發布（Cloudflare 後台 › Workers 和 Pages › hakkiuchay-vr › 部署 可看紀錄）。網址：`wss://hakkiuchay-vr.hakkiuchay.workers.dev`（已填在 `vr/config.js`）。

## 手動發布（備用）

在有 Node.js 的電腦上：

```
cd _vrserver
npx wrangler login      # 第一次才需要，瀏覽器登入 Cloudflare
npx wrangler deploy
```

完成後畫面會顯示網址，例如 `https://hakkiuchay-vr.xxxx.workers.dev`。把它改成 `wss://` 開頭，填進 `vr/config.js` 的 `ws` 欄位：

```
ws: "wss://hakkiuchay-vr.xxxx.workers.dev"
```

`ws` 空白時，書齋照舊使用 Supabase；填了之後優先連這台伺服器，連不上才退回 Supabase。

## 本機測試

`npx wrangler dev`，然後把 `vr/config.js` 的 `ws` 暫時設成 `ws://127.0.0.1:8787`。
