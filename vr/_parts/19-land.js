// {% raw %}
/* ================= 宅外：稻田與寧平山水 =================
   The house stands in rice fields. Paddies run out on every side, cut by raised dikes you can walk (a narrow packed-earth path
   separates the walls from the nearest paddies, a dirt road runs from the front court to a jetty); a clear green river loops round an island of
   varied green mountain ranges with rolling shoulders and wooded slopes; beyond, peak after peak in fading layers. The rice always
   carries ears, its colour follows the month; it waves in the live wind. Sampans go round the loop on a fixed timetable
   (everyone sees the same boats) and you can ride. Farmers, a buffalo and its herd boy, egrets, goats on the cliffs, a
   pavilion on one peak and a little temple under a cliff; fireflies over the paddies at night. */
// Render the outdoor scenery at reduced resolution from the mirrored viewpoint.
const outdoorReflection={
  layer:5, target:null, camera:new THREE.PerspectiveCamera(), matrix:new THREE.Matrix4(),
  forward:new THREE.Vector3(), up:new THREE.Vector3(), rotation:new THREE.Quaternion(),
  clip:[new THREE.Plane(new THREE.Vector3(0,1,0),.105)],
  strength:{value:0}, texture:{value:null}, last:-Infinity
};
function reflectOutdoors(){
  const R=outdoorReflection, time=performance.now();
  camera.updateMatrixWorld(); const eye=camera.getWorldPosition(R.eye||(R.eye=new THREE.Vector3()));   // the camera rides in the player's rig
  const visible=window.__entered&&eye.y>-.06&&window.__landOut&&window.__landOut(eye);
  if(!visible||renderer.xr.isPresenting){ R.strength.value=0; return; }
  if(typeof FPS!=='undefined'&&FPS.v<34){ R.strength.value=0; return; }
  if(time-R.last<(isTouch?520:340)) return;
  if(!R.target){
    R.target=new THREE.WebGLRenderTarget(isTouch?192:320,isTouch?108:180,{depthBuffer:true,stencilBuffer:false,samples:0});
    R.texture.value=R.target.texture;
  }
  const mirror=R.camera;
  camera.updateMatrixWorld();
  camera.getWorldQuaternion(R.rotation);
  camera.getWorldDirection(R.forward);
  R.up.set(0,1,0).applyQuaternion(R.rotation);
  R.forward.y*=-1;
  R.up.y*=-1;
  mirror.position.copy(eye);
  mirror.position.y=-.2-eye.y;
  mirror.up.copy(R.up);
  mirror.lookAt(R.forward.add(mirror.position));
  mirror.projectionMatrix.copy(camera.projectionMatrix);
  mirror.projectionMatrixInverse.copy(camera.projectionMatrixInverse);
  mirror.layers.set(R.layer);
  mirror.updateMatrixWorld();
  R.matrix.multiplyMatrices(mirror.projectionMatrix,mirror.matrixWorldInverse);
  const previous=renderer.getRenderTarget(), planes=renderer.clippingPlanes;
  const shadows=renderer.shadowMap.enabled, xr=renderer.xr.enabled;
  try{
    renderer.xr.enabled=false;
    renderer.shadowMap.enabled=false;
    renderer.clippingPlanes=R.clip;
    renderer.setRenderTarget(R.target);
    renderer.render(scene,mirror);
    R.strength.value=1;
    R.last=time;
  }finally{
    renderer.setRenderTarget(previous);
    renderer.clippingPlanes=planes;
    renderer.shadowMap.enabled=shadows;
    renderer.xr.enabled=xr;
  }
}
const RIVER_BANK=[];
const RIVER_HALF_WIDTH=9;
const RIVER=new THREE.CatmullRomCurve3([[100,10],[101,58],[108,108],[126,148],[152,172],[180,178],[206,166],[224,140],[234,104],[240,52],[238,0],[226,-46],[198,-72],[160,-80],[128,-70],[108,-44],[100,-16]].map(([x,z])=>new THREE.Vector3(x,0,z)),true,'catmullrom',.5);
for(let i=0;i<480;i++){ const p=RIVER.getPointAt(i/480); RIVER_BANK.push([p.x,p.z]); }
const RIVER_CELL=16, RIVER_GRID=new Map();
for(const p of RIVER_BANK){ const key=`${Math.floor(p[0]/RIVER_CELL)},${Math.floor(p[1]/RIVER_CELL)}`; if(!RIVER_GRID.has(key)) RIVER_GRID.set(key,[]); RIVER_GRID.get(key).push(p); }
const LAND=(()=>{
  const C={x:19,z:9.8}, BLOCK={x0:-15.6,x1:46.9,z0:-6.6,z1:26.2}, FORE={x0:46.9,x1:53.55,z0:-4.55,z1:24.15};   // the front court with its low walls: the paths outside stop at the wall
  const YARD={x0:BLOCK.x0-1.4,x1:FORE.x1+1.4,z0:BLOCK.z0-1.4,z1:BLOCK.z1+1.4}, FIELD={x0:-195,x1:250,z0:-185,z1:205}, DIKE={dx:16,dz:12,ox:3,oz:3.8,w:.45};
  const ROAD={x0:53,x1:92,z:9.8,w:2.1}, DOCK={x0:86.5,x1:93.5,z0:6.6,z1:13};
  const PONDS=[{x:-38,z:44,r:9},{x:30,z:-38,r:8},{x:72,z:40,r:7}];
  const GY=-.18, WATER_Y=-.125;   // shallow standing water sits just above the paddy soil
  const inBlock=(x,z)=>x>BLOCK.x0&&x<BLOCK.x1&&z>BLOCK.z0&&z<BLOCK.z1, inFore=(x,z)=>x>FORE.x0&&x<FORE.x1&&z>FORE.z0&&z<FORE.z1;
  const DRY={x0:25.2,x1:33.8,z0:26.2,z1:31};   // the laundry's drying yard behind the west wing (LDRY.yard)
  const inYard=(x,z)=>((x>YARD.x0&&x<YARD.x1&&z>YARD.z0&&z<YARD.z1)||(x>DRY.x0&&x<DRY.x1&&z>DRY.z0&&z<DRY.z1))&&!inBlock(x,z)&&!inFore(x,z);
  const onRoad=(x,z)=>x>ROAD.x0&&x<ROAD.x1&&Math.abs(z-ROAD.z)<ROAD.w, onDock=(x,z)=>x>DOCK.x0&&x<DOCK.x1&&z>DOCK.z0&&z<DOCK.z1;
  // each pond's outline wanders: a radius that changes with the angle (a few slow waves), so no pond is a circle
  PONDS.forEach((p,i)=>{ const k=[[.17,.1,.06],[.14,.12,.05],[.2,.08,.07]][i%3], f=[1.3+i,2.1+i*.7,.4+i*1.9]; p.edge=a=>p.r*(1+k[0]*Math.sin(2*a+f[0])+k[1]*Math.sin(3*a+f[1])+k[2]*Math.sin(5*a+f[2])); });
  const inPond=(x,z)=>PONDS.some(p=>{ const dx=x-p.x, dz=z-p.z, d=Math.hypot(dx,dz); return d<p.r*1.4&&d<p.edge(Math.atan2(dz,dx)); });
  const inField=(x,z)=>x>FIELD.x0&&x<FIELD.x1&&z>FIELD.z0&&z<FIELD.z1;
  const dikeX=x=>{ const u=((x-DIKE.ox)%DIKE.dx+DIKE.dx)%DIKE.dx; return Math.min(u,DIKE.dx-u); }, dikeZ=z=>{ const u=((z-DIKE.oz)%DIKE.dz+DIKE.dz)%DIKE.dz; return Math.min(u,DIKE.dz-u); };
  const onDike=(x,z)=>inField(x,z)&&!inBlock(x,z)&&!inPond(x,z)&&!noRice(x,z)&&!EXR.some(r=>x>r.x0&&x<r.x1&&z>r.z0&&z<r.z1)&&(dikeX(x)<DIKE.w||dikeZ(z)<DIKE.w);
  const gatePass=(x,z)=>x>BLOCK.x1-.5&&x<FORE.x1+1&&Math.abs(z-9.8)<1.65;
  const eavePass=(x,z)=>inFore(x,z)&&Math.abs(z-9.8)<1.8;
  const walk=(x,z)=>(inBlock(x,z)&&gatePass(x,z))||(!inBlock(x,z)&&(!inFore(x,z)||eavePass(x,z))&&(inYard(x,z)||onRoad(x,z)||onDock(x,z)||onDike(x,z)||onLevee(x,z)||gatePass(x,z)||eavePass(x,z)));
  
  const riverDistance2=(x,z)=>{ let d=1e9; for(const p of RIVER_BANK){ const dx=x-p[0], dz=z-p[1], q=dx*dx+dz*dz; if(q<d)d=q; } return d; };
  const nearRiver=(x,z)=>{ if(x<95||x>246) return false; const d=riverDistance2(x,z); return d>(RIVER_HALF_WIDTH+1.5)**2&&d<(RIVER_HALF_WIDTH+34)**2; };
  const inRiver=(x,z)=>{ const gx=Math.floor(x/RIVER_CELL), gz=Math.floor(z/RIVER_CELL), max=(RIVER_HALF_WIDTH+2.5)**2; for(let ix=gx-1;ix<=gx+1;ix++) for(let iz=gz-1;iz<=gz+1;iz++){ const pts=RIVER_GRID.get(`${ix},${iz}`); if(!pts) continue; for(const p of pts){ const dx=x-p[0], dz=z-p[1]; if(dx*dx+dz*dz<max) return true; } } return false; };
  // the river's levee: an earthen bank that follows the river on the outer side, LEVEE metres from mid-stream. The paddies stop
  // at it; between it and the water there is only grass and reeds, and the island inside the loop has no paddies at all.
  // Drawn once into top-down masks (2 px a metre) so the rice, the dikes, the ground and the walking can look them up cheaply.
  const LEVEE=RIVER_HALF_WIDTH+7, LW=1.1;
  const MASK=(()=>{ const pts=RIVER_BANK, M=LEVEE+4, PX=2;
    const x0=Math.min(...pts.map(p=>p[0]))-M, x1=Math.max(...pts.map(p=>p[0]))+M, z0=Math.min(...pts.map(p=>p[1]))-M, z1=Math.max(...pts.map(p=>p[1]))+M;
    const W=Math.ceil((x1-x0)*PX), H=Math.ceil((z1-z0)*PX);
    const draw=fn=>{ const cv=document.createElement('canvas'); cv.width=W; cv.height=H; const c=cv.getContext('2d'); c.lineJoin=c.lineCap='round';
      const path=()=>{ c.beginPath(); pts.forEach((p,i)=>{ const X=(p[0]-x0)*PX, Y=(p[1]-z0)*PX; i?c.lineTo(X,Y):c.moveTo(X,Y); }); c.closePath(); };
      const stroke=(r,col)=>{ c.strokeStyle=col; c.lineWidth=r*2*PX; path(); c.stroke(); }, fill=col=>{ c.fillStyle=col; path(); c.fill(); };
      fn(stroke,fill); const d=c.getImageData(0,0,W,H).data, a=new Uint8Array(W*H); for(let i=0;i<W*H;i++) a[i]=d[i*4]; return a; };
    const noRice=draw((stroke,fill)=>{ fill('#fff'); stroke(LEVEE-LW,'#fff'); });                         // the island, the river, the grass bank
    const levee=draw((stroke,fill)=>{ stroke(LEVEE+LW,'#fff'); stroke(LEVEE-LW,'#000'); fill('#000'); });  // the levee's crown, outer side only
    const water=draw(stroke=>stroke(RIVER_HALF_WIDTH+.5,'#fff'));                                       // the riverbed
    const at=(a,x,z)=>{ const X=Math.floor((x-x0)*PX), Y=Math.floor((z-z0)*PX); return X>=0&&Y>=0&&X<W&&Y<H&&a[Y*W+X]>127; };
    return {x0,z0,x1,z1,W,H,noRice,levee,water,at}; })();
  const noRice=(x,z)=>MASK.at(MASK.noRice,x,z), onLevee=(x,z)=>inField(x,z)&&!inPond(x,z)&&MASK.at(MASK.levee,x,z);
  const EXCL=[], EXR=[], inExcl=(x,z)=>EXCL.some(e=>(x-e.x)**2+(z-e.z)**2<e.r*e.r)||EXR.some(r=>x>r.x0&&x<r.x1&&z>r.z0&&z<r.z1);
  const paddy=(x,z)=>!inExcl(x,z)&&inField(x,z)&&!inYard(x,z)&&!inBlock(x,z)&&!inFore(x,z)&&!onRoad(x,z)&&!onDock(x,z)&&!inPond(x,z)&&!noRice(x,z)&&dikeX(x)>DIKE.w+.15&&dikeZ(z)>DIKE.w+.15&&(x<95||nearRiver(x,z));
  return {C,BLOCK,FORE,YARD,FIELD,DIKE,ROAD,DOCK,PONDS,GY,walk,paddy,inPond,inYard,onRoad,onDock,inRiver,EXCL,EXR,inExcl,LEVEE,MASK,noRice,onLevee};
})();
// the trees round the house stand on their own ground: no paddy or dike under them (the 茄苳 by the bamboo, the mangoes)
const TREES={qd:[], mango:[[-16.6,1.2],[-16.6,18.6],[6,-7.6],[33,-7.6],[12,27.3],[69,13.4],[77,6.2]]};
for(const [x,z] of TREES.qd) LAND.EXCL.push({x,z,r:2.2}); for(const [x,z] of TREES.mango) LAND.EXCL.push({x,z,r:1.6});
// ==== 渡船頭站: the station behind the house, on the sixth dike north of it (north is −x, west is +z). The layout here is
//      shared by the walking, the floor heights, the ground, the rice and the dikes; the buildings are made further on
//      (「渡船頭站」 section). The line runs west along the dike, across the fields to the mountains and into a tunnel.
var STN=(()=>{ const TX=-109, R=(x0,x1,z0,z1)=>({x0,x1,z0,z1}), inR=(r,x,z)=>x>r.x0&&x<r.x1&&z>r.z0&&z<r.z1;
  const PL={x0:-115.2,x1:-110.5,z0:-2,z1:30,y:.9}, HS={x0:-123.2,x1:-115.2,z0:2,z1:17,y:.9}, RECT=R(-133,-106.8,-10,31);
  const RAIL={z0:-4.5,z1:322,half:1.6}, PORTAL=268, TUN_END=322;
  const WAIT=R(-123.05,-115.35,2.15,9.95), OFFICE=R(-123.05,-115.35,10.1,16.85), STEPS=R(-125.6,-123.2,3.6,7.2);
  const ZONES=[R(-133,-125.6,-10,31),R(-125.6,-106.8,-9.4,-5.6),STEPS,WAIT,OFFICE,R(-123.3,-122.95,4.2,6.6),R(-115.45,-115.1,4.6,6.2),R(-115.45,-115.1,14.6,15.4),PL,R(TX-2.3,-106.8,-10,31)];
  const OBS=[];   // furniture and posts inside the station (with a body's margin)
  const walk=(x,z)=>{ if(!ZONES.some(r=>inR(r,x,z))) return false; for(const o of OBS) if(x>o.x0-.2&&x<o.x1+.2&&z>o.z0-.2&&z<o.z1+.2) return false; return true; };
  const onRail=(x,z)=>Math.abs(x-TX)<RAIL.half&&z>RAIL.z0&&z<RAIL.z1;
  // where you can walk along and across the line: the whole cleared strip in the fields (so every dike meets the rails), the track bed in the cut
  const railWalk=(x,z)=>{ const d=Math.abs(x-TX); return (d<2.35&&z>-10.5&&z<206)||(d<RAIL.half&&z>=206&&z<RAIL.z1); };
  const floor=(x,z)=>{ if(x<-140||x>-100) return null;
    if(inR(PL,x,z)||inR(WAIT,x,z)||inR(OFFICE,x,z)||(x>-123.3&&x<-115.1&&z>2&&z<17)) return .9;
    if(inR(STEPS,x,z)) return Math.min(.9,Math.max(0,Math.ceil((x-STEPS.x0)/.6)*.225));
    if(onRail(x,z)) return .25; return null; };
  // the cut through the foot of the mountain to the tunnel: a 7 m floor, rock walls at two in one
  const cutH=(h,x,z)=>z<=PORTAL+.01&&z>200?Math.min(h,Math.max(0,(Math.abs(x-TX)-3.5)*2)):h;
  const HOLE=R(-122,-96,210,PORTAL+6), FINE=R(-133,-85,204,PORTAL+6);
  return {TX,PL,HS,RECT,RAIL,PORTAL,TUN_END,WAIT,OFFICE,STEPS,OBS,walk,onRail,railWalk,floor,cutH,HOLE,FINE,inR}; })();
