// {% raw %}
/* ================= 屋簷：瓦當、滴水、椽頭、桁 =================
   Every roof's eaves are finished here, after all the roofs stand: along each eave a row of round tile ends (瓦當)
   with pointed drip tiles (滴水) between them over a thin clay edge; under the deep eaves of the long halls and wings
   a row of round rafters (椽) runs out from the wall to the edge, carried near the edge by a purlin (桁). Where one
   roof's eave runs on under a neighbour's roof (the inside corners of the courts) it stops, so the two roofs meet in a
   valley instead of crossing. Built in world space, so the squeezed side halls keep round tiles. */
function roofH(p,u,v){ const main=p.tip>.3; return p.eave+p.rise*(1-v)**1.26+p.tip*Math.abs(u)**8*(main?(1-v)**2:1-.78*v)+(main?.29*Math.abs(u)**10*v**3:0); }
function buildEaves(){ scene.updateMatrixWorld(true);
  const ROOFS=[]; scene.traverse(o=>{ const p=o.userData&&o.userData.roofAnchor; if(p) ROOFS.push({o,p,inv:o.matrixWorld.clone().invert()}); });
  const tmp=new THREE.Vector3();
  // is this world point tucked under another roof?
  const under=(P,self)=>{ for(const R of ROOFS){ if(R===self) continue; tmp.copy(P).applyMatrix4(R.inv); const u=tmp.x/(R.p.width/2), v=Math.abs(tmp.z)/R.p.halfDepth; if(Math.abs(u)<=1&&v<=1&&tmp.y<roofH(R.p,u,v)-.03) return true; } return false; };
  const clay=new THREE.MeshStandardMaterial({color:0x96523a,roughness:.8}), clayD=new THREE.MeshStandardMaterial({color:0x7c4330,roughness:.85}),
    rafterM=new THREE.MeshStandardMaterial({color:0x4a3324,roughness:.75}), endM=new THREE.MeshStandardMaterial({color:0x2f2219,roughness:.8});
  // shapes: a round tile end with a raised rim, a drip tile like an upturned leaf, a rafter (unit long, along +y)
  const wdGeo=new THREE.CylinderGeometry(.068,.068,.035,16); wdGeo.rotateX(Math.PI/2);
  const rimGeo=new THREE.TorusGeometry(.056,.008,6,16);
  const dsShape=new THREE.Shape(); dsShape.moveTo(-.085,0); dsShape.quadraticCurveTo(-.08,-.07,0,-.12); dsShape.quadraticCurveTo(.08,-.07,.085,0); dsShape.closePath();
  const dsGeo=new THREE.ExtrudeGeometry(dsShape,{depth:.018,bevelEnabled:false,curveSegments:6});
  const rfGeo=new THREE.CylinderGeometry(.038,.038,1,8); rfGeo.translate(0,.5,0);
  const capGeo=new THREE.CircleGeometry(.038,10);
  const lists={wd:[],rim:[],ds:[],rf:[],cap:[]};
  const runs=[], purlins=[];
  const m4=new THREE.Matrix4(), q=new THREE.Quaternion(), sc=new THREE.Vector3(1,1,1), Z=new THREE.Vector3(0,0,1), Y=new THREE.Vector3(0,1,0);
  for(const R of ROOFS){ const p=R.p, main=p.tip>.3, mw=R.o.matrixWorld;
    const W2=p.width/2, hd=p.halfDepth, wallZ=main?4.3:hd;   // long ranges: walls at ±4.15 (+ half their thickness); side rooms: eaves flush
    for(const side of [-1,1]){
      const loc=(u,v,dy=0)=>new THREE.Vector3(u*W2,roofH(p,u,v)+dy,side*v*hd).applyMatrix4(mw);
      const out=new THREE.Vector3(0,0,side).transformDirection(mw).setY(0).normalize();
      // walk along the eave in world steps
      const a=loc(-1,1), b=loc(1,1), len=a.distanceTo(b), N=Math.max(8,Math.round(len/.04));
      let run=[], k=0, acc=0, prev=null;
      const flush=()=>{ if(run.length>1) runs.push(run); run=[]; };
      for(let i=0;i<=N;i++){ const u=-1+2*i/N, P=loc(u,1);
        if(under(P,R)){ flush(); prev=null; continue; }
        run.push(P);
        if(prev) acc+=P.distanceTo(prev); prev=P;
        if(i===0||acc>=.13){ acc=0; k++;
          const t=loc(Math.min(1,u+.01),1).sub(loc(Math.max(-1,u-.01),1)).normalize();
          const n=out.clone(); q.setFromRotationMatrix(m4.makeBasis(t,new THREE.Vector3().crossVectors(n,t).normalize(),n));
          if(k%2){ m4.compose(P.clone().addScaledVector(n,.02).add(new THREE.Vector3(0,-.02,0)),q,sc); lists.wd.push(m4.clone()); m4.compose(P.clone().addScaledVector(n,.04).add(new THREE.Vector3(0,-.02,0)),q,sc); lists.rim.push(m4.clone()); }
          else { m4.compose(P.clone().addScaledVector(n,.012).add(new THREE.Vector3(0,-.035,0)),q,sc); lists.ds.push(m4.clone()); }
          // rafters under the deep eaves, every other tile
          if(main&&k%2===1){ const w0=loc(u,wallZ/hd,-.15), w1=loc(u,1,-.15); const mid=w0.clone().lerp(w1,.5);
            if(!under(mid,R)&&!under(w0,R)){ const d=w1.clone().sub(w0), L=d.length(); q.setFromUnitVectors(Y,d.normalize()); m4.compose(w0,q,new THREE.Vector3(1,L+.04,1)); lists.rf.push(m4.clone());
              const qc=new THREE.Quaternion().setFromUnitVectors(Z,d); m4.compose(w1.clone().addScaledVector(d,.041),qc,sc); lists.cap.push(m4.clone()); } } } }
      flush();
      // the purlin near the edge, under the rafters (long ranges only)
      if(main){ let pr=[]; for(let i=0;i<=N;i+=2){ const u=-1+2*i/N, P=loc(u,(hd-.3)/hd,-.22); if(under(loc(u,1),R)||under(P,R)){ if(pr.length>1) purlins.push(pr); pr=[]; } else pr.push(P); } if(pr.length>1) purlins.push(pr); }
    } }
  const inst=(geo,mat,arr)=>{ if(!arr.length) return; const im=new THREE.InstancedMesh(geo,mat,arr.length); arr.forEach((m,i)=>im.setMatrixAt(i,m)); im.castShadow=true; im.receiveShadow=true; im.instanceMatrix.needsUpdate=true; im.computeBoundingSphere(); scene.add(im); EAVE_PARTS.push(im); };
  inst(wdGeo,clay,lists.wd); inst(rimGeo,clayD,lists.rim); inst(dsGeo,clay,lists.ds); inst(rfGeo,rafterM,lists.rf); inst(capGeo,endM,lists.cap);
  // the thin clay edge along each visible run, and the purlins
  for(const r of runs){ if(r.length<3) continue; const pts=r.filter((_,i)=>i%3===0||i===r.length-1); scene.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),Math.max(4,pts.length),.03,6,false),clayD)); }
  for(const r of purlins){ if(r.length<3) continue; scene.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(r),Math.max(4,r.length),.055,8,false),rafterM)); } }
