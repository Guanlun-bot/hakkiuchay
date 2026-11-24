// {% raw %}
// ------------------------------------------------------------ 12 號房（二進西廂北間）：電影院
// The room as one dark, quiet box once inside: warm grey-brown fabric on the walls, the screen wall all black with a
// wide velvet frame round the screen, a flat dark ceiling with a field of tiny stars, wall-to-wall carpet. A soffit runs
// along each long wall with a warm cove light in its edge and pin lights under it that throw scallops down the fabric.
// Seats are centred on the screen: a three-seat sofa with a walnut coffee table in front at floor level; a stepped riser
// (45 cm, one 22.5 cm step the width of the room, lit nosings) behind with a U of sofa on it. Deep brown velvet curtains
// open when a film is loaded and close when it stops; the light is kept low (darker still while a film runs), and
// the court window has bamboo blinds like the rest of the house. Light scenes and level are shared by everyone in the house; volume is
// each player's own. The films are files the master keeps on Cloudflare R2 and lists in the back office
// (_data/vr.yml › films); choices travel through the house server's relay ({t:'b', d:{k:'cine'}}).
SEAT_KIND.cine={eye:1.02,pitch:.16,front:true,sink:-.44,get label(){ return NT('cine.label'); },get hello(){ return NT('cine.hello'); },status:()=>NT('cine.status')};
SEAT_KIND.cine2={eye:1.02+CIN.rh,pitch:.06,front:true,sink:-.44+CIN.rh,get label(){ return NT('cine.label'); },get hello(){ return NT('cine.hello'); },status:()=>NT('cine.status')};
{ const {x0:X0,x1:X1,z0:Z0,z1:Z1,xc:XC,rz:RZ,sz:SZ,rh:RH,sh:SH,ceil:CEIL}=CIN, m=(c,r=.9,o={})=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:r},o));
  const noiseTex=(base,dots,seed,rep)=>{ const t=ctex(256,256,(g,w,h)=>{ g.fillStyle=base; g.fillRect(0,0,w,h); let s=seed; const r=()=>((s=s*16807%2147483647)/2147483647);
      for(let i=0;i<5200;i++){ g.fillStyle=dots[i%dots.length]; const d=.6+r()*1.6; g.fillRect(r()*w,r()*h,d,d); } }); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(rep,rep); return t; };
  const fabric=m(0xffffff,.97,{map:noiseTex('#8b7e6f',['rgba(60,50,40,.18)','rgba(200,190,170,.14)'],11,6)});
  const carpet=m(0xffffff,1,{map:noiseTex('#5b524a',['rgba(30,26,22,.3)','rgba(140,118,92,.2)','rgba(170,130,80,.1)'],23,9)});
  const black=m(0x121212,.95), velvet=m(0x050505,1), ceilM=m(0x241e1a,.95), nosing=m(0x1a1918,.6),
    sofaM=m(0xa39280,.97), sofaD=m(0x8a7a68,.97), pillowM=[m(0xe2d6c0,.97),m(0x6e5844,.95)], legM=WD_WALD.V, walnut=WD_WAL.H, walnutV=WD_WAL.V, metal=m(0x1e1e1f,.45,{metalness:.5}), brass=m(0xb5945b,.32,{metalness:.8});
  { scene.updateMatrixWorld(true); const bb=new THREE.Box3(), gone=[];   // the roof's members inside this room hang below the flat ceiling and cut across the stars: out
    scene.traverse(o=>{ if(!o.isMesh||o.isInstancedMesh) return; bb.setFromObject(o); if(bb.min.x>=X0-.1&&bb.max.x<=X1+.1&&bb.min.z>=Z0-.1&&bb.max.z<=Z1+.1&&bb.min.y>3.0&&bb.max.y<7) gone.push(o); });
    for(const o of gone){ o.visible=false; const i=pickables.indexOf(o); if(i>=0) pickables.splice(i,1); } }
  const B=(w,h,d,mt,x,y,z,pk=null,par=scene)=>{ const o=box(w,h,d,mt,x,y,z,par,pk); o.castShadow=true; o.receiveShadow=true; return o; };
  const Cy=(r1,r2,h,mt,x,y,z,seg=16,par=scene)=>{ const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,seg),mt); o.position.set(x,y,z); o.castShadow=true; par.add(o); return o; };
  // a box with rounded edges (cushions, arms, table top): a rounded rectangle extruded with a bevel
  function rbox(w,h,d,r,mt,x,y,z,par=scene,pk=null){ r=Math.min(r,w/2-.005,h/2-.005,d/2-.005); const s=new THREE.Shape(), a=w/2-r, b=h/2-r;
    s.moveTo(-a,-h/2); s.lineTo(a,-h/2); s.quadraticCurveTo(w/2,-h/2,w/2,-b); s.lineTo(w/2,b); s.quadraticCurveTo(w/2,h/2,a,h/2); s.lineTo(-a,h/2); s.quadraticCurveTo(-w/2,h/2,-w/2,b); s.lineTo(-w/2,-b); s.quadraticCurveTo(-w/2,-h/2,-a,-h/2);
    const g=new THREE.ExtrudeGeometry(s,{depth:Math.max(.001,d-2*r),bevelEnabled:true,bevelThickness:r,bevelSize:r*.92,bevelSegments:3,curveSegments:5}); g.translate(0,0,-(d-2*r)/2);
    const o=new THREE.Mesh(g,mt); o.position.set(x,y,z); o.castShadow=true; o.receiveShadow=true; par.add(o); if(pk){ o.userData=pk; pickables.push(o); } return o; }
  // a flat panel on a wall with holes (u along the wall, v up), placed at a distance in front of it
  function wallPanel(mt,ax,at,nrm,u0,u1,v0,v1,holes=[]){ const s=new THREE.Shape(); s.moveTo(u0,v0); s.lineTo(u1,v0); s.lineTo(u1,v1); s.lineTo(u0,v1); s.closePath();
    for(const h of holes){ const p=new THREE.Path(); h.forEach(([a,b],k)=>k?p.lineTo(a,b):p.moveTo(a,b)); p.closePath(); s.holes.push(p); }
    const g=new THREE.ShapeGeometry(s), uv=g.attributes.uv, pos=g.attributes.position; for(let i=0;i<pos.count;i++) uv.setXY(i,pos.getX(i)/1.6,pos.getY(i)/1.6);
    const o=new THREE.Mesh(g,mt); o.receiveShadow=true; scene.add(o);
    if(ax==='x'){ o.position.set(at,0,0); o.rotation.y=-Math.PI/2; } else o.position.set(0,0,at);   // u along +z on the x walls, along +x on the z walls
    if(mt.side!==THREE.DoubleSide){ mt.side=THREE.DoubleSide; mt.needsUpdate=true; } return o; }
  const oct=(cu,cv,r)=>[...Array(8)].map((_,k)=>{ const a=Math.PI/8+k*Math.PI/4; return [cu+Math.cos(a)*r,cv+Math.sin(a)*r]; });
  const rect=(u0,u1,v0,v1)=>[[u0,v0],[u1,v0],[u1,v1],[u0,v1]];
  // ---- walls: fabric on three, black on the screen wall; slim dark skirting
  wallPanel(fabric,'x',X0+.012,1,Z0,Z1,0,CEIL);
  wallPanel(fabric,'x',X1-.012,-1,Z0,Z1,0,CEIL,[rect(19.1,20.7,0,2.52),oct(17.85,1.55,.52),oct(21.95,1.55,.52)]);
  wallPanel(fabric,'z',Z0+.012,1,X0,X1,0,CEIL,[rect(13.88,15.12,.98,2.47)]);
  wallPanel(black,'z',Z1-.012,-1,X0,X1,0,CEIL);
  for(const [x,z0,z1] of [[X0+.03,Z0,Z1],[X1-.03,Z0,19.1],[X1-.03,20.7,Z1]]) B(.03,.1,z1-z0,black,x,.05,(z0+z1)/2);
  B(X1-X0,.1,.03,black,XC,.05,Z0+.03);
  // ---- carpet everywhere, the riser and its step carpeted too, with dark nosings and a warm strip under each
  { const fl=new THREE.Mesh(new THREE.PlaneGeometry(X1-X0,Z1-Z0),carpet); fl.rotation.x=-Math.PI/2; fl.position.set(XC,.008,(Z0+Z1)/2); fl.receiveShadow=true; fl.userData={type:'floor'}; scene.add(fl); pickables.push(fl);
    B(X1-X0,RH,RZ-Z0,carpet,XC,RH/2,(Z0+RZ)/2,{type:'floor'}); B(X1-X0,SH,SZ-RZ,carpet,XC,SH/2,(RZ+SZ)/2,{type:'floor'});
    const led=new THREE.MeshStandardMaterial({color:0x2a2018,emissive:0xffc88a,emissiveIntensity:1.6});
    for(const [z,y] of [[RZ,RH],[SZ,SH]]){ B(X1-X0,.03,.05,nosing,XC,y-.012,z-.02); B(X1-X0-.02,.012,.006,led,XC,y-.05,z+.004); }
    CIN.stepLed=led; }
  // ---- flat dark ceiling, soffits along the long walls with the cove light, pin lights and the scallops they throw
  { const c=new THREE.Mesh(new THREE.PlaneGeometry(X1-X0,Z1-Z0),ceilM); c.rotation.x=Math.PI/2; c.position.set(XC,CEIL,(Z0+Z1)/2); scene.add(c);
    const SW=.34, SD=.24, cove=new THREE.MeshBasicMaterial({color:0xffd9b0,toneMapped:false});
    const glowT=ctex(64,256,(g,w,h)=>{ const gr=g.createLinearGradient(0,0,w,0); gr.addColorStop(0,'rgba(255,255,255,.9)'); gr.addColorStop(.25,'rgba(255,255,255,.35)'); gr.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=gr; g.fillRect(0,0,w,h); });
    const glowM=new THREE.MeshBasicMaterial({map:glowT,color:0xffd9b0,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});
    // a scallop: a hot spot right under the pin light, a soft cone widening down the wall, a curved upper edge
    const scT=ctex(256,512,(g,w,h)=>{ const im=g.createImageData(w,h), d=im.data, ss=(a,b,x)=>{ const t=Math.max(0,Math.min(1,(x-a)/(b-a))); return t*t*(3-2*t); };
      for(let j=0;j<h;j++) for(let i=0;i<w;i++){ const u=(i+.5)/w*2-1, v=(j+.5)/h, hw=.12+.88*Math.pow(v,.62), v0=.03+.3*u*u;
        let a=(1-ss(.55,1,Math.abs(u)/hw))*ss(v0,v0+.07,v)*Math.pow(1-v,1.25)*.85; a+=Math.exp(-(u*u*60+(v-.035)*(v-.035)*900))*.9; const k=(j*w+i)*4; d[k]=d[k+1]=d[k+2]=255; d[k+3]=Math.min(255,a*255); }
      g.putImageData(im,0,0); });
    const scM=new THREE.MeshBasicMaterial({map:scT,color:0xffd2a0,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});
    const pinM=new THREE.MeshBasicMaterial({color:0xfff0dc,toneMapped:false}), scallops=[], lights=[];
    for(const s of [-1,1]){ const xw=s<0?X0:X1, xi=xw-s*SW;
      B(SW,SD,Z1-Z0,ceilM,xw-s*SW/2,CEIL-SD/2,(Z0+Z1)/2);
      B(.016,.016,Z1-Z0-.04,cove,xi+s*.008,CEIL-SD+.012,(Z0+Z1)/2);                                    // the lit strip on the soffit's edge
      const gl=new THREE.Mesh(new THREE.PlaneGeometry(.7,Z1-Z0),glowM); gl.rotation.set(Math.PI/2,0,s<0?0:Math.PI); gl.position.set(xi-s*.35,CEIL-.004,(Z0+Z1)/2); scene.add(gl);
      const gf=new THREE.Mesh(new THREE.PlaneGeometry(.22,Z1-Z0),glowM); gf.rotation.set(0,s<0?Math.PI/2:-Math.PI/2,Math.PI/2); gf.position.set(xi-s*.002,CEIL-SD/2,(Z0+Z1)/2); scene.add(gf);
      for(const z of s<0?[16.5,18.2,21.3,23.1]:[16.5,23.1]){ const p=new THREE.Mesh(new THREE.CircleGeometry(.022,14),pinM);   // none over the door or the octagonal windows p.rotation.x=Math.PI/2; p.position.set(xw-s*SW*.45,CEIL-SD-.002,z); scene.add(p);
        const top=CEIL-SD-.02, H=1.5, w=.9, sc=new THREE.Mesh(new THREE.PlaneGeometry(w,H),scM); sc.position.set(xw-s*.026,top-H/2,z); sc.rotation.y=s<0?Math.PI/2:-Math.PI/2; scene.add(sc); scallops.push({sc,pin:p}); }
      for(const z of [17.4,21.8]){ const l=new THREE.PointLight(0xffd2a0,0,6.5,2); l.position.set(xw-s*.55,2.6,z); scene.add(l); lights.push(l); } }
    // stars: three sets that twinkle out of step
    const dotT=ctex(32,32,(g,w,h)=>{ const gr=g.createRadialGradient(16,16,0,16,16,16); gr.addColorStop(0,'rgba(255,255,255,1)'); gr.addColorStop(.35,'rgba(255,255,255,.6)'); gr.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=gr; g.fillRect(0,0,w,h); });
    const stars=[]; let sd=97; const rr=()=>((sd=sd*16807%2147483647)/2147483647);
    for(let k=0;k<3;k++){ const P=[]; for(let i=0;i<170;i++) P.push(X0+SW+.05+rr()*(X1-X0-2*SW-.1),CEIL-.006,Z0+.05+rr()*(Z1-Z0-.1));
      const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));
      const pm=new THREE.PointsMaterial({map:dotT,color:k===1?0xfff4e0:0xe8f0ff,size:.035+k*.008,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:true});
      const pts=new THREE.Points(g,pm); pts.frustumCulled=false; scene.add(pts); stars.push(pm); }
    Object.assign(CIN,{cove,glowM,scM,scallops,lights,stars,pinM}); }
  // ---- the screen: a wide black velvet frame, the picture, a strip for subtitles; a pelmet and red velvet curtains
  // the screen runs from the floor to the ceiling, 4.3 m wide; the picture takes the film's own shape inside it, never
  // starting lower than 0.8 m (lower, the heads in the front row would hide it from the back row), and black velvet masks
  // the rest, closing in and opening out as the shape changes
  const AREA={x0:XC-2.15,x1:XC+2.15,y0:.8,y1:CEIL-.18}, SWd=AREA.x1-AREA.x0, SHt=SWd*9/16, SY=AREA.y0+SHt/2, SZz=Z1-.03;
  B(SWd+.16,CEIL-.2,.03,velvet,XC,(CEIL-.2)/2+.04,Z1-.025);
  const scrM=new THREE.MeshBasicMaterial({color:0x161616,toneMapped:false}), scr=new THREE.Mesh(new THREE.PlaneGeometry(1,1),scrM);
  scr.rotation.y=Math.PI; scr.scale.set(SWd,SHt,1); scr.position.set(XC,SY,SZz-.012); scr.userData={type:'cinescreen'}; scene.add(scr); pickables.push(scr);
  { const wall=new THREE.Mesh(new THREE.PlaneGeometry(SWd+.16,CEIL-.2),new THREE.MeshBasicMaterial({color:0x000000})); wall.rotation.y=Math.PI; wall.position.set(XC,(CEIL-.2)/2+.04,SZz-.008); wall.userData={type:'cinescreen'}; scene.add(wall); pickables.push(wall); }
  const subCv=document.createElement('canvas'); subCv.width=1600; subCv.height=200; const subTex=new THREE.CanvasTexture(subCv); subTex.colorSpace=THREE.SRGBColorSpace;
  const sub=new THREE.Mesh(new THREE.PlaneGeometry(SWd*.9,SWd*.9/8),new THREE.MeshBasicMaterial({map:subTex,transparent:true,toneMapped:false,depthWrite:false}));
  sub.rotation.y=Math.PI; sub.position.set(XC,SY-SHt/2+SWd*.9/16+.06,SZz-.02); sub.visible=false; scene.add(sub); CIN.AREA=AREA;
  B(X1-X0,.24,.3,velvet,XC,CEIL-.12,Z1-.15);
  const curtM=new THREE.MeshPhysicalMaterial({color:0x4a3426,roughness:.8,sheen:1,sheenRoughness:.45,sheenColor:new THREE.Color(0xc9a27a),side:THREE.DoubleSide});   // deep brown velvet
  const CH=CEIL-.26, CZ=Z1-.2, half=(X1-X0)/2, curt=[];
  { const g=new THREE.PlaneGeometry(1,CH-.03,64,1), p=g.attributes.position; for(let i=0;i<p.count;i++){ const u=p.getX(i)+.5; p.setX(i,u); p.setZ(i,Math.sin(u*Math.PI*2*13)*.045); } g.computeVertexNormals(); g.translate(0,(CH-.03)/2+.02,0);
    for(const s of [-1,1]){ const c=new THREE.Mesh(g,curtM); c.position.set(s<0?X0+.02:X1-.02,0,CZ); c.scale.x=s<0?half:-half; c.castShadow=true; c.receiveShadow=true; c.userData={type:'cinescreen'}; scene.add(c); pickables.push(c); curt.push(c); } }
  // ---- the left and right speakers stand behind the screen (it lets the sound through), unseen; four small ones on the side walls
  const SPK={L:{x:XC-1.8,y:1.7,z:Z1-.1},R:{x:XC+1.8,y:1.7,z:Z1-.1}};
  for(const [x,z,nx] of [[X0+.02,17.35,1],[X0+.02,22.05,1],[X1-.02,17.3,-1],[X1-.02,22.6,-1]]){ const g=new THREE.Group(); g.position.set(x,2.35,z); g.rotation.y=nx>0?Math.PI/2:-Math.PI/2; scene.add(g);
    B(.22,.32,.15,black,0,0,.075,{type:'cinespk'},g); B(.19,.29,.008,m(0x1c1c1c,.95),0,0,.152,{type:'cinespk'},g); }
  // ---- sofas in warm greige with ecru and brown pillows, rounded, on short walnut feet. Local frame: front toward the screen (+z).
  function sofaPart(par,w,d,{back=true,armL=true,armR=true,seats=1,yaw=0}={}){ const H0=.09;
    for(const sx of [-1,1]) for(const sz of [-1,1]) Cy(.022,.016,H0,legM,sx*(w/2-.07),H0/2,sz*(d/2-.08),10,par);
    rbox(w,.26,d,.05,sofaD,0,H0+.13,0,par);
    const inL=armL?.2:0, inR=armR?.2:0, sw=(w-inL-inR)/seats, bk=back?.24:0;
    for(let i=0;i<seats;i++){ const x=-w/2+inL+sw*(i+.5); rbox(sw-.015,.15,d-bk-.02,.06,sofaM,x,H0+.33,bk/2,par);
      if(back){ const c=rbox(sw-.03,.46,.2,.08,sofaM,x,H0+.62,-d/2+bk+.06,par); c.rotation.x=-.16; } }
    if(back) rbox(w,.56,.2,.06,sofaD,0,H0+.5,-d/2+.1,par);
    if(armL) rbox(.2,.56,d,.07,sofaD,-w/2+.1,H0+.3,0,par); if(armR) rbox(.2,.56,d,.07,sofaD,w/2-.1,H0+.3,0,par); }
  function pillow(par,x,y,z,ci,rz){ const p=rbox(.42,.4,.13,.06,pillowM[ci],x,y,z,par); p.rotation.set(-.32,0,rz); }
  const seatPick=(par,si)=>{ par.traverse(o=>{ if(o.isMesh&&!o.userData.type){ o.userData={type:'seat',si}; pickables.push(o); } }); };
  // front: three seats, centred, the walnut table in front
  { const W=2.6, D=.95, zc=18.775, g=new THREE.Group(); g.position.set(XC,0,zc); scene.add(g); sofaPart(g,W,D,{seats:3});
    pillow(g,-W/2+.42,.72,-D/2+.42,0,.14); pillow(g,W/2-.42,.72,-D/2+.42,1,-.14);
    const sis=[-1,0,1].map(i=>{ const si=addSeat(XC+i*.733,zc+.06,Math.PI,'cine',NT('cine.seat',0)); SEATS[si].ap={x:XC+i*.733,z:19.47}; return si; });
    g.children.forEach(o=>{ const lx=o.position.x, i=lx<-.4?0:lx>.4?2:1; if(o.isMesh){ o.userData={type:'seat',si:sis[i]}; pickables.push(o); } });
    OB(XC-W/2,XC+W/2,zc-D/2,zc+D/2); }
  { const x=XC, z=20.025, w=1.2, d=.45, h=.4, pk={type:'cinetable'};
    rbox(w,.04,d,.012,walnut,x,h-.02,z,scene,pk); B(w-.12,.018,d-.1,walnut,x,.12,z,pk);
    for(const sx of [-1,1]) for(const sz of [-1,1]){ const l=Cy(.022,.014,h-.04,walnutV,x+sx*(w/2-.07),(h-.04)/2,z+sz*(d/2-.06),10); l.rotation.z=sx*.04; }
    for(const dx of [-.3,.3]) Cy(.045,.045,.006,m(0x3a3a3a,.7),x+dx,h+.003,z,20);
    OB(x-w/2,x+w/2,z-d/2,z+d/2); }
  // on the riser: a U, four seats facing the screen across the back, the two end ones with a chaise run forward
  { const y0=RH, W=X1-X0-.04, xL=X0+.02, XM=(X0+X1)/2, zb=15.7, D=.85, CL=.8, sw=(W-.4)/5, g=new THREE.Group(); g.position.set(XM,y0,zb+D/2); scene.add(g);
    sofaPart(g,W,D,{seats:5});
    for(const s of [-1,1]){ const c=new THREE.Group(); c.position.set(s*(W/2-(sw+.2)/2),0,D/2+CL/2); g.add(c); sofaPart(c,sw+.2,CL,{back:false,armL:s<0,armR:s>0,seats:1}); }
    pillow(g,-W/2+.42,.72,-D/2+.42,1,.14); pillow(g,W/2-.42,.72,-D/2+.42,1,-.14); pillow(g,-.5,.72,-D/2+.4,0,.06); pillow(g,.5,.72,-D/2+.4,0,-.06);
    const sx=i=>xL+.2+sw*(i+.5), sis=[0,1,2,3,4].map(i=>{ const x=sx(i), si=addSeat(x,zb+D/2+.06,Math.PI,'cine2',NT('cine.seat',1)); SEATS[si].ap=i===0?{x:x+.34,z:17.72}:i===4?{x:x-.34,z:17.72}:{x,z:17.08}; return si; });
    g.traverse(o=>{ if(!o.isMesh) return; const wp=o.getWorldPosition(new THREE.Vector3()); const i=Math.max(0,Math.min(4,Math.floor((wp.x-xL-.2)/sw))); o.userData={type:'seat',si:sis[i]}; pickables.push(o); });
    OB(xL,xL+W,zb,zb+D); OB(xL,xL+sw+.2,zb+D,zb+D+CL); OB(xL+W-sw-.2,xL+W,zb+D,zb+D+CL); }
  // ---- a light switch plate inside the door
  { const g=new THREE.Group(); g.position.set(X1-.02,1.25,18.75); g.rotation.y=-Math.PI/2; scene.add(g); const pk={type:'cineswitch'};
    B(.12,.2,.012,brass,0,0,.006,pk,g); for(let i=0;i<5;i++){ const b=Cy(.009,.009,.012,m(0xf4efe4,.4),0,.06-i*.03,.016,12,g); b.rotation.x=Math.PI/2; b.userData=pk; pickables.push(b); } }
  Object.assign(CIN,{scr,scrM,sub,subCv,subTex,SPK,curt,curtK:0,glow:null,SW:SWd,SH:SHt,SY}); ZL_DYN.push(scr,sub,...curt);
  { const glow=new THREE.PointLight(0xc8d4ff,0,9,1.6); glow.position.set(XC,SY-.2,Z1-1.4); scene.add(glow); const glow2=new THREE.PointLight(0xc8d4ff,0,6,2); glow2.position.set(XC,2.6,20.2); scene.add(glow2); CIN.glow=glow; CIN.glow2=glow2; } }

