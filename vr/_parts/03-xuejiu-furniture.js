// {% raw %}
/* ---------------- plaques & scrolls ---------------- */
function plaque(text,w,h,{font='Reisho',bg='#1f1915',fg='#c9a45c',size=.62,frame='#7a5a2e'}={}){
  text=[...text].reverse().join('');   // 匾額一律右起，一律日本隷書
  const pw=Math.round(1024*S*w/Math.max(w,h)*1.0), ph=Math.round(pw*h/w);
  return textCanvas(pw,ph,(g,W,H)=>{ g.fillStyle=frame; g.fillRect(0,0,W,H); g.fillStyle=bg; const b=Math.max(6,H*.07); g.fillRect(b,b,W-2*b,H-2*b);
    g.fillStyle=fg; g.textAlign='center'; g.textBaseline='middle'; let fs=H*size; g.font=`${fs}px Reisho`;
    const chars=[...text.replace(/歷/g,'歴')], gap=chars.length<=4?1.3:1.02, cell=ch=>(ch==='　'||ch==='・')?fs*.5:fs*gap;
    let total=chars.reduce((a,c)=>a+cell(c),0); if(total>W*.9){ fs*=W*.9/total; g.font=`${fs}px Reisho`; total=chars.reduce((a,c)=>a+cell(c),0); }
    let x=(W-total)/2; const y=H/2+fs*.04;
    for(const ch of chars){ const cw=cell(ch);
      if(ch==='跤'){ g.save(); g.translate(x+cw*.27,y); g.scale(.5,1); g.fillText('足',0,0); g.restore(); g.save(); g.translate(x+cw*.73,y); g.scale(.56,1); g.fillText('交',0,0); g.restore(); }
      else if(ch!=='　') g.fillText(ch,x+cw/2,y);
      x+=cw; } });
}
function plaqueMesh(tex,w,h,x,y,z,ry,parent=scene,pick=null){ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,0.06),[M.lacquer,M.lacquer,M.lacquer,M.lacquer,new THREE.MeshStandardMaterial({map:tex,roughness:.45}),M.lacquer]); m.position.set(x,y,z); m.rotation.y=ry; parent.add(m); if(pick){m.userData=pick;pickables.push(m);} return m; }

/* ---------------- 獺祭魚 bookcases ---------------- */
const TOPS=['總類','哲學與心理學','宗教','自然科學','應用科學','社會科學','歷史學','地理與旅遊','語言與文學','藝術與休閒'];
const byTop={}; TOPS.forEach(t=>byTop[t]=[]);
BOOKS.forEach((b,i)=>byTop[b[4]].push(i));
const sortKey=i=>{ const b=BOOKS[i]; return (b[5]||'')+'\u0000'+b[0]; };
for(const t of TOPS) byTop[t].sort((a,b)=>sortKey(a).localeCompare(sortKey(b),'zh-Hant'));
const hist=byTop['歷史學'], third=Math.ceil(hist.length/3);
const CASES=[
  {label:'總類・哲學與心理學', cats:[['總類',byTop['總類']],['哲學與心理學',byTop['哲學與心理學']]], pos:[-7.79,0,-0.4], ry:Math.PI/2},
  {label:'宗教', cats:[['宗教',byTop['宗教']]]},
  {label:'自然・應用・社會科學', cats:[['自然科學',byTop['自然科學']],['應用科學',byTop['應用科學']],['社會科學',byTop['社會科學']]]},
  {label:'歷史學　一', cats:[['歷史學',hist.slice(0,third)]]},
  {label:'歷史學　二', cats:[['歷史學',hist.slice(third,2*third)]]},
  {label:'歷史學　三', cats:[['歷史學',hist.slice(2*third)]]},
  {label:'語文・地理・藝術', cats:[['語言與文學',byTop['語言與文學']],['地理與旅遊',byTop['地理與旅遊']],['藝術與休閒',byTop['藝術與休閒']]]},
];
CASES.slice(1).forEach((c,k)=>{ c.pos=[[-6.65,-4.61,-2.57,2.57,4.61,6.65][k],0,-3.79]; c.ry=0; });
const CW=1.86, CH=2.55, ROWS=8, ROWH=CH/ROWS, CY0=0.14;
const SPINE=['#2f3e52','#5a2e26','#3d4a33','#6b4a2a','#26343a','#7a3b2e','#3e5873','#4a3b52','#8a6a3a','#2e2a26','#5b6152','#9b7e55','#3a2a22','#6e2e32','#d8cdb2','#c9b48a','#b9a98a','#e2d8c0','#40525e','#7b5b44'];
const isCJK = s => /[\u3040-\u30ff\u3400-\u9fff\uf900-\ufaff]/.test(s);
const bookIndex = new Map(); // book i -> {caseIdx, x0,x1,y0,y1}
const caseObjs=[];
function lum(hex){ const c=new THREE.Color(hex); return .3*c.r+.59*c.g+.11*c.b; }

function drawCase(ci){
  const C=CASES[ci], W=Math.round(1900*S), H=Math.round(W*CH/CW), ppm=W/CW;
  const cv=document.createElement('canvas'); cv.width=W; cv.height=H; const g=cv.getContext('2d');
  const bg=g.createLinearGradient(0,0,0,H); bg.addColorStop(0,'#1c130d'); bg.addColorStop(1,'#2a1c12'); g.fillStyle=bg; g.fillRect(0,0,W,H);
  const rowH=H/ROWS, board=0.026*ppm;
  for(let r=0;r<ROWS;r++){ const sh=g.createLinearGradient(0,r*rowH,0,(r+1)*rowH); sh.addColorStop(0,'rgba(0,0,0,.45)'); sh.addColorStop(.25,'rgba(0,0,0,0)'); g.fillStyle=sh; g.fillRect(0,r*rowH,W,rowH); }
  // items: label slips + books
  const items=[]; for(const [name,list] of C.cats){ items.push({label:name}); for(const i of list) items.push({i}); }
  const wOf=it=>{ if(it.label) return 0.055; const h=hash(BOOKS[it.i][0]); return 0.021+((h%997)/997)*0.024; };
  let total=items.reduce((s,it)=>s+wOf(it)+0.0012,0); const cap=ROWS*(CW-0.04)*0.985;
  const k=Math.min(1.55,cap/total);
  let r=0,x=0.02*ppm; const layout=[];
  for(const it of items){ const w=wOf(it)*k*ppm; if(x+w>W-0.02*ppm){ r++; x=0.02*ppm; if(r>=ROWS){ console.warn('overflow',C.label); break; } }
    const base=(r+1)*rowH-board;
    if(it.label){ const hh=Math.min(rowH-board-0.03*ppm,0.2*ppm); g.fillStyle='#efe6cf'; g.fillRect(x+1,base-hh,w-2,hh); g.fillStyle='#a8343a'; g.font=F(700,Math.min(w*0.62,26*S)); vtext(g,it.label,x+w/2,base-hh+6*S,Math.min(w*0.62,26*S),base-4*S); }
    else { const b=BOOKS[it.i], h=hash(b[0]+b[1]); const col=SPINE[h%SPINE.length]; const bh=Math.min(rowH-board-0.025*ppm,(0.19+((h>>>8)%100)/100*0.1)*ppm);
      const y0=base-bh; const gr=g.createLinearGradient(x,0,x+w,0); gr.addColorStop(0,shade(col,-.08)); gr.addColorStop(.35,shade(col,.05)); gr.addColorStop(1,shade(col,-.12)); g.fillStyle=gr; g.fillRect(x,y0,w-1,bh);
      if((h>>>3)%3===0){ g.fillStyle='rgba(0,0,0,.25)'; g.fillRect(x,y0+bh*.06,w-1,bh*.02); g.fillRect(x,y0+bh*.9,w-1,bh*.02); }
      const light=lum(col)>.55; g.fillStyle=light?'#2a2420':(b[6]==='電'?'#e9e1cd':'#f1e3c2');
      const fs=Math.max(8*S,Math.min(w*0.56,24*S));
      if(w>=9*S){ const t=b[0].replace(/\s+/g,' ').trim();
        if(isCJK(t)){ g.font=F(600,fs); const yEnd=vtext(g,t,x+w/2,y0+fs*.7,fs,y0+bh-(b[1]?fs*2.6:fs*.6));
          if(b[1] && yEnd<y0+bh-fs*2.2){ g.font=F(400,fs*.62); vtext(g,b[1].split(/[、,，]/)[0],x+w/2,y0+bh-fs*2.1,fs*.62,y0+bh-fs*.2,1.05); } }
        else { g.save(); g.translate(x+w/2,y0+fs*.5); g.rotate(Math.PI/2); g.font=F(600,fs*.8); g.textBaseline='middle'; g.textAlign='left'; let s=t; const max=bh-fs; while(s.length>1 && g.measureText(s).width>max) s=s.slice(0,-2); if(s!==t) s=s.replace(/\s*$/,'…'); g.fillText(s,0,0); g.restore(); } }
      const rec={ci,x0:x,x1:x+w,y0,y1:base}; layout.push([it.i,rec]); bookIndex.set(it.i,rec); }
    x+=w+0.0012*ppm; }
  for(let rr=0;rr<ROWS;rr++){ g.fillStyle='#4a2e1c'; g.fillRect(0,(rr+1)*rowH-board,W,board); }
  const tex=new THREE.CanvasTexture(cv); tex.colorSpace=THREE.SRGBColorSpace; tex.anisotropy=MAXANI;
  return {tex,W,H,ppm,layout};
}
function buildCase(ci){
  const C=CASES[ci]; const grp=new THREE.Group(); grp.position.set(...C.pos); grp.rotation.y=C.ry; mainHall.add(grp);
  const info=drawCase(ci);
  const face=new THREE.Mesh(new THREE.PlaneGeometry(CW,CH),new THREE.MeshStandardMaterial({map:info.tex,roughness:.85})); face.position.set(0,CY0+CH/2,-0.13); face.userData={type:'shelf',ci}; grp.add(face); pickables.push(face);
  const fr={type:'case',ci};
  box(0.06,2.86,0.42,M.wood,-CW/2-0.03,1.43,0,grp,fr); box(0.06,2.86,0.42,M.wood,CW/2+0.03,1.43,0,grp,fr);
  box(CW+0.12,0.08,0.44,M.wood,0,2.86,0,grp,fr); box(CW+0.12,0.14,0.42,M.wood,0,0.07,0,grp,fr); box(CW,CH,0.02,M.woodDark,0,CY0+CH/2,-0.2,grp);
  for(let r=1;r<ROWS;r++) box(CW,0.026,0.34,M.wood,0,CY0+CH-r*ROWH+0.013-0.026,0.03,grp);
  const lab=new THREE.Mesh(new THREE.PlaneGeometry(.96,.095),new THREE.MeshStandardMaterial({map:plaque(C.label,.96,.095,{font:'serif',bg:'#e6dcc4',fg:'#3f3a39',size:.62,frame:'#4a2e1c'}),roughness:.8}));
  lab.position.set(0,2.757,.2); lab.userData=fr; grp.add(lab); pickables.push(lab);
  caseObjs[ci]={grp,face,info};
}
function buildPerimeterShelves(){
  function shelf(x,z,rotation,width,rows,source){
    const group=new THREE.Group();
    group.position.set(x,0,z);
    group.rotation.y=rotation;
    mainHall.add(group);
    const height=rows*.32;
    const depth=.30;
    box(width+.08,.10,depth+.06,M.woodDark,0,.05,0,group);
    box(width+.08,.065,depth+.07,M.woodDark,0,height+.11,0,group);
    for(const dx of [-width/2,width/2])
      box(.045,height+.10,depth,M.wood,dx,(height+.10)/2,0,group);
    const map=caseObjs[source].info.tex.clone();
    map.repeat.y=rows/ROWS;
    map.needsUpdate=true;
    const spines=new THREE.Mesh(new THREE.PlaneGeometry(width,height),
      new THREE.MeshStandardMaterial({map,roughness:.88}));
    spines.position.set(0,.10+height/2,-.10);
    group.add(spines);
    for(let row=1;row<rows;row++) box(width,.029,depth,M.wood,0,.10+row*.32,0,group);
  }
  // Close seams with fitted stiles and continuous top and bottom rails.
  for(const x of [-7.93,-5.63,-3.59,3.59,5.63,7.93])
    box(x===-7.93||x===7.93?.61:.072,2.91,.40,M.woodDark,x,1.455,-3.79,mainHall);
  for(const y of [.055,2.90]){
    for(const x of [-5.08,5.08]) box(6.09,.085,.46,M.woodDark,x,y,-3.79,mainHall);
    for(const x of [-7.77,7.77]) box(.48,.085,7.96,M.woodDark,x,y,0,mainHall);
  }
  // The display alcove is framed by the same cabinet finish.
  box(3.14,2.28,.065,M.wood,0,1.96,-4.045,mainHall);
  for(const x of [-1.57,1.57]) box(.10,2.91,.40,M.woodDark,x,1.455,-3.79,mainHall);
  for(const [z,width] of [[-3.86,.36],[-1.58,.27],[.73,.31],[3.57,.1]])
    box(.40,2.91,width,M.woodDark,-7.79,1.455,z,mainHall);
  for(const [z,width] of [[-3.6,.8],[-.19,.06],[1.19,.06],[2.57,.06],[3.96,.08]])
    box(.47,2.91,width,M.woodDark,7.74,1.455,z,mainHall);
  // Extend the west-wall shelving on either side of the existing case.
  shelf(-7.79,-2.72,Math.PI/2,1.98,8,1);
  shelf(-7.79,2.2,Math.PI/2,2.64,8,5);
  // East wall, door side of the article cabinets: one more full-height bookcase.
  shelf(7.79,-1.71,-Math.PI/2,2.94,8,4);
  box(.46,.085,3.0,M.woodDark,7.77,2.90,-1.71,mainHall);
  box(.46,.085,3.0,M.woodDark,7.77,.055,-1.71,mainHall);
  // A shared cornice brings the east-wall article cabinets up to the library shelf line.
  box(.35,.075,4.15,M.woodDark,7.74,2.97,1.88,mainHall);
  for(const [z,source] of [[.5,2],[1.88,3],[3.26,6]]){
    const map=caseObjs[source].info.tex.clone();
    map.repeat.y=1/ROWS;
    map.needsUpdate=true;
    const books=new THREE.Mesh(new THREE.PlaneGeometry(1.28,.22),
      new THREE.MeshStandardMaterial({map,roughness:.88}));
    books.rotation.y=-Math.PI/2;
    books.position.set(7.63,2.80,z);
    mainHall.add(books);
    box(.32,.05,1.32,M.wood,7.74,2.675,z,mainHall);
  }
}
function bookWorld(i){ const rec=bookIndex.get(i); if(!rec) return null; const o=caseObjs[rec.ci]; const {W,H}=o.info;
  const lx=-CW/2+((rec.x0+rec.x1)/2)/W*CW, ly=CY0+CH-((rec.y0+rec.y1)/2)/H*CH; const p=new THREE.Vector3(lx,ly,-0.12); o.grp.localToWorld(p);
  return {p,w:(rec.x1-rec.x0)/W*CW*(rec.ci===0 ? 1 : roomWidthScale),h:(rec.y1-rec.y0)/H*CH,ci:rec.ci}; }

