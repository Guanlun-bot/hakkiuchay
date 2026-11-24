// {% raw %}
/* ================= 茶點與客飯：現做的茶點送到茶室、待客的飯菜 =================
   An order (from 阿春 or from 許總管's panel; guests may order too) goes into the shared state with its time: a runner
   takes it to the kitchen (許總管's way: 阿來, else 阿福, else 阿春 herself), 火師 makes it at its station for its minutes,
   and 阿春 carries it with a pot of tea to the tea room (茶室). Everyone sees the same: the dish is on the tea table from
   the same moment for all (served = ordered + 1 min + the minutes + 1 min), and someone coming in later finds it there.
   A meal for guests (2–8, now or at a time) is cooked by 火師 with 阿荷 washing and 阿春 cutting, laid on the round table
   in the 飯廳 and called by 阿春. Names and lines are in the back office (snack.<id>: name and 阿春's line; snack.cat.*). */
// where each kind of thing is made: the spot by the run or the table, and what the cook's hands do
const KST={
  steam:{at:P(45.3,-2.95),face:P(47,-2.95),act:'steam'}, oven:{at:P(45.35,-2.6),face:P(47,-2.6),act:'load'},
  fry:{at:P(45.3,-1.75),face:P(47,-1.75),act:'cook'}, pan:{at:P(45.3,-2.35),face:P(47,-2.35),act:'cook'},
  pot:{at:P(45.3,-.95),face:P(47,-.95),act:'prep'}, ice:{at:P(44.97,3.0),face:P(44.97,3.6),act:'prep'},
  mortar:{at:P(43.4,5.55),face:P(43.4,4.85),act:'sweep'}, table:{at:P(43.25,0),face:P(44,0),act:'prep'} };
// the menu: id, kind, equipment, minutes, the dish's shape and colours
const SNK=[
  ['mochi','tw','mortar',4,'plate',[0xf4efe6,0x5a4636]],['jiangui','tw','pan',3,'plate',[0xe9e2d0,0xc89a5a]],['fanshu','tw','fry',3,'plate',[0xd98a2e,0xb8742a]],['yuwan','tw','fry',3,'plate',[0x9a86a8,0xc9a96a]],
  ['douhua','tw','pot',2,'bowl',[0xf3ecd9,0xc9a05a]],['tangyuan','tw','pot',4,'bowl',[0x7a3a2a,0xf6f2ea]],['xingren','tw','fry',4,'cup',[0xefe6d2,0xd9a84a]],['runbing','tw','pan',4,'roll',[0xf1e8d2,0x5c8a3a]],
  ['baoice','tw','ice',2,'ice',[0xf7f7f4,0xb0402e]],['mangoice','tw','ice',2,'ice',[0xf7efd8,0xf2a830]],['wangue','tw','pot',4,'bowl',[0xd8c7a2,0x7a5a3a]],
  ['shaomai','hk','steam',5,'basket',[0xf3e6b8,0xe0b040]],['shuijing','hk','steam',5,'basket',[0xeef0e6,0x8ab070]],['chashao','hk','steam',5,'basket',[0xf6f1e4,0xb0503a]],['naihuang','hk','steam',5,'basket',[0xf6f1e4,0xf0c040]],
  ['liusha','hk','steam',5,'basket',[0xf6f1e4,0xe8a030]],['changfen','hk','steam',4,'roll',[0xf3f0e8,0x6a4a2a]],['luobo','hk','pan',4,'plate',[0xe8dcc0,0xc89a5a]],['mati','hk','pan',4,'plate',[0xd8b97a,0xe8d4a0]],
  ['xianzhu','hk','steam',5,'roll',[0xe0c48a,0x8a5a2a]],['chunjuan','hk','fry',3,'roll',[0xd99a40,0xc0802a]],['yujiao','hk','fry',4,'plate',[0xe0b060,0xc49040]],['jiandui','hk','fry',4,'plate',[0xd99a40,0xf2ead8]],
  ['dantat','hk','oven',5,'tart',[0xe8b45a,0xf2cc4a]],['yangzhi','hk','table',2,'cup',[0xf2b640,0xf6efe0]],['shuangpi','hk','table',2,'bowl',[0xf8f4ea,0xf0e6c8]],['mala','hk','steam',5,'slice',[0xc99a5a,0xb88a4a]],
  ['nuomi','hk','table',3,'plate',[0xf6f2ea,0xe9e0c8]],['doufuhua','hk','pot',2,'bowl',[0xf6f2ea,0xb9874a]],
  ['bolo','we','oven',5,'plate',[0xe8b45a,0xd99a40]],['scone','we','oven',5,'plate',[0xd8a868,0xf2ead8]],['madeleine','we','oven',4,'plate',[0xe0b060,0xc99040]],['financier','we','oven',4,'plate',[0xc8904a,0xb07a3a]],
  ['puff','we','oven',5,'plate',[0xe0b070,0xf6f0e0]],['millefeuille','we','oven',5,'slice',[0xf0e0b8,0xd8b070]],['croissant','we','oven',5,'plate',[0xd99a40,0xc0802a]],['chiffon','we','table',2,'slice',[0xf2e0a8,0xf6ecd0]],
  ['cheesecake','we','table',2,'slice',[0xf3e6c4,0xc89a5a]],['brownie','we','oven',4,'plate',[0x4a2e1e,0x6a4a32]],['souffle','we','oven',5,'cup',[0xe8c070,0xf6efe0]],['pudding','we','table',2,'tart',[0xf0c860,0x7a4a20]],
  ['pannacotta','we','table',2,'cup',[0xf8f4ea,0xb03040]],['tiramisu','we','table',2,'slice',[0xe8dcc0,0x6a4a32]],['applepie','we','oven',5,'slice',[0xd9a050,0xc08040]],['fruittart','we','table',3,'tart',[0xe0b060,0xc03a3a]],
  ['pancake','we','pan',3,'plate',[0xd9a050,0xf4e6b0]],['frtoast','we','pan',3,'plate',[0xd99a40,0xf2ead8]],['macaron','we','table',2,'plate',[0xe8a8b8,0xa8d0a0]],['cookie','we','oven',4,'plate',[0xc8904a,0x5a3a26]],
].map(([id,cat,eq,min,shape,col])=>({id,cat,eq,min,shape,col}));
const SNKI=Object.fromEntries(SNK.map(s=>[s.id,s]));
const snName=id=>NT('snack.'+id,0)||id;
const mangoMonth=()=>new Date(Date.now()+8*3600e3).getUTCMonth()+1, mangoRipe=()=>{ const m=mangoMonth(); return m===6||m===7; };
// timing of one order (ms from the order): the runner, the cooking, the carrying
const oTimes=o=>{ const s=SNKI[o.sk]||{min:3}; const cook=o.t0+60000, ready=cook+s.min*60000, served=ready+60000; return {cook,ready,served,gone:served+45*60000}; };