// ---- European panel doors for the cinema and the classroom (into the 明間 between them): walnut, two raised panels a
//      side, brass levers, no bar; anyone may open or close them, from either side; the state is shared like every door
function addEuroDoor(key,x,z,rot,half,h,wallT){ const g=new THREE.Group(); g.position.set(x,0,z); g.rotation.y=rot; scene.add(g);
  const pick={type:'door',key}, zi=-(wallT/2+.03), lw=half-.008, lh=h-.06, leaves=[], wood=WD_WAL.V, woodH=WD_WAL.H, dk=WD_WALD.V,
    brassM=new THREE.MeshStandardMaterial({color:0xb5945b,metalness:.8,roughness:.32});
  for(const side of [-1,1]){ const pv=new THREE.Group(); pv.position.set(side*half,0,zi); g.add(pv); const cx=-side*lw/2, t=.045;
    box(lw,lh,t,wood,cx,lh/2+.03,0,pv,pick);
    for(const fz of [-1,1]) for(const [y0,y1] of [[.2,.92],[1.1,lh-.12]]){ const pw=lw-.24, ph=y1-y0, cy=(y0+y1)/2+.03, zz=fz*(t/2+.006);
      box(pw,ph,.012,woodH,cx,cy,zz,pv,pick);                                                     // the raised field
      for(const [w2,h2,dx,dy] of [[pw+.06,.03,0,ph/2+.015],[pw+.06,.03,0,-ph/2-.015],[.03,ph,pw/2+.015,0],[.03,ph,-pw/2-.015,0]]) box(w2,h2,.018,dk,cx+dx,cy+dy,zz,pv,pick); }   // its moulding
    for(const fz of [-1,1]){ const hx=-side*(lw-.07), hz=fz*(t/2+.012);
      const rose=new THREE.Mesh(new THREE.CylinderGeometry(.026,.026,.01,18),brassM); rose.rotation.x=Math.PI/2; rose.position.set(hx,1.02,hz); pv.add(rose);
      const lev=new THREE.Mesh(new THREE.BoxGeometry(.12,.016,.016),brassM); lev.position.set(hx+side*.055,1.02,hz+fz*.022); pv.add(lev);
      const neck=new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,.025,10),brassM); neck.rotation.x=Math.PI/2; neck.position.set(hx,1.02,hz+fz*.012); pv.add(neck); }
    leaves.push({pv,side}); }
  DOORS[key]={leaves,bar:null,open:true,k:1,barK:0,euro:true,pose(d){ d.barK=0; for(const {pv,side} of d.leaves) pv.rotation.y=-side*(Math.PI/2-.08)*d.k; }};
  DOORS[key].pose(DOORS[key]); DOOR_BLOCKS.push({key,x0:x-.15,x1:x+.15,z0:z-half,z1:z+half}); }
