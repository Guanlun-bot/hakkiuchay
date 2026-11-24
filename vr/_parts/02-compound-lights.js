// {% raw %}
// ---- 閩南合院 fill: 東大房、西大房 flank the 正廳 so the 正身 is one full row; 東、西過水間 flank the 南廳 between
//      the two 進. With them the whole compound is one clean rectangle in plan. Left empty for now, with doors.
// cut a doorway into one end wall of a cloned range; (wx,wz) is a point on that wall, in world space
function cutDoor(g,wx,wz,width=1.3,height=2.75){ g.updateMatrixWorld(true); const L=g.worldToLocal(new THREE.Vector3(wx,0,wz)), side=Math.sign(L.x), mats=[];
  const gone=[]; g.children.forEach(m=>{ const p=m.geometry&&m.geometry.parameters; if(m.isMesh&&p&&Math.abs(p.depth-8.6)<.01&&Math.abs(p.width-.3)<.01&&Math.abs(m.position.x-side*8.15)<.05) gone.push(m); });
  let brick=null, white=null; for(const m of gone){ if(m.geometry.parameters.height<1) brick=m.material; else white=m.material; g.remove(m); const i=pickables.indexOf(m); if(i>=0) pickables.splice(i,1); }
  brick=brick||mBrick(4,.9); white=white||mWhite(2,1.7); const x=side*8.15, a=L.z-width/2, b=L.z+width/2;
  for(const [z0,z1] of [[-4.3,a],[b,4.3]]) if(z1-z0>.01){ box(.3,.9,z1-z0,brick,x,.45,(z0+z1)/2,g,BLOCK); box(.3,2.78,z1-z0,white,x,2.29,(z0+z1)/2,g,BLOCK); }
  box(.3,3.68-height,width,white,x,(height+3.68)/2,L.z,g,BLOCK);
  for(const z of [a,b]) box(.36,height,.1,M.woodDark,x,height/2,z,g); box(.36,.1,width+.1,M.woodDark,x,height,L.z,g); box(.34,.16,width,M.woodDark,x,.08,L.z,g); }   // wooden frame and threshold (門檻)
const SIDE_ROOMS=[];
function sideRoom(name,x0,x1,z0,z1,walls,rise){ const cx=(x0+x1)/2, cz=(z0+z1)/2, W=x1-x0, D=z1-z0;
  const fl=new THREE.Mesh(new THREE.PlaneGeometry(W,D),std(T.tile,W*1.25,D*1.25)); fl.rotation.x=-Math.PI/2; fl.position.set(cx,.002,cz); fl.userData={type:'floor'}; scene.add(fl); pickables.push(fl);
  // walls: [axis, at, from, to, exterior?]  exterior walls get a barred window like the other outer walls
  for(const [ax,at,a,b,ext] of walls){ const len=b-a, mid=(a+b)/2, g=new THREE.Group(); scene.add(g);
    if(ax==='x'){ g.position.set(at,0,mid); g.rotation.y=Math.PI/2; } else g.position.set(mid,0,at);
    if(ext&&len>3.2){ windowBay(-len/2,len/2,0,Math.min(1.6,len-1.6),0,1.04,2.37,g); box(len,.43,.3,mBrick(len*.78,.45),0,3.475,0,g,BLOCK); }
    else { box(len,.9,.3,mBrick(len,.9),0,.45,0,g,BLOCK); box(len,2.78,.3,mWhite(len/2,1.7),0,2.29,0,g,BLOCK); }
  }
  // roof: ridge along the long side, eaves flush with the walls so nothing pokes into the neighbours
  const rg=new THREE.Group(); rg.position.set(cx,0,cz); if(D>W) rg.rotation.y=Math.PI/2; scene.add(rg);
  tiledRoof(rg,Math.max(W,D),Math.min(W,D)/2,3.50,rise,.2);
  { const half=Math.min(W,D)/2, gable=new THREE.Shape(); gable.moveTo(-half,3.45); for(let k=0;k<=20;k++){ const u=-half+2*half*k/20; gable.lineTo(u,3.50+rise*(1-Math.abs(u)/half)**1.26); } gable.lineTo(half,3.45); gable.closePath();
    for(const e of [-1,1]){ const f=new THREE.Mesh(new THREE.ShapeGeometry(gable),mWhite(1,1)); f.material.side=THREE.DoubleSide; if(D>W){ f.position.set(cx,0,cz+e*D/2); } else { f.position.set(cx+e*W/2,0,cz); f.rotation.y=Math.PI/2; } scene.add(f); } }
  for(const x of (D>W?[cx]:[x0+W/3,x1-W/3])) for(const z of (D>W?[z0+D/3,z1-D/3]:[cz])) box(.15,.2,.15,M.woodDark,x,3.48,z);
  SIDE_ROOMS.push({name,x0,x1,z0,z1}); }
// the laundry (west 前過水): its back door in the outer wall, and the drying yard behind the house it opens onto
const LDRY={door:{x0:27.92,x1:28.92,h:2.4,z:23.75}, yard:{x0:25.2,x1:33.8,z0:26.2,z1:31}};
{ const WZ=4.488, mirror=z=>2*courtAxis-z, hallE=axialHalls[1].hall, hallW=axialHalls[0].hall;
  for(const s of [1,-1]){ const Z=z=>s>0?z:mirror(z), lo=(a,b)=>s>0?[a,b]:[mirror(b),mirror(a)];
    const [za,zb]=lo(-4.3,WZ), outerZ=Z(-4.15);
    // 大房 beside the 正廳
    sideRoom(s>0?'東大房':'西大房',-14.1,-7.636,za,zb,[['x',-13.95,za,zb,true],['z',outerZ,-14.1,-7.636,true]],RISE*3.23/5.62);
    // 前過水 beside the 過廳: the same as the 過水 beside the 南廳, one bay (19.6 m) further south
    sideRoom(s>0?'前東過水':'前西過水',27.236,31.564,za,zb,s>0?[['z',outerZ,27.236,31.564,true]]:[['z',outerZ,27.236,LDRY.door.x0,false],['z',outerZ,LDRY.door.x1,31.564,false]],RISE*2.164/5.62);
    if(s<0){ const D=LDRY.door, w=D.x1-D.x0, cx=(D.x0+D.x1)/2; box(w,3.68-D.h,.3,mWhite(w,1),cx,(D.h+3.68)/2,outerZ,scene,BLOCK);   // the west 前過水 is the laundry: its back door
      for(const x of [D.x0,D.x1]) box(.1,D.h,.36,M.woodDark,x,D.h/2,outerZ); box(w+.1,.1,.36,M.woodDark,cx,D.h,outerZ); box(w,.06,.34,M.woodDark,cx,.03,outerZ); }
    // 過水間 beside the 南廳
    sideRoom(s>0?'東過水':'西過水',7.636,11.964,za,zb,[['z',outerZ,7.636,11.964,true]],RISE*2.164/5.62);
    // close the slits where a long range's end wall stops short of the side hall's end wall
    for(const x of [-7.5,7.5,12.1,27.1,31.7]) box(.28,3.92,.2,mBrick(.2,3.92),x,1.96,Z(4.394),scene,BLOCK);
    // doors: 正廳 to 大房, 南廳 to 過水, 過廳 to 前過水 (the 過水 no longer open into the wing rooms: walled up)
    cutDoor(hallW,-10.87,Z(4.584)); cutDoor(hallE,9.8,Z(4.584)); cutDoor(gateHall,29.4,Z(4.584)); } }
