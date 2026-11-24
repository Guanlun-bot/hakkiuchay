// {% raw %}
import * as THREE from 'three';
const libraryData = fetch('./vr-library.json').then(response => { if(!response.ok) throw Error('館藏載入失敗'); return response.text(); });
libraryData.catch(()=>{});
// ---- back-office data (vr/data.json, made by Jekyll from _data/vr.yml); empty when there is none
// building the house in steps: between them the page gets to draw (the gate's loading screen moves on)
const __yield=async p=>{ try{ window.__loadStep&&window.__loadStep(p); }catch{} await new Promise(r=>setTimeout(r,30)); };
const VRD=await (async()=>{ try{ const c=new AbortController(), t=setTimeout(()=>c.abort(),2500); const r=await fetch('data.json',{signal:c.signal}); clearTimeout(t); if(!r.ok) return {}; const j=await r.json(); return j&&typeof j==='object'?j:{}; }catch{ return {}; } })();
const VRT={}; for(const e of (Array.isArray(VRD.texts)?VRD.texts:[])) if(e&&e.key) VRT[e.key]=e;
const vrParas=t=>String(t||'').trim().split(/\n\s*\n/).map(p=>'<p style="line-height:2">'+p.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])).replace(/\n/g,'<br>')+'</p>').join('');
function vrTex(key,fallback,aspect){ const url=VRD.images&&VRD.images[key]; const tex=new THREE.TextureLoader().load(url||fallback,t=>{ if(!url) return; const a=t.image.width/t.image.height; if(a>aspect){ t.repeat.set(aspect/a,1); t.offset.set((1-aspect/a)/2,0); } else { t.repeat.set(1,a/aspect); t.offset.set(0,(1-a/aspect)/2); } t.needsUpdate=true; }); tex.colorSpace=THREE.SRGBColorSpace; return tex; }

/* ---------------- data ---------------- */
const rawData = await libraryData;
const preview = rawData === '__DA'+'TA__' || rawData === '';
const D = preview ? {
  books: [], posts: [], hou: [],
  quote: '應無所住而生其心', quote_src: '金剛經',
  intro: '學鳩齋位於左護龍，與右護龍知了間隔著天井相望。前大廳與後大廳居於中軸，四棟由轉角廊道相連。你可以到書架前看看，也可以坐在藤椅上望向庭院。'
} : JSON.parse(rawData);
const BOOKS = D.books; // [title, author, year, publisher, top, sub, kind, lang]
const POSTS = D.posts;
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const LS = { get(k){ try{return localStorage.getItem(k)}catch{return null} }, set(k,v){ try{localStorage.setItem(k,v)}catch{} } };
const isTouch = matchMedia('(pointer:coarse)').matches;
const S = isTouch ? 0.6 : 1;                     // texture scale
function hash(s){ let h=2166136261; for (const ch of String(s)) h=Math.imul(h^ch.codePointAt(0),16777619); return h>>>0; }
function rnd(seed){ let s=seed>>>0||1; return ()=>{ s^=s<<13; s^=s>>>17; s^=s<<5; return ((s>>>0)%100000)/100000; }; }

/* Taipei time, day/night like the website (06–18 day) */
const now = new Date(new Date().toLocaleString('en-US',{timeZone:'Asia/Taipei'}));
const NIGHT = location.hash==='#night' ? true : location.hash==='#day' ? false : (now.getHours()<6 || now.getHours()>=18);
const CN = '〇一二三四五六七八九十';
const cnNum = n => n<=10?CN[n]:(n<20?'十'+(n%10?CN[n%10]:''):CN[Math.floor(n/10)]+'十'+(n%10?CN[n%10]:''));
const HOU = (()=>{ const m=now.getMonth()+1,d=now.getDate(); let cur=D.hou[D.hou.length-1] || [0,0,'','','節候資料待匯入'];
  for (const h of D.hou){ if (h[0]<m || (h[0]===m && h[1]<=d)) cur=h; } return {term:cur[2],hou:cur[3],yu:cur[4]}; })();
$('#today').textContent = `${cnNum(now.getMonth()+1)}月${cnNum(now.getDate())}日・${HOU.term}${HOU.hou}・${HOU.yu}`;

/* ---------------- renderer / scene ---------------- */
const canvas = $('#c');
const renderer = new THREE.WebGLRenderer({canvas, antialias:true}); renderer.localClippingEnabled=true;   // seated figures are cut at the hip
renderer.setPixelRatio(Math.min(devicePixelRatio, isTouch?1.25:1.5));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = NIGHT ? 1.05 : 1.0;
renderer.xr.enabled = true;
const MAXANI = renderer.capabilities.getMaxAnisotropy();

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(NIGHT?0x1a2236:0xd8d7d0, 500, 24000);
const fovFor=a=>a<1?82:68;
const camera = new THREE.PerspectiveCamera(fovFor(innerWidth/innerHeight), innerWidth/innerHeight, 0.05, 60000);
const rig = new THREE.Group(); rig.add(camera); scene.add(rig);

await __yield(0.08);
/* ---------------- procedural textures ---------------- */
function ctex(w,h,draw,{rep=[1,1],color=true}={}){
  const c=document.createElement('canvas'); c.width=w; c.height=h; const g=c.getContext('2d'); draw(g,w,h);
  const t=new THREE.CanvasTexture(c); if(color) t.colorSpace=THREE.SRGBColorSpace;
  t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(rep[0],rep[1]); t.anisotropy=MAXANI; return t;
}
function speck(g,w,h,n,cols,a,r=[1,3]){ const R=rnd(n*7+w); for(let i=0;i<n;i++){ g.globalAlpha=a*R(); g.fillStyle=cols[Math.floor(R()*cols.length)]; const s=r[0]+R()*(r[1]-r[0]); g.fillRect(R()*w,R()*h,s,s);} g.globalAlpha=1; }
const shade = (hex,f)=>{ const c=new THREE.Color(hex); c.offsetHSL(0,0,f); return '#'+c.getHexString(); };