const EAVE_PARTS=[];
buildEaves();

/* ================= 24、28 號房南牆：石框竹節窗 =================
   On the south end walls of the 第一進 wings, facing the 前庭: a stone window frame with scrolled head and sill and
   capped side posts, five bars turned like bamboo, in the same stone and dark wood as the other windows. The opening
   is the width of an end-wall door (1.3 m) and square. */
function cutWindow(g,wx,wz,width,y0,y1){ g.updateMatrixWorld(true); const L=g.worldToLocal(new THREE.Vector3(wx,0,wz)), side=Math.sign(L.x);
  const gone=[]; g.children.forEach(m=>{ const p=m.geometry&&m.geometry.parameters; if(m.isMesh&&p&&Math.abs(p.depth-8.6)<.01&&Math.abs(p.width-.3)<.01&&Math.abs(m.position.x-side*8.15)<.05) gone.push(m); });
  let brick=null, white=null; for(const m of gone){ if(m.geometry.parameters.height<1) brick=m.material; else white=m.material; g.remove(m); const i=pickables.indexOf(m); if(i>=0) pickables.splice(i,1); }
  if(!gone.length) return null;
  brick=brick||mBrick(4,.9); white=white||mWhite(2,1.7); const x=side*8.15, a=L.z-width/2, b=L.z+width/2;
  for(const [z0,z1] of [[-4.3,a],[b,4.3]]) if(z1-z0>.01){ box(.3,.9,z1-z0,brick,x,.45,(z0+z1)/2,g,BLOCK); box(.3,2.78,z1-z0,white,x,2.29,(z0+z1)/2,g,BLOCK); }
  box(.3,.9,width,brick,x,.45,L.z,g,BLOCK); box(.3,y0-.9,width,white,x,(y0+.9)/2,L.z,g,BLOCK); box(.3,3.68-y1,width,white,x,(y1+3.68)/2,L.z,g,BLOCK);
  return g.localToWorld(new THREE.Vector3(x,0,L.z)); }
