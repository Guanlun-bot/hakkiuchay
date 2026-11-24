// {% raw %}
/* ================= 知了間 ================= */
const TEAS=[
  ['凍頂烏龍','南投鹿谷・中焙火・熟果蜜香',0xc8862c],
  ['安溪鐵觀音','福建安溪・觀音韻・蘭花香',0xd4a43e],
  ['木柵鐵觀音','臺北木柵・重焙・果酸回甘',0xa45e1e],
  ['鳳凰單叢・鴨屎香','廣東潮州・銀花香',0xd8a838],
  ['鳳凰單叢・蜜蘭香','廣東潮州・蜜香蘭韻',0xdcaa3a],
  ['鳳凰單叢・宋種','烏崠老欉・韻深',0xc48c2c],
  ['大紅袍','武夷岩茶・岩骨花香',0xa4521c],
  ['武夷肉桂','武夷岩茶・桂皮辛香',0x9e4c1a],
  ['老欉水仙','武夷岩茶・木質苔香',0x984a1c],
  ['東方美人','新竹北埔・蜜果香',0xbe6824],
  ['文山包種','新北坪林・清香',0xd6c258],
  ['梨山高山茶','臺中梨山・冷礦清甜',0xd8ce68],
  ['阿里山烏龍','嘉義阿里山・高山氣',0xdac85e],
  ['白毫銀針','福建福鼎・毫香',0xe6da98],
  ['普洱熟茶','雲南・陳香',0x58200e],
  ['正山小種','武夷桐木關・松煙',0x882c14],
];
if(Array.isArray(VRD.teas)&&VRD.teas.filter(t=>t&&t.name).length){ const cs=TEAS.map(t=>t[2]); const nt=VRD.teas.filter(t=>t&&t.name).map((t,i)=>[String(t.name),String(t.note||''),cs[i%cs.length]]); TEAS.splice(0,TEAS.length,...nt); }   // tea list from the back office
let myTea=Math.min(TEAS.length-1,Math.max(0,+(LS.get('hk-tea')||0)));
let myGF=null, myIR=null, irMode=LS.get('hk-irori')||'auto';
const SNACKS=[
  ['鳳梨酥','土鳳梨餡，酸甜','box',0xd9a441],
  ['牛軋糖','花生奶香','box',0xefe8da],
  ['芒果乾','一整包','bag',0xeea12e],
  ['洋芋片','薄鹽','bag',0x3a6fb0],
  ['綠豆糕','配茶剛好','box',0x9fb36a],
  ['黑巧克力','七成','bar',0x3a2214],
  ['彈珠汽水','玻璃瓶','bottle',0x7fc6d8],
  ['沙士','冰的','can',0x6a2a1a],
  ['麥仔茶','罐裝','can',0xb88a3a],
  ['冬瓜茶','鋁箔包','pack',0xd2a84a],
  ['香菸','一包，附打火機','cig',0xf3efe6],
  ['小雪茄','一盒','cig2',0x6a3e22],
  ['爆米花','電影院外的爆米花機，奶油香','popcorn',0xf3e3b0,1],
  ['芒果','剛從樹上摘下來的','mango',0xf2b33a,1],
];
let mySnack=-1;
/* ---- eating and drinking, and what it does (everything in the house is 蛋奶素: no alcohol, meat, fish or the five pungent
   plants). Whatever is in your hand — a bottle from the cooler, popcorn, a mango, a snack from the cabinet, the meal at the
   table, a dish in the tea room — can be eaten or drunk a bite or a sip at a time; the effects: tea and coffee put a spring
   in your step for a few minutes, a full meal slows you a little, something hot warms you when it is cold out and
   something iced cools you when it is hot, sweet things cheer you; a word over your head shows it to everyone. */
var myFx=null;
const FOOD={energy:0,full:0,bites:0,biteK:'',
  speed(){ const n=Date.now(); return (n<this.energy?1.15:1)*(n<this.full?.93:1); },
  kindOf(name){ const t=String(name||''); const k=[];
    if(/茶|咖啡|拿鐵|卡布/.test(t)) k.push('energy'); if(/汽水|沙士|可樂|西打|彈珠|運動/.test(t)) k.push('cool','sweet'); if(/汁|冰|剉|露|水$/.test(t)) k.push('cool');
    if(/奶|乳|豆漿|米漿|養樂多|糖|酥|糕|派|塔|餅|蛋糕|布丁|巧克力|麻糬|湯圓|豆花|爆米花|芒果|甜/.test(t)) k.push('sweet'); if(/湯|粥|熱|杏仁茶|紅豆|薑/.test(t)) k.push('warm');
    return k.length?k:['sweet']; },
  fx(kinds,name){ const n=Date.now(), temp=(typeof WX!=='undefined'&&WX.temp!=null)?WX.temp:22, mo=new Date(n+8*3600e3).getUTCMonth()+1, hot=temp>=27||(WX.temp==null&&mo>=6&&mo<=9), cold=temp<=18||(WX.temp==null&&(mo>=12||mo<=2));
    let word='';
    if(kinds.includes('full')){ this.full=n+10*60000; word=NT('fx.full'); }
    if(kinds.includes('energy')){ this.energy=n+5*60000; word=NT('fx.energy'); }
    if(kinds.includes('warm')&&cold) word=NT('fx.warm'); if(kinds.includes('cool')&&hot) word=NT('fx.cool');
    if(!word&&kinds.includes('sweet')) word=NT('fx.sweet');
    if(kinds.includes('crunch')){ try{ actx=actx||new (window.AudioContext||window.webkitAudioContext)(); actx.resume(); noiseBurst(.12,2400,6,.05); noiseBurst(.08,3200,7,.04,.12); }catch{} }
    if(word){ myFx=[word,n]; pushPresence(); toast(word,2200); } } };
// the food in your hand right now, for the little panel: what it is, how many bites, eat / put down
function heldFood(){ const n=Date.now();
  if(window.__cineBt>=0&&window.__cineDrink){ const nm=window.__cineDrink.names()[window.__cineBt]||''; return {name:nm,verb:NT('food.sip'),eat:()=>window.__cineDrink.sip(),put:()=>window.__cineDrink.put()}; }
  if(mySnack>=0&&SNACKS[mySnack]&&!/^cig/.test(SNACKS[mySnack][2])){ const [nm,,shape]=SNACKS[mySnack], drink=/bottle|can|pack/.test(shape), N=shape==='popcorn'?12:shape==='mango'?4:drink?5:4;
    if(FOOD.biteK!=='s'+mySnack){ FOOD.biteK='s'+mySnack; FOOD.bites=N; }
    return {name:nm,verb:NT(drink?'food.sip':'food.bite'),eat:()=>{ if(FOOD.bites<=0) return; FOOD.bites--; const k=FOOD.kindOf(nm); if(shape==='popcorn') k.push('crunch');
      if(FOOD.bites===N-1||shape==='popcorn') FOOD.fx(k,nm); else toast(NT(drink?'food.sipd':'food.bited').replace('{名}',nm),1600); try{ noiseBurst(.06,drink?700:1800,4,.04); }catch{}
      if(FOOD.bites<=0){ setTimeout(()=>{ setSnack(-1); toast(NT('food.done').replace('{名}',nm),2200); },700); } },put:()=>setSnack(-1)}; }
  if(ME.seat>=0&&SEATS[ME.seat]&&SEATS[ME.seat].kind==='dine'){ const S=typeof mealState==='function'?mealState():null; if(S&&S.phase==='eat'){ const key='m'+S.id; if(FOOD.biteK!==key){ FOOD.biteK=key; FOOD.bites=8; }
      return {name:NT('meal.'+S.k),verb:NT('food.bite'),eat:()=>{ if(FOOD.bites<=0){ toast(NT('food.fullup'),2000); return; } FOOD.bites--; try{ noiseBurst(.05,1500,4,.04); }catch{} if(FOOD.bites===0) FOOD.fx(['full'],''); else if(FOOD.bites===7) FOOD.fx(['warm'],''); else toast(NT('food.bited').replace('{名}',NT('meal.'+S.k)),1500); }}; } }
  return null; }