/* ---------------- 三櫃：自反軒・拈花記・大樹跤 ---------------- */
const CAB=[{cat:'academic',name:'自反軒',col:'#3e5873',z:0.5},{cat:'study-talks',name:'拈花記',col:'#3d6b4f',z:1.88},{cat:'life',name:'大樹跤',col:'#86683c',z:3.26}];
const CABW=1.32;
const postsBy=c=>POSTS.map((p,i)=>[p,i]).filter(([p])=>p.cat===c).sort((a,b)=>b[0].date.localeCompare(a[0].date));
function bookFront(title,col){ return textCanvas(Math.round(160*S),Math.round(260*S),(g,w,h)=>{ g.fillStyle=col; g.fillRect(0,0,w,h); speck(g,w,h,400,['#000','#fff'],.08);
  g.fillStyle='#f2ead6'; const sw=w*.34, sx=w*.58; g.fillRect(sx,h*.07,sw,h*.8); g.fillStyle='#2a2420'; const fs=Math.min(sw*.72,22*S); g.font=F(600,fs);
  vtext(g,title.replace(/[【】]/g,'').replace(/\s/g,''),sx+sw/2,h*.09,fs,h*.86,1.04); }); }
function buildCabinets(){ CAB.forEach((c,ci)=>{ const grp=new THREE.Group(); grp.position.set(7.74*roomWidthScale,0,c.z); grp.rotation.y=-Math.PI/2; scene.add(grp);
  const pick={type:'cab',ci}; const wd=CABW,ht=2.35; const perRow=Math.floor((wd-.16)/.21);
  box(0.06,ht,0.5,M.woodDark,-wd/2,ht/2,0,grp,pick); box(0.06,ht,0.5,M.woodDark,wd/2,ht/2,0,grp,pick); box(wd+0.06,0.06,0.5,M.woodDark,0,ht,0,grp,pick); box(wd,0.12,0.5,M.woodDark,0,0.06,0,grp,pick);
  box(wd,ht,0.02,M.woodDark,0,ht/2,-0.24,grp,pick);
  const shelves=[0.12,0.68,1.24,1.8]; shelves.forEach(y=>box(wd,0.04,0.46,M.woodDark,0,y,0,grp));
  const list=postsBy(c.cat); let slot=0;
  for(const [p,pi] of list){ const row=Math.floor(slot/perRow), col=slot%perRow; if(row>=3) break; const y=shelves[2-row]+0.02+0.135; const x=-wd/2+0.17+col*0.21;
    const mats=[M.cloth,M.cloth,M.paper,M.paper,new THREE.MeshStandardMaterial({map:bookFront(p.title,new THREE.Color(c.col).multiplyScalar(.75).getStyle()),roughness:.9}),M.cloth];
    const b=new THREE.Mesh(new THREE.BoxGeometry(0.17,0.27,0.2),mats); b.position.set(x,y,0.06); b.rotation.y=(hash(p.slug)%7-3)*0.015; b.userData={type:'post',pi}; grp.add(b); pickables.push(b); slot++; }
  // decor
  const R=rnd(ci+9); const stack=(x,y,n)=>{ for(let k=0;k<n;k++){ const b=box(0.24,0.028,0.17,k%3?M.paper:M.cloth,x+(R()-.5)*.02,y+0.016+k*0.03,0.02,grp); b.rotation.y=(R()-.5)*.08; } };
  stack(wd/2-.25,shelves[3],2+Math.floor(R()*4));
  const bookRow=(yy,x0,x1)=>{ let x=x0; while(x<x1){ const w=.022+R()*.03, h=.19+R()*.1; if(x+w>x1) break;
      const b=box(w,h,.17,new THREE.MeshStandardMaterial({color:SPINE[Math.floor(R()*SPINE.length)],roughness:.85}),x+w/2,yy+.02+h/2,.02,grp); if(R()<.06){ b.rotation.z=.18; x+=.03; } x+=w+.002; if(R()<.05) x+=.06; } };
  for(const yy of [shelves[0],shelves[1]]) bookRow(yy,-wd/2+.04,wd/2-.04);
  { const used=Math.min(list.length,perRow); if(used<perRow) bookRow(shelves[2],-wd/2+.07+used*.21,wd/2-.04); }
  const vase=new THREE.Mesh(new THREE.LatheGeometry([0,.05,.075,.065,.03,.035,.045].map((r,i)=>new THREE.Vector2(r,i*0.045))),M.celadon); vase.position.set(-wd/2+.3,shelves[3]+0.02,0.05); grp.add(vase);
  const pt=plaque(c.name,1.0,0.3,{font:'serif',bg:'#1f1915',fg:'#e2cfa0',size:.56,frame:c.col}); plaqueMesh(pt,1.0,0.3,0,2.53,.085,0,grp,pick); }); }