addEuroDoor('dcine',19.6-ZR.wallX,(ZR.door.z0+ZR.door.z1)/2,-Math.PI/2,(ZR.door.z1-ZR.door.z0)/2,ZR.door.h,ZR.wallT);
// ---- the glazed wooden doors (classroom, the household's rooms, the laundry): dark walnut-brown, six panes of reeded amber
//      glass over a single raised panel, a black lever, flat casings; one leaf for a narrow opening, two for a wide one;
//      a panel of the same wood over the door where the opening is taller. Anyone may open or close them, shared like
//      every door; the bedrooms' doors are shut while someone sleeps inside (and cannot be opened then).
const GDOOR={wood:new THREE.MeshStandardMaterial({color:0x5a4030,roughness:.55}), dark:new THREE.MeshStandardMaterial({color:0x3e2c21,roughness:.6}),
  black:new THREE.MeshStandardMaterial({color:0x1a1a1a,metalness:.5,roughness:.4}),
  glass:new THREE.MeshStandardMaterial({map:textCanvas(64,64,(g,w,h)=>{ for(let x=0;x<w;x++){ const k=.5+.5*Math.sin(x/w*Math.PI*2*6); g.fillStyle=`rgb(${200+k*40|0},${140+k*35|0},${70+k*25|0})`; g.fillRect(x,0,1,h); } }),transparent:true,opacity:.72,roughness:.25,emissive:0x3a2208,emissiveIntensity:.35})};
