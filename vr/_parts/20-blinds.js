// {% raw %}
/* ================= 竹簾：every octagonal and square window gets a fitted bamboo roll blind =================
   Two to a window, one on each face with the bars or lattice between them, alike in every way and moving together.
   Smoked bamboo (煤竹) split fine, five cotton cords, a persimmon-brown (柿渋茶) binding round the edge, cut to the
   window's own outline (the octagon too) and hung in the frame (outer windows on the outside, octagons on the 明間 side),
   seen and worked from both sides. It rolls
   up from the bottom: the roll rides up the window and is as long as the window is wide at that height, and at the top it
   tucks under a short cloth head. Windows that have been walled up (the toilets) are left out. All start rolled up; who lowers or raises one is shared with everyone
   in the house, and the cinema's three (two octagons toward its 明間, the court window) come down by themselves while a film plays. */
const BLINDS=[];
function buildBlinds(){ try{
  const slatT=ctex(128,512,(g,w,h)=>{ g.clearRect(0,0,w,h); let s=7; const r=()=>((s=s*16807%2147483647)/2147483647);
      for(let y=0;y<h;y+=8){ const v=(r()-.5)*18; g.fillStyle=`rgb(${128+v|0},${88+v*.7|0},${54+v*.5|0})`; g.fillRect(0,y,w,6); g.fillStyle='rgba(255,230,190,.18)'; g.fillRect(0,y,w,1); g.fillStyle='rgba(30,18,10,.5)'; g.fillRect(0,y+5,w,1);
        if(r()<.25){ g.fillStyle='rgba(40,24,12,.5)'; g.fillRect(r()*w,y+1,2+r()*3,4); } }                       // a node now and then
      g.fillStyle='rgba(222,212,190,.95)'; for(const f of [.1,.3,.5,.7,.9]) g.fillRect(f*w-1,0,2,h); },{color:true});   // the cords
  slatT.wrapS=slatT.wrapT=THREE.RepeatWrapping;
  const bindM=new THREE.MeshStandardMaterial({color:0x7a4a2a,roughness:.85}), rollM=new THREE.MeshStandardMaterial({color:0x4f321d,roughness:.6}), headM=new THREE.MeshStandardMaterial({color:0x6e4226,roughness:.9});
  scene.updateMatrixWorld(true);
  const solids=[]; scene.traverse(o=>{ if(o.isMesh&&o.visible&&!o.userData.blind) solids.push(o); });
  const rc=new THREE.Raycaster(), UP=new THREE.Vector3(0,1,0);
  const oct=r=>[...Array(8)].map((_,k)=>{ const a=Math.PI/8+k*Math.PI/4; return [Math.cos(a)*r,Math.sin(a)*r]; });
  for(const W of WINDOWS){ const P=W.parent; P.updateMatrixWorld(true); const q=P.getWorldQuaternion(new THREE.Quaternion()), ws=P.getWorldScale(new THREE.Vector3());
    let c, u, n, half, H, chord, outline, off, samples=[];
    if(W.k==='oct'){ c=P.localToWorld(new THREE.Vector3(W.x,W.y,W.z)); u=new THREE.Vector3(0,0,1).applyQuaternion(q); n=new THREE.Vector3(1,0,0).applyQuaternion(q); const R=W.r, a=R*Math.cos(Math.PI/8), sd=2*R*Math.sin(Math.PI/8);
      H=2*a; half=a; outline=oct(R); off=.06; chord=t=>{ const at=Math.abs(t); return 2*Math.max(sd/2,at<=sd/2?a:a-(at-sd/2)); };
      for(let k=0;k<8;k++){ const ang=Math.PI/8+k*Math.PI/4; samples.push([Math.cos(ang)*.32,Math.sin(ang)*.32]); } }
    else { c=P.localToWorld(new THREE.Vector3(W.cx,(W.y0+W.y1)/2,W.z)); u=new THREE.Vector3(1,0,0).applyQuaternion(q); n=new THREE.Vector3(0,0,1).applyQuaternion(q); const WW=W.w*Math.abs(ws.x), w=WW-.02; H=(W.y1-W.y0)*Math.abs(ws.y)-.02; half=H/2;
      outline=[[-w/2,-H/2],[w/2,-H/2],[w/2,H/2],[-w/2,H/2]]; off=-.11; chord=()=>w; const bars=Math.max(4,Math.round(W.w/.22));
      for(let i=0;i<bars;i++) samples.push([-WW/2+(i+.5)*WW/bars,0]); }
    // which side holds the roll: a square window's is the inside of the house (toward the building's middle, or failing
    // that the side with a roof over it); an
    // octagon's, in a partition between the 明間 and a 北間/南間, is the 北間/南間 (away from the wing's middle, local x 0).
    // n points there; the slats hang just on that side of the bars or lattice, and look the same from both sides.
    if(W.k==='oct'){ if((W.x||0)<0) n.negate(); }
    else if(Math.abs(W.z)>.5){ if(W.z>0) n.negate(); }   // a wall of a whole building: the inside is toward its middle (local z 0)
    else { const roofed=s=>{ rc.set(c.clone().addScaledVector(n,s*2.4),UP); rc.far=9; return rc.intersectObjects(solids,false).length>0; }; if(roofed(-1)&&!roofed(1)) n.negate(); }
    off=W.k==='oct'?.05:.12;
    u=new THREE.Vector3().crossVectors(UP,n).normalize();   // across, so that (across, up, toward the roll's side) is a proper rotation
    // walled up or lined over? look through the opening from both sides
    let blocked=0; for(const [du,dv] of samples){ for(const s of [1,-1]){ const o=c.clone().addScaledVector(u,du).addScaledVector(UP,dv).addScaledVector(n,s*.7);
        rc.set(o,n.clone().multiplyScalar(-s)); rc.far=1.0; if(rc.intersectObjects(solids,false).length){ blocked++; break; } } }
    if(blocked>=Math.ceil(samples.length*.6)) continue;
    // two blinds, one on each face of the window, the bars or lattice between them; the same in every way, each with its
    // own roll and head on its own side, and they go up and down together. g: x across, y up, z through the wall.
    const g=new THREE.Group(); g.position.copy(c); g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(u,UP,n)); scene.add(g);
    const i=BLINDS.length, pk={type:'blind',i,blind:true}, plane=new THREE.Plane(new THREE.Vector3(0,1,0),0), gap=W.k==='oct'?.045:.13;
    const tex=slatT.clone(); tex.needsUpdate=true; tex.repeat.set(1,H/.4);
    const sm=new THREE.MeshStandardMaterial({map:tex,emissive:0xffffff,emissiveMap:tex,emissiveIntensity:.32,alphaTest:.5,side:THREE.DoubleSide,roughness:.72,clippingPlanes:[plane]}), bm=bindM.clone(); bm.clippingPlanes=[plane];
    const sh=new THREE.Shape(); outline.forEach(([a,b],k)=>k?sh.lineTo(a,b):sh.moveTo(a,b)); sh.closePath();
    const sg=new THREE.ShapeGeometry(sh), pa=sg.attributes.position, ua=sg.attributes.uv; for(let k=0;k<pa.count;k++) ua.setXY(k,(pa.getX(k)/(2*half)+.5),(pa.getY(k)+half)/H);
    const top=half, tw=chord(top-.001), rolls=[], slatsA=[], cyl=new THREE.CylinderGeometry(1,1,1,18), headG=new THREE.BoxGeometry(tw+.05,.075,.05);
    for(const side of [1,-1]){ const f=new THREE.Group(); f.position.z=side*gap; if(side<0) f.rotation.y=Math.PI; g.add(f);
      const slats=new THREE.Mesh(sg,sm); slats.userData=pk; f.add(slats); pickables.push(slats); slatsA.push(slats);
      for(let k=0;k<outline.length;k++){ const [x0,y0]=outline[k], [x1,y1]=outline[(k+1)%outline.length], L=Math.hypot(x1-x0,y1-y0);
        const e=new THREE.Mesh(new THREE.BoxGeometry(L+.02,.024,.012),bm); e.position.set((x0+x1)/2,(y0+y1)/2,0); e.rotation.z=Math.atan2(y1-y0,x1-x0); e.userData=pk; f.add(e); pickables.push(e); }
      const roll=new THREE.Mesh(cyl,rollM); roll.rotation.z=Math.PI/2; roll.userData=pk; f.add(roll); pickables.push(roll); rolls.push(roll);
      const head=new THREE.Mesh(headG,headM); head.position.set(0,top-.02,.03); head.userData=pk; f.add(head); pickables.push(head); }
    BLINDS.push({g,plane,rolls,slats:slatsA,top,H,chord,k:0,on:0,v:0,id:'',at:0,cine:(Math.abs(c.x-(19.6-ZR.wallX))<.3&&c.z>15.6&&c.z<23.6)||Math.hypot(c.x-14.5,c.z-15.6)<.7});
    ZL_DYN.push(g); }
  }catch(e){ console.warn('blinds',e); } }
{ const send=(d,to)=>{ try{ return !!(NET.bcast&&NET.bcast(Object.assign({k:'blind'},d),to)); }catch{ return false; } };
  // the household's round: at getting-up time 玉姨 (east side) and 阿財 (west side) roll every blind up, at lights-out
  // they let every one down, each window as they reach it on their walk (see 傭人作息; b.off is when, from the start of
  // the round). Someone's own choice holds until the next round.
  const sched=(i,t)=>{ const b=BLINDS[i], mm=tpMin(t-(b.off||0)), down=asleepAt(mm)?1:0; return {down,since:t-minsSince(mm,down?DAY.sleep%1440:DAY.wake)*60000}; };
  let lastRound=null;
  let lastT=performance.now(); const wp=new THREE.Vector3();
  ZL_ANIM.push(()=>{ if(!BLINDS.length) return; const now=performance.now(), dt=Math.min(.25,(now-lastT)/1000); lastT=now; const film=!!(window.__cine&&window.__cine.S.p), wall=wallNow();
    if(window.__entered) staffRoutes(); const round=asleepAt(tpMin(wall))?'down':'up'; if(lastRound&&round!==lastRound&&window.__entered) toast(NT('blind.npc',round==='up'?0:1),6000); lastRound=round;
    for(const [i,b] of BLINDS.entries()){ const S=sched(i,wall), base=b.v&&b.at>S.since?b.on:S.down, want=b.cine&&film?1:base; if(b.k===want&&b.ok) continue; b.ok=true;
      b.k+=Math.sign(want-b.k)*Math.min(Math.abs(want-b.k),dt*.5);
      const yb=b.top-b.k*b.H, r=.012+.028*(1-b.k), len=Math.max(.02,b.chord(Math.min(b.top-.001,Math.max(-b.top+.001,yb))));
      for(const ro of b.rolls){ ro.position.set(0,yb,.012+r); ro.scale.set(r,len,r); }
      b.g.updateMatrixWorld(true); wp.set(0,yb,0); b.g.localToWorld(wp); b.plane.constant=-wp.y; for(const sl of b.slats) sl.visible=b.k>.005; } });
  window.__blindAct=u=>{ const b=BLINDS[u.i]; if(!b) return; const S=sched(u.i,wallNow()), cur=b.v&&b.at>S.since?b.on:S.down; b.on=cur?0:1; b.v++; b.id=MY_PID; b.at=wallNow(); b.ok=false; send({o:'set',i:u.i,on:b.on,v:b.v,id:b.id,at:b.at}); toast(NT('blind.msg',b.on?0:1),2000); };
  const snapFor=new Map();
  window.__blindHello=()=>send({o:'hi'});
  window.__blindRecv=(d,from)=>{ if(!d||d.k!=='blind') return;
    if(d.o==='hi'){ const list=BLINDS.map((b,i)=>b.v?[i,b.on,b.v,b.id,b.at]:null).filter(Boolean); if(!list.length) return;
      const ids=[...((NET.peers&&NET.peers.keys&&NET.peers.keys())||[])].filter(i=>i!==from).concat(MY_PID).sort(), rank=Math.max(0,ids.indexOf(MY_PID));
      clearTimeout(snapFor.get(from)); snapFor.set(from,setTimeout(()=>{ snapFor.delete(from); send({o:'all',for:from,list},from); },200+rank*400+Math.random()*120)); return; }
    const put=(i,on,v,id,at)=>{ const b=BLINDS[i]; if(!b) return; if(v>b.v||(v===b.v&&String(id||'')>b.id)){ b.on=on?1:0; b.v=v; b.id=id||''; b.at=+at||Date.now(); b.ok=false; } };
    if(d.o==='set') put(d.i|0,d.on,d.v|0,d.id,d.at);
    else if(d.o==='all'){ if(d.for&&snapFor.has(d.for)){ clearTimeout(snapFor.get(d.for)); snapFor.delete(d.for); } if(d.for&&d.for!==MY_PID) return; for(const [i,on,v,id,at] of d.list||[]) put(i|0,on,v|0,id,at); } };
}