// the panel: bottom centre, only while there is something to eat
{ const css=document.createElement('style'); css.textContent='#foodbar{position:fixed;left:50%;bottom:86px;transform:translateX(-50%);z-index:21;display:none;gap:8px;align-items:center;background:var(--hud-bg,rgba(247,246,241,.9));color:var(--hud-ink,#3f3a39);border:1px solid var(--hud-rule,#d3cec3);border-radius:999px;padding:5px 8px 5px 14px;font:14px "Noto Serif TC",serif;box-shadow:var(--hud-sh,0 2px 8px rgba(0,0,0,.15))}#foodbar.on{display:flex}#foodbar button{font:13px "Noto Serif TC",serif;border:1px solid var(--hud-rule,#d3cec3);background:transparent;color:inherit;border-radius:999px;padding:3px 12px;cursor:pointer}'; document.head.appendChild(css);
  const bar=document.createElement('div'); bar.id='foodbar'; bar.innerHTML='<span class="n"></span><button class="e"></button><button class="p"></button>'; document.body.appendChild(bar);
  let cur=null; bar.querySelector('.e').onclick=()=>{ cur&&cur.eat(); }; bar.querySelector('.p').onclick=()=>{ cur&&cur.put&&cur.put(); };
  setInterval(()=>{ if(!window.__entered){ bar.classList.remove('on'); return; } cur=heldFood(); bar.classList.toggle('on',!!cur); if(cur){ bar.querySelector('.n').textContent=cur.name; bar.querySelector('.e').textContent=cur.verb; const p=bar.querySelector('.p'); p.textContent=NT('food.put'); p.style.display=cur.put?'':'none'; } },250);
  addEventListener('keydown',e=>{ if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA') return; if(e.key.toLowerCase()==='q'&&cur){ e.preventDefault(); cur.eat(); } }); }

/* ---------- shared tea sessions ---------- */
function sharedLatest(field,mine){ let best=mine&&num(mine.at)>0?{t:mine.t,at:mine.at,by:'你',mine:true}:null;
  for(const [,o] of others){ const r=o.p&&o.p[field]; if(!r||typeof r!=='object') continue; const t=num(r.t,-1), at=num(r.at); if(t<0||t>=TEAS.length||!(at>0)||at>Date.now()+60000) continue; if(!best||at>best.at) best={t,at,by:str(o.p.n,12)||'訪客',mine:false}; }
  return best; }
const GF_STEPS=[[0,t=>'起炭：木炭在紅泥小爐裡慢慢轉紅。'],[5,t=>'搧火候湯，砂銚裡冒出蟹眼泡。'],[11,t=>'水滾了。燙壺，在錫茶船裡溫杯。'],[14,t=>`置茶：${t}填進孟臣壺。`],[16,t=>'高沖，刮沫，淋壺。'],[19,t=>'低斟：關公巡城，韓信點兵。'],[22,t=>'請茶。四杯斟滿，送到茶席每個人面前。']];
const IR_STEPS=[[0,t=>'提起鐵壺，熱水溫碗、溫杯。'],[4,t=>`置茶：${t}放進蓋碗。`],[7,t=>'注湯，刮沫，蓋上碗蓋。'],[10,t=>'出湯到公道杯，再分杯。'],[12,t=>'請茶。']];
const TEA_LAST=30*60;  // a pot stays on the table for half an hour
let gfStepSeen='', irStepSeen='';
function taipeiMonth(){ return +new Intl.DateTimeFormat('en',{timeZone:'Asia/Taipei',month:'numeric'}).format(new Date()); }
function irSeason(){ return [11,12,1,2,3].includes(taipeiMonth()); }
function startGF(){ const cur=sharedLatest('gf',myGF); if(cur&&(Date.now()-cur.at)/1000<22){ toast(`${cur.by==='你'?'你':cur.by}正在泡這一泡。`); return; }
  myGF={t:myTea,at:Date.now()}; pushPresence(); closePanel(); }
function startIR(){ const cur=sharedLatest('ir',myIR); if(cur&&(Date.now()-cur.at)/1000<12){ toast(`${cur.by==='你'?'你':cur.by}正在泡這一碗。`); return; }
  myIR={t:myTea,at:Date.now()}; pushPresence(); closePanel(); }
function teaList(after){ return `<ul class="list menu" id="tl">${TEAS.map(([n,d],i)=>`<li data-tea="${i}"><div><div class="bt">${n}</div><div class="ba">${d}</div></div><span class="ba">${i===myTea?'手邊這罐':'換這罐'}</span></li>`).join('')}</ul>`; }
function bindTeaList(body,after){ const ul=body.querySelector('#tl'); if(ul) ul.onclick=e=>{ const li=e.target.closest('li[data-tea]'); if(!li) return; pickTea(+li.dataset.tea); after(); }; }
function pickTea(i){ if(i<0) return; myTea=i; LS.set('hk-tea',myTea); toast(`從茶架取下一罐${TEAS[i][0]}。`); }
function showTeaShelf(){ const body=openPanel('錫茶罐',`<p class="meta">茶室窗邊架上的錫罐都貼著紅紙茶名。取一罐下來，工夫茶席和囲炉裏泡的就是它。</p>${teaList()}`); bindTeaList(body,showTeaShelf); }
function showGongfu(){ const cur=sharedLatest('gf',myGF), el=cur?(Date.now()-cur.at)/1000:1e9;
  const state=!cur||el>TEA_LAST?'爐子是冷的。':el<22?`${cur.mine?'你':esc(cur.by)}正在泡${esc(TEAS[cur.t][0])}。`:`桌上是${cur.mine?'你':esc(cur.by)}泡的${esc(TEAS[cur.t][0])}，還溫著。`;
  const body=openPanel('工夫茶',`<p class="meta">福建工夫茶：紅泥小火爐、砂銚、孟臣壺，錫茶船上四隻若琛杯。${state}</p><div class="vol">茶葉：<b>${esc(TEAS[myTea][0])}</b>　<span class="ba">${esc(TEAS[myTea][1])}</span></div><button class="btn pri" id="gfgo">起炭泡茶</button><div class="sec">換一罐茶</div>${teaList()}<p class="meta" style="margin-top:12px">茶泡好後，坐在茶席上的人面前都會有一杯；在知了間的人也會看到。</p>`);
  body.querySelector('#gfgo').onclick=()=>{ try{ actx=actx||new (window.AudioContext||window.webkitAudioContext)(); actx.resume(); }catch{} startGF(); }; bindTeaList(body,showGongfu); }
function showIrori(){ const cur=sharedLatest('ir',myIR); const lit=irori.fire>.5;
  const opt=(k,l)=>`<button class="btn${irMode===k?' pri':''}" data-ir="${k}">${l}</button>`;
  const body=openPanel('囲炉裏',`<p class="meta">${lit?'炭火正旺，鐵壺的水是熱的。':'炭火熄著。'}${irSeason()?'現在是冷天，炭火會自己生起來。':'天還不冷，想烤火可以自己生火。'}</p><div>${opt('auto','跟著季節')}${opt('on','生火')}${opt('off','熄火')}</div><div class="vol" style="margin-top:12px">茶葉：<b>${esc(TEAS[myTea][0])}</b></div><button class="btn pri" id="irgo">用蓋碗泡一碗</button><div class="sec">換一罐茶</div>${teaList()}`);
  body.querySelectorAll('[data-ir]').forEach(b=>b.onclick=()=>{ irMode=b.dataset.ir; LS.set('hk-irori',irMode); toast(irMode==='on'?'添了炭，火生起來了。':irMode==='off'?'把炭埋進灰裡。':'炭火跟著天氣。'); showIrori(); });
  body.querySelector('#irgo').onclick=()=>{ try{ actx=actx||new (window.AudioContext||window.webkitAudioContext)(); actx.resume(); }catch{} startIR(); }; bindTeaList(body,showIrori); }
function noiseBurst(sec,freq,q,gain,delay=0){ try{ actx=actx||new (window.AudioContext||window.webkitAudioContext)(); actx.resume(); const n=Math.floor(actx.sampleRate*sec), buf=actx.createBuffer(1,n,actx.sampleRate), d=buf.getChannelData(0); for(let i=0;i<n;i++) d[i]=(Math.random()*2-1)*Math.min(1,i/3000)*Math.min(1,(n-i)/6000);
  const src=actx.createBufferSource(); src.buffer=buf; const f=actx.createBiquadFilter(); f.type='bandpass'; f.frequency.value=freq; f.Q.value=q; const g=actx.createGain(); g.gain.value=gain; src.connect(f).connect(g).connect(actx.destination); src.start(actx.currentTime+delay); }catch{} }
function boil(sec,delay=0,lvl=1){ try{ actx=actx||new (window.AudioContext||window.webkitAudioContext)(); actx.resume(); const sr=actx.sampleRate, n=Math.floor(sr*sec), buf=actx.createBuffer(1,n,sr), d=buf.getChannelData(0);
  let lp=0; for(let i=0;i<n;i++){ const e=Math.min(1,i/(sr*.6))*Math.min(1,(n-i)/(sr*.8)), grow=.35+.65*Math.min(1,i/(n*.7)); lp+=((Math.random()*2-1)-lp)*.06; d[i]=lp*.5*e*grow*lvl; }   /* the low roar under the lid */
  const nb=Math.floor(sec*90*lvl); for(let b=0;b<nb;b++){ const t0=Math.floor(Math.pow(Math.random(),.7)*(n-sr*.06)), f0=280+Math.random()*700, len=Math.floor(sr*(.012+Math.random()*.03)), a0=.12+Math.random()*.25;   /* bubbles: short rising blips, thicker as it comes to the boil */
    for(let i=0;i<len;i++){ const t=i/sr; d[t0+i]+=Math.sin(2*Math.PI*f0*(1+t*12)*t)*a0*Math.exp(-i/(len*.35))*Math.min(1,(n-t0)/(sr*.8)); } }
  const src=actx.createBufferSource(); src.buffer=buf; const f=actx.createBiquadFilter(); f.type='lowpass'; f.frequency.value=2200; const g=actx.createGain(); g.gain.value=.22; src.connect(f).connect(g).connect(actx.destination); src.start(actx.currentTime+delay); }catch{} }
function crackle(sec){ try{ if(!actx) return; for(let i=0;i<sec*6;i++) noiseBurst(.02,2500+Math.random()*2000,2,.06,Math.random()*sec); }catch{} }
function pour(sec,delay=0){ noiseBurst(sec,1400,1.2,.07,delay); }
function wash(){ pour(2.2); setTimeout(()=>noiseBurst(1.2,900,.8,.04),2300); toast('扳開古銅龍頭，在石盆裡洗了手，用手巾擦乾。'); }

/* ---------- tuning the yueqin and 殼仔弦 ---------- */
const INST={yq:{name:'月琴',strings:['內弦','外弦'],def:[62,69],pluck:true},kz:{name:'殼仔弦',strings:['內弦','外弦'],def:[62,69],pluck:false}};
let TUNE=(()=>{ try{ const t=JSON.parse(LS.get('hk-tune')||'null'); if(t&&Array.isArray(t.yq)&&Array.isArray(t.kz)) return t; }catch{} const R=()=>(Math.random()-.5)*.6; return {yq:[62+R(),69+R()],kz:[62+R(),69+R()]}; })();
const NOTE=['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];
function noteOf(m){ const n=Math.round(m); return {name:NOTE[(n%12+12)%12]+(Math.floor(n/12)-1),cents:Math.round((m-n)*100),n}; }
const hz=m=>440*Math.pow(2,(m-69)/12);
function pluck(m){ try{ actx=actx||new (window.AudioContext||window.webkitAudioContext)(); actx.resume(); const sr=actx.sampleRate, f=hz(m), N=Math.round(sr/f), len=Math.floor(sr*2.2), buf=actx.createBuffer(1,len,sr), d=buf.getChannelData(0), ring=new Float32Array(N);
  for(let i=0;i<N;i++) ring[i]=Math.random()*2-1; let p=0; for(let i=0;i<len;i++){ const nx=(p+1)%N; const v=ring[p]; d[i]=v*.5; ring[p]=.4985*(v+ring[nx]); p=nx; }
  const src=actx.createBufferSource(); src.buffer=buf; const body=actx.createBiquadFilter(); body.type='peaking'; body.frequency.value=420; body.gain.value=6; const g=actx.createGain(); g.gain.value=.5; src.connect(body).connect(g).connect(actx.destination); src.start(); }catch{} }
function bow(m){ try{ actx=actx||new (window.AudioContext||window.webkitAudioContext)(); actx.resume(); const t=actx.currentTime, o=actx.createOscillator(), lfo=actx.createOscillator(), lg=actx.createGain(), bp=actx.createBiquadFilter(), pk=actx.createBiquadFilter(), g=actx.createGain();
  o.type='sawtooth'; o.frequency.value=hz(m); lfo.frequency.value=5.4; lg.gain.value=hz(m)*.004; lfo.connect(lg).connect(o.frequency);
  bp.type='bandpass'; bp.frequency.value=1100; bp.Q.value=.9; pk.type='peaking'; pk.frequency.value=2600; pk.gain.value=7;
  g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(.12,t+.18); g.gain.setValueAtTime(.12,t+1.4); g.gain.exponentialRampToValueAtTime(.0001,t+1.8);
  o.connect(bp).connect(pk).connect(g).connect(actx.destination); o.start(t); lfo.start(t); o.stop(t+1.85); lfo.stop(t+1.85); }catch{} }
function refTone(m){ try{ actx=actx||new (window.AudioContext||window.webkitAudioContext)(); actx.resume(); const t=actx.currentTime, o=actx.createOscillator(), g=actx.createGain(); o.type='sine'; o.frequency.value=hz(m); g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(.12,t+.05); g.gain.setValueAtTime(.12,t+1.3); g.gain.exponentialRampToValueAtTime(.0001,t+1.6); o.connect(g).connect(actx.destination); o.start(t); o.stop(t+1.65); }catch{} }
function showInstrument(k){ const I=INST[k], T=TUNE[k];
  const row=(i)=>{ const m=T[i], n=noteOf(m), off=Math.max(-50,Math.min(50,n.cents)); const ok=Math.abs(n.cents)<=3;
    return `<div class="card" style="margin:10px 0"><div class="bt">${I.strings[i]}　<b>${n.name}</b>　<span class="ba">${n.cents>0?'+':''}${n.cents} 音分${ok?'・準了':''}</span></div>
      <div style="position:relative;height:10px;background:#e6dfcf;margin:8px 0;border-radius:5px"><div style="position:absolute;left:50%;top:-3px;width:2px;height:16px;background:#3f3a39"></div><div style="position:absolute;left:calc(${50+off}% - 5px);top:0;width:10px;height:10px;border-radius:5px;background:${ok?'#3d6b4f':'#a8343a'}"></div></div>
      <button class="btn pri" data-play="${i}">${I.pluck?'撥一下':'拉一弓'}</button><button class="btn" data-ref="${i}">標準音 ${n.name}</button><br>
      <button class="btn" data-d="${i}|-1">鬆半音</button><button class="btn" data-d="${i}|-.05">鬆一點</button><button class="btn" data-d="${i}|.05">緊一點</button><button class="btn" data-d="${i}|1">緊半音</button></div>`; };
  const body=openPanel(I.name,`<p class="meta">轉軸調弦：先撥弦，再聽標準音，把弦轉到「準了」。弦上的音高會記在這台電腦裡。${I.pluck?'':'殼仔弦是拉弦樂器，按一下拉一弓。'}</p>${row(0)}${row(1)}<p class="meta">兩弦相差：${Math.round((T[1]-T[0])*100)} 音分（五度是 700）。</p><button class="btn" id="tdef">回到預設 ${noteOf(I.def[0]).name}・${noteOf(I.def[1]).name}</button>`);
  body.onclick=e=>{ const b=e.target.closest('button'); if(!b) return;
    if(b.dataset.play!=null){ const m=T[+b.dataset.play]; I.pluck?pluck(m):bow(m); return; }
    if(b.dataset.ref!=null){ refTone(noteOf(T[+b.dataset.ref]).n); return; }
    if(b.dataset.d){ const [i,d]=b.dataset.d.split('|').map(Number); T[i]=Math.max(48,Math.min(84,T[i]+d)); LS.set('hk-tune',JSON.stringify(TUNE)); I.pluck?pluck(T[i]):bow(T[i]); showInstrument(k); return; }
    if(b.id==='tdef'){ T[0]=I.def[0]; T[1]=I.def[1]; LS.set('hk-tune',JSON.stringify(TUNE)); showInstrument(k); } }; }


/* ---------- snacks hidden in the study's low cabinets ---------- */
function snackMesh(i){ const g=new THREE.Group(); if(i<0||!SNACKS[i]) return g; const [, ,shape,col]=SNACKS[i]; const m=new THREE.MeshStandardMaterial({color:col,roughness:.5});
  const label=new THREE.MeshStandardMaterial({color:0xf5efe2,roughness:.6}), red=new THREE.MeshStandardMaterial({color:0xa8343a,roughness:.5});
  if(shape==='box'){ box(.13,.035,.09,m,0,.018,0,g); box(.06,.036,.092,red,0,.018,0,g); }
  else if(shape==='bag'){ const b=box(.13,.03,.17,m,0,.016,0,g); b.scale.set(1,1,1); box(.08,.031,.06,label,0,.017,0,g); }
  else if(shape==='bar'){ box(.07,.012,.15,m,0,.006,0,g); box(.072,.013,.05,new THREE.MeshStandardMaterial({color:0xc9a24a,metalness:.6,roughness:.3}),0,.006,.03,g); }
  else if(shape==='bottle'){ const gl=new THREE.MeshStandardMaterial({color:col,transparent:true,opacity:.6,roughness:.05}); cylinder(.03,.03,.12,gl,0,.06,0,g); cylinder(.014,.026,.06,gl,0,.15,0,g); cylinder(.016,.016,.02,new THREE.MeshStandardMaterial({color:0x2f6f8a}),0,.19,0,g); }
  else if(shape==='can'){ cylinder(.033,.033,.12,m,0,.06,0,g); cylinder(.031,.031,.005,new THREE.MeshStandardMaterial({color:0xc8c8c4,metalness:.8,roughness:.3}),0,.123,0,g); cylinder(.0335,.0335,.04,label,0,.06,0,g); }
  else if(shape==='pack'){ box(.06,.1,.04,m,0,.05,0,g); cylinder(.003,.003,.12,new THREE.MeshStandardMaterial({color:0xf2f2f2}),.018,.12,0,g).rotation.z=-.3; }
  else if(shape==='cig'){ box(.055,.085,.022,m,0,.012,0,g).rotation.x=-Math.PI/2; box(.056,.03,.023,red,0,.013,-.02,g).rotation.x=-Math.PI/2; box(.022,.012,.06,new THREE.MeshStandardMaterial({color:0x2a4e7a,roughness:.3}),.06,.006,0,g); }
  else if(shape==='popcorn'){ const cup=new THREE.Mesh(new THREE.CylinderGeometry(.06,.045,.14,14,1,true),new THREE.MeshStandardMaterial({map:textCanvas(64,32,(gg,w,h)=>{ for(let i=0;i<8;i++){ gg.fillStyle=i%2?'#f4efe4':'#c0352c'; gg.fillRect(i*w/8,0,w/8,h); } }),side:THREE.DoubleSide,roughness:.7})); cup.position.y=.07; g.add(cup);
    for(let k=0;k<14;k++){ const c=new THREE.Mesh(new THREE.IcosahedronGeometry(.016,0),m); c.position.set((Math.random()-.5)*.08,.14+Math.random()*.03,(Math.random()-.5)*.08); g.add(c); } }
  else if(shape==='mango'){ const f=new THREE.Mesh(new THREE.SphereGeometry(.05,14,10),m); f.scale.set(1,.8,1.35); f.position.y=.04; g.add(f); const bl=new THREE.Mesh(new THREE.SphereGeometry(.03,10,8),new THREE.MeshStandardMaterial({color:0xd8582a,roughness:.5})); bl.position.set(.025,.055,.03); g.add(bl); }
  else if(shape==='cig2'){ box(.1,.02,.08,m,0,.01,0,g); for(let k=0;k<2;k++){ const c=cylinder(.006,.006,.1,new THREE.MeshStandardMaterial({color:0x5a3218,roughness:.8}),-.02+k*.025,.026,0,g); c.rotation.x=Math.PI/2; } }
  return g; }
let mySnackMesh=new THREE.Group(); scene.add(mySnackMesh);
function setSnack(i){ mySnack=i; scene.remove(mySnackMesh); mySnackMesh=snackMesh(i); scene.add(mySnackMesh); pushPresence(); renderPeople(); }
function showSnacks(){ const body=openPanel('矮櫃',`<p class="meta">拉開櫃門，裡面偷偷塞了零食、飲料和香菸。拿一樣，坐下時會擺在你面前。${mySnack>=0?`現在手上是${esc(SNACKS[mySnack][0])}。`:''}</p><ul class="list menu">${SNACKS.map(([n,d,,,hide],i)=>hide?'':`<li data-sn="${i}"><div><div class="bt">${n}</div><div class="ba">${d}</div></div><span class="ba">${i===mySnack?'手上這個':'拿這個'}</span></li>`).join('')}</ul>${mySnack>=0?'<button class="btn" id="snback">放回櫃子</button>':''}`);
  body.querySelector('.list').onclick=e=>{ const li=e.target.closest('li[data-sn]'); if(!li) return; const i=+li.dataset.sn; setSnack(i); try{ knock(); }catch{} toast(`從矮櫃裡摸出${SNACKS[i][0]}。`); closePanel(); };
  const bk=body.querySelector('#snback'); if(bk) bk.onclick=()=>{ setSnack(-1); toast('放回櫃子了。'); closePanel(); }; }

/* ================= 知了間（依平面圖，第二版） ================= */
// The hall keeps its own floor and walls. Plan layout, re-fitted to the real room: entrance and corridor on the hall door (x 0),
// a small 四疊半 of tatami in the left-back corner, the tea rooms on the right (world -x). All sizes live in ZP.
const ZP={
  front:15.6, back:23.6, left:7.36, right:-7.36,      // hall inner faces
  corridorX:0,                                         // the entrance axis: door, 玄關桌 and scroll line up on it
  tatami:2.73, tatamiRise:.15, tokoDepth:.6,           // a real 四疊半 (3 x 0.91 m) and its tokonoma behind
  irori:.62, jizaiTop:3.45,
  genkan:{w:.93,d:.3,h:.8},
  display:{cx:-4.815,w:4.19,d:.45,h:1.8}, _d0:{d:.4,h:1.9},
  modern:{cx:-4.95,cz:21.95,w:2.5,d:.95,h:.72}, modernChairH:.45,
  fireplace:{cz:21.55},
  basin:{x:-6.2,z:19.6},
  teaShelf:{z0:16.62,z1:18.5,d:.3,h:2.0},
  gf:{cx:-4.6,cz:17.95,w:.9,h:.6,stool:.78}, stoolH:.38,
};
const PLAN={corridorX:590};
const PX=px=>-(px-590)/(1013-590)*7.36;   // kept for the plan's corridor reference (590 → x 0)
const ZL_DYN=[], ZL_LIVE=[];
const FACE=[0,Math.PI/2,Math.PI]; const faceYaw=c=>c===-1?-Math.PI/2:FACE[c];
// plan pixels of the tatami square (115..505, 285..675) mapped onto the real one
const TX=px=>ZP.left-(px-115)/390*ZP.tatami, TZ=py=>(ZP.back-ZP.tokoDepth)-(py-285)/390*ZP.tatami;
const OB=(x0,x1,z0,z1)=>OBST.push({x0:Math.min(x0,x1),x1:Math.max(x0,x1),z0:Math.min(z0,z1),z1:Math.max(z0,z1)});
/* ---------- materials ---------- */
const huanghuali=new THREE.MeshStandardMaterial({color:0x7c4b28,roughness:.42});
const huangDark=new THREE.MeshStandardMaterial({color:0x4a2c1a,roughness:.48});
const darkWood=new THREE.MeshStandardMaterial({color:0x2e1d14,roughness:.5});
// solid wood with grain, for the tea room's tables, stools and benches: one texture per wood, laid along the length of
// tops and rails (H) or up the legs (V)
function woodPair(base,line,rough=.5){ const mk=vert=>{ const t=ctex(512,128,(g,w,h)=>{ g.fillStyle=base; g.fillRect(0,0,w,h); const R=rnd(base.length*97+line.length);
    for(let i=0;i<70;i++){ const y=R()*h, a=.04+R()*.12, amp=1+R()*2.5, ph=R()*6; g.strokeStyle=`rgba(${line},${a})`; g.lineWidth=.6+R()*1.8; g.beginPath(); for(let x=0;x<=w;x+=8){ const yy=y+Math.sin(x/(60+R()*40)+ph)*amp; x?g.lineTo(x,yy):g.moveTo(x,yy); } g.stroke(); }
    for(let i=0;i<3;i++){ const cx=R()*w, cy=R()*h; for(let k=1;k<7;k++){ g.strokeStyle=`rgba(${line},.12)`; g.beginPath(); g.ellipse(cx,cy,k*7,k*2.2,0,0,Math.PI*2); g.stroke(); } } });
    if(vert){ t.center.set(.5,.5); t.rotation=Math.PI/2; } return new THREE.MeshStandardMaterial({map:t,roughness:rough}); };
  return {H:mk(false),V:mk(true)}; }
const WD_HHL=woodPair('#b8936a','95,65,35',.45), WD_HHD=woodPair('#9a7550','70,45,22',.48), WD_WAL=woodPair('#6e4a2e','35,20,10',.5), WD_OAK=woodPair('#a9825a','70,45,25',.55), WD_WALD=woodPair('#3a2618','15,8,4',.5);

const oak=new THREE.MeshStandardMaterial({color:0x8a6a48,roughness:.55});
const hinoki=new THREE.MeshStandardMaterial({color:0xcfae7e,roughness:.6});
const whitePorcelain=new THREE.MeshStandardMaterial({color:0xf6f3ec,roughness:.18,side:THREE.DoubleSide});
const blueWhite=new THREE.MeshStandardMaterial({color:0xe9eef2,roughness:.2,side:THREE.DoubleSide});
const zhuni=new THREE.MeshStandardMaterial({color:0xa8462c,roughness:.6});
const zisha=new THREE.MeshStandardMaterial({color:0x5c2c20,roughness:.62});
const celadonGlaze=new THREE.MeshStandardMaterial({color:0x9db8a0,roughness:.25});
const redClay=new THREE.MeshStandardMaterial({color:0x9c4128,roughness:.85});
const ironBlack=new THREE.MeshStandardMaterial({color:0x2a2826,roughness:.55,metalness:.55});
const ember=new THREE.MeshStandardMaterial({color:0x1a1210,emissive:0xff5a1a,emissiveIntensity:0,roughness:1});
const emberGF=ember.clone();
const pewter=new THREE.MeshStandardMaterial({color:0xa9aaa4,metalness:.75,roughness:.38});
const plaster=new THREE.MeshStandardMaterial({color:0xc9b28c,roughness:1});
const greyStone=new THREE.MeshStandardMaterial({color:0xb4b2ad,roughness:.9});
const bronzeOld=new THREE.MeshStandardMaterial({color:0x6a5236,metalness:.6,roughness:.45});
ZL_LIVE.push(ember,emberGF);
const lathe=(pts,mat,seg=28)=>new THREE.Mesh(new THREE.LatheGeometry(pts.map(([r,y])=>new THREE.Vector2(r,y)),seg),mat);
const lookY=(yaw)=>[-Math.sin(yaw),-Math.cos(yaw)];
const RUOCHEN=[[0,0],[.012,0],[.013,.004],[.011,.006],[.024,.026],[.029,.034],[.0295,.036]];
function ruochen(parent,x,y,z){ const g=new THREE.Group(); g.position.set(x,y,z); parent.add(g); g.add(lathe(RUOCHEN,whitePorcelain,20));
  const tea=new THREE.Mesh(new THREE.CircleGeometry(.025,18),new THREE.MeshStandardMaterial({color:0xc8862c,roughness:.15})); tea.rotation.x=-Math.PI/2; tea.position.y=.027; tea.visible=false; g.add(tea); g.userData.tea=tea; return g; }


/* ================= 知了間 v19：和室（土間→式台→縁側→障子→疊）、明間（條案觀音、太師椅）、茶室 ================= */
const ZL_ANIM=[];   // per-frame updates of small living things (frogs in the tank)
// the roof underside of the hall, so partitions close against it
const roofUnder=zl=>3.70+RISE*Math.pow(1-Math.min(1,Math.abs(zl)/5.62),1.26)-.16;
const ZR={ wallX:2.65, wallT:.14, brickH:.9, door:{z0:19.1,z1:20.7,h:2.5}, win:{z:21.95,y:1.55,r:.5} };
// PP: the parent to build into (a wing group for the other halls); PB: records a wall as an obstacle
let PP=scene, PB=(x0,x1,z0,z1)=>OB(x0,x1,z0,z1);
function partition(x){ const TW=ZR.wallT, D=ZR.door, segs=[[ZP.front,D.z0],[D.z1,ZP.back]];
  for(const [z0,z1] of segs){ const L=z1-z0, cz=(z0+z1)/2;
    box(TW,ZR.brickH,L,mBrick(L*.78,ZR.brickH*1.05),x,ZR.brickH/2,cz,PP,BLOCK);
    { // the white upper wall either side of the door, each pierced by an octagonal window set symmetrically about the door
      const W={...ZR.win, z:z0<D.z0?D.z0+D.z1-ZR.win.z:ZR.win.z}, oct=(r)=>[...Array(8)].map((_,k)=>{ const a=Math.PI/8+k*Math.PI/4; return [W.z-19.6+Math.cos(a)*r, W.y+Math.sin(a)*r]; });
      const sh=new THREE.Shape(); sh.moveTo(z0-19.6,ZR.brickH); sh.lineTo(z1-19.6,ZR.brickH); sh.lineTo(z1-19.6,D.h); sh.lineTo(z0-19.6,D.h); sh.closePath();
      const h=new THREE.Path(); oct(W.r).forEach(([a,b],k)=>k?h.lineTo(a,b):h.moveTo(a,b)); h.closePath(); sh.holes.push(h);
      const m=new THREE.Mesh(new THREE.ExtrudeGeometry(sh,{depth:TW,bevelEnabled:false}),new THREE.MeshStandardMaterial({map:texRep(T.white,1,1),roughness:.92})); m.rotation.y=-Math.PI/2; m.position.set(x+TW/2,0,19.6); PP.add(m);
      // wooden frame and a simple bagua lattice: an inner octagon tied to the frame by eight spokes
      const ring=(ro,ri,dep,mat)=>{ const s2=new THREE.Shape(); oct(ro).forEach(([a,b],k)=>k?s2.lineTo(a,b):s2.moveTo(a,b)); s2.closePath(); const hh=new THREE.Path(); oct(ri).forEach(([a,b],k)=>k?hh.lineTo(a,b):hh.moveTo(a,b)); hh.closePath(); s2.holes.push(hh);
        const g=new THREE.ExtrudeGeometry(s2,{depth:dep,bevelEnabled:false}); g.translate(0,0,-dep/2); const r=new THREE.Mesh(g,mat); r.rotation.y=-Math.PI/2; r.position.set(x,0,19.6); PP.add(r); };
      ring(W.r+.07,W.r-.03,TW+.06,darkWood); WINDOWS.push({k:'oct',parent:PP,x,y:W.y,z:W.z,r:W.r-.035});
      const lat=new THREE.MeshStandardMaterial({color:0x4a3020,roughness:.6}); ring(.17,.14,.04,lat);
      for(let k=0;k<8;k++){ const a=k*Math.PI/4, r0=.155, r1=W.r-.02, L2=r1-r0, mz=(r0+r1)/2;
        const b=box(.035,.025,L2,lat,x,W.y+Math.sin(a)*mz,W.z+Math.cos(a)*mz,PP); b.rotation.x=-a; } }
    PB(x-TW/2,x+TW/2,z0,z1); }
  const s=new THREE.Shape(); s.moveTo(-4.15,D.h); for(let i=0;i<=24;i++){ const z=-4.15+8.3*i/24; s.lineTo(z,roofUnder(z)); } s.lineTo(4.15,D.h); s.closePath();
  const m=new THREE.Mesh(new THREE.ExtrudeGeometry(s,{depth:TW,bevelEnabled:false}),new THREE.MeshStandardMaterial({map:texRep(T.white,1,1),roughness:.92}));
  m.rotation.y=-Math.PI/2; m.position.set(x+TW/2,0,19.6); PP.add(m);
  for(const z of [D.z0,D.z1]) box(TW+.06,D.h,.08,darkWood,x,D.h/2,z,PP);
  box(TW+.06,.1,D.z1-D.z0+.16,darkWood,x,D.h+.02,(D.z0+D.z1)/2,PP); box(TW+.06,.16,D.z1-D.z0,darkWood,x,.08,(D.z0+D.z1)/2,PP); }   // wooden frame and threshold
partition(ZR.wallX); partition(-ZR.wallX);
// 第二進、第一進 four wings, divided the same way as 知了間 (north room / 明間 / south room). Each is built in a group
// laid over the 知了間 frame: the west wings are 知了間 shifted south; the east wings are turned half round so they face
// the court from the other side (a turn, not a mirror, so every face keeps its front side out).
for(const cx of [2*courtAxis,4*courtAxis]) for(const west of [true,false]){
  const g=new THREE.Group(); g.position.set(cx,0,west?0:2*courtAxis); if(!west) g.rotation.y=Math.PI; scene.add(g);
  PP=g; PB=(x0,x1,z0,z1)=>west?OB(cx+x0,cx+x1,z0,z1):OB(cx-x1,cx-x0,2*courtAxis-z1,2*courtAxis-z0);
  partition(ZR.wallX); partition(-ZR.wallX); }
PP=scene; PB=(x0,x1,z0,z1)=>OB(x0,x1,z0,z1);

/* ================= left: the Japanese room ================= */
// Coming in through the doorway you stand on the 土間 (stone, floor level), take off your shoes at the 沓脱石, step up the 式台
// onto one open field of tatami with the irori and a tokonoma.
const JR={ dama:{x0:2.72,x1:3.6}, rise:.25, shojiX:4.6, u:.91,
  tat:{x1:ZP.left, z1:22.96},                 // tatami: 3 units wide (from the left wall), 6 units deep (from the tokonoma)
  shojiDoor:{z0:19.14,z1:21.0} };
JR.u=(JR.tat.z1-16.05)/8; JR.tat.x0=JR.tat.x1-4*JR.u; JR.tat.z0=JR.tat.z1-8*JR.u;   // 4 × 8 units: fifteen mats and a half, with the irori half mat
const TATAMI={x0:JR.dama.x1, x1:ZP.left, z0:16.05, z1:ZP.back, h:JR.rise};
// 二進西廂南間 (the schoolroom): the teacher's platform along the west wall
const CLS_PLAT={x0:22.32,x1:26.96,z0:21.7,z1:23.6,h:.15}, CLS_ROOM={}, CLS_LAP={};
// 12 號房 電影院: the room, the riser (45 cm, to z 17.6) and its one step (22.5 cm, to z 17.9), the flat ceiling; the drinks in the fridge
const CIN={x0:12.24,x1:16.88,z0:15.6,z1:23.6,xc:14.56,rz:17.6,sz:17.9,rh:.45,sh:.225,ceil:3.4,
  DRINK:[{c:0xb5803e,k:'pack'},{c:0xb88a3a,k:'can'},{c:0x5a2416,k:'can'},{c:0x7fc6d8,k:'bottle',glass:true,cap:0x2a6ad0},{c:0xb02a24,k:'can'},{c:0x4f9a52,k:'can'},{c:0xc9952e,k:'bottle',glass:true,cap:0xe0e0e0},{c:0x9fb54a,k:'bottle',glass:true,cap:0x3f8a3a},{c:0xd9a441,k:'pack'},{c:0xc9a27a,k:'pack'},
    {c:0xf4f2ec,k:'box'},{c:0xf0e6f0,k:'bottle',cap:0xd04a7a},{c:0xff5a3a,k:'bottle',cap:0xe02a2a},{c:0xefe6d2,k:'box'},{c:0xe0d0a8,k:'box'},{c:0xf0961e,k:'box'},{c:0xd6e8a0,k:'box'},{c:0xb7c98a,k:'can'},{c:0x6ab0e0,k:'bottle',cap:0x2050a0},{c:0xd8eef8,k:'bottle',glass:true,cap:0x3a7ad0}],
  DRINK0:[{c:0x8a5a2b,k:'can'},{c:0x5a3a1c,k:'bottle',glass:true,cap:0xc8a040},{c:0x3a1f14,k:'can'},{c:0x7fb6d8,k:'bottle',glass:true,cap:0x2a6ad0},{c:0xc9952e,k:'bottle',glass:true,cap:0xe0e0e0},
    {c:0x9fb54a,k:'bottle',glass:true,cap:0x3f8a3a},{c:0xf0961e,k:'box'},{c:0xb7c98a,k:'can'},{c:0xf2eee4,k:'box'},{c:0xd8eef8,k:'bottle',glass:true,cap:0x3a7ad0}]};
function floorY(x,z){ if(x<-100&&STN){ const y=STN.floor(x,z); if(y!=null) return y; } if(typeof TWP!=='undefined'&&TWP.floorY){ const y=TWP.floorY(x,z); if(y!=null) return y; } if(x>CIN.x0&&x<CIN.x1&&z>CIN.z0&&z<CIN.sz) return z<CIN.rz?CIN.rh:CIN.sh; if(x>CLS_PLAT.x0&&x<CLS_PLAT.x1&&z>CLS_PLAT.z0&&z<CLS_PLAT.z1) return CLS_PLAT.h; return (x>TATAMI.x0&&x<TATAMI.x1&&z>TATAMI.z0&&z<TATAMI.z1)?TATAMI.h:0; }
const SHOJI={open:true,k:1,leaves:[]};
function zlBlocked(x,z){ return false; }
const IRS=ZP.irori, IY=JR.rise;
const TXu=(ux)=>JR.tat.x1-ux*JR.u, TZu=(uz)=>JR.tat.z1-uz*JR.u;
const IRC={x:TXu(1.5), z:TZu(4.5)};
{ const R=JR.rise, T=TATAMI;
  // 土間: stone floor, the 沓脱石 and a wooden 式台 at the doorway
  const dW=JR.dama.x1-JR.dama.x0, dD=ZP.back-16.05;
  const doma=new THREE.Mesh(new THREE.PlaneGeometry(dW,dD),std(stonePaving,dW/1.2,dD/1.2,{color:0x8e877c})); doma.rotation.x=-Math.PI/2; doma.position.set((JR.dama.x0+JR.dama.x1)/2,.009,16.05+dD/2); doma.userData={type:'floor'}; scene.add(doma); pickables.push(doma);
  const D=ZR.door; box(.2,.18,D.z1-D.z0,hinoki,JR.dama.x1-.1,.09,(D.z0+D.z1)/2);
  box(.42,.12,.62,new THREE.MeshStandardMaterial({color:0x7d776d,roughness:.95}),JR.dama.x1-.42,.06,(D.z0+D.z1)/2);
  for(const dz of [-.1,.1]){ const z=(D.z0+D.z1)/2+dz; box(.24,.015,.09,new THREE.MeshStandardMaterial({color:0xc9b48a,roughness:.9}),JR.dama.x1-.45,.127,z); }   // a pair of zōri on the stone
  // raised floor round the irori pit (boards), the edge beam (框) facing the 土間
  const half=IRS/2, pit={x0:IRC.x-half,x1:IRC.x+half,z0:IRC.z-half,z1:IRC.z+half};
  const tH=.028, subH=R-tH, subX0=T.x0+.08;
  for(const [a,b,c,d] of [[subX0,T.x1,pit.z1,T.z1],[subX0,T.x1,T.z0,pit.z0],[subX0,pit.x0,pit.z0,pit.z1],[pit.x1,T.x1,pit.z0,pit.z1]]) box(Math.abs(b-a),subH,Math.abs(d-c),hinoki,(a+b)/2,subH/2,(c+d)/2);
  box(.08,R,T.z1-T.z0,darkWood,T.x0+.04,R/2,(T.z0+T.z1)/2);
  if(JR.tat.x0>T.x0+.08) box(JR.tat.x0-(T.x0+.08),tH,T.z1-T.z0,hinoki,(T.x0+.08+JR.tat.x0)/2,R-tH/2,(T.z0+T.z1)/2);   // 板の間 (itama) wooden border flush with tatami
  const pickTop=new THREE.Mesh(new THREE.PlaneGeometry(T.x1-T.x0,T.z1-T.z0),new THREE.MeshBasicMaterial({visible:false})); pickTop.rotation.x=-Math.PI/2; pickTop.position.set((T.x0+T.x1)/2,R+.001,(T.z0+T.z1)/2); pickTop.userData={type:'floor'}; scene.add(pickTop); pickables.push(pickTop);
  // authentic Japanese shūgi-jiki layout matching photo (two 2x1 mats along tokonoma/地袋, pinwheel center, 0.002m tight seams, dark heri)
  const tex=(full)=>ctex(256,full?512:256,(g,w,h)=>{ g.fillStyle='#c4b678'; g.fillRect(0,0,w,h);
    for(let y=0;y<h;y+=2){ g.fillStyle=y%4===0?'rgba(138,126,68,.30)':'rgba(230,220,156,.26)'; g.fillRect(0,y,w,1); }
    for(let x=0;x<w;x+=8){ g.fillStyle='rgba(95,88,42,.07)'; g.fillRect(x,0,1,h); }
    if(full){
      g.fillStyle='#141923'; g.fillRect(0,0,15,h); g.fillRect(w-15,0,15,h);
      g.fillStyle='rgba(55,70,96,.30)'; for(let y=4;y<h;y+=8){ g.fillRect(4,y,7,2); g.fillRect(w-11,y,7,2); }
    }
    g.strokeStyle='rgba(40,35,18,.55)'; g.lineWidth=2; g.strokeRect(1,1,w-2,h-2); });
  const fullMat=new THREE.MeshStandardMaterial({map:tex(true),roughness:.93}), halfMat=new THREE.MeshStandardMaterial({map:tex(false),roughness:.93}), edgeMat=new THREE.MeshStandardMaterial({color:0x9e9654,roughness:.95});
  const mats=[[0,0,2,1],[2,0,2,1],[0,1,1,2],[1,1,2,1],[1,2,2,1],[3,1,1,2],[0,3,2,1],[2,3,2,1],[0,4,1,2],[2,4,1,2],[3,4,1,2],[1,5,1,2],[0,6,1,2],[2,6,2,1],[1,7,1,1],[2,7,2,1]];   // shūgi-jiki: no four corners meet; (1,4) is the irori
  for(const [ux,uz,w,h] of mats){ const x0=TXu(ux+w), x1=TXu(ux), z0=TZu(uz+h), z1=TZu(uz); const W=x1-x0, Dd=z1-z0, full=w*h===2;
    const topMat=full?fullMat:halfMat, boxMats=[edgeMat,edgeMat,topMat,edgeMat,edgeMat,edgeMat];
    const m=new THREE.Mesh(W>Dd?new THREE.BoxGeometry(Dd-.002,tH,W-.002):new THREE.BoxGeometry(W-.002,tH,Dd-.002),boxMats);
    if(W>Dd) m.rotation.y=Math.PI/2; m.position.set((x0+x1)/2,R-tH/2,(z0+z1)/2); scene.add(m); }
  // plaster walls and 長押 inside the washitsu (and over the 土間), so no brick shows in the Japanese room
  const tsuchi=new THREE.MeshStandardMaterial({color:0xcdb994,roughness:.97}), CEIL=R+2.35;
  box(ZP.left-JR.dama.x0,.905,.025,tsuchi,(ZP.left+JR.dama.x0)/2,.4525,ZP.back-.013);          // back wall dado
  box(.025,.905,ZP.back-ZP.front,tsuchi,ZP.left-.013,.4525,(ZP.back+ZP.front)/2);               // left wall dado
  box(ZP.left-JR.dama.x0,.905,.025,tsuchi,(ZP.left+JR.dama.x0)/2,.4525,ZP.front+.013);          // front wall dado
  for(const [z0,z1] of [[ZP.front,ZR.door.z0],[ZR.door.z1,ZP.back]]) box(.02,.905,z1-z0,tsuchi,ZR.wallX+ZR.wallT/2+.01,.4525,(z0+z1)/2);
  const nag=R+1.8+.06; box(ZP.left-JR.tat.x0,.09,.04,darkWood,(ZP.left+JR.tat.x0)/2,nag+.045,ZP.back-.03); box(.04,.09,ZP.back-JR.tat.z0,darkWood,ZP.left-.03,nag+.045,(ZP.back+JR.tat.z0)/2);
  box(.03,.06,JR.tat.z1-JR.tat.z0,darkWood,ZP.left-.03,R+.03,(JR.tat.z1+JR.tat.z0)/2);   // 疊寄 (stops before tokonoma/地袋)
  // tokonoma (1 ken) behind the mats with a 床柱, 落掛 and the small wall above; a 床脇 with shelves beside it
  const tx1=JR.tat.x1, tx0=tx1-2*JR.u, zf=JR.tat.z1, zb=ZP.back-.03, toY=R+1.78;
  box(tx1-tx0,.12,zb-zf,new THREE.MeshStandardMaterial({color:0x4a2e1c,roughness:.3}),(tx0+tx1)/2,R+.06,(zf+zb)/2,scene,BLOCK);
  box(tx1-tx0,.13,.05,new THREE.MeshStandardMaterial({color:0x111010,roughness:.25}),(tx0+tx1)/2,R+.065,zf+.025);
  box(.04,CEIL-R,zb-zf,tsuchi,tx0,(R+CEIL)/2,(zf+zb)/2);                                     // 袖壁 between toko and 床脇
  cylinder(.06,.065,CEIL-R,new THREE.MeshStandardMaterial({color:0x8a6a48,roughness:.6}),tx0,(R+CEIL)/2,zf);      // 床柱
  box(tx1-tx0,.08,.06,darkWood,(tx0+tx1)/2,toY,zf);                                          // 落掛
  box(ZP.left-JR.tat.x0,CEIL-toY-.04,.03,new THREE.MeshStandardMaterial({color:0xece4d2,roughness:.95,side:THREE.DoubleSide}),(ZP.left+JR.tat.x0)/2,(toY+.04+CEIL)/2,zf);   // 小壁 over toko and 床脇
  { const wx0=JR.tat.x0, wx1=tx0-.02, cx=(wx0+wx1)/2, W=wx1-wx0, d=zb-zf, cz=(zf+zb)/2, sh=new THREE.MeshStandardMaterial({color:0x3a2416,roughness:.42}), fus=new THREE.MeshStandardMaterial({color:0x8fa396,roughness:.92});
    box(W,.32,d,sh,cx,R+.16,cz,scene,BLOCK); for(const s of [-1,1]){ box(W/2-.01,.24,.005,fus,cx+s*W/4,R+.16,zf-.003); cylinder(.014,.014,.006,darkWood,cx+s*W/4+(s>0?-W/6:W/6),R+.16,zf-.006).rotation.x=Math.PI/2; }   // 地袋
    box(W*.55,.03,d-.05,sh,wx0+W*.55/2,R+.95,cz); box(W*.55,.03,d-.05,sh,wx1-W*.55/2,R+1.1,cz); box(.02,.15,.02,sh,cx,R+1.03,zf+.08);   // 違い棚
    box(W,.32,d,sh,cx,toY-.2,cz); for(const s of [-1,1]){ box(W/2-.01,.24,.005,fus,cx+s*W/4,toY-.2,zf-.003); cylinder(.014,.014,.006,darkWood,cx+s*W/4+(s>0?-W/6:W/6),toY-.2,zf-.006).rotation.x=Math.PI/2; }      // 天袋
    // 日式扇子 (sensu) on a small dark-wood stand atop the 地袋
    { const fg=new THREE.Group(); fg.position.set(cx,R+.32,cz); fg.rotation.y=Math.PI; scene.add(fg);
      box(.14,.012,.06,darkWood,0,.006,0,fg); for(const sx of [-.04,.04]) box(.012,.04,.016,darkWood,sx,.028,.01,fg);
      const leafT=ctex(256,128,(g,w,h)=>{ g.fillStyle='#f4ebd4'; g.fillRect(0,0,w,h); g.fillStyle='#b83227'; g.beginPath(); g.arc(w*.5,h*.55,34,0,Math.PI*2); g.fill();
        g.fillStyle='rgba(202,162,72,.38)'; for(let i=0;i<18;i++) g.fillRect((i*37)%w,(i*23)%h,8,5); });
      const fan=new THREE.Group(); fan.position.set(0,.035,0); fan.rotation.x=-.18; fg.add(fan);
      const leaf=new THREE.Mesh(new THREE.RingGeometry(.055,.15,28,1,Math.PI*.14,Math.PI*.72),new THREE.MeshStandardMaterial({map:leafT,roughness:.85,side:THREE.DoubleSide})); fan.add(leaf);
      const ribM=new THREE.MeshStandardMaterial({color:0x4a2e1a,roughness:.5});
      for(let i=0;i<=8;i++){ const a=Math.PI*.14+i*(Math.PI*.72)/8; const r=new THREE.Mesh(new THREE.BoxGeometry(.004,.145,.003),ribM); r.position.set(Math.cos(a)*.072,Math.sin(a)*.072,-.002); r.rotation.z=a-Math.PI/2; fan.add(r); }
      cylinder(.005,.005,.008,new THREE.MeshStandardMaterial({color:0xc8a44a,metalness:.7,roughness:.3}),0,.008,0,fan).rotation.x=Math.PI/2; } }
  box(.04,CEIL-R,zb-zf+.03,tsuchi,JR.tat.x0-.02,(R+CEIL)/2,(zf+zb+.03)/2,scene,BLOCK);   // closes the 床脇 end toward the step
  OB(JR.tat.x0,tx1,zf,ZP.back);
  const tex2=vrTex('scroll','scroll-tea.jpg',640/1274); tex2.colorSpace=THREE.SRGBColorSpace; tex2.anisotropy=MAXANI;
  const sw=.62, sh=sw*1274/640, sx=(tx0+tx1)/2+.1, sy=R+.12+.14+sh/2, wz=ZP.back-.05;
  const pic=new THREE.Mesh(new THREE.PlaneGeometry(sw,sh),new THREE.MeshStandardMaterial({map:tex2,roughness:.9})); pic.position.set(sx,sy,wz-.006); pic.rotation.y=Math.PI; pic.userData={type:'cicada'}; scene.add(pic); pickables.push(pic);
  for(const dy of [sh/2,-sh/2]) cylinder(.014,.014,sw+.08,darkWood,sx,sy+dy,wz-.012).rotation.z=Math.PI/2;
  cylinder(.002,.002,toY-.1-(sy+sh/2),M.ink,sx,(toY-.1+sy+sh/2)/2,wz-.01);
  // a bamboo 花入 on the tokonoma board; the flower follows the season (Taipei month)
  const SEASON_FLOWER=(()=>{ const m=new Date().getMonth(); return m>=2&&m<=4?{c:0xf4c6d0,n:'山櫻',t:'春天插一枝山櫻。'}:m>=5&&m<=7?{c:0x6a4cb0,n:'桔梗',t:'夏天插桔梗。'}:m>=8&&m<=10?{c:0xe8b030,n:'小菊',t:'秋天插小菊。'}:{c:0xb21e2e,n:'紅椿',t:'冬天插一朵紅椿。'}; })(); window.SEASON_FLOWER=SEASON_FLOWER;
  const fx=tx0+.35, fz=(zf+zb)/2, y0=R+.12, ipick={type:'ikebana'};
  const vase=cylinder(.045,.05,.32,new THREE.MeshStandardMaterial({color:0x8a7444,roughness:.6}),fx,y0+.16,fz); vase.userData=ipick; pickables.push(vase);
  const twig=new THREE.MeshStandardMaterial({color:0x3b2a1c,roughness:1}), leafM=new THREE.MeshStandardMaterial({color:0x234a2a,roughness:.6,side:THREE.DoubleSide}), petal=new THREE.MeshStandardMaterial({color:SEASON_FLOWER.c,roughness:.6});
  const c=new THREE.CatmullRomCurve3([[0,.3,0],[.03,.42,-.02],[.09,.5,-.05],[.16,.52,-.08]].map(p=>new THREE.Vector3(fx+p[0],y0+p[1],fz+p[2]))); scene.add(new THREE.Mesh(new THREE.TubeGeometry(c,16,.005,6,false),twig));
  for(let i=0;i<4;i++){ const p=c.getPoint(.3+i*.2); const l=new THREE.Mesh(new THREE.SphereGeometry(.03,8,6),leafM); l.scale.set(1.6,.25,.8); l.position.copy(p); l.rotation.y=i; scene.add(l); }
  const fl=c.getPoint(1); for(let i=0;i<6;i++){ const pt=new THREE.Mesh(new THREE.SphereGeometry(.026,8,6),petal); pt.scale.set(1,.45,.8); const a=i/6*Math.PI*2; pt.position.set(fl.x+Math.cos(a)*.02,fl.y,fl.z+Math.sin(a)*.02); scene.add(pt); }
}
// (no shoji or ceiling: the raised floor is one open field of tatami behind the step)
function shojiPose(){ const D=JR.shojiDoor, k=SHOJI.k; for(const L of SHOJI.leaves){ const closed=L.i===0?D.z0+L.lw/2-.01:D.z1-L.lw/2+.01, open=D.z1+L.lw/2-.04+L.i*.0; L.g.position.z=closed+(open-closed)*k; } }
shojiPose();
function toggleShoji(){ const open=!SHOJI.open; myDoors={...myDoors,Z:[open?1:0,Date.now()]}; pushPresence(); SHOJI.open=open; noiseBurst(.5,600,.8,.05); toast(open?'拉開障子。':'拉上障子。'); }
function tickShoji(dt){ const want=doorState('Z'); SHOJI.open=want; const t=want?1:0; if(SHOJI.k!==t){ SHOJI.k+=Math.sign(t-SHOJI.k)*Math.min(Math.abs(t-SHOJI.k),dt*1.6); shojiPose(); } }
// irori: thick wooden frame, ash bed in the pit, charcoal, jizai-kagi from the ceiling, Nanbu tetsubin
const irori=(()=>{ const g=new THREE.Group(); g.position.set(IRC.x,IY,IRC.z); scene.add(g); const pick={type:'irori'}; const half=IRS/2, fw=.12;
  const frame=new THREE.MeshStandardMaterial({color:0x3a2416,roughness:.35});
  for(const s of [-1,1]){ box(IRS,.1,fw,frame,0,.0,s*(half-fw/2),g,pick); box(fw,.1,IRS-2*fw,frame,s*(half-fw/2),0,0,g,pick); }
  for(const s of [-1,1]){ box(IRS-2*fw,.3,.02,darkWood,0,-.2,s*(half-fw-.01),g); box(.02,.3,IRS-2*fw,darkWood,s*(half-fw-.01),-.2,0,g); }
  box(IRS-2*fw,.02,IRS-2*fw,new THREE.MeshStandardMaterial({color:0x8b8681,roughness:1}),0,-.1,0,g,pick);   // ash bed
  const R=rnd(5); const coals=[];
  for(let i=0;i<10;i++){ const c=new THREE.Mesh(new THREE.BoxGeometry(.07+R()*.05,.045,.05),ember); c.position.set((R()-.5)*.26,-.07,(R()-.5)*.26); c.rotation.y=R()*3; g.add(c); coals.push(c); }
  const light=new THREE.PointLight(0xff7a2a,0,4.5,2); light.position.set(0,.2,0); g.add(light);
  const top=ZP.jizaiTop-IY;
  const bamboo=new THREE.MeshStandardMaterial({color:0x5a4628,roughness:.5});
  cylinder(.024,.024,1.1,bamboo,0,top-.55,0,g);
  const fish=new THREE.Mesh(new THREE.SphereGeometry(.065,16,10),new THREE.MeshStandardMaterial({color:0x4a2c18,roughness:.4})); fish.scale.set(1.7,.7,.35); fish.position.set(0,top-1.1,0); g.add(fish);
  const tail=new THREE.Mesh(new THREE.ConeGeometry(.045,.08,4),fish.material); tail.rotation.z=Math.PI/2; tail.position.set(-.14,top-1.1,0); tail.scale.z=.35; g.add(tail);
  cylinder(.007,.007,top-1.1-.5,ironBlack,0,(top-1.1+.5)/2,0,g);
  const pot=new THREE.Group(); pot.position.set(0,.25,0); g.add(pot);
  const body=lathe([[0,0],[.06,0],[.11,.03],[.135,.07],[.13,.11],[.09,.15],[.05,.16],[0,.16]],ironBlack,32); body.userData=pick; pot.add(body); pickables.push(body);
  const boss=new THREE.SphereGeometry(.007,6,4); for(let r=0;r<3;r++) for(let i=0;i<28;i++){ const a=i/28*Math.PI*2+(r%2)*.11, rad=[.133,.128,.112][r], y=[.07,.1,.125][r]; const b=new THREE.Mesh(boss,ironBlack); b.position.set(Math.cos(a)*rad,y,Math.sin(a)*rad); pot.add(b); }
  pot.add(lathe([[0,.18],[.02,.178],[.05,.165],[.055,.158]],ironBlack)); cylinder(.012,.016,.02,ironBlack,0,.188,0,pot);
  const sp=new THREE.Mesh(new THREE.CylinderGeometry(.012,.022,.12,10),ironBlack); sp.position.set(.16,.11,0); sp.rotation.z=-1.0; pot.add(sp);
  const bail=new THREE.Mesh(new THREE.TorusGeometry(.12,.008,8,28,Math.PI),ironBlack); bail.position.set(0,.16,0); pot.add(bail);
  const steam=[]; for(let i=0;i<6;i++){ const s=new THREE.Sprite(steamMatBase.clone()); s.material.opacity=0; g.add(s); steam.push({sp:s,t:i/6}); }
  OB(IRC.x-half+.1,IRC.x+half-.1,IRC.z-half+.1,IRC.z+half-.1);
  return {coals,light,steam,spout:new THREE.Vector3(.22,.25+.16,0),fire:0}; })();
const VIV={on:false,level:0,lights:[],mat:null};   // the rainforest tank light, switched/dimmed by anyone in the room

// zabuton round the hearth, a tray, two andon, the instruments on the left wall
const IRORI_SEATS=[], IRORI_CUPS=[];
{ const zab=new THREE.MeshStandardMaterial({color:0x5a2e2a,roughness:1}), zab2=new THREE.MeshStandardMaterial({color:0x2e3a52,roughness:1}); const r=.68;
  [[0,r,0],[0,-r,2],[r,0,1],[-r,0,-1]].forEach(([dx,dz,f],i)=>{ const x=IRC.x+dx, z=IRC.z+dz, yaw=faceYaw(f); const si=addSeat(x,z,yaw,'irori','囲炉裏・座布團'); IRORI_SEATS.push(si); SEATS[si].ap={x:Math.min(x,6.55),z:Math.min(z,22.8)};
    const c=box(.48,.07,.48,i===2?zab2:zab,x,IY+.035,z,scene,{type:'seat',si}); c.rotation.y=yaw;
    const [fx,fz]=lookY(yaw); const cup=ruochen(scene,x+fx*.25+fz*.1,IY+.002,z+fz*.25-fx*.1); cup.visible=false; IRORI_CUPS.push(cup); }); }
{ const g=furn(IRC.x-.62,IRC.z-.62,0); g.position.y=IY+.002; const pick={type:'irori'};
  box(.32,.02,.22,new THREE.MeshStandardMaterial({color:0x2a1a12,roughness:.4}),0,.01,0,g,pick);
  const gw=new THREE.Group(); gw.position.set(-.07,.02,0); g.add(gw);
  gw.add(lathe([[0,0],[.05,0],[.055,.006],[.03,.008]],blueWhite)); const bowl=lathe([[0,.008],[.018,.008],[.02,.012],[.042,.05],[.048,.06]],blueWhite); gw.add(bowl); bowl.userData=pick; pickables.push(bowl);
  gw.add(lathe([[0,.072],[.012,.07],[.04,.058],[.046,.052]],blueWhite)); cylinder(.008,.01,.012,blueWhite,0,.076,0,gw);
  for(let i=0;i<3;i++) ruochen(g,.03+i*.05,.02,.065); }
for(const [x,z] of [[ZP.left-.3,JR.tat.z0+.3]]){ const g=furn(x,z,0); g.position.y=IY; const paperGlow=new THREE.MeshStandardMaterial({color:0xf3ead6,emissive:0xffc88a,emissiveIntensity:.6,roughness:.95,side:THREE.DoubleSide});
  for(const sx of [-1,1]) for(const sz of [-1,1]) box(.025,.72,.025,M.woodDark,sx*.15,.36,sz*.15,g);
  for(const [px,pz,ry] of [[0,.15,0],[0,-.15,0],[.15,0,Math.PI/2],[-.15,0,Math.PI/2]]){ const p=new THREE.Mesh(new THREE.PlaneGeometry(.29,.56),paperGlow); p.position.set(px,.41,pz); p.rotation.y=ry; g.add(p); }
  box(.34,.03,.34,M.woodDark,0,.015,0,g); LAMPS.push({f:{on:true},mat:paperGlow}); softLight(x,IY+.5,z,1.8,2.8); OB(x-.2,x+.2,z-.2,z+.2); }
{ const wx=ZP.left-.02, iy=IY+1.35, board=new THREE.MeshStandardMaterial({color:0xc29a62,roughness:.6}), sb=new THREE.MeshStandardMaterial({color:0x6a3a1e,roughness:.45}), str=new THREE.MeshStandardMaterial({color:0xd8d0b8});
  const yq=new THREE.Group(); yq.position.set(wx,iy,19.0); yq.rotation.y=-Math.PI/2; scene.add(yq); const ypick={type:'inst',k:'yq'};
  const bodyY=new THREE.Mesh(new THREE.CylinderGeometry(.19,.19,.06,40),sb); bodyY.rotation.x=Math.PI/2; bodyY.position.z=.04; bodyY.userData=ypick; yq.add(bodyY); pickables.push(bodyY);
  const face=new THREE.Mesh(new THREE.CircleGeometry(.18,40),board); face.position.z=.071; face.userData=ypick; yq.add(face); pickables.push(face);
  box(.05,.26,.04,sb,0,.31,.05,yq,ypick); box(.07,.12,.04,sb,0,.49,.05,yq,ypick);
  for(const [sx,y] of [[-1,.46],[1,.46],[-1,.52],[1,.52]]) cylinder(.008,.006,.08,M.woodDark,sx*.06,y,.05,yq).rotation.z=Math.PI/2;
  for(let i=0;i<8;i++) box(.04,.006,.008,new THREE.MeshStandardMaterial({color:0xe8e0cc}),0,.2+i*.025,.075,yq);
  for(const sx of [-.008,.008]) box(.0015,.62,.0015,str,sx,.2,.083,yq);
  const kz=new THREE.Group(); kz.position.set(wx,iy-.15,19.8); kz.rotation.y=-Math.PI/2; scene.add(kz); const kpick={type:'inst',k:'kz'};
  const shell=new THREE.Mesh(new THREE.SphereGeometry(.075,20,12,0,Math.PI*2,0,Math.PI*.55),new THREE.MeshStandardMaterial({color:0x4a3020,roughness:.7})); shell.rotation.x=Math.PI/2; shell.position.z=.04; shell.userData=kpick; kz.add(shell); pickables.push(shell);
  const kf=new THREE.Mesh(new THREE.CircleGeometry(.07,24),board); kf.position.z=.042; kf.userData=kpick; kz.add(kf); pickables.push(kf);
  const neck=cylinder(.01,.01,.72,sb,0,.36,.04,kz); neck.userData=kpick; pickables.push(neck);
  for(const y of [.62,.68]) cylinder(.007,.005,.08,M.woodDark,.03,y,.04,kz).rotation.z=Math.PI/2;
  for(const sx of [-.006,.006]) box(.0012,.62,.0012,str,sx,.34,.05,kz);
  const bowC=new THREE.QuadraticBezierCurve3(new THREE.Vector3(.08,-.05,.06),new THREE.Vector3(.12,.3,.08),new THREE.Vector3(.08,.62,.06)); kz.add(new THREE.Mesh(new THREE.TubeGeometry(bowC,16,.004,6,false),M.woodDark)); }

/* ================= centre bay: a long altar table under 丁雲鵬《玉川煎茶圖》 and a couplet; a pair of 太師椅 with a tea stand on each side ================= */
{ const W=1.9, Dd=.45, H=.9, cx=ZP.corridorX, z=ZP.back-.06-Dd/2; const wood=new THREE.MeshStandardMaterial({color:0x3a2014,roughness:.38}); const pick={type:'altar2'};
  const g=furn(cx,z,0);
  box(W,.05,Dd,wood,0,H-.025,0,g,pick); for(const sx of [-1,1]){ const end=box(.16,.06,Dd,wood,sx*(W/2-.02),H+.02,0,g,pick); end.rotation.z=-sx*.25; }   // 翹頭
  for(const sx of [-1,1]){ for(const sz of [-1,1]) box(.06,H-.05,.06,wood,sx*(W/2-.2),(H-.05)/2,sz*(Dd/2-.06),g); box(.04,.5,Dd-.14,wood,sx*(W/2-.2),.5,0,g); box(.04,.06,Dd-.1,wood,sx*(W/2-.2),.05,0,g); }
  box(W-.5,.09,.025,wood,0,H-.1,-Dd/2+.03,g); for(const sx of [-1,1]){ const sp=box(.18,.14,.02,wood,sx*(W/2-.32),H-.17,-Dd/2+.03,g); sp.rotation.z=sx*.5; }
  OB(cx-W/2,cx+W/2,z-Dd/2,ZP.back);
  // 丁雲鵬《玉川煎茶圖》 on the back wall over the table, with the couplet 知味粗茶堪作伴／了心陋室可安身 either side
  const wz=ZP.back-.03, pw=1.0, ph=pw*1314/640, py=H+.25+ph/2+.12;
  const ptex=vrTex('teapaint','painting-teapaint.jpg',640/1314); ptex.colorSpace=THREE.SRGBColorSpace; ptex.anisotropy=MAXANI;
  const mount=new THREE.MeshStandardMaterial({color:0xd9ccb0,roughness:.95}), silk=new THREE.MeshStandardMaterial({color:0x5a6a5a,roughness:.9});
  box(pw+.14,ph+.5,.008,mount,cx,py+.06,wz-.004); box(pw+.06,ph+.06,.006,silk,cx,py,wz-.01);
  const pic=new THREE.Mesh(new THREE.PlaneGeometry(pw,ph),new THREE.MeshStandardMaterial({map:ptex,roughness:.9})); pic.position.set(cx,py,wz-.015); pic.rotation.y=Math.PI; pic.userData={type:'teapaint'}; scene.add(pic); pickables.push(pic);
  for(const dy of [ph/2+.31,-ph/2-.19]) cylinder(.016,.016,pw+.24,darkWood,cx,py+dy,wz-.02).rotation.z=Math.PI/2;
  cylinder(.002,.002,.35,M.ink,cx,py+ph/2+.5,wz-.01);
  const cw=.3, ch=ph+.2, cy=py+.05;
  const coupletTex=(txt)=>{ const c=document.createElement('canvas'); c.width=160; c.height=Math.round(160*ch/cw); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=MAXANI;
    const draw=()=>{ const g=c.getContext('2d'), W=c.width, Hh=c.height; g.fillStyle='#a8261e'; g.fillRect(0,0,W,Hh); g.globalAlpha=.18; for(let k=0;k<900;k++){ g.fillStyle=k%2?'#6e140e':'#d8543c'; g.fillRect(Math.random()*W,Math.random()*Hh,2,2); } g.globalAlpha=1;
      g.strokeStyle='#d8b060'; g.lineWidth=3; g.strokeRect(8,8,W-16,Hh-16); g.fillStyle='#16100c'; g.textAlign='center'; g.textBaseline='middle';
      const n=[...txt].length, step=(Hh-60)/n, fs=Math.min(W*.74,step*.86); g.font=`${fs}px Reisho,ReishoFull,"Noto Serif TC",serif`; [...txt].forEach((ch2,k)=>g.fillText(ch2,W/2,30+step*(k+.5))); t.needsUpdate=true; };
    draw(); if(document.fonts&&document.fonts.load) document.fonts.load('40px Reisho,ReishoFull',txt).then(draw).catch(()=>{}); return t; };
  // 上聯 on the viewer's right (facing +z, the right hand is -x)
  for(const [txt,sx] of [[(VRD.couplet&&VRD.couplet.upper)||'知味粗茶堪作伴',-1],[(VRD.couplet&&VRD.couplet.lower)||'了心陋室可安身',1]]){ const m=new THREE.Mesh(new THREE.PlaneGeometry(cw,ch),new THREE.MeshStandardMaterial({map:coupletTex(txt),roughness:.85}));
    const x=cx+sx*(pw/2+.5); m.position.set(x,cy,wz-.012); m.rotation.y=Math.PI; m.userData={type:'couplet'}; scene.add(m); pickables.push(m);
    for(const dy of [ch/2+.02,-ch/2-.02]) cylinder(.012,.012,cw+.06,darkWood,x,cy+dy,wz-.02).rotation.z=Math.PI/2; }
  const halo=new THREE.PointLight(0xfff0d8,0,2.6,2); halo.position.set(cx,py+.4,wz-1.1); scene.add(halo); fixtures.push({light:halo,power:1.6});
  // a small tea set on the table instead of the figure: a pewter caddy and a covered bowl
  { const caddy=cylinder(.05,.05,.16,pewter,.35,H+.08,0,g); caddy.userData=pick; pickables.push(caddy);
    const bw=lathe([[0,0],[.025,0],[.045,.04],[.05,.05]],whitePorcelain,18); bw.position.set(-.3,H,0); g.add(bw); const lid=lathe([[0,.06],[.01,.06],[.045,.05]],whitePorcelain,18); lid.position.set(-.3,H,0); g.add(lid); } }
// 太師椅: a pair on each side wall with a tea stand between, facing across the bay
const TAISHI_SEATS=[];
function taishi(x,z,yaw){ const g=furn(x,z,yaw); const wood=new THREE.MeshStandardMaterial({color:0x3a2014,roughness:.38}); const si=addSeat(x,z,yaw,'taishi','太師椅'); TAISHI_SEATS.push(si); const tag={type:'seat',si};
  box(.62,.05,.5,wood,0,.5,0,g,tag); box(.56,.03,.44,new THREE.MeshStandardMaterial({color:0x6e2e32,roughness:.9}),0,.54,0,g,tag);
  for(const sx of [-1,1]) for(const sz of [-1,1]) box(.05,.5,.05,wood,sx*.28,.25,sz*.22,g,tag);
  for(const sx of [-1,1]){ box(.04,.04,.46,wood,sx*.28,.06,0,g); box(.05,.32,.05,wood,sx*.29,.66,-.2,g,tag); box(.05,.05,.44,wood,sx*.29,.8,0,g,tag); box(.03,.26,.03,wood,sx*.29,.66,.1,g); }
  box(.04,.62,.04,wood,-.27,.84,.23,g,tag); box(.04,.62,.04,wood,.27,.84,.23,g,tag);
  const back=box(.5,.6,.035,wood,0,.86,.24,g,tag); const panel=box(.3,.32,.02,new THREE.MeshStandardMaterial({color:0x5a3420,roughness:.5}),0,.88,.22,g);
  const crest=box(.66,.08,.06,wood,0,1.2,.24,g,tag); for(const sx of [-1,1]){ const s=box(.1,.06,.06,wood,sx*.35,1.22,.24,g); s.rotation.z=sx*.4; }
  return si; }
for(const side of [1,-1]){ const x=side*(ZR.wallX-.38), yaw=side>0?Math.PI/2:-Math.PI/2;
  const zc=ZR.door.z0+ZR.door.z1-ZR.win.z;   /* centred under the front octagonal window */
  taishi(x,zc-.72,yaw); taishi(x,zc+.72,yaw);
  const tg=furn(x+side*.02,zc,yaw); const wood=new THREE.MeshStandardMaterial({color:0x3a2014,roughness:.38});
  box(.46,.04,.4,wood,0,.72,0,tg,{type:'taishi'}); for(const sx of [-1,1]) for(const sz of [-1,1]) box(.04,.7,.04,wood,sx*.19,.35,sz*.16,tg); box(.4,.03,.34,wood,0,.15,0,tg);
  const cup=lathe([[0,0],[.025,0],[.045,.04],[.05,.05]],whitePorcelain,18); cup.position.set(.08,.74,0); tg.add(cup); const lid=lathe([[0,.06],[.01,.06],[.045,.05]],whitePorcelain,18); lid.position.set(.08,.74,0); tg.add(lid);
  OB(x+side*.02-.23,x+side*.02+.23,zc-.2,zc+.2); }

// a matching pair of tall rosewood stands flanking the table, each with a branchy penjing in the same oval Yixing pot:
// an old plum stump in flower (老樁梅) on the right, a firethorn with red berries (火棘) on the left
{ const z=ZP.back-.36, wood=new THREE.MeshStandardMaterial({color:0x2a1810,roughness:.38}), potM=new THREE.MeshStandardMaterial({color:0x7a3a24,roughness:.5});
  const bark=new THREE.MeshStandardMaterial({color:0x5a4a3c,roughness:1}), twig=new THREE.MeshStandardMaterial({color:0x3a2a20,roughness:1}), y=1.05;
  const stand=(x,pick)=>{ const g=furn(x,z,0), H=y;
    box(.4,.04,.4,wood,0,H-.02,0,g,pick); box(.36,.08,.36,wood,0,H-.08,0,g);
    for(const sx of [-1,1]) for(const sz of [-1,1]){ box(.04,H-.06,.04,wood,sx*.16,(H-.06)/2,sz*.16,g); box(.05,.05,.05,wood,sx*.165,.025,sz*.165,g); }
    for(const sz of [-1,1]) box(.32,.03,.025,wood,0,.2,sz*.16,g); for(const sx of [-1,1]) box(.025,.03,.32,wood,sx*.16,.2,0,g);
    const pot=lathe([[0,0],[.16,0],[.18,.02],[.19,.08],[.2,.09]],potM,32); pot.scale.z=.65; pot.position.y=y; pot.userData=pick; g.add(pot); pickables.push(pot);
    const soil=new THREE.Mesh(new THREE.CircleGeometry(.185,32),new THREE.MeshStandardMaterial({color:0x4f5d33,roughness:1})); soil.rotation.x=-Math.PI/2; soil.scale.y=.65; soil.position.y=y+.085; g.add(soil);
    OB(x-.24,x+.24,z-.24,z+.24); return g; };
  const stump=(g,parts)=>{ for(const [dx,h,r,lean] of parts){ const c=new THREE.CatmullRomCurve3([[dx,.08,0],[dx+lean*.3,.08+h*.5,.01],[dx+lean*.6,.08+h,-.01]].map(v=>new THREE.Vector3(v[0],y+v[1],v[2]))); g.add(new THREE.Mesh(new THREE.TubeGeometry(c,16,r,7,false),bark)); } };
  const branches=(g,list,R,dot)=>{ for(const pts of list){ const c=new THREE.CatmullRomCurve3(pts.map(v=>new THREE.Vector3(v[0],y+v[1],v[2]))); g.add(new THREE.Mesh(new THREE.TubeGeometry(c,16,.006,5,false),twig)); for(let i=0;i<10;i++) dot(c.getPoint(.25+R()*.75),i); } };
  // 3D physics collision-resolution for penjing stands & branches against back wall / byobu screen
  const clampPenjing=(g)=>{ g.updateMatrixWorld(true); const zMax=ZP.back-.06;
    g.traverse(o=>{ if(!o.isMesh) return; const w=new THREE.Vector3(); o.getWorldPosition(w);
      if(o.geometry&&o.geometry.boundingSphere===null) o.geometry.computeBoundingSphere();
      const r=o.geometry&&o.geometry.boundingSphere?o.geometry.boundingSphere.radius:0;
      if(w.z+r>zMax){ o.position.z-=w.z+r-zMax; } }); };
  // right (-x): plum
  { const pick={type:'plum2'}, g=stand(-1.55,pick), R=rnd(91); stump(g,[[-.04,.24,.045,.15],[.035,.18,.038,-.25]]);
    const bloom=new THREE.MeshStandardMaterial({color:0xf3d9de,roughness:.7,emissive:0x2a1418}), bud=new THREE.MeshStandardMaterial({color:0xc2445a,roughness:.6});
    branches(g,[[[0,.32,0],[-.05,.46,.02],[-.02,.6,0],[.06,.7,-.03]],[[0,.32,0],[-.12,.4,-.02],[-.2,.44,.03]],[[0,.26,0],[.1,.32,.02],[.17,.42,-.02],[.22,.47,0]]],R,(p,i)=>{ const b=new THREE.Mesh(new THREE.SphereGeometry(i%4?.012:.008,8,6),i%4?bloom:bud); b.position.copy(p).add(new THREE.Vector3((R()-.5)*.02,(R()-.5)*.02,(R()-.5)*.02)); g.add(b); });
    const st=new THREE.Mesh(new THREE.DodecahedronGeometry(.05,0),new THREE.MeshStandardMaterial({color:0x6a6a66,roughness:.8})); st.scale.set(.8,1.4,.7); st.position.set(.11,y+.14,.02); g.add(st); clampPenjing(g); }
  // left (+x): firethorn, a leaning trunk with arching twigs, small dark leaves and clusters of red berries
  { const pick={type:'pyra'}, g=stand(1.55,pick), R=rnd(57); stump(g,[[.03,.22,.04,-.3],[-.03,.14,.03,.2]]);
    const leaf=new THREE.MeshStandardMaterial({color:0x2c4a26,roughness:.7}), berry=new THREE.MeshStandardMaterial({color:0xd0301c,roughness:.35});
    branches(g,[[[-.05,.28,0],[-.1,.4,.03],[-.08,.55,0],[0,.64,-.02]],[[-.05,.28,0],[-.18,.34,-.02],[-.27,.3,.02],[-.32,.22,0]],[[-.03,.24,0],[.08,.34,.03],[.18,.38,0],[.25,.33,-.02]],[[-.08,.42,.02],[-.02,.5,.06],[.08,.52,.04]]],R,(p,i)=>{
      if(i%3===0){ for(let k=0;k<5;k++){ const b=new THREE.Mesh(new THREE.SphereGeometry(.009,8,6),berry); b.position.copy(p).add(new THREE.Vector3((R()-.5)*.03,-.01-(R())*.015,(R()-.5)*.03)); g.add(b); } }
      else { const l=new THREE.Mesh(new THREE.SphereGeometry(.012,6,4),leaf); l.scale.set(1.6,.35,.8); l.position.copy(p).add(new THREE.Vector3((R()-.5)*.02,.005,(R()-.5)*.02)); l.rotation.y=R()*3; g.add(l); } }); clampPenjing(g); }
}
await __yield(0.6);
/* ================= right: the tea room ================= */
// the tea cabinet along the right wall, light zelkova, 1.5 m high like the teapot case on the back wall. Its ends are blind fillers
// exactly as deep as the cabinets that meet it (the front low cabinet, the back teapot case), so both corners close flush.
// Nine bays between equal fillers (b0 at the back), so the three-bay tank (b3–b5) and the painting over it sit on the wall's centre line: lower half b0–b1 pu-erh, b6 the wash basin, the rest tins;
// upper half b3–b5 (beside the basin) one wide rainforest tank, nothing over the basin, b0–b1 pu-erh, the rest tins.
{ const d=ZP.display.d, H=.9, TOP=1.5, TOP2=1.8, fF=ZP.display.d, fB=ZP.display.d, z0=ZP.front, z1=ZP.back, wood=new THREE.MeshStandardMaterial({color:0xb48a58,roughness:.5}), inner=new THREE.MeshStandardMaterial({color:0x9a7448,roughness:.6});
  const G=new THREE.Group(); G.position.set(ZP.right,0,(z0+z1)/2); G.rotation.y=Math.PI/2; scene.add(G);   // local x runs along the wall (toward -z), local z points into the room
  const Lall=z1-z0, xa=-Lall/2+fB, xb=Lall/2-fF, L=xb-xa, bays=9, bw=L/bays, U=b=>xa+bw*(b+.5), mid=.46, upY=1.2;
  box(fB,TOP2,d,wood,-Lall/2+fB/2,TOP2/2,d/2,G,BLOCK); box(fF,TOP2,d,wood,Lall/2-fF/2,TOP2/2,d/2,G,BLOCK);          // blind corner fillers
  box(L,.06,d,wood,(xa+xb)/2,.03,d/2,G,BLOCK); box(L,.04,d,wood,(xa+xb)/2,H-.02,d/2,G,BLOCK); { const t0=xa+3*bw, t1=xa+7*bw;   /* open over the tank (b3–b5) and over the basin (b6) */ box(t0+Lall/2,.04,d,wood,(-Lall/2+t0)/2,TOP-.02,d/2,G,BLOCK); box(Lall/2-t1,.04,d,wood,(t1+Lall/2)/2,TOP-.02,d/2,G,BLOCK); }
  box(L,TOP2,.02,inner,(xa+xb)/2,TOP2/2,.01,G);
  for(let b=0;b<=bays;b++){ if(b===4||b===5){ box(.03,H,d,wood,xa+bw*b,H/2,d/2,G,BLOCK); } else box(.03,TOP2,d,wood,xa+bw*b,TOP2/2,d/2,G,BLOCK); }   // b3–b5 open into one wide tank above the counter; an open top row over everything, no cap   // b3–b5 open into one wide tank above the counter
  OB(ZP.right,ZP.right+d,z0,z1);
  const TIN_PICK=TEAS.map((_,t)=>({type:'tin',t}));
  const LAB_M=TEAS.map(([n])=>new THREE.MeshStandardMaterial({roughness:.8,map:textCanvas(96,192,(c,w,h)=>{ c.fillStyle='#b4302a'; c.fillRect(0,0,w,h); speck(c,w,h,160,['#7a1a14','#d85a48'],.25); c.strokeStyle='#e6c27a'; c.lineWidth=3; c.strokeRect(6,6,w-12,h-12); c.fillStyle='#1a0f0a';
    const name=n.replace('鳳凰單叢・','單叢'); const fs=Math.min(30,(h-24)/[...name].length/1.04); c.font=F(700,fs); vtext(c,name,w/2,14,fs,h-8,1.04); })}));
  const shelf=(b,y)=>box(bw-.03,.025,d-.03,wood,U(b),y,d/2-.005,G);
  let k=0; const tin=(u,y)=>{ const t=k++%TEAS.length, r=.05, h=.15+(k%3)*.02; const tg=new THREE.Group(); tg.position.set(u,y,d/2); G.add(tg); const pick=TIN_PICK[t];
    const body=cylinder(r,r,h,pewter,0,h/2,0,tg); body.userData=pick; pickables.push(body); cylinder(r+.004,r+.004,.03,pewter,0,h+.01,0,tg);
    const lab=new THREE.Mesh(new THREE.CylinderGeometry(r+.0015,r+.0015,h*.62,20,1,true,-.65,1.3),LAB_M[t]); lab.position.y=h*.48; lab.userData=pick; tg.add(lab); pickables.push(lab); };
  const tinRow=(b,y)=>{ for(let u=U(b)-bw/2+.09;u<U(b)+bw/2-.07;u+=.13) tin(u,y); };
  // every bay its own theme, at varied heights, with gaps left — no long rows of the same tin
  const TW=new THREE.MeshStandardMaterial({color:0xd8c39a,roughness:.8}), TW2=new THREE.MeshStandardMaterial({color:0x8a6440,roughness:.6}), kraft=new THREE.MeshStandardMaterial({color:0xb89868,roughness:.95}), redLab=new THREE.MeshStandardMaterial({color:0xb4302a,roughness:.8});
  const iron=new THREE.MeshStandardMaterial({color:0x2a2826,roughness:.6,metalness:.35}), clay=new THREE.MeshStandardMaterial({color:0x7a4a30,roughness:.7}), clay2=new THREE.MeshStandardMaterial({color:0x4a3a2c,roughness:.55}), celadon=new THREE.MeshStandardMaterial({color:0x8fa898,roughness:.25});
  const ware={type:'teaware'};
  const put=(m,u,y)=>{ m.position.set(u,y,d/2); G.add(m); m.userData=ware; pickables.push(m); return m; };
  const bigPot=(u,y,s,m)=>{ put(lathe([[0,0],[.1,0],[.15,.08],[.16,.18],[.12,.28],[.07,.31],[.075,.33]].map(([a,b])=>[a*s,b*s]),m,24),u,y); const k=new THREE.Mesh(new THREE.SphereGeometry(.03*s,10,8),m); k.position.set(u,y+.34*s,d/2); G.add(k); };
  const kettle=(u,y,tall)=>{ const h=tall?1.25:1; put(lathe([[0,0],[.08,0],[.11,.04*h],[.115,.1*h],[.09,.15*h],[.04,.17*h],[.035,.18*h]],iron,22),u,y);
    const sp=cylinder(.012,.016,.09,iron,u+.12,y+.12*h,d/2,G); sp.rotation.z=-.9; const hd=new THREE.Mesh(new THREE.TorusGeometry(.07,.008,6,18,Math.PI),iron); hd.position.set(u,y+.18*h,d/2); G.add(hd); };
  const woodBox=(u,y)=>{ box(.28,.15,.22,TW,u,y+.075,d/2,G,ware); box(.285,.01,.225,TW2,u,y+.12,d/2,G); box(.06,.1,.005,new THREE.MeshStandardMaterial({color:0xf2ead8}),u,y+.07,d/2+.112,G); };
  const pack=(u,y)=>{ box(.09,.15,.065,kraft,u,y+.075,d/2,G,ware); box(.05,.06,.004,redLab,u,y+.08,d/2+.034,G); box(.092,.008,.067,new THREE.MeshStandardMaterial({color:0x5a3a20}),u,y+.11,d/2,G); };
  const cups=(u,y,n=4)=>{ for(let i=0;i<n;i++) put(lathe([[0,0],[.022,0],[.04,.035],[.042,.04]],whitePorcelain,16),u,y+i*.018); };
  const pot=(u,y,m)=>stdPot(G,u,y,d/2,.06,m,0);   /* the same standard Yixing pot as on the tea tables */
  const books=(u,y,n)=>{ const cs=[0x2c3e5a,0x6a4a2a,0x3a4a3a,0x8a2a2a]; for(let i=0;i<n;i++) box(.22,.028,.16,new THREE.MeshStandardMaterial({color:cs[i%4],roughness:.9}),u+(i%2?.01:-.01),y+.014+i*.03,d/2,G,ware); };
  const scoop=(u,y)=>{ const s=box(.16,.012,.04,new THREE.MeshStandardMaterial({color:0xc8a868,roughness:.8}),u,y+.02,d/2+.05,G,ware); s.rotation.z=.12; };
  const jar1=(u,y,m,s=1)=>{ const j=put(lathe([[0,0],[.07,0],[.1,.07],[.1,.16],[.06,.22],[.05,.24]],m,20),u,y); j.scale.setScalar(s); };
  const L0=.06, L1=mid+.013, L2=H, L3=upY+.013, L4=TOP;
  for(const b of [0,1,2,3,4,5,7,8]) shelf(b,mid); for(const b of [0,1,2,7,8]) shelf(b,upY);
  const u=b=>U(b);
  // full shelves, mostly tins, with the big pots, kettles, boxes and packets breaking up the rows
  bigPot(u(1),L0,1.15,clay); tinRow(1,L1); cups(u(1)-.2,L2); pot(u(1)+.05,L2,clay); tin(u(1)+.25,L2); woodBox(u(1)-.12,L3); tin(u(1)+.2,L3); tinRow(1,L4);
  kettle(u(2)-.15,L0,false); pack(u(2)+.12,L0); pack(u(2)+.24,L0); for(let i=0;i<4;i++) pack(u(2)-.27+i*.13,L1); tinRow(2,L2); tinRow(2,L3); jar1(u(2)-.2,L4,celadon,1); tin(u(2)+.05,L4); tin(u(2)+.2,L4);
  tinRow(3,L0); woodBox(u(3)-.12,L1); tin(u(3)+.2,L1); tin(u(3)+.33,L1);
  bigPot(u(4)-.12,L0,1.25,clay2); tin(u(4)+.22,L0); tin(u(4)+.34,L0); tinRow(4,L1);
  for(let i=0;i<3;i++) pack(u(5)-.25+i*.13,L0); tin(u(5)+.22,L0); tinRow(5,L1);
  kettle(u(7)-.15,L0,true); tin(u(7)+.15,L0); tin(u(7)+.28,L0); jar1(u(7)-.15,L1,whitePorcelain,.9); jar1(u(7)+.15,L1,clay2,.95); tinRow(7,L2); tinRow(7,L3); tinRow(7,L4);
  bigPot(u(8)-.12,L0,1.1,clay2); tin(u(8)+.22,L0); tin(u(8)+.34,L0); tinRow(8,L1); books(u(8)-.15,L2,2); tin(u(8)+.15,L2); tin(u(8)+.28,L2); cups(u(8)-.2,L3,3); pot(u(8)+.05,L3,clay2); tin(u(8)+.27,L3); tinRow(8,L4);
  // pu-erh
  { const bamboo=new THREE.MeshStandardMaterial({color:0xb89a62,roughness:.9}), cord=new THREE.MeshStandardMaterial({color:0x7a5a34,roughness:1}), paper=new THREE.MeshStandardMaterial({color:0xece4d0,roughness:.95}); const pick={type:'puer'};
    const tongs=(u,y)=>{ const t=new THREE.Group(); t.position.set(u,y,d/2); G.add(t); const tong=cylinder(.1,.1,.34,bamboo,0,.1,0,t); tong.rotation.z=Math.PI/2; tong.userData=pick; pickables.push(tong); for(const dx of [-.11,0,.11]){ const r=new THREE.Mesh(new THREE.TorusGeometry(.102,.006,6,20),cord); r.position.set(dx,.1,0); r.rotation.y=Math.PI/2; t.add(r); } };
    const cakes=(b,y,n)=>{ for(let i=0;i<n;i++){ const cx=U(b)-bw/2+.13+i*(bw-.26)/(n-1); const cake=cylinder(.1,.1,.025,new THREE.MeshStandardMaterial({color:[0x5a3a22,0x6a4a2a,0x3a2416,0x7a5a34][(i+b)%4],roughness:.95}),cx,y+.11,d/2,G); cake.rotation.x=Math.PI/2-.25; cake.userData=pick; pickables.push(cake);
      const wrap=new THREE.Mesh(new THREE.CircleGeometry(.112,24),paper); wrap.position.set(cx,y+.11,d/2+.015); wrap.rotation.x=-.25; G.add(wrap); } };
    // pu-erh, one bay only (b0)
    tongs(U(0)-.2,L0); tongs(U(0)+.2,L0); cakes(0,L1,4);
    for(let i=0;i<4;i++) box(.16,.04,.22,new THREE.MeshStandardMaterial({color:0x4a3020,roughness:.95}),U(0)-.2,L2+.02+i*.045,d/2,G,pick);
    const jar=lathe([[0,0],[.1,0],[.14,.1],[.14,.22],[.09,.3],[.07,.32]],new THREE.MeshStandardMaterial({color:0x5a4030,roughness:.5}),20); jar.position.set(U(0),L3,d/2); G.add(jar); cakes(0,L4,4); }
  // wash basin on the counter of b6, doors below, a short bronze tap, and a cupboard over it
  { const pick={type:'wash'}, u=U(6); for(const s of [-1,1]){ box(bw/2-.04,H-.16,.02,wood,u+s*bw/4,H/2-.02,d+.008,G,pick); box(.012,.08,.02,bronzeOld,u+s*.06,H-.2,d+.025,G); }
    const stone=new THREE.MeshStandardMaterial({color:0xb8b5ae,roughness:.9}); box(bw-.03,.03,d,stone,u,H+.015,d/2,G,pick);
    const bowl=lathe([[0,0],[.1,0],[.14,.05],[.15,.1],[.145,.11]],new THREE.MeshStandardMaterial({color:0xf2efe8,roughness:.25,side:THREE.DoubleSide}),32); bowl.position.set(u,H+.03,d/2+.02); bowl.userData=pick; G.add(bowl); pickables.push(bowl);
    const tap=new THREE.CatmullRomCurve3([[0,H+.03,.05],[0,H+.2,.05],[0,H+.23,.12],[0,H+.18,d/2]].map(v=>new THREE.Vector3(u+v[0],v[1],v[2]))); G.add(new THREE.Mesh(new THREE.TubeGeometry(tap,16,.011,8,false),bronzeOld));
   }
  // the red-cased painting on the wall above the tank
  { const W=1.25, Hh=W*477/560, y=TOP2+.18+Hh/2; const tex=vrTex('beauty','painting-beauty.jpg',560/477); tex.colorSpace=THREE.SRGBColorSpace; tex.anisotropy=MAXANI;
    const pic=new THREE.Mesh(new THREE.PlaneGeometry(W,Hh),new THREE.MeshStandardMaterial({map:tex,roughness:.7})); pic.position.set(U(4),y,.024); pic.userData={type:'beauty'}; G.add(pic); pickables.push(pic);
    box(W+.06,Hh+.06,.02,new THREE.MeshStandardMaterial({color:0x1a1210,roughness:.4}),U(4),y,.012,G); }
  // rainforest tank in the upper half of b3–b5, beside the basin: glass front, waterfall rockery, lush plants & tillandsia, poison dart frogs, light switch
  { const pick={type:'viv'}, lpick={type:'vivlamp'}, u=U(4), w=3*bw-.05, h=TOP2-H-.03, dd=d-.04, y0=H, cz=d/2;
    const glass=new THREE.MeshStandardMaterial({color:0xe2ecea,roughness:.04,metalness:.1,transparent:true,opacity:.16,depthWrite:false});
    const gh=h-.11;
    const front=new THREE.Mesh(new THREE.PlaneGeometry(w,gh),glass); front.position.set(u,y0+gh/2,d-.01); front.userData=pick; G.add(front); pickables.push(front);
    { const fw=new THREE.MeshStandardMaterial({color:0x3a2416,roughness:.45}); box(w+.04,.035,.03,fw,u,y0+h-.0175,d-.005,G); box(w+.04,.03,.03,fw,u,y0+.09,d-.005,G); for(const s of [-1,1]) box(.03,h,.03,fw,u+s*(w/2+.005),y0+h/2,d-.005,G); }   /* a fine wooden frame round the glass */
    const cork=ctex(512,256,(g,W,Hh)=>{ g.fillStyle='#4a3726'; g.fillRect(0,0,W,Hh); const Rr=rnd(5); for(let i=0;i<900;i++){ g.fillStyle=['#5e4630','#3a2a1c','#6e5438','#2e2016'][i%4]; g.globalAlpha=.5; const x=Rr()*W, y=Rr()*Hh; g.beginPath(); g.ellipse(x,y,2+Rr()*10,1+Rr()*4,Rr()*.6-.3,0,7); g.fill(); } g.globalAlpha=1; });
    const back=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:cork,roughness:1}));   /* cork-bark background */ back.position.set(u,y0+h/2,.03); G.add(back);
    box(w,.08,dd,new THREE.MeshStandardMaterial({color:0x3a2a1c,roughness:1}),u,y0+.04,cz,G,pick);
    const moss=new THREE.MeshStandardMaterial({color:0x4f7a34,roughness:1}); const R=rnd(31); for(let i=0;i<50;i++){ const m=new THREE.Mesh(new THREE.SphereGeometry(.04+R()*.045,8,6),moss); m.scale.y=.4; m.position.set(u+(R()-.5)*(w-.1),y0+.09,cz+(R()-.5)*(dd-.1)); G.add(m); }
    const twig=new THREE.MeshStandardMaterial({color:0x5a4430,roughness:.9}); const br=new THREE.CatmullRomCurve3([[-w/2+.05,.09,.08],[-.6,.36,.18],[-.1,.58,.14],[.45,.44,.12],[w/2-.06,.72,.1]].map(v=>new THREE.Vector3(u+v[0],y0+v[1],v[2]))); G.add(new THREE.Mesh(new THREE.TubeGeometry(br,20,.018,8,false),twig));
    const leaf=new THREE.MeshStandardMaterial({color:0x2f6a3a,roughness:.6,side:THREE.DoubleSide}), leaf2=new THREE.MeshStandardMaterial({color:0x8a3348,roughness:.55,side:THREE.DoubleSide}), leaf3=new THREE.MeshStandardMaterial({color:0x488a38,roughness:.55,side:THREE.DoubleSide});
    for(const [px,pz,m] of [[-1.02,.14,leaf],[-.82,.24,leaf3],[-.55,.26,leaf2],[-.35,.13,leaf],[-.15,.22,leaf3],[.12,.14,leaf],[.3,.24,leaf2],[.52,.12,leaf3],[.88,.26,leaf2],[1.04,.16,leaf]]) for(let i=0;i<8;i++){ const a=i/8*Math.PI*2, l=new THREE.Mesh(new THREE.PlaneGeometry(.048,.17),m); l.position.set(u+px+Math.cos(a)*.03,y0+.16,pz+Math.sin(a)*.03); l.rotation.set(Math.sin(a)*.65,0,-Math.cos(a)*.65); G.add(l); }
    for(let i=0;i<9;i++){ const l=new THREE.Mesh(new THREE.PlaneGeometry(.13,.085),i%2?leaf:leaf3); const p=br.getPoint(.1+i*.095); l.position.copy(p).add(new THREE.Vector3(0,.04,0)); l.rotation.set(-.6,i*1.1,0); G.add(l); }
    { const fern=new THREE.MeshStandardMaterial({color:0x3f7a32,roughness:.6,side:THREE.DoubleSide}); const R2=rnd(77);
      for(const px of [-1.08,-.72,-.38,-.08,.18,.98]) for(let i=0;i<11;i++){ const f=new THREE.Mesh(new THREE.PlaneGeometry(.038,.24),fern); f.geometry.translate(0,.12,0); f.position.set(u+px,y0+.08,.09+R2()*.14); f.rotation.set(-.5-R2()*.5,i/11*Math.PI*2,0); G.add(f); }
      // Tillandsia ionantha (小精靈空氣鳳梨) rosettes: green base blushing red-pink at tips
      const tilG=new THREE.MeshStandardMaterial({color:0x689f48,roughness:.65,side:THREE.DoubleSide}), tilR=new THREE.MeshStandardMaterial({color:0xd84a58,roughness:.55,side:THREE.DoubleSide});
      const tillandsia=(px,py,pz,sc=1,rx=0,rz=0)=>{ const tg=new THREE.Group(); tg.position.set(px,py,pz); tg.rotation.set(rx,R2()*6,rz); tg.scale.setScalar(sc); G.add(tg);
        for(let i=0;i<18;i++){ const a=i/18*Math.PI*2+(R2()-.5)*.2, tier=i<8?0:1, len=(tier?.075:.055)*(.85+R2()*.3), tilt=tier?(.55+R2()*.35):(.22+R2()*.25);
          const lv=new THREE.Mesh(new THREE.ConeGeometry(.007,len,4),tier?tilG:tilR); lv.geometry.translate(0,len/2,0); lv.rotation.set(tilt,a,0); tg.add(lv); } };
      for(const t of [.18,.38,.62,.82]){ const p=br.getPoint(t); tillandsia(p.x,p.y+.012,p.z+.015,1.05,.2,(R2()-.5)*.4); }
      tillandsia(u-.65,y0+.10,.22,1.15,.1,0); tillandsia(u+.05,y0+.10,.20,1.0,.15,0); tillandsia(u+.46,y0+.26,.16,1.1,.3,-.2);
      // trailing vines on the cork background
      for(const px of [-.85,-.45,-.05,.35,.85]){ const vine=new THREE.CatmullRomCurve3([[0,h-.08,.05],[(R2()-.5)*.12,h*.65,.06],[(R2()-.5)*.14,h*.38,.055],[(R2()-.5)*.1,h*.14,.06]].map(v=>new THREE.Vector3(u+px+v[0],y0+v[1],v[2])));
        G.add(new THREE.Mesh(new THREE.TubeGeometry(vine,12,.004,5,false),fern));
        for(let k=1;k<6;k++){ const vp=vine.getPoint(k/6), vl=new THREE.Mesh(new THREE.PlaneGeometry(.035,.05),k%2?leaf:leaf3); vl.position.copy(vp).add(new THREE.Vector3((k%2?.015:-.015),0,.01)); vl.rotation.set(-.3,k,0); G.add(vl); } }
      const hm=new THREE.MeshStandardMaterial({color:0x8a9a5a,roughness:1}); for(let i=0;i<18;i++){ const x=u-w/2+.08+R2()*(w-.16), L=.14+R2()*.28; cylinder(.004,.002,L,hm,x,y0+h-.04-L/2,.06+R2()*.1,G); }   /* hanging moss */
      // rockery waterfall & pool on the right side of the tank
      const rockM1=new THREE.MeshStandardMaterial({color:0x54524c,roughness:.92}), rockM2=new THREE.MeshStandardMaterial({color:0x3f443c,roughness:.88}), rockM3=new THREE.MeshStandardMaterial({color:0x6e6a62,roughness:.85});
      const rock=(px,py,pz,sx,sy,sz,m)=>{ const r=new THREE.Mesh(new THREE.DodecahedronGeometry(1,0),m); r.scale.set(sx,sy,sz); r.position.set(px,py,pz); r.rotation.set(R2()*2,R2()*3,R2()*2); G.add(r); };
      for(const [dx,dy,dz,sx,sy,sz,m] of [
        [.66,.46,.09,.14,.09,.08,rockM1],[.54,.39,.11,.13,.08,.09,rockM2],[.78,.37,.10,.12,.09,.08,rockM3],
        [.46,.26,.14,.14,.09,.10,rockM1],[.65,.27,.12,.15,.10,.09,rockM2],[.84,.24,.14,.13,.09,.09,rockM1],
        [.40,.14,.18,.12,.07,.09,rockM3],[.58,.15,.15,.13,.08,.08,rockM2],[.86,.14,.19,.12,.07,.09,rockM3],
        [-.92,.11,.19,.09,.05,.07,rockM1],[-.76,.10,.25,.07,.04,.06,rockM3],[-.42,.11,.24,.08,.045,.06,rockM2],
        [-.12,.10,.26,.065,.035,.05,rockM1],[.16,.11,.25,.085,.045,.065,rockM3],[.30,.10,.19,.07,.04,.055,rockM2]
      ]) rock(u+dx,y0+dy,dz,sx,sy,sz,m);
      const pool=new THREE.Mesh(new THREE.CircleGeometry(.18,24),new THREE.MeshStandardMaterial({color:0x2b5552,roughness:.05,metalness:.3,transparent:true,opacity:.86})); pool.rotation.x=-Math.PI/2; pool.scale.set(1.65,1,1); pool.position.set(u+.64,y0+.084,.24); G.add(pool);
      for(let i=0;i<10;i++){ const st=new THREE.Mesh(new THREE.DodecahedronGeometry(.024+R2()*.022,0),i%2?rockM1:rockM3); st.scale.y=.5; const a=i/10*Math.PI*2; st.position.set(u+.64+Math.cos(a)*.27,y0+.086,.24+Math.sin(a)*.16); G.add(st); }
      // animated waterfall cascading down the rocks into the pool
      const wfTex=ctex(64,128,(g,W,Hh)=>{ const gr=g.createLinearGradient(0,0,W,0); gr.addColorStop(0,'rgba(180,228,232,0.2)'); gr.addColorStop(0.5,'rgba(235,250,255,0.85)'); gr.addColorStop(1,'rgba(180,228,232,0.2)'); g.fillStyle=gr; g.fillRect(0,0,W,Hh); for(let y=0;y<Hh;y+=12){ g.fillStyle='rgba(255,255,255,0.65)'; g.fillRect(8+((y*7)%24),y,10+((y*3)%14),5); } });
      wfTex.wrapS=wfTex.wrapT=THREE.RepeatWrapping; wfTex.repeat.set(1,2.5);
      const wfCurve=new THREE.CatmullRomCurve3([[.65,.47,.12],[.64,.36,.16],[.65,.23,.19],[.64,.09,.22]].map(v=>new THREE.Vector3(u+v[0],y0+v[1],v[2])));
      const wfMesh=new THREE.Mesh(new THREE.TubeGeometry(wfCurve,18,.034,8,false),new THREE.MeshStandardMaterial({map:wfTex,color:0xdff7ff,transparent:true,opacity:.78,roughness:.06,depthWrite:false})); wfMesh.scale.set(1.4,1,.45); wfMesh.position.x-=u*.4; wfMesh.position.x=0;
      const wfGeo=new THREE.TubeGeometry(wfCurve,18,.032,8,false); wfGeo.translate(-(u+.64),0,0); wfGeo.scale(1.4,1,.42); wfGeo.translate(u+.64,0,0);
      G.remove(wfMesh);
      const waterfall=new THREE.Mesh(wfGeo,new THREE.MeshStandardMaterial({map:wfTex,color:0xe2f8ff,transparent:true,opacity:.8,roughness:.06,depthWrite:false})); G.add(waterfall); ZL_DYN.push(waterfall);
      const wfRing=new THREE.Mesh(new THREE.RingGeometry(.025,.045,20),new THREE.MeshBasicMaterial({color:0xe8fbff,transparent:true,opacity:.65,side:THREE.DoubleSide,depthWrite:false})); wfRing.rotation.x=-Math.PI/2; wfRing.position.set(u+.64,y0+.087,.22); G.add(wfRing); ZL_DYN.push(wfRing);
      ZL_ANIM.push(dt=>{ wfTex.offset.y-=dt*1.8; const k=(wfRing.userData.k=((wfRing.userData.k||0)+dt*1.3)%1); wfRing.scale.setScalar(1+k*2.4); wfRing.material.opacity=.65*(1-k); });
      const epi=new THREE.MeshStandardMaterial({color:0xd85a7a,roughness:.5}); for(const t of [.3,.55,.8]){ const p=br.getPoint(t); const e=new THREE.Mesh(new THREE.SphereGeometry(.018,8,6),epi); e.position.copy(p).add(new THREE.Vector3(0,.035,.02)); G.add(e); } }
    // poison dart frogs (箭毒蛙): glossy spotted/vivid skins like Oophaga pumilio & Dendrobates
    const dartTex=(bg,sp,sp2)=>{ const c=ctex(128,64,(g,W,Hh)=>{ g.fillStyle=bg; g.fillRect(0,0,W,Hh); if(sp){ const Rs=rnd(bg.charCodeAt(1)+13); g.fillStyle=sp; for(let i=0;i<26;i++){ g.beginPath(); g.ellipse(Rs()*W,Rs()*Hh,3+Rs()*5,2+Rs()*4,Rs()*3,0,7); g.fill(); } } if(sp2){ g.fillStyle=sp2; g.fillRect(0,Hh*.55,W,Hh*.45); } }); return c; };
    const dartMats=[
      [new THREE.MeshStandardMaterial({map:dartTex('#d92418','#181210'),roughness:.18,metalness:.05}), new THREE.MeshStandardMaterial({color:0x2b3668,roughness:.22})], // strawberry red-black spots + blue-jeans legs
      [new THREE.MeshStandardMaterial({map:dartTex('#f06414','#141210'),roughness:.18,metalness:.05}), new THREE.MeshStandardMaterial({map:dartTex('#e85a10','#141210'),roughness:.22})], // orange & black spots
      [new THREE.MeshStandardMaterial({map:dartTex('#e0c422','#1a1816'),roughness:.18,metalness:.05}), new THREE.MeshStandardMaterial({map:dartTex('#38302a','#d4b820'),roughness:.22})], // yellow & black bumblebee
      [new THREE.MeshStandardMaterial({map:dartTex('#3b62c4','#18264a'),roughness:.18,metalness:.05}), new THREE.MeshStandardMaterial({color:0x2e4ea8,roughness:.22})], // cobalt blue
      [new THREE.MeshStandardMaterial({map:dartTex('#94b824','#2c261c'),roughness:.18,metalness:.05}), new THREE.MeshStandardMaterial({color:0x7a9630,roughness:.22})]  // lime-olive spotted
    ];
    const eyeM=new THREE.MeshStandardMaterial({color:0x0c0c0e,roughness:.08,metalness:.2});
    const frogs=[]; const spots=[]; for(let t=.08;t<.95;t+=.12){ const p=br.getPoint(t); spots.push(new THREE.Vector3(p.x,p.y+.03,p.z)); }
    for(let i=0;i<8;i++) spots.push(new THREE.Vector3(u+(i/7-.5)*(w-.15),y0+.11,.14+(i%3)*.08)); spots.push(new THREE.Vector3(u+.36,y0+.11,.22),new THREE.Vector3(u+.88,y0+.11,.3));
    const frog=(p,ry,mi)=>{ const [bm,lm]=dartMats[mi%dartMats.length]; const f=new THREE.Group(); f.position.copy(p); f.rotation.y=ry; G.add(f); ZL_DYN.push(f);
      const b=new THREE.Mesh(new THREE.SphereGeometry(.026,14,10),bm); b.scale.set(1.0,.72,1.35); b.rotation.x=-.22; b.position.y=.006; b.userData=pick; f.add(b); pickables.push(b);
      const head=new THREE.Mesh(new THREE.SphereGeometry(.016,12,8),bm); head.scale.set(1.0,.78,1.2); head.position.set(0,.014,.024); f.add(head);
      for(const s of [-1,1]){ const e=new THREE.Mesh(new THREE.SphereGeometry(.0075,8,6),eyeM); e.position.set(s*.012,.020,.028); f.add(e);
        const hlg=new THREE.Mesh(new THREE.SphereGeometry(.011,8,6),lm); hlg.scale.set(.7,.65,1.65); hlg.position.set(s*.022,-.004,-.014); hlg.rotation.y=s*.35; f.add(hlg);
        const flg=new THREE.Mesh(new THREE.CylinderGeometry(.004,.003,.024,6),lm); flg.position.set(s*.017,-.004,.018); flg.rotation.set(.25,0,-s*.2); f.add(flg); }
      const throat=new THREE.Mesh(new THREE.SphereGeometry(.011,8,6),bm); throat.position.set(0,.002,.022); f.add(throat);
      frogs.push({f,throat,from:p.clone(),to:p.clone(),t:1,wait:1+Math.random()*5,ph:Math.random()*6}); };
    frog(spots[2],.4,0); frog(spots[5],-.3,1); frog(spots[9],.7,2); frog(spots[12],-.5,3); frog(spots[15],.2,4);
    ZL_ANIM.push(dt=>{ for(const F of frogs){ F.ph+=dt; F.throat.scale.setScalar(1+.35*Math.max(0,Math.sin(F.ph*7))*(F.t>=1?1:0));
      if(F.t<1){ F.t=Math.min(1,F.t+dt/.45); const k=F.t; F.f.position.lerpVectors(F.from,F.to,k); F.f.position.y+=Math.sin(k*Math.PI)*.07; }
      else if((F.wait-=dt)<=0){ const to=spots[Math.floor(Math.random()*spots.length)]; if(frogs.some(o=>o!==F&&o.to.distanceTo(to)<.06)){ F.wait=.5; continue; }
        F.from.copy(F.f.position); F.to.copy(to); F.t=0; F.wait=2+Math.random()*7; F.f.rotation.y=Math.atan2(to.x-F.from.x,to.z-F.from.z); } } });
    const lampM=new THREE.MeshStandardMaterial({color:0x9aa094,emissive:0xd8f4dc,emissiveIntensity:0}); const bar=box(w-.1,.025,.06,lampM,u,y0+h-.03,cz,G,lpick); box(w-.06,.012,.1,new THREE.MeshStandardMaterial({color:0x2a2016,roughness:.5}),u,y0+h-.012,cz,G,lpick);
    // large invisible hitbox over the entire top light zone so aiming anywhere at the light bar selects it easily
    const lampHit=new THREE.Mesh(new THREE.BoxGeometry(w,.16,d),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false})); lampHit.position.set(u,y0+h-.06,cz); lampHit.userData=lpick; G.add(lampHit); pickables.push(lampHit);
    // physical toggle switch mounted on the right wooden pillar beside the tank, with large clickable area
    { const sx=u+w/2+.045, sy=y0+h*.52, sz=d+.012;
      box(.055,.09,.014,bronzeOld,sx,sy,sz,G,lpick);
      const swLed=new THREE.Mesh(new THREE.SphereGeometry(.006,8,6),new THREE.MeshStandardMaterial({color:0x334433,emissive:0x66ff88,emissiveIntensity:0})); swLed.position.set(sx,sy+.026,sz+.008); G.add(swLed);
      const swLever=new THREE.Group(); swLever.position.set(sx,sy-.006,sz+.008); G.add(swLever);
      cylinder(.004,.005,.028,bronzeOld,0,.01,.008,swLever).rotation.x=Math.PI/4;
      const swHit=new THREE.Mesh(new THREE.BoxGeometry(.14,.18,.08),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false})); swHit.position.set(sx,sy,sz+.02); swHit.userData=lpick; G.add(swHit); pickables.push(swHit);
      VIV.swLever=swLever; VIV.swLed=swLed.material; }
    VIV.lights=[];
    for(const dx of [-w*0.32,0,w*0.32]){
      const vl=new THREE.SpotLight(0xeaffec,0,h+0.9,Math.PI*0.34,0.55,1.0);
      vl.position.set(u+dx,y0+h-.045,cz);
      vl.target.position.set(u+dx,y0,cz);
      G.add(vl,vl.target);
      const f={light:vl,power:7.5,keepColor:true,ownLevel:true,on:false};
      fixtures.push(f);
      VIV.lights.push(f);
    }
    VIV.mat=lampM;
    // the light falls downward inside the glass: plants and frogs below the tube take a soft cool glow when it is on
    VIV.glow=[]; G.updateMatrixWorld(true); G.traverse(o=>{ if(!o.isMesh||!o.material||o.material===lampM||o.material===glass) return; const p=o.getWorldPosition(new THREE.Vector3()); if(Math.abs(p.z-(ZP.front+ZP.back)/2)<w/2+.02&&p.y>y0&&p.y<y0+h-.04&&p.x<ZP.right+d-.03){ const m=o.material; if(m.emissive&&!VIV.glow.includes(m)){ m.emissive.setHex(0x9ad8a8); m.emissiveIntensity=0; VIV.glow.push(m); } } }); }
}
// pleated floor lamps by the two tables (no hanging lamps)
const FLOOR_LAMPS=[];
function pleatFloorLamp(x,z){ const b=new THREE.Mesh(new THREE.SphereGeometry(.16,24,10,0,Math.PI*2,0,Math.PI/2),new THREE.MeshStandardMaterial({color:0x1c1b1a,roughness:.45,metalness:.2})); b.scale.y=.5; b.position.set(x,0,z); scene.add(b);
  cylinder(.012,.012,1.35,b.material,x,.7,z);
  const glow=new THREE.MeshStandardMaterial({color:0xf6f1e6,roughness:.9,side:THREE.DoubleSide,emissive:0xffd9a8,emissiveIntensity:.7});
  const light=new THREE.PointLight(0xffe2bc,0,3.6,1.65); light.position.set(x,1.25,z); scene.add(light); const fx={light,power:3,on:false}; fixtures.push(fx); LAMPS.push({f:fx,mat:glow});   /* switched by hand */
  const i=FLOOR_LAMPS.length, pick={type:'floorlamp',i}; FLOOR_LAMPS.push({fx,key:'FL'+i});
  const sh=pleatedShade(.09,.26,.3,glow); sh.position.set(x,1.45,z); scene.add(sh); sh.traverse(o=>{ if(o.isMesh){ o.userData=pick; pickables.push(o); } }); OB(x-.2,x+.2,z-.2,z+.2); }