function bambooWindow(wx,wz,nx,w,y0,y1){ const g=new THREE.Group(); g.position.set(wx,0,wz); g.rotation.y=Math.atan2(nx,0)||0; scene.add(g); WINDOWS.push({k:'sq',parent:g,cx:0,z:0,w,y0,y1});
  const h=y1-y0, D=.38, sd=stone;
  // scrolled band: a flat bar with a raised middle panel and ends that roll over, extruded through the wall
  function band(yBase,up){ const s=new THREE.Shape(), hw=w/2+.32, t=.16, pw=w*.34, ph=.1, sg=up?1:-1;
    const P=(x,y)=>[x,yBase+sg*y];
    s.moveTo(...P(-hw,0)); s.lineTo(...P(-pw-.06,0)); s.lineTo(...P(-pw-.06,0)); s.lineTo(...P(pw+.06,0)); s.lineTo(...P(hw,0));
    s.quadraticCurveTo(...P(hw+.1,t*.5),...P(hw-.02,t+.03)); s.quadraticCurveTo(...P(hw-.12,t+.05),...P(hw-.16,t));
    s.quadraticCurveTo(...P(pw+.2,t-.02),...P(pw+.06,t)); s.lineTo(...P(pw,t+ph)); s.quadraticCurveTo(...P(0,t+ph+.04),...P(-pw,t+ph)); s.lineTo(...P(-pw-.06,t));
    s.quadraticCurveTo(...P(-pw-.2,t-.02),...P(-hw+.16,t)); s.quadraticCurveTo(...P(-hw+.12,t+.05),...P(-hw+.02,t+.03)); s.quadraticCurveTo(...P(-hw-.1,t*.5),...P(-hw,0));
    const geo=new THREE.ExtrudeGeometry(s,{depth:D,bevelEnabled:true,bevelThickness:.012,bevelSize:.012,bevelSegments:2,curveSegments:10}); geo.translate(0,0,-D/2);
    const m=new THREE.Mesh(geo,sd); m.castShadow=true; g.add(m); }
  band(y1,true); band(y0,false);
  // side posts with little bottle caps on top
  for(const sx of [-1,1]){ box(.2,h+.42,D,sd,sx*(w/2+.12),y0-.06+(h+.42)/2-.15,0,g);
    const cap=new THREE.Mesh(new THREE.CylinderGeometry(.045,.07,.12,12),sd); cap.position.set(sx*(w/2+.12),y1+.22,0); g.add(cap);
    const knob=new THREE.Mesh(new THREE.SphereGeometry(.05,12,8),sd); knob.position.set(sx*(w/2+.12),y1+.31,0); g.add(knob); }
  // five bamboo bars: joints every so often, a slight swelling at each node
  for(let i=1;i<=5;i++){ const bx=-w/2+i*w/6, bar=new THREE.Group(); bar.position.set(bx,y0,0); g.add(bar);
    const segs=4, sl=h/segs; for(let k=0;k<segs;k++){ const c=new THREE.Mesh(new THREE.CylinderGeometry(.052,.056,sl-.02,12),M.woodDark); c.position.y=k*sl+sl/2; bar.add(c);
      if(k){ const n=new THREE.Mesh(new THREE.TorusGeometry(.056,.012,6,14),M.woodDark); n.rotation.x=Math.PI/2; n.position.y=k*sl; bar.add(n); } }
    box(.005,.005,.005,M.woodDark,0,0,0,bar); }
  return g; }