/* ---- the new things in the kitchen (as approved on the plan): an oven under the gas rings, a stack of bamboo steamers
   on the front-right ring, a deep fryer and an electric rice cooker on the worktop, an iron ice shaver on a stand by the
   rice jar, and a stone mortar outside under the eaves ---- */
const KGEAR={};
// the morning soy milk: 火師 is at the stone mill from 65 to 40 minutes before breakfast (then he goes in to cook)
const MILL={c:{x:44.72,z:4.85}, at:{x:44.72,z:5.6}, run:null, milk:null, stream:null};
const millTime=()=>{ const T=taipeiNow(), B=MEALS[0].at, r=T.min-B; return r>=-65&&r<-40&&!asleepAt(T.min)?(r+65)/25:-1; };
{ const M=(c,r=.6,o={})=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:r},o)), x0=KIT.run.x0;
  const put=(geo,m,x,y,z,par=scene,tag)=>{ const o=new THREE.Mesh(geo,m); o.position.set(x,y,z); par.add(o); if(tag){ o.userData=tag; pickables.push(o); } return o; };
  const bx=(w,h,d,m,x,y,z,par,tag)=>put(new THREE.BoxGeometry(w,h,d),m,x,y,z,par,tag), cy=(rt,rb,h,m,x,y,z,par,seg=20,tag)=>put(new THREE.CylinderGeometry(rt,rb,h,seg),m,x,y,z,par,tag);
  const enamel=M(0xf1ede4,.28), chrome=M(0xc9ccce,.22,{metalness:.85}), glass=M(0x1a1612,.15,{metalness:.2}), steelM=M(0xb9bec0,.3,{metalness:.75}), black=M(0x1b1a19,.45),
    bamboo=M(0xc9a66a,.75), bambooD=M(0xa98648,.8), wood=M(0x7a5232,.6,{map:T.wood}), iron=M(0x2e2c2a,.55,{metalness:.45}), granite=M(0x8f8b84,.95), red=M(0xb8322c,.38);
  const TG=k=>({type:'kg'+k});
  // 1 oven: an enamel front under the rings, a dark window, a chrome bar, a dial
  { const zc=-2.72, w=.8; bx(.014,.6,w,enamel,x0-.024,.44,zc,scene,TG('oven')); bx(.006,.3,w-.24,glass,x0-.033,.46,zc); bx(.004,.32,w-.22,chrome,x0-.031,.46,zc);
    const bar=cy(.011,.011,w-.16,chrome,x0-.07,.7,zc); bar.rotation.x=Math.PI/2; for(const s of [-1,1]) bx(.05,.012,.012,chrome,x0-.05,.7,zc+s*(w/2-.1));
    const dial=cy(.026,.026,.02,M(0x2a2827,.4),x0-.04,.2,zc+w/2-.09,scene,16); dial.rotation.z=Math.PI/2; KGEAR.oven={x:x0-.04,z:zc}; }
  // 2 the steamer stack on the front-right ring: three bamboo baskets and a lid
  { const sx=x0+.16, sz=-2.52, g=new THREE.Group(); g.position.set(sx,.975,sz); scene.add(g); const tag=TG('steam');
    for(let i=0;i<3;i++){ const r=put(new THREE.CylinderGeometry(.13,.13,.07,24,1,true),bamboo,0,.035+i*.072,0,g); r.material.side=THREE.DoubleSide; for(const y of [.005,.065]) put(new THREE.TorusGeometry(.13,.006,5,24),bambooD,0,y+i*.072,0,g).rotation.x=Math.PI/2; }
    const lid=put(new THREE.SphereGeometry(.132,20,8,0,Math.PI*2,0,Math.PI/2.6),bamboo,0,.216,0,g); lid.scale.y=.45; put(new THREE.TorusGeometry(.03,.006,5,12),bambooD,0,.262,0,g);
    g.traverse(c=>{ if(c.isMesh){ c.userData=tag; pickables.push(c); } }); KGEAR.steam={x:sx,y:1.24,z:sz}; }
  // 3 the fryer, built into the worktop as in a fast-food kitchen: a steel frame flush with the top round one oil well, two
  //   wire baskets with long handles toward the cook (hung up on the back rail to drain), a steel cover over the well when
  //   it is not in use; on the front of the counter below, the panel: two thermostats, two timers, a lamp
  { const fx=x0+.3, fz=-1.72, top=.905, tag=TG('fry'), oil=M(0x6a4a1a,.12,{metalness:.25}), wire=M(0x9a9ea0,.4,{metalness:.6,wireframe:true});
    bx(.56,.012,.52,steelM,fx,top,fz,scene,tag); bx(.44,.008,.4,M(0x2a2826,.4),fx,top+.004,fz);   // the frame, the well's dark rim
    const oilP=bx(.4,.004,.36,oil,fx,top-.05,fz,scene,tag); bx(.02,.06,.4,steelM,fx+.21,top+.03,fz);   // the oil, the back rail
    const baskets=[]; for(const dz of [-.095,.095]){ const g=new THREE.Group(); scene.add(g); const b=put(new THREE.BoxGeometry(.3,.1,.16),wire,0,0,0,g,tag); const h=cy(.01,.01,.26,black,-.27,.05,0,g); h.rotation.z=Math.PI/2-.25; put(new THREE.BoxGeometry(.06,.025,.03),black,-.4,.08,0,g); baskets.push({g,dz}); }
    const lid=bx(.42,.008,.38,steelM,fx,top+.008,fz,scene,tag);
    const panel=bx(.006,.16,.46,black,x0-.004,.78,fz,scene,tag); const lamps=[]; for(const dz of [-.12,.12]){ const d=cy(.022,.022,.016,M(0x2a2827,.4),x0-.012,.8,fz+dz,scene,14); d.rotation.z=Math.PI/2; const dg=bx(.004,.025,.06,new THREE.MeshBasicMaterial({color:0x3a1a10}),x0-.01,.74,fz+dz); lamps.push(dg); }
    const bubbles=[]; for(let i=0;i<14;i++){ const q=put(new THREE.SphereGeometry(.008,6,4),M(0xd9b26a,.3),fx+(Math.random()-.5)*.34,top-.045,fz+(Math.random()-.5)*.3); q.visible=false; bubbles.push(q); }
    KGEAR.fry={x:fx,y:1.0,z:fz}; KGEAR.fryer={fx,fz,top,baskets,lid,lamps,bubbles}; }
  // 4 the electric rice cooker: a round body, a domed lid with a knob, side handles, a switch
  { const tag=TG('pot'), rx=x0+.22, rz=-.78, g=new THREE.Group(); g.position.set(rx,.9,rz); scene.add(g);
    put(new THREE.CylinderGeometry(.13,.12,.2,28),red,0,.1,0,g); put(new THREE.CylinderGeometry(.131,.131,.012,28),chrome,0,.2,0,g);
    const lid=put(new THREE.SphereGeometry(.128,24,8,0,Math.PI*2,0,Math.PI/2),chrome,0,.2,0,g); lid.scale.y=.35; put(new THREE.SphereGeometry(.02,10,8),black,0,.25,0,g);
    for(const s of [-1,1]){ const hd=put(new THREE.TorusGeometry(.03,.007,5,10,Math.PI),black,0,.17,s*.14,g); hd.rotation.y=s>0?0:Math.PI; hd.rotation.x=0; }
    put(new THREE.BoxGeometry(.02,.03,.03),black,-.13,.05,0,g); put(new THREE.CircleGeometry(.005,8),M(0xff8a3a,.4,{emissive:0xff6a1a,emissiveIntensity:.6}),-.131,.09,0,g).rotation.y=-Math.PI/2;
    g.traverse(c=>{ if(c.isMesh){ c.userData=tag; pickables.push(c); } }); KGEAR.pot={x:rx,y:1.15,z:rz}; }
  // 5 the ice shaver on its own small stand: a cast-iron frame, a wheel with a crank, a bowl under the blade
  { const tag=TG('ice'), ix=44.97, iz=3.6, g=new THREE.Group(); g.position.set(ix,0,iz); g.rotation.y=Math.PI; scene.add(g);   // right beside the rice jar, the bowl toward the room
    for(const [x,z] of [[-.17,-.17],[.17,-.17],[-.17,.17],[.17,.17]]) put(new THREE.BoxGeometry(.045,.72,.045),wood,x,.36,z,g); put(new THREE.BoxGeometry(.44,.04,.44),wood,0,.74,0,g); put(new THREE.BoxGeometry(.36,.02,.36),wood,0,.18,0,g);
    put(new THREE.BoxGeometry(.24,.03,.2),iron,0,.775,0,g); for(const s of [-1,1]) put(new THREE.BoxGeometry(.03,.42,.04),iron,s*.1,.99,-.06,g); put(new THREE.BoxGeometry(.24,.04,.06),iron,0,1.2,-.06,g);
    put(new THREE.CylinderGeometry(.085,.085,.05,20),M(0xd8dcdc,.2,{metalness:.6}),0,1.06,-.06,g); const wh=put(new THREE.TorusGeometry(.11,.012,6,24),iron,.15,1.1,-.06,g); wh.rotation.y=Math.PI/2;
    const ck=put(new THREE.CylinderGeometry(.01,.01,.1,8),wood,.17,1.2,-.02,g); ck.rotation.x=Math.PI/2; put(new THREE.CylinderGeometry(.06,.04,.04,16),M(0xf6f3ec,.3),0,.81,.02,g);
    g.traverse(c=>{ if(c.isMesh){ c.userData=tag; pickables.push(c); } }); OB(ix-.3,ix+.3,iz-.3,iz+.3); }
  // 6 the stone mortar outside under the eaves, a wooden mallet leaning on it
  { const mx=43.4, mz=4.85; cy(.3,.34,.42,granite,mx,.21,mz,scene,24,TG('mortar')); const bowl=put(new THREE.CircleGeometry(.22,24),M(0x6e6a64,.95),mx,.422,mz); bowl.rotation.x=-Math.PI/2;
    const g=new THREE.Group(); g.position.set(mx+.36,0,mz+.08); g.rotation.z=.32; scene.add(g); put(new THREE.CylinderGeometry(.02,.022,.9,8),wood,0,.45,0,g); const hd=put(new THREE.CylinderGeometry(.075,.075,.26,14),wood,0,.92,0,g); hd.rotation.z=Math.PI/2;
    OB(mx-.36,mx+.48,mz-.36,mz+.36); KGEAR.mortar={x:mx,y:.5,z:mz}; }
  // 7 the stone mill between the mortar and the woodpile, on a low wooden stand: a granite bed with a channel round it and a
  //   spout, the runner stone on top with a feed hole and an upright wooden handle; a pail under the spout for the soy milk.
  //   火師 grinds the soaked beans here every morning before breakfast (MILL), the runner turning as he works it.
  { const cx=44.72, cz=4.85, tag=TG('mill'), g=new THREE.Group(); g.position.set(cx,0,cz); scene.add(g);
    const granL=M(0xa9aaa4,.95), granD=M(0x8d8e88,.95), soy=M(0xf1ead6,.5);
    for(const [x,z] of [[-.25,-.25],[.25,-.25],[-.25,.25],[.25,.25]]) put(new THREE.BoxGeometry(.06,.5,.06),wood,x,.25,z,g,tag);
    put(new THREE.BoxGeometry(.62,.05,.62),wood,0,.52,0,g,tag); put(new THREE.BoxGeometry(.54,.03,.54),wood,0,.12,0,g);
    // the bed: a thick disc with a raised outer rim, so a channel runs round the runner; the spout toward the woodpile
    put(new THREE.CylinderGeometry(.34,.36,.12,28),granD,0,.605,0,g,tag);
    const rim=new THREE.Mesh(new THREE.TorusGeometry(.315,.03,6,28),granL); rim.rotation.x=Math.PI/2; rim.position.y=.67; rim.scale.set(1,1,1.6); g.add(rim); rim.userData=tag; pickables.push(rim);
    put(new THREE.CircleGeometry(.29,28),M(0x9c9d97,.95),0,.666,0,g).rotation.x=-Math.PI/2;
    const sp=put(new THREE.BoxGeometry(.2,.07,.12),granD,.4,.62,0,g,tag); put(new THREE.BoxGeometry(.16,.01,.06),M(0x7d7e78,.9),.42,.657,0,g);
    // the runner: turns about its axis
    const run=new THREE.Group(); run.position.y=.67; g.add(run); put(new THREE.CylinderGeometry(.22,.225,.22,28),granL,0,.11,0,run,tag);
    put(new THREE.CylinderGeometry(.18,.18,.012,24),granD,0,.221,0,run); put(new THREE.CylinderGeometry(.03,.03,.014,10),M(0x3a3936,.9),.07,.224,0,run);
    const hd=put(new THREE.CylinderGeometry(.02,.022,.22,10),M(0xc79a68,.6),.17,.33,0,run,tag); for(const y of [.36,.39]) put(new THREE.TorusGeometry(.021,.003,4,12),M(0x8a6440,.6),.17,y,0,run).rotation.x=Math.PI/2;
    put(new THREE.BoxGeometry(.05,.03,.1),M(0xc79a68,.6),.17,.235,0,run);
    // the pail, and the white of the milk rising in it while he grinds; a thin white stream from the spout
    const pail=put(new THREE.CylinderGeometry(.13,.11,.28,16,1,true),M(0x8a6a48,.7,{side:THREE.DoubleSide}),.56,.14,0,g,tag); put(new THREE.CircleGeometry(.11,16),M(0x6a5038,.8),.56,.005,0,g).rotation.x=-Math.PI/2;
    for(const y of [.05,.23]) put(new THREE.TorusGeometry(.125-y*.07,.006,4,16),M(0x2e2c2a,.5,{metalness:.4}),.56,y,0,g).rotation.x=Math.PI/2;
    const milk=put(new THREE.CircleGeometry(.118,16),soy,.56,.02,0,g); milk.rotation.x=-Math.PI/2;
    const stream=put(new THREE.CylinderGeometry(.008,.008,1,6),soy,.5,.4,0,g); stream.visible=false;
    OB(cx-.34,cx+.72,cz-.34,cz+.34); MILL.run=run; MILL.milk=milk; MILL.stream=stream; } }
