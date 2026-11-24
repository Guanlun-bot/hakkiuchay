# 學鳩齋：給協助編輯的 Claude 的交接說明

這是許原綸（Kho GuanLun）的個人書齋網站，網址 https://hakkiuchay.space/ （網域在 GoDaddy 購買，DNS 指向 GitHub Pages；根目錄的 CNAME 檔不要刪）。
用 Jekyll 寫，GitHub Pages 以「Deploy from a branch（main）」自動建置；推上 main 約一分鐘後上線。

## 最重要的規矩
- 網站上所有文字都要能在後台改：新增任何顯示文字，都放進 `_data/*.yml`，並同時在兩個後台設定加欄位：`.pages.yml`（Pages CMS，主要使用）與 `admin/config.yml`（Sveltia CMS）。
- 齋主常從後台直接存檔，推送前一定先 `git pull --rebase`；衝突時以後台（遠端）的內容為準。
- 公開信箱只能用 khoguanlun@gmail.com，不要放其他私人信箱。
- 不要索取、保存或寫入任何金鑰（token）。
- 齋主偏好：簡潔、日本傳統色、宋體（Noto Serif TC）、不要置中的大段文字、不要多餘的說明文字與裝飾。改版前先說明方案，取得同意再動手。
- 線上書齋的食物一律**蛋奶素**：不能有酒、肉、海鮮等葷腥，也不能有五辛（蔥、蒜、韭、蕗蕎、興渠）；蛋和奶可以。菜單、茶點、飲料、道具（例：灶腳的罈子、吊架上的乾貨）新增或修改時都要守這條。

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

- 線上書齋第一進東廂：南間是灶腳、明間是飯廳（`vr/_parts/12-kitchen-dining.js` 的「灶腳與飯廳」段）。三餐依臺北時間（`_data/vr.yml` › npc 的 `meal.times`），菜單是 `menu.<星期1–7>.<b/l/d>`，點擊說明在 texts 的 k*/d*。測試時網址加 `?meal=<分鐘>` 可把時間往後推。

- 線上書齋第二進西廂南間是教室（`vr/_parts/12-kitchen-dining.js` 檔尾的「二進西廂南間：教室」與 `vr/_parts/13-classroom.js` 的「教室：黑板、投影、多人同步」）：黑板與投影透過多人伺服器的 `{t:'b'}` 轉送（`_vrserver/src/index.js` 的 relay），伺服器不存任何內容，新進的人由在場的人把黑板交給他。PDF 用 pdf.js、PPTX 用 JSZip 從 jsDelivr 載入；按鈕文字在 `_data/vr.yml` › npc 的 `cls.*`。

- 線上書齋 12 號房（二進西廂北間）是電影院（`vr/_parts/14-cinema.js` 的「12 號房（二進西廂北間）：電影院」段；尺寸與台座高度在 `vr/_parts/04-zhiliao.js` 的 `CIN`，`floorY()` 依它抬高台座與踏階）：暖褐一體——暖灰褐布面牆、同色系沙發（米白與深褐抱枕）、深咖啡絨布幕、深褐地毯、胡桃木小几與門，全黑銀幕牆；平頂星空（房內的屋梁已藏起來；星空開關各人自己的，記在瀏覽器）、兩側天花板邊框藏暖色燈帶與小孔燈（牆上的扇形光暈是貼圖）。銀幕從地面到天花板寬 4.3 公尺，畫面依片子的長寬比自動縮放、最低從離地 0.8 公尺起（`CIN.AREA`），其餘是黑絨；左右喇叭藏在銀幕後。前排三人沙發，45 公分台座加整排踏階，台座上牆到牆的 ㄇ 字沙發（五座）。紅絨布幕改深咖啡，有片時拉開；朝院子的窗跟全宅一樣掛竹簾（原本的檜木窗門已拆）。燈光刻意壓暗（各場景在 `LOOK`，放映時幾乎只剩銀幕光），燈光滑桿 0–2、預設在中間 1。冰箱與飲料已拿掉。片單在 `_data/vr.yml` 的 `films`（title、url、subs），影片放齋主的 Cloudflare R2 bucket `hakkiuchay-films`（公開網址 https://pub-afe8fced79534e7b9e81898ec5067433.r2.dev/ ，CORS 只允許 https://hakkiuchay.space）。片子、播放進度、燈光場景（迎賓、映前、放映、中場、夜場）與亮度都經多人伺服器的 `{t:'b', d:{k:'cine'}}` 同步，新進的人由在場者交接；音量各人自己的。聲音：喇叭定位的 AudioContext 只在使用者點擊或按鍵時才建立（之前一律用 video 元素本身的音量），避免瀏覽器把它停住變成靜音。進房間時右下角有小面板（L 收合），門邊牆上有燈光開關。電影院通明間的門是歐式對開木門（`addEuroDoor`，鍵 `dcine`；教室的 `dcls` 已改成玻璃木門 `addGlassDoor`，沒有門閂，內外都能開關，狀態跟其他門一樣同步）；電影院門關上時外面聽不到聲音。按鈕文字在 npc 的 `cine.*`、`edoor.msg`。