pleatFloorLamp(-6.62,22.78);
const FISH=[];
const fireplace={on:false,light:null,flames:[],glow:null};

// a plain old enamel pendant over the gongfu table: white bell shade, brass cap, cloth cord
{ const x=ZP.gf.cx, z=ZP.gf.cz, y=1.55, top=3.4; const cordM=new THREE.MeshStandardMaterial({color:0x2a2420,roughness:.9}), brass=new THREE.MeshStandardMaterial({color:0xa8854a,metalness:.7,roughness:.35});
  cylinder(.006,.006,top-y-.12,cordM,x,(top+y+.12)/2,z); cylinder(.035,.035,.02,brass,x,top,z);
  cylinder(.022,.03,.08,brass,x,y+.1,z);
  const outer=lathe([[.03,.06],[.07,.04],[.15,-.02],[.2,-.08],[.21,-.09]],new THREE.MeshStandardMaterial({color:0xf0ece2,roughness:.35,side:THREE.DoubleSide}),32); outer.position.set(x,y,z); scene.add(outer);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(.21,.006,6,32),new THREE.MeshStandardMaterial({color:0x1e2a3a,roughness:.4})); rim.rotation.x=Math.PI/2; rim.position.set(x,y-.09,z); scene.add(rim);
  const glow=new THREE.MeshStandardMaterial({color:0xfff4e0,emissive:0xffd9a0,emissiveIntensity:1.2}); LAMPS.push({f:{on:true},mat:glow});
  const bulb=new THREE.Mesh(new THREE.SphereGeometry(.035,12,8),glow); bulb.position.set(x,y-.04,z); scene.add(bulb);
  softLight(x,y-.15,z,4,3.6); }