/* ---------------- 學鳩齋 plaque, 獺祭魚 plaque, scrolls ---------------- */
// Three hand-drawn clerical-script characters, positioned in reading order.
const CLERICAL_STROKES = {
  '學': [
    'M10 13 Q19 12 28 8 M12 14 L12 34 L28 34 M13 23 L25 23',
    'M36 9 L54 20 M54 9 L36 20 M36 22 L54 33 M54 22 L36 33',
    'M62 11 L78 11 L78 34 L62 34 M65 22 L77 22',
    'M10 38 Q9 45 5 49 M10 42 L85 42 Q84 46 80 49',
    'M27 52 L62 52 Q54 58 45 60 L45 77 Q44 81 35 77',
    'M10 65 Q47 64 80 64 Q85 64 90 61'
  ],
  '鳩': [
    'M4 25 L32 24 L31 58 Q30 65 35 65 L43 65',
    'M21 13 Q20 47 5 68',
    'M60 9 L54 17 M48 19 L48 56 L83 56 Q82 73 75 77 L70 76',
    'M48 19 L78 19 L76 38 L48 38 M49 28 L76 28',
    'M49 47 Q70 47 83 45',
    'M47 63 Q46 69 42 72 M56 64 L58 71 M64 64 L67 71 M72 63 L76 69'
  ],
  '齋': [
    'M41 8 Q49 11 50 16 M7 20 Q48 20 82 19 Q87 19 92 16',
    'M28 23 L16 35 M19 24 L31 32 M64 23 L77 34 M77 23 L63 32',
    'M38 24 Q45 35 55 38 M56 24 Q50 34 38 40',
    'M15 43 L15 58 M24 43 L24 55 M73 43 L73 55 M83 42 L83 58',
    'M12 60 Q30 59 34 58 M63 58 Q74 59 88 58',
    'M34 49 Q49 48 63 48 M48 50 L48 77',
    'M39 57 L35 65 L62 65 M30 72 Q53 72 68 70'
  ]
};
function exteriorNameplate(){
  const texture=textCanvas(Math.round(900*S),Math.round(290*S),(g,w,h)=>{
    g.fillStyle='#5a3b2e'; g.fillRect(0,0,w,h);
    g.fillStyle='#a17d50'; g.fillRect(h*.04,h*.04,w-h*.08,h-h*.08);
    const lacquer=g.createLinearGradient(0,0,0,h);
    lacquer.addColorStop(0,'#342820'); lacquer.addColorStop(1,'#211c18');
    g.fillStyle=lacquer; g.fillRect(h*.07,h*.07,w-h*.14,h-h*.14);
    speck(g,w,h,2500,['#7d654c','#130f0c'],.18,[1,4]);
    // traditional plaques read right to left
    const fs=h*.62; g.font=`${fs}px Reisho`; g.textAlign='center'; g.textBaseline='middle';
    [...'學鳩齋'].forEach((ch,i)=>{ const x=w*(.78-i*.28), y=h*.53;
      g.fillStyle='#5e4424'; g.fillText(ch,x+fs*.02,y+fs*.03);
      const gold=g.createLinearGradient(0,y-fs/2,0,y+fs/2); gold.addColorStop(0,'#e6c98e'); gold.addColorStop(1,'#b38a4f');
      g.fillStyle=gold; g.fillText(ch,x,y); });
  });
  plaqueMesh(texture,1.76,.51,0,3.34,4.35,0,mainHall,{type:'about'});
}
function inkLandscape(g,w,h){
  const R=rnd(1372);
  g.fillStyle='#e6d9bb'; g.fillRect(0,0,w,h); speck(g,w,h,1800,['#b8a582','#f4ead2'],.18,[1,3]);
  const wash=(y0,amp,alpha,dark)=>{ g.beginPath(); g.moveTo(0,h); let y=y0; for(let x=0;x<=w;x+=8){ y=y0-amp*Math.abs(Math.sin(x/w*Math.PI*(1.2+R()*.1)))-R()*6; g.lineTo(x,y);} g.lineTo(w,h); g.closePath();
    g.fillStyle=`rgba(${dark},${alpha})`; g.fill(); };
  // far shore, water, near bank (一河兩岸)
  wash(h*.36,h*.08,.16,'70,62,50'); wash(h*.38,h*.04,.12,'40,36,30');
  g.fillStyle='#e6d9bb'; g.fillRect(0,h*.42,w,h*.22);
  g.strokeStyle='rgba(60,52,42,.35)'; g.lineWidth=1; for(let i=0;i<14;i++){ const y=h*.44+R()*h*.18, x=R()*w*.8; g.beginPath(); g.moveTo(x,y); g.lineTo(x+20+R()*50,y+R()*2); g.stroke(); }
  wash(h*.78,h*.07,.22,'60,52,42');
  // sparse trees on the near bank
  for(let t=0;t<5;t++){ const x=w*(.18+t*.11+R()*.04), base=h*.77, top=h*(.5+R()*.08);
    g.strokeStyle='rgba(35,30,25,.85)'; g.lineWidth=2.4; g.beginPath(); g.moveTo(x,base); g.quadraticCurveTo(x+(R()-.5)*14,(base+top)/2,x+(R()-.5)*8,top); g.stroke();
    for(let k=0;k<26;k++){ const yy=top+R()*(base-top)*.55, xx=x+(R()-.5)*34; g.fillStyle=`rgba(30,26,22,${.25+R()*.5})`; g.fillRect(xx,yy,2+R()*3,1.5+R()*2); } }
  // the empty pavilion
  const px=w*.68, py=h*.74; g.strokeStyle='rgba(35,30,25,.9)'; g.lineWidth=1.6;
  g.beginPath(); g.moveTo(px-26,py-36); g.lineTo(px,py-48); g.lineTo(px+26,py-36); g.moveTo(px-20,py-36); g.lineTo(px-20,py); g.moveTo(px+20,py-36); g.lineTo(px+20,py); g.moveTo(px-24,py); g.lineTo(px+24,py); g.stroke();
  // inscription and seal
  g.fillStyle='rgba(40,34,28,.85)'; const fs=w*.055; g.font=F(400,fs);
  vtext(g,'容膝齋圖',w*.86,h*.06,fs,h*.3);
  g.fillStyle='#a8343a'; g.fillRect(w*.83,h*.3,w*.065,w*.065);
}
function hangLibraryScroll(){
  const backing=new THREE.Mesh(new THREE.PlaneGeometry(.97,2.38),
    new THREE.MeshStandardMaterial({color:0x8a8067,roughness:.96}));
  backing.position.set(0,2.34,-3.98);
  mainHall.add(backing);
  const scroll=new THREE.Mesh(new THREE.PlaneGeometry(.79,1.93),
    new THREE.MeshStandardMaterial({color:0xe8dcc1,roughness:.96}));
  scroll.position.set(0,2.40,-3.973);
  new THREE.TextureLoader().load(
    'scroll-hall.jpg',
    texture=>{
      texture.colorSpace=THREE.SRGBColorSpace;
      scroll.material.color.setHex(0xffffff);
      scroll.material.map=texture;
      scroll.material.needsUpdate=true;
    },undefined,()=>{
      scroll.material.map=textCanvas(400,820,inkLandscape);
      scroll.material.color.setHex(0xffffff);
      scroll.material.needsUpdate=true;
    });
  mainHall.add(scroll);
  for(const y of [1.15,3.53]) box(1.06,.05,.06,M.woodDark,0,y,-3.96,mainHall);
  // 對聯: 上聯 on the right as you face the wall, 下聯 on the left; same height and rods as the scroll
  const couplet=(text,x)=>{ const W=.3, H=1.93;
    const tex=textCanvas(Math.round(220*S),Math.round(220*S*H/(W-.06)),(g,w,h)=>{ g.fillStyle='#ece2c8'; g.fillRect(0,0,w,h);
      const R=rnd(text.length*7+(x>0?1:2)); for(let i=0;i<180;i++){ g.fillStyle=`rgba(196,160,72,${.25+R()*.45})`; const sz=1+R()*3.5*S; g.fillRect(R()*w,R()*h,sz,sz*.7); }
      g.fillStyle='#1f1a17'; g.textAlign='center'; g.textBaseline='middle'; const step=h/7.3, fs=Math.min(w*.8,step*.92); g.font=`${fs}px Reisho`;
      [...text].forEach((ch,i)=>g.fillText(ch,w/2,step*.65+i*step)); });
    const back=new THREE.Mesh(new THREE.PlaneGeometry(W+.04,2.38),new THREE.MeshStandardMaterial({color:0x8a8067,roughness:.96})); back.position.set(x,2.34,-3.98); mainHall.add(back);
    const paper=new THREE.Mesh(new THREE.PlaneGeometry(W-.06,H),new THREE.MeshStandardMaterial({map:tex,roughness:.95})); paper.position.set(x,2.40,-3.973); mainHall.add(paper);
    for(const y of [1.15,3.53]) box(W+.1,.05,.06,M.woodDark,x,y,-3.96,mainHall); };
  couplet('學古窮源觀物變',.86/roomWidthScale);
  couplet('鳩書養拙任天真',-.86/roomWidthScale);
}
function buildPlaques(){
  exteriorNameplate();
  hangLibraryScroll();
  const sign=(name,parent,z,y)=>plaqueMesh(
    plaque(name,1.8,.40,{font:'serif',bg:'#432d24',fg:'#eed5a6',size:.64,frame:'#9b7046'}),
    1.8,.40,0,y,z,0,parent,name==='知了間'?{type:'zhiliao'}:null);
  sign('知了間',oppositeWing,4.35,3.34);
  // 正廳 plaque: 龍江衍派 in the calligraphy the owner chose (vr/plaque-longjiang.png, read right to left), in the manner of
  // Kinmen and Taiwan hall plaques: gilt characters on a deep maroon lacquer board, framed by a band of small glazed
  // tiles (cream and grey, a red-brown tile every few). The hall is squeezed sideways, so the plaque is scaled back.
  for(const {hall,name} of axialHalls) if(name==='前大廳'){ const W=2.0, H=.5, pw=2000, ph=500;
    const tex=textCanvas(pw,ph,(g,w,h)=>{ const R=rnd(31), t=17, rows=2, b=t*rows+6;
      g.fillStyle='#6f6a62'; g.fillRect(0,0,w,h);                                   // grout
      const tile=(x,y,i)=>{ const c=(i%7===3)?'#8c3b2c':(i%3===0)?'#a9a49a':'#e6dcc6'; g.fillStyle=c; g.fillRect(x+1.5,y+1.5,t-3,t-3); g.fillStyle='rgba(255,255,255,.18)'; g.fillRect(x+2,y+2,t-6,3); };
      let k=0; for(let r=0;r<rows;r++){ for(let x=0;x<w;x+=t){ tile(x,r*t+2,k++); tile(x,h-(r+1)*t-2,k++); } for(let y=rows*t+2;y<h-rows*t-2;y+=t){ tile(r*t+2,y,k++); tile(w-(r+1)*t-2,y,k++); } }
      g.fillStyle='#2b1210'; g.fillRect(b-4,b-4,w-2*b+8,h-2*b+8);                    // dark fillet
      g.fillStyle='#c9a24e'; g.fillRect(b-1,b-1,w-2*b+2,h-2*b+2);                    // thin gilt line
      const gr=g.createLinearGradient(0,b,0,h-b); gr.addColorStop(0,'#5e1d1b'); gr.addColorStop(.5,'#541918'); gr.addColorStop(1,'#4a1514');
      g.fillStyle=gr; g.fillRect(b+3,b+3,w-2*b-6,h-2*b-6);
      for(let i=0;i<500;i++){ g.fillStyle=`rgba(${R()<.5?'0,0,0':'255,200,180'},${.03+R()*.04})`; g.fillRect(b+R()*(w-2*b),b+R()*(h-2*b),1+R()*40,1); }   // lacquer grain
      });
    const img=new Image(); img.onload=()=>{ const c=tex.image, g=c.getContext('2d'), w=c.width, h=c.height, b=17*2+9, aw=w-2*b, ah=h-2*b;
      const k=Math.min(aw*.9/img.width,ah*.8/img.height), iw=img.width*k, ih=img.height*k, x=(w-iw)/2, y=(h-ih)/2;
      // gild the characters: a shadow cut into the lacquer, then the gold with a soft light from above
      const off=document.createElement('canvas'); off.width=Math.ceil(iw); off.height=Math.ceil(ih); const o=off.getContext('2d'); o.drawImage(img,0,0,iw,ih);
      o.globalCompositeOperation='source-in'; const gg=o.createLinearGradient(0,0,0,ih); gg.addColorStop(0,'#f2d27a'); gg.addColorStop(.55,'#d6a944'); gg.addColorStop(1,'#a87a2a'); o.fillStyle=gg; o.fillRect(0,0,iw,ih);
      const sh=document.createElement('canvas'); sh.width=off.width; sh.height=off.height; const so=sh.getContext('2d'); so.drawImage(img,0,0,iw,ih); so.globalCompositeOperation='source-in'; so.fillStyle='rgba(20,4,2,.75)'; so.fillRect(0,0,iw,ih);
      g.drawImage(sh,x+3,y+4); g.drawImage(off,x,y); tex.needsUpdate=true; };
    img.src='plaque-longjiang.png';
    const m=plaqueMesh(tex,W,H,0,3.34,4.35,0,hall); m.scale.x=1/(hall.scale.x||1); }   // 後大廳 has no plaque
plaqueMesh(plaque('獺祭魚書庫',1.6,0.4,{font:'Reisho',bg:'#efe6cf',fg:'#a8343a',size:.62,frame:'#5a3a26'}),1.6,0.4,-7.95*roomWidthScale,3.4,-0.4,Math.PI/2,scene,{type:'case',ci:0});
}