- 線上書齋全宅的八卦窗與方窗都有竹簾（`vr/_parts/20-blinds.js` 的「竹簾」段，`buildBlinds()`）：建窗時 `windowBay()`、`partition()` 的八卦窗、`bambooWindow()` 會把窗記進 `WINDOWS`，場景蓋完後逐窗做兩片照窗形裁切的煤竹簾（柿渋茶滾邊），內外各一片把窗櫺或八卦格子夾在中間，兩片一模一樣、各有自己的捲軸與簾頭、一起捲放，兩側都能點。從下往上捲，捲軸長度跟著窗在那個高度的寬度。浴室原本用檜木封住的前窗和通明間的八卦窗已重新打開並掛竹簾（八卦窗四周的檜木照窗框開八角洞，不露白牆）；浴室乾區：玻璃隔間在 x 43.6（前窗整扇在浴缸上方），更衣室前牆是落地的檜木洗手櫃（雙盆、下面兩層毛巾）與會反射的背光鏡（`BATH.mirror` 是 z 向的鏡面）、玻璃邊一張長凳；休息室後牆整面是置物櫃（十二格），茶水架、毛巾架已拿掉。濕區：洗身處四位、雨淋在角落，浴缸四個位子兩兩相對，小木盤的壺裝冷水；烤箱：進去點門內側的門栓栓上（`bathlatch`），整間亮起強烈暖黃光、畫面蒙上暖色（`BATH.sauna`），約兩分鐘到 55°C，右下角顯示溫度與時間，十二分鐘提醒；傭人在裡面時門也是關的。燈光都是藏起來的暖光（`BATH.glows`、`BATH.lights`），晚上較亮；浴缸周圍有淡淡的水面光紋。暖簾旁的木牌依作息表顯示女湯／男湯／湯；廁所那兩扇八卦窗仍是白牆封住（不掛）。起床時（作息表）玉姨走東側、阿財走西側，真的一扇扇走過去捲起，熄燈時再走一圈放下；每扇的時間由 `staffRoutes()` 依兩人的路線算出（`BLINDS[i].off`），所有人看到的一樣。有人自己動過的，到下一輪前照他的；開關經多人伺服器 `{t:'b', d:{k:'blind'}}` 同步，新進的人由在場者交接；電影院的三扇（兩扇八卦窗和朝院子的窗）放映時自動放下。提示文字在 npc 的 `blind.msg`、`blind.npc`。新增窗戶若不是用上面三個函式建的，要自己 `WINDOWS.push(...)`。

- 線上書齋的傭人作息（`vr/_parts/15-staff-pages.js` 的「傭人作息」段，`staffPlan()`；時間在 `_data/vr.yml` › npc 的 `day.times`：起床、女生洗澡、男生洗澡、熄燈，預設 05:00,22:40,23:20,24:00）：起床時鬧鐘響（每個床頭櫃一個雙鈴鬧鐘，指針跟臺北時間走），玉姨、阿財走一圈收竹簾，其他人照常工作，三餐不變。洗澡：先回房拿臉盆，在置物櫃前換上浴巾（女生從腋下圍、男生圍腰），洗身處、浴缸（小毛巾放頭上）、有時進烤箱，再換回衣服回房坐在床邊。熄燈後男生（許總管、水生叔、火師、阿財）睡 22 號房、女生（玉姨、阿春、阿莉、阿荷）睡 26 號房，蓋被躺在床上；床頭櫃每床一盞小燈，上床時亮、半小時後熄、起床前再亮。床位在 `STAFF.bed`。全部依時鐘推算，不經伺服器；測試一樣用 `?meal=<分鐘>`。

