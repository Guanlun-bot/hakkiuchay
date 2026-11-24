// {% raw %}
/* ================= 洗衣間（西邊前過水，x 27.24–31.56、z 15.11–23.9）=================
   A professional laundry in the old room, dirty to clean from the door to the back: by the door the carts for sorting and
   the spotting table; along the west wall two washer-extractors (18 kg, 11 kg), a deep sink with the detergent pumps, two
   stacked tumble dryers; along the east wall the pick-up shelf, a sewing machine, the steam ironing table, the folding
   table with shelves over it and the garment rail; a back door to the drying yard. Pale epoxy floor, strip lights.
   阿莉 works here by her plan (plan.li: 洗衣、烘衣、曬衣、燙衣、摺衣、縫補); the machines run while she does. Guests can
   leave a bag of washing with her: a while later a folded bundle with their name waits on the pick-up shelf (this browser). */
const LAUND={x0:27.39,x1:31.41,z0:15.27,z1:23.6, wash:[], dry:[], steam:null, yard:null, pick:null, bundle:null};
{ const L=LAUND, M2=(c,r=.5,o={})=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:r},o)), steel=M2(0xc9ccce,.28,{metalness:.75}), steelD=M2(0x8e9396,.35,{metalness:.7}),
    white=M2(0xf2f2ee,.35), glassM=M2(0x2a3036,.15,{metalness:.3,transparent:true,opacity:.55}), blackM=M2(0x1c1c1c,.5), dispM=new THREE.MeshBasicMaterial({color:0x5fe08a}),
    canvas=M2(0xd8cfba,.95), wood=M2(0x9a7652,.6), clothC=[0xe8e2d6,0x6b7f95,0x8a5a4a,0x5f7a62,0xd9c48a,0xf4f1ea,0x9aa7b4].map(c=>M2(c,.9));
  const T=(k)=>({type:'ld'+k});
  // floor and lights
  { const tileT=textCanvas(256,256,(g,w,h)=>{ g.fillStyle='#9a9c98'; g.fillRect(0,0,w,h); for(let i=0;i<4;i++) for(let j=0;j<4;j++){ const v=206+((i*7+j*13)%9); g.fillStyle=`rgb(${v},${v+1},${v-3})`; g.fillRect(i*64+2,j*64+2,60,60); } }); tileT.wrapS=tileT.wrapT=THREE.RepeatWrapping; tileT.repeat.set((L.x1-L.x0)/1.2,(L.z1-L.z0)/1.2);
    const fl=new THREE.Mesh(new THREE.PlaneGeometry(L.x1-L.x0,L.z1-L.z0),new THREE.MeshStandardMaterial({map:tileT,roughness:.35}));   // 30 cm ceramic tiles
    fl.rotation.x=-Math.PI/2; fl.position.set((L.x0+L.x1)/2,.006,(L.z0+L.z1)/2); fl.userData={type:'floor'}; pickables.push(fl); scene.add(fl);
    const drain=box(.12,.004,2.8,steelD,28.5,.009,18.8); for(let z=17.5;z<20.2;z+=.12) box(.1,.006,.02,M2(0x3a3d40,.5),28.5,.012,z);
    for(const z of [16.6,19.4,22.2]){ box(.12,.04,1.9,white,29.4,3.36,z); box(.08,.012,1.8,new THREE.MeshBasicMaterial({color:0xfffaf0}),29.4,3.334,z); } }
  // by the door: three canvas carts (whites, darks, towels and sheets) and the spotting table with the guests' basket
  [[0xf4f1ea,15.75],[0x4a5560,16.45],[0xc9b48a,17.15]].forEach(([c,z])=>{ const g=new THREE.Group(); g.position.set(27.78,0,z); scene.add(g);
    for(const [x,zz] of [[-.22,-.28],[.22,-.28],[-.22,.28],[.22,.28]]){ const w=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,.03,10),blackM); w.rotation.x=Math.PI/2; w.position.set(x,.04,zz); g.add(w); }
    box(.5,.02,.66,steelD,0,.09,0,g,T('cart')); for(const sx of [-1,1]) box(.02,.72,.02,steelD,sx*.24,.45,.32,g); box(.5,.02,.02,steelD,0,.8,.32,g,T('cart'));
    box(.46,.6,.6,canvas,0,.42,0,g,T('cart')); box(.4,.08,.54,M2(c,.9),0,.72,0,g); });
  OB(27.4,28.1,15.35,17.5);
  box(.7,.05,1.2,steel,31.0,.88,17.0,scene,T('spot')); for(const [x,z] of [[30.7,16.45],[31.3,16.45],[30.7,17.55],[31.3,17.55]]) box(.04,.86,.04,steelD,x,.43,z); box(.66,.03,1.16,steelD,31.0,.3,17.0);
  { const bk=new THREE.Group(); bk.position.set(31.0,.9,17.25); scene.add(bk); const b=new THREE.Mesh(new THREE.CylinderGeometry(.2,.16,.26,14,1,true),M2(0xb9935e,.8,{side:THREE.DoubleSide})); b.position.y=.13; b.userData=T('drop'); pickables.push(b); bk.add(b); }   // the guests' basket
  OB(30.62,31.41,16.38,17.62);
  // the pick-up shelf by the door: nine cubbies; a guest's bundle appears in one with a name card
  { const g=new THREE.Group(); g.position.set(31.18,0,15.8); scene.add(g); box(.44,1.8,.9,wood,0,.9,0,g,T('shelf')); for(let r=0;r<4;r++) box(.44,.02,.86,M2(0xb08a62,.6),-.0,.3+r*.48,0,g);
    for(let c=1;c<3;c++) box(.44,1.5,.02,M2(0xb08a62,.6),0,1.0,-.45+c*.3,g);
    for(let r=0;r<3;r++) for(let c=0;c<3;c++) if((r+c)%2) box(.3,.14,.22,clothC[(r*3+c)%clothC.length],-.04,.4+r*.48,-.3+c*.3,g);
    const bd=new THREE.Group(); bd.position.set(-.04,.89,0); g.add(bd); box(.32,.16,.24,clothC[1],0,0,0,bd,T('bundle')); box(.32,.02,.26,M2(0xf6f2e8,.8),0,.09,0,bd);
    const card=new THREE.Mesh(new THREE.PlaneGeometry(.2,.07),new THREE.MeshBasicMaterial({map:textCanvas(160,56,(gg,w,h)=>{ gg.fillStyle='#f6f2e8'; gg.fillRect(0,0,w,h); })})); card.rotation.y=-Math.PI/2; card.position.set(-.17,0,0); bd.add(card); bd.visible=false; L.bundle={g:bd,card};
    OB(30.94,31.41,15.33,16.27); }
  // the west wall: two washer-extractors, the deep sink with the dosing pumps, two stacked dryers
  const machine=(z,w,h,y0,kind)=>{ const g=new THREE.Group(); g.position.set(27.39+.44,y0,z); scene.add(g); const tag=T(kind);
    box(.86,h,w,kind==='dry'?white:steel,0,h/2,0,g,tag); box(.02,h*.16,w*.9,blackM,.43,h*.9,0,g);
    const disp=box(.01,.05,.12,dispM,.445,h*.9,-w*.25,g); const r=Math.min(w,h)*.33;
    const ring=new THREE.Mesh(new THREE.TorusGeometry(r,.03,8,28),steelD); ring.rotation.y=Math.PI/2; ring.position.set(.45,h*.46,0); g.add(ring);
    const gl=new THREE.Mesh(new THREE.CircleGeometry(r,28),glassM); gl.rotation.y=Math.PI/2; gl.position.set(.452,h*.46,0); gl.userData=tag; pickables.push(gl); g.add(gl);
    const drum=new THREE.Group(); drum.position.set(.38,h*.46,0); drum.rotation.y=Math.PI/2; g.add(drum); const back=new THREE.Mesh(new THREE.CircleGeometry(r*.95,24),M2(0x6a6e70,.4,{metalness:.6})); back.position.z=-.06; drum.add(back);
    for(let i=0;i<7;i++){ const c=new THREE.Mesh(new THREE.SphereGeometry(r*.28,8,6),clothC[i%clothC.length]); const a=i/7*6.28; c.position.set(Math.cos(a)*r*.45,Math.sin(a)*r*.45-(i%3)*.02,-.03); c.scale.z=.5; drum.add(c); }
    for(const k of [-1,0,1]) box(.02,.035,.035,blackM,.445,h*.9,w*.18+k*.05,g);
    return {g,drum,disp,on:false}; };
  L.wash.push(machine(17.95,.92,1.18,0,'wash')); L.wash.push(machine(18.95,.78,1.02,0,'wash'));
  box(.86,.12,.92,steelD,27.83,.06,17.95); box(.86,.12,.78,steelD,27.83,.06,18.95);   // plinths
  { const g=new THREE.Group(); g.position.set(27.72,0,19.75); scene.add(g); const tag=T('sink'); box(.62,.86,.66,steel,0,.43,0,g,tag); box(.5,.04,.54,M2(0x4a4e52,.3,{metalness:.7}),0,.86,0,g);
    const fa=new THREE.Mesh(new THREE.CylinderGeometry(.015,.015,.5,8),steel); fa.position.set(-.26,1.12,0); g.add(fa); const sp=new THREE.Mesh(new THREE.TorusGeometry(.12,.015,6,12,Math.PI),steel); sp.position.set(-.16,1.37,0); sp.rotation.y=Math.PI/2; g.add(sp);
    for(let i=0;i<3;i++){ box(.1,.16,.1,[M2(0x3a6ad0,.4),M2(0x2ea86a,.4),M2(0xe0e0e0,.4)][i],-.25,1.6,-.2+i*.2,g,T('pump')); const tb=new THREE.Mesh(new THREE.CylinderGeometry(.006,.006,1.5,5),M2(0xe8e8e0,.6)); tb.position.set(-.27,.9,-.2+i*.2); g.add(tb); } }
  OB(27.4,28.27,17.45,20.1);
  L.dry.push(machine(20.7,.8,.92,.1,'dry')); L.dry.push(machine(20.7,.8,.92,1.04,'dry')); L.dry.push(machine(21.55,.8,.92,.1,'dry')); L.dry.push(machine(21.55,.8,.92,1.04,'dry'));
  { const duct=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,1.2,10),steelD); duct.position.set(27.55,2.3,21.1); duct.rotation.x=Math.PI/2; scene.add(duct); box(.1,.36,.1,steelD,27.55,2.1,20.7); box(.1,.36,.1,steelD,27.55,2.1,21.55); }
  OB(27.4,28.27,20.28,21.97);
  // over the machines, like a dry cleaner's: two steel rails hung from the ceiling on drop rods, packed with finished
  // garments in clear plastic bags on coloured wire hangers, plus a bunch of empty hangers; hems clear the dryers
  { const g=new THREE.Group(); scene.add(g); const Z0=17.35, Z1=22.05, RAILS=[{x:28.12,y:3.18},{x:28.78,y:3.02}];
    for(const R of RAILS){ const rail=new THREE.Mesh(new THREE.CylinderGeometry(.016,.016,Z1-Z0+.2,10),steel); rail.rotation.x=Math.PI/2; rail.position.set(R.x,R.y,(Z0+Z1)/2); g.add(rail);
      for(const z of [Z0-.05,(Z0+Z1)/2,Z1+.05]){ const rod=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,3.4-R.y,8),steel); rod.position.set(R.x,(3.4+R.y)/2,z); g.add(rod); } }
    box(.7,.025,.025,steelD,28.45,3.36,Z0-.05,g); box(.7,.025,.025,steelD,28.45,3.36,Z1+.05,g);
    // garments are drawn side-on to the rail (in the x–y plane), packed along it
    const coat=new THREE.Shape(); coat.moveTo(-.04,0); coat.lineTo(-.2,-.06); coat.lineTo(-.24,-.98); coat.lineTo(.24,-.98); coat.lineTo(.2,-.06); coat.lineTo(.04,0); coat.closePath();
    const shirt=new THREE.Shape(); shirt.moveTo(-.04,0); shirt.lineTo(-.2,-.06); shirt.lineTo(-.21,-.7); shirt.lineTo(.21,-.7); shirt.lineTo(.2,-.06); shirt.lineTo(.04,0); shirt.closePath();
    const bagS=(L)=>{ const b=new THREE.Shape(); b.moveTo(-.03,.02); b.lineTo(-.25,-.07); b.lineTo(-.27,-L); b.lineTo(.27,-L); b.lineTo(.25,-.07); b.lineTo(.03,.02); b.closePath(); return b; };
    const GEO={coat:new THREE.ShapeGeometry(coat),shirt:new THREE.ShapeGeometry(shirt),bagC:new THREE.ShapeGeometry(bagS(1.05)),bagS:new THREE.ShapeGeometry(bagS(.8)),
      hanger:new THREE.TorusGeometry(.2,.004,3,3), hook:new THREE.TorusGeometry(.022,.003,4,8,Math.PI*1.5), tag:new THREE.PlaneGeometry(.05,.03)};
    GEO.hanger.rotateZ(Math.PI/2); GEO.hanger.scale(1,.32,1); GEO.hanger.translate(0,-.04,0);
    const cloth=new THREE.MeshStandardMaterial({roughness:.9,side:THREE.DoubleSide}), wire=new THREE.MeshStandardMaterial({roughness:.4,metalness:.3}),
      plastic=new THREE.MeshStandardMaterial({color:0xeef3f6,roughness:.12,metalness:.05,transparent:true,opacity:.3,side:THREE.DoubleSide,depthWrite:false}),
      tagM=new THREE.MeshBasicMaterial({color:0xfafaf6,side:THREE.DoubleSide});
    const COLS=[0x1f2226,0x26292e,0x2c3440,0xf1ece2,0xe9e4d8,0x8c2a2e,0xc9485a,0xd88a96,0x3a5a8c,0x5f6b4e,0x7a5a7e,0x6e6058,0xb8b2a6,0x2f2f33,0xd8d2c4,0x55606e];
    const HCOL=[0xd9a441,0x7fa7d9,0xe8e8ee,0xd98fb7,0x9ad0e0,0xe0c46a];
    const items=[]; let seed=7; const rnd=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; };
    for(const R of RAILS) for(let z=Z0+.04;z<Z1;z+=.055+rnd()*.03){ if(rnd()<.08){ z+=.12; continue; } items.push({x:R.x+(rnd()-.5)*.03,y:R.y,z,long:rnd()<.45,c:COLS[Math.floor(rnd()*COLS.length)],h:HCOL[Math.floor(rnd()*HCOL.length)],tilt:(rnd()-.5)*.12}); }
    const cnt=k=>items.filter(it=>k==='coat'?it.long:!it.long).length;
    const IM={coat:new THREE.InstancedMesh(GEO.coat,cloth,cnt('coat')),shirt:new THREE.InstancedMesh(GEO.shirt,cloth,cnt('shirt')),bagC:new THREE.InstancedMesh(GEO.bagC,plastic,cnt('coat')),bagS:new THREE.InstancedMesh(GEO.bagS,plastic,cnt('shirt')),
      hanger:new THREE.InstancedMesh(GEO.hanger,wire,items.length+18),hook:new THREE.InstancedMesh(GEO.hook,wire,items.length+18),tag:new THREE.InstancedMesh(GEO.tag,tagM,items.length)};
    const m4=new THREE.Matrix4(), q=new THREE.Quaternion(), e=new THREE.Euler(), v=new THREE.Vector3(), one=new THREE.Vector3(1,1,1), col=new THREE.Color(), n={coat:0,shirt:0,bagC:0,bagS:0,hanger:0,hook:0,tag:0};
    const put=(k,x,y,z,ry,rz,c,sc)=>{ e.set(0,ry||0,rz||0); q.setFromEuler(e); m4.compose(v.set(x,y,z),q,sc||one); IM[k].setMatrixAt(n[k],m4); if(c!=null) IM[k].setColorAt(n[k],col.setHex(c)); n[k]++; };
    for(const it of items){ const y=it.y-.06, k=it.long?'coat':'shirt';
      put('hook',it.x,it.y-.005,it.z,0,0,it.h); put('hanger',it.x,y,it.z,0,it.tilt,it.h);
      put(k,it.x,y-.05,it.z+.004,0,it.tilt*.5,it.c); put(it.long?'bagC':'bagS',it.x,y-.03,it.z+.012,0,it.tilt*.5);
      put('tag',it.x+.12,y-.12,it.z+.016,0,0); }
    // a bunch of empty wire hangers bunched at the inner rail's end
    for(let i=0;i<18;i++){ const z=Z1-.02-i*.012, h=HCOL[i%HCOL.length]; put('hook',RAILS[1].x,RAILS[1].y-.005,z,0,0,h); put('hanger',RAILS[1].x,RAILS[1].y-.06,z,0,(i%3-1)*.15,h); }
    for(const k in IM){ IM[k].count=n[k]; IM[k].instanceMatrix.needsUpdate=true; if(IM[k].instanceColor) IM[k].instanceColor.needsUpdate=true; IM[k].userData=T('rail'); pickables.push(IM[k]); g.add(IM[k]); }
    g.children.forEach(o=>{ if(o.isMesh&&!o.isInstancedMesh){ o.userData=T('rail'); } }); }
  // the east wall: sewing machine, steam ironing table, folding table with shelves, the garment rail
  { const g=new THREE.Group(); g.position.set(30.95,0,18.3); scene.add(g); const tag=T('sew'); box(.6,.04,1.0,wood,0,.76,0,g,tag); for(const [x,z] of [[-.25,-.45],[.25,-.45],[-.25,.45],[.25,.45]]) box(.04,.74,.04,steelD,x,.37,z,g);
    box(.22,.24,.46,M2(0x6f9a8a,.4),.0,.92,0,g,tag); box(.22,.06,.12,M2(0x6f9a8a,.4),0,1.06,-.17,g); box(.12,.2,.08,M2(0x6f9a8a,.4),0,.94,.2,g); const wh=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,.03,14),steelD); wh.rotation.z=Math.PI/2; wh.position.set(-.0,1.0,-.27); g.add(wh);
    const st=new THREE.Mesh(new THREE.CylinderGeometry(.33,.3,.04,16),wood); st.position.set(-.62,.45,0); scene.add(st); st.position.add(g.position); }
  OB(30.62,31.41,17.78,18.82);
  { const g=new THREE.Group(); g.position.set(30.95,0,19.7); scene.add(g); const tag=T('iron'); box(.42,.05,1.3,M2(0x9aa3aa,.85),0,.9,0,g,tag); box(.36,.85,.3,steelD,0,.43,.35,g,tag); box(.36,.4,.3,white,0,.25,-.35,g,tag);
    const ir=new THREE.Group(); ir.position.set(-.05,.97,-.25); g.add(ir); box(.12,.06,.22,M2(0x2c2c2c,.4),0,0,0,ir,tag); box(.04,.06,.14,M2(0x2c2c2c,.4),0,.06,0,ir); L.iron=ir;
    const hose=new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,.8,5),M2(0x222222,.5)); hose.position.set(0,1.3,-.1); hose.rotation.x=.6; g.add(hose);
    L.steam=[]; for(let i=0;i<5;i++){ const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:SOFT_TEX0(),transparent:true,opacity:0,depthWrite:false})); sp.scale.setScalar(.15); g.add(sp); L.steam.push(sp); } L.steamAt=g.position; }
  OB(30.7,31.41,19.03,20.37);
  { const g=new THREE.Group(); g.position.set(31.0,0,21.3); scene.add(g); const tag=T('fold'); box(.8,.05,1.4,steel,0,.88,0,g,tag); for(const [x,z] of [[-.36,-.66],[.36,-.66],[-.36,.66],[.36,.66]]) box(.04,.86,.04,steelD,x,.43,z,g); box(.76,.03,1.36,steelD,0,.3,0,g);
    for(let i=0;i<4;i++) for(let k=0;k<3+i%2;k++) box(.3,.05,.26,clothC[(i+k)%clothC.length],-.15+(i%2)*.2,.93+k*.05,-.5+i*.33,g);
    for(const y of [1.45,1.85]){ box(.32,.03,1.4,wood,.24,y,0,g); for(let i=0;i<5;i++) box(.28,.12,.24,clothC[(i*2+(y>1.6?1:0))%clothC.length],.24,y+.075,-.55+i*.27,g); } }
  OB(30.6,31.41,20.58,22.02);
  { const g=new THREE.Group(); g.position.set(31.12,0,22.85); scene.add(g); box(.03,1.75,.03,steel,0,.88,-.62,g); box(.03,1.75,.03,steel,0,.88,.62,g); const rl=new THREE.Mesh(new THREE.CylinderGeometry(.015,.015,1.3,8),steel); rl.rotation.x=Math.PI/2; rl.position.y=1.72; g.add(rl);
    for(let i=0;i<8;i++){ const z=-.52+i*.15, sh=box(.03,.7,.42,clothC[i%clothC.length],0,1.3,z,g,T('rail')); sh.rotation.y=Math.PI/2*.0; box(.01,.02,.36,steelD,0,1.69,z,g); } }
  OB(30.9,31.41,22.2,23.5);
  // the plate by the door in the 過廳
  { const pl=new THREE.Mesh(new THREE.PlaneGeometry(.5,.16),new THREE.MeshStandardMaterial({map:textCanvas(320,100,(g,w,h)=>{ g.fillStyle='#e9dfc8'; g.fillRect(0,0,w,h); g.strokeStyle='#5a4030'; g.lineWidth=6; g.strokeRect(3,3,w-6,h-6); g.fillStyle='#2a1f18'; g.font=F('700',56); g.textAlign='center'; g.textBaseline='middle'; g.fillText(NT('laund.plate'),w/2,h/2+3); }),roughness:.7}));
    pl.position.set(30.5,2.05,2*courtAxis-4.584-.17); pl.rotation.y=Math.PI; scene.add(pl); pl.userData=T('plate'); pickables.push(pl); }
  // the drying yard: two lines of bamboo poles on crossed legs; the washing hangs there on fine days while 阿莉 has it out
  { const Y=LDRY.yard, g=new THREE.Group(); scene.add(g); const bam=M2(0xb59a5e,.7), clothes=new THREE.Group(); g.add(clothes);
    for(const z of [27.6,29.2]){ for(const x of [26.2,29.5,32.8]) for(const s2 of [-1,1]){ const l=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,2.2,6),bam); l.position.set(x,.95,z+s2*.25); l.rotation.x=-s2*.25; g.add(l); }
      const pole=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,7,8),bam); pole.rotation.z=Math.PI/2; pole.position.set(29.5,1.98,z); g.add(pole);
      for(let i=0;i<14;i++){ const c=new THREE.Mesh(new THREE.PlaneGeometry(.42,.62+(i%3)*.14),new THREE.MeshStandardMaterial({color:[0xf4f1ea,0xe8e2d6,0x6b7f95,0xd9c48a,0x9aa7b4,0x8a5a4a][i%6],side:THREE.DoubleSide,roughness:.9})); c.position.set(26.5+i*.46,1.6-(i%3)*.07,z); clothes.add(c); } }
    clothes.visible=false; L.yard={clothes}; g.traverse(o=>{ if(o.isMesh){ o.userData=T('yard'); pickables.push(o); } }); }
}
// the washing day: machines run while 阿莉 does that work; the washing hangs out on fine days; the steam at the iron
const laundOrder=()=>{ try{ return JSON.parse(localStorage.getItem('hkLaundry')||'null'); }catch{ return null; } };
function laundTick(dt){ const L=LAUND, li=NPC.li, t=performance.now()/1000, task=li&&li.task, at=(spot,r=1.4)=>li&&Math.hypot(li.x-spot.x,li.z-spot.z)<r;
  const ord=laundOrder(), now=Date.now(), orderWash=ord&&now>=ord.t0&&now<ord.t0+LAUND_MIN*60000*.5, orderDry=ord&&now>=ord.t0+LAUND_MIN*60000*.5&&now<ord.t0+LAUND_MIN*60000*.85;
  const washing=(task==='洗衣'&&at({x:28.7,z:18.5},3))||orderWash, drying=((task==='烘衣'||(task==='曬衣'&&raining()))&&at({x:28.7,z:21.1},3))||orderDry;
  L.wash.forEach((m,i)=>{ if(washing&&(i===0||ord)) m.drum.rotation.z+=dt*(Math.sin(t*.3)>0?5:-3); m.disp.material=washing&&(i===0||ord)?m.disp.material:m.disp.material; });
  L.dry.forEach((m,i)=>{ if(drying&&i<2) m.drum.rotation.z+=dt*3.2; });
  const ironing=li&&li.act==='iron'; L.steam.forEach((sp,i)=>{ const ph=(t*.7+i/5)%1; sp.position.set(-.05+Math.sin(i*2+t)*.03,1.02+ph*.45,-.25+(ph-.5)*.1); sp.material.opacity=ironing?(1-ph)*.35:0; sp.scale.setScalar(.08+ph*.2); });
  if(L.iron) L.iron.position.z=ironing?-.25+Math.sin(t*2.2)*.35:-.25;
  const m=taipeiNow().min, out=!raining()&&m>=420&&m<930&&(task==='曬衣'||(m>=440&&m<870));   // hung out from the morning to mid-afternoon on dry days
  L.yard.clothes.visible=out;
  // the guest's bundle: ready on the shelf after LAUND_MIN minutes, until they take it
  const ready=ord&&now>=ord.t0+LAUND_MIN*60000; if(L.bundle){ L.bundle.g.visible=!!ready; if(ready&&L.bundle.who!==ord.name){ L.bundle.who=ord.name; const c=L.bundle.card.material.map.image.getContext('2d'); c.fillStyle='#f6f2e8'; c.fillRect(0,0,160,56); c.fillStyle='#2a1f18'; c.font=F('700',26); c.textAlign='center'; c.textBaseline='middle'; c.fillText(String(ord.name||'').slice(0,6),80,30); L.bundle.card.material.map.needsUpdate=true; } } }