await __yield(0.4);
/* ---------------- desks, chairs, rattan chair, tea ---------------- */
const SEATS=[];
const OBST=[{x0:TREE.x-.30,x1:TREE.x+.30,z0:TREE.z-.30,z1:TREE.z+.30},{x0:-8.3*roomWidthScale,x1:-1.02*roomWidthScale,z0:4.08,z1:4.24},{x0:1.02*roomWidthScale,x1:8.3*roomWidthScale,z0:4.08,z1:4.24}];
OBST.push(...EARLY_OBST);
function chair(x,z,face){ const g=new THREE.Group(); g.position.set(x,0,z); g.rotation.y=face; scene.add(g); const si=SEATS.length; const pick={type:'seat',si};
  box(.50,.055,.46,M.woodDark,0,.47,0,g,pick);
  for(const x of [-.22,.22]){
    box(.045,.45,.045,M.woodDark,x,.225,-.19,g,pick);
    box(.045,1.08,.045,M.woodDark,x,.54,.20,g,pick);
    box(.031,.032,.38,M.wood,x,.20,0,g,pick);
  }
  box(.54,.055,.065,M.woodDark,0,1.085,.20,g,pick);
  box(.16,.49,.037,M.wood,0,.783,.20,g,pick);
  box(.40,.035,.039,M.woodDark,0,.21,-.19,g,pick);
  const cushion=box(.42,.018,.38,M.rattan,0,.504,-.012,g,pick);
  SEATS.push({x,z,yaw:face,g,cushion,name:null,kind:'desk'}); return si; }
const lampBrass=new THREE.MeshStandardMaterial({color:0x7e5c30,metalness:.52,roughness:.4});
const lampShade=new THREE.MeshStandardMaterial({color:0x465044,roughness:.59});
var LAMPS=[];
// pleated paper shade: a cone whose rim zig-zags in and out
function pleatedShade(rTop,rBot,h,mat,pleats=28){
  const geo=new THREE.CylinderGeometry(rTop,rBot,h,pleats*2,1,true); const p=geo.attributes.position, v=new THREE.Vector3();
  for(let i=0;i<p.count;i++){ v.fromBufferAttribute(p,i); const a=Math.atan2(v.z,v.x), k=Math.round((a+Math.PI)/(Math.PI/pleats)); const f=k%2?1.06:0.97; p.setXYZ(i,v.x*f,v.y,v.z*f); }
  geo.computeVertexNormals(); const m=new THREE.Mesh(geo,mat); return m; }
const lampBlack=new THREE.MeshStandardMaterial({color:0x1c1b1a,roughness:.45,metalness:.2});
const shadePaper=new THREE.MeshStandardMaterial({color:0xf6f1e6,roughness:.9,side:THREE.DoubleSide,emissive:0xffd9a8,emissiveIntensity:.6});
// porcelain cup and saucer with a gilt rim, for every coffee cup in the house
const porcelain=new THREE.MeshStandardMaterial({color:0xf7f3ea,roughness:.22,metalness:0});
const gilt=new THREE.MeshStandardMaterial({color:0xc9a24a,metalness:.8,roughness:.3});
const cupBand=new THREE.MeshStandardMaterial({color:0x2f4f86,roughness:.3});
const CUP_PROFILE=[[0,0],[.021,0],[.022,.006],[.017,.009],[.022,.016],[.032,.034],[.039,.056],[.043,.072],[.044,.075]].map(([r,y])=>new THREE.Vector2(r,y));
const SAUCER_PROFILE=[[0,0],[.028,0],[.03,.004],[.05,.008],[.066,.014],[.07,.017]].map(([r,y])=>new THREE.Vector2(r,y));
function classicCup(parent,x,y,z,{saucer=true,coffee=true,scale=1}={}){
  const g=new THREE.Group(); g.position.set(x,y,z); g.scale.setScalar(scale); parent.add(g);
  if(saucer){ const sc=new THREE.Mesh(new THREE.LatheGeometry(SAUCER_PROFILE,28),porcelain); sc.material.side=THREE.DoubleSide; g.add(sc);
    const rim=new THREE.Mesh(new THREE.TorusGeometry(.069,.0018,6,40),gilt); rim.rotation.x=Math.PI/2; rim.position.y=.017; g.add(rim); }
  const cy=saucer?.012:0;
  const cup=new THREE.Mesh(new THREE.LatheGeometry(CUP_PROFILE,28),porcelain); cup.material.side=THREE.DoubleSide; cup.position.y=cy; g.add(cup);
  const band=new THREE.Mesh(new THREE.CylinderGeometry(.0405,.0395,.008,28,1,true),cupBand); band.position.y=cy+.058; g.add(band);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(.0438,.0016,6,40),gilt); rim.rotation.x=Math.PI/2; rim.position.y=cy+.075; g.add(rim);
  const handle=new THREE.Mesh(new THREE.TorusGeometry(.015,.0045,8,16,Math.PI*1.35),porcelain); handle.position.set(.046,cy+.045,0); handle.rotation.z=-Math.PI*.68; g.add(handle);
  if(coffee){ const c=new THREE.Mesh(new THREE.CircleGeometry(.04,24),new THREE.MeshStandardMaterial({color:0x6a4426,roughness:.35})); c.rotation.x=-Math.PI/2; c.position.y=cy+.066; g.add(c); }
  return g; }
function deskLamp(lx,lz){
  const y=.82, li=LAMPS.length, pick={type:'lamp',li}, glow=shadePaper.clone();
  const base=new THREE.Mesh(new THREE.SphereGeometry(.075,24,10,0,Math.PI*2,0,Math.PI/2),lampBlack); base.scale.y=.7; base.position.set(lx,y,lz); base.userData=pick; scene.add(base);
  cylinder(.006,.006,.3,lampBlack,lx,y+.19,lz).userData=pick;
  const shade=pleatedShade(.045,.135,.16,glow); shade.position.set(lx,y+.36,lz); shade.userData=pick; scene.add(shade);
  const hit=new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,.48,10),new THREE.MeshBasicMaterial({visible:false})); hit.position.set(lx,y+.24,lz); hit.userData=pick; scene.add(hit); pickables.push(hit);
  const light=new THREE.PointLight(0xffce8e,0,1.6,2);
  const f={light,power:1.4,on:true}; fixtures.push(f); LAMPS.push({f,mat:glow});
  light.position.set(lx,y+.3,lz);
  scene.add(light);
}
// 文房四寶, an ashtray with a burning cigarette and a coffee cup; local +z is the sitter's side
const SMOKES=[];
function deskSet(g,two){
  const y=.82, paper=new THREE.MeshStandardMaterial({color:0xf4efe2,roughness:1}), stoneInk=new THREE.MeshStandardMaterial({color:0x2b2b2d,roughness:.5});
  for(const x of two?[-.55,.55]:[0]){ box(.34,.003,.46,paper,x,y+.002,.12,g); const w=box(.3,.02,.025,M.woodDark,x,y+.014,-.08,g); }
  // inkstone with its well, ink stick
  box(.14,.025,.22,stoneInk,0,y+.013,-.14,g); box(.1,.006,.05,new THREE.MeshStandardMaterial({color:0x0d0d10,roughness:.15}),0,y+.027,-.21,g);
  const stick=box(.022,.016,.09,new THREE.MeshStandardMaterial({color:0x111111,roughness:.6}),.1,y+.008,-.12,g); stick.rotation.y=.4;
  // brush rest with a brush across it
  box(.16,.012,.03,M.woodDark,-.06,y+.006,-.3,g); for(const dx of [-.05,0,.05]){ const c=new THREE.Mesh(new THREE.ConeGeometry(.018,.05,8),M.woodDark); c.position.set(-.06+dx,y+.035,-.3); g.add(c); }
  const brush=cylinder(.006,.006,.24,M.wood,-.06,y+.055,-.3,g); brush.rotation.z=Math.PI/2; const tip=new THREE.Mesh(new THREE.ConeGeometry(.009,.04,8),M.ink); tip.rotation.z=Math.PI/2; tip.position.set(-.2,y+.055,-.3); g.add(tip);
  // brush pot
  const px=two?-.85:.85; cylinder(.045,.045,.12,M.celadon,px,y+.06,-.25,g); for(let i=0;i<3;i++){ const b=cylinder(.005,.005,.22,M.wood,px+(i-1)*.015,y+.17,-.25,g); b.rotation.z=(i-1)*.15; }
  // ashtray and cigarette
  const ash=new THREE.Mesh(new THREE.LatheGeometry([[0,0],[.055,0],[.06,.02],[.05,.022],[.045,.008],[0,.008]].map(([r,yy])=>new THREE.Vector2(r,yy)),20),new THREE.MeshStandardMaterial({color:0x8fa8a0,roughness:.2,transparent:true,opacity:.85})); ash.position.set(-.38,y,-.28); g.add(ash);
  const cig=cylinder(.0045,.0045,.085,new THREE.MeshStandardMaterial({color:0xf5f2ea,roughness:.9}),-.38+.04,y+.026,-.28,g); cig.rotation.z=Math.PI/2+.12;
  const filt=cylinder(.0047,.0047,.022,new THREE.MeshStandardMaterial({color:0xc98a4a}),-.38+.09,y+.032,-.28,g); filt.rotation.z=Math.PI/2+.12;
  const ember=new THREE.Mesh(new THREE.SphereGeometry(.005,8,6),new THREE.MeshBasicMaterial({color:0xff6a2a})); ember.position.set(-.38-.003,y+.021,-.28); g.add(ember);
  const smoke=[]; for(let i=0;i<6;i++){ const sp=new THREE.Sprite(steamMatBase.clone()); sp.material.opacity=0; g.add(sp); smoke.push({sp,t:i/6}); } SMOKES.push({smoke,x:-.383,y:y+.025,z:-.28});
  // coffee cup on its saucer
  const cx=two?.86:.6, cz=two?.14:.02;
  classicCup(g,cx,y,cz);
  // a brush hanger (筆掛) with four brushes
  if(!two){ const hx=-.62, hz=-.05; box(.05,.02,.16,M.woodDark,hx-.16,y+.01,hz,g); box(.05,.02,.16,M.woodDark,hx+.16,y+.01,hz,g);
    for(const sx of [-.16,.16]) box(.02,.3,.02,M.woodDark,hx+sx,y+.16,hz,g); box(.38,.02,.025,M.woodDark,hx,y+.31,hz,g);
    for(let i=0;i<4;i++){ const bx=hx-.105+i*.07; cylinder(.0025,.0025,.03,M.ink,bx,y+.29,hz,g); cylinder(.006,.006,.17,i%2?M.wood:new THREE.MeshStandardMaterial({color:0x6e2e32,roughness:.6}),bx,y+.19,hz,g);
      const tip=new THREE.Mesh(new THREE.ConeGeometry(.008,.04,8),new THREE.MeshStandardMaterial({color:0xe8dcc4,roughness:1})); tip.rotation.x=Math.PI; tip.position.set(bx,y+.085,hz); g.add(tip); } }
}
// a scholar's incense burner: celadon bowl on three feet, pierced dome lid, a thread of smoke
const INCENSE=[['沉香','木質甘甜，沉穩綿長',0xf4efe6],['檀香','奶香溫潤',0xf6efe2],['降真香','清涼帶藥香',0xeef2f0],['龍腦','清冽提神',0xf0f4f6],['柏子香','山林清氣',0xeef2e8],['艾草','草本微苦',0xeef0e4],['不點香','讓香爐歇一歇',0]]; if(Array.isArray(VRD.incense)&&VRD.incense.filter(t=>t&&t.name).length){ const cs=INCENSE.slice(0,-1).map(t=>t[2]); const off=INCENSE[INCENSE.length-1]; INCENSE.splice(0,INCENSE.length,...VRD.incense.filter(t=>t&&t.name).map((t,i)=>[String(t.name),String(t.note||''),cs[i%cs.length]]),off); }
let myIncense=Math.min(INCENSE.length-1,Math.max(0,+(LS.get('hk-incense')||0)));
// a plain bronze burner with an old patina (宣德爐 shape), bridge handles, three low feet, rosewood pierced lid with a jade knob
function censer(x,y,z){ const g=new THREE.Group(); g.position.set(x,y,z); scene.add(g); const pick={type:'censer'};
  const bronzeOld=new THREE.MeshStandardMaterial({color:0x5b4a36,metalness:.55,roughness:.55}), patina=new THREE.MeshStandardMaterial({color:0x4f6a5a,metalness:.2,roughness:.8});
  const bowl=new THREE.Mesh(new THREE.LatheGeometry([[0,.012],[.05,.012],[.066,.03],[.07,.05],[.064,.066],[.062,.07]].map(([r,yy])=>new THREE.Vector2(r,yy)),28),bronzeOld); bowl.material.side=THREE.DoubleSide; bowl.userData=pick; g.add(bowl); pickables.push(bowl);
  const band=new THREE.Mesh(new THREE.TorusGeometry(.068,.004,6,32),patina); band.rotation.x=Math.PI/2; band.position.y=.034; g.add(band);
  for(const a of [0,2.09,4.19]){ const f=new THREE.Mesh(new THREE.SphereGeometry(.012,8,6),bronzeOld); f.scale.y=.8; f.position.set(Math.cos(a)*.045,.008,Math.sin(a)*.045); g.add(f); }
  for(const sx of [-1,1]){ const ear=new THREE.Mesh(new THREE.TorusGeometry(.018,.005,6,12,Math.PI),bronzeOld); ear.position.set(sx*.066,.07,0); ear.rotation.y=Math.PI/2; g.add(ear); }
  const lid=new THREE.Mesh(new THREE.SphereGeometry(.064,24,10,0,Math.PI*2,0,Math.PI/2),new THREE.MeshStandardMaterial({color:0x2e1c12,roughness:.45})); lid.scale.y=.55; lid.position.y=.07; lid.userData=pick; g.add(lid); pickables.push(lid);
  for(let i=0;i<12;i++){ const a=i*Math.PI/6; const h=new THREE.Mesh(new THREE.CircleGeometry(.0075,6),new THREE.MeshBasicMaterial({color:0x0e0907})); h.position.set(Math.cos(a)*.05,.091,Math.sin(a)*.05); h.lookAt(Math.cos(a)*.2,.15,Math.sin(a)*.2); g.add(h); }
  const knob=new THREE.Mesh(new THREE.SphereGeometry(.014,12,8),new THREE.MeshStandardMaterial({color:0xc9d8b8,roughness:.2})); knob.scale.y=.8; knob.position.y=.108; g.add(knob);
  box(.17,.012,.17,M.woodDark,0,.004,0,g);
  const smoke=[]; for(let i=0;i<7;i++){ const sp=new THREE.Sprite(steamMatBase.clone()); sp.material.opacity=0; g.add(sp); smoke.push({sp,t:i/7}); } SMOKES.push({smoke,x:0,y:.11,z:0,censer:true}); }