const T = {};
T.brick = ctex(512,512,(g,w,h)=>{
  g.fillStyle='#ded6c9'; g.fillRect(0,0,w,h);
  const random=rnd(11);
  const colors=['#985740','#92503b','#a2644c','#8e4938','#a86a50'];
  for(let row=0;row<12;row++){
    for(let col=-1;col<4;col++){
      const x=col*128+(row%2)*64,y=row*h/12;
      g.fillStyle=shade(colors[Math.floor(random()*colors.length)],(random()-.5)*.075);
      g.fillRect(x+1.5,y+1.5,125,h/12-3);
      g.fillStyle='rgba(235,183,150,.22)'; g.fillRect(x+2,y+1.5,124,1);
      g.fillStyle='rgba(78,45,34,.15)'; g.fillRect(x+2,y+h/12-2.5,124,1);
    }
  }
  speck(g,w,h,8500,['#724839','#e3ad90','#765e50'],.20,[1,4]);
});
T.white = ctex(512,512,(g,w,h)=>{ g.fillStyle='#e8e2d4'; g.fillRect(0,0,w,h); const R=rnd(5);
  for(let i=0;i<60;i++){ const x=R()*w,y=R()*h,r=20+R()*90; const gr=g.createRadialGradient(x,y,0,x,y,r); gr.addColorStop(0,'rgba(150,135,110,.08)'); gr.addColorStop(1,'rgba(150,135,110,0)'); g.fillStyle=gr; g.fillRect(x-r,y-r,2*r,2*r);} speck(g,w,h,1500,['#b9ae98','#fffaf0'],.25); });
T.tile = ctex(512,512,(g,w,h)=>{ g.fillStyle='#7c3a2b'; g.fillRect(0,0,w,h); const R=rnd(3);
  for(let i=0;i<2;i++)for(let j=0;j<2;j++){ g.fillStyle=shade('#b05a40',(R()-.5)*.1); g.fillRect(i*256+4,j*256+4,248,248);
    for(let k=0;k<14;k++){ const x=i*256+10+R()*236,y=j*256+10+R()*236,r=10+R()*50; const gr=g.createRadialGradient(x,y,0,x,y,r); gr.addColorStop(0,`rgba(${R()<.5?'90,40,28':'210,140,110'},.18)`); gr.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=gr; g.fillRect(x-r,y-r,2*r,2*r);} }
  speck(g,w,h,3000,['#5c2a1f','#d79a7c'],.3); });
T.yard = ctex(512,512,(g,w,h)=>{ g.fillStyle='#8a4a38'; g.fillRect(0,0,w,h); const R=rnd(9);
  for(let r=0;r<8;r++)for(let c=0;c<4;c++){ const off=(r%2)*64; g.fillStyle=shade('#a75a42',(R()-.5)*.14); g.fillRect(c*128+off+3-((c*128+off)>=w?w:0),r*64+3,122,58);}
  speck(g,w,h,3500,['#4e261c','#c98a70','#6b6b55'],.35); });
T.wood = ctex(256,512,(g,w,h)=>{ g.fillStyle='#5a3825'; g.fillRect(0,0,w,h); const R=rnd(21);
  for(let i=0;i<90;i++){ g.strokeStyle=`rgba(${R()<.5?'30,16,8':'120,80,50'},${.1+R()*.2})`; g.lineWidth=1+R()*2; g.beginPath(); let x=R()*w; g.moveTo(x,0); for(let y=0;y<=h;y+=32){ x+=(R()-.5)*3; g.lineTo(x,y);} g.stroke(); } });
T.woodDark = ctex(256,512,(g,w,h)=>{ g.fillStyle='#3a2418'; g.fillRect(0,0,w,h); const R=rnd(23);
  for(let i=0;i<80;i++){ g.strokeStyle=`rgba(${R()<.5?'12,6,3':'90,60,40'},${.12+R()*.2})`; g.lineWidth=1+R()*2; g.beginPath(); let x=R()*w; g.moveTo(x,0); for(let y=0;y<=h;y+=32){ x+=(R()-.5)*3; g.lineTo(x,y);} g.stroke(); } });
T.doorWood = ctex(512,1024,(g,w,h)=>{ const R=rnd(57), P=4, pw=w/P;
  for(let p=0;p<P;p++){ g.fillStyle=shade('#6c4a30',(R()-.5)*.1); g.fillRect(p*pw,0,pw,h);
    for(let i=0;i<34;i++){ g.strokeStyle=`rgba(${R()<.55?'40,22,10':'150,110,75'},${.14+R()*.24})`; g.lineWidth=.8+R()*1.8; g.beginPath(); let x=p*pw+R()*pw; g.moveTo(x,0); for(let y=0;y<=h;y+=24){ x+=(R()-.5)*2.4; x=Math.max(p*pw+2,Math.min((p+1)*pw-2,x)); g.lineTo(x,y);} g.stroke(); }
    for(let k=0;k<2;k++){ const kx=p*pw+pw*(.25+R()*.5), ky=R()*h; for(let r=3;r<16;r+=3){ g.strokeStyle=`rgba(45,26,12,${.4-r*.015})`; g.lineWidth=1.2; g.beginPath(); g.ellipse(kx,ky,r*.55,r*1.6,0,0,Math.PI*2); g.stroke(); } }
    g.fillStyle='rgba(45,26,14,.75)'; g.fillRect(p*pw,0,2,h); }
  speck(g,w,h,900,['#3a2414','#9a7a58'],.18); });