LAND.EXR.push(STN.RECT,{x0:STN.TX-2.3,x1:STN.TX+2.3,z0:-10,z1:206});
{ const _w=LAND.walk; LAND.walk=(x,z)=>{ if(STN.inR(STN.RECT,x,z)) return STN.walk(x,z); if(STN.railWalk(x,z)) return true; return _w(x,z); }; }
{
const RAND=(()=>{ let s=20261118; return ()=>{ s=(s*1664525+1013904223)>>>0; return s/4294967296; }; })();
const hash2=(x,z)=>{ const h=Math.sin(x*127.1+z*311.7)*43758.5453; return h-Math.floor(h); };
const vnoise=(x,z)=>{ const xi=Math.floor(x), zi=Math.floor(z), xf=x-xi, zf=z-zi, u=xf*xf*(3-2*xf), v=zf*zf*(3-2*zf); const a=hash2(xi,zi), b=hash2(xi+1,zi), c=hash2(xi,zi+1), d=hash2(xi+1,zi+1); return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v; };
const U={uTime:{value:0},uWind:{value:new THREE.Vector2(1,0)},uAmp:{value:.4},uRipe:{value:.5},uPale:{value:0},uWaterVis:{value:.4},uRiv:{value:null},uRivBox:{value:new THREE.Vector4(0,0,0,0)}};
// the land masks for the ground shader: red = the riverbed (painted, so no paddy shows through the water from afar),
// green = no paddy (the grass bank inside the levee, the island)
{ const K=LAND.MASK, n=K.W*K.H, d=new Uint8Array(n*4); for(let i=0;i<n;i++){ d[i*4]=K.water[i]; d[i*4+1]=K.noRice[i]; d[i*4+3]=255; }
  const tex=new THREE.DataTexture(d,K.W,K.H,THREE.RGBAFormat); tex.magFilter=tex.minFilter=THREE.LinearFilter; tex.needsUpdate=true;
  U.uRiv.value=tex; U.uRivBox.value.set(K.x0,K.z0,1/(K.x1-K.x0),1/(K.z1-K.z0)); }
window.__LAND={U,LAND};
const reflect=o=>{ o.traverse(m=>m.layers.enable(outdoorReflection.layer)); };
[sky,...scene.children.filter(o=>o.isLight)].forEach(reflect);
const sunDirection=new THREE.Vector3();
const cliffShadows={value:Array.from({length:9},()=>new THREE.Vector4())};
const CLIFF_SHADE=`
  uniform vec3 uLandSun;
  uniform vec4 uCliffShadows[9];
  uniform float uLandDay;
  float cliffShade(vec3 p){
    float shade=0.;
    for(int i=0;i<9;i++){
      vec4 k=uCliffShadows[i];
      vec3 scale=vec3(k.z,k.w,k.z);
      vec3 ray=normalize(uLandSun/scale);
      vec3 origin=(p-vec3(k.x,k.w*.55,k.y))/scale;
      float t=-dot(origin,ray);
      float d=length(origin+ray*max(t,0.));
      shade=max(shade,(1.-smoothstep(.72,1.13,d))*smoothstep(0.,.22,t));
    }
    return shade*uLandDay*smoothstep(.08,.22,uLandSun.y);
  }`;
const landLight={uLandSun:{value:sunDirection},uCliffShadows:cliffShadows,uLandDay:{value:0}};
const wakes={value:[new THREE.Vector4(),new THREE.Vector4()]};
window.__landWalk=LAND.walk; window.__landOut=p=>!(p.x>LAND.BLOCK.x0&&p.x<LAND.BLOCK.x1&&p.z>LAND.BLOCK.z0&&p.z<LAND.BLOCK.z1)&&!(p.x>LAND.FORE.x0-.1&&p.x<LAND.FORE.x1-.4&&p.z>LAND.FORE.z0&&p.z<LAND.FORE.z1);
// paths outside: straight if the line is clear, otherwise along the dike grid (to the nearest crossing, across, along)
window.__landRoute=(a,b)=>{ if(clearLine(a,b)) return [b]; const D=LAND.DIKE, sx=x=>Math.round((x-D.ox)/D.dx)*D.dx+D.ox, sz=z=>Math.round((z-D.oz)/D.dz)*D.dz+D.oz;
  const pts=[]; const ia={x:sx(a.x),z:sz(a.z)}, ib={x:sx(b.x),z:sz(b.z)}; if(!clearLine(a,ia)){ pts.push({x:a.x,z:ia.z}); } pts.push(ia,{x:ib.x,z:ia.z},ib); if(!clearLine(ib,b)) pts.push({x:ib.x,z:b.z}); pts.push(b); return pts; };
// season: the rice always carries ears; green in spring, gold in autumn, pale gold in winter
function season(){ const mo=(new Date(Date.now()+8*3600e3+MEAL_SHIFT*60000)).getUTCMonth()+1; if(mo>=3&&mo<=5) return {ripe:.18,pale:0,water:.8}; if(mo>=6&&mo<=8) return {ripe:.45,pale:0,water:.45}; if(mo>=9&&mo<=11) return {ripe:1,pale:0,water:.22}; return {ripe:.8,pale:.55,water:.6}; }
{ const S=season(); U.uRipe.value=S.ripe; U.uPale.value=S.pale; U.uWaterVis.value=S.water; }
const RICE_GLSL=`uniform float uTime; uniform vec2 uWind; uniform float uAmp; uniform float uRipe; uniform float uPale;
  float waveAt(vec2 p){ vec2 d=normalize(uWind+vec2(1e-4)); float a=dot(p,d); return .62*sin(a*.21-uTime*1.7)+.38*sin(dot(p,vec2(-d.y,d.x))*.13+a*.33-uTime*2.6); }
  vec3 riceCol(float ear){ vec3 g=vec3(.30,.50,.14), y=vec3(.80,.60,.12), e=vec3(.70,.47,.10), p=vec3(.78,.70,.50); vec3 c=mix(g,mix(y,e,ear),clamp(uRipe*(.7+.3*ear)+ear*.15,0.,1.)); return mix(c,p,uPale*.7); }`;
// ---- the hills, as a height function: one range on the island inside the river's loop, its spurs running down to the
// water, two summits; beyond the fields, ranges rising layer behind layer into the haze. Trees, the pavilion, the temple
// and the goats all stand on this ground.
const HILLS=(()=>{
  const poly=RIVER_BANK, ss=THREE.MathUtils.smoothstep;
  const insideLoop=(x,z)=>{ if(x<95||x>245||z<-85||z>185) return false; let c=false; for(let i=0,j=poly.length-1;i<poly.length;j=i++){ const xi=poly[i][0],zi=poly[i][1],xj=poly[j][0],zj=poly[j][1]; if(((zi>z)!==(zj>z))&&(x<(xj-xi)*(z-zi)/(zj-zi)+xi)) c=!c; } return c; };
  const riverD=(x,z)=>{ if(x<20||x>330||z<-170||z>270) return 999; let d=1e9; for(const p of poly){ const dx=x-p[0], dz=z-p[1], q=dx*dx+dz*dz; if(q<d) d=q; } return Math.sqrt(d); };
  const fbm=(x,z,o)=>{ let s=0,a=.5,f=1; for(let i=0;i<o;i++){ s+=a*vnoise(x*f+i*17.3,z*f-i*9.1); a*=.5; f*=2.02; } return s; };
  const ridged=(x,z,o)=>{ let s=0,a=.55,f=1,w=1; for(let i=0;i<o;i++){ let n=1-Math.abs(vnoise(x*f+i*31.7,z*f+i*11.3)*2-1); n*=n*w; w=Math.min(1,n*1.8); s+=n*a; a*=.5; f*=2.07; } return s; };
  // the island's crest line, south to north, wandering
  const spine=new THREE.CatmullRomCurve3([[150,-44],[161,-8],[175,30],[167,70],[183,108],[171,148]].map(([x,z])=>new THREE.Vector3(x,0,z)));
  const SP=[]; { let L=0, prev=null; for(let i=0;i<=200;i++){ const p=spine.getPoint(i/200); if(prev) L+=p.distanceTo(prev); SP.push([p.x,p.z,L]); prev=p; } }
  const spineAt=(x,z)=>{ let best=1e9,bi=0; for(let i=0;i<SP.length;i++){ const dx=x-SP[i][0], dz=z-SP[i][1], q=dx*dx+dz*dz; if(q<best){ best=q; bi=i; } }
    const a=SP[Math.max(0,bi-1)], b=SP[Math.min(SP.length-1,bi+1)], tx=b[0]-a[0], tz=b[1]-a[1], tl=Math.hypot(tx,tz)||1;
    let s=SP[bi][2]; if(bi===0||bi===SP.length-1) s+=((x-SP[bi][0])*tx+(z-SP[bi][1])*tz)/tl*(bi===0?1:1);
    return [s,((x-SP[bi][0])*tz-(z-SP[bi][1])*tx)/tl]; };
  const island=(x,z,rd)=>{ if(!insideLoop(x,z)) return 0; const env=Math.pow(ss(rd,16,125),.7); if(env<=0) return 0;
    const [s,d]=spineAt(x,z);
    const crest=24+20*fbm(s*.012+4.1,1.3,3)+24*Math.exp(-(((s-158)/32)**2))+12*Math.exp(-(((s-52)/26)**2));
    const W=34+14*vnoise(s*.02,7.7);
    const warp=fbm(x*.028,z*.028,2);
    const spur=ridged(s*.05+warp*1.3,Math.abs(d)*.017+warp*.4,4);
    const ad=Math.abs(d), core=Math.exp(-((ad/W)**2)*1.1), skirt=Math.exp(-((ad/(W*2.3))**2));
    return env*(crest*core*(.5+.8*spur)+crest*.34*skirt*spur)+env*3.5*(fbm(x*.09,z*.09,3)-.5); };
  const F=LAND.FIELD;
  const far=(x,z,rd)=>{ const ox=Math.max(F.x0-x,0,x-F.x1), oz=Math.max(F.z0-z,0,z-F.z1), e=Math.hypot(ox,oz); if(e<4) return 0;
    const env=ss(e,4,110)*ss(rd,34,96); if(env<=0||insideLoop(x,z)) return 0;
    const wx=x+90*(fbm(x*.003,z*.003,3)-.5), wz=z+90*(fbm(z*.003+5,x*.003,3)-.5);
    const r=ridged(wx*.0062,wz*.0062,5), band=.5+.5*Math.cos((e+70*(fbm(wx*.004,wz*.004,2)-.5))*.034), big=fbm(wx*.0025+9,wz*.0025,3);
    return env*(28+e*.2)*(.22+.85*r)*(.55+.45*band)*(.6+.7*big); };
  const raw=(x,z)=>{ const rd=riverD(x,z); return Math.max(island(x,z,rd),far(x,z,rd)); };
  const h=(x,z)=>raw(x,z)-.6;     // a little under the paddies where the hills give out
  const slope=(x,z)=>{ const gx=(h(x+1,z)-h(x-1,z))/2, gz=(h(x,z+1)-h(x,z-1))/2; return 1/Math.sqrt(1+gx*gx+gz*gz); };
  return {h,raw,island,far,insideLoop,riverD,fbm,ridged,slope};
})();
window.__HILLS=HILLS;
// the temple stands at the foot of the steepest rise above the inner bank, facing the water
const TEMPLE_AT=(()=>{ let best=null; for(let i=0;i<RIVER_BANK.length;i+=6){ const [bx,bz]=RIVER_BANK[i], [cx,cz]=RIVER_BANK[(i+2)%RIVER_BANK.length]; let nx=-(cz-bz), nz=cx-bx; const l=Math.hypot(nx,nz)||1; nx/=l; nz/=l;
    if(!HILLS.insideLoop(bx+nx*20,bz+nz*20)){ nx=-nx; nz=-nz; } if(!HILLS.insideLoop(bx+nx*20,bz+nz*20)) continue;
    if(Math.hypot(bx-90,bz-10)<40) continue;
    const near=HILLS.h(bx+nx*17,bz+nz*17), up=HILLS.h(bx+nx*36,bz+nz*36), sc=up-4*Math.max(0,near);
    if(!best||sc>best.sc) best={sc,x:bx+nx*17,z:bz+nz*17,nx,nz}; }
  if(best) LAND.EXCL.push({x:best.x,z:best.z,r:10}); return best; })();
// ---- water, shared by the river, the ponds and the paddies: ripples from one tileable slope texture drifting in
// layers; the colour is what you see through the water (bed, darkening and turning green with depth) and what it
// reflects (the hills and sky, more of it the flatter you look), plus the sun's glitter.
const WATER_N=(()=>{ const N=256, data=new Uint8Array(N*N*4); let s=7; const r=()=>((s=s*16807%2147483647)/2147483647);
  const waves=[]; for(let i=0;i<44;i++){ let kx,ky; do{ kx=Math.round((r()*2-1)*13); ky=Math.round((r()*2-1)*13); }while(kx*kx+ky*ky<5); waves.push([kx,ky,Math.pow(Math.hypot(kx,ky),-1.75),r()*6.2832]); }
  const sx=new Float32Array(N*N), sy=new Float32Array(N*N); let m=1e-6;
  for(let y=0;y<N;y++) for(let x=0;x<N;x++){ let dx=0,dy=0; for(const [kx,ky,a,ph] of waves){ const c=Math.cos((kx*x+ky*y)/N*6.2832+ph)*a; dx+=c*kx; dy+=c*ky; } const i=y*N+x; sx[i]=dx; sy[i]=dy; m=Math.max(m,Math.abs(dx),Math.abs(dy)); }
  for(let i=0;i<N*N;i++){ data[i*4]=Math.round(127.5+127*sx[i]/m); data[i*4+1]=Math.round(127.5+127*sy[i]/m); data[i*4+2]=128; data[i*4+3]=255; }
  const t=new THREE.DataTexture(data,N,N,THREE.RGBAFormat); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.magFilter=THREE.LinearFilter; t.minFilter=THREE.LinearMipmapLinearFilter; t.generateMipmaps=true; t.needsUpdate=true; return t; })();
const WATER_U={uWaterN:{value:WATER_N},uSkyH:{value:skyHorizon},uSkyT:{value:skyTop},uWaterLight:{value:new THREE.Color(1,1,1)},uRefl:outdoorReflection.texture,uMirror:{value:outdoorReflection.matrix},uReflOn:outdoorReflection.strength};
const WATER_GLSL=`
  uniform sampler2D uWaterN; uniform vec3 uSkyH, uSkyT, uWaterLight; uniform sampler2D uRefl; uniform mat4 uMirror; uniform float uReflOn;
  vec2 wN(vec2 q){ return texture2D(uWaterN,q).rg*2.-1.; }
  vec2 ripples(vec2 p, vec2 drift, float t){
    vec2 s=wN(p*.019+drift*t*.010);
    s+=.62*wN(mat2(.8,-.6,.6,.8)*p*.053+drift*t*.032);
    s+=.36*wN(mat2(.28,.96,-.96,.28)*p*.15-drift.yx*t*.075);
    s+=.18*wN(mat2(-.6,.8,-.8,-.6)*p*.41+drift*t*.16);
    return s; }
  vec3 waterSky(vec3 wp, vec3 V, vec3 n, float bend){
    vec3 R=reflect(-V,n); R.y=abs(R.y);
    vec3 c=mix(uSkyH,uSkyT,smoothstep(.02,.6,R.y));
    if(uReflOn>.5){ vec4 q=uMirror*vec4(wp,1.); vec2 uv=q.xy/q.w*.5+.5; uv+=n.xz*bend; float b=smoothstep(0.,.05,min(min(uv.x,1.-uv.x),min(uv.y,1.-uv.y))); c=mix(c,texture2D(uRefl,clamp(uv,.002,.998)).rgb,b); }
    return c; }
  float waterFresnel(vec3 V, vec3 n){ return .02+.98*pow(1.-clamp(dot(V,n),0.,1.),5.); }
  float waterGlint(vec3 V, vec3 n){ vec3 R=reflect(-V,n); float d=max(dot(R,normalize(uLandSun)),0.); return (pow(d,1400.)*6.+pow(d,160.)*.07)*uLandDay*smoothstep(.02,.15,uLandSun.y); }
  // bed: what lies under the water; absorb: how fast each colour fades with depth; scatter: the water's own colour
  vec3 shadeWater(vec3 wp, vec3 n, float depth, vec3 bed, vec3 absorb, vec3 scatter, float shade, float bend){
    vec3 V=normalize(cameraPosition-wp); float path=depth*(1.+1./max(V.y,.07)); vec3 Tr=exp(-absorb*path); vec3 L=uWaterLight*(1.-shade*.42);
    vec3 body=bed*Tr*L+scatter*L*(1.-Tr); float F=waterFresnel(V,n);
    return mix(body,waterSky(wp,V,n,bend),F)+waterGlint(V,n)*(1.-shade)*vec3(1.,.95,.84); }`;
// ---- the ground: paddies with rows of rice, raised dikes, the waves seen from afar; water shows between the rice
// (most in spring when the rice is young, little at harvest) and mirrors the hills when you look across it
{ const cv=document.createElement('canvas'); cv.width=cv.height=256; const g=cv.getContext('2d'); g.fillStyle='#808080'; g.fillRect(0,0,256,256);
  for(let i=0;i<256;i+=8){ for(let j=0;j<256;j+=3){ const v=150+Math.random()*90; g.fillStyle=`rgb(${v},${v},${v})`; g.fillRect(i+1+Math.random()*2,j,4,2); } }
  const tex=new THREE.CanvasTexture(cv); tex.wrapS=tex.wrapT=THREE.RepeatWrapping; tex.repeat.set(380,380);
  const m=new THREE.MeshLambertMaterial({map:tex,color:0xffffff});
  m.onBeforeCompile=sh=>{ Object.assign(sh.uniforms,U,landLight,WATER_U); sh.vertexShader='varying vec3 vWP;\n'+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\n vWP=(modelMatrix*vec4(transformed,1.)).xyz;');
    sh.fragmentShader='varying vec3 vWP;\nuniform float uWaterVis;\nuniform sampler2D uRiv; uniform vec4 uRivBox;\nvec3 pAdd;\n'+RICE_GLSL+CLIFF_SHADE+WATER_GLSL+'\n'+sh.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
      float w=waveAt(vWP.xz); vec3 rc=mix(riceCol(.0),riceCol(1.),.35)*(.74+.3*w);
      float inF=step(-195.,vWP.x)*step(vWP.x,250.)*step(-185.,vWP.z)*step(vWP.z,205.); vec3 meadow=vec3(.30,.40,.18)*(.8+.4*diffuseColor.r);
      vec2 ruv=(vWP.xz-uRivBox.xy)*uRivBox.zw; vec2 rm=(uRivBox.z>0.&&ruv.x>0.&&ruv.x<1.&&ruv.y>0.&&ruv.y<1.)?texture2D(uRiv,ruv).rg:vec2(0.); float riv=rm.x; inF*=1.-rm.y; inF*=1.-clamp(${LAND.EXR.map(r=>`step(${r.x0.toFixed(2)},vWP.x)*step(vWP.x,${r.x1.toFixed(2)})*step(${r.z0.toFixed(2)},vWP.z)*step(vWP.z,${r.z1.toFixed(2)})`).join('+')||'0.'},0.,1.);
      vec2 grid=(vWP.xz-vec2(${LAND.DIKE.ox},${LAND.DIKE.oz}))/vec2(${LAND.DIKE.dx.toFixed(1)},${LAND.DIKE.dz.toFixed(1)});
      vec2 plot=floor(grid); float plotTone=fract(sin(dot(plot,vec2(37.71,67.13)))*2718.15);
      vec2 edge=(.5-abs(fract(grid)-.5))*vec2(${LAND.DIKE.dx.toFixed(1)},${LAND.DIKE.dz.toFixed(1)});
      float wetEdge=1.-smoothstep(.5,1.45,min(edge.x,edge.y));
      float paddyMask=inF*step(.5,edge.x)*step(.5,edge.y);
      vec3 V=normalize(cameraPosition-vWP); float dist=length(cameraPosition-vWP);
      float rows=.5+.5*cos(vWP.x*20.94)*(1.-smoothstep(6.,26.,dist));
      float wet=paddyMask*clamp(uWaterVis*(.25+.75*sqrt(max(V.y,0.)))*(.55+.45*rows)+wetEdge*.35,0.,1.);
      vec3 mud=vec3(.17,.155,.10)*(.85+.3*plotTone);
      vec3 field=mix(rc*(.71+.40*diffuseColor.r)*(.87+.21*plotTone),vec3(.20,.25,.14),wetEdge*.45);
      float shade=cliffShade(vWP);
      vec2 s=ripples(vWP.xz*1.7,uWind*.5,uTime)*(.018+.05*uAmp); vec3 n=normalize(vec3(-s.x,1.,-s.y));
      float F=waterFresnel(V,n);
      field=mix(field,mud,wet)*(1.-F*wet);
      diffuseColor.rgb=mix(meadow,field,inF)*(1.-.48*shade);
      diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.19,.34,.29),riv);
      pAdd=(waterSky(vWP,V,n,.025)*F*(1.-shade*.3)+waterGlint(V,n)*(1.-shade)*.6)*wet*inF*(1.-riv);`).replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n totalEmissiveRadiance+=pAdd;'); };
  m.polygonOffset=true; m.polygonOffsetFactor=3; m.polygonOffsetUnits=3;   // kept behind the water so it never shows through far away
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(1900,1900),m); ground.rotation.x=-Math.PI/2; ground.position.set(LAND.C.x,LAND.GY,LAND.C.z); ground.receiveShadow=true; ground.userData={type:'floor'}; pickables.push(ground); scene.add(ground); ZL_DYN.push(ground); }
// the dikes: walkable earthen berms with sloped sides, uneven edges, and a soft grassy crown
{ const F=LAND.FIELD, D=LAND.DIKE, pos=[], col=[], idx=[], green=new THREE.Color(), brown=new THREE.Color(0x715d3d), grassA=new THREE.Color(0x607a3b), grassB=new THREE.Color(0x82944b);
  const ridge=(x0,z0,x1,z1)=>{ const len=Math.hypot(x1-x0,z1-z0); if(len<.7) return; const dx=(x1-x0)/len,dz=(z1-z0)/len,nx=-dz,nz=dx, rows=Math.max(1,Math.ceil(len/1.8)), base=pos.length/3, profile=[[-.68,0],[-.39,.11],[-.20,.18],[.20,.18],[.39,.11],[.68,0]], seed=x0*3.7+z0*5.1;
    for(let row=0;row<=rows;row++){ const t=row/rows, wave=Math.sin(t*11+seed)*.055+Math.sin(t*19-seed)*.025, wobble=.91+.09*Math.sin(t*8+seed), h=.86+.18*Math.sin(t*7.3+seed*.6), cx=x0+(x1-x0)*t+nx*wave, cz=z0+(z1-z0)*t+nz*wave;
      for(let k=0;k<profile.length;k++){ const [off,ey]=profile[k], side=off*wobble+wave*.28; pos.push(cx+nx*side,-.18+ey*h,cz+nz*side);
        const top=(k===2||k===3), variation=.88+.19*hash2(cx+k,cz-row); green.copy(top?grassA:brown); if(top) green.lerp(grassB,(k===2?.25:.12)+.18*hash2(cx,cz)); green.multiplyScalar(variation); col.push(green.r,green.g,green.b); }
      if(row<rows) for(let k=0;k<profile.length-1;k++){ const a=base+row*profile.length+k,b=a+profile.length; idx.push(a,b,a+1,b,b+1,a+1); }
    }
  };
  const cut=(a0,a1,fn,add)=>{ let start=null; const step=.5; for(let a=a0;a<=a1;a+=step){ const ok=fn(a); if(ok&&start===null) start=a; if((!ok||a+step>a1)&&start!==null){ add(start,ok?a:a-step); start=null; } } };
  for(let x=Math.ceil((F.x0-D.ox)/D.dx)*D.dx+D.ox;x<F.x1;x+=D.dx) cut(F.z0,F.z1,z=>!(z>LAND.YARD.z0&&z<LAND.YARD.z1&&x>LAND.YARD.x0&&x<LAND.YARD.x1)&&!LAND.inYard(x,z)&&!LAND.inPond(x,z)&&!LAND.onRoad(x,z)&&!LAND.inRiver(x,z)&&!LAND.noRice(x,z)&&!LAND.inExcl(x,z),(a,b)=>ridge(x,a,x,b));
  for(let z=Math.ceil((F.z0-D.oz)/D.dz)*D.dz+D.oz;z<F.z1;z+=D.dz) cut(F.x0,F.x1,x=>!(z>LAND.YARD.z0&&z<LAND.YARD.z1&&x>LAND.YARD.x0&&x<LAND.YARD.x1)&&!LAND.inYard(x,z)&&!LAND.inPond(x,z)&&!LAND.inRiver(x,z)&&!LAND.noRice(x,z)&&!LAND.inExcl(x,z),(a,b)=>ridge(a,z,b,z));
  const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3)); geo.setIndex(idx); geo.computeVertexNormals();
  const berm=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide})); berm.receiveShadow=true; scene.add(berm); }
// the levee along the river's outer bank: a broad earthen berm with a grassy crown you can walk; it breaks for the jetty
{ const pos=[], col=[], idx=[], brown=new THREE.Color(0x6e5a3a), grassA=new THREE.Color(0x5f7a39), grassB=new THREE.Color(0x86984c), k=new THREE.Color();
  const prof=[[-1.6,0],[-1.0,.1],[-.6,.18],[.6,.18],[1.0,.1],[1.6,0]], P=RIVER_BANK, N=P.length, L=LAND.LEVEE; let prev=-1;
  for(let i=0;i<=N;i++){ const a=P[(i-1+N)%N], b=P[i%N], c=P[(i+1)%N]; let tx=c[0]-a[0], tz=c[1]-a[1]; const tl=Math.hypot(tx,tz)||1; tx/=tl; tz/=tl;
    let nx=-tz, nz=tx; if(!LAND.MASK.at(LAND.MASK.levee,b[0]+nx*L,b[1]+nz*L)){ nx=-nx; nz=-nz; }
    const cx=b[0]+nx*L, cz=b[1]+nz*L, ok=LAND.onLevee(cx,cz)&&!LAND.onRoad(cx,cz)&&!LAND.onDock(cx,cz)&&!LAND.inExcl(cx,cz);
    if(!ok){ prev=-1; continue; } const base=pos.length/3, w=.92+.08*Math.sin(i*.7), h=.9+.1*Math.sin(i*1.3);
    prof.forEach(([o,y],j)=>{ pos.push(cx+nx*o*w,-.18+y*h,cz+nz*o*w); const top=j===2||j===3; k.copy(top?grassA:brown); if(top) k.lerp(grassB,.3*hash2(cx,cz)); k.multiplyScalar(.88+.2*hash2(cx+j,cz-i)); col.push(k.r,k.g,k.b); });
    if(prev>=0) for(let j=0;j<prof.length-1;j++){ const p0=prev+j, q0=base+j; idx.push(p0,q0,p0+1,q0,q0+1,p0+1); } prev=base; }
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(col,3)); g.setIndex(idx); g.computeVertexNormals();
  const lv=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide})); lv.receiveShadow=true; lv.userData={type:'floor'}; pickables.push(lv); scene.add(lv); }
function mergeGeo(gs){ const pos=[], nor=[], col=[]; let hasCol=false; for(const g0 of gs){ const g=g0.index?g0.toNonIndexed():g0; pos.push(...g.attributes.position.array); nor.push(...(g.attributes.normal?g.attributes.normal.array:new Float32Array(g.attributes.position.count*3))); if(g.attributes.color){ hasCol=true; col.push(...g.attributes.color.array); } else col.push(...new Float32Array(g.attributes.position.count*3).fill(1)); }
  const out=new THREE.BufferGeometry(); out.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); out.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3)); if(hasCol) out.setAttribute('color',new THREE.Float32BufferAttribute(col,3)); return out; }
// the 曬穀場 round the house, the road to the jetty, the jetty
{ const Y=LAND.YARD, B=LAND.BLOCK, earth=new THREE.MeshLambertMaterial({color:0xb5a07a});
  const rect=(x0,x1,z0,z1)=>[[x0,z0],[x1,z0],[x1,z1],[x0,z1]].map(([x,z])=>new THREE.Vector2(x,-z));
  const sh=new THREE.Shape(rect(Y.x0,Y.x1,Y.z0,Y.z1));
  sh.holes.push(new THREE.Path(rect(B.x0+.3,B.x1-.3,B.z0+.3,B.z1-.3).reverse()));
  const yg=new THREE.ShapeGeometry(sh); yg.rotateX(-Math.PI/2);
  { const Dy=LDRY.yard, dg=new THREE.Mesh(new THREE.PlaneGeometry(Dy.x1-Dy.x0,Dy.z1-Dy.z0),earth); dg.rotation.x=-Math.PI/2; dg.position.set((Dy.x0+Dy.x1)/2,-.03,(Dy.z0+Dy.z1)/2); dg.userData={type:'floor'}; pickables.push(dg); scene.add(dg); }   // the drying yard
  const yard=new THREE.Mesh(yg,earth); yard.position.y=-.027; yard.receiveShadow=true; yard.userData={type:'floor'}; pickables.push(yard); scene.add(yard);
  const R=LAND.ROAD;
  const boardwalk=new THREE.Group(); boardwalk.name='宅前木板棧道';
  const plankWood=new THREE.MeshStandardMaterial({color:0x806044,roughness:.78});
  const darkWood=new THREE.MeshStandardMaterial({color:0x4c3828,roughness:.86});
  const length=R.x1-R.x0, width=R.w*2;
  const walkDeck=new THREE.Mesh(new THREE.BoxGeometry(length,.16,width),plankWood);
  walkDeck.position.set((R.x0+R.x1)/2,-.02,R.z);
  walkDeck.receiveShadow=true; walkDeck.castShadow=true; walkDeck.userData={type:'floor'};
  boardwalk.add(walkDeck); pickables.push(walkDeck);
  for(let x=R.x0+.12;x<R.x1-.08;x+=.72){
    const plank=new THREE.Mesh(new THREE.BoxGeometry(.66,.035,width-.08),plankWood);
    plank.position.set(x,.067,R.z); plank.receiveShadow=true; boardwalk.add(plank);
    for(const side of [-1,1]){
      const nail=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,.009,8),darkWood);
      nail.rotation.x=Math.PI/2; nail.position.set(x-.22,.087,R.z+side*(width/2-.22)); boardwalk.add(nail);
    }
  }
  for(const z of [R.z-width/2+.15,R.z+width/2-.15]){
    const beam=new THREE.Mesh(new THREE.BoxGeometry(length,.12,.14),darkWood);
    beam.position.set((R.x0+R.x1)/2,-.16,z); boardwalk.add(beam);
    for(let x=R.x0+.6;x<R.x1;x+=3.2){
      const pile=new THREE.Mesh(new THREE.CylinderGeometry(.11,.14,.75,8),darkWood);
      pile.position.set(x,-.42,z); pile.castShadow=true; boardwalk.add(pile);
    }
  }
  boardwalk.traverse(o=>{if(o.isMesh&&o.userData.type!=='floor')o.userData={type:'floor'};});
  scene.add(boardwalk);
  // ---- path lights along the boardwalk from the low gate to the jetty: small round in-ground lights set flush in the
  //      planks, in pairs facing each other across the walk; a low, warm glow (about 2700 K). None inside the court.
  //      They come on at dusk with the lanterns.
  { const steelM=new THREE.MeshStandardMaterial({color:0x9a9d9f,roughness:.35,metalness:.8}), lensM=new THREE.MeshStandardMaterial({color:0x6a5a48,roughness:.2,emissive:0xffa956,emissiveIntensity:0}),
      poolT=textCanvas(128,128,(g,w,h)=>{ const gr=g.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2); gr.addColorStop(0,'rgba(255,190,120,.8)'); gr.addColorStop(.3,'rgba(255,170,95,.28)'); gr.addColorStop(1,'rgba(255,160,90,0)'); g.fillStyle=gr; g.fillRect(0,0,w,h); }),
      poolM=new THREE.MeshBasicMaterial({map:poolT,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,polygonOffset:true,polygonOffsetFactor:-2});
    const y0=.0845, x0=R.x0+1.5, x1=LAND.DOCK.x0-1.2, n=Math.max(2,Math.round((x1-x0)/4.5)+1), pts=[];
    for(let i=0;i<n;i++){ const x=x0+i*(x1-x0)/(n-1); for(const sd of [-1,1]) pts.push([x,R.z+sd*(R.w-.32)]); }
    const N=pts.length, rim=new THREE.CylinderGeometry(.065,.065,.008,20), lens=new THREE.CircleGeometry(.045,20), pool=new THREE.PlaneGeometry(1.1,1.1); lens.rotateX(-Math.PI/2); pool.rotateX(-Math.PI/2);
    const IM=[new THREE.InstancedMesh(rim,steelM,N),new THREE.InstancedMesh(lens,lensM,N),new THREE.InstancedMesh(pool,poolM,N)], m=new THREE.Matrix4();
    pts.forEach(([x,z],i)=>{ m.makeTranslation(x,y0+.003,z); IM[0].setMatrixAt(i,m); m.makeTranslation(x,y0+.0075,z); IM[1].setMatrixAt(i,m); m.makeTranslation(x,y0+.009,z); IM[2].setMatrixAt(i,m); });
    for(const im of IM){ im.instanceMatrix.needsUpdate=true; im.userData={type:'pathlight'}; scene.add(im); } pickables.push(IM[0],IM[1]);
    ZL_ANIM.push(()=>{ const k=SKY_DAY<.35?1:SKY_DAY<.6?(.6-SKY_DAY)/.25:0; poolM.opacity=.5*k; lensM.emissiveIntensity=1.2*k; lensM.color.setHex(k>.1?0xffd9a8:0x6a5a48); }); }
  const D=LAND.DOCK, wood=new THREE.MeshLambertMaterial({color:0x6e5238});
  const deck=new THREE.Mesh(new THREE.BoxGeometry(D.x1-D.x0,.12,D.z1-D.z0),wood); deck.position.set((D.x0+D.x1)/2,-.06,(D.z0+D.z1)/2); deck.userData={type:'floor'}; pickables.push(deck); scene.add(deck);
  for(let x=D.x0+.3;x<D.x1;x+=1.5) for(const z of [D.z0+.2,D.z1-.2]){ const p=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,1.4,8),wood); p.position.set(x,-.5,z); scene.add(p); }
  for(let x=D.x0+.4;x<D.x1;x+=.45){ const pl=new THREE.Mesh(new THREE.BoxGeometry(.04,.005,D.z1-D.z0-.1),new THREE.MeshLambertMaterial({color:0x4e3a28})); pl.position.set(x,.003,(D.z0+D.z1)/2); scene.add(pl); }
  const post=new THREE.Mesh(new THREE.BoxGeometry(.12,1.6,.12),wood); post.position.set(D.x0+.4,.8,D.z1-.3); scene.add(post);
  const sign=new THREE.Mesh(new THREE.PlaneGeometry(.5,.8),new THREE.MeshLambertMaterial({map:textCanvas(64,104,(g,w,h)=>{ g.fillStyle='#d8bf94'; g.fillRect(0,0,w,h); g.fillStyle='#3a2a1e'; g.font='700 30px "Noto Serif TC",serif'; g.textAlign='center'; g.fillText('渡',w/2,46); g.fillText('頭',w/2,86); })})); sign.position.set(D.x0+.4,1.3,D.z1-.23); scene.add(sign); sign.userData={type:'jetty'}; pickables.push(sign); }
// ---- the river: clear green water round the island, sandy and pebbly where it is shallow by the banks, deep jade in
// the channel; the ripples flow downstream, the boats leave wakes, the hills stand in it
// Sample the shoreline once for the water, the banks and the reeds.
{
  const samples=600;
  const dockCenter=RIVER.getPointAt(0);
  const shore=Array.from({length:samples+1},(_,i)=>{
    const u=i/samples, p=RIVER.getPointAt(u), d=RIVER.getTangentAt(u);
    const angle=u*Math.PI*2;
    const bend=.48*Math.sin(angle*7)+.25*Math.sin(angle*19);
    const atDock=1-THREE.MathUtils.smoothstep(p.distanceTo(dockCenter),5,14);
    const width=RIVER_HALF_WIDTH+THREE.MathUtils.lerp(bend,.15,atDock);
    return {p,d,nx:-d.z,nz:d.x,width};
  });
  function riverStrip(profile,flow){
    const pos=[], uv=[], fl=[], idx=[];
    const columns=profile.length;
    shore.forEach(({p,d,nx,nz,width},row)=>{
      profile.forEach(([side,offset,height],col)=>{
        const r=side*(width+offset);
        pos.push(p.x+nx*r,height,p.z+nz*r);
        uv.push(col/(columns-1),row/samples); fl.push(d.x,d.z);
        if(row<samples&&col<columns-1){
          const i=row*columns+col;
          idx.push(i,i+1,i+columns,i+1,i+columns+1,i+columns);
        }
      });
    });
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
    g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
    if(flow) g.setAttribute('flow',new THREE.Float32BufferAttribute(fl,2));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }
  const waterMat=new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide});
  waterMat.onBeforeCompile=sh=>{
    Object.assign(sh.uniforms,landLight,WATER_U,{uTime:U.uTime,uWind:U.uWind,uAmp:U.uAmp,uWakes:wakes});
    sh.vertexShader='attribute vec2 flow; varying vec3 vRW; varying vec2 vRUV; varying vec2 vFlow;\n'+sh.vertexShader.replace(
      '#include <project_vertex>','#include <project_vertex>\n vRW=(modelMatrix*vec4(transformed,1.)).xyz; vRUV=uv; vFlow=flow;');
    sh.fragmentShader='varying vec3 vRW; varying vec2 vRUV; varying vec2 vFlow;\nuniform float uTime, uAmp; uniform vec2 uWind; uniform vec4 uWakes[2];\n'+CLIFF_SHADE+WATER_GLSL+sh.fragmentShader.replace('#include <opaque_fragment>',`
      vec2 p=vRW.xz, fl=normalize(vFlow+vec2(1e-5))*.5;
      float ph0=fract(uTime*.045), ph1=fract(uTime*.045+.5), bl=abs(2.*ph0-1.);
      vec2 drift=uWind*.5;
      vec2 s=mix(ripples(p-fl*ph0*22.,drift,uTime),ripples(p-fl*ph1*22.+vec2(13.7,7.3),drift,uTime),bl);
      float wake=0.; vec2 ws=vec2(0.);
      for(int i=0;i<2;i++){
        vec4 boat=uWakes[i]; vec2 dl=p-boat.xy; float back=-dot(dl,boat.zw); vec2 side=vec2(-boat.w,boat.z); float acr=dot(dl,side);
        float crest=exp(-abs(abs(acr)-.33*back-.15)*4.)*(.5+.5*sin(back*7.-uTime*3.));
        float k=crest*smoothstep(.3,2.,back)*(1.-smoothstep(4.,16.,back))*smoothstep(.5,.9,length(boat.zw));
        wake+=k; ws+=side*sign(acr)*k*.5; }
      float amp=.075+.11*uAmp;
      vec3 n=normalize(vec3(-s.x*amp-ws.x,1.,-s.y*amp-ws.y));
      float edge=min(vRUV.x,1.-vRUV.x)*2.;
      float depth=.08+2.6*pow(smoothstep(0.,.8,edge),.85);
      vec2 bp=p+n.xz*depth*1.4;
      vec3 bed=mix(vec3(.36,.33,.24),vec3(.22,.23,.16),smoothstep(-.2,.7,wN(bp*.035).x));
      bed*=.78+.42*smoothstep(.1,.9,abs(wN(bp*.9).y));
      float ca=pow(clamp(1.-abs(wN(bp*.21+uTime*.025).x+wN(bp*.29-uTime*.02).y)*.9,0.,1.),7.);
      float shade=cliffShade(vRW);
      bed*=1.+ca*.7*(1.-smoothstep(.15,1.2,depth))*uLandDay*(1.-shade);
      vec3 col=shadeWater(vRW,n,depth,bed,vec3(.60,.21,.18),vec3(.018,.07,.062),shade,.04);
      col+=wake*.05*uWaterLight;
      col=mix(col,vec3(.78,.80,.74)*uWaterLight,(1.-smoothstep(0.,.03,edge))*.28);
      outgoingLight=col;
      #include <opaque_fragment>`);
  };
  const water=new THREE.Mesh(riverStrip([[1,.15,-.1],[-1,.15,-.1]],true),waterMat);
  scene.add(water);
  ZL_DYN.push(water);
  const bankMat=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});
  for(const side of [1,-1]){
    const g=riverStrip([[side,-.25,-.16],[side,.25,-.09],[side,.9,-.06],[side,1.9,-.175]]); const c=[], wet=new THREE.Color(0x4e4632), dry=new THREE.Color(0x7a6f4c), grass=new THREE.Color(0x5d7038);
    for(let i=0;i<g.attributes.position.count;i++){ const col=i%4; const k=[wet,wet.clone().lerp(dry,.5),dry,grass][col].clone().multiplyScalar(.88+.24*hash2(i*.37,i*.11)); c.push(k.r,k.g,k.b); }
    g.setAttribute('color',new THREE.Float32BufferAttribute(c,3));
    const bank=new THREE.Mesh(g,bankMat); scene.add(bank); reflect(bank);
  }
  const reeds=[];
  const rg=new THREE.ConeGeometry(.06,1.1,4);
  rg.translate(0,.55,0);
  for(const {p,nx,nz,width} of shore.slice(0,-1)){
    for(const side of [1,-1]){
      if(RAND()>=.55) continue;
      const r=(width+.2+RAND()*1.2)*side;
      const x=p.x+nx*r, z=p.z+nz*r, height=.55+RAND()*.85;
      const dock=LAND.DOCK;
      if(x<dock.x1+.65&&x>dock.x0&&z>dock.z0-.6&&z<dock.z1+.6) continue;
      reeds.push([x,z,height]);
    }
  }
  const rm=new THREE.InstancedMesh(rg,new THREE.MeshLambertMaterial({color:0xffffff}),reeds.length);
  const mm=new THREE.Matrix4(), rc=new THREE.Color();
  reeds.forEach(([x,z,h],i)=>{
    mm.makeScale(1,h,1);
    mm.setPosition(x,-.14,z);
    rm.setMatrixAt(i,mm); rm.setColorAt(i,rc.setHex(0x6f8546).lerp(new THREE.Color(0xa49a5e),hash2(x,z)*.5));
  });
  scene.add(rm); reflect(rm);
}
// ---- the hills as meshes: a fine grid over the island, a polar grid for the far ranges; coloured by height, slope and
// woodland; far slopes fade blue into the haze. Trees on the island; summits for the pavilion and the hill shadows.
const PEAKS=[];
{ const ss=THREE.MathUtils.smoothstep, H=HILLS;
  const forest=(x,z)=>H.fbm(x*.03+3.3,z*.03-1.1,3);
  const tint=(g,far)=>{ const P=g.attributes.position, N=g.attributes.normal, col=new Float32Array(P.count*3), c=new THREE.Color();
    const wood=new THREE.Color(.15,.27,.12), wood2=new THREE.Color(.21,.33,.15), glade=new THREE.Color(.36,.46,.21), high=new THREE.Color(.40,.43,.25), rock=new THREE.Color(.44,.40,.32);
    for(let i=0;i<P.count;i++){ const x=P.getX(i), y=P.getY(i)+.6, z=P.getZ(i), ny=N.getY(i), f=forest(x,z), p=vnoise(x*.13,z*.13);
      c.copy(wood).lerp(wood2,ss(f,.35,.65)); c.lerp(glade,ss(f,.58,.74)*(1-ss(y,30,70))*.85+ss(1.5-y,0,1.5)*.6);
      c.lerp(high,ss(y,far?110:62,far?210:96)*.6); c.lerp(rock,(1-ss(ny,.42,.62))*.7);
      c.multiplyScalar(.84+.32*p); col.set([c.r,c.g,c.b],i*3); }
    g.setAttribute('color',new THREE.BufferAttribute(col,3)); };
  const upward=g=>{ const N=g.attributes.normal; let s=0; for(let i=0;i<N.count;i+=7) s+=N.getY(i); if(s>=0) return; const I=g.index.array; for(let i=0;i<I.length;i+=3){ const t=I[i+1]; I[i+1]=I[i+2]; I[i+2]=t; } g.index.needsUpdate=true; g.computeVertexNormals(); };
  const grid=(x0,x1,z0,z1,st)=>{ const nx=Math.round((x1-x0)/st), nz=Math.round((z1-z0)/st), pos=new Float32Array((nx+1)*(nz+1)*3), idx=[];
    for(let j=0;j<=nz;j++) for(let i=0;i<=nx;i++){ const x=x0+i*st, z=z0+j*st, k=(j*(nx+1)+i)*3; pos[k]=x; pos[k+1]=H.h(x,z); pos[k+2]=z;
      if(i<nx&&j<nz){ const a=j*(nx+1)+i, b=a+nx+1; idx.push(a,b,a+1,a+1,b,b+1); } }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setIndex(idx); g.computeVertexNormals(); upward(g); return {g,nx,nz}; };
  const polar=(r0,r1,k,seg)=>{ const rings=[]; for(let r=r0;r<r1;r*=k) rings.push(r); rings.push(r1); const pos=new Float32Array(rings.length*(seg+1)*3), idx=[];
    rings.forEach((r,j)=>{ for(let i=0;i<=seg;i++){ const a=i/seg*Math.PI*2, x=LAND.C.x+Math.cos(a)*r, z=LAND.C.z+Math.sin(a)*r, q=(j*(seg+1)+i)*3; pos[q]=x; pos[q+1]=H.h(x,z); pos[q+2]=z;
      if(j<rings.length-1&&i<seg){ const A=j*(seg+1)+i, B=A+seg+1; idx.push(A,A+1,B,A+1,B+1,B); } } });
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setIndex(idx); g.computeVertexNormals(); upward(g); return g; };
  const hm=new THREE.MeshLambertMaterial({vertexColors:true});
  hm.onBeforeCompile=sh=>{ Object.assign(sh.uniforms,landLight,{uSkyH:WATER_U.uSkyH});
    sh.vertexShader='varying vec3 vHW;\n'+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\n vHW=(modelMatrix*vec4(transformed,1.)).xyz;');
    sh.fragmentShader='varying vec3 vHW;\nuniform vec3 uSkyH;\n'+sh.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      float grain=vnoiseH(vHW.xz*.9)*.5+vnoiseH(vHW.xz*3.1)*.3;
      diffuseColor.rgb*=.9+.2*grain*(1.-smoothstep(30.,160.,length(cameraPosition-vHW)));`).replace('#include <fog_fragment>',`
      float hz=smoothstep(110.,900.,length(cameraPosition-vHW));
      gl_FragColor.rgb=mix(gl_FragColor.rgb,uSkyH*vec3(.62,.78,.86)*(.55+.45*uLandDay),hz*.22);
      #include <fog_fragment>`).replace('void main() {',`float hashH(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
      float vnoiseH(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(hashH(i),hashH(i+vec2(1,0)),f.x),mix(hashH(i+vec2(0,1)),hashH(i+vec2(1,1)),f.x),f.y); }
      uniform float uLandDay;
      void main() {`); };
  const isl=grid(96,246,-86,186,1.5); tint(isl.g,false);
  const farG=polar(185,1000,1.02,420); tint(farG,true);
  if(typeof STN!=='undefined'&&STN.HOLE){ const Hh=STN.HOLE, P=farG.attributes.position, I=farG.index.array, keep=[]; for(let i=0;i<I.length;i+=3){ const cx=(P.getX(I[i])+P.getX(I[i+1])+P.getX(I[i+2]))/3, cz=(P.getZ(I[i])+P.getZ(I[i+1])+P.getZ(I[i+2]))/3; if(cx>Hh.x0&&cx<Hh.x1&&cz>Hh.z0&&cz<Hh.z1) continue; keep.push(I[i],I[i+1],I[i+2]); } farG.setIndex(keep); }
  for(const g of [isl.g,farG]){ const m=new THREE.Mesh(g,hm); m.receiveShadow=true; scene.add(m); reflect(m); }
  // summits of the island, highest first
  { const P=isl.g.attributes.position, nx=isl.nx, nz=isl.nz, Y=(i,j)=>P.getY(j*(nx+1)+i), c=[];
    for(let j=6;j<nz-6;j+=2) for(let i=6;i<nx-6;i+=2){ const y=Y(i,j); if(y<18) continue; let top=true; for(let b=-6;b<=6&&top;b+=2) for(let a=-6;a<=6;a+=2) if((a||b)&&Y(i+a,j+b)>y){ top=false; break; } if(top) c.push({x:P.getX(j*(nx+1)+i),z:P.getZ(j*(nx+1)+i),H:y}); }
    c.sort((a,b)=>b.H-a.H); for(const s of c){ if(PEAKS.every(p=>Math.hypot(p.x-s.x,p.z-s.z)>26)) PEAKS.push({x:s.x,z:s.z,H:s.H,R:22}); if(PEAKS.length>=9) break; } }
  cliffShadows.value.forEach((shadow,i)=>{ const P=PEAKS[i]; if(P) shadow.set(P.x,P.z,P.R*1.3,P.H); else shadow.set(1e5,1e5,1,1); });
  // trees: broadleaf crowns and a few firs, in the woods, thinning on steep and high ground
  const broad=[], fir=[];
  for(let k=0;k<26000&&broad.length+fir.length<6500;k++){ const x=98+RAND()*146, z=-84+RAND()*268; if(!H.insideLoop(x,z)) continue; const y=H.h(x,z); if(y<1.2) continue;
    const f=forest(x,z), sl=H.slope(x,z); if(f>.62||sl<.42||RAND()>(.6-f*.5)*(1-ss(y,55,85)*.6)) continue;
    (RAND()<.2&&y>20?fir:broad).push([x,y,z,f]); }
  const place=(geo,list,scale,base,var2)=>{ const im=new THREE.InstancedMesh(geo,new THREE.MeshLambertMaterial({color:0xffffff}),list.length), m=new THREE.Matrix4(), q=new THREE.Quaternion(), s=new THREE.Vector3(), v=new THREE.Vector3(), c=new THREE.Color(), up=new THREE.Vector3(0,1,0);
    list.forEach(([x,y,z,f],i)=>{ const sz=scale[0]+hash2(x,z)*scale[1]; q.setFromAxisAngle(up,hash2(z,x)*6.28); s.set(sz,sz*(.8+hash2(x*2,z)*.5),sz); v.set(x,y+sz*base,z); m.compose(v,q,s); im.setMatrixAt(i,m);
      im.setColorAt(i,c.setHex(var2[0]).lerp(new THREE.Color(var2[1]),hash2(x*.7,z*1.3)).multiplyScalar(.82+.3*hash2(y,x))); });
    im.castShadow=false; scene.add(im); reflect(im); return im; };
  const crown=new THREE.IcosahedronGeometry(1,1); { const p=crown.attributes.position; for(let i=0;i<p.count;i++){ const x=p.getX(i),y=p.getY(i),z=p.getZ(i), k=1+.18*Math.sin(x*5+z*3)*Math.cos(y*4); p.setXYZ(i,x*k,y*k*.82,z*k); } crown.computeVertexNormals(); }
  const cone=new THREE.ConeGeometry(.75,2.8,7); cone.translate(0,.4,0);
  place(crown,broad,[1.1,1.4],.55,[0x2f4d22,0x4a6a2c]); place(cone,fir,[1.3,1.1],.6,[0x24391c,0x33502a]);
  const cloudGroups=[];
  const cloudMaterial=new THREE.MeshBasicMaterial({color:0xd7e7ec,transparent:true,opacity:.20,depthWrite:false,side:THREE.DoubleSide});
  for(let i=0;i<14;i++){
    const cloud=new THREE.Group();
    const x=118+(i%5)*27, z=-22+Math.floor(i/5)*58;
    cloud.position.set(x,22+(i%3)*8,z);
    for(let j=0;j<5;j++){
      const puff=new THREE.Mesh(new THREE.SphereGeometry(1,10,8),cloudMaterial);
      puff.position.set(j*2.1,Math.sin(j*1.7+i)*.55,Math.cos(j*2+i)*.8);
      puff.scale.set(3.6+(j%2),1.4+((j+i)%3)*.35,2.1);
      cloud.add(puff);
    }
    scene.add(cloud); reflect(cloud); cloudGroups.push({cloud,baseX:x,baseZ:z,phase:i*.77});
  }
  ZL_ANIM.push(dt=>{
    const t=performance.now()/1000, cover=.35+WX.cloud*.65;
    for(const item of cloudGroups){
      item.cloud.position.x=item.baseX+Math.sin(t*.018+item.phase)*4;
      item.cloud.position.z=item.baseZ+Math.cos(t*.012+item.phase)*3;
      item.cloud.position.y=23+Math.sin(t*.08+item.phase)*.8;
      item.cloud.visible=cover>.45;
      cloudMaterial.opacity=.08+cover*.23;
    }
  });
}
// ---- a pavilion on the highest summit, a small temple at the foot of the steepest slope above the water
{ const red=new THREE.MeshLambertMaterial({color:0x8a3424}), tile=new THREE.MeshLambertMaterial({color:0x4a3a32}), stone=new THREE.MeshLambertMaterial({color:0xb9b2a4});
  const P=PEAKS[0]||{x:170,z:120,H:60}, top=Math.min(...[[0,0],[-2.2,-2.2],[2.2,-2.2],[-2.2,2.2],[2.2,2.2]].map(([a,b])=>HILLS.h(P.x+a,P.z+b)));
  const g=new THREE.Group(); g.position.set(P.x,top,P.z); scene.add(g);
  for(const [x,z] of [[-1.6,-1.6],[1.6,-1.6],[-1.6,1.6],[1.6,1.6]]){ const c=new THREE.Mesh(new THREE.CylinderGeometry(.14,.14,2.6,8),red); c.position.set(x,1.3+.4,z); g.add(c); }
  const r1=new THREE.Mesh(new THREE.ConeGeometry(3.2,1.2,4),tile); r1.rotation.y=Math.PI/4; r1.position.y=3.4; g.add(r1); const r2=new THREE.Mesh(new THREE.ConeGeometry(2.0,1.1,4),tile); r2.rotation.y=Math.PI/4; r2.position.y=4.3; g.add(r2);
  const base=new THREE.Mesh(new THREE.BoxGeometry(4.4,2.4,4.4),stone); base.position.y=-.8; g.add(base);
  const TA=TEMPLE_AT||{x:120,z:60,nx:1,nz:0};
  const T=new THREE.Group(); T.position.set(TA.x,0,TA.z); T.rotation.y=Math.atan2(-TA.nx,-TA.nz); scene.add(T);
  const wall=new THREE.Mesh(new THREE.BoxGeometry(8,4,5),new THREE.MeshLambertMaterial({color:0xb04a32})); wall.position.set(0,2.4,-1); T.add(wall);
  const roof=new THREE.Mesh(new THREE.CylinderGeometry(.01,5.6,2.2,4,1),tile); roof.rotation.y=Math.PI/4; roof.scale.set(1.35,1,.9); roof.position.set(0,5.4,-1); T.add(roof);
  const door=new THREE.Mesh(new THREE.PlaneGeometry(1.6,2.4),new THREE.MeshLambertMaterial({color:0x2a160e})); door.position.set(0,1.6,1.52); T.add(door);
  const plinth=new THREE.Mesh(new THREE.BoxGeometry(10,.5,8),stone); plinth.position.set(0,.1,0); T.add(plinth);
  for(let i=0;i<3;i++){ const s=new THREE.Mesh(new THREE.BoxGeometry(4,.18,.6),stone); s.position.set(0,.25-i*.12,4.3+i*.6); T.add(s); }
  for(const x of [-1.5,1.5]){ const l=new THREE.Mesh(new THREE.SphereGeometry(.25,10,8),new THREE.MeshLambertMaterial({color:0xc8302a,emissive:0x601010})); l.scale.y=1.2; l.position.set(x,3.1,1.7); T.add(l); } reflect(g); reflect(T); }
// ---- 阿財's round outside: the jetty for water, the road, the dike up to the banyan; a chopping stump with split wood
//      under the tree, and his pole and buckets set down beside it while he works
{ const C=CAI, st=new THREE.MeshLambertMaterial({color:0x6e5a42}), cut=new THREE.MeshLambertMaterial({color:0xc9a878}), wd=new THREE.MeshLambertMaterial({color:0x7b5b3e});
  const sp=new THREE.Mesh(new THREE.CylinderGeometry(.3,.34,.42,12),st); sp.position.set(C.stump.x,.21,C.stump.z); scene.add(sp);
  const top=new THREE.Mesh(new THREE.CircleGeometry(.29,14),cut); top.rotation.x=-Math.PI/2; top.position.set(C.stump.x,.425,C.stump.z); scene.add(top);
  for(let i=0;i<9;i++){ const l=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,.5,6),i%3?st:cut); l.rotation.z=Math.PI/2; l.rotation.y=.6; l.position.set(C.stump.x+.75+(i%3)*.02,.07+Math.floor(i/3)*.11,C.stump.z-.45+(i%3)*.13); scene.add(l); }
  const g=new THREE.Group(); g.position.set(C.tree.x-.6,0,C.tree.z-.2); g.visible=false; scene.add(g); C.set=g;
  for(const dz of [-.55,.55]){ const b=new THREE.Mesh(new THREE.CylinderGeometry(.14,.12,.3,12),wd); b.position.set(0,.15,dz); g.add(b); const w=new THREE.Mesh(new THREE.CircleGeometry(.125,12),new THREE.MeshLambertMaterial({color:0x5f8f86})); w.rotation.x=-Math.PI/2; w.position.set(0,.28,dz); g.add(w); }
  const pl=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,1.7,6),wd); pl.rotation.x=Math.PI/2; pl.position.set(.25,.03,0); g.add(pl); }
// ---- lotus ponds, bamboo clumps, a banyan by the jetty, a scarecrow, a water wheel
{ const pad=new THREE.MeshLambertMaterial({color:0x4e7a38,side:THREE.DoubleSide}), pk=new THREE.MeshLambertMaterial({color:0xeaa0b2}), pw=new THREE.MeshBasicMaterial({color:0xffffff});
  pw.onBeforeCompile=sh=>{ Object.assign(sh.uniforms,landLight,WATER_U,{uTime:U.uTime,uWind:U.uWind,uAmp:U.uAmp}); sh.vertexShader='varying vec3 vPW; varying vec2 vPUV;\n'+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\n vPW=(modelMatrix*vec4(transformed,1.)).xyz; vPUV=uv;');
    sh.fragmentShader='varying vec3 vPW; varying vec2 vPUV;\nuniform float uTime, uAmp; uniform vec2 uWind;\n'+CLIFF_SHADE+WATER_GLSL+sh.fragmentShader.replace('#include <opaque_fragment>',`
      vec2 s=ripples(vPW.xz*1.3,uWind*.3,uTime)*(.03+.05*uAmp); vec3 n=normalize(vec3(-s.x,1.,-s.y));
      float r=length(vPUV-.5)*2., depth=.06+1.3*(1.-r*r);
      vec2 bp=vPW.xz+n.xz*depth;
      vec3 bed=mix(vec3(.26,.24,.15),vec3(.17,.20,.11),smoothstep(-.3,.6,wN(bp*.12).x));
      outgoingLight=shadeWater(vPW,n,depth,bed,vec3(.62,.30,.36),vec3(.05,.11,.065),cliffShade(vPW),.03);
      #include <opaque_fragment>`); };
  const mo=(new Date(Date.now()+8*3600e3)).getUTCMonth()+1, bloom=mo>=5&&mo<=9;
  const padGeo=new THREE.CircleGeometry(.53,18,.18,5.92), petalGeo=new THREE.SphereGeometry(1,9,7), centerGeo=new THREE.SphereGeometry(1,9,7);
  const petalMat=new THREE.MeshLambertMaterial({color:0xffffff}), centerMat=new THREE.MeshLambertMaterial({color:0xf0c84b});
  const petals=new THREE.InstancedMesh(petalGeo,petalMat,360), centers=new THREE.InstancedMesh(centerGeo,centerMat,60); petals.count=0; centers.count=0;
  const flowerM=new THREE.Matrix4(), flowerQ=new THREE.Quaternion(), flowerS=new THREE.Vector3(), flowerP=new THREE.Vector3();
  const shoreline=new THREE.MeshLambertMaterial({color:0x796b48,side:THREE.DoubleSide});
  // the ponds, natural: a wandering shoreline with grass and reeds; lotus leaves over most of the water, some held up on
  // their stalks; in summer (May–September) pink and white flowers and buds standing above the leaves, seed heads late in
  // the season; the rest of the year 殘荷 — leaves gone olive and brown, some broken over, dry seed heads on bent stalks
  const late=mo===9, dead=!bloom, SEG=72;
  const fan=(P,r0,r1,y)=>{ const pos=[], uv=[], idx=[]; for(let i=0;i<=SEG;i++){ const a=i/SEG*Math.PI*2, e=P.edge(a), c=Math.cos(a), sn=Math.sin(a);
      if(r0==null){ pos.push(P.x+c*e,y,P.z+sn*e); uv.push(.5+.5*c,.5+.5*sn); } else { pos.push(P.x+c*(e+r0),y,P.z+sn*(e+r0),P.x+c*(e+r1),y-.012,P.z+sn*(e+r1)); uv.push(0,0,1,1); } }
    if(r0==null){ pos.push(P.x,y,P.z); uv.push(.5,.5); const C=SEG+1; for(let i=0;i<SEG;i++) idx.push(C,i+1,i); }
    else for(let i=0;i<SEG;i++){ const a0=i*2; idx.push(a0,a0+2,a0+1,a0+1,a0+2,a0+3); }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); g.setIndex(idx); g.computeVertexNormals(); return g; };
  const inside=(P,x,z,m=0)=>{ const dx=x-P.x, dz=z-P.z; return Math.hypot(dx,dz)<P.edge(Math.atan2(dz,dx))-m; };
  const stalkGeo=new THREE.CylinderGeometry(.012,.016,1,5); stalkGeo.translate(0,.5,0);
  const podGeo=new THREE.CylinderGeometry(.07,.035,.07,10); const reedGeo=new THREE.ConeGeometry(.05,1,4); reedGeo.translate(0,.5,0);
  const stalkM=new THREE.MeshLambertMaterial({color:dead?0x6b5a3a:0x5d7a3a}), podM=new THREE.MeshLambertMaterial({color:dead?0x4a3a28:0x8aa04a});
  let NP2=0; const PADS=[], UPS=[], FL=[], PODS=[], REEDS=[];
  for(const P of LAND.PONDS){
    const bank=new THREE.Mesh(fan(P,-.05,1.1,-.16),shoreline); scene.add(bank);
    const w=new THREE.Mesh(fan(P,null,null,-.145),pw); scene.add(w);
    const area=Math.PI*P.r*P.r, nPad=Math.round(area*(dead?1.3:2.3));
    for(let i=0;i<nPad*3&&PADS.length<NP2+nPad;i++){ const x=P.x+(RAND()*2-1)*P.r*1.4, z=P.z+(RAND()*2-1)*P.r*1.4; if(!inside(P,x,z,.45)) continue;
      if(vnoise(x*.35+P.x,z*.35)>.72) continue;   // a few open patches of water
      const up=RAND()<(dead?.22:.18), sc=(up?.75:.6)+RAND()*.6; (up?UPS:PADS).push([x,z,sc,RAND()*6.28,up?.25+RAND()*.55:0]); }
    NP2=PADS.length;
    const nFl=bloom?Math.round(area*.32):0; for(let i=0;i<nFl*4&&FL.length<nFl*(LAND.PONDS.indexOf(P)+1);i++){ const x=P.x+(RAND()*2-1)*P.r*1.3, z=P.z+(RAND()*2-1)*P.r*1.3; if(!inside(P,x,z,.6)) continue; FL.push([x,z,.45+RAND()*.5,RAND()<.42?1:0,RAND()<.3?1:0]); }
    const nPod=dead?Math.round(area*.12):late?Math.round(area*.06):0; for(let i=0;i<nPod*4&&PODS.length<nPod*(LAND.PONDS.indexOf(P)+1);i++){ const x=P.x+(RAND()*2-1)*P.r*1.3, z=P.z+(RAND()*2-1)*P.r*1.3; if(!inside(P,x,z,.6)) continue; PODS.push([x,z,.4+RAND()*.5,dead?.5+RAND()*.7:RAND()*.2]); }
    for(let i=0;i<70;i++){ const a=RAND()*6.28, e=P.edge(a)+(RAND()*1.3-.2); if(RAND()<.35) continue; REEDS.push([P.x+Math.cos(a)*e,P.z+Math.sin(a)*e,.6+RAND()*1.1]); } }
  const q=new THREE.Quaternion(), sv=new THREE.Vector3(), v=new THREE.Vector3(), m=new THREE.Matrix4(), color=new THREE.Color(), E3=new THREE.Euler();
  const padCol=()=>dead?color.setHSL(.09+RAND()*.08,.32+RAND()*.2,.2+RAND()*.12):color.setHSL(.25+RAND()*.035,.38+RAND()*.18,.27+RAND()*.14);
  // floating leaves
  const leaves=new THREE.InstancedMesh(padGeo,pad,Math.max(1,PADS.length)); PADS.forEach(([x,z,sc,rot],i)=>{ q.setFromEuler(E3.set(-Math.PI/2,rot,0)); sv.set(sc,sc*(.85+RAND()*.2),1); v.set(x,-.112+RAND()*.006,z); m.compose(v,q,sv); leaves.setMatrixAt(i,m); leaves.setColorAt(i,padCol()); });
  // leaves held up on stalks (cupped a little; broken over and brown out of season)
  const upGeo=new THREE.SphereGeometry(.5,14,5,0,Math.PI*2,0,Math.PI*.3); upGeo.translate(0,-.5,0);   // a shallow cap; turned over it is a bowl with its bottom at the origin
  const ups=new THREE.InstancedMesh(upGeo,pad,Math.max(1,UPS.length)), upSt=new THREE.InstancedMesh(stalkGeo,stalkM,Math.max(1,UPS.length));
  UPS.forEach(([x,z,sc,rot,h],i)=>{ const tilt=dead?.9+RAND()*.9:RAND()*.35; q.setFromEuler(E3.set(Math.PI+tilt*Math.cos(rot),rot,tilt*Math.sin(rot))); sv.set(sc,sc*.6,sc); v.set(x,-.11+h,z); m.compose(v,q,sv); ups.setMatrixAt(i,m); ups.setColorAt(i,padCol());
    q.identity(); sv.set(1,h+.03,1); v.set(x,-.13,z); m.compose(v,q,sv); upSt.setMatrixAt(i,m); });
  // flowers: an open cup of petals round a yellow seed head (or a closed bud), pink or white, on a stalk above the leaves
  const nPet=FL.reduce((n,f)=>n+(f[4]?1:12),0), pets=new THREE.InstancedMesh(petalGeo,petalMat,Math.max(1,nPet)), heads=new THREE.InstancedMesh(centerGeo,centerMat,Math.max(1,FL.length)), flSt=new THREE.InstancedMesh(stalkGeo,stalkM,Math.max(1,FL.length));
  const pinkC=new THREE.Color(0xf08aa6), pinkL=new THREE.Color(0xfbd3de), whiteC=new THREE.Color(0xfbf6f0), whiteL=new THREE.Color(0xf6e9ea); let pi=0;
  FL.forEach(([x,z,h,white,bud],i)=>{ const y=-.11+h; q.identity(); sv.set(1,h,1); v.set(x,-.13,z); m.compose(v,q,sv); flSt.setMatrixAt(i,m);
    if(bud){ q.identity(); sv.set(.07,.13,.07); v.set(x,y+.1,z); m.compose(v,q,sv); pets.setMatrixAt(pi,m); pets.setColorAt(pi++,white?whiteC:pinkC); sv.set(.0001,.0001,.0001); m.compose(v,q,sv); heads.setMatrixAt(i,m); return; }
    for(let r=0;r<2;r++){ const n=r?5:7, open=r?.45:.95, rad=r?.05:.09; for(let k=0;k<n;k++){ const a=k/n*Math.PI*2+r*.4;   // each petal leans out toward its own side, the outer ring more
      sv.set(.055,.15,.035); v.set(x+Math.cos(a)*rad,y+.11,z+Math.sin(a)*rad); m.compose(v,q.setFromEuler(E3.set(open*Math.sin(a),0,-open*Math.cos(a))),sv); pets.setMatrixAt(pi,m); pets.setColorAt(pi++,(white?(r?whiteC:whiteL):(r?pinkC:pinkL)).clone().lerp(white?whiteC:pinkC,RAND()*.4)); } }
    q.identity(); sv.set(.045,.035,.045); v.set(x,y+.1,z); m.compose(v,q,sv); heads.setMatrixAt(i,m); });
  pets.count=pi;
  // seed heads: green late in summer, dry and dark on bent stalks the rest of the year
  const pods=new THREE.InstancedMesh(podGeo,podM,Math.max(1,PODS.length)), podSt=new THREE.InstancedMesh(stalkGeo,stalkM,Math.max(1,PODS.length));
  PODS.forEach(([x,z,h,bend],i)=>{ const a=RAND()*6.28; q.setFromEuler(E3.set(bend*Math.cos(a),0,bend*Math.sin(a))); sv.set(1,h,1); v.set(x,-.13,z); m.compose(v,q,sv); podSt.setMatrixAt(i,m);
    const top=new THREE.Vector3(0,h,0).applyQuaternion(q).add(v); q.setFromEuler(E3.set(bend*1.6*Math.cos(a),0,bend*1.6*Math.sin(a))); sv.set(1,1,1); m.compose(top,q,sv); pods.setMatrixAt(i,m); });
  // grass and reeds round the shore
  const rd=new THREE.InstancedMesh(reedGeo,new THREE.MeshLambertMaterial({color:0xffffff}),Math.max(1,REEDS.length)); REEDS.forEach(([x,z,h],i)=>{ m.makeScale(1,h,1); m.setPosition(x,-.15,z); rd.setMatrixAt(i,m); rd.setColorAt(i,color.setHex(dead?0x8a7a4e:0x6f8546).lerp(new THREE.Color(0xa49a5e),RAND()*.5)); });
  for(const im of [leaves,ups,upSt,pets,heads,flSt,pods,podSt,rd]){ im.instanceMatrix.needsUpdate=true; if(im.instanceColor) im.instanceColor.needsUpdate=true; scene.add(im); }
  if(!FL.length){ pets.visible=heads.visible=flSt.visible=false; } if(!PODS.length){ pods.visible=podSt.visible=false; } if(!UPS.length){ ups.visible=upSt.visible=false; }
  const bam=new THREE.MeshLambertMaterial({color:0x5f7d3a}), leaf=new THREE.MeshLambertMaterial({color:0x3f5f2a}); const cl=(x,z)=>{ for(let i=0;i<14;i++){ const h=5+RAND()*4, s=new THREE.Mesh(new THREE.CylinderGeometry(.05,.07,h,5),bam); s.position.set(x+RAND()*3-1.5,h/2-.1,z+RAND()*3-1.5); s.rotation.z=(RAND()-.5)*.25; s.rotation.x=(RAND()-.5)*.25; scene.add(s); const f=new THREE.Mesh(new THREE.SphereGeometry(1.2+RAND(),7,5),leaf); f.position.set(s.position.x,h-.4,s.position.z); f.scale.y=.7; scene.add(f); } };
  // (the five bamboo clumps round the house were cleared; cl() is kept for any planted later)
  const bark=new THREE.MeshLambertMaterial({color:0x5a4a3a}), crown=new THREE.MeshLambertMaterial({color:0x3e5a2c}); // the 茄苳 (one by the jetty in place of the banyan, one beside each bamboo clump round the house): a tall straight trunk of
// reddish-brown bark that flakes in patches, a few big limbs from about five metres, a high, open, irregular crown of light
// green; some twelve metres in all
function qiedongTree(x,z,S=1){ const flk=textCanvas(128,256,(g,w,h)=>{ g.fillStyle='#6e4330'; g.fillRect(0,0,w,h); for(let i=0;i<160;i++){ const c=90+Math.random()*70|0; g.fillStyle=`rgba(${c+40},${c},${c-30},${.25+Math.random()*.35})`; g.beginPath(); g.ellipse(Math.random()*w,Math.random()*h,4+Math.random()*10,6+Math.random()*16,Math.random()*.6,0,6.3); g.fill(); }
      for(let i=0;i<40;i++){ g.strokeStyle='rgba(40,22,14,.35)'; g.lineWidth=1+Math.random()*2; g.beginPath(); const xx=Math.random()*w; g.moveTo(xx,0); g.lineTo(xx+(Math.random()-.5)*10,h); g.stroke(); } });
  flk.wrapS=flk.wrapT=THREE.RepeatWrapping; flk.repeat.set(2,3);
  const bk=new THREE.MeshLambertMaterial({map:flk,color:0xc89a80}), lf=[0x5f8c3c,0x6e9a46,0x557f36,0x7aa452].map(c=>new THREE.MeshLambertMaterial({color:c})), tree=new THREE.Group(); tree.position.set(x,-.18,z); scene.add(tree);
  const tr=new THREE.Mesh(new THREE.CylinderGeometry(.36,.62,6.2,12),bk); tr.position.y=3.1; tr.rotation.z=.04; tree.add(tr);
  for(let i=0;i<5;i++){ const r=new THREE.Mesh(new THREE.CylinderGeometry(.12,.3,1.4,6),bk); const a=i/5*6.28+.4; r.position.set(Math.cos(a)*.5,.3,Math.sin(a)*.5); r.rotation.set(Math.sin(a)*.9,0,-Math.cos(a)*.9); tree.add(r); }   // root flare
  const ends=[]; [[0,5.2,.5,3.4],[1.3,5.6,.6,3.0],[2.5,5.0,.55,3.2],[3.8,5.8,.5,2.8],[5.1,5.4,.62,3.3],[.7,6.1,.3,3.6]].forEach(([a,y,tilt,len])=>{
    const L=new THREE.Group(); L.position.set(0,y,0); L.rotation.set(Math.sin(a)*tilt,0,-Math.cos(a)*tilt); tree.add(L);
    const c=new THREE.Mesh(new THREE.CylinderGeometry(.09,.2,len,7),bk); c.position.y=len/2; L.add(c); L.updateMatrixWorld(true); ends.push(new THREE.Vector3(0,len,0).applyMatrix4(L.matrix)); });
  const crown=new THREE.IcosahedronGeometry(1,1); let ci=0;
  for(const e of ends) for(let i=0;i<4;i++){ const c=new THREE.Mesh(crown,lf[(ci++)%lf.length]); c.position.set(e.x+(RAND()-.5)*2.6,e.y+(RAND()-.2)*1.6,e.z+(RAND()-.5)*2.6); c.scale.set(1.5+RAND()*1.1,1+RAND()*.6,1.5+RAND()*1.1); c.rotation.set(RAND(),RAND(),RAND()); tree.add(c); }
  for(let i=0;i<4;i++){ const c=new THREE.Mesh(crown,lf[i%lf.length]); c.position.set((RAND()-.5)*2,10.4+RAND()*1.2,(RAND()-.5)*2); c.scale.set(1.6,1.1,1.6); tree.add(c); }
  tree.scale.setScalar(S); tree.rotation.y=x*.37+z*.11; tree.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.userData={type:'qiedong'}; pickables.push(o); } }); }