function showIncense(){ const body=openPanel('焚香',`<p class="meta">爐裡現在是：${esc(INCENSE[myIncense][0])}。</p><ul class="list menu">${INCENSE.map(([n,d],i)=>`<li data-in="${i}"><div><div class="bt">${n}</div><div class="ba">${d}</div></div><span class="ba">${i===myIncense?'正在燒':'換這個'}</span></li>`).join('')}</ul>`);
  body.querySelector('.list').onclick=e=>{ const li=e.target.closest('li[data-in]'); if(!li) return; myIncense=+li.dataset.in; LS.set('hk-incense',myIncense); toast(INCENSE[myIncense][2]?`點上${INCENSE[myIncense][0]}。`:'香熄了。'); showIncense(); }; }
const steamMatBase=new THREE.SpriteMaterial({map:(()=>{ const c=document.createElement('canvas'); c.width=c.height=64; const g=c.getContext('2d'); const r=g.createRadialGradient(32,32,0,32,32,32); r.addColorStop(0,'rgba(255,255,255,.7)'); r.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=r; g.fillRect(0,0,64,64); return new THREE.CanvasTexture(c); })(),transparent:true,depthWrite:false});
function furn(x,z,yaw,parent=scene){ const g=new THREE.Group(); g.position.set(x,0,z); g.rotation.y=yaw; parent.add(g); return g; }
function desk(cx,cz,personal=false,oneSide=false){
  const width=personal?2.95:2.0, depth=personal?1.12:.85;
  const hw=width/2, hd=depth/2;
  woodenTable(cx,cz,width,depth,.82,.13,BLOCK);
  deskLamp(cx-hw+.30,oneSide?cz+hd-.21:cz-hd+.21);
  OBST.push({x0:cx-hw,x1:cx+hw,z0:cz-hd,z1:cz+hd});
  for(const dx of [-.55,.55]){
    const seat=chair(cx+dx,cz-hd-.425,Math.PI);
    if(personal) SEATS[seat].name='個人工作桌';
    if(!oneSide) chair(cx+dx,cz+hd+.425,0);
  }
}
// West half: quiet study, two desks with the chairs facing the front windows
for(const x of [-5.0,-2.05]) desk(x,.75);
const officeX=4.70, officeZ=2.62;               // one end against the front (door) wall
woodenTable(officeX,officeZ,1.10,2.60,.82,.13,BLOCK);
for(const z of [officeZ-.95,officeZ+.95]){
  box(.22,.13,.88,M.woodDark,officeX+.42,.70,z);
  box(.034,.08,.20,M.wood,officeX+.54,.70,z);
  box(.027,.033,.09,bronze,officeX+.56,.70,z);
}
deskLamp(officeX-.28,officeZ+1.0);
deskSet(furn(officeX,officeZ,Math.PI/2),false);
censer(officeX+.25,.82,officeZ-1.0);
const officeSeat=chair(officeX+1.0,officeZ,Math.PI/2);  // reached from the room side only
SEATS[officeSeat].name='個人工作桌';
OBST.push({x0:officeX-.55,x1:officeX+.55,z0:officeZ-1.30,z1:officeZ+1.30});
OBST.push({x0:floorLampX-.22,x1:floorLampX+.22,z0:floorLampZ-.22,z1:floorLampZ+.22});
applyLighting();
function cylinder(top,bottom,height,mat,x,y,z,parent=scene){
  const mesh=new THREE.Mesh(new THREE.CylinderGeometry(top,bottom,height,20),mat);
  mesh.position.set(x,y,z); parent.add(mesh); return mesh;
}
function woodenTable(x,z,w,d,h,inset,pick=null){
  const legX=w/2-inset, legZ=d/2-inset;
  const top=.058, leg=.055;
  box(w,top,d,M.woodDark,x,h-top/2,z,scene,pick);
  box(w-.05,.022,d-.05,M.wood,x,h-top-.011,z);
  for(const dx of [-legX,legX]){
    for(const dz of [-legZ,legZ]) box(leg,h-top,leg,M.woodDark,x+dx,(h-top)/2,z+dz);
    box(.039,.05,2*legZ,M.wood,x+dx,h-.105,z);
    box(.032,.038,2*legZ,M.wood,x+dx,h*.30,z);
  }
  for(const dz of [-legZ,legZ]) box(2*legX,.071,.033,M.wood,x,h-.113,z+dz);
}
function consoleTable(x,z,w,d,h){
  woodenTable(x,z,w,d,h,.09);
  OBST.push({x0:x-w/2,x1:x+w/2,z0:z-d/2,z1:z+d/2});
}
/* ---------------- seats by kind ---------------- */
const SEAT_KIND={
  desk:  {eye:1.15,pitch:-.32,front:false,sink:-.42,label:'自習',hello:'已就座。按「專注 25 分」開始自習，別人會看到你在專注。',status:i=>SEATS[i].name||('坐在第'+cnNum(deskNo(i))+'席')},
  lounge:{eye:1.05,pitch:-.1, front:true, sink:-.42,label:'閱讀',hello:'在閱讀角坐下。旁邊的唱片機可以放音樂。',status:()=>'在閱讀角看書'},
  bench: {eye:1.12,pitch:-.02,front:true, sink:-.42,label:'聽講',hello:'在講堂坐下了。',status:()=>'在講堂聽講'},
  zen:   {eye:.82, pitch:-.12,front:true, sink:-.8, label:'靜坐',hello:'坐上蒲團。按「靜坐 30 分」開始一炷香。',status:()=>'在禪堂靜坐',timer:[['zen',30,'靜坐 30 分'],['walk',10,'經行 10 分']]},
  tea:   {eye:1.1, pitch:-.15,front:false,sink:-.42,label:'小憩',hello:'在知了間坐下。到吧檯點杯咖啡吧。',status:()=>'在知了間'},
  yard:  {eye:1.1, pitch:0,   front:true, sink:-.42,label:'乘涼',hello:'在大樹跤坐一下。',status:()=>'在大樹跤乘涼'},
  irori: {eye:1.0, pitch:-.35,front:false,sink:-.65,label:'圍爐',hello:'在囲炉裏邊坐下。點鐵壺或蓋碗，泡一碗茶。',status:()=>'圍爐坐著'+teaStatus('irori')},
  gongfu:{eye:1.06,pitch:-.42,front:false,sink:-.52,label:'食茶',hello:'在茶席坐下。點紅泥小爐或孟臣罐，起炭泡一泡工夫茶。',status:()=>'在知了間食茶'+teaStatus('gongfu')},
  taishi:{eye:1.18,pitch:-.08,front:true, sink:-.38,label:'小坐',hello:'在太師椅坐下。',status:()=>'在明間坐著'},
  luohan:{eye:1.12,pitch:-.1, front:true, sink:-.42,label:'小憩',hello:'在羅漢床上坐下。牆上的月琴和殼仔弦可以點來調弦。',status:()=>'在羅漢床上'},
  modern:{eye:1.15,pitch:-.3, front:false,sink:-.42,label:'品茗',hello:'在當代茶席坐下。點提梁壺或紫砂壺，點爐泡一壺茶。',status:()=>'在當代茶席'+teaStatus('modern')},
  bath:  {eye:.9,  pitch:-.05,front:true, sink:-.62,fz:.04,label:'泡湯',hello:'泡進檜木浴缸。',status:()=>'在浴室'},
  wstool:{eye:.9,  pitch:-.15,front:true, sink:-.62,fz:.04,label:'洗身',hello:'坐下洗身。',status:()=>'在浴室'},
  sauna: {eye:1.14,pitch:-.05,front:true, sink:-.40,label:'烤箱',hello:'在烤箱坐下。',status:()=>'在浴室'},
  sauna2:{eye:1.59,pitch:-.12,front:true, sink:.05,label:'烤箱',hello:'在烤箱上層坐下。',status:()=>'在浴室'},
  wc:    {eye:1.1, pitch:-.05,front:true, sink:-.42,label:'如廁',hello:'坐下了，門已關上。',status:()=>'在廁所'},
  dine:  {eye:1.12,pitch:-.3, front:true, sink:-.42,label:'用餐',hello:'在飯桌坐下。',status:()=>'在明間吃飯'},
  qin:   {eye:1.12,pitch:-.05,front:false,sink:-.42,label:'調弦',hello:'在琴凳坐下。點牆上的月琴或殼仔弦，撥弦調音。',status:()=>'在調月琴'},
};
function deskNo(i){ let n=0; for(let k=0;k<=i;k++) if(SEATS[k].kind==='desk'&&!SEATS[k].name) n++; return n; }
function seatLabel(i){ const s=SEATS[i]; if(s.name) return s.name; return s.kind==='desk'?'第'+cnNum(deskNo(i))+'席':({lounge:'閱讀角',bench:'講堂長凳',zen:'禪堂蒲團',tea:'知了間',yard:'大樹跤石椅',irori:'囲炉裏',gongfu:'茶席',qin:'琴凳',modern:'當代茶席',luohan:'羅漢床',taishi:'太師椅',dine:'飯桌',wc:'馬桶',bath:'浴缸',wstool:'洗身',sauna:'烤箱',sauna2:'烤箱'})[s.kind]; }
// stand up / sit down on the side you can reach: behind a desk chair, in front of a sofa or cushion
// where a seated figure goes: its seat, moved forward 12 cm (6 on low seats) along the way it faces, and lifted 3 cm
function seatPlace(s){ const k=SEAT_KIND[s.kind]||{}, low=(k.sink??-.42)<=-.6, f=k.fz??(low?.06:.12); return {x:s.x-Math.sin(s.yaw)*f, z:s.z-Math.cos(s.yaw)*f, y:(k.sink??-.42)+(k.lift??(low?.02:.03)), yaw:s.yaw, low, sink:(k.sink??-.42)+(k.lift??(low?.02:.03))}; }
function poseSeated(av,st){ const f=av&&av.fig; if(!f||!f.userData.sit) return; const key=st?st.kind+(st.x.toFixed(2)):''; if(av.sitKey===key) { if(st) f.userData.sitCut(); return; } av.sitKey=key;
  if(st){ const P=seatPlace(st); f.userData.sit(true,P.sink,P.low); f.userData.sitCut(); } else f.userData.sit(false); }