// 觀音山石 / granite: cool pale grey, fine dark and light grains, a few pits; the same picture drives the bump map
function graniteDraw(g,w,h){ g.fillStyle='#d9d8d4'; g.fillRect(0,0,w,h); const R=rnd(91);
  for(let i=0;i<7000;i++){ const v=R(); g.fillStyle=v<.45?'rgba(90,90,92,.55)':v<.8?'rgba(140,138,134,.5)':v<.95?'rgba(245,244,240,.7)':'rgba(30,30,32,.7)'; const s=.6+R()*1.8; g.fillRect(R()*w,R()*h,s,s); }
  for(let i=0;i<60;i++){ g.fillStyle=`rgba(70,70,72,${.15+R()*.25})`; g.beginPath(); g.arc(R()*w,R()*h,1+R()*2.2,0,Math.PI*2); g.fill(); }
  for(let i=0;i<14;i++){ g.strokeStyle=`rgba(120,118,112,${.08+R()*.1})`; g.lineWidth=6+R()*14; g.beginPath(); g.moveTo(R()*w,R()*h); g.lineTo(R()*w,R()*h); g.stroke(); } }
T.granite=ctex(256,256,graniteDraw); T.graniteBump=ctex(256,256,graniteDraw,{color:false});
// wood with a straight vertical grain: fine lines, slow colour drift, a few flecks; bump from the same lines
function grainDraw(base,dark,light,seed,{planks=1,wear=false,lines=150}={}){ return (g,w,h)=>{ const R=rnd(seed), pw=w/planks;
  g.fillStyle=base; g.fillRect(0,0,w,h);
  for(let p=0;p<planks;p++){ g.fillStyle=`rgba(${R()<.5?'0,0,0':'255,230,200'},${R()*.06})`; g.fillRect(p*pw,0,pw,h);
    for(let i=0;i<lines/planks;i++){ g.strokeStyle=R()<.6?`rgba(${dark},${.1+R()*.25})`:`rgba(${light},${.06+R()*.14})`; g.lineWidth=.5+R()*1.4; g.beginPath(); let x=p*pw+R()*pw; g.moveTo(x,0);
      for(let y=0;y<=h;y+=16){ x+=(R()-.5)*1.2; x=Math.max(p*pw+1,Math.min((p+1)*pw-1,x)); g.lineTo(x,y); } g.stroke(); }
    if(planks>1){ g.fillStyle=`rgba(${dark},.85)`; g.fillRect(p*pw,0,1.5,h); } }
  if(wear){ // worn edges: the lacquer rubbed thin along the borders and round the middle where hands push
    for(let i=0;i<260;i++){ const side=R(), d=Math.pow(R(),3)*.05, x=side<.25?d*w:side<.5?w-d*w:R()*w, y=side>=.5&&side<.75?d*h:side>=.75?h-d*h:R()*h;
      g.fillStyle=`rgba(${R()<.6?'120,72,40':'60,30,18'},${.15+R()*.35})`; g.beginPath(); g.ellipse(x,y,1+R()*4,2+R()*9,0,0,Math.PI*2); g.fill(); }
    for(let i=0;i<40;i++){ g.fillStyle=`rgba(130,80,46,${.05+R()*.12})`; g.beginPath(); g.ellipse(w*(.2+R()*.6),h*(.45+R()*.12),2+R()*8,3+R()*10,0,0,Math.PI*2); g.fill(); } } }; }
const DOOR_DRAW=grainDraw('#7a2021','40,8,8','160,70,60',63,{planks:4,wear:true,lines:220});
T.doorRed=ctex(256,1024,DOOR_DRAW); T.doorRedBump=ctex(256,1024,grainDraw('#808080','0,0,0','255,255,255',63,{planks:4,wear:true,lines:220}),{color:false});
T.cypress=ctex(256,512,grainDraw('#5c3a21','30,16,6','140,96,60',71,{lines:140})); T.cypressBump=ctex(256,512,grainDraw('#808080','0,0,0','255,255,255',71,{lines:140}),{color:false});
T.cypressDark=ctex(256,512,grainDraw('#4e2f1a','24,12,4','120,80,48',73,{lines:140}));
T.boards = ctex(512,512,(g,w,h)=>{ const R=rnd(31); for(let i=0;i<8;i++){ g.fillStyle=shade('#4a2f1f',(R()-.5)*.08); g.fillRect(0,i*64,w,62); g.fillStyle='#24160d'; g.fillRect(0,i*64+62,w,2);} speck(g,w,h,1200,['#1b0f08','#6e4a33'],.3); });
T.roof = ctex(512,512,(g,w,h)=>{
  const random=rnd(41);
  for(let row=0;row<8;row++){
    for(let col=0;col<8;col++){
      const x=col*64,y=row*64;
      const clay=shade('#a66a50',(random()-.5)*.19);
      const light=g.createLinearGradient(x,0,x+64,0);
      light.addColorStop(0,'#67463a'); light.addColorStop(.17,clay);
      light.addColorStop(.45,shade(clay,.12)); light.addColorStop(.68,clay);
      light.addColorStop(1,'#634337');
      g.fillStyle=light; g.fillRect(x,y,64,64);
      g.fillStyle='rgba(53,31,25,.24)'; g.fillRect(x,y+61,64,3);
    }
  }
  speck(g,w,h,6500,['#503e36','#d19977','#82786c'],.24,[1,5]);
});
T.rattan = ctex(256,256,(g,w,h)=>{ g.fillStyle='#b8925a'; g.fillRect(0,0,w,h); for(let i=0;i<w;i+=8){ g.fillStyle=i%16?'#a07a44':'#cfa86e'; g.fillRect(i,0,4,h); g.fillRect(0,i,w,3);} });
function texRep(t,rx,ry){ const c=t.clone(); c.needsUpdate=true; c.repeat.set(rx,ry); return c; }
function std(t,rx=1,ry=1,o={}){ return new THREE.MeshStandardMaterial(Object.assign({map:texRep(t,rx,ry),roughness:.92,metalness:0},o)); }
const M = {
  wood: new THREE.MeshStandardMaterial({map:T.wood,roughness:.7}),
  woodDark: new THREE.MeshStandardMaterial({map:T.woodDark,roughness:.6}),
  lacquer: new THREE.MeshStandardMaterial({color:0x2a1c16,roughness:.35}),
  red: new THREE.MeshStandardMaterial({color:0x9a2a24,roughness:.5,emissive:0x5a0a06,emissiveIntensity:NIGHT?1.4:.5}),
  paper: new THREE.MeshStandardMaterial({color:0xf3eddc,roughness:.95}),
  cloth: new THREE.MeshStandardMaterial({color:0x2c3e55,roughness:.95}),
  ink: new THREE.MeshStandardMaterial({color:0x1d1d1f,roughness:.4}),
  rattan: new THREE.MeshStandardMaterial({map:T.rattan,roughness:.8}),
  celadon: new THREE.MeshStandardMaterial({color:0x9fb8a6,roughness:.25}),
  leaf: new THREE.MeshStandardMaterial({color:0x4d6a3a,roughness:.9,flatShading:true}),
  bark: new THREE.MeshStandardMaterial({color:0x4a3a2c,roughness:1}),
};