// steam from the steamer while something is in it; a shimmer over the fryer
{ const pm=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,depthWrite:false}); const puffs=[]; for(let i=0;i<10;i++){ const p=new THREE.Mesh(new THREE.SphereGeometry(.05,8,6),pm.clone()); p.visible=false; scene.add(p); puffs.push(p); MEAL_DYN.push(p); }
  ZL_ANIM.push(()=>{ const huo=NPC.huo, L=(HOUSE.orders||[]), now=Date.now(); let at=null;
    for(const o of L){ const T=oTimes(o), s=SNKI[o.sk]; if(s&&now>=T.cook&&now<T.ready&&(s.eq==='steam'||s.eq==='fry'||s.eq==='pot')){ at=KGEAR[s.eq]; break; } }
    const F=KGEAR.fryer; if(F){ let fry=false, drain=false; for(const o of L){ const T=oTimes(o), s=SNKI[o.sk]; if(s&&s.eq==='fry'){ if(now>=T.cook&&now<T.ready) fry=true; else if(now>=T.ready&&now<T.ready+40000) drain=true; } }
      const open=fry||drain, tt=performance.now()/1000; F.lid.position.x=F.fx+(open?-.46:0); F.lid.position.y=F.top+(open?.0:.008); F.lid.visible=!open;
      F.baskets.forEach(({g,dz},i)=>{ if(fry){ g.position.set(F.fx-.01,F.top-.07+Math.sin(tt*3+i)*.004,F.fz+dz); g.rotation.z=0; } else { g.position.set(F.fx+.14,F.top+.09,F.fz+dz); g.rotation.z=.55; } });
      F.lamps.forEach(l=>l.material.color.setHex(fry?0x4aff7a:drain?0xffb040:0x3a1a10)); F.bubbles.forEach((q,i)=>{ q.visible=fry; if(fry){ const ph=(tt*1.8+i*.37)%1; q.position.y=F.top-.05+ph*.012; q.scale.setScalar(.6+ph); } }); }
    const t=performance.now()/1000; puffs.forEach((p,i)=>{ if(!at){ p.visible=false; return; } const ph=(t*.45+i/puffs.length)%1; p.visible=true; p.position.set(at.x+Math.sin(i*2.3+t)*.05,at.y+ph*.7,at.z+Math.cos(i*1.7)*.05); p.material.opacity=(1-ph)*.3; p.scale.setScalar(.6+ph*1.4); }); }); }