qiedongTree(84,18,1); for(const [x,z,S] of TREES.qd) qiedongTree(x,z,S);
// ---- mango trees: round the 曬穀場 and along the boardwalk to the jetty. A straight trunk forking into a few limbs, a dense
//      round crown of long dark leaves in clusters; by Taipei's month: pale flower sprays in February–March, small green
//      fruit in April–May, the crown hung with ripe yellow mangoes in June–July (pick one: it is in your hand; take it to
//      火師 for mango ice), leaves only the rest of the year
const MANGO={fruit:[], picked:new Set((()=>{ try{ const o=JSON.parse(localStorage.getItem('hkMango')||'{}'); return o.d===new Date(Date.now()+8*3600e3).toISOString().slice(0,10)?o.p:[]; }catch{ return []; } })())};
{ const mo=new Date(Date.now()+8*3600e3).getUTCMonth()+1, flower=mo===2||mo===3, green=mo===4||mo===5, ripe=mo===6||mo===7;
  const bark=new THREE.MeshLambertMaterial({color:0x5b4a3c}), leafM=[0x2c5222,0x34602a,0x264a1e].map(c=>new THREE.MeshLambertMaterial({color:c,flatShading:true})),
    flM=new THREE.MeshLambertMaterial({color:0xe6d9a0}), fruitM=new THREE.MeshLambertMaterial({color:ripe?0xf2b33a:0x8fb04a}), blushM=new THREE.MeshLambertMaterial({color:0xd8582a});
  const crownG=new THREE.IcosahedronGeometry(1,1); { const P=crownG.attributes.position; for(let i=0;i<P.count;i++){ const x=P.getX(i),y=P.getY(i),z=P.getZ(i), k=1+.12*Math.sin(x*7+z*5)*Math.cos(y*6); P.setXYZ(i,x*k,y*k,z*k); } crownG.computeVertexNormals(); }
  const fruitG=new THREE.SphereGeometry(1,10,8); fruitG.scale(.8,1.25,.8);
  TREES.mango.forEach(([x,z],ti)=>{ const g=new THREE.Group(); g.position.set(x,LAND.GY,z); g.rotation.y=ti*1.7; scene.add(g); const S=.9+((ti*37)%10)/40; g.scale.setScalar(S);
    const tr=new THREE.Mesh(new THREE.CylinderGeometry(.18,.26,2.4,9),bark); tr.position.y=1.2; g.add(tr);
    for(let k=0;k<4;k++){ const a=k/4*6.28+.3, L=new THREE.Mesh(new THREE.CylinderGeometry(.07,.13,2.0,7),bark); L.position.set(Math.cos(a)*.35,3.0,Math.sin(a)*.35); L.rotation.set(Math.sin(a)*.5,0,-Math.cos(a)*.5); g.add(L); }
    const tip=[]; for(let i=0;i<12;i++){ const a=i/12*6.28+(i%3)*.3, r=1.3+(i%4)*.35, y=3.6+((i*7)%5)*.45; const c=new THREE.Mesh(crownG,leafM[i%3]); c.position.set(Math.cos(a)*r,y,Math.sin(a)*r); c.scale.setScalar(1.25+((i*13)%7)/10); g.add(c); tip.push(c.position.clone()); }
    for(let i=0;i<3;i++){ const c=new THREE.Mesh(crownG,leafM[i%3]); c.position.set((i-1)*.6,5.6+i%2*.4,(i%2-.5)*.6); c.scale.setScalar(1.6); g.add(c); }
    const n=ripe?26:green?18:flower?16:0;
    for(let i=0;i<n;i++){ const a=i*2.39996, y=3.3+((i*5)%9)*.28, r=2.35-Math.abs(y-4.5)*.25;
      if(flower){ const f=new THREE.Mesh(new THREE.ConeGeometry(.12,.38,6),flM); f.position.set(Math.cos(a)*r,y+.25,Math.sin(a)*r); f.rotation.x=Math.PI; g.add(f); continue; }
      const st=new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,.3,4),bark); st.position.set(Math.cos(a)*r,y,Math.sin(a)*r); g.add(st);
      const f=new THREE.Mesh(fruitG,fruitM); f.scale.setScalar(ripe?.075:.05); f.position.set(Math.cos(a)*r,y-.2,Math.sin(a)*r); g.add(f);
      if(ripe&&i%2){ const b=new THREE.Mesh(fruitG,blushM); b.scale.setScalar(.045); b.position.copy(f.position).add(new THREE.Vector3(Math.cos(a)*.04,.03,Math.sin(a)*.04)); g.add(b); f.userData.blush=b; }
      const id=ti*100+i; if(ripe){ f.userData={type:'mango',id,blush:f.userData.blush}; pickables.push(f); MANGO.fruit.push(f); if(MANGO.picked.has(id)){ f.visible=false; st.visible=false; if(f.userData.blush) f.userData.blush.visible=false; } } }
    g.traverse(o=>{ if(o.isMesh&&!o.userData.type){ o.userData={type:'mangotree'}; pickables.push(o); } }); }); }