/* ---------------- helpers ---------------- */
const pickables = [];
function box(w,h,d,mat,x,y,z,parent=scene,pick=null){ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat); m.position.set(x,y,z); parent.add(m); if(pick){ m.userData=pick; pickables.push(m);} return m; }
function textCanvas(w,h,draw){ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=MAXANI; return t; }
function vtext(g,str,x,y,fs,maxY,step=1.08){ g.textAlign='center'; g.textBaseline='top'; for(const ch of str){ if(y+fs>maxY) break; if(/[ー─—\-–]/.test(ch)){ g.save(); g.translate(x,y+fs/2); g.rotate(Math.PI/2); g.textBaseline='middle'; g.fillText(ch,0,0); g.restore(); } else if(/[（(〈《「『【]/.test(ch)||/[）)〉》」』】]/.test(ch)){ g.save(); g.translate(x,y+fs/2); g.rotate(Math.PI/2); g.textBaseline='middle'; g.fillText(ch,0,0); g.restore(); } else g.fillText(ch,x,y); y+=fs*step; } return y; }
const F = (w,s)=>`${w} ${s}px "Noto Serif TC","Songti TC",serif`;

await __yield(0.12);
/* ---------------- architecture ---------------- */
// Room: x -8..8, z -4..4, with the courtyard to the south (+z).
const roomWidthScale=.92;
const mainHall=new THREE.Group();
mainHall.scale.x=roomWidthScale;
scene.add(mainHall);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(16,8), std(T.tile,20,10)); floor.rotation.x=-Math.PI/2; floor.userData={type:'floor'}; mainHall.add(floor); pickables.push(floor);
const yard = new THREE.Mesh(new THREE.PlaneGeometry(24,11), std(T.yard,12,5.5)); yard.rotation.x=-Math.PI/2; yard.position.set(0,-0.02,9.8); yard.userData={type:'floor'}; scene.add(yard); pickables.push(yard);
const BLOCK={type:'block'};
const stone = new THREE.MeshStandardMaterial({map:T.granite,bumpMap:T.graniteBump,bumpScale:1.2,color:0xa8a6a1,roughness:.85,metalness:0});
const trim = new THREE.MeshStandardMaterial({color:0xb4ad98,roughness:.88});
const ridgeClay = new THREE.MeshStandardMaterial({color:0xa06148,roughness:.84});
const timber = new THREE.MeshStandardMaterial({color:0x583f34,roughness:.8});
const sillBrick = std(T.brick,3,.55);
const stonePaving = ctex(512,512,(g,w,h)=>{
  g.fillStyle='#77746e'; g.fillRect(0,0,w,h);
  const random=rnd(37);
  for(let row=0;row<4;row++){
    for(let x=-256;x<w;x+=256){
      g.fillStyle=shade('#a5a096',(random()-.5)*.12);
      g.fillRect(x+row%2*128+3,row*128+3,250,122);
    }
  }
  speck(g,w,h,2300,['#655b50','#e4d9c3'],.23);
});
const court = new THREE.Mesh(new THREE.PlaneGeometry(19.5,10.8),std(stonePaving,11,7));
court.rotation.x=-Math.PI/2;
court.position.set(0,-.01,9.82);
court.userData={type:'floor'};
scene.add(court);
pickables.push(court);

function column(x,z,height,parent=scene){
  box(.39,.24,.39,stone,x,.12,z,parent);
  const shaft=new THREE.Mesh(new THREE.CylinderGeometry(.115,.14,height-.24,12),timber);
  shaft.position.set(x,(height+.24)/2,z);
  parent.add(shaft);
  box(.33,.18,.33,M.woodDark,x,height-.08,z,parent);
}

