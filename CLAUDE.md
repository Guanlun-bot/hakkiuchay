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

- 線上書齋第一進東廂：南間是灶腳、明間是飯廳（`vr/vr-house.js` 的「灶腳與飯廳」段）。三餐依臺北時間（`_data/vr.yml` › npc 的 `meal.times`），菜單是 `menu.<星期1–7>.<b/l/d>`，點擊說明在 texts 的 k*/d*。測試時網址加 `?meal=<分鐘>` 可把時間往後推。

- 線上書齋第二進西廂南間是教室（`vr/vr-house.js` 的「二進西廂南間：教室」與「教室：黑板、投影、多人同步」兩段）：黑板與投影透過多人伺服器的 `{t:'b'}` 轉送（`_vrserver/src/index.js` 的 relay），伺服器不存任何內容，新進的人由在場的人把黑板交給他。PDF 用 pdf.js、PPTX 用 JSZip 從 jsDelivr 載入；按鈕文字在 `_data/vr.yml` › npc 的 `cls.*`。

- 線上書齋 12 號房（二進西廂北間）是電影院（`vr/vr-house.js` 的「12 號房（二進西廂北間）：電影院」段；尺寸與台座高度在檔頭附近的 `CIN`，`floorY()` 依它抬高台座與踏階）：暖褐一體——暖灰褐布面牆、同色系沙發（米白與深褐抱枕）、深咖啡絨布幕、深褐地毯、胡桃木小几與門，全黑銀幕牆；平頂星空（房內的屋梁已藏起來；星空開關各人自己的，記在瀏覽器）、兩側天花板邊框藏暖色燈帶與小孔燈（牆上的扇形光暈是貼圖）。銀幕從地面到天花板寬 4.3 公尺，畫面依片子的長寬比自動縮放、最低從離地 0.8 公尺起（`CIN.AREA`），其餘是黑絨；左右喇叭藏在銀幕後。前排三人沙發，45 公分台座加整排踏階，台座上牆到牆的 ㄇ 字沙發（五座）。紅絨布幕改深咖啡，有片時拉開；朝院子的窗跟全宅一樣掛竹簾（原本的檜木窗門已拆）。燈光刻意壓暗（各場景在 `LOOK`，放映時幾乎只剩銀幕光），燈光滑桿 0–2、預設在中間 1。冰箱與飲料已拿掉。片單在 `_data/vr.yml` 的 `films`（title、url、subs），影片放齋主的 Cloudflare R2 bucket `hakkiuchay-films`（公開網址 https://pub-afe8fced79534e7b9e81898ec5067433.r2.dev/ ，CORS 只允許 https://hakkiuchay.space）。片子、播放進度、燈光場景（迎賓、映前、放映、中場、夜場）與亮度都經多人伺服器的 `{t:'b', d:{k:'cine'}}` 同步，新進的人由在場者交接；音量各人自己的。聲音：喇叭定位的 AudioContext 只在使用者點擊或按鍵時才建立（之前一律用 video 元素本身的音量），避免瀏覽器把它停住變成靜音。進房間時右下角有小面板（L 收合），門邊牆上有燈光開關。電影院與教室通明間的門是歐式對開木門（`addEuroDoor`，鍵 `dcine`、`dcls`，沒有門閂，內外都能開關，狀態跟其他門一樣同步）；電影院門關上時外面聽不到聲音。按鈕文字在 npc 的 `cine.*`、`edoor.msg`。