function seatApproach(s){ if(s.ap) return s.ap; const k=SEAT_KIND[s.kind], d=k.front?-.62:.7; return {x:s.x+Math.sin(s.yaw)*d, z:s.z+Math.cos(s.yaw)*d}; }
// a pickable that stands for several seats (the tub's water and stone step = its four places): keep the seat I'm in,
// otherwise the free one nearest the click; null when all are taken (other players, staff in the bath)
function groupSeat(u,pt){ if(!u.group) return u.si; if(u.group.includes(ME.seat)) return ME.seat;
  const free=u.group.filter(si=>!occupied(si)); if(!free.length) return null; if(!pt) return free[0];
  return free.reduce((a,b)=>Math.hypot(SEATS[a].x-pt.x,SEATS[a].z-pt.z)<=Math.hypot(SEATS[b].x-pt.x,SEATS[b].z-pt.z)?a:b); }
function addSeat(x,z,yaw,kind,name=null){ SEATS.push({x,z,yaw,kind,name}); return SEATS.length-1; }

/* ---------------- 學鳩齋: entry table under the scroll, plum vase on it right of the axis ---------------- */
{ const g=furn(0,-3.62,0); const pick={type:'altar'};
  box(2.2,.06,.42,M.woodDark,0,.92,0,g,pick);
  for(const sx of [-1,1]){ box(.10,.05,.42,M.woodDark,sx*1.08,.965,0,g,pick); box(.06,.89,.06,M.woodDark,sx*.98,.445,-.15,g); box(.06,.89,.06,M.woodDark,sx*.98,.445,.15,g); box(.04,.5,.30,M.wood,sx*.98,.55,0,g); }
  box(1.9,.08,.03,M.wood,0,.85,.19,g);
  const vase=new THREE.Mesh(new THREE.LatheGeometry([0,.05,.09,.10,.085,.05,.03,.035,.045].map((r,i)=>new THREE.Vector2(r,i*.04)),24),M.celadon); vase.position.set(.5,.95,0); vase.userData=pick; g.add(vase); pickables.push(vase);
  const twig=new THREE.MeshStandardMaterial({color:0x2a1d16,roughness:1}), blossom=new THREE.MeshStandardMaterial({color:0xf6e8ea,roughness:.8,emissive:0x2a1416});
  const R=rnd(88); const branch=(pts)=>{ const c=new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(p[0]+.5,p[1]+.075,p[2]))); g.add(new THREE.Mesh(new THREE.TubeGeometry(c,20,.006,5,false),twig));
    for(let i=0;i<10;i++){ const p=c.getPoint(.3+R()*.7); const b=new THREE.Mesh(new THREE.SphereGeometry(.013,8,6),blossom); b.position.copy(p).add(new THREE.Vector3((R()-.5)*.03,(R()-.5)*.03,(R()-.5)*.03)); g.add(b);} };
  branch([[0,1.18,0],[-.04,1.40,.02],[-.16,1.58,.03],[-.34,1.66,0]]); branch([[0,1.18,0],[.07,1.36,-.02],[.18,1.5,-.04]]); branch([[-.02,1.32,.01],[-.1,1.44,-.05],[-.08,1.58,-.08]]); }

/* ---------------- 學鳩齋 east: Song-style reading corner with the record player ---------------- */
const songPad=new THREE.MeshStandardMaterial({color:0x3e4a5a,roughness:1});
function songSeat(x,z,yaw,width){
  const g=furn(x,z,yaw); const n=width>1.2?2:1, sis=[];
  for(let i=0;i<n;i++){ const sx=n===2?(i-.5)*.9:0; const w=new THREE.Vector3(sx,0,0).applyAxisAngle(new THREE.Vector3(0,1,0),yaw); sis.push(addSeat(x+w.x,z+w.z,yaw,'lounge')); }
  const d=n===2?.6:.46, tag={type:'seat',si:sis[0]};
  box(width,.045,d,M.woodDark,0,.45,0,g,tag); box(width-.06,.06,.03,M.woodDark,0,.40,-d/2+.02,g);
  for(const sx of [-1,1]) for(const sz of [-1,1]) box(.045,.43,.045,M.woodDark,sx*(width/2-.04),.215,sz*(d/2-.04),g,tag);
  for(const sx of [-1,1]) box(.03,.03,d-.08,M.wood,sx*(width/2-.04),.12,0,g);
  for(let i=0;i<n;i++){ const sx=n===2?(i-.5)*.9:0; box(width/n-.1,.035,d-.1,songPad,sx,.49,0,g,{type:'seat',si:sis[i]}); }
  // back: two posts, a top rail that runs past them (燈掛), slim splats
  const top=n===2?.86:1.02;
  for(const sx of [-1,1]) box(.04,top-.45,.04,M.woodDark,sx*(width/2-.04),(top+.45)/2,d/2-.03,g,tag);
  box(width+(n===2?0:.14),.035,.05,M.woodDark,0,top,d/2-.03,g,tag);
  for(const sx of (n===2?[-.6,0,.6]:[0])) box(n===2?.03:.13,top-.5,.018,M.wood,sx,(top+.47)/2,d/2-.02,g);
  if(n===2) for(const sx of [-1,1]){ const ax=sx*(width/2-.04);
    box(.035,.25,.035,M.woodDark,ax,.585,-d/2+.05,g,tag); box(.04,.03,d-.02,M.woodDark,ax,.71,0,g,tag);
    box(.018,.2,.018,M.wood,ax,.6,0,g); box(.018,.2,.018,M.wood,ax,.6,.12,g); }
  return sis; }
const LOUNGE_Z=-1.7;
const LOUNGE_X=3.8;
songSeat(LOUNGE_X,LOUNGE_Z,Math.PI,1.9);
songSeat(LOUNGE_X-1.45,LOUNGE_Z+1.25,-Math.PI/2,.56);
songSeat(LOUNGE_X+1.45,LOUNGE_Z+1.25,Math.PI/2,.56);
// low square table with a book and a tea bowl
{ const tz=LOUNGE_Z+1.25, tx=LOUNGE_X; box(.9,.035,.55,M.woodDark,tx,.445,tz); for(const sx of [-1,1]) for(const sz of [-1,1]) box(.035,.43,.035,M.woodDark,tx+sx*.41,.215,tz+sz*.24);
  box(.82,.025,.025,M.wood,tx,.1,tz-.24); box(.82,.025,.025,M.wood,tx,.1,tz+.24);
  box(.2,.025,.28,M.cloth,tx-.15,.475,tz); cylinder(.05,.03,.04,M.celadon,tx+.2,.483,tz-.08);
  OBST.push({x0:tx-.45,x1:tx+.45,z0:tz-.275,z1:tz+.275}); }
OBST.push({x0:LOUNGE_X-1,x1:LOUNGE_X+1,z0:LOUNGE_Z-.32,z1:LOUNGE_Z+.3});
// record player on its own cabinet
const recPos=new THREE.Vector3(5.3,0,-1.85);
const platter=new THREE.Group();
{ const g=furn(recPos.x,recPos.z,-Math.PI/4); const pick={type:'record'};
  const walnut=new THREE.MeshStandardMaterial({color:0x3b2416,roughness:.4}), brass=new THREE.MeshStandardMaterial({color:0xc29a4a,metalness:.85,roughness:.28,side:THREE.DoubleSide});
  // a low stand with a shelf of records
  box(.6,.04,.44,M.woodDark,0,.56,0,g,pick); for(const sx of [-1,1]) for(const sz of [-1,1]) box(.04,.56,.04,M.woodDark,sx*.27,.28,sz*.19,g,pick);
  box(.52,.02,.36,M.woodDark,0,.16,0,g); for(let i=0;i<7;i++){ const sl=box(.012,.3,.3,new THREE.MeshStandardMaterial({color:[0x3e5873,0xa8343a,0xd8cdb2,0x3d6b4f,0x86683c,0x2e2a26,0x6e2e32][i],roughness:.8}),-.18+i*.05,.32,0,g); sl.rotation.z=.06*(i%2?1:-1); }
  // the gramophone box, platter, crank
  box(.38,.15,.38,walnut,0,.655,0,g,pick); box(.4,.02,.4,walnut,0,.735,0,g,pick); box(.34,.1,.005,new THREE.MeshStandardMaterial({color:0x4a2e1c,roughness:.5}),0,.655,-.191,g);
  platter.position.set(0,.75,0); g.add(platter);
  cylinder(.15,.15,.012,new THREE.MeshStandardMaterial({color:0x3a1f1a,roughness:.9}),0,0,0,platter);
  const disc=new THREE.Mesh(new THREE.CylinderGeometry(.145,.145,.005,40),new THREE.MeshStandardMaterial({color:0x111111,roughness:.3,metalness:.2})); disc.position.y=.009; platter.add(disc);
  const lab=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,.006,24),new THREE.MeshStandardMaterial({color:0xa8343a,roughness:.7})); lab.position.y=.010; platter.add(lab);
  const crank=cylinder(.006,.006,.12,brass,.25,.65,.05,g); crank.rotation.z=Math.PI/2; box(.012,.07,.012,brass,.31,.62,.05,g); cylinder(.012,.012,.04,M.ink,.31,.58,.05,g);
  // tone arm rising into a swan neck and a wide flared horn
  const neck=new THREE.CatmullRomCurve3([[.13,.74,-.13],[.13,.86,-.14],[.1,.98,-.1],[.04,1.06,.0],[-.04,1.1,.1]].map(p=>new THREE.Vector3(...p)));
  g.add(new THREE.Mesh(new THREE.TubeGeometry(neck,30,.018,10,false),brass));
  const arm=new THREE.CatmullRomCurve3([[.13,.76,-.13],[.08,.78,-.05],[.05,.775,.04]].map(p=>new THREE.Vector3(...p))); g.add(new THREE.Mesh(new THREE.TubeGeometry(arm,12,.007,8,false),brass));
  cylinder(.022,.022,.03,brass,.13,.755,-.13,g); box(.025,.02,.035,brass,.05,.77,.05,g);
  const prof=[]; for(let i=0;i<=24;i++){ const t=i/24; prof.push(new THREE.Vector2(.02+.25*Math.pow(t,2.6),t*.48)); }
  const horn=new THREE.Mesh(new THREE.LatheGeometry(prof,36),brass); horn.userData=pick; pickables.push(horn);
  const hornG=new THREE.Group(); hornG.position.set(-.04,1.1,.1); hornG.add(horn); g.add(hornG);
  hornG.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(-.25,.45,.86).normalize());
  const rim=new THREE.Mesh(new THREE.TorusGeometry(.27,.006,8,48),brass); rim.position.y=.48; rim.rotation.x=Math.PI/2; horn.add(rim);
}
OBST.push({x0:recPos.x-.32,x1:recPos.x+.32,z0:recPos.z-.24,z1:recPos.z+.24});