function tiledRoof(parent,width,halfDepth,eave,rise,tip){
  const roof = std(T.roof,width/1.24,halfDepth/2.1);
  const underside = std(T.boards,width/2.2,halfDepth/2,{side:THREE.BackSide});
  const across=64, down=16;
  const mainRoof=tip>.3;
  const height=(u,v)=>eave+rise*(1-v)**1.26+
    tip*Math.abs(u)**8*(mainRoof ? (1-v)**2 : 1-.78*v)+
    (mainRoof ? .29*Math.abs(u)**10*v**3 : 0);
  const point=(u,v,side,lift=0)=>new THREE.Vector3(u*width/2,height(u,v)+lift,side*v*halfDepth);
  function edging(points,radius,material){
    const path=new THREE.CatmullRomCurve3(points);
    parent.add(new THREE.Mesh(new THREE.TubeGeometry(path,40,radius,8,false),material));
  }
  for(const side of [-1,1]){
    const positions=[],uvs=[],indices=[];
    for(let i=0;i<=across;i++){
      for(let j=0;j<=down;j++){
        positions.push(...point(2*i/across-1,j/down,side).toArray());
        uvs.push(i/across,j/down);
        if(i<across&&j<down){
          const a=i*(down+1)+j,b=a+down+1;
          indices.push(...(side===1?[a,a+1,b,b,a+1,b+1]:[a,b,a+1,b,b+1,a+1]));
        }
      }
    }
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const outer = new THREE.Mesh(geometry,roof);
    parent.add(outer);
    const inner = new THREE.Mesh(geometry,underside);
    inner.position.y=-.11;
    parent.add(inner);
    for(const end of [-1,1]){
      edging(Array.from({length:13},(_,j)=>point(end,j/12,side,.055)),.09,trim);
    }
  }
  { const a=new THREE.Object3D(); a.userData.roofAnchor={width,halfDepth,eave,rise,tip}; parent.add(a); }   // eaves: see buildEaves()
  edging(Array.from({length:41},(_,i)=>point(i/20-1,0,1,.07)),.13,ridgeClay);
  edging(Array.from({length:41},(_,i)=>point(i/20-1,0,1,.18)),.043,trim);
  if(mainRoof){
    // Extrude the continuous ridge-end profile so the fork reads in silhouette.
    for(const end of [-1,1]){
      const base=point(end,0,1,.07);
      const profile=new THREE.Shape();
      profile.moveTo(-.28,-.12);
      profile.bezierCurveTo(.05,-.16,.52,-.06,.91,.24);
      profile.quadraticCurveTo(1.05,.35,1.16,.50);
      profile.quadraticCurveTo(.83,.37,.55,.33);
      profile.bezierCurveTo(.72,.48,.88,.77,.94,1.03);
      profile.bezierCurveTo(.62,.74,.34,.36,-.28,-.02);
      profile.closePath();
      const tail=new THREE.Mesh(new THREE.ExtrudeGeometry(profile,{
        depth:.17,bevelEnabled:true,bevelThickness:.028,bevelSize:.022,bevelSegments:2,curveSegments:18
      }),ridgeClay);
      tail.position.set(base.x,base.y,-end*.085);
      tail.rotation.y=end===1 ? 0 : Math.PI;
      parent.add(tail);
    }
  }
}
const mBrick=(rx,ry)=>std(T.brick,rx,ry), mWhite=(rx,ry)=>std(T.white,rx,ry);
// Roof pitch: steep enough that the tiles and the eaves read from the courtyards, as on a 閩南 大厝.
const RISE=2.7, RK=RISE/1.28;
// back wall
box(16.6,0.9,0.3,mBrick(16,.9),0,0.45,-4.15,mainHall,BLOCK);
box(16.6,2.78,0.3,mWhite(8,1.7),0,2.29,-4.15,mainHall,BLOCK);
// Pale lime plaster over brick, with curved gables under the tile roof.
for(const sx of [-1,1]){
  box(.3,.9,8.6,mBrick(8.6,.9),sx*8.15,.45,0,mainHall,BLOCK);
  box(.3,2.78,8.6,mBrick(6.7,2.9),sx*8.15,2.29,0,mainHall,BLOCK);   // brick, so the inside corners of the courts show no pale strip
  const gable=new THREE.Shape();
  gable.moveTo(-4.3,3.62);
  for(let step=0;step<=24;step++){
    const z=-4.3+8.6*step/24;
    gable.lineTo(z,3.69+1.26*RK*(1-Math.abs(z)/5.02)**1.26);
  }
  gable.lineTo(4.3,3.62);
  gable.closePath();
  const face=new THREE.Mesh(new THREE.ShapeGeometry(gable),mWhite(2,1));
  face.material.side=THREE.DoubleSide;
  face.position.x=sx*8.15;
  face.rotation.y=Math.PI/2;
  mainHall.add(face);
}
// Projecting side bays frame the recessed central entrance.
const entryWall=4.15, bayEdge=3.16, facadeTop=3.69;
const stoneCourse=std(stonePaving,4,1,{color:0xa69d90});
function facadePanel(left,right,bottom,top,z,material,parent=mainHall){
  box(right-left,top-bottom,.30,material,(left+right)/2,(bottom+top)/2,z,parent,BLOCK);
}
var PATH_POSTS=null;   // the boardwalk's bollards (solid; set where they are built)
const WINDOWS=[];   // every square and octagonal window, for the bamboo blinds (buildBlinds)
function windowBay(left,right,center,width,z,low,high,parent=mainHall){ WINDOWS.push({k:'sq',parent,cx:center,z,w:width,y0:low,y1:high});
  const lo=center-width/2,hi=center+width/2;
  facadePanel(left,right,0,.78,z,stoneCourse,parent);
  for(const [a,b,y0,y1] of [[left,lo,.78,3.26],[hi,right,.78,3.26],[lo,hi,.78,low],[lo,hi,high,3.26]]){
    if(b-a>.001) facadePanel(a,b,y0,y1,z,mBrick((b-a)*.78,(y1-y0)*1.05),parent);
  }
  for(const x of [lo-.05,hi+.05]) box(.13,high-low+.24,.36,stone,x,(low+high)/2,z,parent);
  for(const y of [low-.07,high+.07]) box(width+.23,.13,.36,stone,center,y,z,parent);
  const bars=Math.max(4,Math.round(width/.22));
  for(let i=1;i<bars;i++){
    box(.085,high-low,.13,M.woodDark,lo+i*width/bars,(low+high)/2,z+.025,parent,BLOCK);
  }
}
for(const side of [-1,1]){
  const [outerLeft,outerRight]=side<0?[-8.3,-bayEdge]:[bayEdge,8.3];
  const [innerLeft,innerRight]=side<0?[-bayEdge,-1]:[1,bayEdge];
  windowBay(innerLeft,innerRight,side*2.02,1.50,entryWall,1.0,2.33);
  facadePanel(outerLeft,outerRight,3.26,facadeTop,entryWall,mBrick((outerRight-outerLeft)*.78,.45));   // brick right up to the eaves
}
facadePanel(-bayEdge,bayEdge,3.26,facadeTop,entryWall,mBrick(bayEdge*2*.78,.45));
facadePanel(-1,1,2.86,3.26,entryWall,mBrick(1.56,.4));
for(const x of [-1.08,1.08]) box(.19,2.89,.37,stone,x,1.445,entryWall,mainHall);
box(2.35,.17,.38,stone,0,2.91,entryWall,mainHall);
box(2.05,.3,.26,M.woodDark,0,.15,entryWall,mainHall);
const porch=new THREE.Mesh(new THREE.PlaneGeometry(6.32,1.12),std(stonePaving,3,1));
porch.rotation.x=-Math.PI/2;
porch.position.set(0,.018,4.54);
porch.userData={type:'floor'};
mainHall.add(porch); pickables.push(porch);
// Close the wall heads with an opaque ceiling fitted inside the eaves.
tiledRoof(mainHall,18.02,5.62,3.50,RISE,.65);
// Open roof (徹上明造): purlins follow the tile curve, tie beams and struts carry them.
{ const under=v=>3.50+RISE*(1-v)**1.26-.11;
  for(let k=0;k<=8;k++){ const v=k/11; for(const side of (k?[-1,1]:[1])){
    const p=new THREE.Mesh(new THREE.CylinderGeometry(k?.07:.11,k?.07:.11,16.3,12),M.woodDark);
    p.rotation.z=Math.PI/2; p.position.set(0,under(v)-(k?.075:.1),side*v*5.62); mainHall.add(p); } }
  for(const x of [-6.2,-2.1,2.1,6.2]){
    box(.17,.25,8.0,M.woodDark,x,3.48,0,mainHall);              // 大通
    box(.15,.17,4.4,M.woodDark,x,3.50+.44*RK,0,mainHall);              // 二通
    for(const z of [-1.9,1.9]) box(.14,.34*RK,.14,M.woodDark,x,3.50+.18*RK,z,mainHall);   // 瓜筒
    box(.12,.56*RK,.12,M.woodDark,x,3.50+.80*RK,0,mainHall);              // 脊下短柱
  } }
