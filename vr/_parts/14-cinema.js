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
addEuroDoor('dcls',19.6+ZR.wallX,(ZR.door.z0+ZR.door.z1)/2,Math.PI/2,(ZR.door.z1-ZR.door.z0)/2,ZR.door.h,ZR.wallT);

// ---- playing, lights, the hand-held bottle, the in-room panel, and keeping everyone in step
{ const R=CIN, FILMS=(Array.isArray(VRD.films)?VRD.films:[]).filter(f=>f&&String(f.url||'').trim()).map(f=>({title:String(f.title||'').trim()||String(f.url).split('/').pop(),url:String(f.url).trim(),subs:String(f.subs||'').trim()}));
  const vid=document.createElement('video'); vid.crossOrigin='anonymous'; vid.playsInline=true; vid.preload='auto'; vid.setAttribute('playsinline','');
  const park=document.createElement('div'); park.style.cssText='position:fixed;left:0;top:0;width:2px;height:2px;opacity:0;pointer-events:none;overflow:hidden;z-index:-1'; park.append(vid); document.body.append(park);
  vid.style.cssText='width:100%;height:100%;object-fit:contain;background:#000';
  const tex=new THREE.VideoTexture(vid); tex.colorSpace=THREE.SRGBColorSpace;
  const SCENES=['welcome','pre','film','inter','night'], LOOK={
    welcome:{cove:0xffc890,ci:.45,sc:.42,pt:.4,st:0}, pre:{cove:0xffa860,ci:.24,sc:.12,pt:.1,st:.35}, film:{cove:0xff9a50,ci:.012,sc:0,pt:0,st:1},
    inter:{cove:0xffb070,ci:.15,sc:.07,pt:.06,st:.5}, night:{cove:0xc06a30,ci:.05,sc:.012,pt:.01,st:1} };
  // shared: the film (u,ti,sb), playing, where, and the room (lt scene, lv level 0–2, 1 in the middle; sh is no longer used); v orders the changes
  const S={u:'',ti:'',sb:'',p:false,t:0,at:performance.now(),lt:'welcome',lv:1,sh:false,v:0,id:''};
  const L={stars:localStorage.getItem('cineStars')!=='0',vol:+(localStorage.getItem('cineVol')||.8),mute:false,subs:localStorage.getItem('cineSubs')!=='0',err:'',loaded:'',cues:[],cue:-1,near:false,inRoom:false,want:false,blocked:false,fs:false,hud:localStorage.getItem('cineHud')!=='0'};
  const pos=()=>S.t+(S.p?(performance.now()-S.at)/1000:0);
  const send=(d,to)=>{ try{ return !!(NET.bcast&&NET.bcast(Object.assign({k:'cine'},d),to)); }catch{ return false; } };
  const pack=()=>({o:'st',u:S.u,ti:S.ti,sb:S.sb,p:S.p,t:+pos().toFixed(2),lt:S.lt,lv:S.lv,sh:S.sh,v:S.v,id:S.id});
  function take(d){ Object.assign(S,{u:d.u||'',ti:d.ti||'',sb:d.sb||'',p:!!d.p&&!!d.u,t:Math.max(0,+d.t||0),at:performance.now(),lt:SCENES.includes(d.lt)?d.lt:'welcome',lv:Math.max(0,Math.min(2,d.lv??1)),sh:!!d.sh,v:d.v|0,id:d.id||''}); sync(true); refresh(); }
  function act(ch){ const st=Object.assign(pack(),ch,{v:S.v+1,id:MY_PID}); take(st); send(st); unlockAudio(); }
  const play=on=>{ L.blocked=false; const end=vid.duration&&pos()>=vid.duration-.2; act({p:on,t:end?0:pos(),lt:on?'film':'pre',lv:1}); };
  // ---- subtitles (.srt or .vtt)
  function parseSubs(txt){ const out=[], ts=s=>{ const m=s.trim().replace(',','.').match(/(?:(\d+):)?(\d+):(\d+(?:\.\d+)?)/); return m?(+(m[1]||0))*3600+(+m[2])*60+(+m[3]):NaN; };
    for(const blk of String(txt).replace(/\r/g,'').split(/\n\s*\n/)){ const ln=blk.split('\n'), i=ln.findIndex(l=>l.includes('-->')); if(i<0) continue; const [a,b]=ln[i].split('-->'), s=ts(a), e=ts(b.split(' ').filter(Boolean)[0]||'');
      if(isFinite(s)&&isFinite(e)) out.push({s,e,tx:ln.slice(i+1).join('\n').replace(/<[^>]+>/g,'').trim()}); } return out; }
  function drawSub(tx){ const g=R.subCv.getContext('2d'), W=R.subCv.width, H=R.subCv.height; g.clearRect(0,0,W,H); R.sub.visible=!!tx;
    if(tx){ g.font='600 62px "Noto Sans TC","Noto Serif TC",sans-serif'; g.textAlign='center'; g.textBaseline='middle'; const lines=tx.split('\n').slice(-2), lh=72, y0=H/2-(lines.length-1)*lh/2;
      lines.forEach((l,i)=>{ g.lineWidth=10; g.strokeStyle='rgba(0,0,0,.85)'; g.strokeText(l,W/2,y0+i*lh); g.fillStyle='#fff'; g.fillText(l,W/2,y0+i*lh); }); }
    R.subTex.needsUpdate=true; L.subTx=tx||''; if(fsSub) fsSub.textContent=L.subTx; }
  // ---- sound from the two tall speakers; quieter just outside an open door, nothing through a shut one
  let ac=null, gm=null;
  function unlockAudio(){ try{ if(!ac){ const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return; ac=new AC(); const src=ac.createMediaElementSource(vid);
      const up=ac.createGain(); up.channelCount=2; up.channelCountMode='explicit'; up.channelInterpretation='speakers'; const sp=ac.createChannelSplitter(2); gm=ac.createGain(); gm.gain.value=0;
      src.connect(up); up.connect(sp); vid.volume=1; window.__cineAC=ac; ['L','R'].forEach((k,i)=>{ const p=ac.createPanner(); p.panningModel='HRTF'; p.distanceModel='inverse'; p.refDistance=2.2; p.rolloffFactor=1.1; p.maxDistance=40;
        const s=R.SPK[k]; p.positionX.value=s.x; p.positionY.value=s.y; p.positionZ.value=s.z; sp.connect(p,i); p.connect(gm); }); gm.connect(ac.destination); }
    if(ac.state==='suspended') ac.resume(); }catch(e){ console.warn(e); } }
  const gesture=()=>{ L.blocked=false; if(ac){ if(ac.state==='suspended') ac.resume(); } else if(S.u&&L.near) unlockAudio(); };
  addEventListener('pointerdown',gesture,{passive:true}); addEventListener('keydown',gesture,{passive:true});
  function sync(force){ if(S.u!==L.loaded){ L.loaded=S.u; L.err=''; L.cues=[]; L.cue=-1; drawSub(''); if(S.u){ vid.src=S.u; vid.load(); } else { vid.pause(); vid.removeAttribute('src'); vid.load(); }
      if(S.sb) fetch(S.sb).then(r=>r.ok?r.text():'').then(t=>{ if(L.loaded===S.u) L.cues=parseSubs(t); }).catch(()=>{}); }
    if(force&&S.u&&vid.readyState>=1&&L.near){ const p=pos(); if(Math.abs(vid.currentTime-p)>.35) try{ vid.currentTime=Math.min(p,(vid.duration||1e9)-.05); }catch{} } }
  vid.addEventListener('error',()=>{ if(!S.u) return; L.err=NT('cine.err'); refresh(); toast(L.err,8000); });
  vid.addEventListener('loadedmetadata',()=>{ sync(true); refresh(); });
  // ---- the colour of the picture, read a few times a second, lights the room
  const amb=document.createElement('canvas'); amb.width=amb.height=4; const ambX=amb.getContext('2d',{willReadFrequently:true}); let ambAt=0, ambOK=true; const AMB=new THREE.Color(0xc8d4ff); let ambL=0;
  // ---- the bottle in your hand (first person) and in others' hands
  const DR=CIN.DRINK, names=()=>String(NT('cine.drinks')).split(/[,，、]/).map(s=>s.trim());
  const bottleOf=i=>{ const d=DR[i]||DR[0], g=new THREE.Group(), mt=new THREE.MeshStandardMaterial({color:d.c,roughness:d.glass?.15:.5,transparent:!!d.glass,opacity:d.glass?.8:1});
    if(d.k==='box'){ const b=new THREE.Mesh(new THREE.BoxGeometry(.06,.15,.045),mt); b.position.y=.075; g.add(b); }
    else { const h=d.k==='bottle'?.2:.122, r=d.k==='bottle'?.026:.03, b=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,14),mt); b.position.y=h/2; g.add(b);
      if(d.k==='bottle'){ const n=new THREE.Mesh(new THREE.CylinderGeometry(.011,.024,.05,12),mt); n.position.y=h+.025; g.add(n); } } return g; };
  let fpB=null, fpIdx=-1, sipAt=0, sips=0; window.__cineBt=-1;
  function takeDrink(i){ window.__cineBt=i; sips=5; try{ pushPresence(); }catch{} toast(NT('cine.take',0)+'《'+(names()[i]||'')+'》',3000); refresh(); }
  function sip(){ if(window.__cineBt<0) return; sipAt=performance.now(); if(--sips<=0){ setTimeout(()=>{ window.__cineBt=-1; try{ pushPresence(); }catch{} toast(NT('cine.take',1),2500); refresh(); },1400); } }
  function putBack(){ window.__cineBt=-1; try{ pushPresence(); }catch{} refresh(); }
  // ---- the main loop
  let corrAt=0; const tmpC=new THREE.Color(), cur={cove:new THREE.Color(0xffd9b0),ci:1,sc:1,pt:1,st:0,amb:0};
  let lastT=performance.now();
  ZL_ANIM.push(()=>{ const now=performance.now(), dt=Math.min(.25,(now-lastT)/1000); lastT=now; const mx=ME.x, mz=ME.z, door=DOORS.dcine;
    const inRoom=mx>R.x0&&mx<R.x1&&mz>R.z0&&mz<R.z1, dOut=Math.max(R.x0-mx,mx-R.x1,R.z0-mz,mz-R.z1,0);
    L.inRoom=inRoom; L.near=inRoom||dOut<5||L.fs; const live=!!S.u&&!L.err;
    L.want=live&&S.p&&L.near&&!(vid.duration&&pos()>=vid.duration-.1);
    if(L.want&&vid.paused&&!L.blocked&&vid.readyState>=1){ sync(true); const pr=vid.play(); if(pr&&pr.catch) pr.catch(()=>{ L.blocked=true; toast(NT('cine.tap'),6000); }); }
    if(!L.want&&!vid.paused) vid.pause();
    if(live&&!S.p&&L.near&&vid.readyState>=1&&Math.abs(vid.currentTime-S.t)>.3&&now-corrAt>400){ corrAt=now; try{ vid.currentTime=Math.min(S.t,(vid.duration||1e9)-.05); }catch{} }
    if(L.want&&!vid.paused&&vid.readyState>=2&&now-corrAt>500){ corrAt=now; const diff=vid.currentTime-pos();
      if(Math.abs(diff)>1){ try{ vid.currentTime=pos()+.15; }catch{} vid.playbackRate=1; } else vid.playbackRate=Math.abs(diff)>.1?1-Math.max(-.08,Math.min(.08,diff*.5)):1; }
    { const A=R.AREA, W=A.x1-A.x0, Hm=A.y1-A.y0, ar=vid.videoWidth&&vid.videoHeight?vid.videoWidth/vid.videoHeight:16/9; let w=W, h=W/ar; if(h>Hm){ h=Hm; w=Hm*ar; }
      R.pw=(R.pw||w)+(w-(R.pw||w))*Math.min(1,dt*2); R.ph=(R.ph||h)+(h-(R.ph||h))*Math.min(1,dt*2);
      R.scr.scale.set(R.pw,R.ph,1); R.scr.position.y=A.y0+R.ph/2; R.sub.scale.setScalar(Math.min(1,R.pw/W)); R.sub.position.y=A.y0+.06+R.pw*.9/16; }
    const show=live&&vid.readyState>=2; if((R.scrM.map===tex)!==show){ R.scrM.map=show?tex:null; R.scrM.color.setHex(show?0xffffff:0x161616); R.scrM.needsUpdate=true; }
    let ci=-1; if(L.subs&&show&&L.cues.length){ const t=vid.currentTime; ci=L.cues.findIndex(c=>t>=c.s&&t<=c.e); } if(ci!==L.cue){ L.cue=ci; drawSub(ci>=0?L.cues[ci].tx:''); }
    // curtains: open while a film is loaded
    R.curtK+=((S.u?1:0)-R.curtK)*Math.min(1,dt*.9); const half=(R.x1-R.x0)/2, w=half-(half-.3)*R.curtK; R.curt[0].scale.x=w; R.curt[1].scale.x=-w;
    // lights: ease toward the scene, scaled by the level
    const lk=LOOK[S.lt]||LOOK.welcome, f=Math.min(1,dt*1.6), lv=S.lv;
    cur.cove.lerp(tmpC.setHex(lk.cove),f); for(const k of ['ci','sc','pt','st']) cur[k]+=(lk[k]*(k==='st'?1:lv)-cur[k])*f;
    R.cove.color.copy(cur.cove).multiplyScalar(Math.max(.03,cur.ci)); R.glowM.color.copy(cur.cove).multiplyScalar(cur.ci*.9);
    R.scM.color.setHex(0xffd2a0).multiplyScalar(cur.sc); R.pinM.color.setHex(0xffd9a8).multiplyScalar(.025+.6*cur.sc);
    R.lights.forEach(l=>{ l.intensity=1.1*cur.pt+.25*cur.ci; l.color.copy(cur.cove).lerp(tmpC.setHex(0xffd2a0),.6); });
    const tw=now/1000; R.stars.forEach((m,k)=>{ m.opacity=(L.stars?1:0)*cur.st*(.55+.45*Math.sin(tw*(.7+k*.37)+k*2.1)); });
    R.stepLed.emissiveIntensity=.18+.5*Math.min(1,cur.ci*2);
    // the picture's own light
    if(show&&!vid.paused&&ambOK&&now-ambAt>140){ ambAt=now; try{ ambX.drawImage(vid,0,0,4,4); const d=ambX.getImageData(0,0,4,4).data; let r=0,g=0,b=0; for(let i=0;i<64;i+=4){ r+=d[i]; g+=d[i+1]; b+=d[i+2]; }
        AMB.setRGB(r/4080,g/4080,b/4080); ambL=Math.max(.05,(r+g+b)/12240); }catch{ ambOK=false; } }
    cur.amb+=((show?(ambOK?ambL:.4):0)-cur.amb)*Math.min(1,dt*6);
    R.glow.color.copy(AMB); R.glow.intensity=1.1*cur.amb; R.glow2.color.copy(AMB); R.glow2.intensity=.35*cur.amb;
    // sound
    const shut=door&&!door.open, g=(L.mute?0:1)*(L.fs?1:inRoom?1:shut?0:Math.max(0,1-dOut/4)*.3)*L.vol*(vid.paused?0:1);
    if(ac&&gm){ gm.gain.setTargetAtTime(g,ac.currentTime,.12);
      const Ls=ac.listener, cp=camera.getWorldPosition(new THREE.Vector3()), fw=camera.getWorldDirection(new THREE.Vector3());
      if(Ls.positionX){ Ls.positionX.value=cp.x; Ls.positionY.value=cp.y; Ls.positionZ.value=cp.z; Ls.forwardX.value=fw.x; Ls.forwardY.value=fw.y; Ls.forwardZ.value=fw.z; Ls.upX.value=0; Ls.upY.value=1; Ls.upZ.value=0; }
      else if(Ls.setPosition){ Ls.setPosition(cp.x,cp.y,cp.z); Ls.setOrientation(fw.x,fw.y,fw.z,0,1,0); } }
    else vid.volume=Math.min(1,g);
    if(ac&&ac.state!=='running'&&L.want&&now-(R.acWarn||0)>15000){ R.acWarn=now; toast(NT('cine.tap'),5000); }
    // the bottle: in my hand, and in the hands of others who hold one
    const bi=window.__cineBt; if(bi!==fpIdx){ if(fpB){ fpB.parent&&fpB.parent.remove(fpB); fpB=null; } fpIdx=bi; if(bi>=0){ fpB=bottleOf(bi); fpB.position.set(0,.0,-.06); fpB.rotation.x=-.2; fpHands.rh.add(fpB); } }
    if(fpB){ const a=(now-sipAt)/1400; R.sipT=a>=0&&a<1?Math.sin(a*Math.PI):0; }
    for(const [,o] of others){ const want=o.p&&o.p.bt>=0?o.p.bt|0:-1; if(o.av.btI!==want){ if(o.av.bt){ o.av.g.remove(o.av.bt); o.av.bt=null; } o.av.btI=want; if(want>=0){ o.av.bt=bottleOf(want); o.av.bt.position.set(.24,.86,-.1); o.av.g.add(o.av.bt); } } }
    // the in-room panel
    if(hud){ const on=inRoom&&VIEW.mode==='walk'; if(hud.on!==on){ hud.on=on; hud.el.style.display=on?'block':'none'; } if(on&&now-hud.t>300){ hud.t=now; hudSync(); } }
    if(PANEL.el&&now-PANEL.t>250){ PANEL.t=now; tickPanel(); } if(fsBar&&L.fs&&now-PANEL.ft>250){ PANEL.ft=now; tickFs(); } });
  // ---- the in-room panel (bottom right): volume (yours), light (everyone's), the films, the bottle
  const hud={el:document.createElement('div'),on:false,t:0}; hud.el.id='cinehud';
  { const st=document.createElement('style'); st.textContent='#cinehud button:not([data-h=fold]){border:1px solid #d2c8b8;background:#fffdf8;color:#3f3a39;border-radius:3px;font-family:var(--f);cursor:pointer}#cinehud button:not([data-h=fold]):hover{background:#f6f1e6}#cinehud input[type=range]{accent-color:#6c848d}'; document.head.append(st); }
  hud.el.style.cssText='position:fixed;right:14px;bottom:76px;z-index:15;display:none;background:rgba(241,239,232,.94);color:#3f3a39;border:1px solid #d3cec3;border-radius:4px;padding:8px 10px;font:12px/1.6 var(--f);width:236px;pointer-events:auto;box-shadow:0 2px 10px rgba(0,0,0,.18)';
  hud.el.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center"><b data-h="title"></b><button data-h="fold" style="border:0;background:none;font:12px var(--f);color:#6e6866;cursor:pointer"></button></div>
    <div data-h="body"><div style="display:flex;align-items:center;gap:6px;margin-top:4px"><span data-h="vl" style="min-width:30px"></span><input data-h="vol" type="range" min="0" max="100" style="flex:1"><button data-h="mute" style="font-size:11px;padding:1px 6px"></button></div>
    <div style="display:flex;align-items:center;gap:6px"><span data-h="ll" style="min-width:30px"></span><input data-h="lv" type="range" min="0" max="100" style="flex:1"></div>
    <div data-h="sc" style="display:flex;flex-wrap:wrap;gap:4px;margin:4px 0"></div>
    <div style="display:flex;gap:4px;flex-wrap:wrap"><button data-h="films" style="font-size:11px;padding:1px 8px"></button><button data-h="stars" style="font-size:11px;padding:1px 8px"></button><button data-h="sip" style="font-size:11px;padding:1px 8px"></button><button data-h="back" style="font-size:11px;padding:1px 8px"></button></div></div>`;
  document.body.append(hud.el); hud.el.addEventListener('pointerdown',e=>e.stopPropagation()); hud.el.addEventListener('wheel',e=>e.stopPropagation());
  const H=k=>hud.el.querySelector(`[data-h="${k}"]`), scNames=()=>String(NT('cine.scenes')).split(/[,，、]/).map(s=>s.trim());
  SCENES.forEach((k,i)=>{ const b=document.createElement('button'); b.style.cssText='font-size:11px;padding:1px 7px'; b.dataset.s=k; b.onclick=()=>act({lt:k,lv:1}); H('sc').append(b); });
  H('vol').oninput=e=>{ L.vol=e.target.value/100; L.mute=false; try{ localStorage.setItem('cineVol',L.vol); }catch{} hudSync(); };
  H('mute').onclick=()=>{ L.mute=!L.mute; hudSync(); };
  let lvT=0; H('lv').oninput=e=>{ const v=e.target.value/50; S.lv=v; clearTimeout(lvT); lvT=setTimeout(()=>act({lv:v}),180); };
  H('films').onclick=()=>openCine(); H('stars').onclick=()=>{ L.stars=!L.stars; try{ localStorage.setItem('cineStars',L.stars?'1':'0'); }catch{} hudSync(); }; H('sip').onclick=()=>sip(); H('back').onclick=()=>putBack();
  H('fold').onclick=()=>{ L.hud=!L.hud; try{ localStorage.setItem('cineHud',L.hud?'1':'0'); }catch{} hudSync(); };
  addEventListener('keydown',e=>{ if(!L.inRoom||e.repeat||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return; if(e.key.toLowerCase()==='l'){ e.preventDefault(); H('fold').click(); } });
  function hudSync(){ H('title').textContent=NT('cine.title'); H('fold').textContent=L.hud?'－':'＋'; H('body').style.display=L.hud?'block':'none';
    H('vl').textContent=NT('cine.vol'); if(document.activeElement!==H('vol')) H('vol').value=Math.round(L.vol*100); H('mute').textContent=NT('cine.mute',L.mute?1:0);
    H('ll').textContent=NT('cine.light'); if(document.activeElement!==H('lv')) H('lv').value=Math.round(S.lv*50);
    const nm=scNames(); H('sc').querySelectorAll('button').forEach((b,i)=>{ b.textContent=nm[i]||b.dataset.s; b.style.background=b.dataset.s===S.lt?'#3f3a39':''; b.style.color=b.dataset.s===S.lt?'#f1efe8':''; });
    H('films').textContent=NT('cine.title',1)||NT('cine.title'); H('stars').textContent=NT('cine.stars',L.stars?0:1); const has=false; H('sip').style.display=H('back').style.display=has?'':'none'; H('sip').textContent=NT('cine.sip',0); H('back').textContent=NT('cine.sip',1); }
  // ---- the main panel: films, play/pause, skip, seek, volume, subtitles, full screen
  const PANEL={el:null,t:0,ft:0}, hms=s=>{ s=Math.max(0,Math.floor(s||0)); const h=Math.floor(s/3600), mm=Math.floor(s/60)%60, ss=s%60; return (h?h+':'+String(mm).padStart(2,'0'):mm)+':'+String(ss).padStart(2,'0'); };
  function openCine(){ const btn='style="margin:3px 6px 3px 0"';
    const body=openPanel(NT('cine.title'),`<p class="meta" id="cnow"></p>
      <div id="clist" style="display:flex;flex-direction:column;gap:4px;margin:8px 0 12px">${FILMS.length?FILMS.map((f,i)=>`<button class="btn" data-i="${i}" style="text-align:left">${esc(f.title)}</button>`).join(''):`<p class="meta">${esc(NT('cine.none'))}</p>`}</div>
      <div><button class="btn pri" id="cplay" ${btn}></button><button class="btn" id="cback" ${btn}>${esc(NT('cine.skip',0))}</button><button class="btn" id="cfwd" ${btn}>${esc(NT('cine.skip',1))}</button><button class="btn" id="cstop" ${btn}>${esc(NT('cine.stop'))}</button></div>
      <div style="display:flex;align-items:center;gap:8px;margin:10px 0"><span id="ct0" style="font-size:12px;min-width:44px">0:00</span><input id="cseek" type="range" min="0" max="1000" value="0" style="flex:1"><span id="ct1" style="font-size:12px;min-width:44px">0:00</span></div>
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><button class="btn" id="csubs"></button><button class="btn" id="cfull">${esc(NT('cine.full',0))}</button></div><p class="meta" id="cerr" style="color:#a8343a"></p>`);
    PANEL.el=body;
    body.querySelectorAll('#clist button').forEach(b=>b.onclick=()=>{ const f=FILMS[+b.dataset.i]; act({u:f.url,ti:f.title,sb:f.subs,p:true,t:0,lt:'film',lv:1}); toast(NT('cine.toast',0)+'《'+f.title+'》'); });
    body.querySelector('#cplay').onclick=()=>{ if(!S.u){ if(FILMS[0]){ const f=FILMS[0]; act({u:f.url,ti:f.title,sb:f.subs,p:true,t:0,lt:'film',lv:1}); } return; } play(!S.p); };
    body.querySelector('#cback').onclick=()=>S.u&&act({t:Math.max(0,pos()-10)});
    body.querySelector('#cfwd').onclick=()=>S.u&&act({t:Math.min((vid.duration||1e9)-.5,pos()+10)});
    body.querySelector('#cstop').onclick=()=>S.u&&act({u:'',ti:'',sb:'',p:false,t:0,lt:'welcome',lv:1});
    const sk=body.querySelector('#cseek'); sk.oninput=()=>{ PANEL.drag=true; body.querySelector('#ct0').textContent=hms(sk.value/1000*(vid.duration||0)); };
    sk.onchange=()=>{ PANEL.drag=false; if(S.u&&vid.duration) act({t:sk.value/1000*vid.duration}); };
    body.querySelector('#csubs').onclick=()=>{ L.subs=!L.subs; try{ localStorage.setItem('cineSubs',L.subs?'1':'0'); }catch{} refresh(); };
    body.querySelector('#cfull').onclick=()=>{ closePanel(); enterFs(); };
    unlockAudio(); refresh(); }
  function openFridge(){ const nm=names(); const body=openPanel(NT('cine.fridge',0),`<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px">${DR.map((d,i)=>`<button class="btn" data-d="${i}" style="text-align:left"><span style="display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:6px;background:#${d.c.toString(16).padStart(6,'0')}"></span>${esc(nm[i]||'')}</button>`).join('')}</div>`);
    body.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{ takeDrink(+b.dataset.d); closePanel(); }); }
  function tickPanel(){ const b=PANEL.el; if(b&&!b.querySelector('#cseek')) PANEL.el=null; if(!PANEL.el) return; const d=vid.duration||0, p=Math.min(pos(),d||pos());
    if(!PANEL.drag){ b.querySelector('#ct0').textContent=hms(p); b.querySelector('#cseek').value=d?Math.round(p/d*1000):0; } b.querySelector('#ct1').textContent=hms(d); }
  function refresh(){ if(PANEL.el&&!PANEL.el.querySelector('#cseek')) PANEL.el=null; const b=PANEL.el; if(b){ b.querySelector('#cnow').textContent=S.u?(NT('cine.now',S.p?0:1)+'《'+S.ti+'》'):NT('cine.idle');
      b.querySelector('#cplay').textContent=NT('cine.play',S.u&&S.p?1:0); b.querySelector('#csubs').textContent=NT('cine.subs',L.subs?0:1); b.querySelector('#cerr').textContent=L.err;
      b.querySelectorAll('#clist button').forEach(x=>x.classList.toggle('pri',FILMS[+x.dataset.i]&&FILMS[+x.dataset.i].url===S.u)); tickPanel(); }
    if(fsBar) tickFs(); if(hud.on) hudSync(); }
  // ---- full screen: the same video, filling the window; Esc to come back
  let fsBox=null, fsSub=null, fsBar=null;
  function enterFs(){ if(!S.u){ toast(NT('cine.idle')); return; } unlockAudio();
    if(!fsBox){ fsBox=document.createElement('div'); fsBox.style.cssText='position:fixed;inset:0;z-index:90;background:#000;display:none';
      fsSub=document.createElement('div'); fsSub.style.cssText='position:absolute;left:5%;right:5%;bottom:9%;text-align:center;color:#fff;font:600 clamp(18px,3.2vw,40px)/1.35 "Noto Sans TC","Noto Serif TC",sans-serif;text-shadow:0 0 6px #000,0 0 3px #000;white-space:pre-line;pointer-events:none';
      fsBar=document.createElement('div'); fsBar.style.cssText='position:absolute;left:0;right:0;bottom:0;display:flex;align-items:center;gap:10px;padding:10px 16px;background:linear-gradient(transparent,rgba(0,0,0,.75));color:#eee;font-size:13px;transition:opacity .4s';
      fsBar.innerHTML=`<button class="btn" data-a="play"></button><span data-a="t0">0:00</span><input data-a="seek" type="range" min="0" max="1000" value="0" style="flex:1"><span data-a="t1">0:00</span><button class="btn" data-a="exit">${esc(NT('cine.full',1))}</button>`;
      fsBox.append(fsSub,fsBar); document.body.append(fsBox);
      const q=a=>fsBar.querySelector(`[data-a="${a}"]`);
      q('play').onclick=()=>play(!S.p);
      q('seek').oninput=()=>{ PANEL.fdrag=true; }; q('seek').onchange=()=>{ PANEL.fdrag=false; if(vid.duration) act({t:q('seek').value/1000*vid.duration}); };
      q('exit').onclick=exitFs; let hideT=0; fsBox.addEventListener('pointermove',()=>{ fsBar.style.opacity=1; clearTimeout(hideT); hideT=setTimeout(()=>{ if(L.fs) fsBar.style.opacity=0; },2800); });
      fsBox.addEventListener('dblclick',e=>{ if(e.target===vid) exitFs(); });
      document.addEventListener('fullscreenchange',()=>{ if(!document.fullscreenElement&&L.fs) exitFs(); });
      addEventListener('keydown',e=>{ if(!L.fs) return; if(e.key==='Escape'){ e.preventDefault(); exitFs(); } else if(e.key===' '){ e.preventDefault(); q('play').click(); } e.stopImmediatePropagation(); },true); }
    if(document.pointerLockElement) document.exitPointerLock(); fsBox.insertBefore(vid,fsSub); fsSub.textContent=L.subTx||''; fsBox.style.display='block'; L.fs=true; fsBar.style.opacity=1;
    try{ fsBox.requestFullscreen&&fsBox.requestFullscreen().catch(()=>{}); }catch{} tickFs(); }
  function exitFs(){ if(!L.fs) return; L.fs=false; fsBox.style.display='none'; park.append(vid); if(document.fullscreenElement) document.exitFullscreen().catch(()=>{}); }
  function tickFs(){ if(!fsBar) return; const q=a=>fsBar.querySelector(`[data-a="${a}"]`), d=vid.duration||0, p=Math.min(pos(),d||pos());
    q('play').textContent=NT('cine.play',S.p?1:0); q('t0').textContent=hms(p); q('t1').textContent=hms(d); if(!PANEL.fdrag) q('seek').value=d?Math.round(p/d*1000):0; }
  // ---- the network: others' choices, and handing the state over to someone who has just come in
  const snapFor=new Map();
  window.__cineHello=()=>send({o:'hi'});
  window.__cineRecv=(d,from)=>{ if(!d||d.k!=='cine') return;
    if(d.o==='hi'){ if(S.v===0) return; const ids=[...((NET.peers&&NET.peers.keys&&NET.peers.keys())||[])].filter(i=>i!==from).concat(MY_PID).sort(), rank=Math.max(0,ids.indexOf(MY_PID));
      clearTimeout(snapFor.get(from)); snapFor.set(from,setTimeout(()=>{ snapFor.delete(from); send(Object.assign(pack(),{for:from}),from); },150+rank*400+Math.random()*120)); return; }
    if(d.o==='st'){ if(d.for&&snapFor.has(d.for)){ clearTimeout(snapFor.get(d.for)); snapFor.delete(d.for); } if(d.for&&d.for!==MY_PID) return;
      if((d.v|0)>S.v||((d.v|0)===S.v&&String(d.id||'')>S.id)){ const was=S.u, wasP=S.p; take(d); if(!d.for&&(S.u!==was||S.p!==wasP)&&L.near) toast(S.u?(NT('cine.toast',S.p?0:1)+'《'+S.ti+'》'):NT('cine.idle'),3500); } } };
  window.__cineAct=u=>{ if(u.type==='cinescreen') openCine();
    else if(u.type==='cinefridge') openFridge();
    else if(u.type==='cineswitch'){ const i=(SCENES.indexOf(S.lt)+1)%SCENES.length; act({lt:SCENES[i],lv:1}); toast(NT('cine.light')+'：'+(scNames()[i]||SCENES[i]),2000); }
    return true; };
  window.__cine={S,L,FILMS,vid,openCine,openFridge,enterFs,exitFs,act,pos,play,takeDrink,sip,putBack};
}
// steam over the noodle pots and smoke from the chimney: a few soft sprites each
{ const sm=new THREE.SpriteMaterial({color:0xffffff,transparent:true,opacity:0,depthWrite:false,map:SOFT_TEX});
  for(let i=0;i<10;i++){ const s=new THREE.Sprite(sm.clone()); s.scale.set(.3,.3,1); scene.add(s); NOODLE_STEAM.s.push(s); MEAL_DYN.push(s); }
  DINE.smoke=[]; const sm2=new THREE.SpriteMaterial({color:0xd8d6d0,transparent:true,opacity:0,depthWrite:false,map:SOFT_TEX});
  for(let i=0;i<8;i++){ const s=new THREE.Sprite(sm2.clone()); s.scale.set(.5,.5,1); scene.add(s); DINE.smoke.push(s); MEAL_DYN.push(s); } }
