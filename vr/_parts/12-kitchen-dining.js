// {% raw %}
/* ================= 灶腳與飯廳（第一進東廂：南間灶腳、明間飯廳）=================
   灶腳 (x 41.92–46.56, z −4.0–4.0): the old brick stove with its steamer stays on the back (east) wall, now with a brick
   chimney through the roof and the kitchen god 司命灶君 above it, a water jar in the corner; along the south wall one
   built-in run in off-white and pale wood (a noodle station with two sunk pots, two gas rings under a hidden hood, the
   sink under the bamboo window, a tall fridge and a pantry of the same height at the end); a work table in the middle;
   against the front wall a cupboard for the bowls and a lidded rice jar under the window; terrazzo underfoot; an indigo
   curtain in the door to the 明間.
   明間 (x 36.62–41.78): the round table and four benches, three to a bench, stand in the back half so the T of the three
   doors stays clear; a painting of cabbage and radish on the back wall; a low food cupboard and a tea cabinet under the
   two front windows; a terrazzo wash basin with folded towels and a menu board by the kitchen door; a wall clock on the
   other partition; a bamboo lamp over the table.
   Meals follow Taipei time, so every visitor sees the same thing at the same moment: 火師 cooks for forty minutes,
   carries the dishes in, calls everyone, and they eat for twenty minutes; then he washes up. Menu and words: back office. */
const DINE={x:39.2,z:-2.5,r:.72,top:.77,bo:1.05,bl:1.65,bh:.46};
const KIT={x0:41.92,x1:46.56,z0:-4.0,z1:4.0, run:{x0:45.94,z0:-3.58,z1:2.66}, tall:{z0:2.7,z1:3.98}};
const MEAL_DYN=[], KGAS=[], KTAP={on:false}, KPANTRY={pv:null,open:false}, KFIRE={on:false,fl:[]}, KNOOD={on:false,bub:[]}, KBASIN={on:false}, WC={doors:[],seats:[],slides:[],spout:{on:false},incense:[],vases:[],mirror:null}, BATH={seats:[],sseats:[],wseats:[],steam:[],glows:[],lights:[],tubC:null,door:null,sdoor:null,shower:null,water:null,pour:null,mist:null,tray:null,wash:false}; var KITCHEN_STRIP=null; const NOODLE_STEAM={at:null,s:[]};
Object.assign(NP,{noodle:{x:45.62,z:1.78},hob:{x:45.62,z:-2.72},sink:{x:45.62,z:-.05},pass:{x:45.62,z:-1.6},dineDoor:{x:41.25,z:-.3},tableDrop:{x:40.62,z:-1.3}});
// click texts: back office (_data/vr.yml › texts) first, these when it is blank
for(const [key,title,body] of [
  ['cinescreen','電影院銀幕','點銀幕打開片單：選片、播放、暫停、快轉、全螢幕。誰按都算，在電影院的人看到的都一樣。'],
  ['cinespk','音響','銀幕兩側一對落地喇叭，中置喇叭和重低音藏在銀幕後面，兩側牆上四顆環繞喇叭。影片的左聲道從北邊、右聲道從南邊出來；門關上，外面就聽不到。'],
  ['cinetable','小几','深胡桃木的長方小几，兩個杯墊。冰箱在後排台座的角落。'],
  ['clsshelf','矮書櫃','窗下的矮書櫃，線裝書平放成疊，幾個藍布書套，櫃頂擱著三卷書畫。'],
  ['clsdesk','課桌','雙人課桌，桌下有放書的隔板，兩側有掛書包的銅鉤。點椅子坐下。'],
  ['clstdesk','講桌','講台中間的長講桌。點筆電開投影，點黑板寫字。'],
  ['kstove','大灶','紅磚砌的老灶，兩個灶口：大鼎上疊著竹蒸籠，另一口燒水。灶後的煙囪穿出屋頂，開伙時院子裡看得見煙。'],
  ['kzaojun','司命灶君','灶上方的小龕供著灶君，一年到頭看顧這一家的三餐。年底送神，正月初四再迎回來。'],
  ['knoodle','煮麵爐','嵌在檯面裡的煮麵爐：一池滾水、六個麵篩，長柄掛在後面的橫桿上。開伙時水氣直冒。'],
  ['ksink','水槽','窗下的水槽，老式雙把龍頭，紅熱藍冷。點龍頭開水、再點一次關水。'],
  ['krice','米缸','有木蓋的陶米缸，量米的竹筒擱在蓋上。'],
  ['kjar','水缸','老灶旁的陶水缸，水瓢浮在上面。'],
  ['dscreen','屏風・趙孟頫《雙松平遠圖》','四扇屏風，擋在通往廁所的門前。畫取自元・趙孟頫《雙松平遠圖》：近處兩株松樹、亂石，遠處平遠的山水。原作為手卷，紐約大都會藝術博物館藏（開放資料），這裡裁取松樹與遠山一段。'],
  ['bathsign','湯的木牌','暖簾旁的木牌。傭人洗澡的時候翻成「女湯」或「男湯」（女生先、男生後，時間照作息表），其他時候寫「湯」。客人隨時都可以進去。'],
  ['bedlamp','床頭燈','床頭櫃上的瓷座小燈，一人一盞。睡前亮著，熄燈後半小時關掉，起床前再亮一下。'],
  ['bathlock','置物櫃','十二格檜木置物櫃，佔滿休息區的後牆，每格一塊黃銅號碼牌和一把鎖；上方擋板後有一道暖光往下打在櫃門上。洗澡時換下的衣服就放這裡。'],
  ['bathrest','休息區','泡完、烤完擦乾後在這裡穿衣、休息。後牆是整面置物櫃。出去就從玄關右邊的門簾。'],
  ['bathin','浴室','從明間掀開「湯」字暖簾進玄關脫鞋，暖簾旁的木牌寫著現在是男湯、女湯還是一般的「湯」。左轉是脫衣間：落地的檜木洗手櫃（下面兩層放毛巾）和背光鏡；右轉是休息區，整面牆的置物櫃。玄關後面的走道通往玻璃門，門後是浴缸、洗身處和烤箱。燈都藏在天花板邊的檜木擋板後，晚上會亮一些。暖簾的「湯」字用教育部隸書。'],
  ['bathtub','檜木浴缸','大檜木浴缸，靠在前牆的窗下，角落一支檜木湯口把熱水沿木槽倒進來；缸裡四個位子，兩兩相對，靠走道那側有一階石凳，水面浮著小木盤，瓷壺裡裝的是冷水。水光淡淡映在牆上和天花板。對著水按 E（或點水面）泡進去，按方向鍵起身。'],
  ['bathsauna','烤箱','整間檜木的烤箱：條板地、上下兩層長凳。進去後點門內側的木門栓把門栓上，天花板的燈會慢慢亮成強烈的暖黃光，照滿整間，眼前也蒙上一層暖色，大約兩分鐘升到五十五度左右；門邊的溫度計和右下角都看得到溫度與時間，十二分鐘時提醒你出來休息。有人在裡面時，門上的細窗會透出黃光。'],
  ['wcf','女廁','米白牆、淺米色大地磚、淺橡木門，兩間到頂的隔間各一座免治馬桶。點拉門、隔間門開關，點馬桶或遙控器掀蓋、沖水。'],
  ['wcm','男廁','米白牆、淺米色大地磚、淺橡木門，一間小便斗、一間免治馬桶，都是到頂的隔間。'],
  ['wcvase','竹花入','一截竹筒掛在牆上，只插一枝：冬梅、春桃、夏荷、秋芒，照臺北的月份自動換。'],
  ['wcbowl','竹筒石缽','通道盡頭的洗手處：花崗石座上的石缽，一支竹管伸到缽的正上方，旁邊壁掛洗手乳，上方一面無框鏡。點竹筒出水，再點一次停；站近了鏡子照得見自己。'],
  ['kwine','醬油、麻油與醋','菜櫥旁的三罈：一罈醬油、一罈麻油、一罈烏醋，罈口包著布、用紅繩紮緊。宅裡吃蛋奶素，不用酒、不放五辛，紅燒、涼拌都靠這三罈。'],
  ['kwood','柴','劈好的乾柴堆在水缸旁，起灶火時伸手就拿得到。'],
  ['kcab','菜櫥','傳統菜櫥：上層霧面玻璃後放碗盤，中層竹條紗網透氣放剩菜醬菜，三個抽屜收筷匙，下層拉門放鍋子。'],
  ['ktall','冰箱','冰箱和乾糧櫃做成一樣高、一樣的門板，看起來是一整面櫃子。旁邊的乾糧櫃點一下就打開。'],
  ['dpaint','張熊《蔬果圖》','清・張熊《蔬果圖》，同治九年（1870）夏四月十九日作，畫紅、白蘿蔔與幾樣蔬果。國立故宮博物院藏，取自故宮開放資料。'],
  ['dbasin','洗手台','洗石子的洗手台，白瓷盆、老式黃銅龍頭。飯前洗手，毛巾摺好疊在旁邊的層板上。'],
  ['dcal','日曆','撕一頁過一天的老日曆，走臺北時間：國曆、農曆、星期，每天自動翻頁。'],
  ['kgoven','烤箱','嵌在瓦斯爐下的烤箱，白琺瑯門、深色玻璃窗。蛋撻、菠蘿包、司康、泡芙、蘋果派都從這裡出爐。'],
  ['duck','綠頭鴨','河裡的綠頭鴨，三兩成群順著水漂，不時一頭扎進水裡、屁股朝天找吃的。公鴨頭頸墨綠、白色頸環、栗色胸口；母鴨一身麻褐。船來了就讓到岸邊，晚上靠著岸邊歇息。春夏之交會有母鴨帶著一串小鴨。'],
  ['kgsteam','蒸籠','三層竹蒸籠疊在瓦斯爐上，素燒賣、水晶素餃、素叉燒包、奶黃包、馬拉糕都用它蒸。有東西在蒸的時候會冒白煙。'],
  ['kgfry','油炸鍋','檯面上的油炸鍋，油槽、炸籃、溫度旋鈕。春卷、芋角、煎堆、番薯餅、油條都靠它。'],
  ['kgpot','電鍋','檯面上的電鍋，外鍋放一杯水、按下開關，碗粿、紅豆湯圓、豆花都能蒸能熱。'],
  ['qiedong','茄苳','渡頭邊的老茄苳，樹幹直挺、紅褐色的樹皮一片片剝落，樹冠高而疏，三出的葉子淡綠。阿財常在樹下劈柴。'],
  ['spoonbill','黑面琵鷺','冬天從北方飛來水田過冬的黑面琵鷺，黑臉、湯匙一樣的長嘴，在淺水裡左右掃著嘴找魚蝦。春天要北返前，頭後長出黃色羽冠、胸前也染成淡黃。人一靠近就飛起來繞一圈。'],
  ['buffalo','水牛','黑灰色的水牛，角又寬又扁、往後彎，膝蓋以下像穿了灰襪子。早晚在河堤和河岸之間吃草，正午天熱就下河泡水，只露出頭和背；晚上趴在岸邊歇著。'],
  ['kgmill','石磨','花崗岩的老石磨，上下兩扇，木把手一轉，泡軟的黃豆從磨眼下去，磨成白漿沿著槽從嘴口流進木桶。火師每天早餐前在這裡磨豆漿。'],
  ["ldcart","布草車","三台帆布布草車：白色衣物、深色衣物、毛巾床單分開放，收衣時推著走，回來先在這裡分類。"],
  ["ldspot","去漬台","不鏽鋼的去漬台，洗之前先在這裡處理領口、袖口和污漬。台上的竹籃是客人的送洗籃。"],
  ["lddrop","送洗籃","客人的送洗籃。把衣服放進來，阿莉會收去洗，洗好摺好放在門邊的取件架。"],
  ["ldshelf","取件架","門邊的取件架，九個格子。洗好摺好的衣物放在這裡，貼著名字等人來拿。"],
  ["ldbundle","你的衣服","洗好摺好的衣服，貼著你的名字。點一下拿回去。"],
  ["ldwash","工業洗脫機","兩台前開式工業洗脫機，18 公斤與 11 公斤，洗完直接高速脫水。轉動時圓窗裡的衣服跟著翻滾。"],
  ["ldsink","深水槽","不鏽鋼深水槽和拉出式噴頭，手洗細緻衣物、先泡髒污用。"],
  ["ldpump","自動給皂機","牆上三台給皂泵：洗衣精、柔軟精、漂白劑，接管子直接打進洗衣機，每次的量都一樣。"],
  ["lddry","烘乾機","兩組上下疊的烘乾機，排風管穿牆出去。下雨天或床單毛巾多的時候用。"],
  ["ldsew","工業縫紉機","工業縫紉機和圓凳。阿莉在這裡補衣服、縫鈕扣、修毛巾邊。"],
  ["ldiron","蒸氣燙台","吸風式燙衣台配蒸氣鍋爐，熨斗一壓就冒白汽，襯衫、桌巾燙得平整。"],
  ["ldfold","摺衣台","不鏽鋼摺衣台，上面兩層架子放摺好的衣物，按人分疊。"],
  ["ldrail","吊衣架","洗好燙好的衣服套上透明防塵袋，掛在兩排吊桿上，等人來拿或送回房。"],
  ["ldplate","洗衣間","過廳西邊的過水，現在是宅裡的洗衣間，阿莉負責。"],
  ["ldyard","曬衣場","洗衣間後門外的曬衣場，兩排竹竿架在交叉的竹腳上。晴天上午阿莉把衣服晾出來，下午收；下雨就改用烘乾機。"],
  ["popcorn","爆米花機","紅色推車爆米花機，玻璃櫃裡的鍋子一直爆，電影開演前後爆得最起勁。點一下拿一桶。"],
  ["mangotree","芒果樹","宅子四周和往渡頭的木棧道邊種的芒果樹。二、三月開花，四、五月掛青果，六、七月結滿黃熟的芒果，點芒果可以摘一顆。"],
  ["mango","芒果","熟透的芒果。點一下摘下來。"],
  ["pathlight","步道燈","從大門到渡頭的木棧道兩側，一對對嵌在木板裡的小圓地燈，暖黃的光不刺眼。天黑跟著燈籠一起亮。"],
  ["zdesk","帳房櫃檯","許總管的帳房。木頭櫃檯從牆到牆，靠電影院那頭一扇推門進出；正面一格格折角框的面板，檯上是三角名牌、電話、帳簿、算盤、銀行燈和一瓶插花；後面一整面帳本櫃，上方掛著擺鐘。"],
  ["dlamp","銀行燈","綠色套料玻璃燈罩、黃銅燈座的銀行燈。許總管坐在櫃檯或天黑以後會亮。"],
  ["dvase","插花","綠色大玻璃瓶裡插著當季的花：冬天梅枝，春天杜鵑，夏天荷葉蓮蓬，秋天芒草。"],
  ["dplate","名牌","櫃檯上的三角名牌，金底紅框，寫著許總管的職稱和名字。"],
  ["zcab","帳房後櫃","從牆到牆的一整座木櫃：下面一排排抽屜，上面玻璃門裡排滿了帳本，藍布、褐布、黑布的封面，書背貼著紙籤，頂上一道雕花橫楣。"],
  ["dclock","擺鐘","帳本櫃上方的老擺鐘：深色木殼、捲雲頂飾、兩根車木柱、黃銅錶圈，下面小窗裡的銅擺一左一右地晃，走的是台北時間。"],
  ["stnhouse","渡船頭站","宅院北邊第六條田埂上的小車站。檜木色的木造站房，綠色魚鱗瓦屋頂，山牆上開著圓窗，兩邊有深深的雨庇。一座月台、一條鐵軌，鐵軌往西穿過稻田，鑽進山裡的隧道。"],
  ["stnsign","站名牌","月台上和站房門口的站名牌。"],
  ["stnboard","時刻表","候車室牆上的列車時刻表。"],
  ["stnticket","售票口","站長在裡頭賣票。"],
  ["stnoffice","站務室","站長辦公的地方：書桌、文件櫃，牆角是單線鐵路用的路牌閉塞器。"],
  ["stntoken","路牌閉塞器","單線鐵路用的閉塞器。列車出站前，站長從這裡取出路牌交給司機，確保同一段路上只有一班車。"],
  ["stngate","剪票口","進月台前，站長在這裡剪票。"],
  ["stnbuffer","擋車器","鐵軌的盡頭，紅白相間的擋車器。"],
  ["stnsignal","號誌","月台西端的號誌機。紅燈停車，綠燈出發。"],
  ["stntunnel","隧道","山腳下的石砌隧道口，扁額上刻著字。列車從這裡進山，通往另一頭。"],
  ['kgice','剉冰機','老式手搖剉冰機，鑄鐵架子、搖柄轉刀盤，冰磚刨成細雪落進碗裡，再淋黑糖、加紅豆綠豆。'],
  ['kgmortar','石臼','屋外簷下的花崗石臼和木杵。糯米蒸熟倒進臼裡，一人搗、一人翻，搗成麻糬。'],
  ['dcup','菜櫥與茶水櫃','左邊是紗門菜櫥，收剩菜和醬菜；右邊是茶水櫃，熱水瓶、茶壺和杯子，飯後喝茶。'],
]) if(!VRT[key]||!String(VRT[key].body||'').trim()) VRT[key]={key,title,body};
const MEAL_TXT={
  'meal.times':['07:00,12:00,18:00,22:00','三餐與宵夜的開飯時間（臺北時間，逗號分開）'],
  'meal.b':['早餐',''],'meal.l':['午餐',''],'meal.d':['晚餐',''],'meal.n':['宵夜',''],
  'menu.1.b':['地瓜粥、荷包蛋、醬瓜、豆腐乳、油條、燙菠菜',''],'menu.1.l':['麻醬麵、燙青菜、滷蛋豆干、紅油抄手、味噌湯',''],'menu.1.d':['白飯、香菇素滷、炒高麗菜、菜脯蛋、枸杞炒山藥、涼拌木耳、蘿蔔湯',''],
  'menu.2.b':['饅頭與花捲、豆漿、菜脯蛋、涼拌小黃瓜、麵筋、醃紅蘿蔔',''],'menu.2.l':['切仔麵、燙地瓜葉、滷海帶、炸豆包、蛋花湯',''],'menu.2.d':['白飯、三杯杏鮑菇、番茄炒蛋、炒地瓜葉、白菜滷、涼拌豆皮、玉米濃湯',''],
  'menu.3.b':['白粥、花瓜、鹹鴨蛋、素鬆、炒青江菜、豆腐乳',''],'menu.3.l':['番茄蛋麵、燙青菜、滷豆干、涼拌干絲、小菜三碟',''],'menu.3.d':['白飯、紅燒豆腐、蒸蛋、炒空心菜、彩椒炒玉米筍、滷香菇、冬瓜湯',''],
  'menu.4.b':['菜包與芋頭包、鮮奶、茶葉蛋、醬菜、蘿蔔乾',''],'menu.4.l':['炒米粉、香菇羹、燙青菜、滷蛋、醬瓜',''],'menu.4.d':['白飯、素瓜仔肉、炒小白菜、南瓜燒、滷豆干海帶、涼拌番茄、竹筍湯',''],
  'menu.5.b':['地瓜粥、土豆麵筋、醃蘿蔔、炒蛋、燙秋葵、豆腐乳',''],'menu.5.l':['番茄紅燒素麵、燙青菜、滷味拼盤、泡菜',''],'menu.5.d':['白飯、麻婆豆腐、炒豆芽、九層塔煎蛋、乾煸四季豆、紅燒烤麩、金針湯',''],
  'menu.6.b':['蛋餅、蘿蔔糕、豆漿、米漿、涼拌海帶絲、水果',''],'menu.6.l':['素炸醬麵、素餡餛飩湯、燙青菜、滷蛋、黃瓜絲',''],'menu.6.d':['白飯、宮保猴頭菇、炒龍鬚菜、金沙豆腐、涼拌白玉苦瓜、滷香菇麵筋、四神湯',''],
  'menu.7.b':['素蒸餃與燒賣、蘿蔔糕、鮮奶茶、皮蛋豆腐、炒青菜、水果',''],'menu.7.l':['米苔目、素黑白切、燙青菜、滷蛋、醃黃瓜',''],'menu.7.d':['白飯、梅干扣素肉、清炒絲瓜、番茄燴豆腐、蛋黃南瓜、炒什錦菇、紅燒素魚、蓮藕湯',''],
  'menu.n':['素陽春麵加蛋，配兩碟小菜','麵線，配兩碟小菜'],
  'wc.f':['女',''],'wc.m':['男',''],
  'act.fire':['生火','熄火'],'act.gas':['點火','關火'],'act.tap':['開水','關水'],'act.noodle':['煮麵爐加熱','煮麵爐關掉'],'act.basin':['開水','關水'],
  'act.door':['門開了','門關上（有人）'],'act.seat':['馬桶蓋掀起：沖洗、烘乾','沖水，蓋子闔上'],'act.spout':['竹筒出水','水停了'],'act.slide':['拉門拉開','拉門關上'],'act.flush':['沖水',''],'act.urinal':['感應沖水',''],'wc.seat':['馬桶',''],'bath.seat':['浴缸',''],'bath.full':['浴缸四個位子都有人了，等一下再來。',''],'wash.seat':['洗身處',''],'wash.hello':['坐下洗身。',''],'sauna.seat':['烤箱',''],'bath.hello':['泡進檜木浴缸。',''],'sauna.hello':['在烤箱坐下，沙漏開始走。',''],'bath.status':['在浴室',''],'act.shower':['淋浴出水','淋浴關水'],'act.wash':['水龍頭打開','水龍頭關上'],'act.bdoor':['玻璃門拉開','玻璃門關上'],'act.sdoor':['烤箱門打開','烤箱門關上'],'wc.hello':['坐下了，門已關上。',''],'wc.status':['在廁所',''],
  'cal.head':['學鳩齋',''],'cal.foot':['學鳩齋','hakkiuchay.space'],
  'dine.title':['飯桌',''],'dine.intro':['圓桌配四條長凳，一條坐三人。開飯時空位都可以坐，按 E 或點長凳入座。宅裡吃蛋奶素，不用酒、不放五辛。',''],
  'dine.next':['下一餐：{餐}　{時間}',''],'dine.now':['正在吃{餐}',''],'dine.today':['今日菜單',''],
  'dine.hello':['在飯桌坐下。',''],'dine.status':['在明間吃飯',''],'dine.host':['齋主座',''],
  'huo.call':['吃飯囉！菜上桌了，趁熱。','開飯了，大家來坐。'],
  'huo.bowl':['來，我給您添一碗，慢慢吃。','您坐，飯我替您盛好了。'],
  'huo.cooking':['正在備{餐}，再等一下就好。','火正旺，{餐}快好了。'],
  'huo.wash':['碗我來洗，您坐著喝茶。','洗完這疊就收工。'],
  'mchat.xu':['這菜脯蛋煎得好，邊邊有點焦才香。','下午還有客人來吃茶，阿春記得備水。'],
  'mchat.yu':['今早門口的落葉特別多，掃了三遍。','火師，這湯再給我半碗。'],
  'mchat.chun':['等一下我把茶點的盤子也洗一洗。','這豆腐燒得入味，我多夾一塊。'],
  'mchat.shui':['含笑這幾天要開了，你們有空去聞聞。','雨若再不下，花圃又要多澆一趟水。'],
  'mchat.cai':['柴房的柴快見底了，明天再劈一些。','我吃快一點，水缸還沒挑滿。'],
  'mchat.huo':['明天的菜我想換個做法，大家吃吃看。','鍋裡還有，誰要再添？'],
};
for(const e of (Array.isArray(VRD.npc)?VRD.npc:[])) if(e&&e.key&&MEAL_TXT[e.key]){ const d=MEAL_TXT[e.key]; MEAL_TXT[e.key]=[String(e.a||'').trim()||d[0],String(e.b||'').trim()||d[1]]; }
Object.assign(NPC_TXT,MEAL_TXT);
// the time in Taipei; ?meal=+35 (minutes) in the address shifts it, to see a meal without waiting for one
const MEAL_SHIFT=(()=>{ const m=/[?&]meal=([+-]?\d+)/.exec(location.search); return m?+m[1]:0; })();
function taipeiNow(){ const d=new Date(Date.now()+MEAL_SHIFT*60000), s=d.toLocaleString('sv',{timeZone:'Asia/Taipei'}); const [D,T]=s.split(' '), [h,mi,se]=T.split(':').map(Number);
  const dow=new Date(D+'T00:00:00Z').getUTCDay(); return {day:D,dow:dow||7,min:h*60+mi+se/60}; }
const MEALS=(()=>{ const t=String(NT('meal.times')).split(/[,，、\s]+/).map(s=>{ const m=/^(\d{1,2})[:：](\d{2})$/.exec(s.trim()); return m?+m[1]*60+ +m[2]:null; });
  const def=[420,720,1080,1320]; return ['b','l','d','n'].map((k,i)=>({k,at:t[i]!=null?t[i]:def[i],eat:k==='n'?15:20})); })();
