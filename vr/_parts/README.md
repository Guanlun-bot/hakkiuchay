# 線上書齋程式分段

`vr/vr-house.js` 本身只有一串 `include_relative`。GitHub Pages 建置時，Jekyll 會依檔名順序把這裡的分段接成一個檔，所以**分段的順序就是程式的順序**，後面的段可以用前面段定義的東西，反過來不行。

| 檔案 | 內容 |
|---|---|
| `01-core.js` | 後台資料、共用小工具、臺北時間與日夜、場景與相機、宅院主體建築 |
| `02-compound-lights.js` | 合院補齊（東西大房、過水間）、天氣與風、燈籠、壁燈、吊燈 |
| `03-xuejiu-furniture.js` | 學鳩齋：匾額、書櫃、書桌、座位種類、唱盤、咖啡角、院子石椅 |
| `04-zhiliao.js` | 知了間：和室、明間、茶室、雨、燈具、泡茶與喝茶（電影院尺寸 `CIN` 也在這裡） |
| `05-looks-plan.js` | 扮相與 3D 人物 `buildFigure()`、抽菸、宅院平面圖 |
| `06-gate-controls-ui.js` | 門口、每格畫面、兩個預設視角、咖啡、唱片、導航尋路、輸入、四角面板、閱讀器、計時器 |
| `07-network-voice.js` | 多人連線（學鳩齋伺服器、Supabase、本機 server.py）與語音 |
| `08-chat-map-gestures.js` | 聊天、操作說明、小地圖、手勢、提示訊息 |
| `09-vr-loop-perf.js` | VR 模式、主迴圈、效能（合併網格、燈光池） |
| `10-eaves-windows-beds.js` | 屋簷、石框竹節窗、22／26 號房的床 |
| `11-npc.js` | 宅中人物：地點、道具、人物模型、字幕、對話框 |
| `12-kitchen-dining.js` | 灶腳與飯廳、三餐；檔尾是教室的房間本體 |
| `13-classroom.js` | 教室：黑板、投影、多人同步 |
| `14-cinema.js` | 電影院：房間、門（歐式對開門、玻璃木門） |
| `14a-laundry.js` | 洗衣間（西邊前過水） |
| `14b-cinema-play.js` | 電影院：放映、燈光、同步、門外爆米花機 |
| `15-staff-pages.js` | 傭人作息；阿莉、阿荷、阿福、阿來 |
| `16-talk.js` | 對話、人物之間的對話、臨時差事 |
| `17-steward.js` | 許總管面板 |
| `18-snacks-gramophone.js` | 茶點與客飯、過廳的留聲機 |
| `18z-township.js` | 斗安鄉的地形資料 `TWP`：方位換算、海拔、河與潭、地名、鐵道與道路的路線 |
| `19-land.js` | 宅外：稻田、大陂溪與小溪、斗灣潭、海、全鄉地形網格、遊船、樹、水牛、鳥 |
| `19a-zhang-phone.js` | 帳房與電話 |
| `19b-station.js` | 渡船頭站：站房、月台、站內鐵軌、站長 |
| `18y-roads-baked.js` | 道路算好的路線（`tools/bake-roads.mjs` 產生） |
| `19c-township-build.js` | 全鄉的房子、廟、車站、鐵道、道路與橋；田外怎麼走 |
| `19d-cave.js` | 鐘乳石伏流暗河：天坑、坐船、大廳、海蝕洞 |
| `20-blinds.js` | 竹簾 |
| `21-tmap-fly.js` | 全鄉地圖（N）、飛行、傳送門 |

## 規矩

- 每個分段的**第一行 `// {% raw %}` 和最後一行 `// {% endraw %}` 不要刪**。它們讓 Jekyll 原封不動地接上程式碼；刪掉後，程式裡若剛好出現 `{{` 或 `{%`，網站就會組錯。
- 新增分段：檔名照編號插進想要的位置，第一行和最後一行照上面的寫法，再到 `vr/vr-house.js` 加一行 `{% include_relative _parts/檔名 %}`，並更新這張表。
- 一個分段太長時可以再拆，切點要選在完整的敘述之後（通常是 `/* ===== … */` 或 `// ---- …` 標題前）。

## 在自己電腦上看書齋

雙擊根目錄的 `預覽書齋.bat`（Windows）或 `預覽書齋.command`（Mac），或在根目錄執行：

```
python3 vr/_parts/serve.py
```

不用裝 Jekyll。它會開一個本機小網站，每次重新整理都重新組檔，並自動開瀏覽器進到測試房（`?room=TEST-…`）。

只想檢查語法、不開瀏覽器時：`python3 vr/_parts/build.py`，組好的檔在 `_site-vr/vr-house.js`（不進 git）。