/* Identical ranges rotated about the centre of the court. */
const courtAxis=9.8;
const hallOffset=courtAxis;
const axialHalls=[];
const SIDE_SCALE=.64;   // shorter side halls so they sit between the two long halls
function matchingRange(x,z,rotation){
  const range=mainHall.clone(true);
  range.position.set(x,0,z);
  range.rotation.y=rotation;
  range.traverse(mesh=>{
    if(mesh.userData.type==='floor'||mesh.userData.type==='block') pickables.push(mesh);
  });
  scene.add(range);
  // the copy has the hall's own windows too (those by the entrance): list them for the blinds with the copy as parent
  for(const W of WINDOWS.filter(W=>W.parent===mainHall)) WINDOWS.push(Object.assign({},W,{parent:range}));
  return range;
}
const oppositeWing=matchingRange(0,2*courtAxis,Math.PI);
// 第二進 (south of the 南廳, world +x): its east and west wings are built to the same spec as 學鳩齋 and 知了間
const FIRST={cx:2*courtAxis, x0:13.95, x1:25.1, z0:4.15, z1:2*courtAxis-4.15, gate:25.1, fx0:46.84, fx1:53.3};
// 第一進 (the new front court, three-sided): its wings repeat the 第二進 wings one bay (19.6 m) further south; the 埕 runs from the 過廳 to the street
const FRONT={cx:4*courtAxis, x0:33.7, x1:46.84};
const firstWings=[matchingRange(FIRST.cx,0,0),matchingRange(FIRST.cx,2*courtAxis,Math.PI)];
const frontWings=[matchingRange(FRONT.cx,0,0),matchingRange(FRONT.cx,2*courtAxis,Math.PI)];
for(const side of [-1,1]){
  const hall=matchingRange(side*hallOffset,courtAxis,-side*Math.PI/2);
  hall.scale.x=SIDE_SCALE;
  hall.userData.side=true;
  axialHalls.push({hall,name:side===-1?'前大廳':'後大廳'});
}
const gateHall=matchingRange(2*FIRST.cx-hallOffset,courtAxis,-Math.PI/2); gateHall.scale.x=SIDE_SCALE; gateHall.userData.side=true;
// Recessed corner galleries with low hipped roofs beneath the adjoining eaves.
const cornerInner=4.56, cornerOuter=7.64;
const cornerSpan=cornerOuter-cornerInner;
var PINE=null, LANTERNS=[], EARLY_OBST=[];
// Outer windows, built per building so each one meets its corner:
// the long halls are only visible up to where the side halls start; the side halls show their whole front.
function outerWindows(g,c0,c1){ for(const side of [-1,1]){ const [L,R]=side<0?[-8.3,-bayEdge]:[bayEdge,8.3];
  windowBay(L,R,side*(c0+c1)/2,c1-c0,entryWall,1.04,2.37,g); } }
{ const cornerLocal=(courtAxis-entryWall-.0)/roomWidthScale;   // where a side hall's front meets the long hall
  outerWindows(mainHall,cornerLocal-1.12,cornerLocal-.02); outerWindows(oppositeWing,cornerLocal-1.12,cornerLocal-.02);
  for(const {hall} of axialHalls) outerWindows(hall,6.35,8.12);
  outerWindows(gateHall,6.35,8.12);
  for(const w of [...firstWings,...frontWings]) outerWindows(w,cornerLocal-1.12,cornerLocal-.02); }