// the household's day (back office: day.times = getting up, the women's bath, the men's bath, lights out)
const DAY=(()=>{ const t=String(NT('day.times')).split(/[,，、\s]+/).map(s=>{ const m=/^(\d{1,2})[:：](\d{2})$/.exec(s.trim()); return m?+m[1]*60+ +m[2]:null; });
  const def=[300,1360,1400,1440], v=[0,1,2,3].map(i=>t[i]!=null?t[i]:def[i]); return {wake:v[0],wf:v[1],wm:v[2],sleep:v[3]%1440||1440}; })();
const dayMin=()=>taipeiNow().min;
const asleepAt=m=>DAY.sleep<=1440?(m<DAY.wake||(DAY.sleep<1440&&m>=DAY.sleep)):(m>=DAY.sleep-1440&&m<DAY.wake);   // a night moved past midnight by the steward
// which bath it is by the noren: the women's from a quarter of an hour before their time, the men's after
const bathSlot=m=>m>=DAY.wf-15&&m<DAY.wm?'f':m>=DAY.wm&&(DAY.sleep>=1440?m<1440:m<DAY.sleep)?'m':'';
// where the house is in its meals now: cook (40 min before) → serve (10 min before) → eat → clear (10 min)
function mealState(){ const T=taipeiNow(); for(const M of MEALS){ const r=T.min-M.at;
    if(r>=-40&&r<M.eat+10){ const phase=r<-10?'cook':r<0?'serve':r<M.eat?'eat':'clear'; return {k:M.k,phase,r,id:T.day+M.k,dow:T.dow,endMs:Date.now()+(M.eat-r)*60000,T}; } }
  return {k:null,phase:null,T}; }
function menuOf(dow,k){ return k==='n'?NT('menu.n',dow%2):NT('menu.'+dow+'.'+k); }
function nextMeal(){ const T=taipeiNow(); for(const M of MEALS) if(M.at+M.eat>T.min) return M; return MEALS[0]; }
const hhmm=m=>String(Math.floor(m/60)).padStart(2,'0')+':'+String(Math.round(m%60)).padStart(2,'0');

const SOFT_TEX=textCanvas(64,64,(g,w,h)=>{ const r=g.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2); r.addColorStop(0,'rgba(255,255,255,1)'); r.addColorStop(.45,'rgba(255,255,255,.55)'); r.addColorStop(1,'rgba(255,255,255,0)'); g.clearRect(0,0,w,h); g.fillStyle=r; g.fillRect(0,0,w,h); });
const FLAME_TEX=textCanvas(64,128,(g,w,h)=>{ g.clearRect(0,0,w,h); const r=g.createRadialGradient(w/2,h*.78,2,w/2,h*.7,h*.62); r.addColorStop(0,'rgba(255,248,200,1)'); r.addColorStop(.25,'rgba(255,200,80,.95)'); r.addColorStop(.55,'rgba(255,110,30,.7)'); r.addColorStop(1,'rgba(200,40,10,0)');
  g.fillStyle=r; g.beginPath(); g.moveTo(w/2,4); g.bezierCurveTo(w*.95,h*.45,w*.95,h*.95,w/2,h-2); g.bezierCurveTo(w*.05,h*.95,w*.05,h*.45,w/2,4); g.fill(); });
