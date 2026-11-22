# 一起改線上書齋

給一起開發學鳩齋線上書齋（https://hakkiuchay.space/vr/ ）的朋友看的說明。

## 先知道三件事

1. **`main` 就是正式網站。** 推上 `main` 約一分鐘後，GitHub Pages 會自動更新網站；改到 `_vrserver/`，Cloudflare 也會自動重新發布多人伺服器。所以 `main` 只放確定能上線的東西。
2. **齋主會從後台直接存檔到 `main`**（Pages CMS、Sveltia CMS，主要是改 `_data/` 的文字），所以 `main` 隨時可能多出新的 commit。
3. **儲存庫是公開的。** 任何金鑰、密碼、私人信箱都不能放進來。`vr/config.js` 裡的 Supabase 金鑰本來就是公開用的，不算。

## 流程

```
git checkout main && git pull           # 先拿最新的
git checkout -b 你的名字/要做的事         # 例：alex/boat-lantern
# …改、測…
git add -A && git commit -m "說明這次改了什麼"
git push -u origin 你的名字/要做的事
```

推上去後，到 GitHub 開一個 Pull Request 到 `main`，請另一個人看過再按 Merge。合併就等於上線。

分支放太久的話，先把 `main` 的新東西拉進來，再繼續改：

```
git fetch origin && git rebase origin/main
```

## 分工：盡量不要同時改同一個檔

線上書齋的 3D 程式已經依區域拆成好幾個檔，放在 `vr/_parts/`，一覽表在 `vr/_parts/README.md`。開工前在群組說一聲「我要改 `14-cinema.js`」，對方就先不要動那個檔。兩個人改不同的檔，合併時幾乎不會衝突。

大家都會改的檔：

- `_data/vr.yml`（書齋裡所有的文字）：新增的條目加在自己功能那一段，不要整段重排或重新縮排。
- `vr/_parts/01-core.js`、`06-gate-controls-ui.js`、`07-network-voice.js`：全宅共用的基礎，改之前先講好。

不要直接改 `vr/vr-house.js`。它只負責把 `_parts/` 接起來。

## 在自己電腦上測試

### 方法一：完整網站（建議）

裝 Ruby 之後：

```
gem install jekyll kramdown-parser-gfm
jekyll serve
```

打開 http://localhost:4000/vr/?room=TEST-你的名字

### 方法二：只檢查程式有沒有寫壞

```
python3 vr/_parts/build.py
```

會把分段組成 `_site-vr/vr-house.js`，並用 node 檢查語法。

### 一定要加 `?room=`

本機的書齋一樣連到正式的多人伺服器。不加 `?room=` 的話，會進到大家平常在的房間，你的測試動作（開電影、改黑板、點茶點、叫人集合）會被正在線上的人看到。兩個人要一起測多人功能時，用同一個房間代號，例如 `?room=TEST-OURS`。代號只能用英文、數字和減號，最多 16 字。

其他測試小技巧：

- `?meal=<分鐘>` 可以把宅裡的時間往後推，測三餐、洗澡、熄燈。
- 電影院的片子只允許從 hakkiuchay.space 播放，在本機播不出來是正常的。

## 改多人伺服器（`_vrserver/`）

伺服器一合併進 `main` 就會上線，而且所有人都連它。改之前一定要先講，合併後兩個人馬上到正式網站實際連線看一次。

## 文字與圖片

- 書齋裡看得到的文字都放在 `_data/vr.yml`，不要寫死在程式裡，這樣齋主才能從後台改。
- 圖片、音樂、影片只用公有領域或確定有權使用的。