// 前庭 in front of the 第一進, closed by a low brick wall (矮牆) with an opening and two square posts, as in front of a 大厝
const GATE_LAMP_MATERIAL=new THREE.MeshStandardMaterial({color:0xfff6e6,emissive:0xffd18a,emissiveIntensity:.08,roughness:.24,metalness:0});
const GATE_LAMP_BASE=new THREE.MeshStandardMaterial({color:0x252724,metalness:.68,roughness:.38});
{ const x0=FIRST.fx0, x1=FIRST.fx1, z0=-4.3, z1=2*courtAxis+4.3, W=x1-x0, D=z1-z0, H=1.15, gw=1.3;
  const pave=new THREE.Mesh(new THREE.PlaneGeometry(W,D),std(stonePaving,W/2.4,D/2.4,{color:0xc9c2b6})); pave.rotation.x=-Math.PI/2; pave.position.set((x0+x1)/2,-.008,courtAxis); pave.userData={type:'floor'}; scene.add(pave); pickables.push(pave); FIRST.pave=pave;
  const cap=new THREE.MeshStandardMaterial({color:0x8a5a44,roughness:.85});
  const run=(ax,at,a,b)=>{ const len=b-a, m=(a+b)/2; if(ax==='x'){ box(.3,H,len,mBrick(len*.78,H*1.05),at,H/2,m,scene,BLOCK); box(.4,.08,len,stone,at,H+.04,m); box(.26,.1,len,cap,at,H+.13,m); }
    else { box(len,H,.3,mBrick(len*.78,H*1.05),m,H/2,at,scene,BLOCK); box(len,.08,.4,stone,m,H+.04,at); box(len,.1,.26,cap,m,H+.13,at); } };
  run('x',x1-.15,z0,courtAxis-gw-.3); run('x',x1-.15,courtAxis+gw+.3,z1); run('z',z0+.15,x0,x1-.3); run('z',z1-.15,x0,x1-.3);
  for(const s of [-1,1]){ const px=x1-.15,pz=courtAxis+s*(gw+.3); box(.6,1.55,.6,mBrick(.5,1.2),px,.775,pz,scene,BLOCK); box(.7,.1,.7,stone,px,1.6,pz); box(.5,.12,.5,cap,px,1.71,pz);
    const foot=new THREE.Mesh(new THREE.CylinderGeometry(.14,.16,.06,16),GATE_LAMP_BASE); foot.position.set(px,1.80,pz); scene.add(foot);
    const neck=new THREE.Mesh(new THREE.CylinderGeometry(.09,.12,.13,14),GATE_LAMP_BASE); neck.position.set(px,1.895,pz); scene.add(neck);
    const collar=new THREE.Mesh(new THREE.TorusGeometry(.135,.012,7,18),GATE_LAMP_BASE); collar.rotation.x=Math.PI/2; collar.position.set(px,1.965,pz); scene.add(collar);
    const globe=new THREE.Mesh(new THREE.SphereGeometry(.21,20,16),GATE_LAMP_MATERIAL); globe.position.set(px,2.18,pz); scene.add(globe);
  }
  box(.42,.12,2*gw+.1,stone,x1-.15,.06,courtAxis);   // a granite threshold across the gate
  EARLY_OBST.push({x0:x1-.5,x1:x1+.2,z0:courtAxis-gw-.65,z1:courtAxis-gw+.05},{x0:x1-.5,x1:x1+.2,z0:courtAxis+gw-.05,z1:courtAxis+gw+.65}); }

const TREE={x:3.0,z:12.6};   // the court's south-west corner, by 知了間 and the 南廳, as close as the eaves allow
{
  const size=1.65, edge=.10;
  const {x,z}=TREE;
  const turf=new THREE.Mesh(new THREE.PlaneGeometry(size,size),std(lawnTexture,1,1));
  turf.rotation.x=-Math.PI/2;
  turf.position.set(x,.018,z);
  turf.userData={type:'floor'};
  scene.add(turf); pickables.push(turf);
  for(const side of [-1,1]){
    const offset=side*(size+edge)/2;
    box(size+2*edge,.06,edge,stone,x,.024,z+offset);
    box(edge,.06,size,stone,x+offset,.024,z);
  }
}