for(const sp of (NPCP.steam||[])) sp.material.map=SOFT_TEX;
{ // ------------------------------------------------------------ materials
  const mat=(c,r=.8,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:r,...o});
  const tex=(w,h,draw,rep)=>{ const t=textCanvas(w,h,draw); if(rep){ t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(...rep); } return t; };
  const speck=(base,dots,n)=>(g,w,h)=>{ g.fillStyle=base; g.fillRect(0,0,w,h); let s=7; const r=()=>((s=s*16807%2147483647)/2147483647); for(let i=0;i<n;i++){ g.fillStyle=dots[Math.floor(r()*dots.length)]; const d=1+r()*3.2; g.fillRect(r()*w,r()*h,d,d*(.6+r()*.8)); } };
  const terrazzo=mat(0xffffff,.55,{map:tex(512,512,speck('#9c9a94',['#6f6c66','#d8d4cb','#c9c3b6','#4f4c48','#b8a993','#e9e5dc'],9000),[3,5])});
  const washStone=mat(0xffffff,.7,{map:tex(256,256,speck('#b7b3aa',['#8d8880','#e2ded4','#6f6b64','#a59d8f'],5000),[1,1])});
  const door=mat(0xede6d8,.55), carcass=mat(0xe3dccd,.6), worktop=mat(0xd6b78e,.45), seam=mat(0x9d9587,.7);
  const steel=mat(0xc9ccce,.32,{metalness:.75}), steelDark=mat(0x8c9093,.35,{metalness:.7}), glassBlack=mat(0x161617,.12,{metalness:.2}), iron=mat(0x2a2827,.5,{metalness:.55});
  const water=mat(0x6d7c80,.08,{metalness:.1,transparent:true,opacity:.85}), brass=mat(0xb5945b,.32,{metalness:.8}), clay=mat(0x6f4430,.62), clayDark=mat(0x4c2f22,.6);
  const tile=mat(0xffffff,.25,{map:tex(256,256,(g,w,h)=>{ g.fillStyle='#bdb8ae'; g.fillRect(0,0,w,h); const n=8, c=w/n; for(let i=0;i<n;i++) for(let j=0;j<n;j++){ const v=242-((i*7+j*3)%5); g.fillStyle=`rgb(${v},${v-2},${v-6})`; g.fillRect(i*c+1.5,j*c+1.5,c-3,c-3); } },[8,1])});
  const wood=mat(0xffffff,.6,{map:T.cypress,color:0xd7b48c}), woodDk=mat(0xffffff,.55,{map:T.cypressDark||T.cypress,color:0x8f6a4c}), bamboo=mat(0xc2a66a,.75), bambooDk=mat(0x9a7f4a,.75);
  const brickM=mBrick(1.2,.9), plaster=mat(0xdcd3c3,.95), red=mat(0xa8343a,.8), indigo=mat(0xffffff,.95,{side:THREE.DoubleSide,map:tex(256,256,(g,w,h)=>{ g.fillStyle='#26364f'; g.fillRect(0,0,w,h); g.fillStyle='rgba(255,255,255,.04)'; for(let y=0;y<h;y+=4) g.fillRect(0,y,w,1); g.fillStyle='rgba(236,231,219,.9)'; g.fillRect(0,h-14,w,5); g.strokeStyle='rgba(236,231,219,.9)'; g.lineWidth=5; g.beginPath(); g.arc(w/2,h*.58,22,0,Math.PI*2); g.stroke(); })});
  const porcelain=mat(0xf7f4ee,.2), rim=mat(0x2f4f86,.3), lacquer=mat(0x3a2418,.4);
  const P=(o,pick)=>{ if(pick){ o.traverse?o.traverse(c=>{ if(c.isMesh){ c.userData=pick; pickables.push(c); } }):0; } return o; };
  const B=(w,h,d,m,x,y,z,p=scene,pick=null)=>{ const o=box(w,h,d,m,x,y,z,p,pick); o.castShadow=o.receiveShadow=true; return o; };
  const C=(r1,r2,h,m,x,y,z,p=scene,seg=20,pick=null)=>{ const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,seg),m); o.position.set(x,y,z); o.castShadow=true; p.add(o); if(pick){ o.userData=pick; pickables.push(o); } return o; };
  const L=(pts,m,x,y,z,p=scene,pick=null)=>{ const o=lathe(pts,m,24); o.position.set(x,y,z); o.castShadow=true; p.add(o); if(pick){ o.userData=pick; pickables.push(o); } return o; };
  const plane=(w,h,m,x,y,z,ry,p=scene,pick=null)=>{ const o=new THREE.Mesh(new THREE.PlaneGeometry(w,h),m); o.position.set(x,y,z); o.rotation.y=ry; p.add(o); if(pick){ o.userData=pick; pickables.push(o); } return o; };

  // ------------------------------------------------------------ 灶腳
  B(KIT.x1-KIT.x0,.012,KIT.z1-KIT.z0,terrazzo,(KIT.x0+KIT.x1)/2,.006,0).userData={type:'floor'};
  // the chimney in the south-east corner, the stove against it; the kitchen god high above the steamer, three sticks of incense
  { const tag={type:'kstove'}; B(.62,6.7,.42,brickM,46.25,3.35,-3.79,scene,tag); B(.72,.08,.52,plaster,46.25,6.72,-3.79); OB(45.94,46.56,-4.0,-3.58);
    const zx=NP.stove.x-.45, zj={type:'kzaojun'}; B(.5,.62,.06,lacquer,zx,2.22,-3.97,scene,zj);
    plane(.36,.48,mat(0xffffff,.85,{map:textCanvas(160,210,(g,w,h)=>{ g.fillStyle='#b8322f'; g.fillRect(0,0,w,h); g.strokeStyle='#e0b75e'; g.lineWidth=4; g.strokeRect(8,8,w-16,h-16); g.fillStyle='#f0d27a'; g.font=F('700',34); vtext(g,'司命灶君',w/2,24,34,h-10); })}),zx,2.24,-3.935,0,scene,zj);
    B(.4,.03,.04,lacquer,zx,2.55,-3.93,scene,zj); for(const s of [-1,1]) B(.03,.62,.03,mat(0xc89b45,.4,{metalness:.5}),zx+s*.235,2.22,-3.935);
    B(.52,.04,.18,lacquer,zx,1.86,-3.9,scene,zj); L([[0,0],[.045,0],[.06,.045],[.055,.065],[.05,.07]],brass,zx,1.88,-3.88,scene,zj);
    for(const [dx,lean] of [[-.022,-.12],[0,0],[.022,.12]]){ const st=C(.0025,.0025,.2,mat(0xa8343a,.8),zx+dx+lean*.1,2.04,-3.88,scene,4); st.rotation.z=-lean;
      const tip=new THREE.Mesh(new THREE.SphereGeometry(.005,6,4),mat(0xff7a2a,.5,{emissive:0xff6a1a,emissiveIntensity:1.2})); tip.position.set(zx+dx+lean*.22,2.14,-3.88); scene.add(tip); } }
  // the fire in the stove: logs in each mouth, flames that lick out, an ember glow; click the mouth to light or bank it
  { const S=NP.stove, fm=new THREE.MeshBasicMaterial({map:FLAME_TEX,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}), em=new THREE.MeshBasicMaterial({color:0xff5a1a,transparent:true,opacity:.0,blending:THREE.AdditiveBlending,depthWrite:false});
    for(const dx of [-.5,.45]){ const tag={type:'kfire'}, mx=S.x+dx;
      const hit=new THREE.Mesh(new THREE.CircleGeometry(.14,16),new THREE.MeshBasicMaterial({visible:false})); hit.position.set(mx,.26,-3.31); scene.add(hit); hit.userData=tag; pickables.push(hit); MEAL_DYN.push(hit);
      for(const [ox,oy,rz] of [[-.04,-.07,.25],[.04,-.06,-.3],[0,-.09,0]]){ const lg=C(.022,.026,.24,mat(0x3a2418,.9),mx+ox,.26+oy,-3.38,scene,7); lg.rotation.x=Math.PI/2; lg.rotation.y=rz; const e=new THREE.Mesh(new THREE.CircleGeometry(.022,7),mat(0x2a160c,.9,{emissive:0xff4a10,emissiveIntensity:0})); e.position.set(mx+ox,.26+oy,-3.259); scene.add(e); KFIRE.fl.push({end:e}); MEAL_DYN.push(e); }
      const glow=new THREE.Mesh(new THREE.CircleGeometry(.12,20),em.clone()); glow.position.set(mx,.26,-3.312); scene.add(glow); KFIRE.fl.push({glow}); MEAL_DYN.push(glow);
      for(let i=0;i<4;i++){ const f=new THREE.Mesh(new THREE.PlaneGeometry(.09,.16),fm); f.position.set(mx+(i-1.5)*.045,.27,-3.3+i*.002); scene.add(f); f.visible=false; KFIRE.fl.push({f,ph:i*1.7,base:.27}); MEAL_DYN.push(f); } } }
  // water jar with a lid and a gourd ladle; split firewood stacked beside it
  { const tag={type:'kjar'}; L([[0,0],[.22,0],[.31,.22],[.32,.42],[.27,.62],[.25,.66]],clay,42.38,0,-3.6,scene,tag); C(.27,.27,.03,wood,42.38,.68,-3.6,scene,24,tag);
    L([[0,0],[.06,.0],[.09,.05],[.085,.08]],mat(0xc8a35e,.7),42.3,.7,-3.55,scene,tag); const h=C(.012,.012,.32,mat(0xc8a35e,.7),42.48,.72,-3.52,scene,6,tag); h.rotation.z=Math.PI/2.3;
    OB(42.05,42.7,-3.95,-3.25);
    const log=mat(0x8a6a48,.85), end=mat(0xc9a77a,.8), wt={type:'kwood'};
    for(let r=0;r<4;r++) for(let i=0;i<7-r;i++){ const x=42.86+i*.13+r*.065+(r%2?.01:0), y=.055+r*.098, z=-3.74;
      const lg=C(.05+((i*7+r)%3)*.006,.052,.42,log,x,y,z,scene,7,wt); lg.rotation.x=Math.PI/2; const e=new THREE.Mesh(new THREE.CircleGeometry(.048,7),end); e.position.set(x,y,z+.211); scene.add(e); }
    OB(42.8,43.85,-3.97,-3.5); }
  // tools on a rail on the back wall above the wood: ladle, slotted spoon, spatula, strainer, a bamboo brush, a ladle of gourd
  const utensil=(kind,p)=>{ const g=new THREE.Group(); p.add(g); const hk=new THREE.Mesh(new THREE.TorusGeometry(.014,.003,5,10,Math.PI*1.4),steel); hk.rotation.y=Math.PI/2; g.add(hk);
    const handle=(len,m=woodDk,r=.011)=>{ const h=C(r,r*.9,len,m,0,-.03-len/2,0,g,8); return -.03-len; };
    if(kind==='ladle'){ const y=handle(.3,steel,.006); L([[0,-.05],[.045,-.04],[.055,0]],steel,0,y-.0,0,g); }
    if(kind==='slot'){ const y=handle(.26,woodDk); const s=new THREE.Mesh(new THREE.CircleGeometry(.055,16),steelDark); s.position.set(0,y-.05,.004); g.add(s); for(let i=0;i<6;i++){ const d=new THREE.Mesh(new THREE.CircleGeometry(.007,6),iron); d.position.set(Math.cos(i)*.028,y-.05+Math.sin(i)*.028,.006); g.add(d); } }
    if(kind==='spatula'){ const y=handle(.24,woodDk); B(.085,.1,.004,steelDark,0,y-.055,0,g); }
    if(kind==='strainer'){ const y=handle(.3,bamboo,.008); L([[0,-.03],[.05,-.02],[.065,.01]],mat(0x9c9fa1,.5,{metalness:.5,side:THREE.DoubleSide}),0,y,0,g); }
    if(kind==='brush'){ const y=handle(.08,bamboo,.014); for(let i=0;i<14;i++){ const b=C(.0025,.0025,.16,bambooDk,Math.cos(i)*.01,y-.08,Math.sin(i)*.01,g,3); b.rotation.z=(i%3-1)*.06; } }
    if(kind==='gourd'){ const y=handle(.18,mat(0xc8a35e,.7),.012); L([[0,-.06],[.05,-.05],[.06,-.02],[.055,0]],mat(0xc8a35e,.7,{side:THREE.DoubleSide}),0,y,0,g); }
    if(kind==='chop'){ const y=handle(.12,bamboo,.004); C(.03,.03,.16,bamboo,0,y-.06,0,g,10); }
    return g; };

  // the built-in run along the south wall, from the chimney to the tall cupboards: base cabinets, one worktop, white tiles,
  // wall cabinets with the hood in them; two gas rings that can be lit, the sink with an old two-handled tap that runs,
  // and the noodle cooker sunk into the worktop at the far end (six baskets in a steaming well)
  { const R=KIT.run, x0=R.x0, xw=46.56, d=xw-x0, cx=(x0+xw)/2, zL=R.z1-R.z0, zc=(R.z0+R.z1)/2;
    B(d-.06,.1,zL,mat(0x6e6a64,.8),cx+.03,.05,zc); B(d-.02,.76,zL,carcass,cx+.01,.1+.38,zc);
    const doorsAt=[R.z0,-2.94,-2.3,-1.66,-1.02,-.36,.36,.96,1.56,2.11,R.z1];
    for(let i=0;i<doorsAt.length-1;i++){ const a=doorsAt[i]+.004, b=doorsAt[i+1]-.004; B(.02,.72,b-a,door,x0-.005,.5,(a+b)/2); if(!(a>.95&&b<2.2)) B(.012,.012,.16,steel,x0-.03,.8,(a+b)/2); }
    B(d+.03,.04,zL+.02,worktop,cx-.015,.88,zc); B(.004,.6,zL,tile,xw-.002,1.2,zc);
    const uppers=[[R.z0,-1.02],[1.02,R.z1]]; for(const [a,b] of uppers){ B(.35,.72,b-a,door,xw-.175,1.94,(a+b)/2); for(let z=a+.6;z<b-.05;z+=.6) B(.004,.7,.004,seam,xw-.352,1.94,z); }
    for(const [a,b] of [[-3.2,-2.25],[1.05,2.55]]) B(.36,.03,b-a,glassBlack,xw-.18,1.565,(a+b)/2);    // the hood's intake over the rings and the noodles
    const strip=mat(0xfff0d0,.6,{emissive:0xffd9a0,emissiveIntensity:0}); B(.03,.01,1.6,strip,xw-.33,1.572,1.84); B(.03,.01,2.5,strip,xw-.33,1.572,-2.3); KITCHEN_STRIP=strip;
    OB(x0,xw,R.z0,R.z1);
    // the gas stove: an old white enamel top with four burners in round wells, cast-iron star grates; turn a knob to light it
    { const hx=x0+.29, hz=-2.72, enamel=mat(0xf4f1ea,.25), wellM=mat(0xece8de,.3,{side:THREE.DoubleSide}), castI=mat(0x3a3836,.6,{metalness:.4});
      B(.6,.02,.86,enamel,hx,.91,hz,scene,{type:'kgas',i:0}); B(.006,.022,.86,mat(0xd9d5cc,.4),hx,.912,hz);
      const flameM=new THREE.MeshBasicMaterial({color:0x4a8cff,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false}), coreM=new THREE.MeshBasicMaterial({color:0x9cc8ff,transparent:true,opacity:.7,blending:THREE.AdditiveBlending,depthWrite:false});
      [[-.13,-.2],[.13,-.2],[-.13,.2],[.13,.2]].forEach(([dx,dz],i)=>{ const tag={type:'kgas',i}, bx=hx+dx, bz=hz+dz;
        L([[0,-.012],[.06,-.01],[.11,.0],[.125,.004]],wellM,bx,.92,bz,scene,tag); const rr=new THREE.Mesh(new THREE.TorusGeometry(.125,.004,5,32),enamel); rr.rotation.x=Math.PI/2; rr.position.set(bx,.924,bz); scene.add(rr);
        C(.05,.055,.02,mat(0x2a2827,.5,{metalness:.5}),bx,.918,bz,scene,16,tag); C(.032,.032,.012,mat(0xb8b4ac,.4,{metalness:.6}),bx,.932,bz,scene,16,tag); C(.012,.012,.012,mat(0xb8b4ac,.4,{metalness:.6}),bx,.942,bz,scene,10);
        const hex=new THREE.Mesh(new THREE.TorusGeometry(.055,.007,4,6),castI); hex.rotation.x=Math.PI/2; hex.position.set(bx,.965,bz); scene.add(hex);
        for(let k=0;k<6;k++){ const a=k*Math.PI/3+Math.PI/6, sp=B(.075,.011,.011,castI,bx+Math.cos(a)*.092,.965,bz+Math.sin(a)*.092,scene,tag); sp.rotation.y=-a; const ft=B(.011,.04,.011,castI,bx+Math.cos(a)*.128,.947,bz+Math.sin(a)*.128); }
        const fl=new THREE.Group(); fl.position.set(bx,.935,bz); scene.add(fl);
        for(let k=0;k<18;k++){ const a=k/18*Math.PI*2, c=new THREE.Mesh(new THREE.ConeGeometry(.008,.05,5),flameM); c.position.set(Math.cos(a)*.05,.022,Math.sin(a)*.05); c.rotation.z=-Math.cos(a)*.35; c.rotation.x=Math.sin(a)*.35; fl.add(c);
          const cc=new THREE.Mesh(new THREE.ConeGeometry(.004,.022,4),coreM); cc.position.set(Math.cos(a)*.048,.012,Math.sin(a)*.048); fl.add(cc); }
        const gl=new THREE.PointLight(0x6aa0ff,0,.9,2); gl.position.set(0,.06,0); fl.add(gl); fl.userData.light=gl;
        fl.visible=false; MEAL_DYN.push(fl); KGAS.push({fl,on:false});
        const kn=L([[0,0],[.024,0],[.022,.02],[.012,.03]],mat(0xf1ede4,.3),x0-.012,.8,hz+(i-1.5)*.17,scene,tag); kn.rotation.z=Math.PI/2; B(.008,.03,.006,mat(0xf1ede4,.3),x0-.04,.8,hz+(i-1.5)*.17,scene,tag); });
      // an iron wok resting on one ring, a steel pot on another
      L([[0,0],[.1,.01],[.16,.05],[.17,.065]],mat(0x232120,.45,{metalness:.5,side:THREE.DoubleSide}),hx-.13,.972,hz-.2); const wh=C(.011,.011,.17,woodDk,hx-.13,1.02,hz-.2-.24,scene,8); wh.rotation.x=Math.PI/2.4;
      L([[0,0],[.09,0],[.095,.13],[.1,.135]],mat(0xc9ccce,.25,{metalness:.8,side:THREE.DoubleSide}),hx+.13,.972,hz+.2); C(.1,.1,.01,mat(0xc9ccce,.25,{metalness:.8}),hx+.13,1.11,hz+.2); C(.015,.015,.025,woodDk,hx+.13,1.125,hz+.2,scene,8); }
    // the sink under the window and an old bridge tap: two cross handles, a swan spout; it runs when you turn it
    { const tag={type:'ktap'}; B(.42,.006,.7,steel,x0+.27,.903,0,scene,tag); B(.36,.004,.62,mat(0x9aa0a3,.3,{metalness:.6}),x0+.27,.907,0,scene,tag); C(.02,.02,.003,iron,x0+.27,.91,.15,scene,12);
      const tx=xw-.09; for(const s of [-1,1]){ C(.013,.016,.2,steel,tx,1.0,s*.12,scene,10,tag); C(.017,.017,.03,steel,tx,1.115,s*.12,scene,10,tag);
        for(let k=0;k<2;k++){ const arm=B(.09,.012,.012,steel,tx,1.135,s*.12,scene,tag); arm.rotation.y=k*Math.PI/2+.4; } const nb=new THREE.Mesh(new THREE.SphereGeometry(.013,8,6),steel); nb.position.set(tx,1.145,s*.12); scene.add(nb);
        const cap=new THREE.Mesh(new THREE.CircleGeometry(.009,10),mat(s<0?0x2f5fa8:0xa8343a,.4)); cap.position.set(tx,1.159,s*.12); cap.rotation.x=-Math.PI/2; scene.add(cap); }
      const br=C(.012,.012,.24,steel,tx,1.07,0,scene,10,tag); br.rotation.x=Math.PI/2;
      const neck=new THREE.Mesh(new THREE.TorusGeometry(.09,.011,8,20,Math.PI),steel); neck.position.set(tx-.09,1.07,0); scene.add(neck); neck.userData=tag; pickables.push(neck);
      C(.012,.01,.04,steel,tx-.18,1.05,0,scene,10,tag);
      const wM=new THREE.MeshStandardMaterial({color:0xeaf4f8,roughness:.05,metalness:.1,transparent:true,opacity:.8,emissive:0x8aa8b8,emissiveIntensity:.25}), sl=1.03-.907;
      const stream=new THREE.Mesh(new THREE.CylinderGeometry(.008,.011,sl,8,1,true),wM); stream.position.set(tx-.18,.907+sl/2,0); stream.visible=false; scene.add(stream);
      const splash=new THREE.Group(); splash.position.set(tx-.18,.91,0); scene.add(splash); splash.visible=false;
      const ring=new THREE.Mesh(new THREE.RingGeometry(.012,.05,20),new THREE.MeshBasicMaterial({color:0xeef6f8,transparent:true,opacity:.5,depthWrite:false})); ring.rotation.x=-Math.PI/2; splash.add(ring);
      for(let k=0;k<8;k++){ const d=new THREE.Mesh(new THREE.SphereGeometry(.004,5,4),wM); splash.add(d); } KTAP.stream=stream; KTAP.splash=splash; MEAL_DYN.push(stream,splash); }
    // on the wall over the worktop: a rail of ladles and spatulas, a knife rack, two chopping boards hanging on hooks
    { const wx=xw-.004, rail=C(.007,.007,.62,steel,wx-.035,1.5,-2.02,scene,8); rail.rotation.x=Math.PI/2; for(const z of [-2.31,-1.73]) B(.035,.03,.02,steel,wx-.017,1.5,z);
      ['ladle','slot','spatula','strainer','gourd'].forEach((k,i)=>{ const u=utensil(k,scene); u.position.set(wx-.035,1.5,-2.26+i*.12); u.rotation.y=-Math.PI/2; });
      B(.03,.05,.5,woodDk,wx-.015,1.5,-1.37);
      for(const [z,kind] of [[-1.55,'cleaver'],[-1.4,'slicer'],[-1.27,'slicer'],[-1.17,'small']]){ const g=new THREE.Group(); g.position.set(wx-.04,1.5,z); scene.add(g);
        const bl=kind==='cleaver'?[.004,.1,.2]:kind==='small'?[.003,.03,.11]:[.003,.045,.2]; const blade=B(bl[0],bl[2],bl[1],mat(0xd0d4d6,.2,{metalness:.85}),0,-.03-bl[2]/2,0,g); C(.012,.014,.12,woodDk,0,.06,0,g,8); }
      const bd=new THREE.Mesh(new THREE.CylinderGeometry(.17,.17,.04,28),mat(0xc9a676,.7)); bd.rotation.z=Math.PI/2; bd.position.set(wx-.025,1.16,-1.82); scene.add(bd); C(.01,.01,.002,iron,wx-.004,1.32,-1.82,scene,6);
      B(.025,.34,.22,mat(0xd9c39c,.7),wx-.016,1.12,-1.05); const ho=new THREE.Mesh(new THREE.TorusGeometry(.016,.004,5,10),iron); ho.position.set(wx-.02,1.3,-1.05); ho.rotation.y=Math.PI/2; scene.add(ho); }
    // the noodle cooker: a steel well sunk in the worktop, six baskets in two rows, long black handles hooked to a rail at the back
    { const tag={type:'knoodle'}, nz=1.78, nx=x0+.29;
      B(.52,.014,1.44,steel,nx,.903,nz,scene,tag); B(.44,.004,1.34,mat(0x3c4245,.3,{metalness:.6}),nx,.908,nz,scene,tag);
      const wm=mat(0xb4c2c4,.05,{transparent:true,opacity:.55}); B(.42,.002,1.3,wm,nx,.912,nz,scene,tag);
      C(.006,.006,1.3,steel,xw-.05,1.08,nz,scene,8).rotation.x=Math.PI/2; for(const z of [nz-.66,nz+.66]) B(.04,.18,.02,steel,xw-.05,.99,z);
      const net=mat(0xb8bcbe,.4,{metalness:.6,side:THREE.DoubleSide}), blk=mat(0x151515,.5);
      for(const dx of [-.1,.1]) for(const dz of [-.43,0,.43]){ const g=new THREE.Group(); g.position.set(nx+dx,.95,nz+dz); scene.add(g);
        const rim=new THREE.Mesh(new THREE.TorusGeometry(.08,.005,6,20),steel); rim.rotation.x=Math.PI/2; g.add(rim); L([[.08,0],[.075,-.08],[.04,-.12],[0,-.125]],net,0,0,0,g,tag);
        const h=C(.006,.006,.34,blk,.0,.0,0,g,6,tag); h.position.set(.055+(dx<0?.1:0),.15,0); h.rotation.z=-.35; const hk=new THREE.Mesh(new THREE.TorusGeometry(.015,.004,5,10,Math.PI),steel); hk.position.set(.12+(dx<0?.1:0),.32,0); g.add(hk); }
      for(const z of [nz-.45,nz,nz+.45]){ const k=C(.022,.022,.03,mat(0x1c1c1c,.4),x0-.02,.78,z,scene,14,tag); k.rotation.z=Math.PI/2; const lamp=new THREE.Mesh(new THREE.CircleGeometry(.006,8),mat(0x3a8a3a,.4,{emissive:0x2a8a2a,emissiveIntensity:.6})); lamp.position.set(x0-.016,.84,z); lamp.rotation.y=-Math.PI/2; scene.add(lamp); }
      B(.01,.06,1.44,mat(0x9a2a2a,.5),x0-.012,.7,nz);
      const bm=new THREE.MeshBasicMaterial({color:0xf4fbfc,transparent:true,opacity:.75,depthWrite:false});
      for(let i=0;i<36;i++){ const b=new THREE.Mesh(new THREE.SphereGeometry(.013,6,4),bm); b.position.set(nx+(((i*37)%17)/17-.5)*.38,.914,nz+(((i*53)%29)/29-.5)*1.24); b.visible=false; scene.add(b); KNOOD.bub.push({b,ph:i*.37}); MEAL_DYN.push(b); }
      for(const z of [nz-.45,nz,nz+.45]){ const h=new THREE.Mesh(new THREE.BoxGeometry(.05,.06,.06),new THREE.MeshBasicMaterial({visible:false})); h.position.set(x0-.03,.78,z); h.userData={type:'knood'}; scene.add(h); pickables.push(h); MEAL_DYN.push(h); }
      NOODLE_STEAM.at={x:nx,y:.93,z:nz}; } }
  // fridge and pantry: same height, same doors as the run; the pantry opens (click it) on four shelves of dry goods
  { const tag={type:'ktall'}, T2=KIT.tall, x0=KIT.run.x0, xw=46.56, d=xw-x0, h=2.3, half=(T2.z1-T2.z0)/2, fz1=T2.z0+half;
    B(d,h,half,carcass,(x0+xw)/2,h/2,(T2.z0+fz1)/2,scene,tag);
    { const a=T2.z0+.004, b=fz1-.004, zc=(a+b)/2; B(.02,1.36,b-a,door,x0-.005,.1+1.36/2+.8,zc,scene,tag); B(.02,.76,b-a,door,x0-.005,.1+.38,zc,scene,tag); B(.014,.5,.014,steel,x0-.03,1.3,b-.06); B(.014,.3,.014,steel,x0-.03,.7,b-.06); }
    const pt={type:'kpantry'}, za=fz1, zb=T2.z1, pc=(za+zb)/2, pw=zb-za;
    B(d,.02,pw,carcass,(x0+xw)/2,h-.01,pc); B(d,.1,pw,carcass,(x0+xw)/2,.05,pc); B(.02,h,pw,carcass,xw-.01,h/2,pc); for(const z of [za+.01,zb-.01]) B(d,h,.02,carcass,(x0+xw)/2,h/2,z);
    const inner=mat(0xf0ebe0,.7), sx=(x0+xw)/2+.01; const shelves=[.1,.58,1.06,1.54,2.02];
    for(const y of shelves.slice(1)) B(d-.04,.018,pw-.04,inner,sx,y,pc,scene,pt);
    // dry goods: jars of beans, mushrooms, wood ear, noodles in bundles, bottles of soy sauce and sesame oil, tins
    const glass=mat(0xdfe8e6,.05,{transparent:true,opacity:.35}), jar=(x,y,z,c,r=.05,hh=.14,lid=0x8a2a24)=>{ C(r,r,hh,glass,x,y+hh/2,z,scene,14,pt); C(r*.94,r*.94,hh*.72,mat(c,.85),x,y+hh*.36,z,scene,14); C(r*1.02,r*1.02,.025,mat(lid,.5),x,y+hh+.012,z,scene,14); };
    const bottle=(x,y,z,c,lab)=>{ L([[0,0],[.032,0],[.032,.17],[.014,.21],[.012,.25]],mat(c,.15,{transparent:true,opacity:.9}),x,y,z,scene,pt); C(.033,.033,.06,mat(lab,.7),x,y+.09,z,scene,12); C(.013,.013,.02,mat(0xb03a2a,.5),x,y+.26,z,scene,8); };
    const bundle=(x,y,z,c,band)=>{ for(let i=0;i<5;i++){ const b=B(.03,.03,.3,mat(c,.8),x+(i%3)*.03,y+.017+Math.floor(i/3)*.03,z,scene,pt); } B(.1,.064,.03,mat(band,.6),x+.03,y+.032,z); };
    const tin=(x,y,z,c)=>{ C(.04,.04,.1,mat(c,.4,{metalness:.4}),x,y+.05,z,scene,14,pt); };
    const X=i=>x0+.12+i*.15;
    // shelf 1 (floor): rice-flour noodles and bean thread in bundles, a bag of brown sugar
    bundle(X(0),shelves[0],pc-.12,0xf2ead6,0xa8343a); bundle(X(0),shelves[0],pc+.14,0xe9e4d6,0x2f5f8a); B(.14,.2,.16,mat(0xa7703a,.9),X(2.4),shelves[0]+.1,pc,scene,pt);
    // shelf 2: beans and grains
    jar(X(0),shelves[1],pc-.17,0x7a2a24); jar(X(0),shelves[1],pc,0x4f7a3a); jar(X(0),shelves[1],pc+.17,0xd9b45a); jar(X(1.6),shelves[1],pc-.09,0xc89a68,.055,.16); jar(X(1.6),shelves[1],pc+.11,0x2c2a28,.055,.16,0x3a5a3a);
    // shelf 3: shiitake, wood ear, goji, dried bean curd sticks
    jar(X(0),shelves[2],pc-.16,0x6a4630,.06,.16); jar(X(0),shelves[2],pc+.04,0x1d1b1a,.06,.16); jar(X(1.5),shelves[2],pc-.12,0xb83224,.04,.11); for(let i=0;i<4;i++){ const s=B(.025,.025,.34,mat(0xe0b862,.7),X(1.7)+(i%2)*.03,shelves[2]+.02+Math.floor(i/2)*.026,pc+.13,scene,pt); }
    // shelf 4: soy sauce, sesame oil, vinegar, salt and sugar tins, vegetarian floss
    bottle(X(0),shelves[3],pc-.18,0x2a160c,0xe8d9b0); bottle(X(0),shelves[3],pc-.08,0x8a5a1a,0xb83224); bottle(X(.4),shelves[3],pc+.02,0x3a1a10,0xf0ece0);
    tin(X(1.7),shelves[3],pc-.14,0xd9d3c4); tin(X(1.7),shelves[3],pc-.03,0xb83224); tin(X(1.7),shelves[3],pc+.09,0x2f5f8a); jar(X(1),shelves[3],pc+.18,0xc89a68,.045,.12,0xd9a43a);
    // shelf 5: kelp and nori, a sack of flour
    B(.2,.05,.14,mat(0x2a3a2a,.8),X(.3),shelves[4]+.025,pc-.1,scene,pt); B(.16,.02,.2,mat(0x15201a,.6),X(.3),shelves[4]+.06,pc-.1); B(.2,.18,.2,mat(0xe9e1cf,.95),X(1.3),shelves[4]+.09,pc+.08,scene,pt);
    // the door, on a hinge at the front-wall end
    const pv=new THREE.Group(); pv.position.set(x0-.005,0,zb-.004); scene.add(pv); const dw=pw-.008;
    B(.02,2.16,dw,door,0,.1+1.08,-dw/2,pv,pt); B(.014,.5,.014,steel,-.025,1.15,-dw+.06,pv);
    KPANTRY.pv=pv; MEAL_DYN.push(pv);
    OB(x0,xw,T2.z0,T2.z1); }
  // the work table in the middle, twice as long; a pot rack above it with the pans and baskets hanging on S-hooks
  { const tx=(KIT.x0+KIT.x1)/2, tz=0, TL=2.8; B(.72,.05,TL,wood,tx,.82,tz); for(const sx of [-1,1]) for(const sz of [-1,0,1]) B(.06,.8,.06,woodDk,tx+sx*.3,.4,tz+sz*(TL/2-.07)); B(.6,.03,TL-.14,woodDk,tx,.18,tz);
    B(.36,.025,.26,mat(0xd9c39c,.7),tx-.1,.857,tz-.8); B(.02,.005,.2,steel,tx-.1,.874,tz-.75); L([[0,0],[.13,0],[.16,.06],[.17,.08]],porcelain,tx+.08,.845,tz-.2);
    L([[0,0],[.15,0],[.19,.07],[.2,.09]],mat(0xb08a52,.7),tx,.845,tz+.7); for(let i=0;i<3;i++){ const v=new THREE.Mesh(new THREE.SphereGeometry(.04,10,8),mat([0x3c7a2a,0xd8452e,0xe8c24a][i],.6)); v.position.set(tx+(i-1)*.06,.89,tz+.7+(i%2)*.04); scene.add(v); }
    OB(tx-.36,tx+.36,tz-TL/2,tz+TL/2);
    const ry=2.12, rack=new THREE.Group(); scene.add(rack);
    for(const dx of [-.18,.18]) B(.05,.05,2.3,woodDk,tx+dx,ry,tz,rack); for(const dz of [-1.1,1.1]) B(.42,.05,.05,woodDk,tx,ry,tz+dz,rack);
    for(const dz of [-1.0,1.0]) for(const dx of [-.18,.18]){ C(.004,.004,1.6,iron,tx+dx,ry+.8,tz+dz,rack,4); }
    const hook=(x,z)=>{ const h=new THREE.Mesh(new THREE.TorusGeometry(.018,.003,5,10),iron); h.position.set(x,ry-.045,z); rack.add(h); const h2=h.clone(); h2.position.y-=.03; rack.add(h2); return ry-.075; };
    const pans=[
      ['banana',-.18,-.85],['chili',-.18,-.4],['corn',-.18,.05],['banana',-.18,.5],['chili',-.18,.9],
      ['corn',.18,-.8],['mush',.18,-.35],['corn',.18,.1],['chili',.18,.55],['banana',.18,.92]];
    for(const [k,dx,dz] of pans){ const x=tx+dx, z=tz+dz, y=hook(x,z), g=new THREE.Group(); g.position.set(x,y,z); rack.add(g);
      if(k==='wok'){ g.rotation.x=Math.PI/2.1; L([[0,0],[.12,.01],[.17,.05],[.18,.065]],mat(0x232120,.45,{metalness:.5,side:THREE.DoubleSide}),0,-.19,0,g); C(.012,.012,.16,woodDk,0,-.02,0,g,8); }
      if(k==='fry'){ g.rotation.x=Math.PI/2.05; L([[0,0],[.11,0],[.12,.04]],mat(0x2b2b2b,.4,{metalness:.5,side:THREE.DoubleSide}),0,-.25,0,g); C(.012,.012,.18,mat(0x3a2418,.5),0,-.06,0,g,8); }
      if(k==='saucepan'){ L([[0,0],[.08,0],[.085,.11]],mat(0xc9ccce,.25,{metalness:.8,side:THREE.DoubleSide}),0,-.22,0,g); const hd=B(.15,.012,.02,steel,.12,-.12,0,g); hd.rotation.z=.6; }
      if(k==='pot'){ L([[0,0],[.1,0],[.105,.13]],mat(0xc9ccce,.25,{metalness:.8,side:THREE.DoubleSide}),0,-.2,0,g); for(const s of [-1,1]){ const e=new THREE.Mesh(new THREE.TorusGeometry(.022,.005,5,10,Math.PI),steel); e.position.set(s*.105,-.08,0); e.rotation.z=s*Math.PI/2; g.add(e); } }
      if(k==='steamer'){ g.rotation.x=Math.PI/2; C(.13,.13,.08,bamboo,0,-.13,0,g,20); const b=new THREE.Mesh(new THREE.TorusGeometry(.13,.007,5,20),bambooDk); b.position.y=-.13; b.rotation.x=Math.PI/2; g.add(b); }
      if(k==='colander'){ L([[0,0],[.1,.01],[.13,.07]],mat(0xd8cba0,.7,{side:THREE.DoubleSide}),0,-.2,0,g); C(.003,.003,.12,iron,0,-.07,0,g,4); }
      if(k==='sieve'){ g.rotation.x=Math.PI/2; C(.16,.16,.025,bamboo,0,-.17,0,g,24); const f=new THREE.Mesh(new THREE.CircleGeometry(.15,20),mat(0xc9ae72,.8,{side:THREE.DoubleSide})); f.rotation.x=Math.PI/2; f.position.y=-.17; g.add(f); }
      if(k==='banana'){ C(.004,.004,.06,mat(0x6a5a3a,.8),0,-.03,0,g,4); const st=C(.018,.02,.18,mat(0x7a6a3a,.8),0,-.14,0,g,8);
        for(let r=0;r<3;r++) for(let i=0;i<6;i++){ const a=i/6*Math.PI*2+r*.5, b=new THREE.Mesh(new THREE.CapsuleGeometry(.019,.13,4,8),mat(r===0?0xe6c43a:0xd9c048,.6)); b.position.set(Math.cos(a)*.05,-.09-r*.055,Math.sin(a)*.05); b.rotation.z=Math.cos(a)*-.9; b.rotation.x=Math.sin(a)*.9; g.add(b); } }
      if(k==='chili'){ C(.002,.002,.5,mat(0xc9b48a,.8),0,-.25,0,g,4); for(let i=0;i<16;i++){ const a=i*2.4, c=new THREE.Mesh(new THREE.ConeGeometry(.012,.08,6),mat(i%5?0xb82418:0x8e1a12,.5)); c.position.set(Math.cos(a)*.03,-.05-i*.028,Math.sin(a)*.03); c.rotation.z=Math.PI+Math.cos(a)*.6; c.rotation.x=Math.sin(a)*.6; g.add(c); } }
      if(k==='corn'){ C(.002,.002,.08,mat(0xc9b48a,.8),0,-.04,0,g,4); for(let i=0;i<3;i++){ const a=i*2.1, cg=new THREE.Group(); cg.position.set(Math.cos(a)*.035,-.09,Math.sin(a)*.035); cg.rotation.z=Math.cos(a)*.25; cg.rotation.x=Math.sin(a)*.25; g.add(cg);
          const cob=new THREE.Mesh(new THREE.CapsuleGeometry(.03,.16,4,10),mat(i===1?0xd9952a:0xe8b23a,.65)); cob.position.y=-.14; cg.add(cob);
          for(let h=0;h<3;h++){ const hu=new THREE.Mesh(new THREE.PlaneGeometry(.04,.14),mat(0xd8c49a,.9,{side:THREE.DoubleSide})); hu.position.set(Math.cos(h*2.1)*.02,-.01,Math.sin(h*2.1)*.02); hu.rotation.y=h*2.1; hu.rotation.x=.3; cg.add(hu); } } }
      if(k==='mush'){ C(.004,.004,.5,mat(0xc9b48a,.8),0,-.25,0,g,4); for(let i=0;i<9;i++){ const s=new THREE.Mesh(new THREE.CylinderGeometry(.034,.026,.014,12),mat(i%3?0x6a4a30:0x7a5838,.8)); s.position.set(Math.cos(i*2.1)*.012,-.05-i*.045,Math.sin(i*2.1)*.012); s.rotation.set(Math.cos(i)*.9,0,Math.sin(i)*.9); g.add(s); } }   // a string of dried shiitake
      if(k==='garlic'){ C(.004,.004,.1,mat(0xd8c9a0,.8),0,-.05,0,g,4); for(let i=0;i<7;i++){ const s=new THREE.Mesh(new THREE.SphereGeometry(.03,10,8),mat(i%2?0xece4d2:0xd9a0a8,.7)); s.position.set(Math.cos(i*1.7)*.03,-.1-i*.035,Math.sin(i*1.7)*.03); g.add(s); } } } }
  // the food cupboard (菜櫥) against the front wall: textured glass above, slats over green screen, three drawers, sliding doors below
  { const tag={type:'kcab'}, cx=42.62, W=.88, D=.44, H=1.55, zf=4.0-D, zc=4.0-D/2, oak=mat(0xdcb983,.5), oakDk=mat(0xc9a06a,.5);
    for(const s of [-1,1]) for(const t of [-1,1]) B(.045,H,.045,oak,cx+s*(W/2-.022),H/2,zc+t*(D/2-.022),scene,tag);
    B(W+.04,.035,D+.04,oak,cx,H+.017,zc,scene,tag); B(W,.02,D,oakDk,cx,1.12,zc); B(W,.02,D,oakDk,cx,.66,zc); B(W,.02,D,oakDk,cx,.52,zc); B(W,.02,D,oakDk,cx,.1,zc);
    B(W-.04,H-.1,.01,oakDk,cx,H/2+.05,4.0-.006); for(const s of [-1,1]) B(.01,H-.1,D-.04,oakDk,cx+s*(W/2-.005),H/2+.05,zc);
    // inside, behind the glass: stacked bowls and plates
    for(let i=0;i<5;i++) L([[0,0],[.045,0],[.065,.035]],porcelain,cx-.22,1.14+i*.032,zc+.05,scene); for(let i=0;i<6;i++) C(.09,.08,.012,porcelain,cx+.15,1.14+i*.016,zc+.05,scene,20);
    const gl=mat(0x9a9c94,.15,{transparent:true,opacity:.42,metalness:.2}); for(const s of [-1,1]){ B(W/2-.04,.3,.012,gl,cx+s*(W/4-.005),1.31,zf+(s<0?.01:.025),scene,tag); for(const y of [1.155,1.465]) B(W/2-.02,.025,.02,oak,cx+s*(W/4-.005),y,zf+(s<0?.01:.025)); for(const xx of [-1,1]) B(.025,.33,.02,oak,cx+s*(W/4-.005)+xx*(W/4-.015),1.31,zf+(s<0?.01:.025)); }
    const green=mat(0x2c6a3e,.85); for(const s of [-1,1]){ const px=cx+s*(W/4-.005), zz=zf+(s<0?.01:.025); B(W/2-.04,.34,.006,green,px,.93,zz+.008,scene,tag); for(let i=0;i<7;i++) B(.014,.34,.014,oak,px-(W/2-.08)/2+i*(W/2-.08)/6,.93,zz-.004); B(W/2-.02,.11,.02,oakDk,px,.725,zz); B(W/2-.02,.025,.02,oak,px,1.11,zz); }
    for(let i=0;i<3;i++){ const dx=cx-W/3+i*W/3; B(W/3-.03,.11,.02,oakDk,dx,.59,zf-.002,scene,tag); B(.06,.012,.012,brass,dx,.59,zf-.018); }
    for(const s of [-1,1]) B(W/2-.04,.38,.02,oakDk,cx+s*(W/4-.005),.31,zf+(s<0?.0:.015),scene,tag);
    OB(cx-W/2,cx+W/2,zf,4.0);
    // three jars between the cupboard and the rice jar: two of rice wine, one of vinegar, cloth tied over the mouths
    { const jarM=mat(0x5a3422,.35), clothM=mat(0xd8cfba,.9), tagT=ch=>mat(0xffffff,.85,{transparent:true,map:textCanvas(96,96,(g,w,h)=>{ g.clearRect(0,0,w,h); g.translate(w/2,h/2); g.rotate(Math.PI/4); g.fillStyle='#c0352c'; g.fillRect(-30,-30,60,60); g.rotate(-Math.PI/4); g.fillStyle='#1a1614'; g.font=F('700',36); g.textAlign='center'; g.textBaseline='middle'; g.fillText(ch,0,3); })});
      [[43.27,'醬',.44],[43.58,'油',.4],[43.88,'醋',.34]].forEach(([x,ch,hh])=>{ const t={type:'kwine'}; L([[0,0],[.1,0],[.14,hh*.35],[.13,hh*.75],[.07,hh*.92],[.075,hh]],jarM,x,0,3.72,scene,t);
        const cl=L([[0,hh+.03],[.06,hh+.025],[.09,hh-.01],[.095,hh-.05]],clothM,x,0,3.72,scene,t); const cord=new THREE.Mesh(new THREE.TorusGeometry(.078,.004,4,20),mat(0xa8343a,.6)); cord.rotation.x=Math.PI/2; cord.position.set(x,hh-.015,3.72); scene.add(cord);
        plane(.12,.12,tagT(ch),x,hh*.5,3.72-.142,Math.PI,scene,t); });
      OB(43.12,44.0,3.55,3.95); }
    // the rice jar under the window, a red square with 滿 on it
    const rt={type:'krice'}; L([[0,0],[.2,0],[.27,.18],[.28,.42],[.24,.6]],clayDark,44.35,0,3.62,scene,rt); C(.26,.26,.035,wood,44.35,.615,3.62,scene,24,rt); C(.03,.03,.06,woodDk,44.35,.66,3.62,scene,10,rt);
    const sc=C(.035,.035,.12,bamboo,44.47,.69,3.55,scene,10,rt); sc.rotation.z=Math.PI/2;
    const man=plane(.2,.2,mat(0xffffff,.85,{transparent:true,map:textCanvas(160,160,(g,w,h)=>{ g.clearRect(0,0,w,h); g.translate(w/2,h/2); g.rotate(Math.PI/4); g.fillStyle='#c0352c'; g.fillRect(-52,-52,104,104); g.rotate(-Math.PI/4); g.fillStyle='#1a1614'; g.font=F('700',60); g.textAlign='center'; g.textBaseline='middle'; g.fillText('滿',0,4); })}),44.35,.36,3.62-.287,Math.PI,scene,rt);
    OB(44.05,44.65,3.32,3.92); }
  // the indigo curtain in the doorway to the 明間, split in two
  for(const s of [-1,1]){ const p=plane(.68,.82,indigo,41.86,2.02,-.3+s*.35,Math.PI/2); p.userData={type:'block'}; }
  C(.012,.012,1.5,woodDk,41.86,2.44,-.3).rotation.x=Math.PI/2;

  // ------------------------------------------------------------ 明間
  // the round table and four benches; twelve places, the middle of the back bench (facing the door) kept for the master
  { const T0=DINE, tag={type:'dtable'};
    const top=new THREE.Mesh(new THREE.CylinderGeometry(T0.r,T0.r,.045,48),wood); top.position.set(T0.x,T0.top-.022,T0.z); top.castShadow=top.receiveShadow=true; scene.add(top); top.userData=tag; pickables.push(top);
    C(T0.r-.03,T0.r-.03,.08,woodDk,T0.x,T0.top-.085,T0.z,scene,48);
    for(let k=0;k<4;k++){ const a=Math.PI/4+k*Math.PI/2; B(.06,T0.top-.06,.06,woodDk,T0.x+Math.cos(a)*(T0.r-.12),(T0.top-.06)/2,T0.z+Math.sin(a)*(T0.r-.12)); }
    const ring=new THREE.Mesh(new THREE.TorusGeometry(T0.r-.14,.018,8,40),woodDk); ring.rotation.x=Math.PI/2; ring.position.set(T0.x,.2,T0.z); scene.add(ring);
    OB(T0.x-T0.r,T0.x+T0.r,T0.z-T0.r,T0.z+T0.r);
    // benches: [dx,dz,along] — along 'x' when the bench runs north–south
    const benches=[[0,-T0.bo,'x'],[0,T0.bo,'x'],[-T0.bo,0,'z'],[T0.bo,0,'z']];
    DINE.seats=[];
    for(const [dx,dz,al] of benches){ const bx=T0.x+dx, bz=T0.z+dz, lx=al==='x'?T0.bl:.28, lz=al==='x'?.28:T0.bl;
      for(let s=-1;s<=1;s++){ const sx=al==='x'?bx+s*.55:bx, sz=al==='z'?bz+s*.55:bz, yaw=Math.atan2(-(T0.x-sx),-(T0.z-sz));
        const host=dz<0&&s===0, si=addSeat(sx,sz,yaw,'dine',host?NT('dine.host'):NT('dine.title'));
        // stepping in and out: from the open side, or for the back bench from the corner nearer the seat
        SEATS[si].ap=dz<0?{x:T0.x+(s<=0?-1.5:1.5),z:-3.76}:{x:sx+Math.sign(dx)*.62,z:sz+Math.sign(dz)*.62};
        DINE.seats.push({si,host,x:sx,z:sz,yaw}); }
      const st={type:'seat',si:DINE.seats[DINE.seats.length-2].si};
      B(lx,.05,lz,wood,bx,T0.bh-.025,bz,scene,st);
      for(const e of [-1,1]) for(const f of [-1,1]){ const ex=al==='x'?e*(T0.bl/2-.1):f*.09, ez=al==='x'?f*.09:e*(T0.bl/2-.1); B(.045,T0.bh-.05,.045,woodDk,bx+ex,(T0.bh-.05)/2,bz+ez); }
      B(al==='x'?T0.bl-.24:.03,.03,al==='x'?.03:T0.bl-.24,woodDk,bx,.14,bz);
      OB(bx-lx/2,bx+lx/2,bz-lz/2,bz+lz/2); }
    // every bench's three seats are clickable on its own third
    for(const s of DINE.seats){ const S=SEATS[s.si]; const hit=new THREE.Mesh(new THREE.BoxGeometry(.48,.06,.48),new THREE.MeshBasicMaterial({visible:false})); hit.position.set(S.x,DINE.bh+.02,S.z); hit.userData={type:'seat',si:s.si}; scene.add(hit); pickables.push(hit); MEAL_DYN.push(hit); }
    // the bamboo lamp over the table
    C(.006,.006,2.2,mat(0x222222,.6),T0.x,3.75,T0.z,scene,6);
    const shade=L([[.05,.42],[.12,.4],[.26,.2],[.34,0]],mat(0xd9bf87,.8,{side:THREE.DoubleSide,emissive:0xffcf8a,emissiveIntensity:0}),T0.x,2.25,T0.z); DINE.shade=shade; MEAL_DYN.push(shade);
    const bulb=new THREE.Mesh(new THREE.SphereGeometry(.06,12,8),mat(0xfff3d8,.3,{emissive:0xffe2b0,emissiveIntensity:0})); bulb.position.set(T0.x,2.32,T0.z); scene.add(bulb); DINE.bulb=bulb; MEAL_DYN.push(bulb);
    const lamp=new THREE.PointLight(0xffd8a0,0,6,2); lamp.position.set(T0.x,2.15,T0.z); scene.add(lamp); DINE.lamp=lamp; }
  // 張熊《蔬果圖》(1870, National Palace Museum open data), framed behind the table: a pale silk mount in a dark wood frame
  { const tag={type:'dpaint'}, pw=1.45, ph=pw*730/1024, py=2.05, wz=-3.99, mt=.1, fw=.045;
    const tex=new THREE.TextureLoader().load('painting-zhangxiong-veg.jpg'); tex.colorSpace=THREE.SRGBColorSpace; tex.anisotropy=MAXANI;
    const Wm=pw+2*mt, Hm=ph+2*mt; B(Wm,Hm,.012,mat(0xd9d2bd,.9),DINE.x,py,wz+.008,scene,tag);
    for(const [w,h,x,y] of [[Wm+2*fw,fw,0,Hm/2+fw/2],[Wm+2*fw,fw,0,-Hm/2-fw/2],[fw,Hm,Wm/2+fw/2,0],[fw,Hm,-Wm/2-fw/2,0]]) B(w,h,.04,lacquer,DINE.x+x,py+y,wz+.02,scene,tag);
    B(pw+.012,ph+.012,.004,mat(0xb9ae94,.9),DINE.x,py,wz+.0145);
    plane(pw,ph,mat(0xffffff,.88,{map:tex}),DINE.x,py,wz+.017,0,scene,tag); }
  // a low food cupboard and a tea cabinet under the two front windows
  { const tag={type:'dcup'};
    for(const [cx,kind] of [[37.35,'food'],[41.05,'tea']]){ const w=1.18, d=.42, h=.8, z=4.0-d/2; B(w,h,d,woodDk,cx,h/2,z,scene,tag); B(w+.04,.035,d+.04,wood,cx,h+.017,z,scene,tag);
      for(const s of [-1,1]){ const dm=kind==='food'?mat(0xffffff,.9,{map:textCanvas(64,64,(g,ww,hh)=>{ g.fillStyle='#cfc6b2'; g.fillRect(0,0,ww,hh); g.strokeStyle='rgba(70,60,50,.45)'; for(let i=0;i<ww;i+=3){ g.beginPath(); g.moveTo(i,0); g.lineTo(i,hh); g.stroke(); g.beginPath(); g.moveTo(0,i); g.lineTo(ww,i); g.stroke(); } })}):wood;
        B(w/2-.08,h-.16,.012,woodDk,cx+s*w/4,h/2,z-d/2-.004,scene,tag); B(w/2-.16,h-.26,.008,dm,cx+s*w/4,h/2,z-d/2-.012,scene,tag); B(.012,.08,.012,brass,cx+s*.05,h/2+.05,z-d/2-.03); }
      OB(cx-w/2,cx+w/2,z-d/2,z+d/2);
      if(kind==='tea'){ C(.07,.07,.32,mat(0x6f8f88,.4),cx-.35,h+.19,z,scene,16,tag); C(.04,.04,.05,mat(0x6f8f88,.4),cx-.35,h+.37,z,scene,12); L([[0,0],[.08,0],[.1,.06],[.07,.12],[.03,.13]],mat(0x8a4b32,.35),cx-.02,h+.035,z,scene,tag);
        for(let i=0;i<4;i++) L([[0,0],[.025,0],[.035,.045]],porcelain,cx+.22+(i%2)*.09,h+.035,z-.06+Math.floor(i/2)*.1,scene); B(.36,.012,.24,wood,cx+.26,h+.036,z); }
      else { L([[0,0],[.09,0],[.11,.1],[.06,.12]],mat(0xb08a52,.6),cx-.25,h+.035,z,scene,tag); L([[0,0],[.06,0],[.08,.12],[.05,.15]],clayDark,cx+.2,h+.035,z,scene,tag); L([[0,0],[.05,0],[.07,.1],[.04,.12]],clay,cx+.36,h+.035,z,scene,tag); } } }
  // the wash basin by the kitchen door: terrazzo stand, white bowl, an old brass tap; folded towels on a shelf
  { const tag={type:'dbasin'}, xw=41.78, z=3.0, d=.46, x=xw-d/2;
    B(d,.78,.56,washStone,x,.39,z,scene,tag); B(d+.03,.06,.62,washStone,x-.015,.81,z,scene,tag);
    L([[0,-.1],[.1,-.1],[.17,-.03],[.19,0],[.2,.01]],porcelain,x-.02,.84,z,scene,tag);
    // an old brass bib tap from the wall: a round flange, the body, a cross handle on top, the spout bending down
    { const fl=C(.035,.035,.012,brass,xw-.006,1.06,z,scene,16,tag); fl.rotation.z=Math.PI/2; const bd=C(.017,.02,.12,brass,xw-.07,1.06,z,scene,12,tag); bd.rotation.z=Math.PI/2;
      C(.008,.008,.05,brass,xw-.085,1.1,z,scene,8,tag); for(let k=0;k<2;k++){ const arm=B(.08,.01,.01,brass,xw-.085,1.13,z,scene,tag); arm.rotation.y=k*Math.PI/2+.5; } const kb=new THREE.Mesh(new THREE.SphereGeometry(.012,8,6),brass); kb.position.set(xw-.085,1.135,z); scene.add(kb);
      const sp=new THREE.Mesh(new THREE.TorusGeometry(.03,.01,8,12,Math.PI/2),brass); sp.position.set(xw-.13,1.03,z); sp.rotation.y=0; sp.rotation.z=Math.PI; scene.add(sp); C(.011,.009,.03,brass,xw-.16,1.0,z,scene,10,tag);
      const tt={type:'kbasin'}; for(const o of [fl,bd]){ o.userData=tt; } const hh=new THREE.Mesh(new THREE.BoxGeometry(.12,.12,.12),new THREE.MeshBasicMaterial({visible:false})); hh.position.set(xw-.08,1.08,z); hh.userData=tt; scene.add(hh); pickables.push(hh); MEAL_DYN.push(hh);
      const wM=new THREE.MeshStandardMaterial({color:0xeaf4f8,roughness:.05,metalness:.1,transparent:true,opacity:.8,emissive:0x8aa8b8,emissiveIntensity:.25}), sl=.985-.79;
      const st=new THREE.Mesh(new THREE.CylinderGeometry(.008,.011,sl,8,1,true),wM); st.position.set(xw-.16,.79+sl/2,z); st.visible=false; scene.add(st);
      const pool=new THREE.Mesh(new THREE.CircleGeometry(.12,24),mat(0xcfe0e6,.05,{transparent:true,opacity:.5})); pool.rotation.x=-Math.PI/2; pool.position.set(x-.02,.79,z); pool.visible=false; scene.add(pool);
      const spl=new THREE.Group(); spl.position.set(xw-.16,.795,z); scene.add(spl); spl.visible=false; for(let k=0;k<8;k++){ const d=new THREE.Mesh(new THREE.SphereGeometry(.004,5,4),wM); spl.add(d); }
      Object.assign(KBASIN,{st,pool,spl}); MEAL_DYN.push(st,pool,spl); }
    B(.2,.025,.36,woodDk,xw-.1,1.12,2.52,scene,tag); for(let i=0;i<5;i++){ B(.16,.022,.26,mat(0xf4f1ea,.95),xw-.1,1.145+i*.024,2.52,scene,tag); B(.161,.004,.262,mat(0x3b5b8a,.9),xw-.1,1.145+i*.024+.008,2.52); }
    OB(xw-d,xw,z-.31,z+.31); OB(xw-.32,xw,2.32,2.68); }
  // the menu board by the kitchen door (today's three meals), the day calendar on the other partition
  { const tag={type:'dmenu'}; const c=document.createElement('canvas'); c.width=240; c.height=360; const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace;
    B(.03,.64,.44,woodDk,41.765,1.66,.84,scene,tag); plane(.4,.6,mat(0xffffff,.9,{map:t}),41.748,1.66,.84,-Math.PI/2,scene,tag); DINE.menu={c,t,day:''};
    // a tear-off day calendar on the other partition: a red board on top, today's page below (Taipei date, lunar date)
    // (a big one, about 0.6 m wide, so it reads from the table)
    const ck={type:'dcal'}, cz=3.0, cx=36.62, red=mat(0xb8282a,.5), K=1.8, yT=2.25, hH=.1*K, yH=yT-hH/2, pH=.42*K, yP=yT-hH-pH/2;
    B(.025,hH,.34*K,red,cx+.0125,yH,cz,scene,ck); plane(.32*K,.08*K,mat(0xffffff,.6,{transparent:true,map:textCanvas(480,120,(g,w,h)=>{ g.clearRect(0,0,w,h); g.fillStyle='#f2cf6a'; g.font=F('700',66); g.textAlign='center'; g.textBaseline='middle'; g.fillText(NT('cal.head'),w/2,h/2+3); })}),cx+.026,yH,cz,Math.PI/2,scene,ck);
    for(const dz of [-.18,0,.18]){ const r=new THREE.Mesh(new THREE.TorusGeometry(.013,.003,5,10),brass); r.position.set(cx+.03,yT-hH,cz+dz); r.rotation.y=Math.PI/2; scene.add(r); }
    B(.03,pH,.3*K,mat(0xf6f3ec,.9),cx+.015,yP,cz,scene,ck);
    const cc=document.createElement('canvas'); cc.width=600; cc.height=840; const ct=new THREE.CanvasTexture(cc); ct.colorSpace=THREE.SRGBColorSpace; ct.anisotropy=MAXANI;
    plane(.3*K,pH,mat(0xffffff,.85,{map:ct}),cx+.031,yP,cz,Math.PI/2,scene,ck); DINE.cal={c:cc,t:ct,day:''}; }

  // ------------------------------------------------------------ 西廂明間後半：廁所
  // A wall behind the two side doors closes off the back of the west 明間; a door on the axis leads into a short corridor
  // ending at a stone bowl under one bamboo spout, a frameless mirror above; women's room to the right (north), men's to the
  // left (south). Inside, like a bright modern bathroom: warm off-white matt walls with a set-back ledge at 1.1 m, large pale
  // beige floor tiles, pale oak doors, white china, chrome; stalls walled to the ceiling (women: two bidet toilets; men: a
  // urinal and a bidet toilet); a long mat before each row of stalls; a soft glow along the ceiling and high windows.
  { const nx0=36.62, nx1=41.78, zw=20.9, zb=23.6, cx=39.2, H=roofUnder(zw-19.6)-.03, CY=3.0, cw0=38.7, cw1=39.7, dz0=21.05, dz1=21.95, BH=ZR.brickH, LH=1.1, LP=.08;
    // pale oak with its grain: long straight lines, a few cathedral arches, the odd darker streak
    const oakTex=textCanvas(256,512,(g,w,h)=>{ g.fillStyle='#d9b98d'; g.fillRect(0,0,w,h); let s1=13; const r=()=>((s1=s1*16807%2147483647)/2147483647);
      for(let i=0;i<70;i++){ const x=r()*w, a=.05+r()*.12; g.strokeStyle=`rgba(${150+r()*30|0},${105+r()*25|0},${60+r()*20|0},${a})`; g.lineWidth=.6+r()*1.6; g.beginPath(); g.moveTo(x,0); g.bezierCurveTo(x+(r()-.5)*14,h*.33,x+(r()-.5)*14,h*.66,x+(r()-.5)*10,h); g.stroke(); }
      for(let k=0;k<5;k++){ const x0=r()*w, y0=r()*h, sw=12+r()*26; for(let j=0;j<6;j++){ g.strokeStyle=`rgba(140,95,55,${.08+r()*.06})`; g.lineWidth=1; g.beginPath(); g.moveTo(x0-sw+j*3,y0+120); g.quadraticCurveTo(x0,y0-40+j*8,x0+sw-j*3,y0+120); g.stroke(); } }
      for(let i=0;i<900;i++){ g.fillStyle=`rgba(120,80,40,${r()*.06})`; g.fillRect(r()*w,r()*h,1,3+r()*6); } });
    const oak=mat(0xffffff,.5,{map:oakTex});
    const white=new THREE.MeshStandardMaterial({map:texRep(T.white,1,1),roughness:.92}), cream=mat(0xefe7d9,.88), chrome=mat(0xd9dde0,.25,{metalness:.35});
    // the dividing wall seen from the hall: like the house (brick below, plaster above); the axis door with its curtain
    for(const [a,b] of [[nx0-.07,cx-.45],[cx+.45,nx1+.07]]){ const L0=b-a; B(L0,BH,.14,mBrick(L0*.78,BH*1.05),(a+b)/2,BH/2,zw); B(L0,H-BH,.14,white,(a+b)/2,(BH+H)/2,zw); OB(a,b,zw-.07,zw+.07); }
    B(.9,H-2.45,.14,white,cx,(2.45+H)/2,zw); for(const s of [-1,1]) B(.08,2.47,.2,darkWood,cx+s*.49,1.235,zw); B(1.06,.1,.2,darkWood,cx,2.5,zw); B(.9,.06,.24,stone,cx,.03,zw);
    { const linen=mat(0xffffff,.95,{side:THREE.DoubleSide,map:textCanvas(128,384,(g,w,h)=>{ g.fillStyle='#e7dcc8'; g.fillRect(0,0,w,h); for(let y=0;y<h;y+=2){ g.fillStyle=`rgba(160,140,110,${y%4?.05:.09})`; g.fillRect(0,y,w,1); } for(let x=0;x<w;x+=3){ g.fillStyle='rgba(255,255,255,.05)'; g.fillRect(x,0,1,h); }
        g.fillStyle='#8a6a4a'; g.fillRect(0,0,w,10); g.fillRect(0,h-6,w,6); g.strokeStyle='#8a6a4a'; g.lineWidth=4; g.beginPath(); g.arc(w/2,h*.22,16,0,Math.PI*2); g.stroke(); })});
      for(const s of [-1,1]){ const p=plane(.44,1.45,linen,cx+s*.222,2.42-1.45/2,zw-.075,Math.PI); p.userData={type:'block'}; } C(.01,.01,.92,woodDk,cx,2.43,zw-.075,scene,8).rotation.z=Math.PI/2; }
    for(const px of [36.55,41.85]) B(.2,1.22,1.22,white,px,1.55,ZR.win.z);   // the octagonal windows behind the wall, walled up
    // pale beige tiles, 60 cm, thin joints
    const tiles=mat(0xffffff,.32,{map:textCanvas(512,512,(g,w,h)=>{ g.fillStyle='#cbc1b0'; g.fillRect(0,0,w,h); let s2=21; const r=()=>((s2=s2*16807%2147483647)/2147483647);
      for(let i=0;i<2;i++) for(let j=0;j<2;j++){ const x0=i*256+2, y0=j*256+2, S=252, v=228+(r()-.5)*10; g.fillStyle=`rgb(${v|0},${(v-9)|0},${(v-22)|0})`; g.fillRect(x0,y0,S,S);
        for(let k=0;k<2600;k++){ const t=r(); g.fillStyle=t<.5?`rgba(255,250,240,${r()*.18})`:`rgba(150,135,110,${r()*.12})`; const d=.8+r()*2.4; g.fillRect(x0+r()*S,y0+r()*S,d,d); }
        for(let k=0;k<3;k++){ g.strokeStyle=`rgba(190,178,158,${.25+r()*.2})`; g.lineWidth=.8+r(); g.beginPath(); let x=x0+r()*S, y=y0; g.moveTo(x,y); for(let m=0;m<8;m++){ x+=(r()-.5)*50; y+=S/8; g.lineTo(Math.min(x0+S,Math.max(x0,x)),y); } g.stroke(); }
        const gr=g.createLinearGradient(x0,y0,x0+S,y0+S); gr.addColorStop(0,'rgba(255,255,255,.06)'); gr.addColorStop(1,'rgba(0,0,0,.04)'); g.fillStyle=gr; g.fillRect(x0,y0,S,S); } })});
    tiles.map.wrapS=tiles.map.wrapT=THREE.RepeatWrapping; tiles.map.repeat.set((nx1-nx0)/1.2,(zb-zw)/1.2); tiles.metalness=.05;
    const fl=plane(nx1-nx0,zb-zw-.07,tiles,cx,.008,(zw+.07+zb)/2,0); fl.rotation.x=-Math.PI/2; fl.userData={type:'floor'};
    B(nx1-nx0,.04,zb-zw-.07,mat(0xf6f3ec,.95),cx,CY+.02,(zw+.07+zb)/2);
    const ledgeGlow=mat(0xfff2dc,.6,{emissive:0xffd9a8,emissiveIntensity:1.0});
    // a wall face in cream with the lower part standing proud to make a ledge at 1.1 m; n points into the room
    const face=(ax,at,a,b,n,ledge=true)=>{ const L0=b-a, m=(a+b)/2; if(L0<.02) return;
      if(ax==='x'){ B(.04,CY,L0,cream,at+n*.02,CY/2,m); if(ledge){ B(LP,LH,L0,cream,at+n*(.04+LP/2),LH/2,m); B(LP+.03,.014,L0,mat(0xf4ede1,.7),at+n*(.04+LP/2+.015),LH+.007,m); B(.006,.008,L0-.04,ledgeGlow,at+n*(.04+LP+.024),LH-.006,m); } }
      else { B(L0,CY,.04,cream,m,CY/2,at+n*.02); if(ledge){ B(L0,LH,LP,cream,m,LH/2,at+n*(.04+LP/2)); B(L0,.014,LP+.03,mat(0xf4ede1,.7),m,LH+.007,at+n*(.04+LP/2+.015)); B(L0-.04,.008,.006,ledgeGlow,m,LH-.006,at+n*(.04+LP+.024)); } } };
    // a free-standing wall in cream, both faces, thickness t
    const cwall=(ax,at,a,b,t=.1,top=CY)=>{ const L0=b-a, m=(a+b)/2; if(L0<.02) return; if(ax==='x'){ B(t,top,L0,cream,at,top/2,m); OB(at-t/2,at+t/2,a,b); } else { B(L0,top,t,cream,m,top/2,at); OB(a,b,at-t/2,at+t/2); } };
    // the rooms' outer walls, the back walls, the dividing wall's inner face
    face('x',nx0,zw+.07,22.2,1); face('x',nx1,zw+.07,22.2,-1); face('z',zw+.07,nx0,cw0-.05,1); face('z',zw+.07,cw1+.05,nx1,1);
    face('x',nx0,22.2,zb,1,false); face('x',nx1,22.2,zb,-1,false); face('z',zb,nx0,nx1,-1,false);
    // corridor walls with an opening into each room near the entrance; a pale oak sliding door that runs into the wall
    for(const [xw,sd] of [[cw0-.05,-1],[cw1+.05,1]]){ for(const [a,b] of [[zw+.07,dz0],[dz1,zb]]){ cwall('x',xw,a,b); face('x',xw+sd*.05,a,Math.min(b,22.2),sd); face('x',xw-sd*.05,a,b,-sd); }
      B(.1,CY-2.1,dz1-dz0,cream,xw,(2.1+CY)/2,(dz0+dz1)/2); }
    const slide=(xw,key)=>{ const w=dz1-dz0-.02, h=2.06, g=new THREE.Group(); g.position.set(xw,.02,(dz0+dz1)/2); scene.add(g); const tag={type:'wcslide',i:WC.slides.length};
      B(.035,h,w,oak,0,h/2,0,g,tag); for(const s of [-1,1]){ B(.006,.42,.035,mat(0x5a4632,.5),s*.0185,1.0,w/2-.1,g,tag); }
      WC.slides.push({g,z0:(dz0+dz1)/2,open:.5}); MEAL_DYN.push(g);
      const ptex=textCanvas(120,120,(g2,W,Hh)=>{ g2.fillStyle='#efe7d9'; g2.fillRect(0,0,W,Hh); g2.fillStyle='#6e655a'; g2.font=F('600',70); g2.textAlign='center'; g2.textBaseline='middle'; g2.fillText(NT('wc.'+key),W/2,Hh/2+4); });
      // the 男／女 plate sits on the door itself at eye height, on the corridor side near its leading edge, and slides with it
      const sd=key==='f'?1:-1, pz=-(w/2-.14); B(.012,.17,.17,oak,sd*.023,1.52,pz,g); plane(.15,.15,mat(0xffffff,.8,{map:ptex}),sd*.03,1.52,pz,sd>0?Math.PI/2:-Math.PI/2,g,{type:'wc'+key}); };
    WC.slides=[]; slide(cw0-.05,'f'); slide(cw1+.05,'m');
    // stalls: cream walls to the ceiling, pale oak flush doors, all hinged on the same side, opening inwards; a slim chrome pull
    WC.doors=[]; WC.seats=[];
    const stalls=(x0,x1)=>{ const z=22.25, xm=(x0+x1)/2, dw=.64; let p=x0;
      const piece=(a2,b2)=>{ if(b2-a2<.02) return; B(b2-a2,CY,.1,cream,(a2+b2)/2,CY/2,z); const s0=a2>x0+.01?a2+.17:a2, s1=b2<x1-.01?b2-.17:b2; if(s1>s0) OB(s0,s1,z-.05,z+.05); };
      for(const [a,b] of [[x0,xm],[xm,x1]]){ const d0=(a+b)/2-dw/2; piece(p,d0); p=d0+dw; B(dw,CY-2.06,.1,cream,d0+dw/2,(2.06+CY)/2,z);
        for(const xx of [d0,d0+dw]) B(.03,2.06,.11,oak,xx,1.03,z); B(dw+.03,.03,.11,oak,d0+dw/2,2.06,z);
        const pv=new THREE.Group(); pv.position.set(d0+dw-.015,0,z-.04); scene.add(pv); const tag={type:'wcdoor',i:WC.doors.length};
        B(dw-.04,2.0,.035,oak,-(dw-.04)/2,1.02,0,pv,tag); B(.012,.34,.012,chrome,-(dw-.04)+.07,1.0,-.03,pv,tag); for(const y of [.83,1.17]) B(.012,.012,.03,chrome,-(dw-.04)+.07,y,-.017,pv);
        const ind=mat(0x3a8a4a,.35,{emissive:0x1a5a2a,emissiveIntensity:.4}); B(.05,.016,.006,ind,-(dw-.04)+.07,1.26,-.02,pv,tag);
        WC.doors.push({pv,open:true,stall:true,side:-1,ind,si:-1}); MEAL_DYN.push(pv);
        // a high window in each stall, pale oak frame
        plane(.46,.26,mat(0xf2f5f6,.4,{emissive:0xe8eef2,emissiveIntensity:.6}),(a+b)/2,2.6,zb-.022,Math.PI); for(const [w2,h2,ox,oy] of [[.5,.025,0,.14],[.5,.025,0,-.14],[.025,.3,.24,0],[.025,.3,-.24,0],[.02,.26,0,0]]) B(w2,h2,.04,oak,(a+b)/2+ox,2.6+oy,zb-.03);
        const sl=new THREE.PointLight(0xffe2bc,.28,2.4,2); sl.position.set((a+b)/2,2.7,(z+zb)/2); scene.add(sl); }
      piece(p,x1); cwall('x',xm,z+.05,zb); };
    // a two-piece toilet with a bidet seat; a slim remote on the side wall; click it and the lid lifts
    const toilet=(tx)=>{ const tz=zb-.36, tag={type:'wcseat',i:WC.seats.length}, cer=porcelain;
      { const si=addSeat(tx,tz-.06,0,'wc',NT('wc.seat')); SEATS[si].ap={x:tx,z:22.62}; const D=WC.doors[WC.doors.length-(tx<cx?(tx<37.61?2:1):(tx<40.79?2:1))]; if(D) D.si=si; OB(tx-.2,tx+.2,zb-.62,zb); }
      L([[0,0],[.14,0],[.12,.2],[.16,.36]],cer,tx,0,tz+.06,scene,tag); const bowl=new THREE.Mesh(new THREE.SphereGeometry(.19,22,12,0,Math.PI*2,0,Math.PI/2),cer); bowl.rotation.x=Math.PI; bowl.scale.set(1,.55,1.3); bowl.position.set(tx,.42,tz-.02); scene.add(bowl); bowl.userData=tag; pickables.push(bowl);
      B(.34,.06,.24,cer,tx,.42,tz+.2,scene,tag); B(.4,.4,.18,cer,tx,.66,zb-.11,scene,tag); B(.42,.03,.2,cer,tx,.875,zb-.11); B(.05,.012,.02,chrome,tx-.15,.82,zb-.205);
      const seat=new THREE.Mesh(new THREE.TorusGeometry(.165,.028,8,26),mat(0xfafaf7,.3)); seat.rotation.x=Math.PI/2; seat.scale.set(1,1.3,1); seat.position.set(tx,.45,tz-.02); scene.add(seat);
      B(.36,.07,.14,mat(0xfafaf7,.3),tx,.46,tz+.22,scene,tag); const led=mat(0x9ad0ff,.3,{emissive:0x4aa8ff,emissiveIntensity:0}); B(.03,.006,.015,led,tx+.12,.497,tz+.18);
      const lid=new THREE.Group(); lid.position.set(tx,.48,tz+.16); scene.add(lid); const lp=new THREE.Mesh(new THREE.CylinderGeometry(.19,.19,.022,26),mat(0xfafaf7,.3)); lp.scale.set(1,1,1.3); lp.position.set(0,0,-.24); lid.add(lp); lp.userData=tag; pickables.push(lp);
      WC.seats.push({lid,led,open:false,si:SEATS.length-1}); MEAL_DYN.push(lid);
      const rx=tx+.43; B(.015,.2,.05,mat(0xf4f4f2,.3),rx,1.0,tz-.1,scene,tag); for(let k=0;k<4;k++) B(.004,.012,.022,mat(k?0xc8ccd0:0x4a8ad0,.3),rx-.009,1.06-k*.03,tz-.1);
      const hx=tx-.43; B(.02,.02,.14,chrome,hx,.75,tz-.1); const roll=C(.055,.055,.1,mat(0xfbfaf6,.9),hx+.06,.7,tz-.1,scene,16); roll.rotation.x=Math.PI/2; };
    // the urinal: a tall white china urinal with a rounded top, hung on the back wall, a sensor at the top
    const urinal=(ux)=>{ const ut={type:'wcuri',x:ux}; OB(ux-.18,ux+.18,zb-.32,zb); const UD=WC.doors[WC.doors.length-2]; if(UD) UD.uri=ux; const uz=zb-.02, cer=porcelain, g=new THREE.Group(); g.position.set(ux,0,uz); scene.add(g);
      B(.36,.72,.3,cer,0,.6,-.15,g,ut); const top=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,.3,24,1,false,0,Math.PI),cer); top.rotation.z=Math.PI/2; top.rotation.y=Math.PI/2; top.position.set(0,.96,-.15); g.add(top); top.userData=ut; pickables.push(top);
      const inner=new THREE.Mesh(new THREE.PlaneGeometry(.26,.62),mat(0xeef1f2,.2)); inner.position.set(0,.68,-.302); inner.rotation.y=Math.PI; g.add(inner); const lip=new THREE.Mesh(new THREE.CylinderGeometry(.14,.14,.02,20,1,false,0,Math.PI),mat(0xf2f4f5,.2)); lip.position.set(0,.38,-.3); g.add(lip);
      const sensor=new THREE.Mesh(new THREE.CircleGeometry(.025,16),mat(0xd8dcdf,.2)); sensor.position.set(0,.98,-.302); sensor.rotation.y=Math.PI; g.add(sensor); C(.008,.008,.012,chrome,0,.45,-.24,g,10); };
    stalls(nx0,cw0-.1); toilet((nx0+(nx0+cw0-.1)/2)/2); toilet(((nx0+cw0-.1)/2+cw0-.1)/2);
    stalls(cw1+.1,nx1); urinal((cw1+.1+(cw1+.1+nx1)/2)/2); toilet(((cw1+.1+nx1)/2+nx1)/2);
    // one long cotton mat before each row of stalls
    for(const [x0,x1] of [[nx0+.12,cw0-.22],[cw1+.22,nx1-.12]]){ const m=plane(x1-x0,.5,mat(0xd9d3c8,.98),(x0+x1)/2,.012,22.25-.36,0); m.rotation.x=-Math.PI/2; }
    // light: a soft glow along the ceiling, flush downlights, the high windows
    const cove=mat(0xfff4e2,.8,{emissive:0xffdcb0,emissiveIntensity:.38});
    for(const [x0,x1,z0,z1] of [[nx0,cw0-.05,zw+.08,22.2],[cw1+.05,nx1,zw+.08,22.2],[cw0+.02,cw1-.02,zw+.08,zb]]){ B(x1-x0,.02,.03,cove,(x0+x1)/2,CY-.03,z0+.02); B(.03,.02,z1-z0,cove,x0+.02,CY-.03,(z0+z1)/2); B(.03,.02,z1-z0,cove,x1-.02,CY-.03,(z0+z1)/2); }
    for(const [lx,lz,pi] of [[37.6,21.55,.38],[40.8,21.55,.38],[cx,21.6,.3]]){ const d=new THREE.Mesh(new THREE.CircleGeometry(.05,20),mat(0xffffff,.3,{emissive:0xffe6c4,emissiveIntensity:.7})); d.rotation.x=Math.PI/2; d.position.set(lx,CY-.001,lz); scene.add(d); const pl=new THREE.PointLight(0xffe2bc,pi,4.5,2); pl.position.set(lx,CY-.2,lz); scene.add(pl); }
    for(const [lx,lz] of [[37.0,21.5],[41.4,21.5],[cx,22.6]]){ const wl=new THREE.PointLight(0xffd8a6,.32,2.2,2); wl.position.set(lx,LH-.1,lz); scene.add(wl); }
    // the corridor end: a granite stand straight on the floor, a rough stone bowl, one bamboo spout over its centre;
    // a wall-mounted soap pump beside it; the mirror above
    { const tag={type:'wcspout'}, bz=zb-.36, rough=mat(0xffffff,.95,{map:T.granite,color:0x8f8b84});
      B(.46,.62,.42,stone,cx,.31,bz,scene,{type:'wcbowl'}); L([[0,0],[.22,0],[.27,.06],[.28,.16],[.26,.2],[.2,.2],[.18,.12],[0,.1]],rough,cx,.62,bz,scene,{type:'wcbowl'});
      const wpool=new THREE.Mesh(new THREE.CircleGeometry(.19,28),mat(0x9eb4b8,.05,{transparent:true,opacity:.75})); wpool.rotation.x=-Math.PI/2; wpool.position.set(cx,.8,bz); scene.add(wpool);
      const reach=zb-bz; const pipe=C(.024,.024,reach,bamboo,cx,1.1,zb-reach/2,scene,12,tag); pipe.rotation.x=Math.PI/2; for(const z of [zb-.08,zb-.24]){ const n=new THREE.Mesh(new THREE.TorusGeometry(.025,.005,5,12),bambooDk); n.position.set(cx,1.1,z); scene.add(n); }
      const tip=C(.02,.024,.07,bamboo,cx,1.075,bz+.01,scene,12,tag); tip.rotation.x=-.6;
      // soap pump on a chrome bracket
      { const sx=cx+.34, sy=1.05, sz=zb-.07; B(.07,.02,.06,chrome,sx,sy-.07,sz+.03); L([[0,0],[.035,0],[.038,.1],[.03,.13],[.014,.14]],mat(0xf4f2ee,.25),sx,sy-.06,sz,scene,{type:'wcbowl'}); C(.007,.007,.04,chrome,sx,sy+.1,sz,scene,8); B(.012,.012,.055,chrome,sx,sy+.12,sz-.02); }
      const wM=new THREE.MeshStandardMaterial({color:0xeaf4f8,roughness:.05,transparent:true,opacity:.8,emissive:0x8aa8b8,emissiveIntensity:.25});
      const st=new THREE.Mesh(new THREE.CylinderGeometry(.006,.009,.24,8,1,true),wM); st.position.set(cx,.92,bz+.02); st.visible=false; scene.add(st);
      const rip=[]; for(let k=0;k<3;k++){ const rr=new THREE.Mesh(new THREE.RingGeometry(.03,.036,24),new THREE.MeshBasicMaterial({color:0xf2f8fa,transparent:true,opacity:0,depthWrite:false})); rr.rotation.x=-Math.PI/2; rr.position.set(cx,.802,bz+.02); scene.add(rr); rip.push(rr); }
      Object.assign(WC.spout,{st,rip}); MEAL_DYN.push(st,...rip); OB(cx-.3,cx+.3,bz-.25,zb);
      // the mirror: plain, frameless; it reflects when you stand near it; a lamp above
      const mz=zb-.05, my=1.7, mw=.5, mh=.7, rt=new THREE.WebGLRenderTarget(384,384), mcam=new THREE.PerspectiveCamera();
      const mm=new THREE.ShaderMaterial({uniforms:{map:{value:rt.texture},tm:{value:new THREE.Matrix4()}},
        vertexShader:'uniform mat4 tm; varying vec4 vU; void main(){ vU=tm*modelMatrix*vec4(position,1.); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
        fragmentShader:'uniform sampler2D map; varying vec4 vU; void main(){ vec4 c=texture2DProj(map,vU); gl_FragColor=vec4(c.rgb*1.18+vec3(.035,.033,.03),1.); \n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}'});
      const mirror=new THREE.Mesh(new THREE.PlaneGeometry(mw,mh),mm); mirror.position.set(cx,my,mz); mirror.rotation.y=Math.PI; scene.add(mirror); MEAL_DYN.push(mirror);
      const fl2=new THREE.PointLight(0xffe8cc,.55,2.2,2); fl2.position.set(cx,1.75,zb-.75); scene.add(fl2);
      const ml=new THREE.SpotLight(0xffe6c8,1.5,2.4,.6,.8,2); ml.position.set(cx,2.7,zb-.6); ml.target.position.set(cx,.85,bz); scene.add(ml,ml.target);
      WC.mirror={mesh:mirror,rt,cam:mcam,mat:mm,z:mz,clip:[new THREE.Plane(new THREE.Vector3(0,0,-1),mz-.004)]};
      // towels on a pale oak shelf on the corridor wall
      B(.2,.025,.34,oak,cw0+.1,1.18,22.55); for(let i=0;i<5;i++) B(.16,.022,.26,mat(0xf6f3ee,.95),cw0+.1,1.205+i*.024,22.55); }
  }

  // a four-leaf folding screen in the west 明間, centred on the line between the two front octagonal windows: 趙孟頫《雙松平遠圖》 (Met open access),
  // cropped to the pines and the far hills and spread across the leaves; dark wood frames, a wooden lower panel, plain silk behind
  { const tag={type:'dscreen'}, N=4, PW=.62, PH=2.02, th=.22, z0=(ZR.door.z0+ZR.door.z1-ZR.win.z)-.067+.15,   /* 15 cm behind the front octagonal windows' line (z 17.85), less half the zigzag */ span=N*PW*Math.cos(th), x0=39.2-span/2, py0=.58, py1=1.86, inner=PW-.08;
    const tex=new THREE.TextureLoader().load('screen-zhaomengfu-twinpines.jpg'); tex.colorSpace=THREE.SRGBColorSpace; tex.anisotropy=MAXANI;
    const frameM=mat(0x3a2418,.45), silk=mat(0xd9cfb8,.9), back=mat(0xe6dcc8,.92), panelM=mat(0xffffff,.55,{map:T.cypressDark||T.cypress,color:0x8a6648});
    const ar=(N*inner)/(py1-py0), iar=1600/695, ry=Math.min(1,ar/iar);
    let hx=x0, hz=z0;
    for(let k=0;k<N;k++){ const a=(k%2?-th:th), g=new THREE.Group(); g.position.set(hx,0,hz); g.rotation.y=-a; scene.add(g);
      const cxk=PW/2;
      for(const u of [.02,PW-.02]) B(.04,PH,.04,frameM,u,PH/2,0,g,tag); B(PW,.05,.045,frameM,cxk,PH-.025,0,g,tag); B(PW,.04,.04,frameM,cxk,py1+.03,0,g); B(PW,.04,.04,frameM,cxk,py0-.03,0,g); B(PW,.04,.04,frameM,cxk,.26,0,g);
      B(inner,py0-.31,.02,panelM,cxk,(py0+.29)/2,0,g,tag); B(inner,py1-py0+.02,.012,silk,cxk,(py0+py1)/2,0,g,tag);
      const t=tex.clone(); t.needsUpdate=true; t.repeat.set(1/N,ry); t.offset.set((N-1-k)/N,(1-ry)/2);   // seen from the hall the first leaf is on the right
      const pic=new THREE.Mesh(new THREE.PlaneGeometry(inner-.03,py1-py0-.03),mat(0xffffff,.85,{map:t})); pic.position.set(cxk,(py0+py1)/2,-.0075); pic.rotation.y=Math.PI; g.add(pic); pic.userData=tag; pickables.push(pic);
      const bk=new THREE.Mesh(new THREE.PlaneGeometry(inner-.03,py1-py0-.03),back); bk.position.set(cxk,(py0+py1)/2,.0075); g.add(bk);
      for(const u of [.06,PW-.06]) B(.08,.03,.12,frameM,u,.015,0,g);
      if(k) for(const y of [.4,1.4]) B(.012,.06,.02,brass,0,y,0,g);
      const ex=hx+PW*Math.cos(a), ez=hz+PW*Math.sin(a); OB(Math.min(hx,ex),Math.max(hx,ex),Math.min(hz,ez)-.04,Math.max(hz,ez)+.04); hx=ex; hz=ez; } }
  // ------------------------------------------------------------ 西廂南間：浴室
  // From the west 明間 under a linen noren with 湯 in clerical script: a shallow entrance with a wall ahead and an opening to
  // each side — left into the changing room (lockers, a floating hinoki vanity with two basins and a real mirror, a bench),
  // right into the rest room (bench, towels, water). A one-metre passage behind the entrance joins them and leads to a glass
  // door: beyond it a stone floor, a large hinoki tub against the sealed front wall fed by a hinoki spout, a washing place
  // under the bamboo window (two seated places and a rain shower), and a hinoki sauna. Hinoki on every wall and ceiling.
  { const X0=41.92, X1=46.56, Z0=15.6, Z1=23.6, CYb=2.9, T=.08, xv=42.92, xg=43.6, zv0=18.9, zv1=20.9, SZ=21.4, op0=42.15;
    const X0i=X0+T, X1i=X1-T, Z0i=Z0+T, Z1i=Z1-T;
    const hinokiT=new THREE.TextureLoader().load('hinoki-boards.jpg'); hinokiT.colorSpace=THREE.SRGBColorSpace; hinokiT.anisotropy=MAXANI; hinokiT.wrapS=hinokiT.wrapT=THREE.RepeatWrapping;
    const grainT=new THREE.TextureLoader().load('hinoki-grain.jpg'); grainT.colorSpace=THREE.SRGBColorSpace; grainT.anisotropy=MAXANI; grainT.wrapS=grainT.wrapT=THREE.RepeatWrapping;
    const hgrain=mat(0xffffff,.5,{map:grainT});
    const grainV=(ox,oy,ru=1,rv=1)=>{ const t=grainT.clone(); t.needsUpdate=true; t.offset.set(ox,oy); t.repeat.set(ru,rv); return mat(0xffffff,.5,{map:t}); };
    const hk=(ru,rv=1)=>{ const t=hinokiT.clone(); t.needsUpdate=true; t.repeat.set(Math.max(.2,ru*2),rv); return mat(0xffffff,.52,{map:t}); };
    const hkF=(ru,rv)=>{ const t=hinokiT.clone(); t.needsUpdate=true; t.repeat.set(ru,rv); t.rotation=Math.PI/2; t.center.set(.5,.5); return mat(0xffffff,.46,{map:t}); };
    // grey stone tiles for the wet floor: 60 cm, fine speckle, thin joints, a soft sheen
    const stoneT=textCanvas(512,512,(g,w,h)=>{ g.fillStyle='#6d6c69'; g.fillRect(0,0,w,h); let s4=29; const r=()=>((s4=s4*16807%2147483647)/2147483647);
      for(let i=0;i<2;i++) for(let j=0;j<2;j++){ const x0=i*256+2, y0=j*256+2, S=252, v=150+(r()-.5)*14; g.fillStyle=`rgb(${v|0},${(v-2)|0},${(v-6)|0})`; g.fillRect(x0,y0,S,S);
        for(let k=0;k<3200;k++){ g.fillStyle=r()<.5?`rgba(220,218,212,${r()*.22})`:`rgba(40,40,38,${r()*.22})`; const d=.7+r()*2.2; g.fillRect(x0+r()*S,y0+r()*S,d,d); } } });
    stoneT.wrapS=stoneT.wrapT=THREE.RepeatWrapping; stoneT.anisotropy=MAXANI;
    const stoneM=(ru,rv)=>{ const t=stoneT.clone(); t.needsUpdate=true; t.repeat.set(ru,rv); return mat(0xffffff,.62,{map:t}); };
    const glassM=mat(0xdfe9ec,.05,{transparent:true,opacity:.18,metalness:.2,depthWrite:false}), alu=mat(0x5a5c5e,.4,{metalness:.5}), nickel=mat(0xd2d5d7,.3,{metalness:.45}), copper=mat(0xb0683a,.35,{metalness:.8}), ledM=mat(0xfff0d6,.6,{emissive:0xffd2a0,emissiveIntensity:1.1});
    const face=(ax,at,a,b,n,y0,y1,m)=>{ const L0=b-a; if(L0<.01||y1-y0<.01) return; if(ax==='x') B(T,y1-y0,L0,m,at+n*T/2,(y0+y1)/2,(a+b)/2); else B(L0,y1-y0,T,m,(a+b)/2,(y0+y1)/2,at+n*T/2); };
    const wall=(ax,at,a,b,y1=CYb,t=.1,m=hk(1,1))=>{ if(ax==='x'){ B(t,y1,b-a,m,at,y1/2,(a+b)/2); OB(at-t/2,at+t/2,a,b); } else { B(b-a,y1,t,m,(a+b)/2,y1/2,at); OB(a,b,at-t/2,at+t/2); } };
    // ---- floors: hinoki in the dry half and the sauna, stone in the wet half; a stone threshold at the glass
    const fl=(x0,x1,z0,z1,m)=>{ const p=new THREE.Mesh(new THREE.PlaneGeometry(x1-x0,z1-z0),m); p.rotation.x=-Math.PI/2; p.position.set((x0+x1)/2,.01,(z0+z1)/2); scene.add(p); p.userData={type:'floor'}; pickables.push(p); };
    fl(X0,xg,Z0,Z1,hkF((xg-X0)*1.6,(Z1-Z0)/1.2)); fl(xg,X1,Z0,SZ,stoneM((X1-xg)/1.2,(SZ-Z0)/1.2)); fl(xg,X1,SZ,Z1,hkF((X1-xg)*1.6,(Z1-SZ)/1.2));
    B(.1,.02,SZ-Z0,stone,xg+.05,.012,(Z0+SZ)/2);
    B(X1-X0,.03,Z1-Z0,hk((X1-X0)/1,(Z1-Z0)/2.9),(X0+X1)/2,CYb+.015,(Z0+Z1)/2);
    // ---- the walls, clad thickly in hinoki; the front window and the octagon toward the 明間 are open again, each cased in
    //      hinoki round its opening and fitted with a bamboo blind like every other window
    const OZ0=17.25, OZ1=18.45, OY0=.95, OY1=2.15, FX0=43.7, FX1=44.9, FY0=.99, FY1=2.42;
    face('x',X0,Z0,OZ0,1,0,CYb,hk(1.4,1)); face('x',X0,OZ1,19.1,1,0,CYb,hk(.6,1));
    { const sh=new THREE.Shape(); sh.moveTo(OZ0,0); sh.lineTo(OZ1,0); sh.lineTo(OZ1,CYb); sh.lineTo(OZ0,CYb); sh.closePath(); const hp=new THREE.Path();
      for(let k=0;k<8;k++){ const a=Math.PI/8+k*Math.PI/4, x=17.85+Math.cos(a)*.565, y=1.55+Math.sin(a)*.565; k?hp.lineTo(x,y):hp.moveTo(x,y); } hp.closePath(); sh.holes.push(hp);
      const gq=new THREE.ExtrudeGeometry(sh,{depth:T,bevelEnabled:false}), uv=gq.attributes.uv, ps=gq.attributes.position; for(let k=0;k<ps.count;k++) uv.setXY(k,(ps.getX(k)-OZ0)/(OZ1-OZ0),ps.getY(k)/CYb);
      const om=new THREE.Mesh(gq,hk(.6,1)); om.rotation.y=-Math.PI/2; om.position.set(X0+T,0,0); om.receiveShadow=true; scene.add(om); }
    face('z',Z0,X0,FX0,1,0,CYb,hk(1.6,1)); face('z',Z0,FX1,X1,1,0,CYb,hk(1.6,1)); face('z',Z0,FX0,FX1,1,0,FY0,hk(1,.35)); face('z',Z0,FX0,FX1,1,FY1,CYb,hk(1,.15));
    for(const [w,h,x,y] of [[FX1-FX0+.1,.05,(FX0+FX1)/2,FY0-.025],[FX1-FX0+.1,.05,(FX0+FX1)/2,FY1+.025],[.05,FY1-FY0,FX0-.025,(FY0+FY1)/2],[.05,FY1-FY0,FX1+.025,(FY0+FY1)/2]]) B(w,h,.03,hgrain,x,y,Z0i+.015); face('x',X0,20.7,Z1,1,0,CYb,hk(2.9,1)); face('x',X0,19.1,20.7,1,2.48,CYb,hk(1.6,.15));
    face('z',Z1,X0,X1,-1,0,CYb,hk(4.6,1));
    const wz0=19.0, wz1=20.2, wy0=1.5, wy1=2.75;   // the bamboo window, kept: its opening lined and cased in hinoki
    face('x',X1,Z0,wz0,-1,0,CYb,hk(3.4,1)); face('x',X1,wz1,Z1,-1,0,CYb,hk(3.4,1)); face('x',X1,wz0,wz1,-1,0,wy0,hk(1.2,.5)); face('x',X1,wz0,wz1,-1,wy1,CYb,hk(1.2,.05));
    for(const [w,h,z,y] of [[wz1-wz0+.16,.07,(wz0+wz1)/2,wy0-.035],[wz1-wz0+.16,.07,(wz0+wz1)/2,wy1+.035],[.07,wy1-wy0,wz0-.035,(wy0+wy1)/2],[.07,wy1-wy0,wz1+.035,(wy0+wy1)/2]]) B(.04,h,w,hgrain,X1i-.02,y,z);
    B(.14,.03,wz1-wz0+.2,hgrain,X1i-.03,wy0-.07,(wz0+wz1)/2);
    // hidden light: a low hinoki valance a hand from each wall, a warm (2700 K) glow washing the ceiling above it; no bare
    // strips. BATH.glows are dimmed by day and brought up after dark.
    { const gT=textCanvas(64,32,(g,w,h)=>{ const gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,'rgba(255,255,255,.95)'); gr.addColorStop(.35,'rgba(255,255,255,.4)'); gr.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=gr; g.fillRect(0,0,w,h); });
      const gM=new THREE.MeshBasicMaterial({map:gT,color:0xffb874,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false}); BATH.glows.push(gM);
      const cove=(x0,x1,z0,z1)=>{ for(const [ax,at,a,b,n] of [['z',z0,x0,x1,1],['z',z1,x0,x1,-1],['x',x0,z0,z1,1],['x',x1,z0,z1,-1]]){ const L0=b-a, m=(a+b)/2;
          if(ax==='z'){ B(L0,.07,.015,hgrain,m,CYb-.12,at+n*.09); const p=new THREE.Mesh(new THREE.PlaneGeometry(L0,.55),gM); p.rotation.x=Math.PI/2; p.rotation.z=n>0?Math.PI:0; p.position.set(m,CYb-.004,at+n*.275); scene.add(p); }
          else { B(.015,.07,L0,hgrain,at+n*.09,CYb-.12,m); const p=new THREE.Mesh(new THREE.PlaneGeometry(L0,.55),gM); p.rotation.x=Math.PI/2; p.rotation.z=n>0?Math.PI/2:-Math.PI/2; p.position.set(at+n*.275,CYb-.004,m); scene.add(p); } } };
      cove(X0i,xg-.05,Z0i,zv0-.05); cove(X0i,xg-.05,zv1+.05,Z1i); cove(xg+.05,X1i,Z0i,SZ-.05); }
    // ---- the noren at the door from the 明間: linen, 湯 in clerical script (教育部隸書) in the middle, split down the centre
    const linen=(W2,H2)=>textCanvas(W2,H2,(g,w,h)=>{ g.fillStyle='#e9dfcb'; g.fillRect(0,0,w,h); for(let y=0;y<h;y+=2){ g.fillStyle=`rgba(160,140,110,${y%4?.05:.09})`; g.fillRect(0,y,w,1); } for(let x=0;x<w;x+=3){ g.fillStyle='rgba(255,255,255,.05)'; g.fillRect(x,0,1,h); } g.fillStyle='#8a6a4a'; g.fillRect(0,0,w,8); });
    { const nt=linen(512,530), parts=[], w2=(20.62-19.18)/2;
      for(const s2 of [0,1]){ const t=nt.clone(); t.needsUpdate=true; t.repeat.set(.5,1); t.offset.set(s2*.5,0); parts.push(t);
        const p2=new THREE.Mesh(new THREE.PlaneGeometry(w2-.006,1.48),mat(0xffffff,.9,{side:THREE.DoubleSide,map:t})); p2.position.set(41.76,2.46-.74,19.18+w2*(s2+.5)); p2.rotation.y=-Math.PI/2; scene.add(p2); p2.userData={type:'block'}; }
      const img=new Image(); img.onload=()=>{ const g=nt.image.getContext('2d'), s=300; g.drawImage(img,256-s/2,205-s/2,s,s); nt.needsUpdate=true; parts.forEach(t=>t.needsUpdate=true); }; img.src='noren-tang.png';
      C(.012,.012,1.54,hgrain,41.76,2.47,19.9,scene,8).rotation.x=Math.PI/2; }
    // ---- a wooden plate beside the noren: 女湯 or 男湯 while the household bathes, 湯 otherwise
    { const cv=document.createElement('canvas'); cv.width=96; cv.height=256; const sT=new THREE.CanvasTexture(cv); sT.colorSpace=THREE.SRGBColorSpace;
      B(.03,.48,.2,hgrain,41.762,1.62,18.78); const pl=new THREE.Mesh(new THREE.PlaneGeometry(.17,.44),mat(0xffffff,.7,{map:sT})); pl.position.set(41.745,1.62,18.78); pl.rotation.y=-Math.PI/2; scene.add(pl); pl.userData={type:'bathsign'}; pickables.push(pl);
      C(.004,.004,.14,brass,41.762,1.93,18.78,scene,6); BATH.sign={cv,sT,k:null}; }
    // ---- the entrance: a raised hinoki step, slippers, the wall ahead; an opening to each side with a plain curtain
    { wall('x',xv,zv0-.05,zv1+.05,CYb,.1,hk(2,1));
      for(const z of [zv0,zv1]){ wall('z',z,X0,op0,CYb,.1,hk(.3,1)); B(xv-op0,CYb-2.1,.1,hk(.6,.28),(op0+xv)/2,(2.1+CYb)/2,z); for(const xx of [op0,xv-.05]) B(.04,2.1,.12,hgrain,xx,1.05,z);
        const cm=mat(0xffffff,.9,{side:THREE.DoubleSide,map:linen(256,384)}); for(const s of [0,1]){ const p=plane((xv-op0)/2-.01,1.15,cm,op0+(xv-op0)*(.25+s*.5),2.1-.575,z,0); p.userData={type:'block'}; } }
      B(xv-42.3,.1,zv1-zv0-.1,hgrain,(42.3+xv)/2,.05,(zv0+zv1)/2,scene,{type:'bathin'});
      for(let i=0;i<3;i++) for(const s of [-1,1]) B(.1,.022,.25,mat(0x8a7a5a,.8),42.45+i*.16+s*.055,.112,zv1-.3); }
    // ---- the lockers: three columns, four rows of hinoki doors with real gaps, a brass number plate and a lock on each,
    //      filling the rest room's back wall from the outer wall to the glass; a soft light grazes down their doors
    const LW=xg-.05-X0i;
    { // built facing +z as before, then turned round to stand against the back wall, facing the room
      const LG=new THREE.Group(); LG.rotation.y=Math.PI; LG.position.set(2*X0i+LW,0,Z1i+Z0i); scene.add(LG);
      const B=(w,h,d,m,x,y,z,p=LG,pick=null)=>{ const o=box(w,h,d,m,x,y,z,p,pick); o.castShadow=o.receiveShadow=true; return o; }, C=(r1,r2,h,m,x,y,z,p=LG,seg=20)=>{ const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,seg),m); o.position.set(x,y,z); p.add(o); return o; };
      const lx0=X0i, lx1=X0i+LW, lz0=Z0i, LD=.44, LH=1.82, cols=3, rows=4, lt={type:'bathlock'}, cw=(lx1-lx0)/cols, rh=(LH-.12)/rows;
      B(lx1-lx0,LH,LD,hgrain,(lx0+lx1)/2,LH/2,lz0+LD/2-.01,LG,lt); B(lx1-lx0+.02,.04,LD+.02,hgrain,(lx0+lx1)/2,LH+.02,lz0+LD/2); B(lx1-lx0,.1,.02,mat(0x6a5038,.8),(lx0+lx1)/2,.05,lz0+LD+.0);
      const numT=textCanvas(512,64,(g,w,h)=>{ g.fillStyle='#b5945b'; g.fillRect(0,0,w,h); g.fillStyle='#2e2216'; g.font='700 34px "Noto Serif TC",serif'; g.textAlign='center'; g.textBaseline='middle'; for(let i=0;i<12;i++){ g.fillText(String(i+1),(i+.5)*w/12,h/2+2); } });
      let n=0; for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){ const cx=lx0+cw*(c+.5), cy=.12+rh*(rows-r-.5), dm=grainV(((r*3+c)*.27)%1,((r*7+c*3)*.19)%1,.5,.5);
        B(cw-.012,rh-.012,.022,dm,cx,cy,lz0+LD+.011,LG,lt);
        const t=numT.clone(); t.needsUpdate=true; t.repeat.set(1/12,1); t.offset.set(n/12,0); n++;
        const pl=new THREE.Mesh(new THREE.PlaneGeometry(.07,.04),mat(0xffffff,.35,{metalness:.5,map:t})); pl.position.set(cx,cy+rh*.28,lz0+LD+.024); LG.add(pl);
        C(.012,.012,.008,brass,cx,cy-rh*.05,lz0+LD+.026,LG,14).rotation.x=Math.PI/2; B(.003,.009,.004,mat(0x1a1410,.5),cx,cy-rh*.05,lz0+LD+.031);
        for(let k=0;k<3;k++) B(.08,.005,.004,mat(0x5a4028,.7),cx,cy-rh*.33+k*.016,lz0+LD+.023); }
      const wash=new THREE.Mesh(new THREE.PlaneGeometry(lx1-lx0,LH),new THREE.MeshBasicMaterial({map:textCanvas(16,128,(g,w,h)=>{ const gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,'rgba(255,255,255,.75)'); gr.addColorStop(.5,'rgba(255,255,255,.18)'); gr.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=gr; g.fillRect(0,0,w,h); }),color:0xffb874,transparent:true,opacity:.35,blending:THREE.AdditiveBlending,depthWrite:false}));
      wash.position.set((lx0+lx1)/2,LH/2+.02,lz0+LD+.035); LG.add(wash); BATH.glows.push(wash.material);
      BATH.lockPt={x:X0i+LW/2,z:Z1i-LD-.55};
      OB(X0i,X0i+LW,Z1i-LD,Z1i); }
    // the vanity: a floating hinoki counter, two white basins, slim nickel spouts from the wall, a frameless mirror that
    // reflects, a soft glow round it and under the counter, a woven basket of towels below
    { // built against the partition as before, then turned onto the front wall (local +x out of the wall → world +z)
      const VX=42.8, VZC=17.025, VG=new THREE.Group(); VG.rotation.y=-Math.PI/2; VG.position.set(VX+VZC,0,Z0i-X0i); scene.add(VG);
      const B=(w,h,d,m,x,y,z,p=VG,pick=null)=>{ const o=box(w,h,d,m,x,y,z,p,pick); o.castShadow=o.receiveShadow=true; return o; },
        C=(r1,r2,h,m,x,y,z,p=VG,seg=20,pick=null)=>{ const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,seg),m); o.position.set(x,y,z); o.castShadow=true; p.add(o); if(pick){ o.userData=pick; pickables.push(o); } return o; },
        L=(pts,m,x,y,z,p=VG,pick=null)=>{ const o=lathe(pts,m,24); o.position.set(x,y,z); o.castShadow=true; p.add(o); if(pick){ o.userData=pick; pickables.push(o); } return o; };
      const vz0=16.3, vz1=17.75, vx1=X0i+.52, top=.84, tag={type:'bathin'};
      B(vx1-X0i,.06,vz1-vz0,grainV(.1,.3,1,.6),(X0i+vx1)/2,top-.03,(vz0+vz1)/2,VG,tag);
      // standing on the floor: a hinoki cabinet open at the front, two shelves of folded towels, a recessed plinth with a
      // warm glow along the floor beneath it
      { const D0=vx1-X0i-.03, cx=X0i+D0/2, cz=(vz0+vz1)/2, sideM=grainV(.3,.6,.4,1), H0=top-.06;
        for(const z of [vz0+.0125,vz1-.0125]) B(D0,H0-.1,.025,sideM,cx,.1+(H0-.1)/2,z,VG,tag);
        B(.015,H0-.1,vz1-vz0-.05,hgrain,X0i+.008,.1+(H0-.1)/2,cz,VG,tag); B(D0,.08,vz1-vz0-.05,hgrain,cx+.005,H0-.04,cz,VG,tag);
        for(const y of [.115,.45]) B(D0-.02,.025,vz1-vz0-.05,hgrain,cx,y,cz,VG,tag);
        B(D0-.08,.1,vz1-vz0-.06,mat(0x5a4632,.8),cx-.04,.05,cz,VG);
        const toe=mat(0xfff0d6,.6,{emissive:0xffc07a,emissiveIntensity:.7}); B(.012,.008,vz1-vz0-.1,toe,X0i+D0-.06,.097,cz); BATH.toe=toe;
        const pool=new THREE.Mesh(new THREE.PlaneGeometry(.55,vz1-vz0+.1),new THREE.MeshBasicMaterial({map:SOFT_TEX,color:0xffb874,transparent:true,opacity:.28,depthWrite:false,blending:THREE.AdditiveBlending})); pool.rotation.x=-Math.PI/2; pool.position.set(X0i+D0+.05,.016,cz); VG.add(pool); BATH.glows.push(pool.material);
        const tw=[0xf6f3ee,0xe9e2d4,0xf1ece2], n=4, sp=(vz1-vz0-.08)/n;
        for(const y of [.128,.463]) for(let i=0;i<n;i++) for(let k=0;k<3;k++) B(.3,.048,sp-.05,mat(tw[(i+k)%3],.95),X0i+.2,y+.03+k*.05,vz0+.04+sp*(i+.5)); }
      OB(VX-.73,VX+.73,Z0i,Z0i+.52);
      for(const bz of [vz0+.38,vz1-.38]){ L([[0,0],[.06,0],[.15,.035],[.19,.11],[.195,.135],[.188,.14],[.18,.125],[.14,.06],[.05,.03],[0,.03]],porcelain,X0i+.28,top,bz,VG,tag);
        const esc=C(.028,.028,.012,nickel,X0i+.006,1.06,bz,VG,16); esc.rotation.z=Math.PI/2; const sp=C(.009,.009,.24,nickel,X0i+.12,1.06,bz,VG,10); sp.rotation.z=Math.PI/2;
        const tip=C(.009,.009,.03,nickel,X0i+.235,1.05,bz,VG,10); const lev=B(.008,.06,.008,nickel,X0i+.04,1.1,bz); lev.rotation.z=-.35; }
      L([[0,0],[.028,0],[.032,.12],[.02,.14],[.012,.16]],mat(0xece6dc,.35),X0i+.1,top,(vz0+vz1)/2-.08); C(.003,.003,.04,nickel,X0i+.1,top+.18,(vz0+vz1)/2-.08,VG,6);
      L([[0,0],[.035,0],[.04,.06],[.032,.08]],mat(0x7a6f62,.6),X0i+.1,top,(vz0+vz1)/2+.1); for(let i=0;i<7;i++){ const lf=new THREE.Mesh(new THREE.SphereGeometry(.022,8,6),mat(i%2?0x6f9a3a:0x8ab04a,.6)); lf.scale.set(1,.4,1.4); lf.position.set(X0i+.1+Math.cos(i*1.3)*.035,top+.1+Math.sin(i)*.02,(vz0+vz1)/2+.1+Math.sin(i*1.3)*.04); lf.rotation.y=i; VG.add(lf); }
      // the mirror
      const mw=vz1-vz0-.12, mh=.82, my=1.6, mx=X0i+.012;
      const ringT=textCanvas(256,192,(g,w,h)=>{ const im=g.createImageData(w,h), d=im.data, bx=.12*w, by=.12*h; for(let j=0;j<h;j++) for(let i=0;i<w;i++){ const dx=Math.max(bx-i,i-(w-bx),0), dy=Math.max(by-j,j-(h-by),0), r=Math.hypot(dx/bx,dy/by), k=(j*w+i)*4;
          const a=dx===0&&dy===0?0:Math.max(0,1-r)*Math.max(0,1-r); d[k]=d[k+1]=d[k+2]=255; d[k+3]=a*255; } g.putImageData(im,0,0); });
      const halo=new THREE.Mesh(new THREE.PlaneGeometry(mw/(1-.24),mh/(1-.24)),new THREE.MeshBasicMaterial({map:ringT,color:0xffc488,transparent:true,opacity:.95,depthWrite:false,blending:THREE.AdditiveBlending})); halo.position.set(X0i+.004,my,(vz0+vz1)/2); halo.rotation.y=Math.PI/2; VG.add(halo); BATH.glows.push(halo.material);
      const rt=new THREE.WebGLRenderTarget(512,320), mcam=new THREE.PerspectiveCamera();
      const mm=new THREE.ShaderMaterial({uniforms:{map:{value:rt.texture},tm:{value:new THREE.Matrix4()}},
        vertexShader:'uniform mat4 tm; varying vec4 vU; void main(){ vU=tm*modelMatrix*vec4(position,1.); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
        fragmentShader:'uniform sampler2D map; varying vec4 vU; void main(){ vec4 c=texture2DProj(map,vU); gl_FragColor=vec4(c.rgb*1.12+vec3(.03,.03,.028),1.); \n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}'});
      const mirror=new THREE.Mesh(new THREE.PlaneGeometry(mw,mh),mm); mirror.position.set(mx,my,(vz0+vz1)/2); mirror.rotation.y=Math.PI/2; VG.add(mirror); MEAL_DYN.push(mirror);
      BATH.mirror={mesh:mirror,rt,cam:mcam,mat:mm,ax:'z',at:Z0i+.012,cx:VX,clip:[new THREE.Plane(new THREE.Vector3(0,0,1),-(Z0i+.016))]}; }
    // a plain hinoki bench by the glass
    { B(.36,.05,1.4,hgrain,xg-.28,.44,17.0,scene,{type:'bathin'}); for(const z of [16.4,17.6]) B(.3,.42,.05,hgrain,xg-.28,.21,z); OB(xg-.46,xg-.1,16.3,17.7); }
    // ---- the glass partition, a solid hinoki wall where the sauna is, the sliding door in the middle
    { const dz0=19.45, dz1=20.35; for(const [a,b] of [[Z0i,dz0],[dz1,SZ]]){ B(.012,2.2,b-a,glassM,xg,1.1,(a+b)/2); B(.05,.05,b-a,alu,xg,2.2,(a+b)/2); B(.05,.03,b-a,alu,xg,.015,(a+b)/2); OB(xg-.03,xg+.03,a,b); }
      B(.05,CYb-2.2,SZ-Z0,hk(5,.25),xg,(2.2+CYb)/2,(Z0+SZ)/2); wall('x',xg,SZ,Z1i,CYb,.1,hk(2.2,1));
      const sd=new THREE.Group(); sd.position.set(xg+.035,0,(dz0+dz1)/2); scene.add(sd); B(.012,2.18,dz1-dz0,glassM,0,1.1,0,sd,{type:'bathdoor'}); B(.03,.4,.03,alu,.02,1.05,(dz1-dz0)/2-.08,sd,{type:'bathdoor'});
      BATH.door={g:sd,z0:(dz0+dz1)/2,open:false,x:xg,zc:(dz0+dz1)/2}; MEAL_DYN.push(sd); }
    // ---- the tub against the sealed front wall: hinoki, a warm strip under the rim, a submerged stone step on the walkway
    //      side, a floating tray; the spout a hinoki post on the far corner with a chute pouring a sheet of water
    { const tx0=xg+.14, tx1=X1i-.02, tz0=Z0i+.02, tz1=18.4, TH=.62, tw=.08, WY=TH-.07, tag={type:'bathtub'};
      const side=(w,d,x,z,k)=>B(w,TH,d,grainV(k*.23,k*.31,1,.5),x,TH/2,z,scene,tag);
      side(tx1-tx0,tw,(tx0+tx1)/2,tz0+tw/2,1); side(tx1-tx0,tw,(tx0+tx1)/2,tz1-tw/2,2); side(tw,tz1-tz0-2*tw,tx0+tw/2,(tz0+tz1)/2,3); side(tw,tz1-tz0-2*tw,tx1-tw/2,(tz0+tz1)/2,4);
      for(const [w,d,x,z] of [[tx1-tx0+.02,tw+.02,(tx0+tx1)/2,tz0+tw/2],[tx1-tx0+.02,tw+.02,(tx0+tx1)/2,tz1-tw/2],[tw+.02,tz1-tz0,tx0+tw/2,(tz0+tz1)/2],[tw+.02,tz1-tz0,tx1-tw/2,(tz0+tz1)/2]]) B(w,.02,d,hgrain,x,TH+.01,z);
      const rimM=mat(0xfff0d6,.6,{emissive:0xffb070,emissiveIntensity:.45}); BATH.rim=rimM; B(.02,.012,tz1-tz0-.1,rimM,tx0-.012,.07,(tz0+tz1)/2); B(tx1-tx0-.1,.012,.02,rimM,(tx0+tx1)/2,.07,tz1+.012);
      // light off the water: faint moving caustics on the side wall over the tub and the ceiling (not the front wall: its window)
      { const cv=document.createElement('canvas'); cv.width=cv.height=256; const cT=new THREE.CanvasTexture(cv); cT.wrapS=cT.wrapT=THREE.RepeatWrapping;
        const cM=new THREE.MeshBasicMaterial({map:cT,color:0xffe2b8,transparent:true,opacity:.16,blending:THREE.AdditiveBlending,depthWrite:false});
        const fade=textCanvas(64,64,(g,w,h)=>{ const r=g.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2); r.addColorStop(0,'#fff'); r.addColorStop(.6,'#bbb'); r.addColorStop(1,'#000'); g.fillStyle=r; g.fillRect(0,0,w,h); }); cM.alphaMap=fade;
        const qs=[]; for(const [w,h,x,y,z,rx,ry] of [[tz1-tz0,1.1,X1i-.004,WY+.75,(tz0+tz1)/2,0,-Math.PI/2],[tx1-tx0,tz1-tz0,(tx0+tx1)/2,CYb-.006,(tz0+tz1)/2,Math.PI/2,0]]){
          const q=new THREE.Mesh(new THREE.PlaneGeometry(w,h),cM); q.rotation.set(rx,ry,0); q.position.set(x,y,z); scene.add(q); qs.push(q); MEAL_DYN.push(q); }
        BATH.caust={cv,cT,cM,t:0}; }
      B(tx1-tx0-2*tw,.04,tz1-tz0-2*tw,hk(2,2),(tx0+tx1)/2,.06,(tz0+tz1)/2);
      const stoneStep=B(tx1-tx0-2*tw-.1,.28,.4,stone,(tx0+tx1)/2,.08+.14,tz1-tw-.22);
      const wat=new THREE.Mesh(new THREE.PlaneGeometry(tx1-tx0-2*tw,tz1-tz0-2*tw),new THREE.MeshStandardMaterial({color:0x9fbcbc,roughness:.04,metalness:.1,transparent:true,opacity:.6})); wat.rotation.x=-Math.PI/2; wat.position.set((tx0+tx1)/2,WY,(tz0+tz1)/2); scene.add(wat); BATH.water=wat;
      const mist=new THREE.Mesh(new THREE.PlaneGeometry(tx1-tx0-.3,tz1-tz0-.3),new THREE.MeshBasicMaterial({map:SOFT_TEX,transparent:true,opacity:.2,depthWrite:false,color:0xffffff})); mist.rotation.x=-Math.PI/2; mist.position.set((tx0+tx1)/2,WY+.1,(tz0+tz1)/2); scene.add(mist); BATH.mist=mist; MEAL_DYN.push(mist);
      OB(tx0,tx1,tz0,tz1);
      // the spout: a hinoki post standing in the far corner, a capped head, a U-shaped chute angled down toward the middle
      const px=tx1-.11, pz=tz1-.11, ph=1.02, sp=new THREE.Group(); sp.position.set(px,0,pz); sp.rotation.y=Math.atan2(-((tx0+tx1)/2-px),-((tz0+tz1)/2-pz))+Math.PI; scene.add(sp);
      B(.16,ph,.16,grainV(.4,.1,.3,1),0,ph/2,0,sp,tag); B(.22,.04,.22,hgrain,0,ph+.02,0,sp); B(.18,.06,.18,hgrain,0,ph+.07,0,sp); B(.24,.025,.24,hgrain,0,ph+.112,0,sp);
      const ch=new THREE.Group(); ch.position.set(0,ph-.16,.08); ch.rotation.x=.26; sp.add(ch);
      B(.12,.02,.36,hgrain,0,0,.18,ch); for(const s of [-1,1]) B(.02,.06,.36,hgrain,s*.06,.03,.18,ch); const wfl=B(.08,.006,.34,mat(0xcfe2e4,.05,{transparent:true,opacity:.7}),0,.014,.18,ch);
      // the falling sheet of water, its streaks scrolling down
      const fallT=textCanvas(64,256,(g,w,h)=>{ g.clearRect(0,0,w,h); for(let i=0;i<26;i++){ const x=Math.random()*w; g.fillStyle=`rgba(255,255,255,${.25+Math.random()*.5})`; g.fillRect(x,0,1+Math.random()*2,h); } const gr=g.createLinearGradient(0,0,w,0); gr.addColorStop(0,'rgba(220,235,240,0)'); gr.addColorStop(.2,'rgba(220,235,240,.5)'); gr.addColorStop(.8,'rgba(220,235,240,.5)'); gr.addColorStop(1,'rgba(220,235,240,0)'); g.fillStyle=gr; g.fillRect(0,0,w,h); });
      fallT.wrapT=THREE.RepeatWrapping; sp.updateMatrixWorld(true); const L0=new THREE.Vector3(0,.02,.37).applyMatrix4(ch.matrixWorld);
      const fh=L0.y-WY, fg=new THREE.PlaneGeometry(.085,fh,1,8), dir=new THREE.Vector3(0,0,1).applyQuaternion(sp.quaternion).setY(0).normalize();
      const pa=fg.attributes.position; for(let i=0;i<pa.count;i++){ const t=(fh/2-pa.getY(i))/fh; pa.setZ(i,.16*Math.sqrt(t)); } fg.computeVertexNormals();
      const fall=new THREE.Mesh(fg,new THREE.MeshBasicMaterial({map:fallT,transparent:true,opacity:.85,depthWrite:false,side:THREE.DoubleSide})); fall.position.set(L0.x,WY+fh/2,L0.z); fall.lookAt(L0.x-dir.x,WY+fh/2,L0.z-dir.z); fall.rotateY(Math.PI); scene.add(fall); MEAL_DYN.push(fall); const fall2=fall.clone(); fall2.scale.x=.5; fall2.rotateY(Math.PI/2); scene.add(fall2); MEAL_DYN.push(fall2);
      const hitX=L0.x+dir.x*.16, hitZ=L0.z+dir.z*.16;
      const foam=new THREE.Mesh(new THREE.CircleGeometry(.09,20),new THREE.MeshBasicMaterial({map:SOFT_TEX,color:0xffffff,transparent:true,opacity:.6,depthWrite:false})); foam.rotation.x=-Math.PI/2; foam.position.set(hitX,WY+.004,hitZ); scene.add(foam); MEAL_DYN.push(foam);
      const rip=[]; for(let k=0;k<4;k++){ const r=new THREE.Mesh(new THREE.RingGeometry(.05,.062,28),new THREE.MeshBasicMaterial({color:0xf2f8fa,transparent:true,opacity:0,depthWrite:false})); r.rotation.x=-Math.PI/2; r.position.set(hitX,WY+.002,hitZ); scene.add(r); rip.push(r); MEAL_DYN.push(r); }
      BATH.pour={pour:fall,tex:fallT,foam,rip,x:hitX,z:hitZ}; OB(px-.12,px+.12,pz-.12,pz+.12);
      // the floating tray with a small porcelain bottle of cold water and two cups
      const tray=new THREE.Group(); tray.position.set((tx0+tx1)/2-.15,WY+.01,(tz0+tz1)/2); scene.add(tray); B(.34,.03,.26,hgrain,0,0,0,tray); for(const [x,z] of [[-.12,-.08],[-.12,.08],[.12,-.08],[.12,.08]]) B(.03,.05,.03,hgrain,x,.025,z,tray);
      L([[0,0],[.035,0],[.045,.08],[.03,.12],[.015,.14]],porcelain,-.06,.015,0,tray); for(let i=0;i<2;i++) L([[0,0],[.02,0],[.025,.035]],porcelain,.08,.015,-.05+i*.1,tray); BATH.tray=tray; MEAL_DYN.push(tray);
      const tl=new THREE.PointLight(0xffc890,.5,4.5,2); BATH.lights.push([tl,.5]); tl.position.set((tx0+tx1)/2,2.2,(tz0+tz1)/2); scene.add(tl);
      BATH.tubC={x:(tx0+tx1)/2,z:(tz0+tz1)/2,sx:(tx1-tx0)/2-.2,sz:(tz1-tz0)/2-.2};
      for(const [x,z,yaw] of [[tx0+.75,tz1-.5,0],[tx1-.95,tz1-.5,0],[tx0+.75,tz0+.55,Math.PI],[tx1-.95,tz0+.55,Math.PI]]){ const si=addSeat(x,z,yaw,'bath',NT('bath.seat')); SEATS[si].ap={x,z:tz1+.5}; BATH.seats.push(si); }
      for(const o of [wat,stoneStep]){ o.userData={type:'seat',si:BATH.seats[1],group:BATH.seats}; pickables.push(o); } }
    // ---- the washing place under the bamboo window: two seated places (stool, bucket, a thermostatic bar with a hand
    //      shower on a rail, a shelf of bottles), then a rain shower behind a glass screen with a square head in the ceiling
    { const wt={type:'bathwash'};
      for(const wz of [18.72,19.27,19.82,20.37]){ const sx=X1i-.42;
        B(.3,.24,.24,hgrain,sx,.12,wz); L([[0,0],[.11,0],[.12,.19],[.125,.2]],hgrain,sx-.32,0,wz+.18); for(const y of [.05,.15]){ const b=new THREE.Mesh(new THREE.TorusGeometry(.12,.005,5,24),copper); b.rotation.x=Math.PI/2; b.position.set(sx-.32,y,wz+.18); scene.add(b); }
        const bar=C(.022,.022,.3,nickel,X1i-.04,.62,wz,scene,14,wt); bar.rotation.x=Math.PI/2; for(const s of [-1,1]){ const k=C(.026,.026,.035,nickel,X1i-.06,.62,wz+s*.17,scene,14,wt); k.rotation.z=Math.PI/2; }
        B(.012,.7,.012,nickel,X1i-.02,1.05,wz+.11); const hs=C(.018,.024,.17,nickel,X1i-.06,1.24,wz+.11,scene,12,wt); hs.rotation.z=.4; C(.03,.03,.012,nickel,X1i-.1,1.31,wz+.11,scene,14).rotation.z=Math.PI/2+.4;
        B(.1,.012,.26,hgrain,X1i-.05,.95,wz-.04); for(let i=0;i<2;i++) C(.022,.022,.13,mat([0xf2efe8,0x2f3a34][i],.3),X1i-.06,1.02,wz-.12+i*.08,scene,12);
        const si=addSeat(sx,wz,-Math.PI/2,'wstool',NT('wash.seat')); SEATS[si].ap={x:sx-.6,z:wz}; BATH.wseats.push(si);
        const hit=new THREE.Mesh(new THREE.BoxGeometry(.32,.08,.28),new THREE.MeshBasicMaterial({visible:false})); hit.position.set(sx,.26,wz); hit.userData={type:'seat',si}; scene.add(hit); pickables.push(hit); MEAL_DYN.push(hit); }
      const sz0=20.66, shx=X1i-.45, shz=21.03;
      B(X1i-(X1i-.95),2.0,.012,glassM,X1i-.475,1.0,sz0); B(.95,.04,.04,alu,X1i-.475,2.0,sz0); OB(X1i-.95,X1i,sz0-.03,sz0+.03);
      B(.32,.012,.32,nickel,shx,CYb-.006,shz,scene,{type:'bathshower'}); const holeM=mat(0x2a2c2e,.4); for(let i=0;i<6;i++) for(let j=0;j<6;j++) C(.005,.005,.004,holeM,shx-.125+i*.05,CYb-.014,shz-.125+j*.05,scene,6);
      C(.045,.045,.02,nickel,X1i-.01,1.15,shz,scene,20,{type:'bathshower'}).rotation.z=Math.PI/2; B(.012,.006,.03,mat(0x2a2a2a,.4),X1i-.025,1.15,shz,scene,{type:'bathshower'});
      B(.02,.3,.3,hk(.4,.3),X1i-.01,1.5,shz); B(.12,.012,.3,hgrain,X1i-.06,1.36,shz); for(let i=0;i<3;i++) C(.026,.026,.15,mat([0xf2efe8,0xc9d9c4,0x2f3a34][i],.3),X1i-.06,1.44,shz-.09+i*.09,scene,12);
      const rain=[]; for(let i=0;i<44;i++){ const d=new THREE.Mesh(new THREE.CylinderGeometry(.002,.002,.12,3),mat(0xeaf4f8,.05,{transparent:true,opacity:.55})); d.visible=false; scene.add(d); rain.push({d,x:shx+(Math.random()-.5)*.28,z:shz+(Math.random()-.5)*.28,ph:Math.random()}); MEAL_DYN.push(d); }
      const fog=[]; for(let i=0;i<6;i++){ const s=new THREE.Sprite(new THREE.SpriteMaterial({color:0xffffff,transparent:true,opacity:0,depthWrite:false,map:SOFT_TEX})); scene.add(s); fog.push({s,ph:i/6}); MEAL_DYN.push(s); }
      BATH.shower={on:false,rain,fog,x:shx,z:shz}; }
    // ---- the sauna
    { const tag={type:'bathsauna'}, dX0=xg+.25, dX1=xg+.95;
      for(const [a,b] of [[xg+.05,dX0],[dX1,X1i]]) wall('z',SZ,a,b,CYb,.1,hk((b-a)/.5,1)); B(dX1-dX0,CYb-2.05,.1,hk(1,.3),(dX0+dX1)/2,(2.05+CYb)/2,SZ);
      for(const xx of [dX0,dX1]) B(.05,2.05,.12,hgrain,xx,1.025,SZ); B(dX1-dX0+.05,.05,.12,hgrain,(dX0+dX1)/2,2.05,SZ);
      const sdr=new THREE.Group(); sdr.position.set(dX0,0,SZ-.06); scene.add(sdr); const dw=dX1-dX0; B(dw-.02,2.0,.035,hgrain,dw/2,1.0,0,sdr,{type:'bathsdoor'}); const slitM=mat(0xc8a46c,.2,{transparent:true,opacity:.4,emissive:0xffa030,emissiveIntensity:0}); B(.16,1.5,.04,slitM,dw/2+.12,1.1,0,sdr,{type:'bathsdoor'}); B(.03,.3,.03,hgrain,dw-.1,1.05,-.04,sdr);
      // a hinoki bolt on the inside: slide it across and the door stays shut, the lamps come up
      B(.14,.035,.03,hgrain,dw-.17,1.25,.035,sdr,{type:'bathlatch'}); B(.03,.07,.025,hgrain,dw-.08,1.25,.03,sdr,{type:'bathlatch'});
      BATH.sdoor={g:sdr,open:false,locked:false,x0:dX0,x1:dX1,z:SZ,slitM}; MEAL_DYN.push(sdr);
      for(let i=0;i<12;i++) B(X1i-xg-.1,.02,.1,hk(2,.07),(xg+X1i)/2,.03,SZ+.15+i*.18);
      const sx0=xg+.1, sx1=X1i-.02; B(sx1-sx0,.06,.5,hgrain,(sx0+sx1)/2,.9,Z1i-.27,scene,tag); B(sx1-sx0,.06,.5,hgrain,(sx0+sx1)/2,.45,Z1i-.77,scene,tag); B(sx1-sx0,.42,.04,hgrain,(sx0+sx1)/2,.66,Z1i-.52); B(sx1-sx0,.42,.04,hgrain,(sx0+sx1)/2,.22,Z1i-1.02);
      B(.5,.06,Z1i-1.04-SZ-.8,hgrain,sx1-.25,.45,(SZ+.8+Z1i-1.04)/2,scene,tag); B(.04,.42,Z1i-1.04-SZ-.8,hgrain,sx1-.5,.22,(SZ+.8+Z1i-1.04)/2);
      for(let i=0;i<6;i++) B(.016,.4,.016,hgrain,sx0+.3+i*.08,.22,Z1i-1.045);
      OB(sx0,sx1,Z1i-1.04,Z1i); OB(sx1-.5,sx1,SZ+.8,Z1i-1.04);
      // the heat: bolt the door and the room fills with strong warm amber light, like an infrared cabin
      { const rl=new THREE.PointLight(0xffa23a,0,4.6,1.6); rl.position.set((xg+X1i)/2,2.2,(SZ+Z1i)/2); scene.add(rl);
        const rl2=new THREE.PointLight(0xff9a30,0,3.4,1.8); rl2.position.set((xg+X1i)/2,1.0,Z1i-.6); scene.add(rl2);
        BATH.sauna={rl,rl2,T:28,x0:xg+.05,x1:X1i,z0:SZ+.05,z1:Z1i,since:0,reminded:false,k:0}; }
      const lampM=mat(0xfff4e4,.5,{emissive:0xffd9a8,emissiveIntensity:.9,side:THREE.DoubleSide}); BATH.sauna.lampM=lampM;
      for(const [x,z] of [[xg+.1,SZ+.8],[X1i-.02,SZ+.8]]){ const lamp=new THREE.Mesh(new THREE.SphereGeometry(.09,14,10,0,Math.PI),lampM); lamp.rotation.y=x<45?Math.PI/2:-Math.PI/2; lamp.position.set(x,2.25,z); scene.add(lamp); }
      B(.3,.012,.3,mat(0x3a3028,.6),(xg+X1i)/2,CYb-.006,SZ+.6); for(let i=0;i<6;i++) B(.3,.004,.02,hgrain,(xg+X1i)/2,CYb-.012,SZ+.47+i*.05);
      // the thermometer by the door shows the heat
      { const cv=document.createElement('canvas'); cv.width=128; cv.height=200; const tT=new THREE.CanvasTexture(cv); tT.colorSpace=THREE.SRGBColorSpace;
        B(.02,.24,.15,hgrain,xg+.06,1.55,SZ+.28); const th=new THREE.Mesh(new THREE.PlaneGeometry(.12,.19),mat(0xffffff,.5,{map:tT})); th.position.set(xg+.072,1.55,SZ+.28); th.rotation.y=Math.PI/2; scene.add(th); BATH.therm={cv,tT,last:-1}; }
      for(const [x,z,kind] of [[xg+.6,Z1i-.77,'sauna'],[xg+1.3,Z1i-.77,'sauna'],[xg+.6,Z1i-.27,'sauna2'],[xg+1.3,Z1i-.27,'sauna2'],[sx1-.25,SZ+.95,'sauna']]){ const side=x>sx1-.5; const si=addSeat(x,z,side?Math.PI/2:0,kind,NT('sauna.seat')); SEATS[si].ap=side?{x:sx1-.95,z}:{x,z:Z1i-1.5}; BATH.sseats.push(si);
        const hit=new THREE.Mesh(new THREE.BoxGeometry(.5,.08,.46),new THREE.MeshBasicMaterial({visible:false})); hit.position.set(x,kind==='sauna2'?.95:.5,z); hit.userData={type:'seat',si}; scene.add(hit); pickables.push(hit); MEAL_DYN.push(hit); }
      const sl=new THREE.PointLight(0xffb070,.35,2.8,2); BATH.lights.push([sl,.35]); sl.position.set((xg+X1i)/2,2.3,(SZ+Z1i)/2); scene.add(sl); }
    // ---- one soft light for the dry half; steam particles over the tub and the spout
    { const pl=new THREE.PointLight(0xffc890,.45,5.5,2); pl.position.set(42.9,CYb-.3,19.9); scene.add(pl); BATH.lights.push([pl,.45]); }
    for(let i=0;i<40;i++){ const s=new THREE.Sprite(new THREE.SpriteMaterial({color:0xffffff,transparent:true,opacity:0,depthWrite:false,map:SOFT_TEX})); scene.add(s); BATH.steam.push({s,ph:i/40,x:(Math.random()-.5),z:(Math.random()-.5),spout:i>=32}); MEAL_DYN.push(s); }
  }

  // ------------------------------------------------------------ what is on the table
  // each meal is one group built from simple shapes, merged by material so a full table is a handful of draws
  const merged=(g)=>{ g.updateMatrixWorld(true); const by=new Map(); g.traverse(o=>{ if(!o.isMesh) return; const k=o.material.uuid; if(!by.has(k)) by.set(k,{m:o.material,geos:[]}); const gg=o.geometry.clone().applyMatrix4(o.matrixWorld); for(const n of Object.keys(gg.attributes)) if(!['position','normal','uv'].includes(n)) gg.deleteAttribute(n); if(!gg.attributes.uv){ gg.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(gg.attributes.position.count*2),2)); } by.get(k).geos.push(gg); });
    const out=new THREE.Group(); for(const {m,geos} of by.values()){ const mesh=new THREE.Mesh(mergeGeos(geos),m); mesh.castShadow=true; mesh.userData={type:'dtable'}; pickables.push(mesh); out.add(mesh); } out.visible=false; scene.add(out); MEAL_DYN.push(out); return out; };
  const food=c=>mat(c,.55), Y=DINE.top;
  const dish=(g,x,z,r,fill,heap=.03,kind='plate')=>{ const P=new THREE.Group(); P.position.set(x,Y,z); g.add(P);
    if(kind==='plate'){ L([[0,0],[r*.7,0],[r,.025],[r*1.02,.03]],porcelain,0,0,0,P); const rr=new THREE.Mesh(new THREE.TorusGeometry(r*.98,.006,6,32),rim); rr.rotation.x=Math.PI/2; rr.position.y=.028; P.add(rr);
      const f=new THREE.Mesh(new THREE.SphereGeometry(r*.72,18,10,0,Math.PI*2,0,Math.PI/2),food(fill)); f.scale.y=heap/(r*.72); f.position.y=.02; P.add(f); }
    else if(kind==='bowl'){ L([[0,0],[r*.55,0],[r*.9,r*.5],[r,r*.85]],porcelain,0,0,0,P); const rr=new THREE.Mesh(new THREE.TorusGeometry(r,.006,6,28),rim); rr.rotation.x=Math.PI/2; rr.position.y=r*.85; P.add(rr);
      const s=new THREE.Mesh(new THREE.CircleGeometry(r*.94,24),food(fill)); s.rotation.x=-Math.PI/2; s.position.y=r*.72; P.add(s); }
    else if(kind==='pot'){ L([[0,0],[r*.8,0],[r,.05],[r,r*.9],[r*.92,r]],clayDark,0,0,0,P); const s=new THREE.Mesh(new THREE.CircleGeometry(r*.9,24),food(fill)); s.rotation.x=-Math.PI/2; s.position.y=r*.9; P.add(s);
      for(const sx of [-1,1]){ const h=new THREE.Mesh(new THREE.TorusGeometry(.03,.008,6,12),clayDark); h.position.set(sx*(r+.02),r*.7,0); h.rotation.y=Math.PI/2; P.add(h); } }
    else if(kind==='steamer'){ for(let i=0;i<2;i++){ C(r,r,.09,bamboo,0,.045+i*.092,0,P,24); const b=new THREE.Mesh(new THREE.TorusGeometry(r,.008,6,24),bambooDk); b.rotation.x=Math.PI/2; b.position.y=.09+i*.092; P.add(b); }
      L([[0,0],[r,0],[r*.7,.06],[0,.08]],bamboo,0,.185,0,P);
      for(let i=0;i<5;i++){ const a=i*1.26; const bun=new THREE.Mesh(new THREE.SphereGeometry(.05,12,8),food(fill)); bun.scale.y=.75; bun.position.set(Math.cos(a)*r*.55,.2,Math.sin(a)*r*.55); P.add(bun); } P.scale.y=1; }
    else if(kind==='tub'){ C(r,r*.9,r*1.0,wood,0,r*.5,0,P,24); for(const y of [.25,.75]){ const b=new THREE.Mesh(new THREE.TorusGeometry(r*.96,.008,6,24),brass); b.rotation.x=Math.PI/2; b.position.y=r*y; P.add(b); } const s=new THREE.Mesh(new THREE.CircleGeometry(r*.9,24),food(fill)); s.rotation.x=-Math.PI/2; s.position.y=r*.98; P.add(s); }
    return P; };
  const cubes=(P,c,n,s=.03,spread=.06)=>{ for(let i=0;i<n;i++){ const a=i*2.3, d=(i%3)*spread*.5; B(s,s,s,food(c),Math.cos(a)*d,.045,Math.sin(a)*d,P).rotation.y=a; } };
  const eggs=(P,n,r=.03)=>{ for(let i=0;i<n;i++){ const a=i*2.1; const e=new THREE.Mesh(new THREE.SphereGeometry(r,12,8),food(0xf3efe2)); e.scale.y=.55; e.position.set(Math.cos(a)*.05,.04,Math.sin(a)*.05); P.add(e); const yk=new THREE.Mesh(new THREE.SphereGeometry(r*.45,10,6),food(0xe7a52a)); yk.scale.y=.6; yk.position.set(Math.cos(a)*.05,.052,Math.sin(a)*.05); P.add(yk); } };
  const ring=(n,rad,fn)=>{ for(let i=0;i<n;i++){ const a=i/n*Math.PI*2+.3; fn(DINE.x+Math.cos(a)*rad,DINE.z+Math.sin(a)*rad,i); } };
  // the place settings: a bowl, chopsticks on a rest, a spoon, at each of the twelve places
  const places=new THREE.Group();
  for(const s of DINE.seats){ const a=Math.atan2(s.z-DINE.z,s.x-DINE.x), px=DINE.x+Math.cos(a)*(DINE.r-.13), pz=DINE.z+Math.sin(a)*(DINE.r-.13);
    const bw=dish(places,px,pz,.055,0xf4f0e6,0,'bowl'); const tx=-Math.sin(a), tz=Math.cos(a);
    for(const o of [-.008,.008]){ const ch=B(.006,.006,.22,bamboo,px+tx*.09+Math.cos(a)*o,Y+.014,pz+tz*.09+Math.sin(a)*o,places); ch.rotation.y=-a; }
    B(.02,.012,.035,porcelain,px+tx*.09-Math.cos(a)*.07,Y+.006,pz+tz*.09-Math.sin(a)*.07,places).rotation.y=-a; }
  DINE.places=merged(places);
  const sets={};
  { const g=new THREE.Group();   // breakfast: congee, a steamer of buns, small dishes
    dish(g,DINE.x,DINE.z,.14,0xf2e9d2,0,'pot'); dish(g,DINE.x+.27,DINE.z-.06,.13,0xf3efe6,0,'steamer');
    ring(6,.36,(x,z,k)=>{ const P=dish(g,x,z,.075,[0x6f8f3a,0xc98a3c,0xb0402e,0x8a6a3a,0x3f6d2c,0xe7c25b][k],.02); if(k===1) eggs(P,2,.028); if(k===2) cubes(P,0xb84a3a,3,.028); });
    sets.b=merged(g); }
  { const g=new THREE.Group();   // lunch: a big pot of noodle soup, greens, braised things, little dishes
    const P0=dish(g,DINE.x,DINE.z,.17,0xd99a52,0,'pot'); for(let i=0;i<6;i++){ const n=C(.004,.004,.2,food(0xf0dfa8),Math.cos(i)*.06,.16,Math.sin(i)*.06,P0,6); n.rotation.z=1.2; n.rotation.y=i; }
    ring(5,.36,(x,z,k)=>{ const P=dish(g,x,z,.085,[0x3f7a2e,0x4b3424,0xdcc9a0,0xb8442c,0xe0c66a][k],.025); if(k===1) cubes(P,0x5a3a26,4,.03); if(k===2) eggs(P,2); });
    sets.l=merged(g); }
  { const g=new THREE.Group();   // dinner: a clay pot of soup in the middle, a rice tub, eight dishes in five colours
    dish(g,DINE.x,DINE.z,.15,0xe9dfc4,0,'pot'); dish(g,DINE.x+.3,DINE.z+.22,.1,0xfbf8ef,0,'tub');
    ring(7,.37,(x,z,k)=>{ const P=dish(g,x,z,.09,[0x3c7a2a,0xd8452e,0xe8c24a,0x3a2a22,0xf1ece0,0xd9832e,0x5a8a3a][k],.03);
      if(k===1){ eggs(P,1,.04); cubes(P,0xc8402c,3,.03); } if(k===3) cubes(P,0x2b211b,5,.03); if(k===4) cubes(P,0xf6f2e6,5,.035); if(k===5) cubes(P,0xe08a30,4,.035); });
    sets.d=merged(g); }
  { const g=new THREE.Group();   // late noodles: one pot and two small dishes
    const P0=dish(g,DINE.x,DINE.z,.15,0xe3c79a,0,'pot'); for(let i=0;i<5;i++){ const n=C(.004,.004,.18,food(0xf3e6c0),Math.cos(i)*.05,.14,Math.sin(i)*.05,P0,6); n.rotation.z=1.2; n.rotation.y=i; }
    dish(g,DINE.x-.3,DINE.z+.1,.075,0x3f7a2e,.02); dish(g,DINE.x+.3,DINE.z-.1,.075,0x8a5a32,.02); sets.n=merged(g); }
  { const g=new THREE.Group();   // between meals: a bamboo cover over the leftovers and a pot of tea
    L([[.32,0],[.3,.06],[.24,.16],[.12,.24],[0,.26]],mat(0xc9ad6e,.8,{side:THREE.DoubleSide}),DINE.x,Y,DINE.z,g); C(.02,.02,.03,bambooDk,DINE.x,Y+.27,DINE.z,g,8);
    L([[0,0],[.07,0],[.09,.05],[.07,.1],[.03,.11]],mat(0x8a4b32,.35),DINE.x+.38,Y,DINE.z-.2,g); for(let i=0;i<3;i++) L([[0,0],[.022,0],[.032,.04]],porcelain,DINE.x+.3+i*.08,Y,DINE.z-.36,g);
    sets.x=merged(g); sets.x.visible=true; }
  DINE.sets=sets;
  // ------------------------------------------------------------ 二進西廂南間：教室
  // A schoolroom along the long axis: the platform, blackboard and roller screen against the solid west wall, the teacher's
  // desk in the middle of the platform, five double desks in two columns facing it (the door side keeps its front place
  // free so the doorway stays clear), a low bookcase under the court window, a projector hung from the roof. The blackboard
  // and the projection are shared by everyone in the house at the time; nothing is kept once everyone has gone.
  { const X0=CLS_PLAT.x0, X1=CLS_PLAT.x1, Z0=15.6, Z1=CLS_PLAT.z1, XC=(X0+X1)/2, PZ=CLS_PLAT.z0, PH=CLS_PLAT.h;
    const BW=3.2, BH=1.25, BY0=PH+.95, BY=BY0+BH/2, SW=3.2, SH=1.8, STOP=2.905, SZ=Z1-.155;
    const roof=z=>5.88-.5*Math.abs(z-19.6)-.06;
    const wl=WD_WAL, dk=WD_WALD, hd=WD_HHD, metal=mat(0x2b2b2d,.55,{metalness:.35}), felt=mat(0x6c6a66,.95), cream=mat(0xefe6cf,.85), blueCover=mat(0x2f3d57,.8), blueCover2=mat(0x3d4a5e,.8), inkM=mat(0x1d1c1b,.45);
    // ---- platform: walnut boards, 15 cm, a darker nosing along the front
    B(X1-X0,PH,Z1-PZ,wl.H,XC,PH/2,(PZ+Z1)/2,scene,{type:'floor'});
    B(X1-X0,.03,.045,dk.H,XC,PH-.012,PZ+.02);
    // ---- the blackboard: slate green in a dark walnut frame, a chalk tray below
    const BCV=document.createElement('canvas'); BCV.width=2048; BCV.height=800;
    const BG=document.createElement('canvas'); BG.width=2048; BG.height=800;
    { const g=BG.getContext('2d'); g.fillStyle='#2c3a32'; g.fillRect(0,0,2048,800); let s=11; const r=()=>((s=s*16807%2147483647)/2147483647);
      for(let i=0;i<46;i++){ const x=r()*2048, y=r()*800, R=80+r()*280, gr=g.createRadialGradient(x,y,0,x,y,R); gr.addColorStop(0,`rgba(222,228,218,${.02+r()*.035})`); gr.addColorStop(1,'rgba(222,228,218,0)'); g.fillStyle=gr; g.fillRect(x-R,y-R,2*R,2*R); }
      for(let i=0;i<30000;i++){ g.fillStyle=r()<.5?`rgba(255,255,255,${r()*.05})`:`rgba(0,0,0,${r()*.09})`; g.fillRect(r()*2048,r()*800,1+r()*1.6,1+r()*1.6); } }
    const bx=BCV.getContext('2d'); bx.drawImage(BG,0,0); const bgPat=bx.createPattern(BG,'no-repeat');
    const boardTex=new THREE.CanvasTexture(BCV); boardTex.colorSpace=THREE.SRGBColorSpace; boardTex.anisotropy=MAXANI;
    const boardM=new THREE.MeshStandardMaterial({map:boardTex,roughness:.86,emissive:0xffffff,emissiveMap:boardTex,emissiveIntensity:.14});
    const pkB={type:'clsboard'};
    const slate=plane(BW,BH,boardM,XC,BY,Z1-.035,Math.PI,scene,pkB); slate.receiveShadow=true; NPC_DYN.push(slate);
    { const fw=.08, fd=.06, fz=Z1-fd/2;
      B(BW+2*fw,fw,fd,dk.H,XC,BY0-fw/2,fz,scene,pkB); B(BW+2*fw,fw,fd,dk.H,XC,BY0+BH+fw/2,fz,scene,pkB);
      B(fw,BH,fd,dk.V,XC-BW/2-fw/2,BY,fz,scene,pkB); B(fw,BH,fd,dk.V,XC+BW/2+fw/2,BY,fz,scene,pkB);
      const ty=BY0-fw; B(BW+.12,.022,.11,dk.H,XC,ty-.011,Z1-.055,scene,pkB); B(BW+.12,.028,.014,dk.H,XC,ty+.003,Z1-.106,scene,pkB);
      [[0xf3f0e6,-1.25],[0xf2d36a,-1.16],[0xe07a68,-1.07],[0x86b2de,-.98],[0xf3f0e6,.95]].forEach(([c,dx],i)=>{ const ch=C(.0065,.0065,.075,mat(c,.95),XC+dx,ty+.0065,Z1-.07+(i%2)*.012,scene,8,pkB); ch.rotation.z=Math.PI/2; ch.rotation.y=(i-2)*.12; });
      B(.13,.026,.05,mat(0xc9a77a,.7),XC+1.2,ty+.024,Z1-.07,scene,pkB); B(.13,.012,.05,felt,XC+1.2,ty+.006,Z1-.07,scene,pkB); }
    // ---- the roller screen in a walnut box above the board; it comes down over the board, a weighted bar at its foot
    B(SW+.26,.15,.17,dk.H,XC,STOP+.075,Z1-.085); for(const sx of [-1,1]) B(.03,.17,.19,dk.V,XC+sx*(SW/2+.145),STOP+.075,Z1-.095);
    const PCV=document.createElement('canvas'); PCV.width=1920; PCV.height=1080; const px=PCV.getContext('2d'); px.fillStyle='#111'; px.fillRect(0,0,1920,1080);
    const projTex=new THREE.CanvasTexture(PCV); projTex.colorSpace=THREE.SRGBColorSpace; projTex.anisotropy=MAXANI;
    const scrGeo=new THREE.PlaneGeometry(SW,SH); scrGeo.translate(0,-SH/2,0);
    const scrM=new THREE.MeshBasicMaterial({color:0xe9e6de}), scr=new THREE.Mesh(scrGeo,scrM); scr.rotation.y=Math.PI; scr.position.set(XC,STOP,SZ); scr.visible=false; scene.add(scr); scr.userData={type:'clsproj'}; pickables.push(scr); NPC_DYN.push(scr);
    const bar=B(SW+.06,.032,.032,dk.H,XC,STOP-.016,SZ); bar.userData={type:'clsscreen'}; pickables.push(bar); NPC_DYN.push(bar);
    // ---- the projector, hung from the roof on a rod, and its faint beam
    const PJZ=20.0, PJY=3.0, lens=new THREE.Vector3(XC,PJY-.01,PJZ+.16);
    { const pk={type:'clsproj'}, pj=new THREE.Group(); scene.add(pj);
      B(.3,.1,.27,metal,XC,PJY,PJZ,pj,pk); B(.24,.012,.2,mat(0x3a3a3c,.5,{metalness:.4}),XC,PJY+.056,PJZ,pj);
      const ln=C(.038,.042,.04,mat(0x111112,.25,{metalness:.5}),lens.x,lens.y,PJZ+.145,pj,20,pk); ln.rotation.x=Math.PI/2;
      const gl=new THREE.Mesh(new THREE.CircleGeometry(.028,20),mat(0x334455,.1,{metalness:.6})); gl.position.set(lens.x,lens.y,PJZ+.166); pj.add(gl);
      C(.012,.012,roof(PJZ)-(PJY+.05),metal,XC,(roof(PJZ)+PJY+.05)/2,PJZ,pj,8); B(.12,.01,.12,metal,XC,PJY+.055,PJZ,pj); }
    const beamG=new THREE.BufferGeometry(); { const L=lens, a=[XC-SW/2,STOP,SZ+.003], b=[XC+SW/2,STOP,SZ+.003], c=[XC+SW/2,STOP-SH,SZ+.003], d=[XC-SW/2,STOP-SH,SZ+.003], l=[L.x,L.y,L.z];
      beamG.setAttribute('position',new THREE.Float32BufferAttribute([...l,...a,...b, ...l,...b,...c, ...l,...c,...d, ...l,...d,...a],3)); }
    const beam=new THREE.Mesh(beamG,new THREE.MeshBasicMaterial({color:0xfff3dc,transparent:true,opacity:.045,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending})); beam.visible=false; scene.add(beam); NPC_DYN.push(beam);
    const laser=new THREE.Mesh(new THREE.PlaneGeometry(.07,.07),new THREE.MeshBasicMaterial({map:SOFT_TEX,color:0xff2a1a,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending})); laser.rotation.y=Math.PI; laser.visible=false; scene.add(laser); NPC_DYN.push(laser);
    // ---- a brass lever beside the board raises and lowers the screen
    const lever=new THREE.Group(); lever.position.set(XC+BW/2+.42,PH+1.3,Z1-.03); scene.add(lever); NPC_DYN.push(lever);
    { const pk={type:'clsscreen'}; B(.11,.24,.024,dk.V,XC+BW/2+.42,PH+1.3,Z1-.012,scene,pk); B(.016,.15,.006,inkM,XC+BW/2+.42,PH+1.3,Z1-.026);
      const rod=C(.007,.007,.11,brass,0,.055,-.012,lever,8,pk); const kn=new THREE.Mesh(new THREE.SphereGeometry(.018,12,10),brass); kn.position.set(0,.11,-.012); lever.add(kn); kn.userData=pk; pickables.push(kn); }
    // ---- teacher's desk in the middle of the platform: a long walnut desk with a front panel, drawers on the teacher's side
    const TDZ=22.33, TW=1.86, TD=.68, TH=PH+.82, TTOP=TH+.0225;
    { const pk={type:'clstdesk'};
      B(TW,.045,TD,dk.H,XC,TH,TDZ,scene,pk);
      for(const sx of [-1,1]){ const cx=XC+sx*(TW/2-.24); B(.44,TH-PH-.06,TD-.06,dk.V,cx,PH+(TH-PH-.06)/2,TDZ,scene,pk);
        for(const [y,h] of [[PH+.6,.16],[PH+.36,.26]]){ B(.38,h-.03,.012,dk.H,cx,y,TDZ+TD/2-.024); const rg=new THREE.Mesh(new THREE.TorusGeometry(.018,.003,6,14),brass); rg.position.set(cx,y-.01,TDZ+TD/2-.012); scene.add(rg); C(.008,.008,.012,brass,cx,y+.012,TDZ+TD/2-.016,scene,8).rotation.x=Math.PI/2; } }
      B(TW-.92,.62,.024,dk.H,XC,PH+.46,TDZ-TD/2+.06,scene,pk); B(TW-.92,.06,.03,dk.H,XC,TH-.055,TDZ-TD/2+.03);
      B(TW-.92,.012,.036,brass,XC,TH-.09,TDZ-TD/2+.03);
      OB(XC-TW/2,XC+TW/2,TDZ-TD/2,TDZ+TD/2); }
    // the desk top: books and an open book on the left, brush pot and inkstone, a laptop, the tea things on the right
    { const T0=TTOP, book=(x,z,w,d,h,m,ry=0)=>{ const b=B(w,h,d,m,x,T0+h/2,z); b.rotation.y=ry; B(w-.008,h*.8,d+.002,cream,x,T0+h/2,z).rotation.y=ry; return b; };
      let y=0; for(const [h,m,r] of [[.02,blueCover,.02],[.016,blueCover2,-.03],[.022,blueCover,.04],[.015,blueCover2,0]]){ const b=B(.19,h,.27,m,XC-.72,T0+y+h/2,TDZ+.02); b.rotation.y=r; y+=h; }
      y=0; for(const [h,m,r] of [[.018,blueCover2,-.05],[.02,blueCover,.03]]){ const b=B(.19,h,.27,m,XC-.48,T0+y+h/2,TDZ-.06); b.rotation.y=r; y+=h; }
      const ob=new THREE.Group(); ob.position.set(XC-.2,T0,TDZ+.1); ob.rotation.y=.08; scene.add(ob);
      for(const s of [-1,1]){ const pg=B(.17,.008,.25,cream,s*.086,.012,0,ob); pg.rotation.z=-s*.06; } B(.36,.004,.26,blueCover,0,.002,0,ob); B(.2,.012,.022,brass,0,.03,.1,ob);
      const pot=L([[0,0],[.036,0],[.036,.13],[.033,.13],[.033,.008],[0,.008]],mat(0x6b4a2e,.6),XC-.86,T0,TDZ+.2);
      for(let i=0;i<4;i++){ const br=C(.004,.0035,.24,mat(0x8a6a3a,.6),XC-.86+Math.cos(i*1.7)*.014,T0+.17,TDZ+.2+Math.sin(i*1.7)*.014,scene,6); br.rotation.set(Math.sin(i)*.12,0,Math.cos(i*2)*.1); }
      B(.12,.022,.18,inkM,XC-.55,T0+.011,TDZ+.22); B(.09,.006,.06,mat(0x0e0e0e,.2),XC-.55,T0+.023,TDZ+.17);
      // laptop: keyboard toward the teacher, the lid shows what is being projected
      const LX=XC+.24, LZ=TDZ+.1; B(.33,.016,.23,mat(0x3b3d40,.35,{metalness:.55}),LX,T0+.008,LZ,scene,{type:'clslaptop'}); B(.29,.002,.11,mat(0x202124,.6),LX,T0+.017,LZ+.03);
      const lid=new THREE.Group(); lid.position.set(LX,T0+.016,LZ-.112); lid.rotation.x=-.22; scene.add(lid);
      B(.33,.22,.008,mat(0x3b3d40,.35,{metalness:.55}),0,.11,-.004,lid,{type:'clslaptop'});
      const lapM=new THREE.MeshBasicMaterial({color:0x1b2026}), lap=plane(.3,.19,lapM,0,.115,.0005,0,lid,{type:'clslaptop'}); NPC_DYN.push(lid);
      B(.025,.012,.08,mat(0x1c1c1e,.4),LX+.26,T0+.006,LZ+.06,scene,{type:'clslaptop'});
      // tea: a tray, a zisha pot, three cups; a small box of drawers
      B(.34,.02,.22,mat(0x5b3a24,.5),XC+.66,T0+.01,TDZ+.08); L([[0,0],[.05,0],[.062,.04],[.05,.08],[.02,.09],[0,.09]],zisha,XC+.6,T0+.02,TDZ+.08);
      C(.008,.006,.05,zisha,XC+.66,T0+.07,TDZ+.08,scene,6).rotation.z=-1.0;
      for(let i=0;i<3;i++) L([[0,0],[.018,0],[.026,.035],[.024,.036]],celadonGlaze,XC+.73+(i%2)*.06,T0+.02,TDZ+.02+i*.06);
      B(.18,.1,.12,mat(0x6e4a2e,.55),XC+.8,T0+.05,TDZ+.24); for(let i=0;i<2;i++) B(.16,.004,.004,brass,XC+.8,T0+.03+i*.045,TDZ+.181);
      CLS_LAP.m=lapM; }
    // teacher's armchair between the desk and the board, facing the class
    const tsi=addSeat(XC,23.06,0,'clst',NT('cls.seat',1)); SEATS[tsi].ap={x:XC+1.25,z:22.5};
    { const pk={type:'seat',si:tsi}, sy=PH+.47, z=23.06, w=.56, d=.48, bz=z+d/2-.03;
      B(w,.035,d,hd.H,XC,sy-.017,z,scene,pk);
      for(const sx of [-1,1]){ B(.04,sy-PH-.03,.04,hd.V,XC+sx*(w/2-.03),PH+(sy-PH-.03)/2,z-d/2+.03,scene,pk); B(.04,sy+.64-PH,.04,hd.V,XC+sx*(w/2-.03),(sy+.64+PH)/2,bz,scene,pk);
        B(.04,.24,.035,hd.V,XC+sx*(w/2-.03),sy+.12,z-d/2+.03,scene,pk); B(.035,.03,d,hd.H,XC+sx*(w/2-.03),sy+.25,z,scene,pk); }
      B(w+.12,.045,.05,hd.H,XC,sy+.64,bz,scene,pk); B(.2,.5,.02,hd.V,XC,sy+.33,bz+.005,scene,pk);
      for(const zz of [z-d/2+.03,bz]) B(w-.06,.03,.025,hd.H,XC,PH+.14,zz); }
    // ---- the class: double desks in two columns, the door side without a front desk
    const ROWS=[20.75,18.95,17.15], COLS=[[X0+.3+.725,[1,2]],[X1-.3-.725,[0,1,2]]], DW=1.45, DD=.6, DH=.75;
    let sd=7; const rr=()=>((sd=sd*16807%2147483647)/2147483647);
    for(const [cx,rows] of COLS) for(const ri of rows){ const cz=ROWS[ri], pk={type:'clsdesk'};
      B(DW,.035,DD,wl.H,cx,DH-.0175,cz,scene,pk);
      for(const sx of [-1,1]){ for(const sz of [-1,1]) B(.05,DH-.035,.05,wl.V,cx+sx*(DW/2-.05),(DH-.035)/2,cz+sz*(DD/2-.05));
        B(.024,.08,DD-.1,wl.H,cx+sx*(DW/2-.05),DH-.075,cz); B(.03,.03,DD-.1,wl.H,cx+sx*(DW/2-.05),.13,cz);
        const hk=C(.005,.005,.05,brass,cx+sx*(DW/2+.02),DH-.13,cz-.12,scene,6); hk.rotation.z=Math.PI/2; }
      B(DW-.1,.08,.024,wl.H,cx,DH-.075,cz+DD/2-.05); B(DW-.1,.03,.03,wl.H,cx,.13,cz+DD/2-.05); B(DW-.12,.016,.27,wl.H,cx,.6,cz+.12);
      OB(cx-DW/2,cx+DW/2,cz-DD/2,cz+DD/2);
      for(const sx of [-1,1]){ const x=cx+sx*.36, z=cz-.65, si=addSeat(x,z,Math.PI,'cls',NT('cls.seat',0)); SEATS[si].ap={x,z:z-.32};
        const sp={type:'seat',si}, sy=.45, w=.42, d=.4, bz=z-d/2+.03;
        B(w,.03,d,hd.H,x,sy-.015,z,scene,sp);
        for(const s2 of [-1,1]){ B(.035,sy-.03,.035,hd.V,x+s2*(w/2-.03),(sy-.03)/2,z+d/2-.03,scene,sp); B(.035,sy+.5,.035,hd.V,x+s2*(w/2-.03),(sy+.5)/2,bz,scene,sp); B(.025,.025,d-.06,hd.H,x+s2*(w/2-.03),.16,z); }
        B(w+.04,.04,.045,hd.H,x,sy+.5,bz,scene,sp); B(.15,.4,.018,hd.V,x,sy+.26,bz-.004,scene,sp); B(w-.06,.025,.02,hd.H,x,.16,z+d/2-.03);
        // on the desk: a thread-bound book, a pad of paper with a brush, a small inkstone
        const T=DH, bk=B(.17,.016,.24,rr()<.5?blueCover:blueCover2,x-.12+rr()*.04,T+.008,cz-.06+rr()*.04); bk.rotation.y=(rr()-.5)*.3;
        if(rr()<.5){ const b2=B(.17,.014,.24,blueCover2,bk.position.x+.01,T+.023,bk.position.z-.01); b2.rotation.y=(rr()-.5)*.4; }
        const pp=B(.2,.006,.27,cream,x+.1,T+.003,cz-.08); pp.rotation.y=(rr()-.5)*.15;
        const br=C(.0035,.003,.2,mat(0x8a6a3a,.6),x+.1,T+.01,cz-.08,scene,6); br.rotation.set(Math.PI/2,0,(rr()-.5)*.5);
        B(.07,.014,.1,inkM,x+.04,T+.007,cz+.15); } }
    // ---- a low bookcase under the court window: thread-bound books stacked flat, cloth cases, a few scrolls on top
    { const x0=X0+.4, x1=X1-.4, W=x1-x0, z=Z0+.18, H=.8, pk={type:'clsshelf'};
      B(W,.03,.37,dk.H,(x0+x1)/2,H-.015,z,scene,pk); B(W,.06,.33,dk.H,(x0+x1)/2,.03,z); B(W,.02,.34,dk.H,(x0+x1)/2,.41,z,scene,pk); B(W,H-.03,.015,dk.H,(x0+x1)/2,(H-.03)/2,Z0+.008);
      for(let i=0;i<=3;i++) B(.03,H-.03,.35,dk.V,x0+.015+i*(W-.03)/3,(H-.03)/2,z,scene,pk);
      for(let i=0;i<3;i++) for(const [y0,y1] of [[.06,.4],[.42,H-.03]]){ let cx=x0+.06+i*(W-.03)/3, end=x0+(i+1)*(W-.03)/3-.04;
        while(cx+.2<end){ if(rr()<.3){ const hh=Math.min(y1-y0-.03,.07+rr()*.06); B(.2,hh,.28,mat(rr()<.5?0x23324a:0x4a3a2a,.85),cx+.1,y0+hh/2,z+.01,scene,pk); }
          else { let yy=y0; const n=2+Math.floor(rr()*6); for(let k=0;k<n&&yy<y1-.05;k++){ const h=.012+rr()*.01; const b=B(.19,h,.27,rr()<.5?blueCover:blueCover2,cx+.1,yy+h/2,z+.01,scene,pk); b.rotation.y=(rr()-.5)*.08; yy+=h; } }
          cx+=.23; } }
      for(let i=0;i<3;i++){ const sc=C(.022+i*.004,.022+i*.004,.5,mat([0xd9cba8,0xc9b48a,0xe2d6b8][i],.85),x0+.6+i*.07,H+.025+i*.0,z-.05+i*.055,scene,14,pk); sc.rotation.z=Math.PI/2; for(const e of [-1,1]) C(.012,.012,.03,mat(0x4a2c1a,.5),x0+.6+i*.07+e*.265,H+.025,z-.05+i*.055,scene,8).rotation.z=Math.PI/2; }
      OB(x0,x1,Z0,Z0+.36); }
    // ---- light: two pendant lamps over the desks and one over the platform; dimmed over the platform while projecting
    const lamps=[];
    for(const [x,z,y] of [[COLS[0][0],18.4,2.68],[COLS[1][0],18.4,2.68],[XC,22.0,2.75]]){
      C(.004,.004,roof(z)-y-.18,mat(0x1a1a1a,.6),x,(roof(z)+y+.18)/2,z,scene,6);
      L([[0,.2],[.03,.2],[.05,.17],[.12,.08],[.17,0],[.165,-.005],[.11,.07],[.04,.15],[0,.16]],mat(0xf2ead8,.6,{side:THREE.DoubleSide,emissive:0xffdcaa,emissiveIntensity:.35}),x,y,z);
      const bulb=new THREE.Mesh(new THREE.SphereGeometry(.04,12,10),mat(0xfff4dc,.4,{emissive:0xffe2b0,emissiveIntensity:1.4})); bulb.position.set(x,y+.06,z); scene.add(bulb);
      const l=new THREE.PointLight(0xffd9ac,NIGHT?1.05:.45,6.5,2); l.position.set(x,y-.05,z); scene.add(l); lamps.push(l); }
    CLS_ROOM.lamps=lamps; CLS_ROOM.base=lamps.map(l=>l.intensity);
    Object.assign(CLS_ROOM,{BCV,BG,bx,bgPat,boardTex,PCV,px,projTex,scr,scrM,bar,beam,laser,lever,SW,SH,STOP,SZ,XC,lap:CLS_LAP}); }
}
// {% endraw %}