// A second street front on the back of a hall: the same brick bays, barred windows, stone-framed door, beam and
// trim as the courtyard fronts, with a plaque over the door left blank for now.
function facadeAt(g,sg){ const z=sg*entryWall, gone=[];
  g.children.forEach(m=>{ const p=m.geometry&&m.geometry.parameters; if(m.isMesh&&p&&p.width>16&&Math.abs(m.position.z-z)<.01&&m.position.y<3) gone.push(m); });
  for(const m of gone){ g.remove(m); const i=pickables.indexOf(m); if(i>=0) pickables.splice(i,1); }
  for(const side of [-1,1]){ const [oL,oR]=side<0?[-8.3,-bayEdge]:[bayEdge,8.3], [iL,iR]=side<0?[-bayEdge,-1]:[1,bayEdge];
    windowBay(iL,iR,side*2.02,1.50,z,1.0,2.33,g); windowBay(oL,oR,side*(6.35+8.12)/2,8.12-6.35,z,1.04,2.37,g);
    facadePanel(oL,oR,3.26,facadeTop,z,mBrick((oR-oL)*.78,.45),g); }
  facadePanel(-bayEdge,bayEdge,3.26,facadeTop,z,mBrick(bayEdge*2*.78,.45),g); facadePanel(-1,1,2.86,3.26,z,mBrick(1.56,.4),g);
  for(const x of [-1.08,1.08]) box(.19,2.89,.37,stone,x,1.445,z,g);
  box(2.35,.17,.38,stone,0,2.91,z,g); box(2.05,.3,.26,M.woodDark,0,.15,z,g);
  const pl=new THREE.Group(); pl.position.set(0,3.34,sg*4.36); if(sg<0) pl.rotation.y=Math.PI; g.add(pl);
  box(1.5,.52,.05,M.woodDark,0,0,0,pl); box(1.36,.38,.02,new THREE.MeshStandardMaterial({color:0x2a201a,roughness:.6}),0,0,.03,pl);
  const porch=new THREE.Mesh(new THREE.PlaneGeometry(6.32,1.12),std(stonePaving,3,1)); porch.rotation.x=-Math.PI/2; porch.position.set(0,.018,sg*4.54); porch.userData={type:'floor'}; g.add(porch); pickables.push(porch); }
facadeAt(axialHalls[1].hall,-1);   // 南廳, toward the 第二進
facadeAt(gateHall,-1);             // 過廳 (once the 門廳), toward the 第一進
// The three halls on the axis (正廳, 南廳, 過廳) are the side-wing build squeezed to 0.64 of its length, which also squeezed
// their doors to 1.28 m. Rebuild each hall door at the 1.84 m of the wing doors: take out the door bay (inner windows,
// door frame, lintel, sill) and build it again with a wider opening; the inner windows narrow a little to fit beside it.
const HALL_DOOR=1.84/2/SIDE_SCALE;   // half the opening, in the hall's own (squeezed) units
function widenHallDoor(g,z){ const D=HALL_DOOR, gone=[];
  g.children.forEach(m=>{ if(m.isMesh&&Math.abs(m.position.z-z)<.1&&m.position.y<3.26&&Math.abs(m.position.x)<bayEdge-.01) gone.push(m); });
  for(const m of gone){ g.remove(m); const i=pickables.indexOf(m); if(i>=0) pickables.splice(i,1); }
  const w=1.2, c=(D+bayEdge)/2+.02;
  for(const side of [-1,1]) windowBay(side<0?-bayEdge:D,side<0?-D:bayEdge,side*c,w,z,1.0,2.33,g);
  facadePanel(-D,D,2.86,3.26,z,mBrick(2*D*.78,.4),g);
  for(const x of [-D-.08,D+.08]) box(.19,2.89,.37,stone,x,1.445,z,g);
  box(2*D+.35,.17,.38,stone,0,2.91,z,g); box(2*D+.05,.3,.26,M.woodDark,0,.15,z,g); }
for(const {hall} of axialHalls) widenHallDoor(hall,entryWall);
widenHallDoor(axialHalls[1].hall,-entryWall); widenHallDoor(gateHall,entryWall); widenHallDoor(gateHall,-entryWall);
// Two-leaf board doors with a traditional sliding bar (門閂) on the inside. The leaves: dark cinnabar (暗硃砂) lacquer over
// Taiwan cypress, the grain upright, half-matte like raw lacquer, worn along the edges.
const DOOR_LEAF=new THREE.MeshStandardMaterial({map:T.doorRed,bumpMap:T.doorRedBump,bumpScale:.9,roughness:.4,metalness:0});
const DOORS={};
function buildDoors(g,key,hw=1){
  const pick={type:'door',key}, plank=DOOR_LEAF, iron=new THREE.MeshStandardMaterial({color:0x2a2724,metalness:.6,roughness:.5});
  const leaves=[];
  for(const side of [-1,1]){ const pv=new THREE.Group(); pv.position.set(side*.985*hw,0,4.0); pv.scale.x=hw; g.add(pv);
    const leaf=box(.97,2.78,.055,plank,-side*.485,1.45,0,pv,pick);
    for(const y of [.55,1.3,2.05]) box(.9,.09,.03,M.woodDark,-side*.485,y,-.04,pv);               // battens inside
    for(const y of [1.17,1.33]) box(.06,.07,.06,M.woodDark,-side*.12,y-.08+.08,-.06,pv);          // bar brackets
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.045,.008,8,20),iron); ring.position.set(-side*.86,1.25,.04); pv.add(ring);
    const plate=cylinder(.03,.03,.01,iron,-side*.86,1.29,.035,pv); plate.rotation.x=Math.PI/2;
    for(let r=0;r<3;r++) for(let c=0;c<3;c++){ const n=new THREE.Mesh(new THREE.SphereGeometry(.012,8,6),iron); n.position.set(-side*(.25+c*.25),.5+r*.85,.032); pv.add(n); }   // door studs
    leaves.push({pv,side}); }
  // the bar: across both leaves when shut, leaning against the wall when open
  const bar=box(1.5*hw,.075,.075,new THREE.MeshStandardMaterial({map:T.wood,color:0x7a5236,roughness:.7}),0,1.25,3.89,g,pick);
  DOORS[key]={leaves,bar,open:true,k:1,barK:0,rest:key==='S'?{x:1.95,y:.82,z:3.78}:{x:1.9,y:.04,z:3.7}};
}
buildDoors(mainHall,'S'); buildDoors(oppositeWing,'N');
for(const side of [-1,1]) buildDoors(axialHalls[side<0?0:1].hall,side<0?'W':'E',HALL_DOOR);
DOORS.N.fold=Math.PI-.16;   // 知了間: the leaves fold back flat against the front wall, so the entrance view stays open
function doorPose(d){ // k: 1 open, 0 shut; barK: 1 bar in, 0 bar stored
  if(d.pose) return d.pose(d);
  for(const {pv,side} of d.leaves) pv.rotation.y=-side*(d.fold||Math.PI/2-.12)*d.k;
  const b=d.bar, t=d.barK, r=d.rest; b.position.set(r.x*(1-t), r.y+(1.25-r.y)*t, r.z+(3.89-r.z)*t); }