NPC_DYN.push(...MEAL_DYN);
// 火師 carries the dishes on a tray
{ const n=NPC.huo, P=n.g.userData.parts; n.tray=npcTool('tray'); P.F.add(n.tray); n.tray.position.set(0,1.02,-.36); n.tray.visible=false; }
// who is sitting where at meals; the master's place is left for the master
SEAT_KIND.bath.hello=NT('bath.hello'); SEAT_KIND.wstool.hello=NT('wash.hello'); SEAT_KIND.wstool.status=()=>NT('bath.status'); SEAT_KIND.sauna.hello=SEAT_KIND.sauna2.hello=NT('sauna.hello'); SEAT_KIND.bath.status=SEAT_KIND.sauna.status=SEAT_KIND.sauna2.status=()=>NT('bath.status'); SEAT_KIND.wc.hello=NT('wc.hello'); SEAT_KIND.wc.status=()=>NT('wc.status'); SEAT_KIND.dine.hello=NT('dine.hello'); SEAT_KIND.dine.status=()=>NT('dine.status');
const DINE_SEAT={xu:DINE.seats[0].si,huo:DINE.seats[2].si,yu:DINE.seats[6].si,shui:DINE.seats[7].si,chun:DINE.seats[9].si,cai:DINE.seats[10].si};
window.__seatNpc=si=>{ for(const id in DINE_SEAT){ const n=NPC[id]; if(DINE_SEAT[id]===si&&n&&n.seated) return true; } return false; };