- 線上書齋新增四人（`vr/_parts/15-staff-pages.js` 的「阿莉、阿荷、阿福、阿來」段；`NPCS` 裡的 li、he、fu、lai）：阿莉（Sri Rahayu，印尼，洗衣，戴頭巾、每日禮拜）、阿荷（阮氏秋荷，越南，十八歲，打掃，可以逗她：五個選項，連逗三次會去找阿春告狀）、書僮阿福（江萬福，13）與阿來（楊來，12）。四人的作息寫在 `_data/vr.yml` › npc 的 `plan.li`、`plan.he`、`plan.fu`、`plan.lai`（「05:00 禮拜、05:20 收衣…」，工作名稱見各條說明），三餐坐圓桌空位，阿莉、阿荷跟女生一起洗澡、睡 26 號房後排；書僮睡東邊一進前過水（門是玻璃木門 `dkids`；兩張小床、床頭櫃、木箱、書桌），作息 `kids.times`（05:30 起、21:30 睡），洗澡不演出、不進浴室。頭家：門口名字等於 `boss.name`（許原綸）時大家叫「頭家」（`boss.title`），畫面左下出現「喚阿福／喚阿來」，F、R 鍵也行；書僮睡了也會起來，跟在身後、進浴室或廁所時在門外等、在電影院坐前排、天黑阿來提燈籠、你坐下時可「叫阿來泡茶」，離開宅子或 30 分鐘沒動就自己回去。只認名字，不是真的鎖。
- 十位人物的設定（年紀、職務、出身、外表、個性、關係）在 `_data/vr.yml` › npc 的 `bio.<id>`（甲＝年紀與職務，乙＝介紹，一行一段），許總管的「人物簿」點名字可看。水生叔和阿財是一對（低調、宅裡都知道）；火師與阿財是好兄弟。外型參數在 `NPCS` 的 look（bald、glasses、gown、bob、round、hat:'douli'、hijab、braid、kid 等）。
- 線上書齋的對話（`vr/_parts/16-talk.js` 的「對話：閒聊、問事情、關心、吩咐」段，`talkMenu()`）：點人物先說一句（時段 `g.<id>.<dawn/morn/noon/aft/dusk/night>`、天氣 `w.<id>.<rain/hot/cold>`、對頭家 `b.<id>`），再出四類選單；問事情 `k.<id>`、今天吃什麼；關心 `praise.<id>`、`rest.<id>`、頭家對水生叔／阿財 `sup.*`；身世 `s.<id>.<n>` 一段段說，進度記在瀏覽器（localStorage `npcStory`）；吩咐（頭家限定）在 `ORDERS`。兩人碰面時的小對話 `p.<a>_<b>.<n>`（甲先說、乙回），約四分鐘一次、你在 9 公尺內才演。原本六位的額外工作在 `plan.yu`…`plan.cai`（「起-迄 工作」），其餘時間照原本的流程；可用的工作名稱在 `TASKS`。注意：人物物件上的 `look` 只代表洗澡時的樣子（null／towel／soak），外型在 `NPCS[i].look`。
- 線上書齋宅外（`vr/_parts/19-land.js` 的「宅外：稻田與寧平山水」段，`LAND`）：宅子四周是稻田（田埂、曬穀場、門前土路到渡頭可以走，`LAND.walk`；宅外的路徑沿田埂走 `__landRoute`），近處稻子是一個 InstancedMesh 隨人移動、依即時風（`WIND`）起稻浪，顏色依臺北月份（一直有稻穗）；遠處是寧平式石灰岩峰林三層（`PEAKS`、`karst()`），河（`RIVER`，CatmullRom 閉合）繞過峰林、穿峽谷與山洞；兩艘小舢舨依固定時刻表繞河（`boatState`，大家看到同一班），船靠渡頭時點船上船（座位 kind `boat`），回渡頭起身。另有荷花池、竹叢、渡頭的茄苳樹、稻草人、水車、山頂亭子、崖下小廟、農人、水牛與牧童、白鷺、山羊、夜裡螢火蟲。為了看得到遠山，相機可視距離改為 1700、霧改為 70–1000（下雨時變濃），天空球跟著人移動。文字在 npc 的 `boat.*`。
- 線上書齋宅外的新東西（`vr/_parts/19-land.js`）：河外側有一條可以走的土河堤（`LAND.LEVEE`，離河中心 16 公尺），稻田、田埂到河堤為止，河堤到河之間是草地蘆葦、河中山島不種稻（`LAND.MASK` 是俯視遮罩：noRice、levee、water，地面 shader 也用它）。茄苳樹（`qiedongTree()`）：只剩渡頭一棵（阿財在樹下砍柴；竹叢旁的五棵和五叢竹子都已清掉，`TREES.qd` 空著）；芒果樹七棵（大門外兩棵已砍掉）。大門到渡頭的木棧道兩側是成對的嵌地小圓燈（約每 4.5 公尺一對，暖色、低亮度，天黑跟燈籠一起亮，點擊說明 `pathlight`）；三合院裡面不放步道燈（`TREES.mango`，2–3 月開花、4–5 月青果、6–7 月黃熟可摘，摘下的記在瀏覽器 `hkMango`）。水牛四大一小（`HERD`，早晚在河岸吃草、11–14 點下河泡水、晚上趴在岸邊），綠頭鴨（`DUCKS`），黑面琵鷺（`SPOON`，10–4 月，3–4 月繁殖羽），蓮花池岸線不規則（`PONDS[i].edge`，5–9 月開花、其餘殘荷）。星空與宅外的雨跟著玩家走（`STAR_DOME`、`WORLD_RAIN`）。樹和石磨等新東西腳下不長稻子：`LAND.EXCL`。
- 灶腳：石磨在灶腳外石臼與柴堆之間（`MILL`，火師每天早餐前 65～40 分鐘磨豆漿）；剉冰機緊貼米缸；油炸槽嵌入檯面（`KGEAR.fryer`，有單在炸時掀蓋、炸籃下油）。阿財的一輪：渡頭打水→茄苳樹下劈柴→挑回灶腳（`caiRound()`）。
- 洗衣間在過廳西邊的前西過水（`vr/_parts/14a-laundry.js` 的「洗衣間」段，`LAUND`；後門 `LDRY.door` 通到宅後的曬衣場 `LDRY.yard`）：布草車、去漬台、送洗籃、取件架、兩台洗脫機、深水槽與給皂機、兩組雙層烘乾機、縫紉機、蒸氣燙台、摺衣台；地板是磁磚。機器上方是乾洗店那種兩排吊桿（天花板垂吊），掛滿套透明防塵袋、彩色鐵絲衣架的成衣（`InstancedMesh`，點擊說明 `ldrail`）。曬衣場的竹衣架腳是交叉在橫桿下方。阿莉的工作：洗衣、烘衣、曬衣（下雨改烘乾機）、燙衣、摺衣、縫補（`TASKS`）。訪客把衣服放進送洗籃，30 分鐘後（`LAUND_MIN`）取件架上出現貼名字的一疊，記在瀏覽器 `hkLaundry`。文字在 npc 的 `laund.*`、`li.take`，點擊說明在 texts 的 `ld*`。
- 室內門：22、26 號房、書僮房、洗衣間（前後門）、教室裝玻璃木門（`addGlassDoor()`，門洞寬 1.1 公尺以下單扇、以上雙扇）；22、26、書僮房的門在有人睡覺時自動關上、點了打不開（`door.sleep`）。茶室裝木格拉門（`DOORS.dtea`，`sdoor.msg`）。傭人走路時會自己開門（`NPC_WALK`）。
- 吃喝（`vr/_parts/04-zhiliao.js` 的「吃喝」段，`FOOD`、`heldFood()`）：手上有東西可吃喝時畫面下方出現小面板（Q 鍵也行）：冰箱飲料、爆米花、芒果、矮櫃零食、飯桌上的飯菜（開飯時坐著）、茶室的茶點（點盤子，一盤四口）。效果：茶與咖啡走路快一點（五分鐘）、吃飽慢一點（十分鐘）、天冷喝熱的「暖呼呼」、天熱吃冰的「透心涼」、甜的「好甜」，頭上冒一句大家都看得到（presence `fx`）。電影院外（二進西廂明間）有玻璃門冰箱（二十種飲料，`cine.drinks`）與爆米花機。芒果拿去給火師可做芒果冰（茶點 `mangoice`，只在 6–7 月出現在選單）。
- 傭人走路（`vr/_parts/11-npc.js` 的「getting about」段）：路線先找離牆有身體寬度的路（`GRID_CLR`），被擋住先重算、再繞到附近空地、最後趁玩家沒在看移到目的地（`npcUnstick()`）；工作地點在家具裡或有人站著時自動挪到旁邊（`npcSpotFor()`）；彼此會讓路（`npcAvoid()`）；道具只在做那件事時拿出來（掃把、澆水壺、剪刀）。
- 帳房（`vr/_parts/19a-zhang-phone.js`，`ZHANG`；放在竹簾段之前，因為用到 `STAFF`、`L8`、`MEALN`）：第一進西廂明間（電影院與教室之間）後方，許總管的木頭櫃檯（從牆到牆，靠電影院那頭一扇推門 `ZHANG.gate`，有人走近就往裡推開；正面折角框面板），檯上三角名牌（金底紅框；職稱和小字在 `desk.title` 甲乙，名字讀 `who.xu` 第一格）、老式撥盤電話、銀行燈、帳簿、算盤、服務鈴、當季插花（冬梅、春杜鵑、夏荷、秋芒），後面一張扶手椅（座位種類 `zhang`，他不在時玩家可坐）；後牆是從牆到牆的一整座木櫃，約兩公尺高（下抽屜、上玻璃門裡排滿帳本、頂上雕花橫楣，點擊說明 `zcab`），櫃子上方掛老擺鐘（台北時間，銅擺會晃，`dclock`）。許總管沒事就坐在櫃檯寫帳（椅子被玩家坐走時才回前廊看書）。電話：點了列出宅裡的人和線上訪客；工人接了可以請他到帳房（手上有事就忙完再來，睡著不接）；打給訪客是一句 40 字以內的話，對方可以接或不接，看電影的人自動勿擾（presence 多了 `pid`，訊息走 `NET.bcast` 的 `{k:'phone'}`）。帳簿記這台瀏覽器今天看到的事（來客、電影場數、冷飲、爆米花、送洗，`hkLedger`），加上本月帳目。文字在 npc 的 `desk.*`、`zhang.*`、`phone.*`、`bell.*`、`ledger.*`，點擊說明在 texts 的 `zdesk`、`zcab`、`dclock`、`dlamp`、`dvase`、`dplate`。
- 電影院外的冰箱已拿掉；玩家在電影院坐下 15 秒後，阿春端盤子走到座位旁，問要哪種飲料（二十種）或爆米花，之後 15 分鐘內不再來（記在瀏覽器 `hkCineServe`；文字 `chun.cine*`）。爆米花機在明間大門右手邊，八角窗和電影院門之間。
- 渡船頭站（第一階段）：宅院北邊（−x）第六條田埂（x≈−109）。布局在 `STN`（緊接 `TREES` 之後，供走路、地面高度、地面 shader、稻子與田埂排除用；`LAND.EXR` 是長方形排除區），房子、月台、鐵軌、隧道和站長在 `vr/_parts/19b-station.js`（`STNB`）。木造站房（結構照舊北投式的老站：雙斜屋頂、山牆圓窗、兩側深雨庇；配色照新北投車站：檜木色牆板與木框、綠色菱形魚鱗瓦屋頂、淺色圓窗框；站名牌掛在北側雨庇前緣，不會被屋簷擋住），站房在鐵軌北邊；候車室有長椅（座位 `stnb`）、售票口、時刻表、時鐘；站務室有書桌與椅子（`stnchair`）、文件櫃、路牌閉塞器；剪票口在月台側。一座月台（高 0.9 公尺）、一條窄軌（軌距 1067 公釐），東端擋車器，月台西端號誌（目前紅燈）。鐵軌往西（+z）穿過稻田（田埂交叉處是平交道）到山腳，挖一段路塹（`STN.cutH`；遠山網格在 `STN.HOLE` 挖洞，改用細網格畫路塹），石砌隧道口（扁額 `stn.tunnel`），隧道到 z=322 為止（第二階段接小鎮）。沒有土路，玩家沿 z=−8.2 那條田埂走到站前廣場。站長 `zhan`（NPCS 裡 `ext:1`，不參加宅院的作息、集合、叫人；`window.__extPlan` 排他的一天：5:30–22:30 在站裡，晚上回宿舍＝暫時隱藏，宿舍之後再蓋；站內走路用 `window.__stnRoute` 的節點圖）。文字：npc 的 `who.zhan`、`bio.zhan`、`zhan.*`、`stn.*`、`stnb.*`，點擊說明 texts 的 `stn*`。