// an ikebana in a tall white porcelain vase on the low cabinet, on the other side of the window from the painting
{ const x=-6.33, z=ZP.front+.2, y=.9, pick={type:'ikebana2'};
  const vase=lathe([[0,0],[.06,0],[.075,.04],[.08,.16],[.06,.26],[.035,.32],[.03,.36],[.045,.39]],new THREE.MeshStandardMaterial({color:0xf6f3ec,roughness:.12}),32); vase.position.set(x,y,z); vase.userData=pick; scene.add(vase); pickables.push(vase);
  const twig=new THREE.MeshStandardMaterial({color:0x3b2a1c,roughness:1}), leafM=new THREE.MeshStandardMaterial({color:0x2f5a2c,roughness:.6,side:THREE.DoubleSide}), petal=new THREE.MeshStandardMaterial({color:0xc8283a,roughness:.55}), petal2=new THREE.MeshStandardMaterial({color:0xf2ece0,roughness:.6}), stamen=new THREE.MeshStandardMaterial({color:0xe8c040}); const R=rnd(41);
  // 真・副・控: a tall branch, a second leaning out, a short one low; camellias on them
  for(const [pts,n,pm] of [[[[0,.38,0],[.03,.6,0],[.02,.85,.02],[.08,1.05,0]],3,petal],[[[0,.38,0],[-.1,.52,.04],[-.22,.62,.06],[-.3,.66,.05]],2,petal2],[[[0,.38,0],[.1,.44,.05],[.18,.46,.08]],1,petal]]){
    const c=new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(x+p[0],y+p[1],z+p[2]))); scene.add(new THREE.Mesh(new THREE.TubeGeometry(c,16,.006,6,false),twig));
    for(let i=0;i<6;i++){ const p=c.getPoint(.3+i*.12); const l=new THREE.Mesh(new THREE.SphereGeometry(.026,8,6),leafM); l.scale.set(1.7,.25,.8); l.position.copy(p).add(new THREE.Vector3((R()-.5)*.04,0,(R()-.5)*.04)); l.rotation.y=R()*6; scene.add(l); }
    for(let k=0;k<n;k++){ const fl=c.getPoint(1-k*.3); for(let i=0;i<6;i++){ const pt=new THREE.Mesh(new THREE.SphereGeometry(.024,8,6),pm); pt.scale.set(1,.45,.8); const a=i/6*Math.PI*2; pt.position.set(fl.x+Math.cos(a)*.02,fl.y,fl.z+Math.sin(a)*.02); scene.add(pt); } const st=new THREE.Mesh(new THREE.SphereGeometry(.01,6,4),stamen); st.position.copy(fl).add(new THREE.Vector3(0,.008,0)); scene.add(st); } } }