/* ---- the dishes ---- */
const SNK_DYN=[];
const snMat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.7});
function snMesh(s){ const g=new THREE.Group(), [a,b]=s.col, porc=snMat(0xf6f3ec), M=(geo,m,x,y,z)=>{ const o=new THREE.Mesh(geo,m); o.position.set(x,y,z); g.add(o); return o; };
  const plate=r=>M(new THREE.CylinderGeometry(r,r*.8,.015,20),porc,0,.008,0);
  switch(s.shape){
    case 'basket': { const bam=snMat(0xc8a46a); M(new THREE.CylinderGeometry(.11,.11,.055,18,1,true),bam,0,.03,0).material.side=THREE.DoubleSide; M(new THREE.CircleGeometry(.105,18),snMat(0xd8c08a),0,.006,0).rotation.x=-Math.PI/2;
      for(let i=0;i<3;i++){ const q=M(new THREE.SphereGeometry(.035,10,8),snMat(a),Math.cos(i*2.1)*.05,.035,Math.sin(i*2.1)*.05); q.scale.y=.8; M(new THREE.SphereGeometry(.009,6,5),snMat(b),q.position.x,.064,q.position.z); } break; }
    case 'bowl': { const bw=M(new THREE.CylinderGeometry(.065,.04,.05,18,1,true),porc,0,.03,0); bw.material.side=THREE.DoubleSide; M(new THREE.CircleGeometry(.06,18),snMat(a),0,.045,0).rotation.x=-Math.PI/2;
      for(let i=0;i<4;i++) M(new THREE.SphereGeometry(.012,6,5),snMat(b),Math.cos(i*1.6)*.025,.048,Math.sin(i*1.6)*.025); break; }
    case 'cup': { const gl=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.1,transparent:true,opacity:.35}); M(new THREE.CylinderGeometry(.04,.035,.09,16,1,true),gl,0,.05,0);
      M(new THREE.CylinderGeometry(.037,.033,.07,16),snMat(a),0,.04,0); M(new THREE.CylinderGeometry(.037,.037,.012,16),snMat(b),0,.08,0); plate(.06); break; }
    case 'ice': { M(new THREE.CylinderGeometry(.075,.045,.04,18),porc,0,.02,0); const m=M(new THREE.SphereGeometry(.07,14,10),snMat(a),0,.05,0); m.scale.y=.85;
      for(let i=0;i<6;i++) M(new THREE.SphereGeometry(.014,6,5),snMat(i%2?b:0x5a7a2a),Math.cos(i)*.04,.09+Math.sin(i*3)*.01,Math.sin(i)*.04); break; }
    case 'roll': { plate(.1); for(let i=0;i<3;i++){ const r=M(new THREE.CylinderGeometry(.018,.018,.09,10),snMat(a),-.035+i*.035,.03,0); r.rotation.x=Math.PI/2; M(new THREE.CylinderGeometry(.006,.006,.091,6),snMat(b),r.position.x,.03,0).rotation.x=Math.PI/2; } break; }
    case 'tart': { plate(.09); for(let i=0;i<3;i++){ const x=Math.cos(i*2.1)*.04, z=Math.sin(i*2.1)*.04; M(new THREE.CylinderGeometry(.026,.02,.018,14),snMat(a),x,.024,z); M(new THREE.CylinderGeometry(.021,.021,.004,14),snMat(b),x,.034,z); } break; }
    case 'slice': { plate(.085); const sh=new THREE.Shape(); sh.moveTo(0,0); sh.absarc(0,0,.09,-.35,.35,false); sh.lineTo(0,0); const geo=new THREE.ExtrudeGeometry(sh,{depth:.05,bevelEnabled:false}); const w=M(geo,snMat(a),-.04,.016,0); w.rotation.x=-Math.PI/2;
      const top=new THREE.ExtrudeGeometry(sh,{depth:.006,bevelEnabled:false}); const t2=M(top,snMat(b),-.04,.066,0); t2.rotation.x=-Math.PI/2; break; }
    default: { plate(.095); for(let i=0;i<5;i++){ const x=Math.cos(i*1.25)*.045, z=Math.sin(i*1.25)*.045; const q=M(new THREE.SphereGeometry(.024,10,8),snMat(i%2?b:a),x,.028,z); q.scale.y=.65; } } }
  // a little pot of tea and a cup beside it
  const tp=M(new THREE.SphereGeometry(.045,12,10),snMat(0x5a3428),.16,.045,.02); tp.scale.y=.85; M(new THREE.CylinderGeometry(.006,.009,.05,6),snMat(0x5a3428),.21,.06,.02).rotation.z=-.9;
  M(new THREE.CylinderGeometry(.022,.016,.03,12),porc,.12,.016,-.09);
  return g; }