- 線上書齋的許總管面板（`vr/_parts/17-steward.js` 的「許總管：管家面板」段）：任何地方按 X（或對許總管點「管家面板」）打開右側面板，許總管會走到身邊。分頁：報告（日期、天氣、下一餐、人手、宅況、今日來客、書僮功課 `lesson.<星期>`、本月帳目 `acct.list`）、帶路、叫人、集合、飲食、宅務、作息、待客、電影院、提醒（提醒、讀書計時、記事，只存在該瀏覽器）；訪客只看到報告、帶路、作息、提醒。帶路的地點在程式的 `PLACES`（名稱與一句介紹在 npc 的 `pl.<id>`，分區 `pl.g1`–`pl.g5`），全宅導覽順序 `TOUR`；訪客到 22、26 號房與書僮房只帶到門口（`door`），正廳與東西大房不給訪客選、導覽不去（`boss`、`notour`），但沒有鎖。集合點名、排片（開演前五分鐘閒著的人進電影院坐，時間到由在場排序第一的人開片）、今天改的一餐（菜從 `menu.alt` 選）、今晚熄燈／明早起床的臨時調整，都經多人伺服器 `{t:'b', d:{k:'house'}}` 同步，新進的人由在場者交接（`window.__houseRecv`、`__houseHello`，兩種連線的呼叫處都要有）。面板文字都在 npc 的 `h.*`。許總管每晚 22:05 巡夜（`plan.xu`，工作名稱「巡夜」）。
- 線上書齋的茶點與客飯（`vr/_parts/18-snacks-gramophone.js` 的「茶點與客飯」段）：跟阿春或在許總管面板的「飲食」點茶點（訪客也能點），許總管會差阿來／阿福／阿春去灶腳交代，火師在對應的器具前做（`KST` 是各器具的站位；灶腳新添的器具在「the new things in the kitchen」那段 `KGEAR`：瓦斯爐下的烤箱、瓦斯爐右前口的三層蒸籠、檯面的油炸鍋與電鍋、米缸旁木架上的剉冰機、屋外簷下的石臼，點擊說明在 texts 的 kg*），做好阿春連茶端到茶室，菜單在程式的 `SNK`（器具、分鐘、盤子的樣子），名稱與阿春端上時說的話在 npc 的 `snack.<id>`。點單存在 `HOUSE.orders`，時間由下單時刻推算，所有人同一刻看到茶點上桌，晚到的人也看得到；同時最多六份、上桌後 45 分鐘收走。客飯（頭家限定，2–8 位，指定時間或約八分鐘後）由火師、阿荷、阿春準備，擺在飯廳圓桌，阿春喊開飯，菜名在 `gm.menu`。
- 線上書齋過廳西北角的留聲機（`vr/_parts/18-snacks-gramophone.js` 的「過廳的留聲機」段）：點它挑唱片，唱片清單在 `_data/vr.yml` 的 `records`（title、artist、url，音樂檔放 R2，只放公有領域或有權使用的錄音），放哪一張、從何時開始經 `{k:'house'}` 同步；音量依距離遞減，瀏覽器擋自動播放時點一下畫面就會響。
- 報告分頁另有：民國／昭和／農曆（`h.cal`）、今天與七天內的節日（`fest.solar`、`fest.lunar`，除夕自動算）、網站新文章（點了用書齋的閱讀版打開；有新文章時許總管走過來會提一句）；叫人分頁有表揚與紅包（許總管宣布、本人回話 `rw.<id>`，次數記在該瀏覽器）。
- `vr/look.js`：線上書齋門口的扮相目錄（衣著、帽冠、面飾、隨身、髮型、氣質、顏色）與左側預覽圖；3D 人物在 `vr/_parts/05-looks-plan.js` 的 `buildFigure()`。新增扮相要兩邊都加，名稱另加進 `_data/vr.yml` 的 `look`。門口按「進門」才開始載入 3D，載入小故事在 `_data/vr.yml` 的 `loading`；門口文字由 `vr/gate.json` 讀取。