/* ---------- right-back: contemporary tea table with three seats ---------- */
const MODERN_SEATS=[];
var MD_FX={cups:[],cupG:[],pitcher:null,flame:[],steam:[]};   /* the contemporary table's moving parts: tea in the cups and pitcher, the burner flame, kettle steam */
{ const MT=ZP.modern, x0=MT.cx-MT.w/2, x1=MT.cx+MT.w/2, z0=MT.cz-MT.d/2, z1=MT.cz+MT.d/2, W=MT.w, D=MT.d, cx=MT.cx, cz=MT.cz, h=MT.h; const pick={type:'modern'};
  /* a single solid walnut slab on two slab legs */
  box(W,.06,D,WD_WAL.H,cx,h-.03,cz,scene,BLOCK);
  for(const sx of [-1,1]) box(.07,h-.06,D-.2,WD_WAL.V,cx+sx*(W/2-.25),(h-.06)/2,cz,scene,BLOCK);
  box(W-.5,.05,.05,WD_WAL.H,cx,.2,cz);
  OB(x0,x1,z0,z1);
  // the host's full set, laid out in front of the host (screen side, facing the window; host's right is +x):
  //   茶巾 · 茶荷 | 壺承 with a 紫泥 standard pot | 公道杯 | 提梁壺 on a spirit burner; 茶筒 with 茶則 and 茶針 at the
  //   host's left, 水盂 to the right; a cup on a wooden 杯托 for the host and for each of the three guests
  box(W*.55,.004,.3,new THREE.MeshStandardMaterial({color:0x8a8070,roughness:1}),cx,h+.002,cz+.12);
  const T=h+.004, HZ=cz+.13, zn=new THREE.MeshStandardMaterial({color:0x5c3527,roughness:.62}), stone=new THREE.MeshStandardMaterial({color:0x4a4640,roughness:.75}), brass=new THREE.MeshStandardMaterial({color:0xa88a4e,metalness:.7,roughness:.35});
  const glassM=new THREE.MeshStandardMaterial({color:0xe8f0ee,roughness:.05,metalness:.1,transparent:true,opacity:.35,depthWrite:false,side:THREE.DoubleSide});
  const bamboo=new THREE.MeshStandardMaterial({color:0xb79a62,roughness:.6}), walnut=new THREE.MeshStandardMaterial({color:0x4a3020,roughness:.5});
  const rest=lathe([[0,0],[.1,0],[.112,.01],[.105,.016],[.112,.022]],stone,36); rest.position.set(cx,T,HZ); rest.userData=pick; scene.add(rest); pickables.push(rest);
  stdPot(scene,cx,T+.018,HZ,.05,zn,Math.PI,pick);   // spout toward the host's left, handle to the right hand
  // 公道杯: glass pitcher with a pinched lip and its tea
  { const gx=cx+.22, gz=HZ+.02; const gp=lathe([[0,0],[.032,0],[.036,.01],[.036,.085],[.04,.092]],glassM,24); gp.position.set(gx,T,gz); scene.add(gp);
    const tea=new THREE.Mesh(new THREE.CylinderGeometry(.034,.032,.045,20),new THREE.MeshStandardMaterial({color:0xc8862c,roughness:.1,transparent:true,opacity:.8})); tea.position.set(gx,T+.025,gz); scene.add(tea); tea.visible=false; MD_FX.pitcher=tea; ZL_DYN.push(tea);
    const lip=new THREE.Mesh(new THREE.ConeGeometry(.012,.02,8),glassM); lip.rotation.z=Math.PI/2; lip.position.set(gx-.045,T+.088,gz); scene.add(lip); }
  // spirit burner under a three-legged brass trivet, and the clay 提梁壺 (boiling kettle) with its arched cane handle
  { const bx=cx+.5, bz=HZ-.02;
    const bur=lathe([[0,0],[.045,0],[.05,.01],[.05,.05],[.03,.06],[.012,.064]],glassM,24); bur.position.set(bx,T,bz); scene.add(bur);
    const fuel=new THREE.Mesh(new THREE.CylinderGeometry(.046,.046,.03,20),new THREE.MeshStandardMaterial({color:0x9fc4d8,transparent:true,opacity:.45,roughness:.1})); fuel.position.set(bx,T+.016,bz); scene.add(fuel);
    cylinder(.01,.012,.018,brass,bx,T+.072,bz);
    const flame=new THREE.Mesh(new THREE.ConeGeometry(.012,.05,10),new THREE.MeshBasicMaterial({color:0x9fb8ff,transparent:true,opacity:.55,depthWrite:false})); flame.position.set(bx,T+.106,bz); scene.add(flame);
    const core=new THREE.Mesh(new THREE.ConeGeometry(.006,.026,8),new THREE.MeshBasicMaterial({color:0xffc070,transparent:true,opacity:.8,depthWrite:false})); core.position.set(bx,T+.095,bz); scene.add(core); ZL_DYN.push(flame,core); flame.visible=core.visible=false; MD_FX.flame=[flame,core];
    const ktRy=Math.atan2(-(HZ-bz),cx-bx);
    for(let i=0;i<5;i++){ const sp=new THREE.Sprite(steamMatBase.clone()); sp.material.opacity=0; scene.add(sp); ZL_DYN.push(sp); MD_FX.steam.push({sp,t:i/5}); } MD_FX.spout=new THREE.Vector3(bx+0.13*Math.cos(ktRy),T+.27,bz-0.13*Math.sin(ktRy));
    ZL_ANIM.push(()=>{ const t=performance.now()/1000, k=1+.08*Math.sin(t*13)+.05*Math.sin(t*29); flame.scale.set(1,k,1); core.scale.set(1,k*1.05,1); });
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.07,.005,6,32),brass); ring.rotation.x=Math.PI/2; ring.position.set(bx,T+.15,bz); scene.add(ring);
    for(let i=0;i<3;i++){ const a=i/3*Math.PI*2, lx=Math.cos(a)*.075, lz=Math.sin(a)*.075; const lg=cylinder(.004,.004,.15,brass,bx+lx,T+.075,bz+lz); }
    const kt=new THREE.Group(); kt.position.set(bx,T+.152,bz); kt.rotation.y=ktRy; scene.add(kt); const km=new THREE.MeshStandardMaterial({color:0x3b2f27,roughness:.55});
    const kb=lathe([[0,0],[.05,0],[.075,.025],[.085,.06],[.078,.095],[.055,.118],[.04,.122],[.04,.128]],km,32); kb.userData=pick; kt.add(kb); pickables.push(kb);
    kt.add(lathe([[.045,.125],[.03,.135],[0,.14]],km,24)); const kn=new THREE.Mesh(new THREE.SphereGeometry(.009,10,8),km); kn.position.y=.146; kt.add(kn);
    { const a0=new THREE.Vector3(.07,.05,0), a1=new THREE.Vector3(.13,.115,0); const sp=new THREE.Mesh(new THREE.CylinderGeometry(.007,.013,1,10),km); sp.position.copy(a0).add(a1).multiplyScalar(.5); sp.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),a1.clone().sub(a0).normalize()); sp.scale.y=a1.distanceTo(a0); kt.add(sp); }
    for(const sx of [-1,1]){
      const lug=new THREE.Mesh(new THREE.TorusGeometry(.010,.0032,8,14),brass); lug.position.set(sx*.058,.116,0); kt.add(lug);
      cylinder(.006,.006,.016,brass,sx*.058,.124,0,kt);
    }
    const arch=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[-.058,.122,0],[-.062,.175,0],[-.022,.225,0],[.022,.225,0],[.062,.175,0],[.058,.122,0]].map(p=>new THREE.Vector3(...p))),24,.0045,6),bamboo); arch.userData=pick; kt.add(arch); pickables.push(arch); }
  // 茶筒 with 茶則 and 茶針; 茶荷 and 茶巾 on the left of the pot; 水盂 to the right
  { const tx=cx-.5, tz=HZ+.12; const tube=lathe([[0,0],[.028,0],[.028,.11],[.024,.11],[.024,.006],[0,.006]],walnut,20); tube.position.set(tx,T,tz); tube.userData=pick; scene.add(tube); pickables.push(tube);
    const ze=box(.024,.12,.004,bamboo,tx-.008,T+.1,tz); ze.rotation.z=.12; const zh=cylinder(.002,.002,.15,brass,tx+.01,T+.11,tz+.006); zh.rotation.z=-.1; const zt=new THREE.Mesh(new THREE.SphereGeometry(.006,8,6),walnut); zt.position.set(tx+.017,T+.185,tz+.006); scene.add(zt); }
  { const hx=cx-.27, hz=HZ-.04; const he=lathe([[0,0],[.022,0],[.04,.012],[.042,.016]],whitePorcelain,24); he.scale.z=.6; he.position.set(hx,T,hz); scene.add(he);
    const lv=new THREE.Mesh(new THREE.CircleGeometry(.022,12),new THREE.MeshStandardMaterial({color:0x3e4a2a,roughness:1})); lv.rotation.x=-Math.PI/2; lv.scale.y=.6; lv.position.set(hx,T+.01,hz); scene.add(lv); }
  box(.14,.014,.09,new THREE.MeshStandardMaterial({color:0xb9aa8c,roughness:1}),cx-.27,T+.007,HZ+.17); box(.14,.004,.003,new THREE.MeshStandardMaterial({color:0x9c8d70,roughness:1}),cx-.27,T+.016,HZ+.17);
  { const wy=lathe([[0,0],[.045,0],[.065,.03],[.07,.06],[.062,.065],[.06,.062]],stone,28); wy.position.set(cx+.3,T,HZ-.15); scene.add(wy); }
  // cups: host's at the right of the pot, guests' in front of each cushion
  for(const [dx,dz] of [[.17,.3],[-.66,-.28],[0,-.28],[.66,-.28]]){ const x=cx+dx, z=cz+dz;
    const tuo=lathe([[0,0],[.038,0],[.042,.008],[.04,.01]],walnut,24); tuo.position.set(x,T,z); scene.add(tuo);
    const cg=new THREE.Group(); cg.position.set(x,T+.01,z); scene.add(cg); cg.add(lathe([[0,0],[.014,0],[.016,.004],[.013,.006],[.026,.03],[.03,.04],[.0305,.042]],whitePorcelain,22));
    const tea=new THREE.Mesh(new THREE.CircleGeometry(.026,18),new THREE.MeshStandardMaterial({color:0xb87a2a,roughness:.15})); tea.rotation.x=-Math.PI/2; tea.position.y=.032; cg.add(tea); tea.visible=false; cg.userData.tea=tea; MD_FX.cups.push(tea); MD_FX.cupG.push(cg); ZL_DYN.push(cg); }
  // seats: long benches with linen cushions, three guests on the window side facing the host, the host alone on the
  //        screen side, sitting square to the window
  { const bench=(z,L)=>{ const bh=.4, bd=.36; box(L,.05,bd,WD_WAL.H,cx,bh-.025,z,scene); for(const sx of [-1,1]) box(.05,bh-.05,bd-.04,WD_WAL.V,cx+sx*(L/2-.12),(bh-.05)/2,z); box(L-.3,.04,.04,WD_WAL.H,cx,.12,z); OB(cx-L/2,cx+L/2,z-bd/2,z+bd/2); };
    const cushM=new THREE.MeshStandardMaterial({color:0xcfc2a4,roughness:1}), pipe=new THREE.MeshStandardMaterial({color:0x6b5d48,roughness:1});
    bench(z0-.32,Math.min(W-.2,2.1)); bench(z1+.32,.8);
    [[-.66,z0-.32,2],[0,z0-.32,2],[.66,z0-.32,2],[0,z1+.32,0]].forEach(([dx,z,f])=>{ const x=cx+dx, yaw=faceYaw(f); const si=addSeat(x,z,yaw,'modern','當代茶席'); MODERN_SEATS.push(si); const tag={type:'seat',si};
      const c=new THREE.Mesh(new THREE.BoxGeometry(.5,.05,.33),cushM); c.position.set(x,.425,z); c.userData=tag; scene.add(c); pickables.push(c);
      for(const sx of [-1,1]) box(.012,.012,.3,pipe,x+sx*.235,.432,z); }); }
  // a linear pendant over the table
  const pend=new THREE.Group(); pend.position.set(cx,1.75,cz); scene.add(pend);
  const glow=new THREE.MeshStandardMaterial({color:0xf3ead6,emissive:0xffcf96,emissiveIntensity:.7,roughness:.9}); LAMPS.push({f:{on:true},mat:glow});
  box(1.7,.05,.08,darkWood,0,0,0,pend); box(1.64,.012,.06,glow,0,-.03,0,pend); for(const sx of [-.72,.72]) cylinder(.003,.003,1.6,M.ink,sx,.8,0,pend);
  softLight(cx,1.65,cz,3.2,3.4); }