function optimizeScene(){
  try{
  scene.updateMatrixWorld(true);
  // anything that moves, changes visibility or is picked stays as it is
  const dyn=new Set();
  const keep=o=>{ if(o) o.traverse(c=>dyn.add(c)); };
  for(const k in DOORS){ for(const l of DOORS[k].leaves) keep(l.pv); keep(DOORS[k].bar); }
  [platter,cuckoo.g,PINE,myCup,mySnackMesh,hl,hlGlow,marker,floorShade,...LANTERNS,...GF_CUPS,...IRORI_CUPS,...PINZI,...ZL_DYN,...LEAVES.map(l=>l.m),...NPC_DYN,...EAVE_PARTS].forEach(keep);
  const groups=new Map(), victims=[], pickId=new Map();
  scene.traverse(o=>{ if(!o.isMesh||o.isInstancedMesh||dyn.has(o)||!o.visible) return; let p=o.parent; while(p&&p!==scene){ if(!p.visible) return; p=p.parent; }
    if(Array.isArray(o.material)) return; const m=o.material, u=o.userData&&o.userData.type?o.userData:null;
    if(!(m.isMeshStandardMaterial||m.isMeshBasicMaterial)||m.visible===false||o.geometry.morphAttributes&&Object.keys(o.geometry.morphAttributes).length) return;
    if(u&&['shelf','lamp'].includes(u.type)) return;
    const g=o.geometry; if(!g.attributes.position||!g.attributes.normal) return;
    if(u&&!pickId.has(u)) pickId.set(u,pickId.size+1);
    const cm=canonical(m);
    const key=cm.m.uuid+'|'+(o.castShadow?1:0)+(o.receiveShadow?1:0)+'|'+(u?pickId.get(u):0); if(!groups.has(key)) groups.set(key,{m:cm.m,u,cast:o.castShadow,recv:o.receiveShadow,geos:[]});
    const gg=g.clone().applyMatrix4(o.matrixWorld); for(const name of Object.keys(gg.attributes)) if(!['position','normal','uv'].includes(name)) gg.deleteAttribute(name);
    if(cm.uv&&gg.attributes.uv){ const a=gg.attributes.uv, v=new THREE.Vector3(); for(let i=0;i<a.count;i++){ v.set(a.getX(i),a.getY(i),1).applyMatrix3(cm.uv); a.setXY(i,v.x,v.y); } }
    groups.get(key).geos.push(gg); victims.push(o); });
  const gone=new Set(victims); for(const o of victims) o.parent.remove(o);
  for(let i=pickables.length-1;i>=0;i--) if(gone.has(pickables[i])) pickables.splice(i,1);
  for(const {m,u,cast,recv,geos} of groups.values()){ for(let i=0;i<geos.length;i+=4000){ const mesh=new THREE.Mesh(mergeGeos(geos.slice(i,i+4000)),m); mesh.castShadow=cast; mesh.receiveShadow=recv; mesh.matrixAutoUpdate=false; if(u){ mesh.userData=u; pickables.push(mesh); } scene.add(mesh); } for(const g of geos) g.dispose(); }
  // point lights: keep every light's settings (code still animates them), but light the scene with the nearest few
  scene.traverse(o=>{ if(o.isPointLight&&!LIGHT_POOL.includes(o)) VLIGHTS.push(o); });
  for(const l of VLIGHTS){ l.userData.wp=new THREE.Vector3().setFromMatrixPosition(l.matrixWorld); l.userData.zone=zoneOf({x:l.userData.wp.x,z:l.userData.wp.z}); l.userData.room=roomOf({x:l.userData.wp.x,z:l.userData.wp.z}); l.visible=false; }
  for(let i=0;i<7;i++){ const l=new THREE.PointLight(0xffffff,0,5,2); scene.add(l); LIGHT_POOL.push(l); }
  renderer.shadowMap.needsUpdate=true;
  }catch(e){ console.warn('optimize',e); }
}
let lightPick=[], lightT=1;
function tickLights(dt){ if(!LIGHT_POOL.length) return; lightT+=dt;
  if(lightT>.25){ lightT=0; const anc=VIEW.mode==='plan'?VIEW.target:ME, zone=zoneOf(anc), here=new THREE.Vector3(anc.x,1.5,anc.z);
    const room=roomOf(anc); let cand=VLIGHTS.filter(l=>l.intensity>.001); if(room.length>1){ const inRoom=cand.filter(l=>l.userData.room===room); if(inRoom.length) cand=inRoom; }
    lightPick=cand.map(l=>({l,s:l.userData.wp.distanceTo(here)/Math.max(1,l.distance*.35)+(l.userData.zone===zone?0:(zone==='C'||l.userData.zone==='C'?3:12))})).sort((a,b)=>a.s-b.s).slice(0,LIGHT_POOL.length).map(o=>o.l); }
  // slots fade: a light leaving the nearest set dims out before its slot takes the next one, which then fades in
  const want=new Set(lightPick), held=new Set(LIGHT_POOL.map(p=>p.userData.src).filter(Boolean)), queue=lightPick.filter(l=>!held.has(l));
  LIGHT_POOL.forEach(p=>{ const u=p.userData; if(u.k===undefined){ u.k=0; u.src=null; }
    if(u.src&&!want.has(u.src)){ u.k=Math.max(0,u.k-dt*3); if(u.k===0) u.src=null; } else if(u.src) u.k=Math.min(1,u.k+dt*3);
    if(!u.src&&queue.length){ u.src=queue.shift(); u.k=0; }
    const v=u.src; if(!v){ p.intensity=0; return; } p.position.copy(v.userData.wp); p.color.copy(v.color); p.intensity=v.intensity*u.k; p.distance=v.distance; p.decay=v.decay; }); }