- 線上書齋全宅的八卦窗與方窗都有竹簾（`vr/vr-house.js` 的「竹簾」段，`buildBlinds()`）：建窗時 `windowBay()`、`partition()` 的八卦窗、`bambooWindow()` 會把窗記進 `WINDOWS`，場景蓋完後逐窗做兩片照窗形裁切的煤竹簾（柿渋茶滾邊），內外各一片把窗櫺或八卦格子夾在中間，兩片一模一樣、各有自己的捲軸與簾頭、一起捲放，兩側都能點。從下往上捲，捲軸長度跟著窗在那個高度的寬度。浴室原本用檜木封住的前窗和通明間的八卦窗已重新打開並掛竹簾（八卦窗四周的檜木照窗框開八角洞，不露白牆）；浴室乾區：玻璃隔間在 x 43.6（前窗整扇在浴缸上方），更衣室前牆是落地的檜木洗手櫃（雙盆、下面兩層毛巾）與會反射的背光鏡（`BATH.mirror` 是 z 向的鏡面）、玻璃邊一張長凳；休息室後牆整面是置物櫃（十二格），茶水架、毛巾架已拿掉。濕區：洗身處四位、雨淋在角落，浴缸四個位子兩兩相對，小木盤的壺裝冷水；烤箱：進去點門內側的門栓栓上（`bathlatch`），整間亮起強烈暖黃光、畫面蒙上暖色（`BATH.sauna`），約兩分鐘到 55°C，右下角顯示溫度與時間，十二分鐘提醒；傭人在裡面時門也是關的。燈光都是藏起來的暖光（`BATH.glows`、`BATH.lights`），晚上較亮；浴缸周圍有淡淡的水面光紋。暖簾旁的木牌依作息表顯示女湯／男湯／湯；廁所那兩扇八卦窗仍是白牆封住（不掛）。起床時（作息表）玉姨走東側、阿財走西側，真的一扇扇走過去捲起，熄燈時再走一圈放下；每扇的時間由 `staffRoutes()` 依兩人的路線算出（`BLINDS[i].off`），所有人看到的一樣。有人自己動過的，到下一輪前照他的；開關經多人伺服器 `{t:'b', d:{k:'blind'}}` 同步，新進的人由在場者交接；電影院的三扇（兩扇八卦窗和朝院子的窗）放映時自動放下。提示文字在 npc 的 `blind.msg`、`blind.npc`。新增窗戶若不是用上面三個函式建的，要自己 `WINDOWS.push(...)`。

- 線上書齋的傭人作息（`vr/vr-house.js` 的「傭人作息」段，`staffPlan()`；時間在 `_data/vr.yml` › npc 的 `day.times`：起床、女生洗澡、男生洗澡、熄燈，預設 05:00,22:40,23:20,24:00）：起床時鬧鐘響（每個床頭櫃一個雙鈴鬧鐘，指針跟臺北時間走），玉姨、阿財走一圈收竹簾，其他人照常工作，三餐不變。洗澡：先回房拿臉盆，在置物櫃前換上浴巾（女生從腋下圍、男生圍腰），洗身處、浴缸（小毛巾放頭上）、有時進烤箱，再換回衣服回房坐在床邊。熄燈後男生（許總管、水生叔、火師、阿財）睡 22 號房、女生（玉姨、阿春、阿莉、阿荷）睡 26 號房，蓋被躺在床上；床頭櫃每床一盞小燈，上床時亮、半小時後熄、起床前再亮。床位在 `STAFF.bed`。全部依時鐘推算，不經伺服器；測試一樣用 `?meal=<分鐘>`。

- 線上書齋新增四人（`vr/vr-house.js` 的「阿莉、阿荷、阿福、阿來」段；`NPCS` 裡的 li、he、fu、lai）：阿莉（Sri Rahayu，印尼，洗衣，戴頭巾、每日禮拜）、阿荷（阮氏秋荷，越南，十八歲，打掃，可以逗她：五個選項，連逗三次會去找阿春告狀）、書僮阿福（江萬福，13）與阿來（楊來，12）。四人的作息寫在 `_data/vr.yml` › npc 的 `plan.li`、`plan.he`、`plan.fu`、`plan.lai`（「05:00 禮拜、05:20 收衣…」，工作名稱見各條說明），三餐坐圓桌空位，阿莉、阿荷跟女生一起洗澡、睡 26 號房後排；書僮睡東邊一進前過水（兩張小床、床頭櫃、木箱、書桌），作息 `kids.times`（05:30 起、21:30 睡），洗澡不演出、不進浴室。頭家：門口名字等於 `boss.name`（許原綸）時大家叫「頭家」（`boss.title`），畫面左下出現「喚阿福／喚阿來」，F、R 鍵也行；書僮睡了也會起來，跟在身後、進浴室或廁所時在門外等、在電影院坐前排、天黑阿來提燈籠、你坐下時可「叫阿來泡茶」，離開宅子或 30 分鐘沒動就自己回去。只認名字，不是真的鎖。
- 十位人物的設定（年紀、職務、出身、外表、個性、關係）在 `_data/vr.yml` › npc 的 `bio.<id>`（甲＝年紀與職務，乙＝介紹，一行一段），許總管的「人物簿」點名字可看。水生叔和阿財是一對（低調、宅裡都知道）；火師與阿財是好兄弟。外型參數在 `NPCS` 的 look（bald、glasses、gown、bob、round、hat:'douli'、hijab、braid、kid 等）。
- 線上書齋的對話（`vr/vr-house.js` 的「對話：閒聊、問事情、關心、吩咐」段，`talkMenu()`）：點人物先說一句（時段 `g.<id>.<dawn/morn/noon/aft/dusk/night>`、天氣 `w.<id>.<rain/hot/cold>`、對頭家 `b.<id>`），再出四類選單；問事情 `k.<id>`、今天吃什麼；關心 `praise.<id>`、`rest.<id>`、頭家對水生叔／阿財 `sup.*`；身世 `s.<id>.<n>` 一段段說，進度記在瀏覽器（localStorage `npcStory`）；吩咐（頭家限定）在 `ORDERS`。兩人碰面時的小對話 `p.<a>_<b>.<n>`（甲先說、乙回），約四分鐘一次、你在 9 公尺內才演。原本六位的額外工作在 `plan.yu`…`plan.cai`（「起-迄 工作」），其餘時間照原本的流程；可用的工作名稱在 `TASKS`。注意：人物物件上的 `look` 只代表洗澡時的樣子（null／towel／soak），外型在 `NPCS[i].look`。
- 線上書齋宅外（`vr/vr-house.js` 的「宅外：稻田與寧平山水」段，`LAND`）：宅子四周是稻田（田埂、曬穀場、門前土路到渡頭可以走，`LAND.walk`；宅外的路徑沿田埂走 `__landRoute`），近處稻子是一個 InstancedMesh 隨人移動、依即時風（`WIND`）起稻浪，顏色依臺北月份（一直有稻穗）；遠處是寧平式石灰岩峰林三層（`PEAKS`、`karst()`），河（`RIVER`，CatmullRom 閉合）繞過峰林、穿峽谷與山洞；兩艘小舢舨依固定時刻表繞河（`boatState`，大家看到同一班），船靠渡頭時點船上船（座位 kind `boat`），回渡頭起身。另有荷花池、竹叢、渡頭大榕樹、稻草人、水車、山頂亭子、崖下小廟、農人、水牛與牧童、白鷺、山羊、夜裡螢火蟲。為了看得到遠山，相機可視距離改為 1700、霧改為 70–1000（下雨時變濃），天空球跟著人移動。文字在 npc 的 `boat.*`。