/* ---------------- 學鳩齋 front wall: one run of low cabinets over the stone course ---------------- */
function lowCabinet(x0,x1){ const len=x1-x0, cx=(x0+x1)/2, z=3.8, h=.78, pick=BLOCK;
  box(len,h-.03,.4,M.woodDark,cx,(h-.03)/2,z,scene,pick); box(len+.01,.03,.42,M.wood,cx,h-.015,z-.005,scene,pick);
  const n=Math.max(1,Math.round(len/.55)), dw=len/n;
  for(let i=0;i<n;i++){ const x=x0+dw*(i+.5); box(dw-.05,h-.16,.012,M.wood,x,(h-.03)/2+.01,z-.205,scene,{type:'snack'}); cylinder(.012,.012,.02,bronze,x+(i%2?-1:1)*(dw/2-.07),.42,z-.215).rotation.x=Math.PI/2; }
  box(len,.06,.01,M.woodDark,cx,.03,z-.205);
  OBST.push({x0,x1,z0:z-.2,z1:z+.2}); }
lowCabinet(-7.36,-1.15);
lowCabinet(1.15,4.12);
// coffee corner on the cabinet between the two study-side windows
const coffeeMachine=new THREE.Group();
coffeeMachine.position.set(-3.75,-.05,3.8);
coffeeMachine.rotation.y=Math.PI;
scene.add(coffeeMachine);
const steel=new THREE.MeshStandardMaterial({color:0xa5aaa7,metalness:.38,roughness:.31});
{ const pick={type:'coffee'};
  box(.51,.09,.42,M.ink,0,.875,0,coffeeMachine,pick);
  box(.49,.40,.13,steel,0,1.09,0-.138,coffeeMachine,pick);
  box(.51,.14,.39,steel,0,1.25,0,coffeeMachine,pick);
  box(.41,.025,.24,steel,0,.936,0+.07,coffeeMachine);
  cylinder(.043,.033,.071,M.paper,0,.986,0+.12,coffeeMachine);
  cylinder(.026,.026,.059,M.ink,0,1.15,0+.10,coffeeMachine);
  box(.031,.026,.13,M.ink,0,1.147,0+.18,coffeeMachine);
  for(const dx of [-.15,.15]) box(.042,.04,.015,M.ink,dx,1.26,0+.20,coffeeMachine);
  const wand=cylinder(.007,.007,.2,steel,.2,1.08,.17,coffeeMachine); wand.rotation.x=.3;
  // cups: a stack, and two on saucers on a small tray
  // a small glass-fronted cup cabinet beside the machine
  { const g=new THREE.Group(); g.position.set(-2.95,.78,3.82); g.rotation.y=Math.PI; scene.add(g); const W=.46,H=.62,Dp=.28;
    box(W,.025,Dp,M.woodDark,0,.0125,0,g,pick); box(W+.03,.03,Dp+.02,M.woodDark,0,H+.015,0,g,pick); box(W,H,.015,M.woodDark,0,H/2,-Dp/2+.008,g);
    for(const sx of [-1,1]) box(.025,H,Dp,M.woodDark,sx*(W/2-.0125),H/2,0,g,pick);
    for(const y of [.21,.42]) box(W-.05,.012,Dp-.03,M.wood,0,y,0,g);
    for(const [y,n] of [[.025,3],[.222,3],[.432,2]]) for(let i=0;i<n;i++){ const c=classicCup(g,(i-(n-1)/2)*.14,y,-.01,{coffee:false,scale:.9}); c.rotation.y=-.6; }
    const glass=new THREE.Mesh(new THREE.PlaneGeometry(W-.06,H-.06),new THREE.MeshStandardMaterial({color:0xdfe8ea,transparent:true,opacity:.16,roughness:.05,metalness:.1})); glass.position.set(0,H/2,Dp/2); g.add(glass);
    for(const [w,h,x,y] of [[W,.03,0,.04],[W,.03,0,H-.02],[.03,H,-W/2+.03,H/2],[.03,H,W/2-.03,H/2],[.02,H-.06,0,H/2]]) box(w,h,.02,M.wood,x,y,Dp/2,g);
    for(const sx of [-1,1]) cylinder(.008,.008,.02,gilt,sx*.03,H/2,Dp/2+.015,g).rotation.x=Math.PI/2; }
}
{ const g=new THREE.Group(); g.position.set(-3.75,2.18,3.975); g.rotation.y=Math.PI; scene.add(g);
  const tex=new THREE.TextureLoader().load('painting-room.jpg'); tex.colorSpace=THREE.SRGBColorSpace; tex.anisotropy=MAXANI;
  const PW=.5, PH=PW*689/560, MAT=.07, FR=.045, wood=new THREE.MeshStandardMaterial({color:0x24170e,roughness:.5}), inner=new THREE.MeshStandardMaterial({color:0x120c08,roughness:.6});
  const mat=new THREE.Mesh(new THREE.PlaneGeometry(PW+2*MAT,PH+2*MAT),new THREE.MeshStandardMaterial({color:0xe7e1d0,roughness:.95})); mat.position.z=.012; g.add(mat);
  const pic=new THREE.Mesh(new THREE.PlaneGeometry(PW,PH),new THREE.MeshStandardMaterial({map:tex,roughness:.9})); pic.position.z=.014; g.add(pic); pic.userData={type:'otter'}; pickables.push(pic);
  const OW=PW+2*MAT+2*FR, OH=PH+2*MAT+2*FR;
  for(const [w,h,x,y] of [[OW,FR,0,OH/2-FR/2],[OW,FR,0,-OH/2+FR/2],[FR,OH-2*FR,OW/2-FR/2,0],[FR,OH-2*FR,-OW/2+FR/2,0]]) box(w,h,.04,wood,x,y,.02,g);
  for(const [w,h,x,y] of [[OW-2*FR,.01,0,OH/2-FR],[OW-2*FR,.01,0,-OH/2+FR],[.01,OH-2*FR,OW/2-FR,0],[.01,OH-2*FR,-OW/2+FR,0]]) box(w,h,.03,inner,x,y,.018,g);
  box(OW,OH,.01,inner,0,0,.004,g); }