// on the tea table: one place for each dish, in two rows along the table
const TEA_T=ZP.modern, SNACK_ON=new Map();
function snPlace(slot){ const i=slot%6, row=Math.floor(i/3); return {x:TEA_T.cx-.75+(i%3)*.75, y:TEA_T.h+.004, z:TEA_T.cz-.2+row*.38}; }
function snShow(o,slot){ if(SNACK_ON.has(o.id)) return; const s=SNKI[o.sk]; if(!s) return; const g=snMesh(s), p=snPlace(slot); g.position.set(p.x,p.y,p.z); g.rotation.y=Math.PI*(slot%2?.1:-.1); scene.add(g); SNACK_ON.set(o.id,g);
  g.traverse(c=>{ if(c.isMesh){ c.userData={type:'snackdish',oid:o.id}; pickables.push(c); } }); }
function snHide(id){ const g=SNACK_ON.get(id); if(!g) return; scene.remove(g); g.traverse(c=>{ if(c.isMesh){ const i=pickables.indexOf(c); if(i>=0) pickables.splice(i,1); c.geometry.dispose(); } }); SNACK_ON.delete(id); }
// the dish in 阿春's hands on the way (a plain tray with a cover)
for(const id of ['chun','he']){ const n=NPC[id]; if(n&&n.propG){ const P0=n.g.userData.parts, h=new THREE.Group(); const tray=new THREE.Mesh(new THREE.BoxGeometry(.34,.02,.24),snMat(0x6a4630)); h.add(tray); const cv=new THREE.Mesh(new THREE.SphereGeometry(.09,12,8,0,Math.PI*2,0,Math.PI/2),snMat(0xd8d2c4)); cv.position.y=.01; h.add(cv);
    const tp=new THREE.Mesh(new THREE.SphereGeometry(.04,10,8),snMat(0x5a3428)); tp.position.set(.11,.04,.05); h.add(tp); h.visible=false; n.propG.mail.parent.add(h); n.propG.tray=h; } }