/* ---- the meal plan for each person, asked by npcPlan before the usual work ---- */
function mealSend(n,M){ n.meal=M.id; n.next=null; n.then=null; n.carry=n.id==='huo'?null:n.carry; const s=SEATS[DINE_SEAT[n.id]];
  npcGo(n,s.ap,m=>{ const P=seatPlace(s); npcPlace(m,{x:P.x,z:P.z},s.yaw); m.seated=true; m.act='eat'; m.busyUntil=M.endMs; }); }
function mealStand(n){ n.seated=false; const s=SEATS[DINE_SEAT[n.id]]; npcPlace(n,s.ap); }
window.__mealPlan=n=>{ const M=mealState();
  if(n.seated&&!(M.phase==='eat'&&n.meal===M.id)) mealStand(n);
  if(M.phase==='eat'){ if(n.meal!==M.id){ mealSend(n,M); return true; } if(n.seated){ n.act='eat'; n.busyUntil=M.endMs; return true; } }
  if(n.id!=='huo'||!M.phase||M.phase==='eat') return false;
  // 火師: cooking, carrying in, washing up
  const now=Date.now();
  if(M.phase==='cook'){ n.carry=null;
    if(M.k==='l'||M.k==='n'){ npcGo(n,NP.noodle,m=>{ npcFace(m,{x:47,z:m.z}); m.act='noodle'; m.busyUntil=Date.now()+9000; }); return true; }
    if(M.k==='d'&&(n.round=(n.round||0)+1)%2===0){ npcGo(n,NP.hob,m=>{ npcFace(m,{x:47,z:m.z}); m.act='stir'; m.busyUntil=Date.now()+9000; }); return true; }
    npcGo(n,NP.stove,m=>{ npcFace(m,{x:m.x,z:-4.5}); m.act=M.k==='b'?'steam':'cook'; m.busyUntil=Date.now()+9000; }); return true; }
  if(M.phase==='serve'){ if(n.carry==='dish'){ npcGo(n,NP.tableDrop,m=>{ npcFace(m,DINE); m.carry=null; m.act='unload'; m.busyUntil=Date.now()+1500; }); return true; }
    npcGo(n,NP.pass,m=>{ npcFace(m,{x:47,z:m.z}); m.carry='dish'; m.act='load'; m.busyUntil=Date.now()+1500; }); return true; }
  if(M.phase==='clear'){ n.carry=null; npcGo(n,NP.sink,m=>{ npcFace(m,{x:47,z:m.z}); m.act='wash'; m.busyUntil=Date.now()+12000; }); return true; }
  return false; };

// {% endraw %}