{
  const pine=new THREE.Group(); PINE=pine;
  pine.position.set(TREE.x,.02,TREE.z);
  scene.add(pine);
  const vector=point=>new THREE.Vector3(...point);
  function limb(points,radii){
    for(let i=1;i<points.length;i++){
      const start=vector(points[i-1]),end=vector(points[i]);
      const direction=end.clone().sub(start);
      const wood=new THREE.Mesh(new THREE.CylinderGeometry(radii[i],radii[i-1],direction.length()+.08,9),M.bark);
      wood.position.copy(start).lerp(end,.5);
      wood.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize());
      pine.add(wood);
    }
  }
  limb([[0,0,0],[.12,1.4,.03],[-.17,2.75,.18],[-.37,3.9,.10],[-.23,4.95,.02]],[.29,.22,.16,.10,.025]);
  const branches=[
    [[.09,1.4,.04],[.56,2.02,.14],[1.63,2.35,.24],[2.24,2.65,.38]],
    [[-.09,2.45,.15],[-.79,2.76,.46],[-1.67,2.95,.80],[-2.25,3.14,.96]],
    [[-.17,2.73,.18],[.04,3.17,-.64],[.62,3.44,-1.18],[1.12,3.61,-1.42]],
    [[-.34,3.66,.1],[-.73,3.87,-.22],[-1.35,4.10,-.37],[-1.74,4.25,-.30]],
    [[-.37,3.92,.10],[-.26,4.39,.29],[.22,4.68,.55],[.57,4.88,.64]]
  ];
  const random=rnd(73);
  const geometry=new THREE.IcosahedronGeometry(1,2);
  const foliage=new THREE.InstancedMesh(geometry,new THREE.MeshStandardMaterial({roughness:1,flatShading:true}),132);
  const pose=new THREE.Object3D();
  const colors=[0x263f26,0x365332,0x425f36,0x537144,0x64804a].map(c=>new THREE.Color(c));
  const crowns=[];
  for(const branch of branches){
    limb(branch,[.13,.095,.052,.014]);
    crowns.push({point:branch[3],size:.97},{point:branch[2],size:.65});
  }
  crowns.push({point:[-.23,5.03,.02],size:.72});
  crowns.forEach(({point:[x,y,z],size},crown)=>{
    for(let i=0;i<12;i++){
      const angle=random()*Math.PI*2, radius=Math.sqrt(random())*size;
      const scale=.24+random()*.33;
      pose.position.set(x+Math.cos(angle)*radius,y+(1-radius/size)*.28+random()*.13,z+Math.sin(angle)*radius*.71);
      pose.rotation.set(0,angle,0);
      pose.scale.set(scale*1.28,scale*.62,scale);
      pose.updateMatrix();
      const index=crown*12+i;
      foliage.setMatrixAt(index,pose.matrix);
      foliage.setColorAt(index,colors[Math.floor(random()*colors.length)]);
    }
  });
  pine.add(foliage); pine.userData.foliage=foliage;
  // crown: everything above the first fork hangs from a pivot there, so it can sway on its own
  { const crown=new THREE.Group(); crown.position.set(.12,1.4,.03); pine.add(crown);
    for(const c of [...pine.children]) if(c!==crown&&(c===foliage||c.position.y>1.55)){ pine.remove(c); c.position.sub(crown.position); crown.add(c); }
    foliage.position.sub(new THREE.Vector3()); pine.userData.crown=crown; }
  // 3D physics collision-resolution solver for courtyard pine against veranda eaves, beams, and stone bench
  { const eaveBoxes=[
      {x0:3.7,x1:9,y0:3.25,y1:6,z0:4,z1:15.6},{x0:-9,x1:-3.7,y0:3.25,y1:6,z0:4,z1:15.6},
      {x0:-9,x1:9,y0:3.25,y1:6,z0:13.45,z1:16},{x0:-9,x1:9,y0:3.25,y1:6,z0:3.5,z1:6.15},
      {x0:TREE.x-.9,x1:TREE.x+.9,y0:0,y1:.6,z0:TREE.z-1.3-.35,z1:TREE.z-1.3+.35}
    ];
    for(let it=0;it<6;it++){
      if(pine.position.x>3.0) pine.position.x-=(pine.position.x-3.0)*.6;
      if(pine.position.z>12.6) pine.position.z-=(pine.position.z-12.6)*.6;
    }
    const m4=new THREE.Matrix4(), pos=new THREE.Vector3(), quat=new THREE.Quaternion(), scl=new THREE.Vector3();
    for(let i=0;i<132;i++){ foliage.getMatrixAt(i,m4); m4.decompose(pos,quat,scl); const r=Math.max(scl.x,scl.y,scl.z)*.9;
      let wx=pine.position.x+pos.x, wy=pine.position.y+pos.y, wz=pine.position.z+pos.z;
      for(const b of eaveBoxes){ if(wx+r>b.x0&&wx-r<b.x1&&wy+r>b.y0&&wy-r<b.y1&&wz+r>b.z0&&wz-r<b.z1){
        const px0=(wx+r)-b.x0, px1=b.x1-(wx-r), pz0=(wz+r)-b.z0, pz1=b.z1-(wz-r), py0=(wy+r)-b.y0;
        const m=Math.min(px0,px1,pz0,pz1,py0);
        if(m===px0) wx-=px0; else if(m===px1) wx+=px1; else if(m===pz0) wz-=pz0; else if(m===pz1) wz+=pz1; else wy-=py0;
      } }
      pos.set(wx-pine.position.x,wy-pine.position.y,wz-pine.position.z); m4.compose(pos,quat,scl); foliage.setMatrixAt(i,m4);
    }
    foliage.instanceMatrix.needsUpdate=true;
    TREE.x=pine.position.x; TREE.z=pine.position.z;
  }
  const shadeTexture=ctex(128,128,(g,w,h)=>{
    const radial=g.createRadialGradient(w/2,h/2,1,w/2,h/2,w/2);
    radial.addColorStop(0,'rgba(19,30,13,.48)'); radial.addColorStop(1,'rgba(19,30,13,0)');
    g.fillStyle=radial; g.fillRect(0,0,w,h);
  });
  const shadow=new THREE.Mesh(new THREE.PlaneGeometry(5,3.35),new THREE.MeshBasicMaterial({
    map:shadeTexture,transparent:true,depthWrite:false,opacity:NIGHT?.35:.84,polygonOffset:true,polygonOffsetFactor:-1
  }));
  shadow.rotation.x=-Math.PI/2;
  shadow.position.set(.65,.013,-.49);
  pine.add(shadow);
}
const skyTop=new THREE.Color(), skyHorizon=new THREE.Color();
const sky=new THREE.Mesh(new THREE.SphereGeometry(110,32,20),new THREE.ShaderMaterial({
  side:THREE.BackSide, depthWrite:false, fog:false,
  uniforms:{top:{value:skyTop},horizon:{value:skyHorizon}},
  vertexShader:`varying vec3 direction;
    void main(){direction=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader:`uniform vec3 top; uniform vec3 horizon; varying vec3 direction;
    void main(){float h=clamp(normalize(direction).y,0.0,1.0);
      gl_FragColor=vec4(mix(horizon,top,pow(h,0.62)),1.0);
      #include <colorspace_fragment>
    }`
}));
sky.position.z=courtAxis;
sky.renderOrder=-10; scene.add(sky);
const skyCenter=new THREE.Vector3(19.6,0,courtAxis);
const daylight=new THREE.DirectionalLight(0xfff0d8,1.4);
const ambientSky=new THREE.HemisphereLight(0xe6eef5,0x827666,1.1);
daylight.target.position.copy(skyCenter);
scene.add(daylight,daylight.target,ambientSky);
renderer.shadowMap.enabled=!isTouch; renderer.shadowMap.autoUpdate=false; renderer.shadowMap.needsUpdate=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
daylight.castShadow=true;
daylight.shadow.mapSize.set(isTouch?1024:2048,isTouch?1024:2048);
Object.assign(daylight.shadow.camera,{left:-38,right:38,top:38,bottom:-38,near:1,far:110});
daylight.shadow.camera.updateProjectionMatrix();
daylight.shadow.normalBias=.035;
court.receiveShadow=true;
for(const range of [mainHall,oppositeWing,...axialHalls.map(item=>item.hall)]){
  range.traverse(mesh=>{
    if(mesh.isMesh){mesh.castShadow=mesh.userData.type!=='floor';mesh.receiveShadow=true;}
  });
}
const sunDisk=new THREE.Sprite(new THREE.SpriteMaterial({color:0xffedbb,fog:false,depthWrite:false,toneMapped:false,
  map:textCanvas(128,128,(g,w,h)=>{
    const glow=g.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);
    glow.addColorStop(0,'#fff');glow.addColorStop(.29,'#fff');
    glow.addColorStop(.32,'#fff8');glow.addColorStop(1,'#fff0');
    g.fillStyle=glow;g.fillRect(0,0,w,h);
  })
}));
sunDisk.scale.set(11,11,1);
scene.add(sunDisk);
const cloudMap=textCanvas(256,128,(g,w,h)=>{
  for(const [x,y,r] of [[51,76,38],[94,57,50],[144,65,45],[188,76,38],[216,84,25]]){
    const puff=g.createRadialGradient(x,y,0,x,y,r);
    puff.addColorStop(0,'#fffffff0');puff.addColorStop(.46,'#ffffffb0');puff.addColorStop(1,'#ffffff00');
    g.fillStyle=puff;g.fillRect(0,0,w,h);
  }
});
const cloudMaterial=new THREE.SpriteMaterial({map:cloudMap,transparent:true,depthWrite:false,fog:false});
const clouds=Array.from({length:9},(_,i)=>{
  const cloud=new THREE.Sprite(cloudMaterial);
  cloud.scale.set(19+i%3*5,8+i%3*2,1);
  scene.add(cloud);
  return cloud;
});
const taipeiClock=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Taipei',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
let STAR_DOME=null;   // the star dome follows you about (see the land loop), so the stars cover the whole map
const starMat=new THREE.PointsMaterial({color:0xe8eeff,size:.45,sizeAttenuation:true,transparent:true,opacity:0,fog:false,depthWrite:false});
{ const pts=[], R=rnd(2026); for(let i=0;i<1400;i++){ const th=R()*Math.PI*2, ph=Math.acos(1-R()*.95); pts.push(95*Math.sin(ph)*Math.cos(th),95*Math.cos(ph),95*Math.sin(ph)*Math.sin(th)); }
  const sg=new THREE.BufferGeometry(); sg.setAttribute('position',new THREE.Float32BufferAttribute(pts,3)); const stars=new THREE.Points(sg,starMat); stars.position.copy(new THREE.Vector3(0,0,courtAxis)); stars.renderOrder=-1; stars.frustumCulled=false; scene.add(stars); STAR_DOME=stars; }
const moon=new THREE.Sprite(new THREE.SpriteMaterial({map:textCanvas(128,128,(g,w,h)=>{ const r=g.createRadialGradient(64,64,0,64,64,64); r.addColorStop(0,'#fffbe8'); r.addColorStop(.42,'#fff4d0'); r.addColorStop(.48,'rgba(255,240,200,.35)'); r.addColorStop(1,'rgba(255,240,200,0)'); g.fillStyle=r; g.fillRect(0,0,w,h); }),fog:false,depthWrite:false,transparent:true,toneMapped:false}));
moon.scale.set(9,9,1); moon.position.set(courtAxis+60,52,courtAxis-30); scene.add(moon);
// ---- weather: what the sky over Taipei is doing right now (Open-Meteo, no key). rain 0–1, cloud 0–1.
var PLAN_FOG=false;   /* no haze over the plan view */
var WX={rain:0,cloud:0,thunder:false,label:'',temp:null,target:0,targetCloud:0};
// wind in m/s (Taipei, from the weather service; a gentle default until the first reading) and the direction it blows toward
var NTX=null;   // the back-office text lookup, once the people's block has read it
var WIND={speed:2,gust:4,dir:.6,live:false,ls:2,lg:4,force:null}, SKY_DAY=1;
// the visitor can set the weather and wind by hand (kept in this browser); null = follow Taipei
var WX_FORCE=null; try{ const v=JSON.parse(localStorage.getItem('hk-wx')||'null'); if(v){ WX_FORCE=v.wx||null; WIND.force=v.wind||null; } }catch{}
const WIND_PRESET={calm:[0,.3],breeze:[2.5,5],strong:[9,15]};
function applyWind(){ const p=WIND.force&&WIND_PRESET[WIND.force]; WIND.speed=p?p[0]:WIND.ls; WIND.gust=p?p[1]:WIND.lg; }
// gusty wind force at a point and time: a steady part, slow surges and quick flutter, up to the gust speed
function windAt(t,ph=0){ const s=WIND.speed, g=Math.max(s,WIND.gust), surge=.5+.5*Math.sin(t*.37+ph)*Math.sin(t*.13+ph*1.7), flick=Math.sin(t*2.3+ph*3)*.5+Math.sin(t*3.7+ph)*.3;
  const v=s+(g-s)*surge*surge+flick*Math.min(1.5,g*.08); return Math.max(0,v); }
// the pine: two damped springs (the trunk from the root, the crown from the fork), each pushed by the wind's pressure (∝ v²)
const TREE_SPR={a:{x:0,z:0,vx:0,vz:0,k:22,c:2.2,f:.00055},b:{x:0,z:0,vx:0,vz:0,k:9,c:1.1,f:.0016}};
function treeStep(dt,t){ const dx=Math.cos(WIND.dir), dz=Math.sin(WIND.dir);
  for(const [key,sp,ph] of [['a',TREE_SPR.a,0],['b',TREE_SPR.b,1.3]]){ const v=windAt(t,ph), F=v*v*sp.f*(1+.15*Math.sin(t*1.9+ph));
    // wind toward +x tips the tree about −z (rotation.z negative), toward +z about +x
    const tx=dz*F, tz=-dx*F;
    for(let i=0;i<3;i++){ const h=dt/3; sp.vx+=(-sp.k*sp.x-sp.c*sp.vx+sp.k*tx)*h; sp.vz+=(-sp.k*sp.z-sp.c*sp.vz+sp.k*tz)*h; sp.x+=sp.vx*h; sp.z+=sp.vz*h; } }
  const cap=v=>Math.max(-.12,Math.min(.12,v));
  PINE.rotation.x=cap(TREE_SPR.a.x); PINE.rotation.z=cap(TREE_SPR.a.z);
  const cr=PINE.userData.crown; if(cr){ cr.rotation.x=cap(TREE_SPR.b.x*1.4); cr.rotation.z=cap(TREE_SPR.b.z*1.4); } }
function updateSky(){
  const [hour,minute]=taipeiClock.format(new Date()).split(':').map(Number);
  const time=(typeof SKY_FORCE!=='undefined'&&SKY_FORCE)?(SKY_FORCE==='night'?0:12):location.hash==='#night'?0:location.hash==='#day'?12:hour+minute/60;
  const angle=(time-6)*Math.PI/12;
  const altitude=Math.sin(angle);
  const day=THREE.MathUtils.smoothstep(altitude,-.15,.23); SKY_DAY=day;
  const warm=day*(1-THREE.MathUtils.smoothstep(altitude,.08,.44));
  skyTop.set('#091629').lerp(new THREE.Color('#167bc8'),day);
  skyHorizon.set('#20324b').lerp(new THREE.Color('#a9d8f3'),day).lerp(new THREE.Color('#f6aa74'),warm);
  scene.fog.color.copy(skyHorizon);
  // north is +x, east +z (the house sits south of 斗灣潭 and faces it): the sun rises over +z and stands in the −x sky at noon
  daylight.position.set(skyCenter.x-11,Math.max(2,29*altitude),courtAxis+29*Math.cos(angle));
  daylight.intensity=1.55*THREE.MathUtils.smoothstep(altitude,0,.30);
  daylight.color.set('#fff5e6').lerp(new THREE.Color('#ffa760'),warm);
  ambientSky.userData.base=.53+.68*day; ambientSky.intensity=ambientSky.userData.base*(ambientSky.userData.k??1);
  ambientSky.color.copy(skyHorizon);
  sunDisk.visible=altitude>0;
  sunDisk.position.copy(daylight.position).sub(skyCenter).normalize().multiplyScalar(86).add(skyCenter);
  sunDisk.material.color.copy(daylight.color);
  cloudMaterial.color.set('#60708e').lerp(new THREE.Color('#f6f5ec'),day);
  cloudMaterial.opacity=.36+.36*day;
  starMat.opacity=Math.max(0,1-day*1.6); moon.visible=day<.5; moon.material.opacity=1-day*2;
  { const c=WX.cloud, r=WX.rain, grey=new THREE.Color('#8f979d').lerp(new THREE.Color('#2a2f38'),1-day), g2=new THREE.Color('#aab1b5').lerp(new THREE.Color('#333944'),1-day);   /* overcast and rain: the sky greys over, the sun goes in */
    skyTop.lerp(grey,c*.9); skyHorizon.lerp(g2,c*.85); scene.fog.color.copy(skyHorizon); scene.fog.near=PLAN_FOG?400:70-50*r; scene.fog.far=PLAN_FOG?500:1000-760*r;
    daylight.intensity*=1-.8*c; ambientSky.userData.base*=1-.22*c; ambientSky.intensity=ambientSky.userData.base*(ambientSky.userData.k??1); ambientSky.color.copy(skyHorizon);
    sunDisk.visible=sunDisk.visible&&c<.6; cloudMaterial.color.lerp(new THREE.Color('#5d646b').lerp(new THREE.Color('#2c3038'),1-day),c*.8); cloudMaterial.opacity=Math.min(.95,cloudMaterial.opacity+.3*c);
    starMat.opacity*=1-c; moon.material.opacity*=1-.8*c; }
  daylight.castShadow=daylight.intensity>.02; renderer.shadowMap.needsUpdate=true;
}
updateSky();
setInterval(updateSky,30000);
const fixtures=[];
const lampPaper=new THREE.MeshStandardMaterial({color:0xe8d6b5,emissive:0xffa75e,roughness:.9});
const lanternSilk=new THREE.MeshStandardMaterial({color:0x9c3428,emissive:0xff6c32,roughness:.83});
function hangingLantern(parent,x,y,z,power){
  const frame=new THREE.Group(); LANTERNS.push(frame);
  frame.position.set(x,y,z);
  parent.add(frame);
  const body=new THREE.Mesh(new THREE.SphereGeometry(.20,20,12),lanternSilk);
  body.scale.set(1.16,.91,1.16);
  frame.add(body);
  for(const dy of [-.205,.205]) cylinder(.084,.084,.036,M.woodDark,0,dy,0,frame);
  cylinder(.008,.008,.52,M.woodDark,0,.48,0,frame);
  cylinder(.015,.015,.10,lanternSilk,0,-.27,0,frame);
  cylinder(.021,.038,.095,lanternSilk,0,-.36,0,frame);
  if(!power) return;
  const light=new THREE.PointLight(0xffc58b,0,5,2);
  light.position.set(0,-.03,.03);
  frame.add(light);
  fixtures.push({light,power});
}
/* Red lanterns (燈籠) in pairs at every door that opens onto a court or the street: round, ribbed silk between black
   caps, a red cord with a ring above, a short red skirt and a tassel below. Each hangs from its cord as a pendulum the
   wind pushes about (pressure ∝ v², against gravity, with damping). They glow red only after dark; the pairs at
   學鳩齋 and 知了間 also light the ground. */
const LANTERN_RED=new THREE.MeshStandardMaterial({color:0xd02a20,emissive:0xe01810,emissiveIntensity:0,roughness:.55}),
  LANTERN_RIB=new THREE.MeshStandardMaterial({color:0x8a1a14,emissive:0x6a0a06,emissiveIntensity:0,roughness:.6}),
  LANTERN_BLK=new THREE.MeshStandardMaterial({color:0x151313,roughness:.45,metalness:.2}), LANTERN_LIGHTS=[], LANTERN_SIM=[];
function redLantern(x,y,z,lit,cord=.45){ const piv=new THREE.Group(); piv.position.set(x,y,z); scene.add(piv); LANTERNS.push(piv);
  const C=(r1,r2,h,m,yy,seg=16)=>{ const k=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,seg),m); k.position.y=yy; k.castShadow=true; piv.add(k); return k; };
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.04,.009,8,18),LANTERN_RED); ring.position.y=-.1; piv.add(ring);
  C(.006,.006,.08,LANTERN_RED,-.04,6); C(.006,.006,cord-.14,LANTERN_RED,-.14-(cord-.14)/2,6);
  const top=-cord; C(.012,.012,.03,LANTERN_BLK,top+.015,10); C(.085,.085,.05,LANTERN_BLK,top-.025);
  const R=.22, cy=top-.05-R*.88;
  const body=new THREE.Mesh(new THREE.SphereGeometry(R,28,18),LANTERN_RED); body.scale.set(1,.88,1); body.position.y=cy; piv.add(body);
  for(let i=0;i<10;i++){ const rib=new THREE.Mesh(new THREE.TorusGeometry(R+.002,.0035,4,36,Math.PI),LANTERN_RIB); rib.scale.set(1,.88,1); rib.rotation.set(0,i*Math.PI/10,Math.PI/2); rib.position.y=cy; piv.add(rib); }
  const bot=cy-R*.88; C(.085,.085,.05,LANTERN_BLK,bot-.02); C(.062,.062,.07,LANTERN_RED,bot-.08); C(.012,.012,.04,LANTERN_RED,bot-.135,8);
  const tas=C(.006,.022,.17,LANTERN_RED,bot-.24,10); const knot=new THREE.Mesh(new THREE.SphereGeometry(.016,10,8),LANTERN_RED); knot.position.y=bot-.15; piv.add(knot);
  if(lit){ const L=new THREE.PointLight(0xff5038,0,6,2); L.position.y=cy; piv.add(L); LANTERN_LIGHTS.push(L); }
  LANTERN_SIM.push({piv,ax:0,az:0,vx:0,vz:0,ph:Math.random()*6,len:cord+R}); return piv; }
// a pair at a door: (x,z) the middle of the door at the wall face, (nx,nz) pointing out of the building, half the spacing
/* Wall lamps (壁燈) instead of lanterns: an antique-bronze lantern on a scrolled arm, a pair at every door that opens
   onto a court, one centred over each of the two windows beside the door, so they sit symmetric about it. The glass
   glows only after dark; the pairs at 學鳩齋 and 知了間 also light the ground. */
const LAMP_BRONZE=new THREE.MeshStandardMaterial({color:0x5b4a34,metalness:.65,roughness:.42}),
  LAMP_GLASS=new THREE.MeshStandardMaterial({color:0xe9dcc0,transparent:true,opacity:.45,roughness:.08,metalness:.1,emissive:0xffb05a,emissiveIntensity:0,side:THREE.DoubleSide,depthWrite:false}),
  LAMP_FLAME=new THREE.MeshStandardMaterial({color:0xd8a060,emissive:0xffa040,emissiveIntensity:0,roughness:.5});
// every lamp has the same light as those at 學鳩齋; the house's light pool (see optimizeScene) lights the nearest few
const LAMP_GLOW_TEX=(()=>{ const c=document.createElement('canvas'); c.width=c.height=128; const g=c.getContext('2d'), gr=g.createRadialGradient(64,64,0,64,64,64); gr.addColorStop(0,'rgba(255,190,110,1)'); gr.addColorStop(.35,'rgba(255,170,90,.45)'); gr.addColorStop(1,'rgba(255,150,70,0)'); g.fillStyle=gr; g.fillRect(0,0,128,128); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t; })();
const LAMP_HALO_GEO=new THREE.PlaneGeometry(1.5,1.5), LAMP_POOL_GEO=new THREE.PlaneGeometry(3.2,2.4);
const LAMP_HALO_MAT=new THREE.MeshBasicMaterial({map:LAMP_GLOW_TEX,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false});
const LAMP_POOL_MAT=new THREE.MeshBasicMaterial({map:LAMP_GLOW_TEX,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});
function wallLamp(x,y,z,nx,nz,lit){ const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=Math.atan2(nx,nz); scene.add(g); LANTERNS.push(g);
  const B=LAMP_BRONZE, lathe=(pts,m,seg=24)=>{ const k=new THREE.Mesh(new THREE.LatheGeometry(pts.map(([r,h])=>new THREE.Vector2(r,h)),seg),m); k.castShadow=true; g.add(k); return k; };
  // back plate with a shell top, and the scrolled arm reaching out and up to the lamp
  box(.11,.3,.025,B,0,-.06,.012,g); const shell=new THREE.Mesh(new THREE.CylinderGeometry(.075,.075,.025,16,1,false,-Math.PI/2,Math.PI),B); shell.rotation.x=Math.PI/2; shell.position.set(0,.09,.012); g.add(shell);
  const arm=new THREE.CatmullRomCurve3([[0,-.14,.025],[0,-.2,.09],[0,-.17,.17],[0,-.1,.2],[0,-.06,.17],[0,-.08,.13]].map(p=>new THREE.Vector3(...p)));
  const a=new THREE.Mesh(new THREE.TubeGeometry(arm,24,.012,6,false),B); g.add(a);
  const arm2=new THREE.CatmullRomCurve3([[0,-.17,.17],[0,-.17,.24],[0,-.13,.26]].map(p=>new THREE.Vector3(...p))); g.add(new THREE.Mesh(new THREE.TubeGeometry(arm2,12,.013,6,false),B));
  const L=new THREE.Group(); L.position.set(0,-.13,.26); g.add(L); const put=m=>{ g.remove(m); L.add(m); return m; };
  // the lamp: a cup, the tulip glass between bronze ribs, a scalloped roof in two tiers and a finial
  put(lathe([[0,0],[.035,0],[.05,.02],[.065,.05],[.07,.06],[0,.06]],B));
  put(lathe([[.06,.06],[.072,.12],[.088,.2],[.1,.25],[.104,.27]],LAMP_GLASS,20));
  for(let i=0;i<6;i++){ const a=i*Math.PI/3, rib=new THREE.Mesh(new THREE.CylinderGeometry(.006,.006,.21,5),B); rib.position.set(Math.sin(a)*.085,.165,Math.cos(a)*.085); rib.rotation.set(Math.cos(a)*.17,0,-Math.sin(a)*.17); L.add(rib); }
  const fl=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,.06,10),LAMP_FLAME); fl.position.y=.1; L.add(fl); const tip=new THREE.Mesh(new THREE.SphereGeometry(.022,10,8),LAMP_FLAME); tip.scale.y=1.5; tip.position.y=.15; L.add(tip);
  put(lathe([[.0,.27],[.135,.27],[.14,.285],[.12,.3],[.1,.33],[.06,.355],[.05,.37],[0,.37]],B,24));
  for(let i=0;i<12;i++){ const a=i*Math.PI/6, sc=new THREE.Mesh(new THREE.SphereGeometry(.02,8,6,0,Math.PI*2,0,Math.PI/2),B); sc.rotation.x=Math.PI; sc.position.set(Math.sin(a)*.13,.275,Math.cos(a)*.13); L.add(sc); }
  put(lathe([[0,.37],[.055,.37],[.06,.39],[.04,.42],[.025,.43],[0,.43]],B,16));
  const fin=new THREE.Mesh(new THREE.ConeGeometry(.015,.06,10),B); fin.position.y=.47; L.add(fin); const kn=new THREE.Mesh(new THREE.SphereGeometry(.016,10,8),B); kn.position.y=.44; L.add(kn);
  // its light, painted rather than computed so every lamp in the house is equally bright wherever you stand:
  // a warm halo on the wall round it and a soft pool on the ground below
  const halo=new THREE.Mesh(LAMP_HALO_GEO,LAMP_HALO_MAT); halo.position.set(0,-.05,.02); halo.renderOrder=2; g.add(halo);
  const pool=new THREE.Mesh(LAMP_POOL_GEO,LAMP_POOL_MAT); pool.rotation.x=-Math.PI/2; pool.position.set(x+nx*1.1,.025,z+nz*1.1); pool.rotation.z=Math.atan2(nx,nz); pool.renderOrder=2; scene.add(pool); LANTERNS.push(pool);
  return g; }
// for one building: a lamp over each of the two windows beside the door, on the face at local z = sg·4.30
function doorLamps(g,cx,sg,lit,y=2.8){ g.updateMatrixWorld(true);
  for(const s of [-1,1]){ const p=g.localToWorld(new THREE.Vector3(s*cx,0,sg*4.3)), q=g.localToWorld(new THREE.Vector3(s*cx,0,sg*5.3)); const n=q.sub(p).normalize();
    wallLamp(p.x+n.x*.012,y,p.z+n.z*.012,n.x,n.z,lit); } }
{ const hc=(HALL_DOOR+bayEdge)/2+.02;
  // wing doors: 學鳩齋 and 知了間 (lit), the 第二進 and 第一進 wings
  doorLamps(mainHall,2.02,1,true); doorLamps(oppositeWing,2.02,1,true);
  for(const w of [...firstWings,...frontWings]) doorLamps(w,2.02,1,false);
  // hall doors: 正廳 to the court, 南廳 and 過廳 on both faces
  doorLamps(axialHalls[0].hall,hc,1,false); doorLamps(axialHalls[1].hall,hc,1,false); doorLamps(axialHalls[1].hall,hc,-1,false);
  doorLamps(gateHall,hc,1,false); doorLamps(gateHall,hc,-1,false); }
function lanternStep(dt,t){ const k=SKY_DAY<.35?1:SKY_DAY<.6?(.6-SKY_DAY)/.25:0;
  LANTERN_RED.emissiveIntensity=.95*k; LANTERN_RIB.emissiveIntensity=.7*k; LAMP_GLASS.emissiveIntensity=.9*k; LAMP_GLASS.opacity=.45+.35*k; LAMP_FLAME.emissiveIntensity=2.2*k; LAMP_HALO_MAT.opacity=.55*k; LAMP_POOL_MAT.opacity=.42*k; LAMP_HALO_MAT.visible=LAMP_POOL_MAT.visible=k>0; for(const L of LANTERN_LIGHTS) L.intensity=1.8*k;
  const dx=Math.cos(WIND.dir), dz=Math.sin(WIND.dir);
  for(const l of LANTERN_SIM){ const v=windAt(t,l.ph), th=Math.min(.5,.009*v*v), g=9.8/l.len, wob=1+.25*Math.sin(t*2.6+l.ph*2);
    // the angle the wind would hold it at, about each axis: wind toward +x swings it about −z, toward +z about +x
    const ex=dz*th*wob, ez=-dx*th*wob;
    for(let i=0;i<3;i++){ const h=dt/3; l.vx+=(g*(ex-l.ax)-1.6*l.vx)*h; l.vz+=(g*(ez-l.az)-1.6*l.vz)*h; l.ax+=l.vx*h; l.az+=l.vz*h; }
    l.piv.rotation.x=l.ax; l.piv.rotation.z=l.az; } }
const bronze=new THREE.MeshStandardMaterial({color:0x745434,metalness:.44,roughness:.38});
function softLight(x,y,z,power,distance){
  const light=new THREE.PointLight(0xffe2bc,0,distance,1.65);
  light.position.set(x,y,z); scene.add(light);
  fixtures.push({light,power});
}
// A two-tier bronze chandelier with crystal drops.
const chandelier=new THREE.Group();
chandelier.position.set(0,2.62,0);
scene.add(chandelier);
{ const crystal=new THREE.MeshStandardMaterial({color:0xfff6ea,metalness:.15,roughness:.04,transparent:true,opacity:.62,emissive:0x5a3c1c,emissiveIntensity:.35});
  const drop=new THREE.OctahedronGeometry(.026,0), bead=new THREE.SphereGeometry(.011,8,6);
  const hangDrop=(x,y,z,s=1)=>{ const d=new THREE.Mesh(drop,crystal); d.scale.set(s,s*1.9,s); d.position.set(x,y-.05*s,z); chandelier.add(d);
    const b=new THREE.Mesh(bead,crystal); b.position.set(x,y,z); chandelier.add(b); };
  // turned central stem
  const prof=[[0,-.36],[.03,-.34],[.055,-.28],[.03,-.22],[.075,-.14],[.11,-.06],[.095,.02],[.04,.08],[.05,.16],[.075,.24],[.03,.30],[.035,.42],[.06,.50],[.025,.56],[0,.58]].map(([r,y])=>new THREE.Vector2(r,y));
  chandelier.add(new THREE.Mesh(new THREE.LatheGeometry(prof,24),bronze));
  hangDrop(0,-.37,0,1.6);
  // chain up to the ridge and a ceiling rose
  const link=new THREE.TorusGeometry(.024,.006,6,12);
  for(let i=0;i<22;i++){ const l=new THREE.Mesh(link,bronze); l.scale.y=1.5; l.position.y=.6+i*.068; l.rotation.y=i%2?Math.PI/2:0; chandelier.add(l); }
  cylinder(.09,.13,.06,bronze,0,2.12,0,chandelier);
  // two rings of S-scroll arms
  const tiers=[{n:8,r:.66,y:-.04,off:0,s:1},{n:6,r:.40,y:.30,off:Math.PI/6,s:.82}];
  const tips=[];
  for(const t of tiers){
    const ring=new THREE.Mesh(new THREE.TorusGeometry(t.r*.32,.012,8,40),bronze); ring.rotation.x=Math.PI/2; ring.position.y=t.y-.02; chandelier.add(ring);
    for(let i=0;i<t.n;i++){ const a=t.off+i*Math.PI*2/t.n, cx=Math.cos(a), cz=Math.sin(a), R=t.r;
      const arm=new THREE.CubicBezierCurve3(new THREE.Vector3(.07*cx,t.y+.02,.07*cz),new THREE.Vector3(.30*R*cx,t.y-.30*t.s,.30*R*cz),new THREE.Vector3(.98*R*cx,t.y-.26*t.s,.98*R*cz),new THREE.Vector3(R*cx,t.y-.02,R*cz));
      chandelier.add(new THREE.Mesh(new THREE.TubeGeometry(arm,24,.014*t.s+.004,8,false),bronze));
      const curl=new THREE.Mesh(new THREE.TorusGeometry(.035*t.s,.008,6,16,Math.PI*1.4),bronze); curl.position.set(.45*R*cx,t.y-.2*t.s,.45*R*cz); curl.rotation.y=-a; chandelier.add(curl);
      cylinder(.06*t.s,.028,.03,bronze,R*cx,t.y-.005,R*cz,chandelier);           // drip pan
      cylinder(.017,.017,.10*t.s,M.paper,R*cx,t.y+.055*t.s,R*cz,chandelier);       // candle sleeve
      const flame=new THREE.Mesh(new THREE.SphereGeometry(.019,10,8),lampPaper); flame.scale.y=1.7; flame.position.set(R*cx,t.y+.13*t.s,R*cz); chandelier.add(flame);
      hangDrop(R*cx,t.y-.04,R*cz,.9*t.s); hangDrop(.55*R*cx,t.y-.24*t.s,.55*R*cz,.7*t.s);
      tips.push(new THREE.Vector3(R*cx,t.y-.04,R*cz)); }
  }
  // bead swags between the lower arms
  for(let i=0;i<8;i++){ const a=tips[i], b=tips[(i+1)%8], mid=a.clone().lerp(b,.5); mid.y-=.11;
    const sw=new THREE.QuadraticBezierCurve3(a,mid,b); for(let k=1;k<12;k++){ const p=sw.getPoint(k/12); const m=new THREE.Mesh(bead,crystal); m.position.copy(p); chandelier.add(m);} }
}
softLight(0,2.62,0,40,14);
// even light for both halves of the room, plus a soft fill everywhere
softLight(-4.6,3.3,.6,24,11); softLight(4.6,3.3,-.6,24,11);
{ const fill=new THREE.AmbientLight(0xffe6c8,0); scene.add(fill); fixtures.push({light:fill,power:.9}); }
// small wall sconces (glowing shades only)
function sconce(x,y,z,ry){ const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=ry; scene.add(g);
  box(.08,.16,.02,bronze,0,0,.01,g); const arm=box(.02,.02,.12,bronze,0,-.02,.07,g);
  const shade=cylinder(.05,.075,.13,lampPaper,0,.04,.14,g); cylinder(.02,.02,.02,bronze,0,-.03,.14,g); }
for(const x of [-5.18,-3.3,3.3,5.18]) sconce(x,3.3,-3.98,0);
for(const z of [-1.6,.8]) sconce(-7.34,3.4,z,Math.PI/2);
for(const z of [-1.6,1.4]) sconce(7.34,3.3,z,-Math.PI/2);
var floorShade=null;
const floorLampX=2.5, floorLampZ=-1.95;
{ const b=new THREE.Mesh(new THREE.SphereGeometry(.17,24,10,0,Math.PI*2,0,Math.PI/2),new THREE.MeshStandardMaterial({color:0x1c1b1a,roughness:.45,metalness:.2})); b.scale.y=.55; b.position.set(floorLampX,0,floorLampZ); scene.add(b);
  cylinder(.012,.012,1.35,b.material,floorLampX,.7,floorLampZ);
  const sh=pleatedShade(.09,.27,.3,new THREE.MeshStandardMaterial({color:0xf6f1e6,roughness:.9,side:THREE.DoubleSide,emissive:0xffd9a8,emissiveIntensity:.7})); sh.position.set(floorLampX,1.45,floorLampZ); scene.add(sh); floorShade=sh; }
softLight(floorLampX,1.25,floorLampZ,8,4.8);
const lightLevel=$('#lightLevel'), lightValue=$('#lightValue');
const savedLight=LS.get('hk-light');
if(savedLight!==null && /^\d{1,3}$/.test(savedLight)) lightLevel.value=savedLight;
// colour temperature (Kelvin) to an RGB light colour
function kelvin(k){ const t=k/100; let r,g,b;
  r=t<=66?255:329.698727446*Math.pow(t-60,-.1332047592);
  g=t<=66?99.4708025861*Math.log(t)-161.1195681661:288.1221695283*Math.pow(t-60,-.0755148492);
  b=t>=66?255:(t<=19?0:138.5177312231*Math.log(t-10)-305.0447927307);
  const c=v=>Math.max(0,Math.min(255,v))/255; return new THREE.Color().setRGB(c(r),c(g),c(b),THREE.SRGBColorSpace); }
const ctemp=$('#ctemp'), ctempValue=$('#ctempValue');
{ const v=LS.get('hk-ctemp'); if(v&&/^\d{4}$/.test(v)) ctemp.value=v; }
let myLight={v:+lightLevel.value,k:+ctemp.value,at:0}, lightSyncAt=0;
ctemp.addEventListener('input',()=>{ LS.set('hk-ctemp',ctemp.value); myLight={v:+lightLevel.value,k:+ctemp.value,at:Date.now()}; lightSyncAt=myLight.at; applyLighting(); if(typeof pushPresence==='function') pushPresence(); });
function applyLighting(){
  const amount=Number(lightLevel.value)/100;
  const tint=kelvin(+ctemp.value); ctempValue.value=ctemp.value+'K';
  for(const f of fixtures) if(!f.keepColor) f.light.color.copy(tint);
  lampPaper.emissive.copy(tint);
  if(typeof LAMPS!=='undefined') for(const l of LAMPS) l.mat.emissive.copy(tint);
  if(floorShade){ floorShade.material.emissive.copy(tint); floorShade.material.emissiveIntensity=.25+.75*amount; }
  lightValue.value=lightLevel.value+'%';
  lampPaper.emissiveIntensity=.85*amount;
  lanternSilk.emissiveIntensity=.28*amount;
  for(const f of fixtures) if(!f.ownLevel) f.light.intensity=f.power*amount*(f.on===false?0:1);
  if(typeof LAMPS!=='undefined') for(const l of LAMPS) l.mat.emissiveIntensity=l.f.on?.55*amount+.35:0;
}
lightLevel.addEventListener('input',()=>{
  LS.set('hk-light',lightLevel.value);
  myLight={v:+lightLevel.value,k:+ctemp.value,at:Date.now()}; lightSyncAt=myLight.at;
  applyLighting();
  if(typeof pushPresence==='function') pushPresence();
});
applyLighting();


await __yield(0.3);
// {% endraw %}