window.__mangoAct=u=>{ const f=MANGO.fruit.find(q=>q.userData.id===u.id); if(!f||!f.visible) return true;
  f.getWorldPosition(_mgp); if(Math.hypot(_mgp.x-ME.x,_mgp.z-ME.z)>4.5){ toast(NT('mango.far'),2200); return true; }
  f.visible=false; if(f.userData.blush) f.userData.blush.visible=false; MANGO.picked.add(u.id); try{ localStorage.setItem('hkMango',JSON.stringify({d:new Date(Date.now()+8*3600e3).toISOString().slice(0,10),p:[...MANGO.picked]})); }catch{}
  const i=SNACKS.findIndex(x=>x[2]==='mango'); if(window.__cineBt>=0&&window.__cineDrink) window.__cineDrink.put(); setSnack(i); FOOD.biteK=''; toast(NT('mango.pick'),3000); return true; };
const _mgp=new THREE.Vector3();
  { const g=new THREE.Group(); g.position.set(40,LAND.GY,46.5); scene.add(g); const st=new THREE.MeshLambertMaterial({color:0xc9b070}); const p=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,1.9,5),bark); p.position.y=.95; g.add(p); const a=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,1.3,5),bark); a.rotation.z=Math.PI/2; a.position.y=1.45; g.add(a); const b=new THREE.Mesh(new THREE.CylinderGeometry(.22,.3,.7,8),st); b.position.y=1.2; g.add(b); const h=new THREE.Mesh(new THREE.ConeGeometry(.36,.22,12),st); h.position.y=1.8; g.add(h); }
  { const g=new THREE.Group(); g.position.set(92,.6,-30); g.rotation.y=Math.PI/2; scene.add(g); LAND.wheel=g; const w=new THREE.MeshLambertMaterial({color:0x7a6040}); for(let i=0;i<12;i++){ const s=new THREE.Mesh(new THREE.BoxGeometry(.06,2.6,.3),w); s.rotation.z=i/12*Math.PI; g.add(s); } const r=new THREE.Mesh(new THREE.TorusGeometry(1.3,.05,5,24),w); g.add(r); ZL_DYN.push(g); } }