/* ---- running the orders: each browser plays the same times ---- */
const RUN=new Map();   // order id → this browser's progress
const freeForRun=id=>{ const n=NPC[id]; return n&&n.g.visible&&!n.lie&&!n.look&&!n.follow&&!n.gather&&!n.cineW&&!n.lead&&!n.tl&&!(n.errand&&!n.snackJob); };
function orderRun(o,slot){ const now=Date.now(), T=oTimes(o); let R=RUN.get(o.id); if(!R){ R={st:0}; RUN.set(o.id,R); }
  if(now>=T.gone){ snHide(o.id); RUN.delete(o.id); return; }
  if(now>=T.served){ if(R.st<5){ R.st=5; snShow(o,slot); const c=NPC.chun; if(c.snackJob===o.id){ c.snackJob=null; c.prop=null; c.errand=false; c.busyUntil=0; } } return; }
  const huo=NPC.huo, chun=NPC.chun, s=SNKI[o.sk], K=KST[s.eq]||KST.table;
  // the runner: from beside 許總管 to the kitchen door, then back to work
  if(R.st<1){ R.st=1; if(now<T.cook-15000){ const rid=o.via==='chun'?'chun':['lai','fu','chun'].find(freeForRun); if(rid){ const r=NPC[rid]; leaveSpot(r); r.snackJob=o.id; if(o.via==='xu'&&near(NPC.xu,10)) npcSay('xu',npcLine('snack.send',{名:npcName(rid)}));
        doErrand(r,(o.via==='xu'?[{to:()=>({x:NPC.xu.x+.7,z:NPC.xu.z+.3}),face:()=>NPC.xu,dur:1500}]:[]).concat([{to:P(43.2,-1.6),face:()=>NPC.huo,dur:2500,on:m=>{ if(near(m,9)) npcSay(m.id,npcLine('snack.tell',{菜:snName(o.sk)})); }}]),m=>{ m.snackJob=null; }); } } }
  // the cook: at the station from cook to ready
  if(R.st<2&&now>=T.cook-10000){ R.st=2; if(!huo.lie&&!huo.look&&!huo.gather&&!huo.cineW){ leaveSpot(huo); huo.snackJob=o.id; if(near(huo,9)) npcSay('huo',npcLine('snack.huo',{菜:snName(o.sk)}));
      doErrand(huo,[{to:K.at,face:K.face,act:K.act,dur:Math.max(5000,T.ready-Date.now())}],m=>{ m.snackJob=null; if(near(m,9)) npcSay('huo',npcLine('snack.ready',{菜:snName(o.sk)})); }); } }
  // 阿春 comes for it as it is done, and takes it with a pot of tea to the tea room
  if(R.st<3&&now>=T.ready-25000){ R.st=3; if(freeForRun('chun')||chun.snackJob){ leaveSpot(chun); chun.snackJob=o.id;
      doErrand(chun,[{to:P(43.2,-2.2),face:P(45,-2.2),act:'load',dur:Math.max(3000,T.ready-Date.now()+3000)},{to:()=>NP.tea,prop:'tray',act:'unload',drop:true,dur:3000,on:m=>{ snShow(o,slot); R.st=5; if(near(m,9)) npcSay('chun',String(NT('snack.'+o.sk,1)||npcLine('snack.served',{菜:snName(o.sk)})).replace(/\{稱呼\}/g,titleFill().稱呼)); }}],m=>{ m.snackJob=null; }); } }
}
setInterval(()=>{ if(!window.__entered) return; const L=(HOUSE.orders||[]); L.forEach((o,i)=>orderRun(o,i)); for(const id of [...SNACK_ON.keys()]) if(!L.some(o=>o.id===id)) snHide(id); for(const id of [...RUN.keys()]) if(!L.some(o=>o.id===id)) RUN.delete(id); },1000);
function orderSnack(sk,via){ const now=Date.now(); const keep=(HOUSE.orders||[]).filter(o=>now<oTimes(o).gone); if(keep.length>=6){ npcSay(via,npcLine('snack.full')); return; }
  const o={id:MY_PID.slice(0,6)+now.toString(36),sk,by:myName,t0:now,via}; hAct({orders:keep.concat([o])}); npcSay(via,npcLine(via==='xu'?'snack.okX':'snack.okC',{菜:snName(sk),分:SNKI[sk].min+2})); }
// clearing a dish from the tea table: click it
const SNB=new Map();
window.__snackAct=u=>{ const o=(HOUSE.orders||[]).find(o=>o.id===u.oid); if(!o) return; const nm=snName(o.sk), s=SNKI[o.sk]; let left=SNB.has(o.id)?SNB.get(o.id):4;
  if(left===4) toast(String(NT('snack.eat')).replace('{菜}',nm),2000);
  left--; SNB.set(o.id,left); try{ noiseBurst(.05,1600,4,.04); }catch{}
  const k=FOOD.kindOf(nm); if(s&&s.eq==='ice') k.push('cool'); if(s&&(s.eq==='pot'||s.eq==='steam')) k.push('warm'); if(left===3) setTimeout(()=>FOOD.fx(k,nm),600); else if(left>0) toast(NT('food.bited').replace('{名}',nm),1500);
  if(left<=0){ setTimeout(()=>{ snHide(o.id); toast(NT('food.done').replace('{名}',nm),2200); },600); } };
// the menu, in a panel: three kinds, a name each
function snackMenu(via){ const cats=['tw','hk','we'];
  const body=openPanel(NT('snack.title')||'茶點',`<div class="bp">${cats.map(c=>`<h4>${esc(NT('snack.cat.'+c))}</h4><div class="bl">${SNK.filter(s=>s.cat===c&&(s.id!=='mangoice'||mangoRipe())).map(s=>`<button type="button" data-s="${s.id}">${esc(snName(s.id))}</button>`).join('')}</div>`).join('')}<p class="meta">${esc(NT('snack.note'))}</p></div>`);
  body.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{ closePanel(); orderSnack(b.dataset.s,via); }); }
FOOD_EXTRA.push((pane)=>{ const L=(HOUSE.orders||[]).filter(o=>Date.now()<oTimes(o).gone);
  const d=document.createElement('div'); d.innerHTML=`<h4>${esc(NT('snack.title'))}</h4>`+(L.length?L.map(o=>{ const T=oTimes(o), now=Date.now(); const st=now>=T.served?NT('snack.stDone'):now>=T.cook?NT('snack.st',1):NT('snack.st',0); return `<p>${esc(snName(o.sk))}<span class="meta">　${esc(st)}　${esc(o.by||'')}</span></p>`; }).join(''):'')+`<div class="bl"><button type="button" id="bsn">${esc(NT('snack.order'))}</button></div>`;
  d.querySelector('#bsn').onclick=()=>snackMenu('xu'); pane.append(d); });