/* ---------- right-front: Chaozhou gongfu tea, small square table, four backless stools ---------- */
const GX=ZP.gf.cx, GZ=ZP.gf.cz, GH=ZP.gf.h, GW=ZP.gf.w;
const GF_SEATS=[], GF_CUPS=[];
{ const g=furn(GX,GZ,0); const pick=BLOCK, hw=GW/2;
  box(GW,.04,GW,WD_HHL.H,0,GH-.02,0,g,pick); box(GW-.04,.03,GW-.04,WD_HHD.H,0,GH-.055,0,g); box(GW-.08,.05,GW-.08,WD_HHL.H,0,GH-.095,0,g);
  for(const sx of [-1,1]) for(const sz of [-1,1]){ box(.05,GH-.04,.05,WD_HHL.V,sx*(hw-.04),(GH-.04)/2,sz*(hw-.04),g); box(.06,.04,.06,WD_HHL.V,sx*(hw-.035),.02,sz*(hw-.035),g); }
  for(const s of [-1,1]){ box(GW-.12,.025,.025,WD_HHD.H,0,.13,s*(hw-.04),g); box(.025,.025,GW-.12,WD_HHD.H,s*(hw-.04),.13,0,g); }
  OB(GX-hw,GX+hw,GZ-hw,GZ+hw);
  const o=ZP.gf.stool;   // host on the corridor side, facing the window side
  [[o,0,1,'茶席・主位'],[0,o,0,'茶席・客位'],[-o,0,-1,'茶席・客位'],[0,-o,2,'茶席・客位']].forEach(([dx,dz,f,name])=>{ const x=GX+dx, z=GZ+dz, yaw=faceYaw(f); const si=addSeat(x,z,yaw,'gongfu',name); GF_SEATS.push(si); const sg=furn(x,z,yaw); const tag={type:'seat',si}; const sh=ZP.stoolH;
    box(.36,.035,.36,WD_HHL.H,0,sh-.015,0,sg,tag); box(.33,.01,.33,WD_HHL.H,0,sh+.005,0,sg,tag);   /* solid board seat */
    for(const sx of [-1,1]) for(const sz of [-1,1]) box(.035,sh-.03,.035,WD_HHL.V,sx*.155,(sh-.03)/2,sz*.155,sg,tag);
    for(const s of [-1,1]){ box(.3,.02,.02,WD_HHD.H,0,.1,s*.155,sg); box(.02,.02,.3,WD_HHD.H,s*.155,.1,0,sg); }
    const cup=ruochen(scene,GX+dx*.36,GH+.002,GZ+dz*.36); cup.visible=false; GF_CUPS.push(cup); }); }
// the standard Yixing pot (標準壺, the 水平 form exported in the 1970s): squat round body broadest at the middle, a pressed
// lid with a pearl knob, a short straight spout and a round ear handle, spout tip, rim and handle top all level.
// Built at unit size (body radius 1) and scaled; spout toward local +x.
function stdPot(parent,x,y,z,R,mat,ry=0,pick=null){ const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=ry; g.scale.setScalar(R); parent.add(g);
  const body=lathe([[0,0],[.6,0],[.64,.025],[.62,.05],[.8,.1],[.94,.24],[1,.42],[.97,.58],[.86,.73],[.7,.84],[.6,.88],[.6,.92],[.63,.93]],mat,32); g.add(body);
  const lid=lathe([[.66,.925],[.64,.96],[.5,1.0],[.3,1.03],[.14,1.045],[0,1.05]],mat,32); g.add(lid);
  const knob=new THREE.Mesh(new THREE.SphereGeometry(.12,14,10),mat); knob.scale.y=.85; knob.position.y=1.13; g.add(knob);
  const sp=new THREE.Mesh(new THREE.CylinderGeometry(.075,.15,.75,14),mat); const a0=new THREE.Vector3(.86,.36,0), a1=new THREE.Vector3(1.42,.93,0);
  sp.position.copy(a0).add(a1).multiplyScalar(.5); sp.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),a1.clone().sub(a0).normalize()); sp.scale.y=a1.distanceTo(a0)/.75; g.add(sp);
  const ear=new THREE.Mesh(new THREE.TorusGeometry(.3,.075,10,28,Math.PI*1.55),mat); ear.position.set(-1.22,.55,0); ear.rotation.z=Math.PI*.225; g.add(ear);
  if(pick){ for(const m of [body,lid,sp,ear]){ m.userData=pick; pickables.push(m); } }
  return g; }
const zini=new THREE.MeshStandardMaterial({color:0x5c3527,roughness:.62}), pewterGF=new THREE.MeshStandardMaterial({color:0xa9a69c,metalness:.75,roughness:.32});
// on the table (Fujian gongfu): the 朱泥 pot in a small pewter 壺承, four cups on a round pewter 茶船, a folded 茶巾 and the 茶則
var GF_FAN=null;
const PINZI=[];
{ const g=furn(GX,GZ,0); g.position.y=GH+.002; const pick={type:'gongfu'};
  const boat=lathe([[0,0],[.1,0],[.105,.006],[.098,.012],[.1,.022],[.112,.03],[.116,.032]],pewterGF,40); boat.position.set(-.04,0,0); boat.userData=pick; g.add(boat); pickables.push(boat);
  const grid=new THREE.Mesh(new THREE.CircleGeometry(.098,40),new THREE.MeshStandardMaterial({color:0x8e8b82,metalness:.7,roughness:.4})); grid.rotation.x=-Math.PI/2; grid.position.set(-.04,.013,0); g.add(grid);
  for(let i=0;i<4;i++){ const a=i/4*Math.PI*2+Math.PI/4; PINZI.push(ruochen(g,-.04+Math.cos(a)*.052,.014,Math.sin(a)*.052)); }
  const saucer=lathe([[0,0],[.065,0],[.07,.008],[.064,.014],[.072,.022],[.075,.024]],pewterGF,32); saucer.position.set(.17,0,-.02); g.add(saucer);
  stdPot(g,.17,.012,-.02,.04,zhuni,Math.PI,pick);   // spout toward the boat
  const linen=new THREE.MeshStandardMaterial({color:0xb9aa8c,roughness:1}), fold=new THREE.MeshStandardMaterial({color:0x9c8d70,roughness:1});
  box(.13,.012,.085,linen,.21,.006,-.2,g); box(.13,.004,.003,fold,.21,.013,-.2,g);
  const scoop=box(.03,.006,.11,new THREE.MeshStandardMaterial({color:0xc9b48a,roughness:.6}),.22,.006,.19,g); scoop.rotation.y=.3; }
// a compact red-clay brazier with the 玉書煨, tucked at the corner between the host's stool and the back stool
const brazier=(()=>{ const x=GX+.72, z=GZ+.72; const g=furn(x,z,Math.PI/2); const pick={type:'gongfu'};
  box(.3,.03,.3,WD_HHL.H,0,.285,0,g,pick); for(const sx of [-1,1]) for(const sz of [-1,1]) box(.03,.27,.03,WD_HHL.V,sx*.13,.135,sz*.13,g);
  const stove=lathe([[0,0],[.09,0],[.095,.04],[.088,.16],[.08,.19],[.066,.195],[.062,.18]],redClay,24); stove.position.y=.302; stove.userData=pick; g.add(stove); pickables.push(stove);
  const mouth=new THREE.Mesh(new THREE.PlaneGeometry(.055,.045),emberGF); mouth.position.set(0,.36,-.094); mouth.rotation.y=Math.PI; g.add(mouth);
  for(let i=0;i<5;i++){ const c=new THREE.Mesh(new THREE.BoxGeometry(.028,.02,.024),emberGF); c.position.set((i%3-1)*.022,.47,(i>2?.018:-.014)); g.add(c); }
  const kettle=new THREE.Group(); kettle.position.y=.49; g.add(kettle); const km=new THREE.MeshStandardMaterial({color:0x7e3622,roughness:.8});
  const kb=lathe([[0,0],[.045,0],[.072,.022],[.077,.04],[.063,.063],[.036,.077],[.032,.08]],km,28); kb.userData=pick; kettle.add(kb); pickables.push(kb);
  kettle.add(lathe([[0,.09],[.009,.09],[.029,.081],[.033,.079]],km,20));
  const ks=new THREE.Mesh(new THREE.CylinderGeometry(.007,.014,.06,8),km); ks.position.set(.085,.055,0); ks.rotation.z=-1.1; kettle.add(ks);
  { const dir=new THREE.Vector3(0,Math.sin(.32),-Math.cos(.32)), L=.11, st=new THREE.Vector3(0,.045,-.07);   /* 砂銚's hollow side grip, square to the spout */
    const kh=new THREE.Mesh(new THREE.CylinderGeometry(.011,.015,L,12,1,true),new THREE.MeshStandardMaterial({color:0x7e3622,roughness:.8,side:THREE.DoubleSide})); kh.position.copy(st).addScaledVector(dir,L/2); kh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir); kettle.add(kh);
    const hole=new THREE.Mesh(new THREE.CircleGeometry(.0105,12),new THREE.MeshBasicMaterial({color:0x1a0c06})); hole.position.copy(st).addScaledVector(dir,L-.001); hole.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),dir); kettle.add(hole); }
  { const piv=new THREE.Group(); piv.position.set(.04,.3,-.13); g.add(piv); GF_FAN=piv;   /* a palm-leaf fan (葵扇) on the stand by the stove: click it to fan the coals */
    const fpick={type:'gffan'}, leafM=new THREE.MeshStandardMaterial({color:0xc2ab72,roughness:.9,side:THREE.DoubleSide}), rimM=new THREE.MeshStandardMaterial({color:0x6e5434,roughness:.8});
    const fg=new THREE.Group(); fg.rotation.set(-1.35,0,.5); piv.add(fg);
    const leaf=new THREE.Mesh(new THREE.CircleGeometry(.1,28),leafM); leaf.scale.set(.95,1.1,1); leaf.position.y=.15; leaf.userData=fpick; fg.add(leaf); pickables.push(leaf);
    const rim=new THREE.Mesh(new THREE.TorusGeometry(.1,.004,6,28),rimM); rim.scale.set(.95,1.1,1); rim.position.y=.15; fg.add(rim);
    const hdl=cylinder(.007,.008,.08,rimM,0,.02,0,fg); hdl.userData=fpick; pickables.push(hdl); ZL_DYN.push(piv); }
  const steam=[]; for(let i=0;i<6;i++){ const s=new THREE.Sprite(steamMatBase.clone()); s.material.opacity=0; g.add(s); steam.push({sp:s,t:i/6}); }
  const light=new THREE.PointLight(0xff7a2a,0,2.0,2); light.position.set(0,.38,-.15); g.add(light);
  OB(x-.16,x+.16,z-.16,z+.16);
  return {steam,light,spout:new THREE.Vector3(.11,.56,0),g}; })();
/* ---------- lighting: each room lit on its own ---------- */
// each room keeps one small fixed set of lights (the pool only ever uses the room you stand in), few and broad
softLight(0,2.35,ZP.back-1.0,3,3);                           // hall: a gentle wash on 玉川煎茶圖 and the couplet
for(const s of [-1,1]) softLight(s*1.55,1.1,ZP.back-.3,1,1.4);   // up-light under each penjing stand
softLight(IRC.x,1.5,IRC.z,4,4.6); softLight(3.15,2.3,19.9,1.6,3);   // washitsu: low over the hearth; the 土間
softLight(6.45,1.9,22.7,1.5,1.8);                            // the tokonoma
softLight(-4.8,2.75,19.8,4.6,7.5);                           // tea room: the slim LED bar along the ceiling, one broad even light
const ZM={
  cabinet:{z:15.6, d:.45, h:.9, doorGap:1.95, leftEnd:6.35},   // front wall: starts clear of the folded door leaves
  luohan:{x0:6.41, z0:15.62, len:2.0, depth:.95, seatH:.45},
  bookshelf:{z0:17.8, z1:19.1, h:1.3, d:.35},
  potCase:{z0:19.2, z1:20.6, h:1.9, d:.36},
  screenH:1.5,
  aquarium:{x:2.9, z:18.3, len:1.2, w:.45, standH:.7, tankH:.55},
  bogu:{x0:1.15, x1:4.15, h:2.0, d:.35},
  puer:{z0:18.75, z1:20.45, h:1.9, d:.4},
  lamp:{x:0, y:3.0, z:19.6, r:.45, h:.75},
};
/* ---------- front wall: a run of low cabinets either side of the door, snacks inside ---------- */
function zlCabinet(xa,xb){ const C=ZM.cabinet, x0=Math.min(xa,xb), x1=Math.max(xa,xb), len=x1-x0, cx=(x0+x1)/2, z=C.z+C.d/2, h=C.h, pick={type:'snack'};
  box(len,h-.03,C.d,M.woodDark,cx,(h-.03)/2,z,scene,BLOCK); box(len+.01,.03,C.d+.02,M.wood,cx,h-.015,z+.005,scene,BLOCK);
  const n=Math.max(1,Math.round(len/.55)), dw=len/n;
  for(let i=0;i<n;i++){ const x=x0+dw*(i+.5); box(dw-.05,h-.16,.012,M.wood,x,(h-.03)/2+.01,z+C.d/2+.006,scene,pick); cylinder(.012,.012,.02,bronze,x+(i%2?-1:1)*(dw/2-.07),.42,z+C.d/2+.016).rotation.x=Math.PI/2; }
  box(len,.06,.01,M.woodDark,cx,.03,z+C.d/2+.005);
  OB(x0,x1,C.z,C.z+C.d); }
zlCabinet(-2.72,ZP.right+ZP.display.d);
/* ---------- the hall's lamp: the same two-tier bronze chandelier with crystal drops as the study's ---------- */
{ const ch=chandelier.clone(true); ch.position.set(0,2.72,19.6); scene.add(ch); ch.traverse(o=>{ if(o.isMesh){ o.userData={type:'chandelier2'}; } }); softLight(0,2.55,19.6,6,8); }

await __yield(0.68);
/* ================= v29: 書院 in the washitsu, 博古架, a dragon spout, a censer, light that has a shape ================= */

// ---- washitsu: a 地袋 along the front wall with a 付書院 desk under the window, earthen walls up to the 長押, a noren at the door
{ const R=JR.rise, z0=ZP.front, d=.45, x0=JR.dama.x1, x1=ZP.left, wx0=4.56, wx1=5.69;
  const sh=new THREE.MeshStandardMaterial({color:0x3a2416,roughness:.38}), fus=new THREE.MeshStandardMaterial({color:0x8fa396,roughness:.92}), snack={type:'snack'};
  const H1=R+.3;
  box(x1-x0,H1,d,sh,(x0+x1)/2,H1/2,z0+d/2,scene,BLOCK);
  const n=Math.round((x1-x0)/.62), dw=(x1-x0)/n;
  for(let i=0;i<n;i++){ const x=x0+dw*(i+.5); box(dw-.04,H1-.1,.005,fus,x,H1/2,z0+d+.003,scene,snack); const pull=new THREE.Mesh(new THREE.CircleGeometry(.018,16),new THREE.MeshStandardMaterial({color:0x2a1a10})); pull.position.set(x+(i%2?-1:1)*(dw/2-.07),H1/2,z0+d+.007); scene.add(pull); }
  box(x1-x0+.01,.03,d+.02,sh,(x0+x1)/2,H1+.015,z0+d/2+.005,scene,BLOCK);
  OB(x0,x1,z0,z0+d);
  // 付書院: a thicker writing board under the window, with an inkstone box, brushes, bound books and a small bronze censer
  const bx=(wx0+wx1)/2, top=H1+.06, shoin={type:'shoin'};
  box(wx1-wx0+.2,.05,d+.08,new THREE.MeshStandardMaterial({color:0x6a4a30,roughness:.4}),bx,H1+.035,z0+(d+.08)/2,scene,shoin);
  box(.26,.05,.18,new THREE.MeshStandardMaterial({color:0x111010,roughness:.2}),bx-.3,top+.025,z0+.24,scene,shoin);
  box(.2,.006,.12,new THREE.MeshStandardMaterial({color:0x2a2a2a,roughness:.5}),bx-.3,top+.053,z0+.24);
  box(.16,.01,.03,sh,bx-.05,top+.06,z0+.32); for(const dx of [-.04,.03]){ const b=cylinder(.006,.006,.22,new THREE.MeshStandardMaterial({color:0xc8a868}),bx-.05+dx,top+.07,z0+.24); b.rotation.x=Math.PI/2-.2; }
  { const cs=[0x2c3e5a,0x2c3e5a,0x6a4a2a]; for(let i=0;i<3;i++) box(.19,.022,.26,new THREE.MeshStandardMaterial({color:cs[i],roughness:.9}),bx+.25,top+.011+i*.024,z0+.25,scene,shoin); }
  const cen=lathe([[0,0],[.035,0],[.05,.03],[.048,.055],[.04,.06]],new THREE.MeshStandardMaterial({color:0x6a5a3a,metalness:.6,roughness:.4}),18); cen.position.set(bx+.52,top,z0+.26); scene.add(cen);
  // earthen (聚樂) walls from the dado up to the 長押, white small wall above
  const tsuchi=new THREE.MeshStandardMaterial({color:0xcdb994,roughness:.97}), y0=.905, nag=R+1.86, hh=nag-y0, ym=(y0+nag)/2;
  box(ZP.left-JR.dama.x0,hh,.025,tsuchi,(ZP.left+JR.dama.x0)/2,ym,ZP.back-.013);
  box(.025,hh,ZP.back-ZP.front,tsuchi,ZP.left-.013,ym,(ZP.back+ZP.front)/2);
  for(const [a,b] of [[JR.dama.x0,wx0],[wx1,ZP.left]]){ box(b-a,hh,.025,tsuchi,(a+b)/2,ym,ZP.front+.013); box(b-a,.09,.04,darkWood,(a+b)/2,nag+.045,ZP.front+.03); }
  // noren on the hall doorway: indigo, three panels, a small white crest with 知了
  const D=ZR.door, nw=(D.z1-D.z0-.06)/3, nh=.72, nx=ZR.wallX-ZR.wallT/2-.05;
  const ncan=document.createElement('canvas'); ncan.width=768; ncan.height=360; const ntex=new THREE.CanvasTexture(ncan); ntex.colorSpace=THREE.SRGBColorSpace;
  const drawNoren=()=>{ const g=ncan.getContext('2d'); g.fillStyle='#1f2f4f'; g.fillRect(0,0,768,360); g.globalAlpha=.12; for(let i=0;i<4000;i++){ g.fillStyle=i%2?'#0e1830':'#3a4a70'; g.fillRect(Math.random()*768,Math.random()*360,2,1); } g.globalAlpha=1;
    g.strokeStyle='#efe8da'; g.lineWidth=7; g.beginPath(); g.arc(384,150,74,0,7); g.stroke(); g.fillStyle='#efe8da'; g.textAlign='center'; g.textBaseline='middle'; g.font='64px Reisho,"Noto Serif TC",serif'; g.fillText('知',384,112); g.fillText('了',384,186); ntex.needsUpdate=true; };
  drawNoren(); if(document.fonts&&document.fonts.load) document.fonts.load('40px Reisho','知了').then(drawNoren).catch(()=>{});
  const nm=[]; for(let i=0;i<3;i++){ const t=ntex.clone(); t.needsUpdate=true; t.repeat.set(1/3,1); t.offset.set(i/3,0); nm.push(new THREE.MeshStandardMaterial({map:t,roughness:.95})); }
  cylinder(.012,.012,D.z1-D.z0+.06,darkWood,nx,D.h-.04,(D.z0+D.z1)/2).rotation.x=Math.PI/2;
  const panels=[]; for(let i=0;i<3;i++){ const g=new THREE.Group(); g.position.set(nx,D.h-.05,D.z0+.03+nw*(i+.5)); g.rotation.y=-Math.PI/2; scene.add(g); ZL_DYN.push(g);
    const piv=new THREE.Group(); g.add(piv);
    const geo=new THREE.PlaneGeometry(nw-.01,nh); geo.translate(0,-nh/2,0);
    const mf=new THREE.Mesh(geo,nm[i]); mf.position.z=.001; piv.add(mf);
    const mb=new THREE.Mesh(geo,nm[2-i]); mb.rotation.y=Math.PI; mb.position.z=-.001; piv.add(mb);
    panels.push({m:piv,ph:i*1.3}); }
  ZL_ANIM.push(dt=>{ const dist=Math.hypot(ME.x-nx,ME.z-(D.z0+D.z1)/2), amp=.03+.3*Math.max(0,1-dist/.9); for(const p of panels){ p.ph+=dt*(1.4+amp*4); p.m.rotation.x=Math.sin(p.ph)*amp; } });
}

// ---- tea room back wall: a six-fold ink-landscape screen across the whole wall, flat against it, raised on its frame legs
{ const xa=-2.72-.02, xb=ZP.right+ZP.display.d+.02, cx=(xa+xb)/2, n=6, gap=.012, pw=(xa-xb-gap*(n-1))/n, fw=.045, fd=.04, lift=.2, ar=2048/948;
  const aw=pw-2*fw, ah=aw*n/ar, H=lift+fw+ah+fw, pick={type:'screen'};
  const tex=vrTex('screen','screen-cinema.jpg',2048/948); tex.colorSpace=THREE.SRGBColorSpace; tex.anisotropy=MAXANI;
  const wood=new THREE.MeshStandardMaterial({color:0x3a2416,roughness:.42}), back=new THREE.MeshStandardMaterial({color:0x4a3626,roughness:.9}), art=new THREE.MeshStandardMaterial({map:tex,color:0xf4ece0,roughness:.85});
  const zb=ZP.back-.004, zc=zb-fd/2;
  for(let i=0;i<n;i++){ const x0=xa-i*(pw+gap), x1=x0-pw, mx=(x0+x1)/2;
    for(const sx of [x0-fw/2,x1+fw/2]){ box(fw,H,fd,wood,sx,H/2,zc,scene,BLOCK); box(fw+.02,.04,.12,wood,sx,.02,zb-.06,scene); }
    box(pw-2*fw,fw,fd,wood,mx,lift+fw/2,zc,scene); box(pw-2*fw,fw,fd,wood,mx,H-fw/2,zc,scene);
    box(pw-2*fw,ah,.01,back,mx,lift+fw+ah/2,zb-.006,scene);
    const geo=new THREE.PlaneGeometry(aw,ah), uv=geo.attributes.uv; for(let k=0;k<uv.count;k++) uv.setX(k,(i+uv.getX(k))/n);
    const m=new THREE.Mesh(geo,art); m.position.set(mx,lift+fw+ah/2,zc-.004); m.rotation.y=Math.PI; m.userData=pick; scene.add(m); pickables.push(m); }
  OB(xb,xa,ZP.back-.13,ZP.back);
  softLight(cx,1.5,ZP.back-1.4,3,3.6);
}