// ---- rice close by: thousands of clumps round you, swaying in waves with the wind (one instanced draw)
{ const blades=[], pan=[], ys=[]; const addQuad=(x0,y0,z0,x1,y1,z1,w,isPan)=>{ const dx=x1-x0, dz=z1-z0, L=Math.hypot(dx,dz)||1, px=-dz/L*w/2, pz=dx/L*w/2; const v=[x0-px,y0,z0-pz, x0+px,y0,z0+pz, x1+px,y1,z1+pz, x0-px,y0,z0-pz, x1+px,y1,z1+pz, x1-px,y1,z1-pz]; blades.push(...v); for(let k=0;k<6;k++){ pan.push(isPan?1:0); } };
  for(let i=0;i<11;i++){ const a=i/11*6.28+((i*7)%3)*.2, r=.05, lean=.16+((i*13)%5)*.03, tx=Math.cos(a)*lean, tz=Math.sin(a)*lean, h=.92+((i*37)%7)*.025; addQuad(Math.cos(a)*r,0,Math.sin(a)*r,tx*.55,h*.6,tz*.55,.022,false); addQuad(tx*.55,h*.6,tz*.55,tx,h,tz,.016,false); }
  for(let i=0;i<7;i++){ const a=i/7*6.28+.3, x=Math.cos(a)*.08, z=Math.sin(a)*.08, x2=Math.cos(a)*.2, z2=Math.sin(a)*.2; addQuad(x*.3,.0,z*.3,x,.98,z,.012,false); addQuad(x,.98,z,x2,.9,z2,.05,true); addQuad(x2,.9,z2,x2*1.25,.76,z2*1.25,.042,true); }
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(blades,3)); g.setAttribute('pan',new THREE.Float32BufferAttribute(pan,1)); g.computeVertexNormals();
  const m=new THREE.MeshLambertMaterial({side:THREE.DoubleSide,color:0xffffff});
  m.onBeforeCompile=sh=>{ Object.assign(sh.uniforms,U); sh.vertexShader='attribute float pan; varying float vPan; varying float vH; varying float vW;\n'+RICE_GLSL+'\n'+sh.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
      vec4 ip=instanceMatrix*vec4(0.,0.,0.,1.); float w=waveAt(ip.xz); float h=clamp(position.y,0.,1.); vec2 d=normalize(uWind+vec2(1e-4));
      float b=(uAmp*(.55+.45*w)+.06*sin(uTime*3.+ip.x*2.1))*h*h; transformed.x+=d.x*b; transformed.z+=d.y*b; transformed.y-=b*.35*h; vPan=pan; vH=h; vW=w;`);
    sh.fragmentShader='varying float vPan; varying float vH; varying float vW;\n'+RICE_GLSL+'\n'+sh.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      diffuseColor.rgb=riceCol(vPan)*(.55+.55*vH)*(.82+.24*vW);`); };
  const R=24, SP=.55, CAP=Math.ceil((2*R/SP)**2*.8); const im=new THREE.InstancedMesh(g,m,CAP); im.frustumCulled=false; im.count=0; scene.add(im); ZL_DYN.push(im); LAND.rice={im,R,SP,cx:1e9,cz:1e9}; }