const cuckoo=(()=>{ const g=new THREE.Group(); g.position.set(3.65,2.35,3.96); g.rotation.y=Math.PI; scene.add(g);
  const walnut=new THREE.MeshStandardMaterial({color:0x4a2e1c,roughness:.55}), carve=new THREE.MeshStandardMaterial({color:0x3a2416,roughness:.7,flatShading:true}), brass=gilt;
  const pick={type:'clock'};
  box(.36,.42,.14,walnut,0,0,.07,g,pick);
  // gabled roof with eaves
  for(const sx of [-1,1]){ const r=box(.27,.025,.2,walnut,sx*.11,.27,.08,g,pick); r.rotation.z=-sx*.62; }
  box(.02,.02,.2,walnut,0,.355,.08,g);
  // carved leaves round the dial and a small bird on the ridge
  const leaf=new THREE.SphereGeometry(.035,8,6); const R=rnd(31);
  for(let i=0;i<16;i++){ const a=Math.PI*(.05+i*.9/15); const l=new THREE.Mesh(leaf,carve); l.scale.set(1.5,.7,.5); l.position.set(Math.cos(a)*.2,-.09+Math.sin(a)*.19,.15); l.rotation.z=a+Math.PI/2+(R()-.5)*.6; g.add(l); }
  for(let i=0;i<6;i++){ const l=new THREE.Mesh(leaf,carve); l.scale.set(1.6,.7,.5); l.position.set(-.15+i*.06,-.235,.15); l.rotation.z=(i%2?.4:-.4); g.add(l); }
  const bird=new THREE.Group(); bird.position.set(0,.4,.08); g.add(bird); const bb=new THREE.Mesh(new THREE.SphereGeometry(.03,10,8),carve); bb.scale.set(1.5,1,1); bird.add(bb); const bh=new THREE.Mesh(new THREE.SphereGeometry(.018,8,6),carve); bh.position.set(.04,.022,0); bird.add(bh);
  for(const sx of [-1,1]){ const w=new THREE.Mesh(leaf,carve); w.scale.set(1.2,.4,.4); w.position.set(-.01,.02,sx*.02); w.rotation.z=.5; bird.add(w); }
  // dial with roman numerals
  const face=textCanvas(256,256,(c,w,h)=>{ c.fillStyle='#efe4c8'; c.beginPath(); c.arc(128,128,124,0,7); c.fill(); c.strokeStyle='#2a1d16'; c.lineWidth=4; c.stroke();
    c.fillStyle='#1f1a16'; c.font='600 30px Georgia,serif'; c.textAlign='center'; c.textBaseline='middle';
    ['XII','I','II','III','IV','V','VI','VII','VIII','IX','X','XI'].forEach((t,i)=>{ const a=i*Math.PI/6-Math.PI/2; c.save(); c.translate(128+Math.cos(a)*92,128+Math.sin(a)*92); c.fillText(t,0,0); c.restore(); });
    for(let i=0;i<60;i++){ const a=i*Math.PI/30; c.fillRect(128+Math.cos(a)*112-1,128+Math.sin(a)*112-1,i%5?2:4,i%5?2:4); } });
  const dial=new THREE.Mesh(new THREE.CircleGeometry(.105,40),new THREE.MeshStandardMaterial({map:face,roughness:.6})); dial.position.set(0,-.06,.142); g.add(dial);
  const hand=(len,w)=>{ const pv=new THREE.Group(); pv.position.set(0,-.06,.146); g.add(pv); const m=new THREE.Mesh(new THREE.PlaneGeometry(w,len),new THREE.MeshStandardMaterial({color:0x111111,side:THREE.DoubleSide})); m.position.y=len*.4; pv.add(m); return pv; };
  const hourH=hand(.065,.012), minH=hand(.09,.008);
  // little door and the cuckoo
  box(.08,.07,.01,walnut,0,.13,.142,g); const door=box(.06,.055,.008,carve,0,.13,.148,g);
  const cu=new THREE.Group(); cu.position.set(0,.13,.1); g.add(cu); const cb=new THREE.Mesh(new THREE.SphereGeometry(.022,10,8),new THREE.MeshStandardMaterial({color:0x6b4a2a})); cb.scale.set(1,1,1.5); cu.add(cb);
  const beak=new THREE.Mesh(new THREE.ConeGeometry(.007,.02,6),new THREE.MeshStandardMaterial({color:0xd9a441})); beak.rotation.x=Math.PI/2; beak.position.z=.04; cu.add(beak);
  // pendulum and two pine-cone weights on chains
  const pend=new THREE.Group(); pend.position.set(0,-.2,.12); g.add(pend);
  const rod=box(.008,.42,.004,brass,0,-.21,0,pend); const bob=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,.006,24),carve); bob.rotation.x=Math.PI/2; bob.position.y=-.43; pend.add(bob);
  const cone=new THREE.SphereGeometry(.026,10,8);
  for(const [sx,len] of [[-.09,.62],[.09,.48]]){ const ch=box(.003,len,.003,brass,sx,-.21-len/2,.1,g); const w=new THREE.Mesh(cone,new THREE.MeshStandardMaterial({color:0x5a3a1e,roughness:.6,flatShading:true})); w.scale.y=2.4; w.position.set(sx,-.21-len-.06,.1); g.add(w); }
  return {g,hourH,minH,pend,cu,door,last:-1,pop:0}; })();
{ const g=new THREE.Group(); g.position.set(3.65,.78,3.78); scene.add(g);
  const glaze=new THREE.MeshStandardMaterial({color:0x3c4a5a,roughness:.35});
  box(.38,.085,.22,glaze,0,.06,0,g); box(.4,.012,.24,glaze,0,.1,0,g); for(const sx of [-1,1]) for(const sz of [-1,1]) box(.04,.02,.03,glaze,sx*.15,.01,sz*.08,g);
  box(.35,.01,.19,new THREE.MeshStandardMaterial({color:0x4f5d33,roughness:1}),0,.105,0,g);
  const bark=new THREE.MeshStandardMaterial({color:0x5a4636,roughness:1});
  const trunk=new THREE.CatmullRomCurve3([[.04,.1,0],[-.03,.18,.01],[.05,.26,-.01],[-.02,.33,0],[-.09,.38,.02]].map(p=>new THREE.Vector3(...p)));
  g.add(new THREE.Mesh(new THREE.TubeGeometry(trunk,24,.022,8,false),bark));
  const br=new THREE.CatmullRomCurve3([[.04,.25,0],[.12,.28,.01],[.18,.27,-.01]].map(p=>new THREE.Vector3(...p))); g.add(new THREE.Mesh(new THREE.TubeGeometry(br,12,.01,6,false),bark));
  const pad=new THREE.MeshStandardMaterial({color:0x2f4a2a,roughness:.9,flatShading:true});
  for(const [x,y,z,s] of [[-.1,.41,.02,.09],[.19,.29,-.01,.07],[-.0,.36,-.04,.06],[.07,.31,.04,.055],[-.14,.36,.05,.05]]){ const m=new THREE.Mesh(new THREE.IcosahedronGeometry(s,1),pad); m.scale.y=.42; m.position.set(x,y,z); g.add(m); }
  for(let i=0;i<5;i++){ const st=new THREE.Mesh(new THREE.DodecahedronGeometry(.018,0),new THREE.MeshStandardMaterial({color:0x8a8478})); st.position.set(-.13+i*.06,.115,.06-(i%2)*.1); g.add(st); } }
const LEAVES=[]; { const leafMat=new THREE.MeshStandardMaterial({color:0x6d7a3a,side:THREE.DoubleSide,roughness:.9}), lg=new THREE.CircleGeometry(.035,5); lg.scale(1,.5,1);
  for(let i=0;i<14;i++){ const m=new THREE.Mesh(lg,leafMat); scene.add(m); LEAVES.push({m,t:Math.random(),x0:-5+Math.random()*10,z0:courtAxis-5+Math.random()*10,dir:.4+Math.random()*.5,ph:Math.random()*6}); } }
function doorState(key){ if(DOORS[key]&&DOORS[key].room&&doorSleeper(DOORS[key])) return false; let best=myDoors[key]?{o:myDoors[key][0],at:myDoors[key][1]}:null;
  for(const [,o] of others){ const r=o.p&&o.p.dr&&o.p.dr[key]; if(Array.isArray(r)&&r.length===2&&typeof r[1]==='number'&&(!best||r[1]>best.at)) best={o:!!r[0],at:r[1]}; }
  return best?best.o:true; }
function toggleDoor(key){ const d=DOORS[key]; if(!d) return; if(d.room&&doorSleeper(d)){ toast(NT('door.sleep')); return; } const open=!d.open;
  // don't shut someone out of sight: you can bar the door only from the inside
  if(!open && !d.euro && !(d.inside?d.inside(ME):zoneOf(ME)===key)){ toast('門閂在門內，要從屋裡才能關門上閂。'); return; }
  myDoors={...myDoors,[key]:[open?1:0,Date.now()]}; pushPresence(); d.open=open; knock(); toast(d.slide?NT('sdoor.msg',open?0:1):d.euro?NT('edoor.msg',open?0:1):(open?'拔起門閂，開門。':'關上門，插上門閂。')); }
function knock(){ try{ if(!actx) actx=new (window.AudioContext||window.webkitAudioContext)(); actx.resume(); const t=actx.currentTime; for(const [f,dt] of [[140,0],[95,.35]]){ const o=actx.createOscillator(), g=actx.createGain(); o.type='triangle'; o.frequency.value=f; g.gain.setValueAtTime(.0001,t+dt); g.gain.exponentialRampToValueAtTime(.25,t+dt+.01); g.gain.exponentialRampToValueAtTime(.0001,t+dt+.25); o.connect(g).connect(actx.destination); o.start(t+dt); o.stop(t+dt+.3); } }catch{} }
function cuckooCall(n){ try{ if(!actx) return; for(let i=0;i<n;i++){ for(const [f,dt] of [[698.5,0],[587.3,.32]]){ const o=actx.createOscillator(), gn=actx.createGain(), t=actx.currentTime+i*1.0+dt; o.type='triangle'; o.frequency.value=f; gn.gain.setValueAtTime(.0001,t); gn.gain.exponentialRampToValueAtTime(.09,t+.03); gn.gain.exponentialRampToValueAtTime(.0001,t+.26); o.connect(gn).connect(actx.destination); o.start(t); o.stop(t+.3); } } }catch{} }
const BEANS=[['耶加雪菲','衣索比亞・淺焙・花香柑橘'],['阿里山','臺灣・中淺焙・蜂蜜烏龍'],['肯亞 AA','淺中焙・莓果酸甜'],['哥倫比亞','中焙・焦糖堅果'],['巴西喜拉朵','中深焙・可可榛果'],['曼特寧','印尼・深焙・草本黑巧克力']];
let myBean=Math.min(BEANS.length-1,Math.max(0,+(LS.get('hk-bean')||3)));
{ const g=new THREE.Group(); g.position.set(-4.32,.78,3.8); g.rotation.y=Math.PI; scene.add(g); const pick={type:'grinder'};
  box(.16,.04,.2,M.ink,0,.02,0,g,pick); const body=cylinder(.06,.07,.24,new THREE.MeshStandardMaterial({color:0x2d2a28,metalness:.4,roughness:.35}),0,.16,-.02,g); body.userData=pick;
  box(.1,.06,.06,M.ink,0,.07,.07,g,pick); cylinder(.03,.03,.05,M.paper,0,.065,.07,g);
  const hop=new THREE.Mesh(new THREE.CylinderGeometry(.075,.035,.15,20,1,true),new THREE.MeshStandardMaterial({color:0xcfd8d6,transparent:true,opacity:.35,side:THREE.DoubleSide,roughness:.1})); hop.position.set(0,.355,-.02); hop.userData=pick; g.add(hop); pickables.push(hop);
  const beans=new THREE.Mesh(new THREE.CylinderGeometry(.06,.035,.09,20),new THREE.MeshStandardMaterial({color:0x4a2a18,roughness:.8})); beans.position.set(0,.33,-.02); g.add(beans);
  cylinder(.078,.078,.015,M.ink,0,.435,-.02,g); const dial=box(.02,.03,.012,new THREE.MeshStandardMaterial({color:0xb08a3e,metalness:.7}),.065,.16,-.02,g); }
function showBeans(after){ const body=openPanel('選豆子',`<p class="meta">磨豆機裡現在是：${esc(BEANS[myBean][0])}。換一種豆子，下一杯就用它。</p><ul class="list menu">${BEANS.map(([n,d],i)=>`<li data-b2="${i}"><div><div class="bt">${n}</div><div class="ba">${d}</div></div><span class="ba">${i===myBean?'磨豆機裡':'換這款'}</span></li>`).join('')}</ul>`);
  body.querySelector('.list').onclick=e=>{ const li=e.target.closest('li[data-b2]'); if(!li) return; myBean=+li.dataset.b2; LS.set('hk-bean',myBean); toast(`換成${BEANS[myBean][0]}。`); if(after) after(); else showBeans(); }; }
const DRINKS=[['濃縮','Espresso','單份濃縮，30 毫升'],['美式','Americano','濃縮加熱水'],['拿鐵','Latte','濃縮加大量蒸奶'],['卡布奇諾','Cappuccino','濃縮、蒸奶、奶泡各三分之一'],['瑪奇朵','Macchiato','濃縮點上一匙奶泡'],['摩卡','Mocha','濃縮、巧克力、蒸奶'],['馥列白','Flat White','雙份濃縮配薄奶泡'],['阿法奇朵','Affogato','濃縮淋在香草冰淇淋上']];

/* ---------------- 院子: stone bench under the pine, on its 學鳩齋 side, facing 學鳩齋 ---------------- */
{ const bz=TREE.z-1.3, bx=TREE.x; const stoneM=new THREE.MeshStandardMaterial({color:0x8d877d,roughness:.95});
  const sis=[-.38,.38].map(o=>addSeat(bx+o,bz,0,'yard'));
  box(1.45,.09,.44,stoneM,bx,.42,bz,scene,{type:'seat',si:sis[0]}); for(const o of [-.5,.5]) box(.22,.38,.36,stoneM,bx+o,.19,bz);
  const h2=box(.7,.09,.44,stoneM,bx+.38,.425,bz,scene,{type:'seat',si:sis[1]}); h2.visible=false;
  OBST.push({x0:bx-.72,x1:bx+.72,z0:bz-.22,z1:bz+.22}); }

await __yield(0.5);
// {% endraw %}