const LAUND_MIN=30;
ZL_ANIM.push(dt=>{ try{ laundTick(dt||.016); }catch(e){} });
window.__laundAct=u=>{ const k=u.type, ord=laundOrder(), now=Date.now();
  if(k==='lddrop'){ if(ord&&now<ord.t0+LAUND_MIN*60000){ toast(NT('laund.busy').replace('{分}',Math.max(1,Math.ceil((ord.t0+LAUND_MIN*60000-now)/60000)))); return true; }
    if(ord&&now>=ord.t0+LAUND_MIN*60000){ toast(NT('laund.waiting')); return true; }
    try{ localStorage.setItem('hkLaundry',JSON.stringify({t0:now,name:String(myName||'').trim()||NT('boss.title',1)})); }catch{}
    toast(NT('laund.drop').replace('{分}',LAUND_MIN)); if(NPC.li&&Math.hypot(NPC.li.x-ME.x,NPC.li.z-ME.z)<10) npcSay('li',npcLine('li.take',titleFill())); return true; }
  if(k==='ldbundle'){ if(ord&&now>=ord.t0+LAUND_MIN*60000){ try{ localStorage.removeItem('hkLaundry'); }catch{} toast(NT('laund.pick')); return true; } return false; }
  return false; };
// asleep in a room: its door stays shut and will not open
const doorSleeper=d=>{ if(!d||!d.room) return false; const [x0,x1,z0,z1]=d.room; for(const id in NPC){ const n=NPC[id]; if(n.lie&&n.x>x0&&n.x<x1&&n.z>z0&&n.z<z1){ let walking=false; for(const jd in NPC){ const m=NPC[jd]; if(m.act==='walk'&&m.goal&&m.goal.x>x0&&m.goal.x<x1&&m.goal.z>z0&&m.goal.z<z1) walking=true; } return !walking; } } return false; };
// the tea room (知了間 北間): a pair of dark wooden lattice sliding doors papered with washi, sliding apart along the wall
{ const D=ZR.door, w=(D.z1-D.z0)/2+.02, h=D.h, x=-ZR.wallX-ZR.wallT/2-.025, g=new THREE.Group(); scene.add(g); const pick={type:'door',key:'dtea'}, leaves=[];
  const wood=new THREE.MeshStandardMaterial({color:0x4a3527,roughness:.6}), paper=new THREE.MeshStandardMaterial({color:0xf3eee2,roughness:.95,transparent:true,opacity:.9,emissive:0x2a2418,emissiveIntensity:.25});
  for(let i=0;i<2;i++){ const L=new THREE.Group(); g.add(L); L.position.set(x-i*.035,0,0);
    box(.03,h,w-.02,paper,0,h/2,0,L,pick); for(const zz of [-w/2+.025,w/2-.025]) box(.04,h,.05,wood,0,h/2,zz,L,pick); for(const y of [.04,h-.04]) box(.04,.06,w,wood,0,y,0,L,pick);
    for(let k=1;k<3;k++) box(.035,h-.08,.015,wood,0,h/2,-w/2+w*k/3,L); for(let k=1;k<6;k++) box(.035,.015,w-.06,wood,0,h*k/6,0,L);
    leaves.push({L,i}); }
  DOORS.dtea={leaves,bar:null,open:true,k:1,barK:0,euro:true,slide:true,pose(d){ for(const {L,i} of d.leaves){ const shut=i?D.z1-w/2:D.z0+w/2, open=i?D.z1+w/2-.06:D.z0-w/2+.06; L.position.z=shut+(open-shut)*d.k; } }};
  DOORS.dtea.pose(DOORS.dtea); DOOR_BLOCKS.push({key:'dtea',x0:-ZR.wallX-.15,x1:-ZR.wallX+.15,z0:D.z0,z1:D.z1}); }

// {% endraw %}