// ---- people of the fields: two farmers weeding, one walking the dikes with a hoe; the buffalo and the herd boy
const FOLK=[]; { const mk=(look,kind,base)=>{ const g=npcFigure(look); scene.add(g); ZL_DYN.push(g); const f={g,P:g.userData.parts,kind,base,ph:RAND()*100}; FOLK.push(f); return f; };
  mk({top:0x4f5a52,low:0x2f2e2a,dark:1,hat:'douli',thin:1},'weed',{x:-30,z:-18}); mk({fem:1,top:0x6a6455,low:0x2f2e2a,hat:'douli',bun:'low'},'weed',{x:-60,z:22}); mk({top:0x5a5043,low:0x3a3530,dark:1,hat:'douli'},'walk',{x:-40,z:-35});
  mk({top:0x7a6a50,low:0x3a332c,dark:1,h:.75,w:.86,kid:1},'herd',{x:70,z:-30}); }
// ---- water buffalo: a small herd of four and a calf on the grass between the levee and the river. Slate-black hide, grey
//      'socks' below the knees, a pale chevron at the throat, broad ridged horns sweeping back, ears held out flat, a rope
//      through the nose. By a shared clock (everyone sees the same): grazing along the bank in the morning and afternoon,
//      down into the river to wallow through the heat of the day (only heads, horns and backs showing), lying on the bank
//      at night. The herd boy walks with the lead buffalo morning and evening.
const HERD=[]; const BUF={x:90,z:-28,yaw:0};
{ const hide=new THREE.MeshLambertMaterial({color:0x2d2c2f}), hideD=new THREE.MeshLambertMaterial({color:0x232225}), sock=new THREE.MeshLambertMaterial({color:0x85837e}),
    hoof=new THREE.MeshLambertMaterial({color:0x2a2622}), hornM=new THREE.MeshLambertMaterial({color:0x8f8a80}), pale=new THREE.MeshLambertMaterial({color:0xb9b2a4}),
    nose=new THREE.MeshLambertMaterial({color:0x1b1a1c}), rope=new THREE.MeshLambertMaterial({color:0xb08a4a}), eye=new THREE.MeshBasicMaterial({color:0x0c0b0b});
  const E=(r,m,x,y,z,sx,sy,sz,par)=>{ const o=new THREE.Mesh(new THREE.SphereGeometry(r,14,10),m); o.position.set(x,y,z); o.scale.set(sx,sy,sz); par.add(o); return o; };
  // a horn: a tapering, slightly flattened tube that leaves the head sideways, sweeps back and curls up and in
  const hornGeo=side=>{ const c=new THREE.CatmullRomCurve3([[0,0,0],[-.04,.05,.16],[-.18,.13,.36],[-.42,.24,.44],[-.66,.34,.36],[-.8,.44,.2]].map(([x,y,z])=>new THREE.Vector3(x,y,z*side)));
    const TS=24, RS=8, g=new THREE.TubeGeometry(c,TS,.065,RS,false), P=g.attributes.position, v=new THREE.Vector3();
    for(let i=0;i<=TS;i++){ const q=c.getPointAt(i/TS), f=1-.82*(i/TS); for(let j=0;j<=RS;j++){ const k=i*(RS+1)+j; v.fromBufferAttribute(P,k).sub(q); v.y*=.72; v.multiplyScalar(f); P.setXYZ(k,q.x+v.x,q.y+v.y,q.z+v.z); } }
    g.computeVertexNormals(); return g; };
  const HG=[hornGeo(1),hornGeo(-1)];
  const make=calf=>{ const g=new THREE.Group(), body=new THREE.Group(); g.add(body); scene.add(g); ZL_DYN.push(g);
    E(.62,hide,0,1.05,0,1.55,.8,.75,body); E(.5,hide,.55,1.12,0,1,1,.95,body); E(.48,hideD,-.1,.9,0,1.7,.75,.85,body);   // barrel, shoulders, belly
    E(.42,hide,-.62,1.05,0,1,1,.95,body);                                                                                   // hindquarters
    const neck=new THREE.Mesh(new THREE.CylinderGeometry(.27,.36,.6,12),hide); neck.position.set(.98,1.08,0); neck.rotation.z=-1.25; body.add(neck);
    const chev=new THREE.Mesh(new THREE.BoxGeometry(.05,.05,.34),pale); chev.position.set(1.05,.8,0); chev.rotation.z=.4; body.add(chev);
    const head=new THREE.Group(); head.position.set(1.28,1.02,0); body.add(head);
    const skull=new THREE.Mesh(new THREE.BoxGeometry(.44,.36,.34),hide); skull.position.set(.05,0,0); head.add(skull);
    const muz=new THREE.Mesh(new THREE.BoxGeometry(.3,.26,.28),hide); muz.position.set(.32,-.12,0); muz.rotation.z=-.35; head.add(muz);
    E(.13,nose,.47,-.2,0,.8,.75,1.05,head); for(const s2 of [-1,1]) E(.025,eye,.12,.06,s2*.17,1,1,1,head);
    for(const s2 of [-1,1]){ const ear=E(.12,hideD,-.05,.02,s2*.27,.55,.22,1.25,head); ear.rotation.y=s2*.25; }
    if(!calf) for(const k of [0,1]){ const h=new THREE.Mesh(HG[k],hornM); h.position.set(-.05,.16,(k?-1:1)*.1); head.add(h); }
    else for(const s2 of [-1,1]) E(.04,hornM,-.02,.2,s2*.12,1,1.3,1,head);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.05,.01,5,12),rope); ring.position.set(.5,-.24,0); head.add(ring);
    const lead=new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,.5,4),rope); lead.position.set(.3,-.42,.08); lead.rotation.z=.9; head.add(lead);
    const legs=[]; for(const [x,z] of [[.62,.26],[.62,-.26],[-.62,.26],[-.62,-.26]]){ const l=new THREE.Group(); l.position.set(x,.78,z); body.add(l);
      const up=new THREE.Mesh(new THREE.CylinderGeometry(.13,.1,.42,8),hide); up.position.y=-.2; l.add(up);
      const lo=new THREE.Mesh(new THREE.CylinderGeometry(.085,.075,.36,8),sock); lo.position.y=-.58; l.add(lo);
      const hf=new THREE.Mesh(new THREE.CylinderGeometry(.09,.1,.08,8),hoof); hf.position.y=-.74; l.add(hf); legs.push(l); }
    const tail=new THREE.Group(); tail.position.set(-1.02,1.22,0); body.add(tail); const tl=new THREE.Mesh(new THREE.CylinderGeometry(.025,.015,.85,5),hide); tl.position.y=-.42; tail.add(tl);
    const tuft=E(.06,hideD,0,-.88,0,.7,1.6,.7,tail);
    g.scale.setScalar(calf?.55:1);
    const pk=new THREE.Mesh(new THREE.BoxGeometry(2.6,1.6,1.1),new THREE.MeshBasicMaterial({visible:false})); pk.position.set(.2,1,0); pk.userData={type:'buffalo'}; g.add(pk); pickables.push(pk);
    return {g,body,head,legs,tail,calf}; };
  // where each one lives along the bank: near a point of the outer bank, the calf beside its mother (1)
  const uNear=(x,z)=>{ let best=0,bd=1e9; for(let i=0;i<600;i++){ const p=RIVER.getPointAt(i/600), d=(p.x-x)**2+(p.z-z)**2; if(d<bd){ bd=d; best=i/600; } } return best; };
  [[90,-28,0],[91,-40,0],[92,30,0],[92,42,0],[91,-40,1]].forEach(([x,z,calf],i)=>{ const B=make(!!calf); Object.assign(B,{u0:uNear(x,z),ph:i*2.1+.4,mom:calf?1:-1}); HERD.push(B); }); }