function addGlassDoor(key,x,z,rot,width,H,wallT,opt={}){ const g=new THREE.Group(); g.position.set(x,0,z); g.rotation.y=rot; scene.add(g);
  const n=width<1.1?1:2, lh=Math.min(H,2.25), lw=width/n-.012, t=.042, zi=-(wallT/2+.03), pick={type:'door',key}, W=GDOOR, leaves=[];
  for(let i=0;i<n;i++){ const side=n===1?-1:(i?1:-1), pv=new THREE.Group(); pv.position.set(side*width/2,0,zi); g.add(pv); const cx=-side*lw/2;
    const B=(w,h,d,m,px,py,pz)=>box(w,h,d,m,cx+px,py,pz,pv,pick);
    B(.07,lh,t,W.wood,-lw/2+.035,lh/2,0); B(.07,lh,t,W.wood,lw/2-.035,lh/2,0);                 // stiles
    for(const [y,hh] of [[.06,.12],[.98,.09],[lh-.05,.1]]) B(lw-.14,hh,t,W.wood,0,y,0);          // bottom, lock and top rails
    B(lw-.14,.84,t*.6,W.wood,0,.54,0); for(const fz of [-1,1]){ B(lw-.3,.66,.012,W.dark,0,.54,fz*(t*.3+.006)); B(lw-.36,.6,.014,W.wood,0,.54,fz*(t*.3+.012)); }   // the raised panel
    const gy0=1.03, gy1=lh-.1, gh=gy1-gy0, gw=lw-.14; B(gw,gh,.008,W.glass,0,(gy0+gy1)/2,0);
    B(.03,gh,t,W.wood,0,(gy0+gy1)/2,0); for(const k of [1,2]) B(gw,.03,t,W.wood,0,gy0+gh*k/3,0);  // the glazing bars: two by three
    for(const fz of [-1,1]){ const hx=-side*(lw-.08); const r=new THREE.Mesh(new THREE.CylinderGeometry(.022,.022,.01,14),W.black); r.rotation.x=Math.PI/2; r.position.set(hx,1.0,fz*(t/2+.006)); pv.add(r);
      const lv=new THREE.Mesh(new THREE.BoxGeometry(.11,.016,.016),W.black); lv.position.set(hx+side*.05,1.0,fz*(t/2+.024)); pv.add(lv); }
    leaves.push({pv,side}); }
  for(const fz of [-1,1]){ const zz=fz*(wallT/2+.012); for(const sx of [-1,1]) box(.07,H,.024,W.wood,sx*(width/2+.035),H/2,zz,g); box(width+.14,.07,.024,W.wood,0,H+.035,zz,g); }   // casings
  if(H-lh>.05) box(width,H-lh,wallT*.6,W.wood,0,(lh+H)/2,0,g);                                      // the panel over the door
  DOORS[key]=Object.assign({leaves,bar:null,open:true,k:1,barK:0,euro:true,glass:true,pose(d){ d.barK=0; for(const {pv,side} of d.leaves) pv.rotation.y=-side*(Math.PI/2-.08)*d.k; }},opt);
  DOORS[key].pose(DOORS[key]); const alongZ=Math.abs(Math.sin(rot))>.5; DOOR_BLOCKS.push(alongZ?{key,x0:x-.15,x1:x+.15,z0:z-width/2,z1:z+width/2}:{key,x0:x-width/2,x1:x+width/2,z0:z-.15,z1:z+.15}); }
{ const zc=(ZR.door.z0+ZR.door.z1)/2, w=ZR.door.z1-ZR.door.z0;
  addGlassDoor('dcls',19.6+ZR.wallX,zc,Math.PI/2,w,ZR.door.h,ZR.wallT);                                       // the classroom
  addGlassDoor('d26',4*courtAxis-ZR.wallX,zc,-Math.PI/2,w,ZR.door.h,ZR.wallT,{room:[31.56,36.62,15.3,23.9]});  // 26: the women's room
  addGlassDoor('d22',4*courtAxis-ZR.wallX,2*courtAxis-zc,-Math.PI/2,w,ZR.door.h,ZR.wallT,{room:[31.56,36.62,-4.3,4.3]});   // 22: the men's room
  addGlassDoor('dkids',29.4,4.584,0,1.3,2.75,.3,{room:[27.24,31.56,-4.3,4.49]});                             // the pages' room (east 前過水)
  addGlassDoor('dlaund',29.4,2*courtAxis-4.584,Math.PI,1.3,2.75,.3);                                         // the laundry (west 前過水)
  addGlassDoor('dlaundB',(LDRY.door.x0+LDRY.door.x1)/2,LDRY.door.z,0,LDRY.door.x1-LDRY.door.x0,LDRY.door.h,.3); }   // and its back door
// {% endraw %}