/* ---- a meal for guests ---- */
const GMEAL={on:false};
window.__guestMealOn=()=>{ const G=HOUSE.gmeal; if(!G) return false; const now=Date.now(); return now>=G.at-60000&&now<G.at+75*60000; };
const gmTimes=G=>({cook:G.at-Math.min(25,Math.max(6,(G.at-G.t0)/60000))*60000,lay:G.at-60000,end:G.at+75*60000});
let GM=null;
setInterval(()=>{ const G=HOUSE.gmeal, now=Date.now(); if(!window.__entered) return;
  if(!G){ if(GM){ for(const id of ['huo','he','chun']){ const n=NPC[id]; if(n.gmJob){ n.gmJob=false; n.errand=false; n.busyUntil=0; n.act='idle'; } } GM=null; } return; }
  const T=gmTimes(G); if(!GM||GM.at!==G.at){ GM={at:G.at,st:0}; }
  if(now>=T.end){ if(hRank()===0) hAct({gmeal:null}); return; }
  const job=(id,steps,done)=>{ const n=NPC[id]; if(n.lie||n.look||n.gather||n.cineW||n.lead) return; leaveSpot(n); n.gmJob=true; doErrand(n,steps,m=>{ m.gmJob=false; if(done) done(m); }); };
  if(GM.st<1&&now>=T.cook&&now<T.lay){ GM.st=1; const left=Math.max(10000,T.lay-now-20000);
    job('huo',[{to:()=>NP.stove,face:P(47,NP.stove.z),act:'cook',dur:left*.5},{to:KST.pan.at,face:KST.pan.face,act:'cook',dur:left*.5}]);
    job('he',[{to:()=>NP.sink,face:P(47,-.05),act:'wash',dur:left}]);
    job('chun',[{to:KST.table.at,face:KST.table.face,act:'prep',dur:left}]); }
  if(GM.st<2&&now>=T.lay-20000&&now<T.end){ GM.st=2;
    job('chun',[{to:P(43.2,-1.2),act:'load',dur:2500,prop:'tray'},{to:P(40.2,-2.5),face:()=>({x:DINE.x,z:DINE.z}),act:'unload',drop:true,dur:4000,on:m=>{ if(near(m,14)) npcSay('chun',npcLine('gm.call',{人:G.n})); toast(NT('gm.toast'),6000); }}]);
    job('he',[{to:P(43.2,-.6),act:'load',dur:3000,prop:'tray'},{to:P(39.2,-1.4),face:()=>({x:DINE.x,z:DINE.z}),act:'unload',drop:true,dur:4000}]); }
  if(GM.st<3&&now>=T.lay){ GM.st=3; } },1500);
FOOD_EXTRA.push((pane,boss)=>{ const G=HOUSE.gmeal, d=document.createElement('div');
  if(G){ d.innerHTML=`<h4>${esc(NT('gm.title'))}</h4><p>${esc(String(NT('gm.set')).replace('{人}',G.n).replace('{時}',hhmm(((taipeiNow().min+(G.at-Date.now())/60000)%1440+1440)%1440)).replace('{誰}',G.by||''))}</p><p class="meta">${esc(String(NT('gm.menu')).split(/\n+/).join('、'))}</p><div class="bl"><button type="button" id="bgmx">${esc(NT('gm.cancel'))}</button></div>`;
    d.querySelector('#bgmx').onclick=()=>{ hAct({gmeal:null}); bRender(); }; pane.append(d); return; }
  if(!boss) return;
  d.innerHTML=`<h4>${esc(NT('gm.title'))}</h4><p>${esc(NT('gm.how'))}　<select id="bgmn">${[2,3,4,5,6,7,8].map(n=>`<option>${n}</option>`).join('')}</select>　<input id="bgmt" type="time" value="${hhmm(Math.ceil((taipeiNow().min+30)/5)*5%1440)}"></p><p class="meta">${esc(String(NT('gm.menu')).split(/\n+/).join('、'))}</p><div class="bl"><button type="button" id="bgmgo">${esc(NT('gm.at'))}</button><button type="button" id="bgmnow">${esc(NT('gm.now'))}</button></div>`;
  const go=at=>{ const n=+d.querySelector('#bgmn').value; hAct({gmeal:{n,at,t0:Date.now(),by:myName}}); npcSay('xu',npcLine('gm.ok',{人:n})); bRender(); };
  d.querySelector('#bgmgo').onclick=()=>{ const m=/^(\d{1,2}):(\d{2})/.exec(d.querySelector('#bgmt').value); if(!m) return; let dm=(+m[1]*60+ +m[2])-taipeiNow().min; if(dm<0) dm+=1440; go(Date.now()+Math.max(8,dm)*60000); };
  d.querySelector('#bgmnow').onclick=()=>go(Date.now()+8*60000); pane.append(d); });
GUEST_EXTRA.push(pane=>{ const d=document.createElement('div'); d.innerHTML=`<div class="bl"><button type="button" id="bgsn">${esc(NT('snack.order'))}</button><button type="button" id="bggm">${esc(NT('gm.title'))}</button></div>`;
  d.querySelector('#bgsn').onclick=()=>snackMenu('xu'); d.querySelector('#bggm').onclick=()=>{ bTab=TABS.indexOf('food'); bRender(); }; pane.append(d); });
window.__food={SNK,KST,orderSnack,snackMenu,snMesh,RUN,oTimes};

/* ================= 過廳的留聲機：西北角，大家聽到同一張 =================
   A horn gramophone on a small cabinet in the 過廳's north-west corner. Click it for the records (back office: records,
   title and the R2 address of each file); what is on and from when is shared by everyone in the house (relay {k:'house'},
   state gramo) and handed to whoever comes in; the sound is loud by it and fades across the hall and the courts. */