// ---- a bronze lion mask on the door wall, spouting into a tall pottery urn (front corner of the tea room)
{ const wallX=-ZR.wallX-ZR.wallT/2, ux=wallX-.27, uz=16.72, H=.78, pick={type:'fountain'};
  const urnM=new THREE.MeshStandardMaterial({color:0x5a3e2c,roughness:.6}), glaze=new THREE.MeshStandardMaterial({color:0x2e3a34,roughness:.25});
  const urn=lathe([[0,0],[.12,0],[.18,.12],[.21,.36],[.2,.56],[.15,.7],[.13,.76],[.145,.78]],urnM,32); urn.position.set(ux,0,uz); urn.userData=pick; scene.add(urn); pickables.push(urn);
  const band=new THREE.Mesh(new THREE.CylinderGeometry(.212,.212,.08,32,1,true),glaze); band.position.set(ux,.5,uz); scene.add(band);
  const water=new THREE.Mesh(new THREE.CircleGeometry(.135,32),new THREE.MeshStandardMaterial({color:0x24403a,roughness:.04,metalness:.4})); water.rotation.x=-Math.PI/2; water.position.set(ux,H-.03,uz); scene.add(water);
  const ring=new THREE.Mesh(new THREE.RingGeometry(.02,.03,32),new THREE.MeshBasicMaterial({color:0xcfe6e0,transparent:true,opacity:.5,depthWrite:false})); ring.rotation.x=-Math.PI/2; ring.position.set(ux,H-.028,uz); scene.add(ring); ZL_DYN.push(ring);
  // a lion mask on the wall, aged bronze to go with the iron, the dark rosewood and the urn
  const bronze=new THREE.MeshStandardMaterial({color:0x7a603c,metalness:.5,roughness:.45}), patina=new THREE.MeshStandardMaterial({color:0x5e6650,metalness:.3,roughness:.65}), my=1.36, mx=wallX-.02;
  const head=new THREE.Group(); head.position.set(mx,my,uz); head.rotation.y=-Math.PI/2; scene.add(head);   // local +z faces into the room
  // mane: two rings of flowing locks round the face, longer below like a beard
  for(const [r0,n,len,th,z,m] of [[.14,30,.13,.062,.0,patina],[.105,24,.1,.055,.035,bronze]]) for(let i=0;i<n;i++){ const a=i/n*Math.PI*2, down=Math.max(0,-Math.sin(a)), L=len*(1+down*.9);
    const lock=new THREE.Mesh(new THREE.SphereGeometry(th,10,8),m); lock.scale.set(.9,L/th*.42,.5); lock.position.set(Math.cos(a)*(r0+L*.3),Math.sin(a)*(r0+L*.3)-.02,z); lock.rotation.z=a-Math.PI/2+(i%2?.12:-.12); head.add(lock); }
  const face=new THREE.Mesh(new THREE.SphereGeometry(.105,20,16),bronze); face.scale.set(1,1.08,.75); face.position.set(0,0,.06); head.add(face);
  const brow=new THREE.Mesh(new THREE.SphereGeometry(.05,12,8),bronze); brow.scale.set(1.9,.5,.8); brow.position.set(0,.045,.12); head.add(brow);
  const muzzle=new THREE.Mesh(new THREE.SphereGeometry(.055,14,10),bronze); muzzle.scale.set(1.15,.85,1); muzzle.position.set(0,-.045,.13); head.add(muzzle);
  const nose=new THREE.Mesh(new THREE.SphereGeometry(.024,10,8),bronze); nose.scale.set(1.3,.8,1); nose.position.set(0,-.01,.18); head.add(nose);
  const ridge=new THREE.Mesh(new THREE.CylinderGeometry(.014,.022,.07,8),bronze); ridge.position.set(0,.02,.165); ridge.rotation.x=-.5; head.add(ridge);
  for(const sx of [-1,1]){ const eye=new THREE.Mesh(new THREE.SphereGeometry(.014,10,8),new THREE.MeshStandardMaterial({color:0x2a2218,roughness:.4})); eye.scale.set(1.4,.8,.6); eye.position.set(sx*.042,.025,.14); head.add(eye);
    const cheek=new THREE.Mesh(new THREE.SphereGeometry(.035,10,8),bronze); cheek.position.set(sx*.04,-.06,.14); head.add(cheek);
    const ear=new THREE.Mesh(new THREE.SphereGeometry(.025,8,6),patina); ear.scale.set(1,1.2,.5); ear.position.set(sx*.1,.1,.06); head.add(ear); }
  const mouth=new THREE.Mesh(new THREE.SphereGeometry(.026,12,8),new THREE.MeshStandardMaterial({color:0x14100c,roughness:.8})); mouth.scale.set(1.3,.75,.6); mouth.position.set(0,-.1,.155); head.add(mouth);
  const chin=new THREE.Mesh(new THREE.SphereGeometry(.03,10,8),bronze); chin.scale.set(1.2,.7,.8); chin.position.set(0,-.135,.13); head.add(chin);
  // the stream: a thin arc from the mouth into the urn, its texture running
  const sCan=ctex(32,256,(g,w,h)=>{ g.fillStyle='#ffffff'; g.fillRect(0,0,w,h); for(let y=0;y<h;y+=16){ g.fillStyle='rgba(160,200,200,.55)'; g.fillRect(0,y,w,6); } });
  sCan.wrapS=sCan.wrapT=THREE.RepeatWrapping; sCan.repeat.set(1,3);
  const curve=new THREE.QuadraticBezierCurve3(new THREE.Vector3(mx-.17,my-.1,uz),new THREE.Vector3(ux+.04,my-.14,uz),new THREE.Vector3(ux-.02,H-.02,uz));
  const stream=new THREE.Mesh(new THREE.TubeGeometry(curve,24,.007,8,false),new THREE.MeshStandardMaterial({map:sCan,color:0xdff2ee,transparent:true,opacity:.6,roughness:.05,depthWrite:false})); scene.add(stream); ZL_DYN.push(stream);
  // a bamboo ladle resting across the rim
  { const lad=new THREE.MeshStandardMaterial({color:0xc8b078,roughness:.75,side:THREE.DoubleSide}), node=new THREE.MeshStandardMaterial({color:0xa58c58,roughness:.8});
    const lg=new THREE.Group(); lg.position.set(ux,H+.007,uz); lg.rotation.y=Math.PI-.5; scene.add(lg);   /* bamboo ladle (竹水杓): the cup over the water, the handle across the far rim */
    const hl=cylinder(.0055,.0065,.36,lad,.14,0,0,lg); hl.rotation.z=Math.PI/2;
    const cupG=lathe([[0,-.05],[.031,-.05],[.031,0],[.028,0],[.028,-.046],[0,-.046]],lad,20); cupG.position.set(-.07,.008,0); lg.add(cupG);
    for(const yy of [-.05,0]){ const rn=new THREE.Mesh(new THREE.TorusGeometry(.031,.002,6,20),node); rn.rotation.x=Math.PI/2; rn.position.set(-.07,yy+.008,0); lg.add(rn); }
    const joint=box(.012,.016,.012,node,-.036,0,0,lg); }
  OB(ux-.22,ux+.22,uz-.22,uz+.22);
  // sound: a soft trickle, louder as you come near
  let snd=null; addEventListener('pointerdown',()=>{ try{ if(!actx) actx=new (window.AudioContext||window.webkitAudioContext)(); }catch{} });
  ZL_ANIM.push(dt=>{ sCan.offset.y-=dt*1.6; const k=(ring.userData.k=((ring.userData.k||0)+dt*.9)%1); ring.scale.setScalar(1+k*4); ring.material.opacity=.5*(1-k);
    if(typeof actx==='undefined'||!actx) return;
    if(!snd){ try{ const n=actx.sampleRate*2, buf=actx.createBuffer(1,n,actx.sampleRate), dd=buf.getChannelData(0); let b=0; for(let i=0;i<n;i++){ dd[i]=(Math.random()*2-1)*.18; }   /* fine splash fizz */
        const sr=actx.sampleRate; for(let k=0;k<n/sr*130;k++){ const t0=Math.floor(Math.random()*(n-sr*.03)), f0=900+Math.random()*1900, len=Math.floor(sr*(.004+Math.random()*.012)), a0=.15+Math.random()*.45;   /* droplets and small bubbles plinking under the stream */
          for(let i=0;i<len;i++){ const t=i/sr; dd[(t0+i)%n]+=Math.sin(2*Math.PI*f0*(1+t*30)*t)*a0*Math.exp(-i/(len*.3)); } }
      const src=actx.createBufferSource(); src.buffer=buf; src.loop=true; const f=actx.createBiquadFilter(); f.type='highpass'; f.frequency.value=650; f.Q.value=.5; const g=actx.createGain(); g.gain.value=0; src.connect(f); f.connect(g); g.connect(actx.destination); src.start(); snd=g; }catch{ snd={gain:{value:0}}; } }
    const dist=Math.hypot(ME.x-ux,ME.z-uz), v=VIEW.mode==='plan'?0:.09*Math.max(0,1-dist/4.5)**2; if(snd.gain.setTargetAtTime) snd.gain.setTargetAtTime(v,actx.currentTime,.3); });
}

// ---- the study's censer, on the contemporary table
censer(ZP.modern.cx-.98,ZP.modern.h,ZP.modern.cz+.02);

// ---- the rainforest tank light: click to switch, shared with everyone in the room
// hand switches shared with everyone in the room (off until someone turns them on)
function swState(key){ let best=myDoors[key]?{o:myDoors[key][0],at:myDoors[key][1]}:null;
  for(const [,o] of others){ const r=o.p&&o.p.dr&&o.p.dr[key]; if(Array.isArray(r)&&r.length===2&&typeof r[1]==='number'&&(!best||r[1]>best.at)) best={o:!!r[0],at:r[1]}; }
  return best?best.o:false; }
function flipSwitch(key,on,msg){ myDoors={...myDoors,[key]:[on?1:0,Date.now()]}; pushPresence(); toast(msg); }
function toggleFloorLamp(i){ const L=FLOOR_LAMPS[i]; if(L) flipSwitch(L.key,!L.fx.on,L.fx.on?'關掉立燈。':'打開立燈。'); }
ZL_ANIM.push(()=>{ let ch=false; for(const L of FLOOR_LAMPS){ const w=swState(L.key); if(L.fx.on!==w){ L.fx.on=w; ch=true; } } if(ch) applyLighting(); });
const VIV_STEPS=[0,0.35,0.7,1];
const VIV_NAMES=['關掉雨林燈管。','雨林燈管亮度：微亮（35%）。','雨林燈管亮度：中亮（70%）。','雨林燈管亮度：最亮（100%）。'];
function vivLevel(){ let best=myDoors.V?{v:Number(myDoors.V[0])||0,at:myDoors.V[1]}:null;
  for(const [,o] of others){ const r=o.p&&o.p.dr&&o.p.dr.V; if(Array.isArray(r)&&r.length===2&&typeof r[1]==='number'&&(!best||r[1]>best.at)) best={v:Number(r[0])||0,at:r[1]}; }
  return best?Math.max(0,Math.min(1,best.v)):0.7; }
function toggleViv(){ const cur=VIV.level||0; const idx=VIV_STEPS.findIndex(s=>Math.abs(s-cur)<0.05); const next=(idx+1)%VIV_STEPS.length; const lv=VIV_STEPS[next]; myDoors={...myDoors,V:[lv,Date.now()]}; pushPresence(); toast(VIV_NAMES[next]); }
ZL_ANIM.push(()=>{ const want=vivLevel(); if(VIV.lights.length&&want!==VIV.level){ VIV.level=want; VIV.on=want>0; for(const f of VIV.lights){ f.on=want>0; f.light.intensity=f.power*want; } if(VIV.mat) VIV.mat.emissiveIntensity=want>0?(0.3+1.1*want):0; if(VIV.glow) for(const m of VIV.glow) m.emissiveIntensity=want*0.25; if(VIV.swLever) VIV.swLever.rotation.x=want>0?0:Math.PI*0.45; if(VIV.swLed) VIV.swLed.emissiveIntensity=want>0?(0.4+want*0.8):0; } });

// ---- inside 知了間 the sky's fill steps back, so the room's own lights carry it
{ let k=1; const fill=fixtures.find(f=>f.light.isAmbientLight);
  ZL_ANIM.push(dt=>{ const inN=VIEW.mode!=='plan'&&ME.z>15.6&&Math.abs(ME.x)<7.6; k+=((inN?.65:1)-k)*Math.min(1,dt*2.5); ambientSky.userData.k=k;
    if(ambientSky.userData.base!==undefined) ambientSky.intensity=ambientSky.userData.base*k;
    if(fill) fill.light.intensity=fill.power*(Number(lightLevel.value)/100)*(.35+.65*k); }); }
// ---- rain in the courtyard, following Taipei's weather: streaks falling into the open court, splashes on the paving,
//      wet stone, the sound of it (muffled indoors), and thunder when there is a storm
{ const WX_CODE={0:['晴',0],1:['晴時多雲',0],2:['多雲',0],3:['陰',0],45:['霧',0],48:['霧',0],51:['毛毛雨',.18],53:['毛毛雨',.28],55:['毛毛雨',.38],56:['毛毛雨',.25],57:['毛毛雨',.38],
    61:['小雨',.35],63:['中雨',.62],65:['大雨',.92],66:['小雨',.35],67:['大雨',.9],80:['陣雨',.45],81:['陣雨',.72],82:['大陣雨',1],95:['雷雨',.9],96:['雷雨',.95],99:['雷雨',1]};
  const todayBase=$('#today').textContent;
  function setWeather(code,cloud,temp,precip){ const e=WX_CODE[code]||['',0]; let r=e[1]; if(!r&&precip>.1) r=.25;
    WX.target=r; WX.targetCloud=Math.max(r>0?.88:0,Math.min(1,(cloud||0)/100)*(code>=3?1:.75)); WX.thunder=code>=95; WX.label=e[0]||(r?'雨':''); WX.temp=temp; if(!WX.init){ WX.init=true; WX.rain=WX.target; WX.cloud=WX.targetCloud; updateSky(); }   /* the first reading applies at once; later changes drift in */
    WX.code=code; showToday(); }
  // the date line: Taipei's weather, temperature and wind (a hand-set weather shows as such)
  function showToday(){ const lab=WX_FORCE?((NTX&&NTX('wx.'+WX_FORCE))||WX.label):WX.label, temp=WX_FORCE?(live&&live.t):WX.temp;
    const w=(NTX?NTX('wx.windShow'):'風 {風速} m/s').replace('{風速}',WIND.speed<.5?'0':WIND.speed.toFixed(1));
    $('#today').textContent=todayBase+(lab?'・臺北'+lab+(Number.isFinite(temp)?' '+Math.round(temp)+'°':''):'')+'・'+w; }
  WX.show=showToday;
  let live=null;
  async function fetchWeather(){ const h=location.hash, f=WX_FORCE||(h.includes('storm')?'storm':h.includes('rain')?'rain':h.includes('clear')?'clear':h.includes('cloudy')?'cloudy':null);
    if(f&&live===null) live=false;
    applyWind();
    if(f==='storm') setWeather(95,100,NaN,5); else if(f==='rain') setWeather(63,100,NaN,2); else if(f==='clear') setWeather(0,0,NaN,0); else if(f==='cloudy') setWeather(3,100,NaN,0);
    else if(live) setWeather(live.c,live.cl,live.t,live.p);
    applyWind();
    try{ const c=new AbortController(), t=setTimeout(()=>c.abort(),8000);
      const r=await fetch('https://api.open-meteo.com/v1/forecast?latitude=25.0375&longitude=121.5637&current=temperature_2m,precipitation,weather_code,cloud_cover,wind_speed_10m,wind_gusts_10m,wind_direction_10m&wind_speed_unit=ms&timezone=Asia%2FTaipei',{signal:c.signal}); clearTimeout(t);
      if(!r.ok) return; const j=await r.json(), k=j&&j.current; if(!k) return;
      live={c:+k.weather_code,cl:+k.cloud_cover,t:+k.temperature_2m,p:+k.precipitation||0};
      // wind: the service gives where it blows FROM (0 = north); the world has north at +x and east at +z
      if(Number.isFinite(+k.wind_speed_10m)){ WIND.ls=+k.wind_speed_10m; WIND.lg=Math.max(WIND.ls,+k.wind_gusts_10m||WIND.ls*1.6); const to=((+k.wind_direction_10m||0)+180)*Math.PI/180-Math.PI/4; WIND.dir=Math.atan2(Math.sin(to),Math.cos(to));   /* the game's +x is north-east */ WIND.live=true; }
      applyWind(); if(!f) setWeather(live.c,live.cl,live.t,live.p); else showToday(); }catch{} }
  WX.refresh=fetchWeather;
  fetchWeather(); setInterval(fetchWeather,600000); addEventListener('hashchange',fetchWeather);
  // streaks
  const N=2400, RECTS=[[-5.05,5.05,courtAxis-5.05,courtAxis+5.05],[14.2,24.8,4.7,14.9],[33.9,46.7,4.7,14.9],[47.0,53.1,-4.1,23.7]], TOP=11, LEN=.42, ri=new Uint8Array(N), pickRect=r=>{ const q=r(); return q<.4?0:q<.78?1:2; };
  const pos=new Float32Array(N*6), sp=new Float32Array(N), R=rnd(777);
  const reset=(i,any)=>{ const q=ri[i]=pickRect(R), [X0,X1,Z0,Z1]=RECTS[q], x=X0+R()*(X1-X0), z=Z0+R()*(Z1-Z0), y=any?R()*TOP:TOP+R()*2; pos[i*6]=x; pos[i*6+1]=y; pos[i*6+2]=z; sp[i]=8.5+R()*3.5; };
  for(let i=0;i<N;i++) reset(i,true);
  const rg=new THREE.BufferGeometry(); rg.setAttribute('position',new THREE.BufferAttribute(pos,3)); rg.boundingSphere=new THREE.Sphere(new THREE.Vector3(15,5,courtAxis),30);
  const rainM=new THREE.LineBasicMaterial({color:0xc9d3dc,transparent:true,opacity:.32,depthWrite:false});
  const rain=new THREE.LineSegments(rg,rainM); rain.visible=false; rain.frustumCulled=false; scene.add(rain); ZL_DYN.push(rain);
  // splashes: flecks on the paving that jump about
  const SN=260, spos=new Float32Array(SN*3), splashAt=(i,r)=>{ const [X0,X1,Z0,Z1]=RECTS[pickRect(r)]; spos[i*3]=X0+r()*(X1-X0); spos[i*3+2]=Z0+r()*(Z1-Z0); spos[i*3+1]=.03+r()*.05; }; for(let i=0;i<SN;i++) splashAt(i,R);
  const sg=new THREE.BufferGeometry(); sg.setAttribute('position',new THREE.BufferAttribute(spos,3)); sg.boundingSphere=rg.boundingSphere;
  const splash=new THREE.Points(sg,new THREE.PointsMaterial({color:0xdfe6ec,size:.09,sizeAttenuation:true,transparent:true,opacity:.38,depthWrite:false,map:textCanvas(32,32,(g,w,h)=>{ g.strokeStyle='#fff'; g.lineWidth=3; g.beginPath(); g.ellipse(16,16,12,6,0,0,Math.PI*2); g.stroke(); })})); splash.visible=false; splash.frustumCulled=false; scene.add(splash); ZL_DYN.push(splash);
  // wet paving
  const wetMats=[court.material,yard.material,FIRST.lawn&&FIRST.lawn.material,FIRST.pave&&FIRST.pave.material,FRONT.lawn&&FRONT.lawn.material].filter(m=>m&&m.color).map(m=>({m,c:m.color.clone(),r:m.roughness}));
  // sound: a looped hiss, brighter outdoors, low and muffled under a roof
  let snd=null;
  function rainSound(){ if(snd||!actx||actx.state!=='running') return; const sr=actx.sampleRate, n=sr*3, buf=actx.createBuffer(1,n,sr), d=buf.getChannelData(0); let b=0;
    for(let i=0;i<n;i++){ const w=Math.random()*2-1; b=.6*b+.4*w; d[i]=(w*.55+b*.45)*(.8+.2*Math.sin(i/sr*2.1)); }
    for(let i=0;i<2000;i++){ const f=i/2000; d[n-2000+i]=d[n-2000+i]*(1-f)+d[i]*f; }
    const src=actx.createBufferSource(); src.buffer=buf; src.loop=true; const hp=actx.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=350; const lp=actx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=5000;
    const g=actx.createGain(); g.gain.value=0; src.connect(hp).connect(lp).connect(g).connect(actx.destination); src.start(); snd={g,lp}; }
  function thunder(){ try{ if(!actx||actx.state!=='running') return; const sr=actx.sampleRate, n=sr*4, buf=actx.createBuffer(1,n,sr), d=buf.getChannelData(0); let b=0;
      for(let i=0;i<n;i++){ b=.985*b+.015*(Math.random()*2-1); const t=i/sr; d[i]=b*9*Math.exp(-t*.9)*(1+.6*Math.sin(t*7)); }
      const src=actx.createBufferSource(); src.buffer=buf; const g=actx.createGain(); g.gain.value=.5; src.connect(g).connect(actx.destination); src.start(actx.currentTime+.6+Math.random()*1.5); }catch{} }
  const flashL=new THREE.HemisphereLight(0xdfe8ff,0x8090a8,0); scene.add(flashL); let flash=0, nextThunder=12+Math.random()*20, sunk=0;
  ZL_ANIM.push(dt=>{ const prevR=WX.rain, prevC=WX.cloud; WX.rain+=(WX.target-WX.rain)*Math.min(1,dt*.25); WX.cloud+=(WX.targetCloud-WX.cloud)*Math.min(1,dt*.25);
    if(Math.abs(WX.rain-WX.target)<.004) WX.rain=WX.target; if(Math.abs(WX.cloud-WX.targetCloud)<.004) WX.cloud=WX.targetCloud;
    sunk+=dt; if((prevR!==WX.rain||prevC!==WX.cloud)&&sunk>.5){ sunk=0; updateSky(); }
    const r=WX.rain, show=r>.01&&VIEW.mode!=='plan'; rain.visible=splash.visible=show;
    const wet=Math.min(1,r*1.6); for(const w of wetMats){ w.m.color.copy(w.c).multiplyScalar(1-.38*wet); w.m.roughness=w.r-(w.r-.22)*wet; }
    if(show){ const n=Math.floor(N*Math.min(1,.25+r*.85)); rg.setDrawRange(0,n*2); rainM.opacity=.2+.2*r;
      const sl=Math.min(.7,.03+windAt(performance.now()/1000)*.045), sx=Math.cos(WIND.dir)*sl, sz=Math.sin(WIND.dir)*sl;
      for(let i=0;i<n;i++){ const k=i*6, v=sp[i]*dt, Rc=RECTS[ri[i]]; pos[k+1]-=v; pos[k]+=sx*v; pos[k+2]+=sz*v; if(pos[k+1]<0||pos[k]<Rc[0]||pos[k]>Rc[1]||pos[k+2]<Rc[2]||pos[k+2]>Rc[3]) reset(i,false); pos[k+3]=pos[k]-sx*LEN; pos[k+4]=pos[k+1]+LEN; pos[k+5]=pos[k+2]-sz*LEN; }
      rg.attributes.position.needsUpdate=true;
      const m=Math.floor(SN*Math.min(1,.3+r)); sg.setDrawRange(0,m); for(let j=0;j<12;j++){ splashAt(Math.floor(Math.random()*m),Math.random); } sg.attributes.position.needsUpdate=true; }
    if(r>.01) rainSound();
    if(snd){ const zn=zoneOf(ME), out=zn==='C'||(zn==='F'&&ME.x>14.2&&ME.x<24.9&&ME.z>4.6&&ME.z<15)||ME.x>33.8&&!(Math.abs(ME.z-courtAxis)>5.2&&ME.x<46.8), near=Math.max(0,1-Math.max(0,Math.min(Math.hypot(ME.x,ME.z-courtAxis),Math.hypot(ME.x-20.4,ME.z-courtAxis))-5)/9), tg=VIEW.mode==='plan'?0:r*(out?.2:.035+.05*near), now=actx.currentTime;
      snd.g.gain.setTargetAtTime(tg,now,.4); snd.lp.frequency.setTargetAtTime(out?5200:900,now,.4); }
    if(WX.thunder&&r>.3){ nextThunder-=dt; if(nextThunder<=0){ nextThunder=25+Math.random()*50; flash=1; thunder(); } }
    if(flash>0){ flash=Math.max(0,flash-dt*2.2); flashL.intensity=2.2*flash*(flash>.55||flash<.35?1:.25); } else if(flashL.intensity) flashL.intensity=0; }); }

// ---- the tea room's wall lanterns: antique-bronze, oval back plate, a scrolled arm curling over the top, and a six-sided
//      frosted-glass lantern flaring toward its roof, with a curled bracket and drop finial underneath
function lanternSconce(x,y,z,ry){ const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=ry; scene.add(g);
  const br=new THREE.MeshStandardMaterial({color:0x6b5333,metalness:.55,roughness:.42});
  const glass=new THREE.MeshStandardMaterial({color:0xf3e2bc,emissive:0xffc77a,emissiveIntensity:.8,roughness:.5,side:THREE.DoubleSide}); LAMPS.push({f:{on:true},mat:glass});
  const tube=(pts,r=.007)=>{ const m=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p))),28,r,6),br); g.add(m); return m; };
  const plate=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.016,28),br); plate.rotation.x=Math.PI/2; plate.scale.set(1,1,1.9); plate.position.set(0,.02,.008); g.add(plate);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(.05,.005,6,28),br); rim.scale.set(1,1.9,1); rim.position.set(0,.02,.017); g.add(rim);
  const cz=.2, s=[];   // scrolled arm: up off the plate, over in a curl, down onto the lantern's ring
  for(let i=0;i<=14;i++){ const a=Math.PI*1.75*i/14, r=.045*(1-i/18); s.push([0,.27+Math.sin(a)*r,.08-Math.cos(a)*r]); }
  tube([[0,.1,.02],[0,.2,.03],...s.reverse()]);
  tube([[0,.21,.06],[0,.26,.13],[0,.25,cz],[0,.215,cz]]);
  tube([[0,-.08,.02],[0,-.15,.05],[0,-.17,.12],[0,-.13,cz-.03],[0,-.105,cz]],.006);
  // lantern
  const gl=new THREE.Mesh(new THREE.CylinderGeometry(.085,.062,.17,6,1,true),glass); gl.position.set(0,.03,cz); g.add(gl);
  for(let i=0;i<6;i++){ const a=i/6*Math.PI*2; tube([[Math.sin(a)*.064,-.055,cz+Math.cos(a)*.064],[Math.sin(a)*.087,.115,cz+Math.cos(a)*.087]],.005); }
  const ring=(r0,r1,h,yy)=>{ const m=new THREE.Mesh(new THREE.CylinderGeometry(r0,r1,h,6),br); m.position.set(0,yy,cz); g.add(m); return m; };
  ring(.092,.09,.012,.12); ring(.035,.112,.055,.152); ring(.026,.036,.03,.192); ring(.012,.02,.02,.215);
  const fin=new THREE.Mesh(new THREE.SphereGeometry(.013,10,8),br); fin.position.set(0,.232,cz); g.add(fin);
  ring(.066,.05,.02,-.062); ring(.045,.02,.03,-.085);
  const drop=new THREE.Mesh(new THREE.SphereGeometry(.016,10,8),br); drop.position.set(0,-.11,cz); g.add(drop);
  for(const sd of [-1,1]) tube([[sd*.05,-.06,cz],[sd*.075,-.09,cz],[sd*.07,-.12,cz],[sd*.05,-.115,cz]],.004);
  const bulb=new THREE.Mesh(new THREE.SphereGeometry(.018,10,8),new THREE.MeshBasicMaterial({color:0xffe2a8})); bulb.position.set(0,.02,cz); g.add(bulb);
  return g; }