- `vr/look.js`：線上書齋門口的扮相目錄（衣著、帽冠、面飾、隨身、髮型、氣質、顏色）與左側預覽圖；3D 人物在 `vr/vr-house.js` 的 `buildFigure()`。新增扮相要兩邊都加，名稱另加進 `_data/vr.yml` 的 `look`。門口按「進門」才開始載入 3D，載入小故事在 `_data/vr.yml` 的 `loading`；門口文字由 `vr/gate.json` 讀取。

- `_vrserver/`：線上書齋的多人伺服器（Cloudflare Worker＋Durable Objects，專案名 hakkiuchay-vr），作用同 `server.py`：一房一台、位置與語音經伺服器轉送。放在 khoguanlun@gmail.com 的 Cloudflare 帳號（子網域 hakkiuchay.workers.dev），已連 GitHub：推上 main 後 Cloudflare 自動以 `_vrserver` 為根目錄重新發布。網址 wss://hakkiuchay-vr.hakkiuchay.workers.dev 填在 `vr/config.js` 的 `ws`；`ws` 空白時書齋改用 Supabase。

- `_notify/Code.gs`：新文章電子郵件通知（Google Apps Script，裝在 khoguanlun@gmail.com 的試算表「學鳩齋訂閱名單」裡，部署成網頁應用程式；儲存庫這份是原始碼備份，改了要貼回 Apps Script 並「管理部署作業 › 編輯 › 新版本」）。Apps Script 專案：https://script.google.com/home/projects/1HzQGQWeAU8bg-rsUT-jYxsxuA3JKgvSvLUPFbBKtTUAoSjovOqTjIvj7/edit（瀏覽器若同時登入多個 Google 帳號，khoguanlun 要是第一個登入的，否則授權視窗會開錯帳號）。名單在試算表「訂閱者」分頁，寄送紀錄在「已寄文章」。每天晚上 8～9 點（台北時間）讀一次 `/notify.json`（Jekyll 產生，含最新 20 篇與 `_data/text.yml` 的 `mail_*` 信件文字），有新文章就從齋主 Gmail 寄給已確認的訂閱者；Gmail 每天 100 封額度用完會隔天續寄；第一次執行只記下現有文章。`_config.yml` 的 `notify_url` 填網頁應用程式網址後，每頁頁底才會出現訂閱欄（`_includes/subscribe.html`，頁底右側信封圖示，點開浮出信箱欄，由 `_layouts/default.html` 的 footer 引入），確認與退訂連結導到 `/subscribe/`。網頁呼叫時不設 content-type（純文字），Apps Script 才收得到。

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
