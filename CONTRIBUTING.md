# 一起改線上書齋

照著做就好，不用懂 Jekyll。

## 第一次：準備（只做一次）

1. 安裝 **GitHub Desktop**（https://desktop.github.com/ ），用你的 GitHub 帳號登入。
2. 安裝 **Python**（https://www.python.org/downloads/ ）。Windows 安裝時要勾選「Add python.exe to PATH」。
3. 在 GitHub Desktop 按 File → Clone repository，選 `Guanlun-bot/hakkiuchay`，抓到你的電腦。

## 每次要改東西

### 1. 開一條自己的分支

GitHub Desktop 上方先按 **Fetch origin**（拿最新版），再按 **Current branch → New branch**，取名 `你的名字/要做的事`，例如 `chiongkhoe/boat-lantern`。

**不要在 main 上改。** main 就是正式網站，推上去一分鐘就上線。

### 2. 找到要改的檔

書齋的 3D 程式依區域分成 20 個檔，放在 `vr/_parts/`：

| 想改的地方 | 檔案 |
|---|---|
| 學鳩齋（書房）的家具 | `03-xuejiu-furniture.js` |
| 知了間、茶室 | `04-zhiliao.js` |
| 人物外型、扮相 | `05-looks-plan.js`（門口的選項在 `vr/look.js`） |
| 移動、操作、面板 | `06-gate-controls-ui.js` |
| 多人連線、語音 | `07-network-voice.js` |
| 傭人、書僮 | `11-npc.js`、`15-staff-pages.js` |
| 灶腳、飯廳 | `12-kitchen-dining.js` |
| 教室 | `13-classroom.js` |
| 電影院 | `14-cinema.js` |
| 對話 | `16-talk.js` |
| 許總管面板 | `17-steward.js` |
| 茶點、留聲機 | `18-snacks-gramophone.js` |
| 宅外稻田、山、河、船 | `19-land.js` |
| 竹簾 | `20-blinds.js` |

完整一覽在 `vr/_parts/README.md`。書齋裡顯示的**文字**不在程式裡，而是放在 `_data/vr.yml`。

開工前在群組說一聲「我要改 `14-cinema.js`」，對方就先不要動那個檔，免得兩個人改到同一處。

兩個小規矩：

- 每個檔的**第一行和最後一行不要刪**（`// {% raw %}`、`// {% endraw %}`），那是網站組檔要用的。
- 不要改 `vr/vr-house.js`，它只負責把 20 個檔接起來。

### 3. 在自己電腦上看

雙擊儲存庫根目錄的：

- Windows：**`預覽書齋.bat`**
- Mac：**`預覽書齋.command`**

會跳出一個黑色視窗，瀏覽器自動打開書齋的**測試房**。改完檔案後，回瀏覽器重新整理就看得到。視窗不要關，關掉預覽就停了。

- 測試房是自己的，線上的人看不到你，你開電影、改黑板也不會吵到別人。
- 兩個人要一起測多人功能，就把兩邊網址最後的 `room=TEST-…` 改成同一個。
- 程式寫壞的話，黑色視窗會顯示錯在哪一行。
- 電影院的片子在本機播不出來，這是正常的。
- 黑色視窗提醒「沒有裝 PyYAML」時，在終端機打 `pip install pyyaml`，書齋裡的文字才會跟後台一樣。

### 4. 送出

1. GitHub Desktop 左下角寫一句這次改了什麼，按 **Commit**。
2. 按上方的 **Push origin**。
3. 按 **Create Pull Request**，網頁會打開，再按一次 Create pull request。

接下來由齋主看過後按合併，合併後一分鐘就上線。合併後記得回到 main 按 Fetch，下次再從第 1 步開新分支。

## 不要做的事

- 不要把任何密碼、金鑰、私人信箱放進來（儲存庫是公開的）。
- 改 `_vrserver/`（多人伺服器）前一定要先講。它一合併就上線，所有人都連它。
- 圖片、音樂、影片只用公有領域或確定有權使用的。

## 如果你用 Claude 寫程式

把這個資料夾交給 Claude（例如在 Claude Code 打開它）就好。儲存庫裡的 `CLAUDE.md` 會告訴它檔案在哪裡、要照上面的流程走。