for(const [wing,zc] of [[frontWings[0],0],[frontWings[1],2*courtAxis]]){ const w=1.3, y0=1.5, y1=2.8;
  const p=cutWindow(wing,FRONT.cx+7.5,zc,w,y0,y1); if(p) bambooWindow(p.x,p.z,Math.sign(p.x-FRONT.cx),w,y0,y1); }

const BEDS=[], STANDS=[], NPC_DYN_PRE=[];
/* ================= 22、26 號房（第一進兩廂北間）：各四張木床，兩兩相對，每對中間一個床頭櫃 =================
   The beds stand with their heads against the long front and back walls, two pairs facing each other across the
   room, so the middle of the room and the door to the 明間 stay clear. Wooden single beds in the manner of the 1930s:
   panelled head and foot boards, turned posts, a cotton mattress, pillow and a folded quilt. */
{ const frame=new THREE.MeshStandardMaterial({map:T.cypress,bumpMap:T.cypressBump,bumpScale:.8,roughness:.55}), dark=new THREE.MeshStandardMaterial({map:T.cypressDark,bumpMap:T.cypressBump,bumpScale:.8,roughness:.55}),
    cloth=new THREE.MeshStandardMaterial({color:0xefe8da,roughness:.95}), quilt=[0x6b7f95,0x8a5a4a,0x5f7a62,0x9a8460].map(c=>new THREE.MeshStandardMaterial({color:c,roughness:.9})),
    brass=new THREE.MeshStandardMaterial({color:0xb5945b,metalness:.8,roughness:.32});
  const BL=2.02, BW=1.52;   // double beds
  // one bed in its own group: local −z is the foot, the head board at z=+L/2
  function bed(x,z,yaw,qi,W=BW,L=BL,cx=34.1){ const g=new THREE.Group(); g.position.set(x,0,z); g.rotation.y=yaw; scene.add(g);
    for(const sx of [-1,1]) for(const sz of [-1,1]){ const h=sz>0?1.02:.62; cylinder(.032,.032,h,dark,sx*(W/2-.03),h/2,sz*(L/2-.03),g); const k=new THREE.Mesh(new THREE.SphereGeometry(.042,12,8),dark); k.position.set(sx*(W/2-.03),h+.02,sz*(L/2-.03)); g.add(k); }
    box(W-.06,.12,L-.06,frame,0,.33,0,g);                                       // rails
    box(W-.06,.6,.035,frame,0,.66,L/2-.03,g); box(W-.2,.42,.012,dark,0,.68,L/2-.05,g);   // head board with a sunk panel
    box(W-.06,.26,.035,frame,0,.47,-(L/2-.03),g);                              // foot board
    box(W-.12,.14,L-.14,cloth,0,.46,0,g);                                       // mattress
    box(Math.min(.62,W-.3),.1,.34,cloth,0,.58,L/2-.28,g);     // pillow
    const fq=box(W-.1,.07,.6,quilt[qi%4],0,.565,-(L/2-.5),g);                          // folded quilt at the foot
    const sq=box(W-.14,.3,L-.3,quilt[qi%4],0,.68,-.12,g); sq.visible=false; BEDS.push({x,z,yaw,fq,sq,W,L,cx}); NPC_DYN_PRE.push(fq,sq);
    OB(x-(Math.abs(Math.sin(yaw))>.5?L:W)/2,x+(Math.abs(Math.sin(yaw))>.5?L:W)/2,z-(Math.abs(Math.sin(yaw))>.5?W:L)/2,z+(Math.abs(Math.sin(yaw))>.5?W:L)/2); }
  // a bedside cabinet with framed panels: top with a moulded edge, a drawer and a door each in a raised frame, brass pulls, short tapered legs
  function stand(x,z,yaw,W2=.46){ const g=new THREE.Group(); g.position.set(x,0,z); g.rotation.y=yaw; scene.add(g);
    const D2=.38, H2=.58, lg=.1, bays=Math.max(1,Math.round(W2/.5)), bw=W2/bays;
    for(const sx of (bays>1?[-1,-.33,.33,1]:[-1,1])) for(const sz of [-1,1]) cylinder(.016,.024,lg,dark,sx*(W2/2-.035),lg/2,sz*(D2/2-.035),g);
    box(W2,H2-lg,D2,frame,0,lg+(H2-lg)/2,0,g);                                   // carcass
    box(W2+.04,.025,D2+.04,dark,0,H2+.012,0,g); box(W2+.02,.018,D2+.02,frame,0,H2-.009,0,g);   // top and its moulding
    box(W2+.012,.03,D2+.012,dark,0,lg+.015,0,g);                                  // plinth band
    const fz=-D2/2-.004;
    // front: drawer above, door below, each a frame of four rails round a sunk panel
    for(let b=0;b<bays;b++){ const bx=-W2/2+bw*(b+.5);
    for(const [y0,y1] of [[H2-.17,H2-.03],[lg+.05,H2-.2]]){ const cy=(y0+y1)/2, h=y1-y0, w=bw-.06;
      box(w,h,.008,frame,bx,cy,fz,g);
      box(w,.022,.016,dark,bx,y1-.011,fz-.006,g); box(w,.022,.016,dark,bx,y0+.011,fz-.006,g);
      box(.022,h,.016,dark,bx-w/2+.011,cy,fz-.006,g); box(.022,h,.016,dark,bx+w/2-.011,cy,fz-.006,g);
      const ky=h>.2?y1-.07:cy, rose=new THREE.Mesh(new THREE.CylinderGeometry(.016,.016,.006,14),brass); rose.rotation.x=Math.PI/2; rose.position.set(bx,ky,fz-.017); g.add(rose);
      const ring=new THREE.Mesh(new THREE.TorusGeometry(.022,.004,8,20),brass); ring.position.set(bx,ky-.022,fz-.022); g.add(ring); } }
    // framed sides
    for(const sx of [-1,1]){ const xx=sx*(W2/2+.004); box(.012,H2-lg-.08,D2-.06,frame,xx,lg+(H2-lg)/2,0,g);
      for(const [yy,hh,dd] of [[H2-.05,.02,D2-.06],[lg+.05,.02,D2-.06]]) box(.016,hh,dd,dark,xx+sx*.004,yy,0,g);
      for(const zz of [-(D2/2-.04),D2/2-.04]) box(.016,H2-lg-.1,.02,dark,xx+sx*.004,lg+(H2-lg)/2,zz,g); }
    const hw=Math.abs(Math.sin(yaw))>.5?.22:W2/2+.03, hd=Math.abs(Math.sin(yaw))>.5?W2/2+.03:.22; OB(x-hw,x+hw,z-hd,z+hd); }
  // against the front wall (the one with the window) and the back wall: a bed along each side wall (the end wall and
  // the partition), heads to the wall, and between them one long cabinet that both beds can reach. Room 22 (west
  // wing): front face z≈15.6, back z≈23.6, end wall x≈31.72, partition x≈36.48; room 26 mirrors it about the axis.
  let qi=0; const xa=31.72+BW/2+.02, xb=36.48-BW/2-.02, cab=(xb-xa)-BW-.12, L=BL;
  for(const [front,back] of [[15.6,23.6],[4.0,-4.0]]){ const s=Math.sign(back-front);
    for(const [wallZ,toward] of [[front,s],[back,-s]]){ const zc=wallZ+toward*(L/2+.02), yaw=toward>0?Math.PI:0;
      bed(xa,zc,yaw,qi++); bed(xb,zc,yaw,qi++); stand((xa+xb)/2,wallZ+toward*.22,yaw,cab); STANDS.push({x:(xa+xb)/2,z:wallZ+toward*.22,yaw,cab,beds:[BEDS.length-2,BEDS.length-1],room:front>9?22:26}); } }
  // the two pages' room, in the east 前過水 (x 27.24–31.56, the door at the 過廳 end): two small beds, heads to the far
  // wall along each side, a cabinet between them with their lamps and clock; a chest at each foot, a little writing
  // desk and a row of pegs by the door half, which is left clear
  { const cx=29.4, zw=-4.0, kw=.95, kl=1.95, xa=27.39+.06+kw/2, xb=31.41-.06-kw/2, zc=zw+.02+kl/2;
    bed(xa,zc,Math.PI,1,kw,kl,cx); bed(xb,zc,Math.PI,3,kw,kl,cx); stand(cx,zw+.2,Math.PI,.62); STANDS.push({x:cx,z:zw+.2,yaw:Math.PI,cab:.62,beds:[BEDS.length-2,BEDS.length-1],room:'kids'});
    for(const x of [xa,xb]){ box(.62,.38,.42,frame,x,.19,zc+kl/2+.26); box(.64,.025,.44,dark,x,.39,zc+kl/2+.26); for(const sx of [-1,1]){ const r=new THREE.Mesh(new THREE.TorusGeometry(.02,.004,6,14),brass); r.position.set(x+sx*.2,.26,zc+kl/2+.48); scene.add(r); } OB(x-.31,x+.31,zc+kl/2+.05,zc+kl/2+.47); }
    // the writing desk against the west wall, a stool, brush rest, inkstone and a paper weight; a lamp on its corner
    const dz=2.3; box(.5,.04,1.0,frame,27.39+.27,.72,dz); for(const ex of [-1,1]) for(const ez of [-1,1]) box(.04,.7,.04,dark,27.39+.27+ex*.2,.35,dz+ez*.45);
    box(.2,.016,.13,new THREE.MeshStandardMaterial({color:0x1d1c1b,roughness:.45}),27.39+.3,.748,dz-.25); box(.3,.004,.22,new THREE.MeshStandardMaterial({color:0xefe6cf,roughness:.9}),27.39+.27,.742,dz+.1);
    box(.32,.04,.32,frame,27.39+.75,.42,dz); for(const ex of [-1,1]) for(const ez of [-1,1]) box(.035,.4,.035,dark,27.39+.75+ex*.12,.2,dz+ez*.12); OB(27.39,27.39+.55,dz-.5,dz+.5);
    // a row of pegs on the east wall by the door, a cap and a short coat on two of them
    box(.03,.06,1.4,dark,31.41-.02,1.6,2.6); for(let k=0;k<5;k++){ const pg=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,.1,8),dark); pg.rotation.z=Math.PI/2; pg.position.set(31.41-.08,1.6,2.0+k*.3); scene.add(pg); }
    box(.06,.5,.34,new THREE.MeshStandardMaterial({color:0x6d7f97,roughness:.9}),31.41-.1,1.33,2.3); box(.06,.46,.32,new THREE.MeshStandardMaterial({color:0xb59a5e,roughness:.9}),31.41-.1,1.35,2.9); } }
await __yield(0.9);
// {% endraw %}