// ---- wall sconces like the study's, where the light is thin: the hall's side walls either side of the octagonal windows,
//      and the tea room's front wall either side of the window
for(const sx of [-1,1]){ const x=sx*(ZR.wallX-ZR.wallT/2); sconce(x,2.05,23.05,sx>0?-Math.PI/2:Math.PI/2); softLight(x-sx*.35,2.0,19.9,1.4,4.6); }
for(const x of [-3.62,-6.3]) lanternSconce(x,2.05,ZP.front+.01,0); softLight(-4.95,2.0,ZP.front+.4,1.4,3.6);

// which room a point is in: inside 知了間 the hall, the washitsu (left) and the tea room (right) each count as their own
function roomOf(p){ const z=zoneOf(p); if(z!=='N'||p.z<15.6||p.z>ZP.back+.5) return z; return 'N'+(p.x>ZR.wallX?'L':p.x<-ZR.wallX?'R':'M'); }
// the contemporary table now sits close to the screen: its back chair is approached from the side
for(const st of SEATS) if(st.z>ZP.modern.cz+.5&&Math.abs(st.x-ZP.modern.cx)<.2) st.ap={x:st.x+.7,z:st.z};

// ---- the tea room's main light: one slim LED bar hung along the room, dark metal body, a warm strip of light underneath
{ const x=-4.8, y=2.85, z=19.8, L=2.6, pick={type:'teapendant'};
  const body=new THREE.MeshStandardMaterial({color:0x2a2622,metalness:.5,roughness:.45});
  const strip=new THREE.MeshStandardMaterial({color:0xfff4e4,emissive:0xffdcb0,emissiveIntensity:.9,roughness:.6}); LAMPS.push({f:{on:true},mat:strip});
  box(.045,.035,L,body,x,y,z,scene,pick); box(.03,.006,L-.04,strip,x,y-.02,z,scene,pick);
  for(const s of [-1,1]) cylinder(.0025,.0025,.75,M.ink,x,y+.39,z+s*(L/2-.25));
}

// ---- a second gramophone, on the low cabinet to the right of the tea room window; it plays the same record as the study's
let TEA_REC=null, TEA_PLATTER=null;
{ const x=-3.55, z=ZP.front+.24, g=new THREE.Group(); g.position.set(x,.9-.58,z); scene.add(g); const pick={type:'record'};
  const walnut=new THREE.MeshStandardMaterial({color:0x3b2416,roughness:.4}), brass=new THREE.MeshStandardMaterial({color:0xc29a4a,metalness:.85,roughness:.28,side:THREE.DoubleSide});
  box(.38,.15,.38,walnut,0,.655,0,g,pick); box(.4,.02,.4,walnut,0,.735,0,g,pick); box(.34,.1,.005,new THREE.MeshStandardMaterial({color:0x4a2e1c,roughness:.5}),0,.655,.191,g);
  const pl=new THREE.Group(); pl.position.set(0,.75,0); g.add(pl); ZL_DYN.push(pl);
  cylinder(.15,.15,.012,new THREE.MeshStandardMaterial({color:0x3a1f1a,roughness:.9}),0,0,0,pl);
  const disc=new THREE.Mesh(new THREE.CylinderGeometry(.145,.145,.005,40),new THREE.MeshStandardMaterial({color:0x111111,roughness:.3,metalness:.2})); disc.position.y=.009; pl.add(disc);
  const lab=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,.006,24),new THREE.MeshStandardMaterial({color:0x3e5873,roughness:.7})); lab.position.y=.010; pl.add(lab);
  const crank=cylinder(.006,.006,.12,brass,.25,.65,.05,g); crank.rotation.z=Math.PI/2; box(.012,.07,.012,brass,.31,.62,.05,g);
  const neck=new THREE.CatmullRomCurve3([[.13,.74,-.13],[.13,.86,-.14],[.1,.98,-.1],[.04,1.06,.0],[-.04,1.1,.1]].map(p=>new THREE.Vector3(...p))); g.add(new THREE.Mesh(new THREE.TubeGeometry(neck,30,.018,10,false),brass));
  const arm=new THREE.CatmullRomCurve3([[.13,.76,-.13],[.08,.78,-.05],[.05,.775,.04]].map(p=>new THREE.Vector3(...p))); g.add(new THREE.Mesh(new THREE.TubeGeometry(arm,12,.007,8,false),brass));
  cylinder(.022,.022,.03,brass,.13,.755,-.13,g); box(.025,.02,.035,brass,.05,.77,.05,g);
  const prof=[]; for(let i=0;i<=24;i++){ const t=i/24; prof.push(new THREE.Vector2(.02+.22*Math.pow(t,2.6),t*.42)); }
  const horn=new THREE.Mesh(new THREE.LatheGeometry(prof,36),brass); horn.userData=pick; pickables.push(horn);
  const hornG=new THREE.Group(); hornG.position.set(-.04,1.1,.1); hornG.add(horn); g.add(hornG); hornG.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(-.3,.5,.8).normalize());
  const rim=new THREE.Mesh(new THREE.TorusGeometry(.24,.006,8,48),brass); rim.position.y=.42; rim.rotation.x=Math.PI/2; horn.add(rim);
  TEA_REC={x,z}; TEA_PLATTER=pl; }

// ---- a potted banana (芭蕉) in the back-left corner of the tea room: a clump of four pseudostems, fibrous brown at the
//      foot and green above, carrying broad oblong leaves on short stalks that spiral up the stems and arch outward
{ const x=-3.02, z=ZP.back-.42, pick={type:'banana'}, bg=new THREE.Group(); bg.position.set(x,0,z); scene.add(bg);
  const pot=lathe([[0,0],[.15,0],[.16,.02],[.19,.34],[.2,.36]],new THREE.MeshStandardMaterial({color:0x1d1c1b,roughness:.5}),32); pot.userData=pick; bg.add(pot); pickables.push(pot);
  const soil=new THREE.Mesh(new THREE.CircleGeometry(.185,28),new THREE.MeshStandardMaterial({color:0x3a2e22,roughness:1})); soil.rotation.x=-Math.PI/2; soil.position.set(0,.34,0); bg.add(soil);
  const barkTex=ctex(64,256,(g,w,h)=>{ g.fillStyle='#7a5c3c'; g.fillRect(0,0,w,h); const R0=rnd(5);
    for(let i=0;i<90;i++){ g.strokeStyle=`rgba(${60+R0()*80|0},${40+R0()*50|0},${25+R0()*30|0},.7)`; g.lineWidth=1+R0()*3; const xx=R0()*w, y0=R0()*h; g.beginPath(); g.moveTo(xx,y0); g.lineTo(xx+(R0()-.5)*6,y0+30+R0()*80); g.stroke(); }
    g.fillStyle='rgba(190,160,110,.25)'; for(let i=0;i<14;i++) g.fillRect(R0()*w,R0()*h,2+R0()*6,20+R0()*40); });
  const barkM=new THREE.MeshStandardMaterial({map:barkTex,roughness:.95}), stemM=new THREE.MeshStandardMaterial({color:0x6e8a3a,roughness:.65}), stalkM=new THREE.MeshStandardMaterial({color:0x7d9a45,roughness:.6});
  const mkLeafTex=(base,vein)=>ctex(128,512,(g,w,h)=>{ g.clearRect(0,0,w,h); g.fillStyle=base; g.beginPath(); g.moveTo(w/2,0);   /* blunt rounded tip (top), broadest a third down, easing in to a rounded base */
      g.quadraticCurveTo(w*.62,h*.005,w*.82,h*.04); g.bezierCurveTo(w*1.0,h*.12,w*1.0,h*.55,w*.9,h*.8); g.quadraticCurveTo(w*.78,h*.97,w/2,h); g.quadraticCurveTo(w*.22,h*.97,w*.1,h*.8); g.bezierCurveTo(w*0,h*.55,w*0,h*.12,w*.18,h*.04); g.quadraticCurveTo(w*.38,h*.005,w/2,0); g.fill();
      const gr=g.createLinearGradient(0,0,w,0); gr.addColorStop(0,'rgba(0,0,0,.18)'); gr.addColorStop(.45,'rgba(255,255,220,.08)'); gr.addColorStop(.55,'rgba(255,255,220,.08)'); gr.addColorStop(1,'rgba(0,0,0,.18)');
      g.globalCompositeOperation='source-atop'; g.fillStyle=gr; g.fillRect(0,0,w,h);
      g.strokeStyle='rgba(20,50,20,.28)'; g.lineWidth=1; for(let y=6;y<h-6;y+=5){ g.beginPath(); g.moveTo(w/2,y); g.quadraticCurveTo(w*.3,y+10,2,y+26); g.moveTo(w/2,y); g.quadraticCurveTo(w*.7,y+10,w-2,y+26); g.stroke(); }
      g.strokeStyle=vein; g.lineWidth=5; g.beginPath(); g.moveTo(w/2,0); g.lineTo(w/2,h*.97); g.stroke();
      g.globalCompositeOperation='destination-out'; g.lineWidth=2; for(const [y,sd] of [[220,1],[300,-1],[380,1]]){ g.beginPath(); g.moveTo(w/2+sd*7,y); g.quadraticCurveTo(w/2+sd*30,y+8,sd>0?w:0,y+26); g.stroke(); } g.globalCompositeOperation='source-over'; });
  const leafMs=[mkLeafTex('#4f9a3c','rgba(215,232,160,.75)'),mkLeafTex('#3f8432','rgba(200,225,150,.7)'),mkLeafTex('#5aa443','rgba(225,240,170,.75)')].map(t=>new THREE.MeshStandardMaterial({map:t,alphaTest:.5,side:THREE.DoubleSide,roughness:.45}));
  const R=rnd(23), up=new THREE.Vector3(0,1,0), base=.34;
  const aim=Math.atan2(-1,-1.15);   // lean the plant out of the corner, toward the room
  const stems=[[.03,.02,1.5,.065,10],[-.07,.05,1.2,.055,8],[.06,-.07,.95,.05,6],[-.04,-.06,.65,.045,5]], leaves=[];
  for(const [dx,dz,h,r,nL] of stems){
    const lean=.06+Math.hypot(dx,dz)*.6, la=Math.atan2(dx,dz)*.4+aim*.6;
    const top=new THREE.Vector3(dx+Math.sin(la)*lean*h,base+h,dz+Math.cos(la)*lean*h), foot=new THREE.Vector3(dx,base,dz);
    const dir=top.clone().sub(foot), len=dir.length(); dir.normalize(); const q=new THREE.Quaternion().setFromUnitVectors(up,dir);
    const barkH=len*.45, low=new THREE.Mesh(new THREE.CylinderGeometry(r*.9,r*1.25,barkH,10),barkM); low.position.copy(foot).addScaledVector(dir,barkH/2); low.quaternion.copy(q); low.userData=pick; bg.add(low); pickables.push(low);
    const hi=new THREE.Mesh(new THREE.CylinderGeometry(r*.55,r*.9,len-barkH,10),stemM); hi.position.copy(foot).addScaledVector(dir,barkH+(len-barkH)/2); hi.quaternion.copy(q); bg.add(hi);
    for(let i=0;i<nL;i++){ const t=.42+.58*(i+.5)/nL, at=foot.clone().addScaledVector(dir,len*t);
      const a=aim+(i*2.4+R()*.7)%(Math.PI*2.2)-1.25+(dx<0?-.3:.3);   // spiral round, but mostly facing the room
      const tilt=.28+(1-t)*.6+R()*.18, stalk=.08+R()*.1, L=.62+R()*.25+(t>.9?-.08:0), W=L*(.44+R()*.06);
      const sx=Math.sin(a)*Math.sin(tilt), sy=Math.cos(tilt), sz=Math.cos(a)*Math.sin(tilt);
      const st=new THREE.Mesh(new THREE.CylinderGeometry(.007,.012,stalk,6),stalkM); st.position.set(at.x+sx*stalk/2,at.y+sy*stalk/2,at.z+sz*stalk/2); st.quaternion.setFromUnitVectors(up,new THREE.Vector3(sx,sy,sz)); bg.add(st);
      const geo=new THREE.PlaneGeometry(W,L,4,12); geo.translate(0,L/2,0);
      const p=geo.attributes.position; for(let k=0;k<p.count;k++){ const tt=p.getY(k)/L, xx=p.getX(k); p.setZ(k,.22*tt*tt*(.7+tilt*.4)-Math.abs(xx)*.12-.04*Math.sin(tt*9)*Math.sign(xx)*.2); } geo.computeVertexNormals();
      const lf=new THREE.Mesh(geo,leafMs[(i+nL)%3]); lf.position.set(at.x+sx*stalk,at.y+sy*stalk,at.z+sz*stalk); lf.rotation.order='YXZ'; lf.rotation.y=a; lf.rotation.x=tilt; lf.rotation.z=(R()-.5)*.4;
      lf.userData=pick; bg.add(lf); pickables.push(lf); leaves.push(lf); } }
  // 3D physics collision-resolution solver for potted banana: pot rigid-body separation + per-vertex leaf collision vs partition/back wall/screen
  bg.updateMatrixWorld(true);
  const wallXMax=-ZR.wallX-ZR.wallT/2-.03, wallZMax=ZP.back-.06;
  if(bg.position.x+.26>wallXMax) bg.position.x=wallXMax-.26;
  if(bg.position.z+.26>wallZMax) bg.position.z=wallZMax-.26;
  bg.updateMatrixWorld(true);
  const vW=new THREE.Vector3(), inv=new THREE.Matrix4();
  for(const lf of leaves){ const pos=lf.geometry.attributes.position; inv.copy(lf.matrixWorld).invert(); let hit=false;
    for(let k=0;k<pos.count;k++){ vW.fromBufferAttribute(pos,k).applyMatrix4(lf.matrixWorld);
      if(vW.x>wallXMax){ vW.x=wallXMax; hit=true; }
      if(vW.z>wallZMax){ vW.z=wallZMax; hit=true; }
      if(hit){ vW.applyMatrix4(inv); pos.setXYZ(k,vW.x,vW.y,vW.z); } }
    if(hit){ pos.needsUpdate=true; lf.geometry.computeVertexNormals(); } }
  OB(bg.position.x-.25,bg.position.x+.25,bg.position.z-.25,bg.position.z+.25);
}

// ---- the palm-leaf fan by the gongfu brazier: click to fan the coals (they brighten, crackle, then settle)
var FAN={t:9,boost:0};
function fanFire(){ FAN.t=0; FAN.boost=1; try{ actx=actx||new (window.AudioContext||window.webkitAudioContext)(); actx.resume(); }catch{} crackle(2.2); for(let i=0;i<5;i++) noiseBurst(.22,500,.7,.035,i*.45); toast('拿起葵扇，對著爐口搧了幾下，炭火亮了起來。'); }
ZL_ANIM.push(dt=>{ FAN.t+=dt; FAN.boost=Math.max(0,FAN.boost-dt*.12);
  if(GF_FAN){ const on=FAN.t<2.4; GF_FAN.rotation.x=on?.55+Math.sin(FAN.t*Math.PI*4.2)*.45:0; GF_FAN.position.y=on?.36:.3; GF_FAN.rotation.z=on?-.4:0; } });

// ---- brewing at the contemporary table: the host lights the spirit burner under the 提梁壺 and brews in the 紫泥 pot;
//      shared like the gongfu pot, so everyone in 知了間 sees the flame, the steam and the poured cups
var myMD=null, mdStepSeen='';
const MD_STEPS=[[0,t=>'點起酒精爐，提梁壺裡的水慢慢熱起來。'],[6,t=>'壺裡響起蟹眼聲，水快滾了。'],[10,t=>'水滾了。溫壺，燙公道杯和四只杯子，水倒進水盂。'],[13,t=>`置茶：從茶荷把${t}撥進紫砂壺。`],[15,t=>'注水醒茶，第一泡倒掉。'],[17,t=>'再注水，蓋上壺蓋，靜候片刻。'],[21,t=>'出湯到公道杯。'],[23,t=>'分杯：主人一杯，三位客人各一杯。'],[25,t=>'請茶。']];
const MD_SERVE=25;
function startMD(){ const cur=sharedLatest('md',myMD); if(cur&&(Date.now()-cur.at)/1000<MD_SERVE){ toast(`${cur.by==='你'?'你':cur.by}正在泡這一壺。`); return; }
  myMD={t:myTea,at:Date.now()}; pushPresence(); closePanel(); }
function showModern(){ const cur=sharedLatest('md',myMD), el=cur?(Date.now()-cur.at)/1000:1e9;
  const state=!cur||el>TEA_LAST?'酒精爐熄著。':el<MD_SERVE?`${cur.mine?'你':esc(cur.by)}正在泡${esc(TEAS[cur.t][0])}。`:`桌上是${cur.mine?'你':esc(cur.by)}泡的${esc(TEAS[cur.t][0])}，還溫著。`;
  const body=openPanel('當代茶席',`<p class="meta">主人對窗而坐，三位客人坐長凳。酒精爐上的提梁壺煮水，紫泥標準壺泡茶，玻璃公道杯分茶。${state}</p><div class="vol">茶葉：<b>${esc(TEAS[myTea][0])}</b>　<span class="ba">${esc(TEAS[myTea][1])}</span></div><button class="btn pri" id="mdgo">點爐泡茶</button><div class="sec">換一罐茶</div>${teaList()}<p class="meta" style="margin-top:12px">茶泡好後，主人和三位客人面前各有一杯；在知了間的人也會看到。</p>`);
  body.querySelector('#mdgo').onclick=()=>{ try{ actx=actx||new (window.AudioContext||window.webkitAudioContext)(); actx.resume(); }catch{} startMD(); }; bindTeaList(body,showModern); }
ZL_ANIM.push(dt=>{ const MD=sharedLatest('md',myMD), el=MD?(Date.now()-MD.at)/1000:1e9, t=performance.now()/1000;
  const lit=el>=0&&el<TEA_LAST; for(const f of MD_FX.flame){ f.visible=lit; } if(lit&&MD_FX.flame[0]){ const k=1+.08*Math.sin(t*13)+.05*Math.sin(t*29); MD_FX.flame[0].scale.set(1,k,1); MD_FX.flame[1].scale.set(1,k*1.05,1); }
  const hot=el>6&&el<TEA_LAST?Math.min(1,(el-6)/4):0;
  for(const s of MD_FX.steam){ s.t=(s.t+dt*.45)%1; s.sp.position.set(MD_FX.spout.x+s.t*.04+Math.sin(s.t*7)*.008,MD_FX.spout.y+s.t*.28,MD_FX.spout.z+Math.sin(s.t*5+s.sp.id)*.012); s.sp.material.opacity=.3*hot*Math.sin(s.t*Math.PI); s.sp.scale.setScalar(.025+s.t*.09); }
  const col=MD?TEAS[MD.t][2]:0, inPitcher=el>=21&&el<TEA_LAST, served=el>=23&&el<TEA_LAST;
  if(MD_FX.pitcher){ MD_FX.pitcher.visible=inPitcher; if(inPitcher) MD_FX.pitcher.material.color.setHex(col); }
  for(const c of MD_FX.cups){ c.visible=served; if(served) c.material.color.setHex(col); }
  if(MD&&el<40&&(MD.mine||MODERN_SEATS.includes(ME.seat))){ const idx=MD_STEPS.filter(([s])=>el>=s).length-1, sk=MD.at+':'+idx;
    if(idx>=0&&sk!==mdStepSeen){ mdStepSeen=sk; toast(MD_STEPS[idx][1](TEAS[MD.t][0]),6000);
      if(idx===0) noiseBurst(.25,3000,1.5,.05); if(idx===1) boil(4,0,.6); if(idx===2){ boil(2.5,0,1); pour(1.4,2); } if(idx===4){ pour(1.2); pour(.8,1.4); } if(idx===5) pour(1.6); if(idx===6) pour(1.4); if(idx===7){ for(let i=0;i<4;i++) pour(.45,i*.55); } } } });

// ---- drinking: a cup is three sips. Each sip lifts the cup from the table to the drinker's lips, tips it, and sets it
//      back where it was, a little emptier; the third leaves it empty on the table. Tea at the three tea tables and
//      coffee in 學鳩齋 alike. Shared, so others see your cup rise and go down.
var mySip=null, myCoffeeAt=0;
const SIP_T=3.0;
const LIQ={ tea:{y:[.027,.02,.013],s:[1,.8,.62]}, md:{y:[.032,.024,.016],s:[1,.85,.68]}, coffee:{y:[.078,.064,.048],s:[1,.93,.8]} };
const SIP_TEXT={ tea:[t=>`第一口：${t}，先聞香，再小口啜。`,t=>'第二口：茶湯溫了，回甘慢慢出來。',t=>'最後一口：杯底留香，把杯子放回桌上。'],
  coffee:[t=>`第一口：${t}還燙，小口啜。`,t=>'第二口：溫度剛好，香氣出來了。',t=>'最後一口：杯子空了，放回碟上。'] };
function coffeeLiquid(){ if(myCup.userData.liq) return myCup.userData.liq; let m=null; myCup.traverse(o=>{ if(o.isMesh&&o.geometry.type==='CircleGeometry') m=o; }); return myCup.userData.liq=m; }
// the cup in front of seat si right now: {g, liq, type, key, name}
function cupOf(si,mine){ if(si<0) return null; const st=SEATS[si]; if(!st) return null; const now=Date.now();
  if(st.kind==='gongfu'){ const S=sharedLatest('gf',myGF); if(!S||(now-S.at)/1000<22||(now-S.at)/1000>=TEA_LAST) return null; const i=GF_SEATS.indexOf(si); return i<0?null:{g:GF_CUPS[i],liq:GF_CUPS[i].userData.tea,type:'tea',key:'gf'+S.at,name:TEAS[S.t][0]}; }
  if(st.kind==='irori'){ const S=sharedLatest('ir',myIR); if(!S||(now-S.at)/1000<12||(now-S.at)/1000>=TEA_LAST) return null; const i=IRORI_SEATS.indexOf(si); return i<0?null:{g:IRORI_CUPS[i],liq:IRORI_CUPS[i].userData.tea,type:'tea',key:'ir'+S.at,name:TEAS[S.t][0]}; }
  if(st.kind==='modern'){ const S=sharedLatest('md',myMD); if(!S||(now-S.at)/1000<23||(now-S.at)/1000>=TEA_LAST) return null; const i=MODERN_SEATS.indexOf(si); const g=MD_FX.cupG[(i+1)%4]; return i<0||!g?null:{g,liq:g.userData.tea,type:'md',key:'md'+S.at,name:TEAS[S.t][0]}; }
  if(mine&&myDrink>=0&&myCup.visible) return {g:myCup,liq:coffeeLiquid(),type:'coffee',key:'cf'+myCoffeeAt,name:DRINKS[myDrink][0]};
  return null; }
function sipsLeft(c){ return mySip&&mySip.k===c.key?mySip.l:3; }
function takeSip(){ let c=cupOf(ME.seat,true); if(!c&&ME.seat<0&&myDrink>=0&&DRINKS[myDrink]) c={g:myCup,liq:coffeeLiquid(),type:'coffee',key:'cf'+myCoffeeAt,name:DRINKS[myDrink][0]}; if(!c){ toast(ME.seat<0?'先坐下或點杯咖啡。':'面前還沒有茶。'); return; }
  const left=sipsLeft(c); if(left<=0){ toast('杯子已經空了。'); return; } if(mySip&&mySip.k===c.key&&(Date.now()-mySip.a)/1000<SIP_T) return;
  mySip={k:c.key,l:left-1,a:Date.now(),s:ME.seat}; pushPresence(true);
  const txt=SIP_TEXT[c.type==='coffee'?'coffee':'tea'][3-left]; setTimeout(()=>toast(txt(c.name),4500),900); if(left===3) setTimeout(()=>FOOD.fx(c.type==='coffee'?['energy']:['energy','warm'],c.name),2400);
  try{ actx=actx||new (window.AudioContext||window.webkitAudioContext)(); actx.resume(); }catch{} noiseBurst(.45,650,.9,.03,1.1); noiseBurst(.04,3400,9,.06,SIP_T-.08); }
const _sv=new THREE.Vector3(), _sq=new THREE.Quaternion(), _sa=new THREE.Vector3();
function poseCup(c,st,t,level){ const g=c.g; if(!g.userData.rest||g===myCup) g.userData.rest=g.position.clone(); const R=g.userData.rest;
  const L=LIQ[c.type], liq=c.liq;
  if(liq){ if(level<=0) liq.visible=false; else { const i=3-level; liq.position.y=L.y[i]; liq.scale.setScalar(L.s[i]); } }
  if(t<0||t>=SIP_T){ g.position.copy(R); g.quaternion.identity(); return; }
  const ease=x=>x*x*(3-2*x), k=t<.8?ease(t/.8):t<2.2?1:1-ease((t-2.2)/.8), bump=t<.9||t>2.1?0:Math.sin((t-.9)/1.2*Math.PI);
  const fx=-Math.sin(st.yaw), fz=-Math.cos(st.yaw), rx=Math.cos(st.yaw), rz=-Math.sin(st.yaw), eye=(SEAT_KIND[st.kind]||{eye:1.1}).eye;
  _sv.set(st.x+fx*.24+rx*.03,eye-.13,st.z+fz*.24+rz*.03); g.position.lerpVectors(R,_sv,k);
  _sa.set(rx,0,rz); _sq.setFromAxisAngle(_sa,.85*bump); g.quaternion.copy(_sq); }
function tickSips(){ const now=Date.now(), done=new Set();
  // mine
  const c=cupOf(ME.seat,true);
  if(c){ const left=sipsLeft(c), t=mySip&&mySip.k===c.key?(now-mySip.a)/1000:-1; poseCup(c,SEATS[ME.seat],t,t>=0&&t<1.5?left+1:left); done.add(c.g); }
  // everyone else seated with a cup
  for(const [,o] of others){ const p=o.p||{}; if(typeof p.s!=='number'||p.s<0) continue; const oc=cupOf(p.s,false); if(!oc||done.has(oc.g)) continue;
    const sp=p.sp&&p.sp.k===oc.key?p.sp:null, left=sp?Math.max(0,Math.min(3,+sp.l||0)):3, t=sp?(now-(+sp.a||0))/1000:-1;
    poseCup(oc,SEATS[p.s],t,t>=0&&t<1.5?left+1:left); done.add(oc.g); }
  // the bar at the bottom left
  const bar=$('#drink'), show=!!c||myDrink>=0; if(bar.classList.contains('hide')===show) bar.classList.toggle('hide',!show);
  const left=c?sipsLeft(c):-1, label=c?(c.type==='coffee'?'☕ ':'🍵 ')+c.name+'　'+(left>0?'●'.repeat(left)+'○'.repeat(3-left):'已喝完'):myDrink>=0?'☕ '+DRINKS[myDrink][0]+'（坐下再喝）':'';
  if(tickSips.l!==label){ tickSips.l=label; $('#dname').textContent=label; }
  const sb=$('#dsip'), sv=!!c&&left>0; if(sb&&sb.classList.contains('hide')===sv) sb.classList.toggle('hide',!sv);
  const fb=$('#dfin'), fv=myDrink>=0; if(fb&&fb.classList.contains('hide')===fv) fb.classList.toggle('hide',!fv); }

await __yield(0.74);
// {% endraw %}