const GRAMO={x:26.0,z:14.35,yaw:Math.atan2(-(29.4-26.0),-(9.8-14.35))};
const RECS=(Array.isArray(VRD.records)?VRD.records:[]).filter(r=>r&&String(r.url||'').trim()).map(r=>({t:String(r.title||'').trim()||String(r.url).split('/').pop(),a:String(r.artist||'').trim(),u:String(r.url).trim()}));
{ const g=new THREE.Group(); g.position.set(GRAMO.x,0,GRAMO.z); g.rotation.y=GRAMO.yaw; scene.add(g); GRAMO.g=g;
  const wood=new THREE.MeshStandardMaterial({map:T.wood,color:0x8a5a34,roughness:.55}), dark=new THREE.MeshStandardMaterial({color:0x2a1c14,roughness:.5}),
    brass=new THREE.MeshStandardMaterial({color:0xc9a050,metalness:.85,roughness:.32,side:THREE.DoubleSide}), felt=new THREE.MeshStandardMaterial({color:0x5a1e1e,roughness:.95}), blk=new THREE.MeshStandardMaterial({color:0x111111,roughness:.35});
  const add=(geo,m,x,y,z)=>{ const o=new THREE.Mesh(geo,m); o.position.set(x,y,z); g.add(o); o.userData={type:'gramo'}; pickables.push(o); return o; };
  // the cabinet: legs, a body with two doors, a lid
  for(const [x,z] of [[-.24,-.2],[.24,-.2],[-.24,.2],[.24,.2]]) add(new THREE.BoxGeometry(.05,.3,.05),dark,x,.15,z);
  add(new THREE.BoxGeometry(.56,.48,.48),wood,0,.54,0); for(const x of [-.135,.135]) add(new THREE.BoxGeometry(.25,.36,.01),wood,x,.54,.245);
  for(const x of [-.03,.03]) add(new THREE.SphereGeometry(.012,8,6),brass,x,.54,.255);
  add(new THREE.BoxGeometry(.6,.03,.52),dark,0,.795,0);
  // the turntable and a record, the tone arm, the crank
  add(new THREE.CylinderGeometry(.17,.17,.02,28),felt,-.05,.82,0); const rec=add(new THREE.CylinderGeometry(.155,.155,.006,28),blk,-.05,.834,0); GRAMO.rec=rec;
  add(new THREE.CylinderGeometry(.04,.04,.008,16),new THREE.MeshStandardMaterial({color:0xb03a2a,roughness:.6}),-.05,.839,0);
  add(new THREE.CylinderGeometry(.018,.022,.06,10),brass,.2,.84,.16); const arm=add(new THREE.CylinderGeometry(.008,.008,.24,8),brass,.1,.87,.08); arm.rotation.z=Math.PI/2; arm.rotation.y=.7;
  const ck=add(new THREE.CylinderGeometry(.008,.008,.16,8),brass,.3,.6,.0); ck.rotation.z=Math.PI/2;
  // the horn: a brass tulip rising from behind and opening forward
  const pts=[]; for(let i=0;i<=24;i++){ const t=i/24; pts.push(new THREE.Vector2(.018+.29*Math.pow(t,2.6),t*.62)); }
  const horn=add(new THREE.LatheGeometry(pts,28),brass,0,0,0); horn.position.set(.2,.86,.16); horn.rotation.set(-Math.PI/2+.55,0,0); horn.translateY(0);
  const neck=add(new THREE.TorusGeometry(.06,.012,8,16,Math.PI),brass,.2,.9,.16); neck.rotation.y=Math.PI/2;
  OB(GRAMO.x-.36,GRAMO.x+.36,GRAMO.z-.36,GRAMO.z+.36); ZL_DYN.push(rec); }
const AU=new Audio(); AU.preload='auto'; let auWant=false, auBlocked=false, auSrc='';
function gramoState(){ const G=HOUSE.gramo; if(!G||!RECS[G.i]) return null; return G; }
function gramoSync(){ const G=gramoState(); if(!G){ if(!AU.paused) AU.pause(); auWant=false; return; } const r=RECS[G.i]; if(auSrc!==r.u){ auSrc=r.u; AU.src=r.u; }
  auWant=true; const pos=(Date.now()-G.t0)/1000; if(AU.readyState>=1&&isFinite(AU.duration)&&AU.duration>0){ if(pos>AU.duration+1){ if(hRank()===0) hAct({gramo:{i:(G.i+1)%RECS.length,t0:Date.now()}}); return; } if(Math.abs(AU.currentTime-pos)>2) AU.currentTime=Math.max(0,pos); }
  if(AU.paused) AU.play().then(()=>{ auBlocked=false; }).catch(()=>{ if(!auBlocked){ auBlocked=true; if(Math.hypot(ME.x-GRAMO.x,ME.z-GRAMO.z)<14) toast(NT('gramo.tap'),5000); } }); }
setInterval(()=>{ if(!window.__entered) return; gramoSync(); const d=Math.hypot(ME.x-GRAMO.x,ME.z-GRAMO.z); AU.volume=Math.max(0,Math.min(1,d<3?1:1-(d-3)/16))*(window.__cine&&window.__cine.L.inRoom&&window.__cine.S.p?0:1); },400);
addEventListener('pointerdown',()=>{ if(auBlocked&&auWant) AU.play().then(()=>{ auBlocked=false; }).catch(()=>{}); });
ZL_ANIM.push(dt=>{ if(GRAMO.rec&&gramoState()) GRAMO.rec.rotation.y-=(dt||.016)*8.2; });
function gramoPanel(){ const G=gramoState();
  const body=openPanel(NT('gramo.title'),`<div class="bp">`+(RECS.length?`<p>${G?esc(String(NT('gramo.now')).replace('{曲}',RECS[G.i].t)):esc(NT('gramo.idle'))}</p><div class="bl">`+RECS.map((r,i)=>`<button type="button" data-r="${i}">${esc(r.t)}${r.a?'　<span class="meta">'+esc(r.a)+'</span>':''}</button>`).join('')+`</div>`+(G?`<div class="bl"><button type="button" id="grs">${esc(NT('gramo.stop'))}</button></div>`:''):`<p class="meta">${esc(NT('gramo.none'))}</p>`)+`</div>`);
  body.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{ hAct({gramo:{i:+b.dataset.r,t0:Date.now()}}); auBlocked=false; gramoSync(); toast(String(NT('gramo.put')).replace('{曲}',RECS[+b.dataset.r].t),2600); gramoPanel(); });
  const s=body.querySelector('#grs'); if(s) s.onclick=()=>{ hAct({gramo:null}); gramoSync(); gramoPanel(); }; }
window.__gramoAct=()=>gramoPanel();

// {% endraw %}