- `_vrserver/`：線上書齋的多人伺服器（Cloudflare Worker＋Durable Objects，專案名 hakkiuchay-vr），作用同 `server.py`：一房一台、位置與語音經伺服器轉送。放在 khoguanlun@gmail.com 的 Cloudflare 帳號（子網域 hakkiuchay.workers.dev），已連 GitHub：推上 main 後 Cloudflare 自動以 `_vrserver` 為根目錄重新發布。網址 wss://hakkiuchay-vr.hakkiuchay.workers.dev 填在 `vr/config.js` 的 `ws`；`ws` 空白時書齋改用 Supabase。

- `_notify/Code.gs`：新文章電子郵件通知（Google Apps Script，裝在 khoguanlun@gmail.com 的試算表「學鳩齋訂閱名單」裡，部署成網頁應用程式；儲存庫這份是原始碼備份，改了要貼回 Apps Script 並「管理部署作業 › 編輯 › 新版本」）。Apps Script 專案：https://script.google.com/home/projects/1HzQGQWeAU8bg-rsUT-jYxsxuA3JKgvSvLUPFbBKtTUAoSjovOqTjIvj7/edit（瀏覽器若同時登入多個 Google 帳號，khoguanlun 要是第一個登入的，否則授權視窗會開錯帳號）。名單在試算表「訂閱者」分頁，寄送紀錄在「已寄文章」。每天晚上 8～9 點（台北時間）讀一次 `/notify.json`（Jekyll 產生，含最新 20 篇與 `_data/text.yml` 的 `mail_*` 信件文字），有新文章就從齋主 Gmail 寄給已確認的訂閱者；Gmail 每天 100 封額度用完會隔天續寄；第一次執行只記下現有文章。`_config.yml` 的 `notify_url` 填網頁應用程式網址後，每頁頁底才會出現訂閱欄（`_includes/subscribe.html`，頁底右側信封圖示，點開浮出信箱欄，由 `_layouts/default.html` 的 footer 引入），確認與退訂連結導到 `/subscribe/`。網頁呼叫時不設 content-type（純文字），Apps Script 才收得到。

## 線上書齋程式分段與共編
- `vr/vr-house.js` 只是一串 `{% include_relative _parts/… %}`，GitHub Pages 建置時由 Jekyll 依序接成一個檔；程式要改 `vr/_parts/` 裡的分段（一覽在 `vr/_parts/README.md`）。每個分段第一行 `// {% raw %}`、最後一行 `// {% endraw %}` 不能刪。
- 本機測試或檢查語法：`python3 vr/_parts/build.py` 組出 `_site-vr/vr-house.js`（不進 git）並跑 `node --check`。以前用 file:// 測試頁直接載 `vr/vr-house.js` 的做法，現在要改載組好的檔。
- 齋主和朋友一起開發線上書齋，流程寫在根目錄 `CONTRIBUTING.md`：朋友在自己的分支改、開 Pull Request 合併進 main；測試時網址加 `?room=TEST-…` 進獨立房間，免得測試動作被線上的人看到。替朋友工作時也照這個流程，不要直接推 main。

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