// Every other opening gets the same two-leaf board door with a bar (門閂) on its inner side (numbers as in the
// room-and-door plan): the hall and wing doors, the doors between rooms, and the gate in the low front wall.
// Each door stands in its own group: the wall at local z=0, the inside toward -z; it is shut (and blocks the way)
// only by someone inside. All start open.
const DOOR_BLOCKS=[]; let NPC_WALK=false;   // true while the household moves: they open a shut door as they come to it
function addDoor(key,x,z,rot,half,h,wallT,inside){
  const g=new THREE.Group(); g.position.set(x,0,z); g.rotation.y=rot; scene.add(g);
  const pick={type:'door',key}, plank=DOOR_LEAF, iron=new THREE.MeshStandardMaterial({color:0x2a2724,metalness:.6,roughness:.5});
  const zi=-(wallT/2+.03), lw=half-.006, lh=h-.1, leaves=[];
  for(const side of [-1,1]){ const pv=new THREE.Group(); pv.position.set(side*half,0,zi); g.add(pv);
    box(lw,lh,.05,plank,-side*lw/2,lh/2+.05,0,pv,pick);
    for(const f of [.2,.5,.8]) box(lw-.08,.08,.03,M.woodDark,-side*lw/2,.05+lh*f,-.04,pv);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.04,.007,8,18),iron); ring.position.set(-side*(lw-.1),.05+lh*.5,.035); pv.add(ring);
    leaves.push({pv,side}); }
  const by=Math.min(1.2,.05+lh*.5), bl=2*half*.8, inZ=zi-.09;
  const bar=box(bl,.07,.07,new THREE.MeshStandardMaterial({map:T.wood,color:0x7a5236,roughness:.7}),0,by,inZ,g,pick);
  const rest={x:half+.12+bl/2,y:.04,z:zi-.3};
  DOORS[key]={leaves,bar,open:true,k:1,barK:0,inside,pose(d){ for(const {pv,side} of d.leaves) pv.rotation.y=-side*(Math.PI/2-.12)*d.k;
    const t=d.barK; d.bar.position.set(rest.x*(1-t),rest.y+(by-rest.y)*t,rest.z+(inZ-rest.z)*t); }};
  const alongZ=Math.abs(Math.sin(rot))>.5;
  DOOR_BLOCKS.push(alongZ?{key,x0:x-.15,x1:x+.15,z0:z-half,z1:z+half}:{key,x0:x-half,x1:x+half,z0:z-.15,z1:z+.15}); }
{ const A=courtAxis, P=Math.PI, inHall=(x0,x1)=>p=>p.x>x0&&p.x<x1&&Math.abs(p.z-A)<5.3;
  // hall doors (1.84 m)
  addDoor('d11',13.95,A,P/2,.92,2.82,.3,inHall(5.65,13.95));
  addDoor('d20',25.25,A,-P/2,.92,2.82,.3,inHall(25.25,33.55));
  addDoor('d23',33.55,A,P/2,.92,2.82,.3,inHall(25.25,33.55));
  // wing doors of the 第二進 and 第一進 (the 明間 behind each)
  for(const [cx,w,e] of [[2*A,'d14','d17'],[4*A,'d26','d29']]){
    addDoor(w,cx,2*A-4.15,P,.92,2.82,.3,p=>p.z>2*A-4.15&&Math.abs(p.x-cx)<2.65);
    addDoor(e,cx,4.15,0,.92,2.82,.3,p=>p.z<4.15&&Math.abs(p.x-cx)<2.65); }
}
for(const k in DOORS) doorPose(DOORS[k]);
// Low stone edging and a grass surface that stays walkable.
const lawnTexture=ctex(512,512,(g,w,h)=>{
  g.fillStyle='#657e34'; g.fillRect(0,0,w,h);
  const random=rnd(94);
  const greens=['#466129','#54702e','#789640','#8ca54d','#a0af57','#364f24'];
  for(let i=0;i<18500;i++){
    const x=random()*w,y=random()*h;
    g.strokeStyle=greens[Math.floor(random()*greens.length)];
    g.lineWidth=.55+random()*1.4;
    g.beginPath(); g.moveTo(x,y);
    g.lineTo(x+(random()-.5)*5,y-1-random()*7); g.stroke();
  }
});
{ const L=FIRST, W=L.x1-L.x0, D=L.z1-L.z0;
  const lawn=new THREE.Mesh(new THREE.PlaneGeometry(W+.6,D+.4),std(lawnTexture,W/2.2,D/2.2)); lawn.rotation.x=-Math.PI/2; lawn.position.set((L.x0+L.x1)/2,-.012,courtAxis); lawn.userData={type:'floor'}; scene.add(lawn); pickables.push(lawn); FIRST.lawn=lawn;
  FIRST.built=true; }
{ const W=FRONT.x1-FRONT.x0, D=FIRST.z1-FIRST.z0;   // grass for the 第一進 埕 as well
  const lawn=new THREE.Mesh(new THREE.PlaneGeometry(W+.3,D+.4),std(lawnTexture,W/2.2,D/2.2)); lawn.rotation.x=-Math.PI/2; lawn.position.set((FRONT.x0+FRONT.x1)/2+.15,-.012,courtAxis); lawn.userData={type:'floor'}; scene.add(lawn); pickables.push(lawn); FRONT.lawn=lawn; }
// {% endraw %}