const herdP=new THREE.Vector3(), herdT=new THREE.Vector3();
const herdAt=(u,lat,o)=>{ RIVER.getPointAt(((u%1)+1)%1,herdP); RIVER.getTangentAt(((u%1)+1)%1,herdT); let nx=-herdT.z, nz=herdT.x;
  if(!LAND.MASK.at(LAND.MASK.levee,herdP.x+nx*LAND.LEVEE,herdP.z+nz*LAND.LEVEE)){ nx=-nx; nz=-nz; } o.x=herdP.x+nx*lat; o.z=herdP.z+nz*lat; o.tx=herdT.x; o.tz=herdT.z; return o; };
const herdPlace=(B,tt,m,o)=>{   // where a buffalo is at time tt (seconds) and Taipei minute m
  const RL=RIVER.getLength(), M=B.mom>=0?HERD[B.mom]:null;
  const ph=M?M.ph:B.ph, du=(Math.sin(tt*.0045+ph)*7+Math.sin(tt*.013+ph*2)*2.2)/RL, lat=12.4+Math.sin(tt*.009+ph)*1.5;   // the calf keeps to its mother
  const q=s=>Math.min(1,Math.max(0,s)), sm=s=>s*s*(3-2*s);
  const wIn=sm(q((m-660)/12)), wOut=sm(q((m-828)/12)), wal=wIn*(1-wOut);   // into the river at 11:00, out by 14:00
  const night=m<330||m>=1110;
  const u=B.u0+(night?0:du*(1-wal))+(B.mom>=0?.9/RL:0), L=night?12.2:lat+(RIVER_HALF_WIDTH-2.6-lat)*wal+(B.mom>=0?.8:0);
  herdAt(u,L,o); o.wal=wal; o.night=night; return o; };
const _h0={}, _h1={};
ZL_ANIM.push(dt=>{ if(!HERD.length) return; const now=Date.now(), tt=now/1000, m=taipeiNow().min;
  for(const B of HERD){ herdPlace(B,tt,m,_h0); herdPlace(B,tt+2,m+2/60,_h1);
    const vx=_h1.x-_h0.x, vz=_h1.z-_h0.z, sp=Math.hypot(vx,vz)/2, walking=sp>.05&&!_h0.night;
    const yawT=walking?Math.atan2(-vz,vx):Math.atan2(-_h0.tz,_h0.tx)+Math.sin(tt*.05+B.ph)*.5;
    let dy=yawT-(B.yaw??yawT); dy=Math.atan2(Math.sin(dy),Math.cos(dy)); B.yaw=(B.yaw??yawT)+dy*Math.min(1,(dt||.016)*1.5);
    const sink=_h0.wal*1.15, lie=_h0.night?1:0; B.head.position.y=1.02+.35*_h0.wal;   // in the water: low, head held up
    B.g.position.set(_h0.x,-.18-sink*B.g.scale.x-lie*.42*B.g.scale.x,_h0.z); B.g.rotation.y=B.yaw;
    const sw=walking?Math.sin(tt*2.6+B.ph)*.32:0; B.legs.forEach((l,i)=>{ l.rotation.z=lie?(i<2?1.35:-1.35):((i===0||i===3)?sw:-sw); });
    const feed=!walking&&!lie&&_h0.wal<.2; B.head.rotation.z=lie?-.15:_h0.wal>.5?.25:feed?-.75+Math.sin(tt*.8+B.ph)*.12:-.2;
    B.tail.rotation.x=Math.sin(tt*1.4+B.ph)*.35; B.tail.rotation.z=lie?.6:.15; }
  const L=HERD[0]; BUF.x=L.g.position.x; BUF.z=L.g.position.z; BUF.yaw=L.yaw||0; });
// ---- 黑面琵鷺: a winter flock (October to April) wading in the paddies south of the road, sweeping their bills from side
//      to side; two asleep with their bills tucked; in March and April the yellow crest and breast of the breeding season.
//      Come within twelve metres and they all take off, circle and come down again
const SPOON={birds:[],c:{x:66,z:-36},up:0};
{ const mo=(new Date(Date.now()+8*3600e3)).getUTCMonth()+1, winter=mo>=10||mo<=4, breed=mo===3||mo===4;
  if(winter){ const W=new THREE.MeshLambertMaterial({color:0xf7f6f1}), K=new THREE.MeshLambertMaterial({color:0x151515}), Y=new THREE.MeshLambertMaterial({color:0xe9c46a}), eyeY=new THREE.MeshBasicMaterial({color:0xd8a020});
    const E=(r,mm,x,y,z,sx,sy,sz,par)=>{ const o=new THREE.Mesh(new THREE.SphereGeometry(r,12,8),mm); o.position.set(x,y,z); o.scale.set(sx,sy,sz); par.add(o); return o; };
    let tries=0; const C=SPOON.c; while(!LAND.paddy(C.x,C.z)&&tries++<200){ C.x+=1.3; C.z-=.7; }
    for(let i=0;i<9;i++){ const g=new THREE.Group(), body=new THREE.Group(); g.add(body); scene.add(g); ZL_DYN.push(g);
      E(.17,W,0,.62,0,1.65,.95,.95,body); if(breed) E(.1,Y,.16,.62,0,1,1,1.1,body); E(.07,W,-.27,.6,0,1.4,.6,1,body);
      const neck=new THREE.Group(); neck.position.set(.2,.66,0); body.add(neck); const nk=new THREE.Mesh(new THREE.CylinderGeometry(.035,.05,.3,7),W); nk.position.set(.05,.13,0); nk.rotation.z=-.35; neck.add(nk);
      const head=new THREE.Group(); head.position.set(.11,.29,0); neck.add(head); E(.06,W,0,0,0,1.1,1,1,head); E(.045,K,.045,-.005,0,1,.9,1.1,head);   // the black face
      for(const s2 of [-1,1]) E(.01,eyeY,.06,.015,s2*.035,1,1,1,head);
      const bill=new THREE.Mesh(new THREE.BoxGeometry(.24,.018,.035),K); bill.position.set(.18,-.02,0); head.add(bill); E(.035,K,.31,-.025,0,1.2,.25,1,head);   // the spoon
      if(breed) for(let k=0;k<5;k++){ const c=new THREE.Mesh(new THREE.ConeGeometry(.012,.13,4),k%2?Y:W); c.position.set(-.07,.02,(k-2)*.012); c.rotation.z=1.9+k*.05; head.add(c); }
      const legs=[]; for(const s2 of [-1,1]){ const l=new THREE.Mesh(new THREE.CylinderGeometry(.01,.01,.52,4),K); l.position.set(0,.26,s2*.045); g.add(l); legs.push(l); }
      const wings=[]; for(const s2 of [-1,1]){ const w=new THREE.Mesh(new THREE.PlaneGeometry(.42,.6),new THREE.MeshLambertMaterial({color:0xf7f6f1,side:THREE.DoubleSide})); w.geometry.translate(0,0,0); w.position.set(-.02,.66,s2*.3); w.rotation.x=Math.PI/2; w.visible=false; body.add(w); wings.push(w); }
      const pk=new THREE.Mesh(new THREE.SphereGeometry(.45,6,4),new THREE.MeshBasicMaterial({visible:false})); pk.position.y=.6; pk.userData={type:'spoonbill'}; g.add(pk); pickables.push(pk);
      const a=i*2.4, r=1.2+Math.sqrt(i)*1.6; SPOON.birds.push({g,body,neck,head,legs,wings,ox:Math.cos(a)*r,oz:Math.sin(a)*r,ph:i*1.9,sleep:i===3||i===7}); } } }
ZL_ANIM.push(dt=>{ const S=SPOON; if(!S.birds.length) return; const t=performance.now()/1000, C=S.c, d=Math.hypot(ME.x-C.x,ME.z-C.z);
  if(d<12&&!S.up) S.up=t; const k=S.up?t-S.up:-1; if(k>28) S.up=0;
  for(const B of S.birds){ if(k>=0){ // up, round and down
      const lift=Math.min(1,k/3)*(k>22?Math.max(0,(28-k)/6):1), a=k*.45+B.ph, R=14+B.ph;
      B.g.position.set(C.x+Math.cos(a)*R*lift+B.ox*(1-lift),LAND.GY+lift*(8+Math.sin(B.ph)*2),C.z+Math.sin(a)*R*lift+B.oz*(1-lift)); B.g.rotation.y=-a-Math.PI/2*lift;
      B.wings.forEach((w,i)=>{ w.visible=lift>.05; w.rotation.x=Math.PI/2+Math.sin(t*7+B.ph)*.7*(i?1:-1); }); B.legs.forEach(l=>l.visible=lift<.3); B.neck.rotation.z=lift>.3?-.9:0; continue; }
    B.wings.forEach(w=>w.visible=false); B.legs.forEach(l=>l.visible=true);
    const wx=C.x+B.ox+Math.sin(t*.05+B.ph)*1.5, wz=C.z+B.oz+Math.cos(t*.04+B.ph)*1.2; B.g.position.set(wx,LAND.GY-.06,wz); B.g.rotation.y=Math.sin(t*.05+B.ph)>0?B.ph:B.ph+Math.PI;
    if(B.sleep){ B.neck.rotation.z=.9; B.head.rotation.z=1.4; B.head.rotation.y=2.6; } else { B.neck.rotation.z=-1.05; B.head.rotation.z=-.5; B.head.rotation.y=Math.sin(t*3+B.ph)*.55; } } });
// ---- egrets standing in the paddies, a few flying over; goats on the cliffs
const EGRETS=[]; { const wm=new THREE.MeshLambertMaterial({color:0xf6f4ee}), bk=new THREE.MeshLambertMaterial({color:0xd9a830});
  const bird=()=>{ const g=new THREE.Group(); const b=new THREE.Mesh(new THREE.SphereGeometry(.13,8,6),wm); b.scale.set(1.7,1,1); b.position.y=.55; g.add(b); const n=new THREE.Mesh(new THREE.CylinderGeometry(.025,.03,.35,5),wm); n.position.set(.16,.75,0); n.rotation.z=-.5; g.add(n); const bl=new THREE.Mesh(new THREE.ConeGeometry(.02,.14,5),bk); bl.position.set(.3,.86,0); bl.rotation.z=-1.6; g.add(bl);
    for(const s of [-1,1]){ const l=new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,.45,4),bk); l.position.set(0,.22,s*.04); g.add(l); } const wg=[]; for(const s of [-1,1]){ const w=new THREE.Mesh(new THREE.PlaneGeometry(.5,.18),new THREE.MeshLambertMaterial({color:0xf6f4ee,side:THREE.DoubleSide})); w.position.set(0,.58,s*.25); w.rotation.x=Math.PI/2; g.add(w); w.visible=false; wg.push(w); } g.userData.wings=wg; scene.add(g); ZL_DYN.push(g); return g; };
  for(let i=0;i<10;i++){ let x,z; do{ x=-160+RAND()*240; z=-150+RAND()*320; }while(!LAND.paddy(x,z)||Math.hypot(x-LAND.C.x,z-LAND.C.z)<45); const g=bird(); g.position.set(x,LAND.GY,z); g.rotation.y=RAND()*6.28; EGRETS.push({g,x,z,fly:false}); }
  for(let i=0;i<5;i++){ const g=bird(); g.userData.wings.forEach(w=>w.visible=true); g.children.slice(5,7).forEach(l=>l.visible=false); EGRETS.push({g,fly:true,ph:i*.6}); } }
{ const gm=new THREE.MeshLambertMaterial({color:0xe8e2d6}), dk=new THREE.MeshLambertMaterial({color:0x3a3430});
  const spots=[]; for(let k=0;k<4000&&spots.length<5;k++){ const x=110+RAND()*120, z=-60+RAND()*230, y=HILLS.h(x,z), sl=HILLS.slope(x,z); if(HILLS.insideLoop(x,z)&&y>10&&y<45&&sl<.75&&sl>.5&&spots.every(q=>Math.hypot(q[0]-x,q[1]-z)>30)) spots.push([x,z,y,RAND()*6.28]); }
  spots.forEach(([x,z,y,a],pi)=>{
    const g=new THREE.Group(); g.position.set(x,y-.1,z); g.rotation.y=-a; g.scale.setScalar(1.6); scene.add(g);
    const b=new THREE.Mesh(new THREE.BoxGeometry(.55,.28,.22),pi%2?gm:dk); b.position.y=.5; g.add(b); const h=new THREE.Mesh(new THREE.BoxGeometry(.18,.18,.14),pi%2?gm:dk); h.position.set(.32,.7,0); g.add(h);
    for(const [x,z] of [[.2,.08],[.2,-.08],[-.2,.08],[-.2,-.08]]){ const l=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.38,4),dk); l.position.set(x,.2,z); g.add(l); }
    for(const s of [-1,1]){ const hn=new THREE.Mesh(new THREE.ConeGeometry(.025,.16,4),dk); hn.position.set(.3,.84,s*.04); hn.rotation.z=.6; g.add(hn); } }); }
// ---- sampans on the loop: a fixed timetable everyone shares; forty seconds at the jetty each round
const BOATS=[]; const BOAT_V=2.4, DWELL=40, RLEN=RIVER.getLength(); const uDock=(()=>{ let best=0,bd=1e9; for(let i=0;i<500;i++){ const p=RIVER.getPointAt(i/500), d=Math.hypot(p.x-(LAND.DOCK.x1+3),p.z-(LAND.DOCK.z0+LAND.DOCK.z1)/2); if(d<bd){ bd=d; best=i/500; } } return best; })();
const CYCLE=RLEN/BOAT_V+DWELL;
{ const hull=new THREE.MeshLambertMaterial({color:0x5e4a36}), in2=new THREE.MeshLambertMaterial({color:0x8a7052});
  for(let b=0;b<2;b++){ const g=new THREE.Group(); scene.add(g); ZL_DYN.push(g);
    const sh=new THREE.Shape(); sh.moveTo(-3.2,0); sh.quadraticCurveTo(-2.4,.55,0,.62); sh.quadraticCurveTo(2.4,.55,3.2,0); sh.quadraticCurveTo(2.4,-.55,0,-.62); sh.quadraticCurveTo(-2.4,-.55,-3.2,0);
    const hg=new THREE.ExtrudeGeometry(sh,{depth:.42,bevelEnabled:false}); hg.rotateX(-Math.PI/2); hg.translate(0,-.28,0); const h=new THREE.Mesh(hg,hull); g.add(h);
    const fl=new THREE.Mesh(new THREE.BoxGeometry(5,.04,.9),in2); fl.position.y=.05; g.add(fl);
    for(const x of [-1.4,-.3,.8,1.9]){ const s=new THREE.Mesh(new THREE.BoxGeometry(.3,.06,1.0),in2); s.position.set(x,.25,0); g.add(s); s.userData={type:'sampan',b}; pickables.push(s); }
    h.userData={type:'sampan',b}; pickables.push(h);
    const rower=npcFigure({top:0x4a4a44,low:0x2a2826,dark:1,hat:'douli'}); rower.position.set(-2.6,-.02,0); rower.rotation.y=-Math.PI/2; rower.scale.setScalar(.95); g.add(rower);
    const oar=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,3,5),hull); oar.position.set(-2.4,.6,.55); oar.rotation.x=.9; g.add(oar);
    const lamp=new THREE.Mesh(new THREE.SphereGeometry(.12,10,8),new THREE.MeshLambertMaterial({color:0xfff0c8,emissive:0xffa040,emissiveIntensity:0})); lamp.position.set(2.9,.75,0); g.add(lamp);
    const seats=[]; for(const x of [-1.4,-.3,.8,1.9]){ const si=addSeat(0,0,0,'boat'); SEATS[si].boat=b; SEATS[si].bx=x; seats.push(si); }
    reflect(g); BOATS.push({g,rower,oar,lamp,seats,wake:wakes.value[b],off:b*CYCLE/2}); } }
SEAT_KIND.boat={eye:.95,pitch:0,front:true,sink:-.45,label:'遊河',hello:NT('boat.hello'),status:()=>NT('boat.status')};
function boatState(B,t){ const ph=(((t/1000+B.off)%CYCLE)+CYCLE)%CYCLE; if(ph<DWELL) return {u:uDock,dock:true,left:DWELL-ph}; const u=(uDock+(ph-DWELL)*BOAT_V/RLEN)%1; return {u,dock:false}; }
window.__boatAct=u=>{ const B=BOATS[u.b]; if(!B) return; const st=boatState(B,Date.now()); const p=RIVER.getPointAt(st.u);
  if(ME.seat>=0&&SEATS[ME.seat].kind==='boat') return; if(!st.dock){ toast(NT('boat.wait'),3500); return; } if(Math.hypot(ME.x-p.x,ME.z-p.z)>14){ toast(NT('boat.far'),3000); return; }
  const si=B.seats.find(s=>!occupied(s)); if(si==null){ toast(NT('boat.full')); return; } const s=SEATS[si]; s.ap={x:(LAND.DOCK.x0+LAND.DOCK.x1)/2+2.5,z:(LAND.DOCK.z0+LAND.DOCK.z1)/2}; ME.path=[];
  ME.seat=si; ME.x=s.x; ME.z=s.z; ME.yaw=s.yaw; ME.pitch=0; pushPresence(); toast(NT('boat.hello'),4000); };