window.__enterHouse=enterHouse; window.__houseReady=true; { const b=document.getElementById('genter'); if(b&&!window.__wantEnter){ b.disabled=false; } } if(window.__wantEnter) enterHouse();
if(VRT.gate&&String(VRT.gate.body||'').trim()){ const s=document.getElementById('gsub'); if(s) s.textContent=String(VRT.gate.body).trim(); }
renderer.setAnimationLoop(()=>{ const dt=Math.min(0.05,clock.getDelta()); step(dt); updateAimHint(); tickPeople(dt); tickNPC(dt); tickSips(); tickFPS(dt); reflectOutdoors(); GATE_LAMP_MATERIAL.emissiveIntensity=.08+(1-THREE.MathUtils.smoothstep(SKY_DAY,.2,.55))*1.7; renderer.render(scene,camera); });
addEventListener('resize',()=>{ camera.aspect=innerWidth/innerHeight; baseFov=fovFor(camera.aspect); if(!isRightMouseDown) targetFov=baseFov; camera.fov=targetFov; camera.updateProjectionMatrix(); renderer.setSize(innerWidth,innerHeight); });

/* ---------------- boot ---------------- */
canvas.focus();
toast(isTouch?'拖曳看四周・右下角：聊天、跑、跳、蹲':'點畫面鎖定視角・滑鼠轉頭・右鍵+滾輪放大・左鍵互動/揮拳・V 第三人稱・W A S D 移動・Shift 跑・空白鍵跳・Z 蹲・M 麥克風・C 抽菸・Enter 聊天'+(myName==='訪客'?'・按「名字・裝扮」讓同伴認得你':''),9000);
renderPeople();
$('#bPlan').onclick=()=>setView('plan'); $('#bSmoke').onclick=()=>toggleSmoke(); $('#bThird').onclick=()=>toggleThirdPerson(); $('#bEntry').onclick=()=>setView('entry');
$('#pzIn').onclick=()=>planZoom(.8); $('#pzOut').onclick=()=>planZoom(1.25); $('#pTop').onclick=()=>{ VIEW.theta=Math.PI/2; VIEW.phi=.001; }; $('#pWalk').onclick=()=>setView('walk');
if(location.hash==='#plan') setTimeout(()=>setView('plan'),50); if(location.hash==='#entry') setTimeout(()=>setView('entry'),50);
buildBlinds();
(async()=>{
  const sample=new Set(); for(const b of BOOKS){ for(const ch of b[0]) sample.add(ch); for(const ch of (b[1]||'').slice(0,6)) sample.add(ch); } for(const p of POSTS) for(const ch of p.title) sample.add(ch);
  for(const s of [D.quote,'自反軒拈花記大樹跤知了間獺祭魚書庫總類哲學與心理學宗教自然應用社會科學歷史語文地理藝術一二三四五六七八九十月日',HOU.yu,HOU.term,HOU.hou]) for(const ch of s) sample.add(ch);
  const txt=[...sample].join('');
  try{ await Promise.race([Promise.all([document.fonts.load(F(600,20),txt),document.fonts.load(F(400,20),txt),document.fonts.load(F(700,20),txt),document.fonts.load('40px Reisho','學鳩齋獺祭魚書庫學古窮源觀物變鳩書養拙任天真知了間龍江衍派自反軒拈花記大樹足交總類哲與心理宗教然應用社會科歴史語文地藝術一二三')]),new Promise(r=>setTimeout(r,9000))]); }catch{}
  // redraw text textures that were built before fonts were ready
  for(const ci of CASES.keys()) buildCase(ci);
  buildCabinets(); buildPerimeterShelves(); buildPlaques();
  optimizeScene();
})();
// {% endraw %}