// ---- 綠頭鴨 on the river: little flocks that drift along the water by a shared clock (everyone sees the same birds),
//      paddle on the spot, now and then up-end to feed; they give way to the sampans and rest by the bank at night;
//      a hen with ducklings from April to July
const DUCKS=[]; { const L=(c,e)=>new THREE.MeshLambertMaterial(e?{color:c,emissive:e}:{color:c});
  const MAT={grey:L(0xa7a59c),back:L(0x6e675c),chest:L(0x6a3a2a),green:L(0x1d5a3c,0x0b2a1a),white:L(0xf2efe6),black:L(0x1c1c1a),ybill:L(0xd9c24a),obill:L(0xc0782e),hen:L(0x8e6c48),hend:L(0x5e4632),blue:L(0x2f4fa8,0x0c1640),foot:L(0xe08a2c),down:L(0x9c8350),downy:L(0xd8c27a),ring:new THREE.MeshBasicMaterial({color:0xe8f2ee,transparent:true,opacity:.35,depthWrite:false})};
  const S=(r,m,x,y,z,sx,sy,sz,g)=>{ const o=new THREE.Mesh(new THREE.SphereGeometry(r,10,7),m); o.position.set(x,y,z); o.scale.set(sx,sy,sz); g.add(o); return o; };
  const bird=kind=>{ const g=new THREE.Group(), drake=kind==='drake', kid=kind==='kid'; const body=new THREE.Group(); g.add(body);
    if(kid){ S(.06,MAT.down,0,.05,0,1.4,.9,1,body); S(.04,MAT.downy,.07,.11,0,1,1,1,body); const b=S(.02,MAT.black,.11,.105,0,1.3,.5,.9,body); }
    else { S(.13,drake?MAT.grey:MAT.hen,0,.07,0,1.65,.72,.95,body); S(.1,drake?MAT.back:MAT.hend,-.03,.13,0,1.6,.35,.8,body);   // body, darker back
      S(.08,drake?MAT.chest:MAT.hen,.13,.08,0,1,1,1.1,body);                                                                // breast
      for(const z of [-1,1]) S(.035,MAT.blue,-.04,.1,z*.105,1.6,.6,.3,body);                                                 // the blue speculum
      S(.05,drake?MAT.black:MAT.hend,-.21,.12,0,1.4,.6,.8,body); if(drake) S(.02,MAT.white,-.2,.15,0,1.6,.6,.5,body);      // tail (the drake's curl)
      const nk=new THREE.Mesh(new THREE.CylinderGeometry(.035,.045,.1,8),drake?MAT.green:MAT.hen); nk.position.set(.17,.17,0); nk.rotation.z=-.3; body.add(nk);
      if(drake){ const r=new THREE.Mesh(new THREE.TorusGeometry(.043,.009,5,14),MAT.white); r.position.set(.165,.14,0); r.rotation.set(Math.PI/2,.3,0); body.add(r); }
      S(.055,drake?MAT.green:MAT.hen,.2,.23,0,1.15,1,.95,body);                                                            // head
      S(.025,drake?MAT.ybill:MAT.obill,.27,.215,0,1.9,.45,1,body);                                                          // bill
      for(const z of [-1,1]) S(.008,MAT.black,.225,.24,z*.045,1,1,1,body); }
    const ring=new THREE.Mesh(new THREE.RingGeometry(.22,.26,24),MAT.ring); ring.rotation.x=-Math.PI/2; ring.position.y=.005; g.add(ring);
    g.scale.setScalar(kid?1:1.15); scene.add(g); ZL_DYN.push(g);
    const pk=new THREE.Mesh(new THREE.SphereGeometry(.3,6,4),new THREE.MeshBasicMaterial({visible:false})); pk.position.y=.12; pk.userData={type:'duck'}; g.add(pk); pickables.push(pk);
    return {g,body,ring,kid}; };
  // flocks: start along the loop, drift speed (m/s, + downstream / − upstream), lane across the river, who is in it
  const FLOCKS=[[.03,.18,-2.5,['drake','hen']],[.16,-.12,2,['drake','hen','drake']],[.31,.1,-1,['drake','drake','hen','hen']],[.47,-.2,3,['drake','hen']],
    [.62,.15,-3,['hen','drake','hen']],[.78,-.08,1.5,['drake','hen']],[.9,.12,0,['hen','kid','kid','kid','kid'],1]];
  FLOCKS.forEach(([u0,v,lane,who,brood],fi)=>who.forEach((k,j)=>{ const D=bird(k); Object.assign(D,{fi,j,u0,v,lane,brood:!!brood,ph:fi*1.7+j*2.3,
    du:brood?-(j?j*.55+.4:0):((j%2?-1:1)*(.4+j*.35)), dl:brood?(j?Math.sin(j*2.1)*.35:0):((j%3)-1)*.7}); DUCKS.push(D); })); }
const duckP=new THREE.Vector3(), duckT=new THREE.Vector3(), DRW=RIVER_HALF_WIDTH;   // the river's half width
ZL_ANIM.push(()=>{ if(!DUCKS.length) return; const now=Date.now(), t=now/1000, night=SKY_DAY<.3; const mo=(new Date(now+8*3600e3)).getUTCMonth()+1, spring=mo>=4&&mo<=7;
  const bus=BOATS.map(B=>boatState(B,now).u);
  for(const D of DUCKS){ const vis=!D.brood||spring; D.g.visible=vis; if(!vis) continue;
    // where along the river: a slow drift with a lazy back-and-forth, slower still at night
    const drift=night?.15:1, s=D.v*drift*t+Math.sin(t*.011+D.fi)*25+Math.sin(t*.037+D.fi*2)*6;
    let u=(((D.u0+(s+D.du)/RLEN)%1)+1)%1; RIVER.getPointAt(u,duckP); RIVER.getTangentAt(u,duckT);
    // across: the flock's lane, each bird's place in it, a little wandering; away from a passing boat; at night by the bank
    let lane=D.lane+D.dl+Math.sin(t*.13+D.ph)*.6; if(night) lane=(D.lane>=0?1:-1)*(DRW-1.4)+D.dl*.5;
    for(const bu of bus){ let du=Math.abs(bu-u); du=Math.min(du,1-du)*RLEN; if(du<14){ const side=lane>=0?1:-1; lane+=((DRW-1.2)*side-lane)*Math.min(1,(14-du)/6); } }
    lane=Math.max(-(DRW-1),Math.min(DRW-1,lane));
    const nx=-duckT.z, nz=duckT.x, x=duckP.x+nx*lane, z=duckP.z+nz*lane;
    // heading: with the drift, swinging a bit; the ducklings follow the hen
    const dir=(D.v>=0?1:-1); let yaw=Math.atan2(-duckT.z*dir,duckT.x*dir)+Math.sin(t*.3+D.ph)*(night?.2:.6);
    const k=night?0:Math.max(0,Math.sin(t*.21+D.ph*3)-.93)*14;   // up-ending to feed now and then
    D.g.position.set(x,-.1+Math.sin(t*1.6+D.ph)*.008,z); D.g.rotation.y=yaw; if(!D.kid) D.body.rotation.z=-Math.min(1,k)*1.45;
    D.ring.scale.setScalar(1+((t*.6+D.ph)%1)*1.4); D.ring.material.opacity=.3; } });
// ---- fireflies over the paddies at night, round you
const FLY=(()=>{ const N=28, pos=new Float32Array(N*3), ph=new Float32Array(N); for(let i=0;i<N;i++){ ph[i]=RAND()*6.28; }
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setAttribute('ph',new THREE.BufferAttribute(ph,1));
  const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uTime:U.uTime,uOn:{value:0}},
    vertexShader:'attribute float ph; uniform float uTime; varying float vA; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.); vA=pow(max(0.,sin(uTime*1.3+ph*3.)),6.); gl_PointSize=7.*vA*(30./-mv.z)+1.; gl_Position=projectionMatrix*mv; }',
    fragmentShader:'uniform float uOn; varying float vA; void main(){ float d=length(gl_PointCoord-.5); if(d>.5) discard; gl_FragColor=vec4(.8,1.,.45,(1.-d*2.)*vA*uOn); }'});
  const p=new THREE.Points(g,m); p.frustumCulled=false; scene.add(p); ZL_DYN.push(p); const base=[]; for(let i=0;i<N;i++) base.push([LAND.C.x+(RAND()-.5)*22,LAND.C.z+(RAND()-.5)*24,.3+RAND()*1.2]); return {p,m,base,pos}; })();
// ---- each frame
// rain everywhere outside: the same falling streaks as in the courtyards, in a 70 m square that travels with you; no drops
// under the house's roofs (the courtyards have their own rain) or in the front court
const WORLD_RAIN=(()=>{
  const n=3200, R=35, TOP=26, pos=new Float32Array(n*6), velocity=new Float32Array(n);
  const geometry=new THREE.BufferGeometry(); geometry.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const material=new THREE.LineBasicMaterial({color:0xc9d3dc,transparent:true,opacity:.3,depthWrite:false});
  const points=new THREE.LineSegments(geometry,material); points.frustumCulled=false; points.visible=false; scene.add(points); ZL_DYN.push(points);
  const B=LAND.BLOCK, F=LAND.FORE, roofed=(x,z)=>(x>B.x0&&x<B.x1&&z>B.z0&&z<B.z1)||(x>F.x0&&x<F.x1&&z>F.z0&&z<F.z1);
  const drop=(i,cx,cz,any)=>{ const x=cx+(Math.random()*2-1)*R, z=cz+(Math.random()*2-1)*R; pos[i*6]=x; pos[i*6+2]=z; pos[i*6+1]=any?Math.random()*TOP:TOP*(.7+Math.random()*.3); velocity[i]=.75+Math.random()*.5; };
  for(let i=0;i<n;i++) drop(i,0,0,true);
  return {points,positions:pos,velocity,n,R,roofed,drop};
})();
const RI={m:new THREE.Matrix4(),q:new THREE.Quaternion(),s:new THREE.Vector3(),v:new THREE.Vector3(),up:new THREE.Vector3(0,1,0)};
function fillRice(cx,cz){ const L=LAND.rice, im=L.im; let n=0; const R=L.R, SP=L.SP, x0=Math.floor((cx-R)/SP)*SP, z0=Math.floor((cz-R)/SP)*SP;
  for(let x=x0;x<cx+R;x+=SP) for(let z=z0;z<cz+R;z+=SP){ const jx=x+(hash2(x,z)-.5)*SP*.6, jz=z+(hash2(z,x)-.5)*SP*.6; if((jx-cx)**2+(jz-cz)**2>R*R||!LAND.paddy(jx,jz)) continue; if(n>=im.instanceMatrix.count) break;
    RI.q.setFromAxisAngle(RI.up,hash2(jx*3,jz*3)*6.28); const sc=.85+hash2(jx,jz*2)*.35; RI.s.set(sc,sc*(.9+hash2(jz,jx)*.25),sc); RI.v.set(jx,LAND.GY,jz); RI.m.compose(RI.v,RI.q,RI.s); im.setMatrixAt(n++,RI.m); }
  im.count=n; im.instanceMatrix.needsUpdate=true; L.cx=cx; L.cz=cz; }
let landT=0;
ZL_ANIM.push(dt=>{ dt=dt||.016; const now=Date.now(), t=performance.now()/1000; U.uTime.value=t;
  // wind from the live weather: direction and a gusting amplitude; stronger in rain
  const wd=(typeof WIND!=='undefined'?WIND.dir:.6)||.6, ws=(typeof WIND!=='undefined'?WIND.speed:2)||2, rainy=(()=>{ try{ return raining(); }catch{ return false; } })();
  U.uWind.value.set(Math.cos(wd),Math.sin(wd)); const gust=.5+.5*Math.sin(t*.23)*Math.sin(t*.071); U.uAmp.value=Math.min(.9,.18+ws*.05+gust*.22+(rainy?.25:0));
  sky.position.set(ME.x,0,ME.z);
  if(STAR_DOME) STAR_DOME.position.set(ME.x,0,ME.z);
  WORLD_RAIN.points.visible=WX.rain>.04;
  if(WORLD_RAIN.points.visible){
    const W=WORLD_RAIN, P=W.positions, dir=typeof WIND!=='undefined'?WIND.dir:.6, wx=Math.cos(dir)*.12, wz=Math.sin(dir)*.12, fall=dt*(20+WX.rain*16), len=.45+WX.rain*.25;
    W.points.material.opacity=.16+.22*Math.min(1,WX.rain*1.4);
    const live=Math.round(W.n*Math.min(1,.25+WX.rain));   // light rain: fewer streaks
    for(let i=0;i<W.n;i++){ const o=i*6; let x=P[o], z=P[o+2], y=P[o+1]-fall*W.velocity[i];
      if(y<-.15||Math.abs(x-ME.x)>W.R||Math.abs(z-ME.z)>W.R){ W.drop(i,ME.x,ME.z,y>=-.15); x=P[o]; z=P[o+2]; y=P[o+1]; }
      const hide=i>=live||W.roofed(x,z); P[o+1]=y; P[o+3]=x+wx*len; P[o+4]=hide?y:y+len; P[o+5]=z+wz*len; if(hide){ P[o+3]=x; P[o+5]=z; } }
    W.points.geometry.attributes.position.needsUpdate=true;
  }
  sunDirection.copy(daylight.position).sub(daylight.target.position).normalize();
  landLight.uLandDay.value=SKY_DAY;
  { const k=SKY_DAY, wl=WATER_U.uWaterLight.value; wl.setRGB(.05+.9*k,.07+.88*k,.12+.8*k).lerp(skyHorizon,.12*k).multiplyScalar(1-.22*(WX.cloud||0)); }
  const L=LAND.rice; if(Math.hypot(ME.x-L.cx,ME.z-L.cz)>9) fillRice(ME.x,ME.z);
  if(LAND.wheel) LAND.wheel.rotation.z=t*.35;
  // boats
  for(const B of BOATS){ const st=boatState(B,now), p=RIVER.getPointAt(st.u), d=RIVER.getTangentAt(st.u); const yaw=Math.atan2(-d.z,d.x);
    const inCave=false;
    const bob=.016+U.uAmp.value*.026;
    B.g.position.set(p.x,-.12+Math.sin(t*1.3+B.off)*bob,p.z);
    B.g.rotation.y=yaw;
    B.g.rotation.x=Math.sin(t*1.9+B.off)*bob*(st.dock?.25:.65);
    B.g.rotation.z=Math.sin(t*.9+B.off)*bob*(st.dock?.25:.5);
    B.wake.set(p.x,p.z,st.dock?0:d.x,st.dock?0:d.z);
    const P=B.rower.userData.parts; const row=st.dock?0:Math.sin(t*1.6+B.off); P.legs[0].rotation.x=row*.35; P.legs[1].rotation.x=-row*.2; P.arms[0].rotation.x=.6+row*.3; P.arms[1].rotation.x=.6-row*.3; B.oar.rotation.y=row*.25;
    B.lamp.material.emissiveIntensity=(SKY_DAY<.35||inCave)?1.6:0;
    const c=Math.cos(yaw), s=Math.sin(yaw); B.seats.forEach(si=>{ const S=SEATS[si]; S.x=B.g.position.x+c*S.bx; S.z=B.g.position.z-s*S.bx; S.yaw=yaw-Math.PI/2; S.ap=S.ap||{x:(LAND.DOCK.x0+LAND.DOCK.x1)/2+2.5,z:(LAND.DOCK.z0+LAND.DOCK.z1)/2}; });
    if(ME.seat>=0&&SEATS[ME.seat].boat===BOATS.indexOf(B)){ const S=SEATS[ME.seat], P2=seatPlace(S); ME.x=P2.x; ME.z=P2.z; if(st.dock&&st.left<6&&!B.warned){ B.warned=true; toast(NT('boat.leave'),3000); } if(!st.dock) B.warned=false; } }
  if(now-landT<120) return; landT=now; const T=taipeiNow(), m=T.min, dS=Math.min(1,(now%1e9)/1e9);
  // folk: weeding, walking the dikes, going home at dusk; the buffalo by the hour
  for(const f of FOLK){ const P=f.P, ph=t+f.ph, home=m>=1080||m<330;
    if(f.kind==='weed'){ const x=f.base.x+Math.sin(ph*.03)*5, z=f.base.z; f.g.position.set(x,LAND.GY,z); f.g.rotation.y=Math.PI/2; P.F.rotation.x=home?0:.9; P.F.position.y=home?0:-.25; P.arms[0].rotation.x=P.arms[1].rotation.x=home?0:.9+Math.sin(ph*2)*.3; f.g.visible=!home; }
    if(f.kind==='walk'){ const k=(ph*.4)%120, x=f.base.x+(k<60?k:120-k), z=Math.round((f.base.z-LAND.DIKE.oz)/LAND.DIKE.dz)*LAND.DIKE.dz+LAND.DIKE.oz; f.g.position.set(x,0,z); f.g.rotation.y=k<60?-Math.PI/2:Math.PI/2; const sw=Math.sin(ph*5)*.5; P.legs[0].rotation.x=sw; P.legs[1].rotation.x=-sw; P.arms[0].rotation.x=-sw*.5; P.arms[1].rotation.x=1.2; f.g.visible=!(m<330); }
    if(f.kind==='herd'){ f.g.position.set(BUF.x-1.4*Math.cos(BUF.yaw)+1.1*Math.sin(BUF.yaw),LAND.GY,BUF.z+1.4*Math.sin(BUF.yaw)+1.1*Math.cos(BUF.yaw)); f.g.rotation.y=BUF.yaw; f.g.visible=m>=1020&&m<1110||m>=360&&m<420; const sw=Math.sin(ph*5)*.4; P.legs[0].rotation.x=sw; P.legs[1].rotation.x=-sw; } }

  // egrets: standing birds start up when you come close; a few circle the fields
  for(const e of EGRETS){ if(e.fly){ const a=t*.08+e.ph, r=60; e.g.position.set(LAND.C.x-40+Math.cos(a)*r,18+Math.sin(t*.5+e.ph)*2,LAND.C.z+Math.sin(a)*r*.7); e.g.rotation.y=-a; e.g.userData.wings.forEach((w,i)=>w.rotation.x=Math.PI/2+Math.sin(t*6+e.ph)*.6*(i?1:-1)); continue; }
    const d=Math.hypot(ME.x-e.x,ME.z-e.z); if(d<9&&!e.up){ e.up=t; } if(e.up){ const k=t-e.up; e.g.position.set(e.x+k*2,LAND.GY+Math.min(25,k*3),e.z+k*1.2); e.g.userData.wings.forEach(w=>w.visible=true); if(k>14){ e.up=0; e.g.position.set(e.x,LAND.GY,e.z); e.g.userData.wings.forEach(w=>w.visible=false); } } }
  // fireflies after dark
  const night=SKY_DAY<.3; FLY.m.uniforms.uOn.value=night?1:0; if(night){ const a=FLY.pos; FLY.base.forEach(([x,z,y],i)=>{ a[i*3]=x+Math.sin(t*.3+i)*1.5; a[i*3+1]=y+Math.sin(t*.7+i*1.3)*.3; a[i*3+2]=z+Math.cos(t*.25+i)*1.5; }); FLY.p.geometry.attributes.position.needsUpdate=true; }
  // the season, checked now and then
  if(!LAND.seasonT||now-LAND.seasonT>600000){ LAND.seasonT=now; const S=season(); U.uRipe.value=S.ripe; U.uPale.value=S.pale; } });
}

// {% endraw %}
