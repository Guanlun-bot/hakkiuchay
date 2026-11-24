// {% raw %}
// ---- 帳房: 許總管's counter at the back of the 明間 between the cinema and the classroom. A long wooden counter faced with
//      stepped-corner panels (like an old 藥行 counter), a black rotary telephone that rings anyone in the house or any guest
//      online, a green banker's lamp, the open ledger (what really happened today), an abacus, a service bell and a vase of
//      the season's flowers and his nameplate; his armchair behind; along the back wall one cabinet from wall to wall.
var ZHANG={x0:18.0,x1:22.17,gx0:17.03,z0:21.85,z1:22.38,gate:null,top:.86,si:-1,lamp:null,keys:[],board:null,boardKey:'',hands:null,bellAt:0,bellWait:false};
{ const Z=ZHANG, M2=(c,r=.5,o={})=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:r},o)), cx=(Z.x0+Z.x1)/2, W=Z.x1-Z.x0, D=Z.z1-Z.z0, H=Z.top,
    wood=M2(0xa8683a,.55), woodD=M2(0x6e4122,.5), black=M2(0x141414,.25), brass=M2(0xb8924e,.3,{metalness:.8}), chrome=M2(0xd6d9db,.18,{metalness:.9}), BW=23.55;
  const T=k=>({type:k});
  // the counter: the panelled front is a drawn texture; top overhangs a little; a steel kick plate along the floor
  const panelTex=(pw,ph,n)=>textCanvas(Math.round(pw*340),Math.round(ph*340),(g,w,h)=>{ const grd=g.createLinearGradient(0,0,w,0); grd.addColorStop(0,'#9c5e33'); grd.addColorStop(.5,'#b06d3e'); grd.addColorStop(1,'#9a5c31'); g.fillStyle=grd; g.fillRect(0,0,w,h);
    for(let i=0;i<w;i+=3){ g.strokeStyle=`rgba(70,35,15,${.05+((i*37)%11)/110})`; g.beginPath(); g.moveTo(i,0); g.lineTo(i+((i*13)%7)-3,h); g.stroke(); }
    const pad=w/n*.09, pw2=w/n-pad*2, top=h*.1, ph2=h*.8, c=Math.min(pw2,ph2)*.12;
    for(let k=0;k<n;k++){ const x=k*w/n+pad, y=top, path=(o)=>{ const X=x+o, Y=y+o, Wd=pw2-2*o, Ht=ph2-2*o; g.beginPath(); g.moveTo(X+c,Y); g.lineTo(X+Wd-c,Y); g.lineTo(X+Wd-c,Y+c); g.lineTo(X+Wd,Y+c); g.lineTo(X+Wd,Y+Ht-c); g.lineTo(X+Wd-c,Y+Ht-c); g.lineTo(X+Wd-c,Y+Ht); g.lineTo(X+c,Y+Ht); g.lineTo(X+c,Y+Ht-c); g.lineTo(X,Y+Ht-c); g.lineTo(X,Y+c); g.lineTo(X+c,Y+c); g.closePath(); };
      g.lineWidth=5; g.strokeStyle='rgba(60,28,10,.75)'; path(0); g.stroke(); g.lineWidth=3; g.strokeStyle='rgba(235,180,120,.45)'; path(6); g.stroke(); g.lineWidth=2; g.strokeStyle='rgba(60,28,10,.35)'; path(12); g.stroke();
      g.fillStyle='rgba(60,28,10,.55)'; g.fillRect(k*w/n,0,3,h); } });
  const body=box(W,H-.1,D,wood,cx,(H-.1)/2+.06,(Z.z0+Z.z1)/2,scene,T('zdesk'));
  { const fr=new THREE.Mesh(new THREE.PlaneGeometry(W,H-.12),new THREE.MeshStandardMaterial({map:panelTex(W,H-.12,8),roughness:.55})); fr.position.set(cx,(H-.12)/2+.07,Z.z0-.004); fr.rotation.y=Math.PI; fr.userData=T('zdesk'); pickables.push(fr); scene.add(fr);
    for(const sx of [-1]){ const sd=new THREE.Mesh(new THREE.PlaneGeometry(D,H-.12),new THREE.MeshStandardMaterial({map:panelTex(D,H-.12,1),roughness:.55})); sd.position.set(cx+sx*(W/2+.004),(H-.12)/2+.07,(Z.z0+Z.z1)/2); sd.rotation.y=sx*Math.PI/2; sd.userData=T('zdesk'); pickables.push(sd); scene.add(sd); } }
  box(W+.08,.045,D+.1,woodD,cx,H-.022,(Z.z0+Z.z1)/2-.02,scene,T('zdesk'));
  box(W+.01,.07,.012,chrome,cx,.035,Z.z0-.008); box(.012,.07,D,chrome,Z.x0-.006,.035,(Z.z0+Z.z1)/2);
  OB(Z.x0-.04,Z.x1+.05,Z.z0-.05,Z.z1+.03);
  // the way in: one swing gate at the cinema end, counter-high, panelled like the front, hinged on the wall; it swings in
  // when anyone (you, a guest or one of the household) comes up to it, and falls shut behind them
  { const gw=Z.x0-Z.gx0-.02, pv=new THREE.Group(); pv.position.set(Z.gx0+.01,0,Z.z0+.03); scene.add(pv); const tag=T('zdesk');
    const leaf=box(gw,H-.16,.04,wood,gw/2,(H-.16)/2+.1,0,pv,tag); const lf=new THREE.Mesh(new THREE.PlaneGeometry(gw-.02,H-.2),new THREE.MeshStandardMaterial({map:panelTex(gw,H-.2,1),roughness:.55})); lf.position.set(gw/2,(H-.16)/2+.1,-.021); lf.rotation.y=Math.PI; lf.userData=tag; pickables.push(lf); pv.add(lf);
    box(gw+.02,.035,.07,woodD,gw/2,H-.045,0,pv,tag); for(const y of [.25,.7]) box(.03,.07,.05,brass,.02,y,0,pv);
    box(.05,H-.05,.06,woodD,Z.x0-.01,(H-.05)/2,Z.z0+.03,scene,tag);
    Z.gate={pv,a:0}; }
  const Y=H+.001;
  // the telephone: black, square-shouldered base, a nickel dial with ten finger holes and a stop, the handset in its cradle,
  // a coiled cord to the left; its dial toward the chair
  { const g=new THREE.Group(); g.position.set(18.45,Y,22.17); g.rotation.y=.35; scene.add(g); const tag=T('phone');
    const base=new THREE.Mesh(new THREE.CylinderGeometry(.075,.13,.1,4,1),black); base.rotation.y=Math.PI/4; base.scale.set(1,1,.8); base.position.y=.05; g.add(base);
    box(.2,.016,.17,black,0,.008,0,g); const neck=new THREE.Mesh(new THREE.CylinderGeometry(.03,.045,.06,4),black); neck.rotation.y=Math.PI/4; neck.position.y=.13; g.add(neck);
    for(const sx of [-1,1]) box(.022,.035,.04,black,sx*.07,.17,0,g);
    const dial=new THREE.Group(); dial.position.set(0,.065,.072); dial.rotation.x=-.62; g.add(dial);
    const dd=new THREE.Mesh(new THREE.CylinderGeometry(.052,.052,.008,28),M2(0xc7c2b4,.3,{metalness:.8})); dd.rotation.x=Math.PI/2; dial.add(dd);
    for(let i=0;i<10;i++){ const a=-.9+i*.53, h=new THREE.Mesh(new THREE.CircleGeometry(.0085,12),black); h.position.set(Math.cos(a)*.036,Math.sin(a)*.036,.0045); dial.add(h); }
    const em=new THREE.Mesh(new THREE.CircleGeometry(.017,18),M2(0x9a8a62,.35,{metalness:.7})); em.position.z=.005; dial.add(em);
    const stop=new THREE.Mesh(new THREE.BoxGeometry(.008,.02,.01),M2(0xc7c2b4,.3,{metalness:.8})); stop.position.set(.046,-.032,.008); stop.rotation.z=.6; dial.add(stop);
    const hs=new THREE.Group(); hs.position.set(0,.205,0); g.add(hs);
    const bar=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-.1,-.01,0),new THREE.Vector3(0,.022,0),new THREE.Vector3(.1,-.01,0)]),16,.016,8),black); hs.add(bar);
    for(const sx of [-1,1]){ const cup=new THREE.Mesh(new THREE.CylinderGeometry(.034,.026,.05,16),black); cup.position.set(sx*.105,-.03,0); cup.rotation.z=sx*.25; hs.add(cup); }
    const pts=[]; for(let i=0;i<=120;i++){ const t=i/120, a=t*Math.PI*2*16; pts.push(new THREE.Vector3(-.13-t*.1+Math.cos(a)*.008,.01+Math.sin(a)*.008,-.02+t*.06+Math.sin(t*3)*.02)); }
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),240,.0025,4),black));
    const cord2=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-.09,.03,-.05),new THREE.Vector3(-.13,.015,-.03),new THREE.Vector3(-.13,.01,-.02)]),8,.0025,4),black); g.add(cord2);
    g.traverse(o=>{ if(o.isMesh){ o.userData=tag; pickables.push(o); } }); Z.phone=g; Z.handset=hs; }
  // the abacus
  { const g=new THREE.Group(); g.position.set(18.97,Y,22.2); g.rotation.y=Math.PI; scene.add(g); const tag=T('abacus'), fw=M2(0x3a2414,.5), bead=M2(0x2a1a10,.35);
    for(const z of [-.075,.075]) box(.4,.022,.014,fw,0,.011,z,g); for(const x of [-.2,.2]) box(.014,.022,.164,fw,x,.011,0,g); box(.4,.022,.01,fw,0,.011,-.035,g);
    const n=13, B=new THREE.InstancedMesh(new THREE.SphereGeometry(.011,8,6),bead,n*7), m4=new THREE.Matrix4(); let k=0;
    for(let i=0;i<n;i++){ const x=-.18+i*.03, rod=new THREE.Mesh(new THREE.CylinderGeometry(.002,.002,.15,4),brass); rod.rotation.x=Math.PI/2; rod.position.set(x,.012,0); g.add(rod);
      for(let j=0;j<2;j++){ m4.makeScale(1,.7,1.25); m4.setPosition(x,.012,-.066+j*.016+((i*7)%3===0?.012:0)); B.setMatrixAt(k++,m4); }
      for(let j=0;j<5;j++){ m4.makeScale(1,.7,1.25); m4.setPosition(x,.012,-.018+j*.018+((i*5)%4===0&&j===0?-.01:0)); B.setMatrixAt(k++,m4); } }
    B.instanceMatrix.needsUpdate=true; g.add(B); g.traverse(o=>{ if(o.isMesh){ o.userData=tag; pickables.push(o); } }); }
  // the ledger: open, ruled in red, columns of writing; a brush on its rest
  { const g=new THREE.Group(); g.position.set(19.6,Y,22.18); scene.add(g); const tag=T('ledger');
    const pageT=textCanvas(256,320,(c,w,h)=>{ c.fillStyle='#efe4c8'; c.fillRect(0,0,w,h); c.strokeStyle='rgba(170,50,40,.6)'; c.lineWidth=1.5; c.strokeRect(14,18,w-28,h-36);
      for(let x=14+22;x<w-14;x+=22){ c.beginPath(); c.moveTo(x,18); c.lineTo(x,h-18); c.stroke(); }
      c.fillStyle='rgba(30,22,16,.78)'; for(let x=20;x<w-30;x+=22){ let y=26; const n=4+((x*7)%9); for(let i=0;i<n;i++){ const hh=8+((x+i*13)%7); c.fillRect(x+3+((i*5)%4),y,10,hh*.35); c.fillRect(x+6,y,3,hh); y+=hh+6; if(y>h-30) break; } } });
    const pm=new THREE.MeshStandardMaterial({map:pageT,roughness:.9});
    for(const sx of [-1,1]){ const p=new THREE.Mesh(new THREE.BoxGeometry(.2,.012,.27),[M2(0xe6dbbf,.9),M2(0xe6dbbf,.9),pm,M2(0xe6dbbf,.9),M2(0xe6dbbf,.9),M2(0xe6dbbf,.9)]); p.position.set(sx*.101,.012,0); p.rotation.z=-sx*.04; g.add(p);
      box(.21,.006,.28,M2(0x2c3a52,.6),sx*.104,.003,0,g); }
    const rest=box(.08,.012,.016,M2(0x5a5a54,.4),.27,.006,.06,g); const br=new THREE.Mesh(new THREE.CylinderGeometry(.005,.005,.2,8),M2(0x7a5a34,.5)); br.rotation.z=Math.PI/2; br.position.set(.27,.016,.07); g.add(br);
    const tip=new THREE.Mesh(new THREE.ConeGeometry(.007,.03,8),M2(0x1a1612,.6)); tip.rotation.z=Math.PI/2; tip.position.set(.155,.016,.07); g.add(tip);
    g.traverse(o=>{ if(o.isMesh){ o.userData=tag; pickables.push(o); } }); }
  // the banker's lamp: brass foot and stem, a green cased-glass shade, a pull chain
  { const g=new THREE.Group(); g.position.set(20.3,Y,22.24); scene.add(g); const tag=T('dlamp');
    const ft=new THREE.Mesh(new THREE.CylinderGeometry(.075,.085,.025,24),brass); ft.position.y=.012; g.add(ft); const st=new THREE.Mesh(new THREE.CylinderGeometry(.009,.009,.3,10),brass); st.position.y=.17; g.add(st);
    box(.02,.02,.06,brass,0,.32,-.02,g);
    const shadeM=M2(0x1f6b3e,.18,{emissive:0x0e3a20,emissiveIntensity:0}), inner=new THREE.MeshBasicMaterial({color:0x3a3a30,side:THREE.BackSide});
    const sh=new THREE.Mesh(new THREE.CylinderGeometry(.075,.075,.34,24,1,true,0,Math.PI),shadeM); sh.rotation.z=Math.PI/2; sh.rotation.y=0; sh.position.set(0,.34,-.02); sh.scale.set(1,1,.85); g.add(sh);
    const shIn=new THREE.Mesh(new THREE.CylinderGeometry(.073,.073,.338,24,1,true,0,Math.PI),inner); shIn.rotation.copy(sh.rotation); shIn.position.copy(sh.position); shIn.scale.copy(sh.scale); g.add(shIn);
    for(const sx of [-1,1]){ const cap=new THREE.Mesh(new THREE.CircleGeometry(.075,24,0,Math.PI),brass); cap.position.set(sx*.171,.34,-.02); cap.rotation.y=sx*Math.PI/2; cap.rotation.z=Math.PI/2*sx; cap.scale.set(1,.85,1); g.add(cap); }
    const bulb=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,.28,8),new THREE.MeshBasicMaterial({color:0x5a5040})); bulb.rotation.z=Math.PI/2; bulb.position.set(0,.31,-.02); g.add(bulb);
    const ch=new THREE.Mesh(new THREE.CylinderGeometry(.0015,.0015,.12,4),brass); ch.position.set(.09,.24,.02); g.add(ch); const kn=new THREE.Mesh(new THREE.SphereGeometry(.008,8,6),brass); kn.position.set(.09,.18,.02); g.add(kn);
    const lt=new THREE.PointLight(0xffd9a0,0,2.6,2); lt.position.set(0,.26,0); g.add(lt);
    g.traverse(o=>{ if(o.isMesh){ o.userData=tag; pickables.push(o); } }); Z.lamp={shadeM,bulb,lt}; }
  // the service bell, at the front edge for guests
  { const g=new THREE.Group(); g.position.set(20.0,Y,21.97); scene.add(g); const tag=T('dbell');
    const b=new THREE.Mesh(new THREE.CylinderGeometry(.045,.05,.014,20),black); b.position.y=.007; g.add(b);
    const dome=new THREE.Mesh(new THREE.SphereGeometry(.042,20,10,0,Math.PI*2,0,Math.PI/2),chrome); dome.position.y=.014; g.add(dome);
    const pin=new THREE.Mesh(new THREE.CylinderGeometry(.004,.004,.02,8),chrome); pin.position.y=.065; g.add(pin); const kb=new THREE.Mesh(new THREE.SphereGeometry(.008,8,6),chrome); kb.position.y=.076; g.add(kb);
    g.traverse(o=>{ if(o.isMesh){ o.userData=tag; pickables.push(o); } }); }
  // flowers of the season in a big green glass bottle at the counter's end
  { const g=new THREE.Group(); g.position.set(20.82,Y,22.2); scene.add(g); const tag=T('dvase');
    const prof=[[0,0],[.07,0],[.105,.04],[.12,.12],[.115,.2],[.08,.26],[.035,.29],[.025,.33],[.03,.345]].map(([r,y])=>new THREE.Vector2(r,y));
    g.add(new THREE.Mesh(new THREE.LatheGeometry(prof,28),new THREE.MeshStandardMaterial({color:0x2f8a4a,roughness:.08,metalness:.1,transparent:true,opacity:.7})));
    const mo=(new Date(Date.now()+8*3600e3)).getUTCMonth()+1, sea=mo===12||mo<=2?'w':mo<=5?'sp':mo<=8?'su':'au', twig=M2(0x4a3626,.8);
    const stem=(a,len,tilt,mat)=>{ const s=new THREE.Group(); s.position.set(0,.33,0); s.rotation.set(Math.sin(a)*tilt,0,-Math.cos(a)*tilt); g.add(s); const c=new THREE.Mesh(new THREE.CylinderGeometry(.004,.007,len,5),mat||twig); c.position.y=len/2; s.add(c); return {s,len}; };
    if(sea==='w'||sea==='sp'){ const fl=sea==='w'?M2(0xf8e8ec,.7):M2(0xe0508a,.7), core=M2(sea==='w'?0xd8a0a8:0xb8306a,.7);
      for(let i=0;i<6;i++){ const {s,len}=stem(i*1.1,.35+((i*7)%5)*.08,.25+((i*3)%4)*.12); for(let j=0;j<(sea==='w'?7:4);j++){ const f=new THREE.Mesh(new THREE.SphereGeometry(sea==='w'?.012:.03,8,6),j%3?fl:core); f.position.set(((j*5)%3-1)*.02,len*(.35+j*.09),((j*7)%3-1)*.02); f.scale.y=.7; s.add(f); } } }
    if(sea==='su'){ const lf=M2(0x3e7a3a,.7,{side:THREE.DoubleSide}), pod=M2(0x6a8a4a,.6);
      for(let i=0;i<3;i++){ const {s,len}=stem(i*2.1,.4+i*.1,.18,M2(0x5a7a3a,.7)); const l=new THREE.Mesh(new THREE.CircleGeometry(.11,16),lf); l.position.y=len; l.rotation.x=-1.2; s.add(l); }
      for(let i=0;i<2;i++){ const {s,len}=stem(1+i*2.4,.5,.12,M2(0x5a7a3a,.7)); const p=new THREE.Mesh(new THREE.CylinderGeometry(.03,.018,.035,12),pod); p.position.y=len; s.add(p); } }
    if(sea==='au'){ const pl=M2(0xe8dcc0,.9);
      for(let i=0;i<7;i++){ const {s,len}=stem(i*.9,.55+((i*5)%4)*.07,.1+((i*3)%4)*.08,M2(0xb8a878,.8)); const p=new THREE.Mesh(new THREE.ConeGeometry(.02,.16,6),pl); p.position.y=len+.04; p.rotation.z=.3; s.add(p); } }
    g.traverse(o=>{ if(o.isMesh){ o.userData=tag; pickables.push(o); } }); }
  // his armchair behind the counter (a seat: when he is out, a guest may sit and use the phone)
  { const cx=19.6, g=new THREE.Group(); g.position.set(cx,0,22.86); scene.add(g); const si=addSeat(cx,22.86,0,'zhang'); SEATS[si].ap={x:cx-.78,z:22.8}; Z.si=si; const tag={type:'seat',si};
    const cw=M2(0x5a3220,.45); box(.5,.05,.46,cw,0,.46,0,g,tag); for(const [x,z] of [[-.22,-.2],[.22,-.2],[-.22,.2],[.22,.2]]) box(.04,.46,.04,cw,x,.23,z,g,tag);
    box(.5,.5,.04,cw,0,.73,.21,g,tag); for(const sx of [-1,1]){ box(.04,.22,.4,cw,sx*.25,.6,0,g,tag); box(.06,.03,.44,cw,sx*.25,.72,-.01,g,tag); }
    box(.42,.04,.38,M2(0x7a2a24,.8),0,.5,0,g,tag); }
  // the back wall: one cabinet from wall to wall, up to about two metres — drawers below, a ledge, glass-fronted shelves
  // of jars, tins and ledgers above, a carved fretwork valance and a cornice on top (after an old 藥行's back cabinet)
  { const X0=17.03, X1=22.17, CW=X1-X0, ccx=(X0+X1)/2, D=.34, zb=BW-D/2, tag=T('zcab'), H1=.9, H2=1.86;
    const drawT=textCanvas(1024,192,(g,w,h)=>{ g.fillStyle='#93582f'; g.fillRect(0,0,w,h); const cols=16, rows=3; for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){ const x=c*w/cols, y=r*h/rows; g.fillStyle='rgba(40,18,6,.55)'; g.fillRect(x,y,3,h/rows); g.fillRect(x,y,w/cols,3); g.strokeStyle='rgba(235,180,120,.3)'; g.lineWidth=2; g.strokeRect(x+7,y+7,w/cols-14,h/rows-14); g.fillStyle='#d6ae68'; g.beginPath(); g.arc(x+w/cols/2,y+h/rows/2,4.5,0,6.3); g.fill(); } });
    box(CW,H1-.06,D,wood,ccx,(H1-.06)/2+.06,zb,scene,tag); box(CW,.06,D-.04,woodD,ccx,.03,zb+.02);
    { const f=new THREE.Mesh(new THREE.PlaneGeometry(CW-.04,H1-.1),new THREE.MeshStandardMaterial({map:drawT,roughness:.55})); f.position.set(ccx,(H1-.1)/2+.07,BW-D-.003); f.rotation.y=Math.PI; f.userData=tag; pickables.push(f); scene.add(f); }
    box(CW+.02,.045,D+.08,woodD,ccx,H1+.02,zb-.04,scene,tag);
    // the upper case: back panel, posts dividing five bays, two shelves, glass doors
    const UD=.28, uz=BW-UD/2, bays=5, bw=CW/bays;
    box(CW,H2-H1,.02,M2(0x3a2414,.7),ccx,(H1+H2)/2,BW-.012,scene,tag);
    for(let i=0;i<=bays;i++) box(.06,H2-H1,UD,wood,X0+i*bw,(H1+H2)/2,uz,scene,tag);
    for(const y of [1.24,1.55]) box(CW,.025,UD-.02,woodD,ccx,y,uz,scene,tag);
    box(CW,.06,UD+.02,wood,ccx,H2-.03,uz,scene,tag);
    const glass=new THREE.MeshStandardMaterial({color:0xdfe8ea,transparent:true,opacity:.14,roughness:.05,metalness:.2,depthWrite:false});
    for(let i=0;i<bays;i++){ const gl=new THREE.Mesh(new THREE.PlaneGeometry(bw-.08,H2-H1-.1),glass); gl.position.set(X0+(i+.5)*bw,(H1+H2)/2,BW-UD-.004); gl.rotation.y=Math.PI; scene.add(gl);
      box(.012,H2-H1-.1,.012,woodD,X0+(i+.5)*bw,(H1+H2)/2,BW-UD-.008,scene,tag); }
    // every shelf full of ledgers: bound in indigo, brown and black cloth, upright with paper labels on the spines, now and
    // then a few lying flat
    const IMs={book:new THREE.InstancedMesh(new THREE.BoxGeometry(.034,.22,.2),new THREE.MeshStandardMaterial({roughness:.85}),600),lab:new THREE.InstancedMesh(new THREE.PlaneGeometry(.022,.07),new THREE.MeshStandardMaterial({color:0xefe6cf,roughness:.9}),600),
      flat:new THREE.InstancedMesh(new THREE.BoxGeometry(.2,.032,.26),new THREE.MeshStandardMaterial({roughness:.85}),120)};
    const m4=new THREE.Matrix4(), q=new THREE.Quaternion(), v=new THREE.Vector3(), sc=new THREE.Vector3(1,1,1), cnt={book:0,lab:0,flat:0}, col=new THREE.Color(), BC=[0x23314d,0x2c3a52,0x4a2c1e,0x5a3420,0x1e1e1e,0x34405a,0x3a2a22];
    let sd=11; const rnd=()=>{ sd=(sd*16807)%2147483647; return sd/2147483647; };
    for(let i=0;i<bays;i++) for(const y of [H1+.045,1.253,1.563]){ let x=X0+i*bw+.05; const xe=X0+(i+1)*bw-.05, z=uz+.02;
      while(x<xe-.04){ if(rnd()<.06&&xe-x>.24){ const n=2+Math.floor(rnd()*3); for(let j=0;j<n;j++){ m4.makeTranslation(x+.11,y+.016+j*.033,z); IMs.flat.setMatrixAt(cnt.flat,m4); IMs.flat.setColorAt(cnt.flat++,col.setHex(BC[(i+j)%BC.length])); } x+=.24; continue; }
        const h=.19+rnd()*.03, lean=x>xe-.1?-.06:0; q.setFromAxisAngle(new THREE.Vector3(0,0,1),lean); sc.set(1,h/.22,1); m4.compose(v.set(x+.017,y+h/2,z),q,sc); IMs.book.setMatrixAt(cnt.book,m4); IMs.book.setColorAt(cnt.book++,col.setHex(BC[Math.floor(rnd()*BC.length)]));
        q.setFromAxisAngle(new THREE.Vector3(0,1,0),Math.PI); sc.set(1,1,1); m4.compose(v.set(x+.017,y+h*.62,z-.101),q,sc); IMs.lab.setMatrixAt(cnt.lab++,m4); x+=.036; } }
    for(const k in IMs){ IMs[k].count=cnt[k]; IMs[k].instanceMatrix.needsUpdate=true; if(IMs[k].instanceColor) IMs[k].instanceColor.needsUpdate=true; IMs[k].userData=tag; pickables.push(IMs[k]); scene.add(IMs[k]); }
    // the carved valance and the cornice
    const fret=textCanvas(1024,64,(g,w,h)=>{ g.clearRect(0,0,w,h); g.strokeStyle='#8a5028'; g.lineWidth=7; g.strokeRect(4,4,w-8,h-8); g.lineWidth=5; for(let x=0;x<w;x+=64){ g.beginPath(); g.moveTo(x+8,h-12); g.lineTo(x+8,12); g.lineTo(x+56,12); g.lineTo(x+56,h-24); g.lineTo(x+22,h-24); g.lineTo(x+22,26); g.lineTo(x+42,26); g.stroke(); } });
    const val=new THREE.Mesh(new THREE.PlaneGeometry(CW,.12),new THREE.MeshStandardMaterial({map:fret,transparent:true,alphaTest:.3,roughness:.6,side:THREE.DoubleSide})); val.position.set(ccx,H2-.12,BW-UD-.01); val.rotation.y=Math.PI; val.userData=tag; pickables.push(val); scene.add(val);
    box(CW+.06,.07,UD+.08,woodD,ccx,H2+.035,uz-.04,scene,tag); box(CW+.1,.03,UD+.12,wood,ccx,H2+.085,uz-.06,scene,tag);
    OB(X0,X1,BW-D-.06,BW+.05);
    // the clock on the wall over the cabinet, an old pendulum wall clock: a dark wooden case with a broken-scroll crest and
    // a brass finial, a cornice, two turned columns with brass caps, a round brass bezel and cream dial (Taipei time), a
    // window below where the brass pendulum medallion swings, and two chains with acorn weights
    { const g=new THREE.Group(); g.position.set(ccx,2.36,BW-.03); g.rotation.y=Math.PI; scene.add(g); const ctag=T('dclock'), cw=M2(0x3e2014,.45), brassA=M2(0xa08048,.35,{metalness:.75});
      const back=new THREE.Shape(); back.moveTo(-.2,.0); back.lineTo(-.2,.1); back.quadraticCurveTo(-.2,0,-.12,-.04); back.lineTo(.12,-.04); back.quadraticCurveTo(.2,0,.2,.1); back.lineTo(.2,.0); back.lineTo(.2,.6); back.lineTo(-.2,.6); back.closePath();
      const bg=new THREE.ExtrudeGeometry(back,{depth:.05,bevelEnabled:false}); g.add(new THREE.Mesh(bg,cw));
      const crest=new THREE.Shape(); crest.moveTo(-.24,0); crest.lineTo(-.22,.06); crest.quadraticCurveTo(-.16,.2,-.06,.2); crest.quadraticCurveTo(-.02,.16,-.04,.1); crest.quadraticCurveTo(0,.14,.04,.1); crest.quadraticCurveTo(.02,.16,.06,.2); crest.quadraticCurveTo(.16,.2,.22,.06); crest.lineTo(.24,0); crest.closePath();
      const cr=new THREE.Mesh(new THREE.ExtrudeGeometry(crest,{depth:.03,bevelEnabled:false}),cw); cr.position.set(0,.66,.01); g.add(cr);
      const fin=new THREE.Mesh(new THREE.LatheGeometry([[0,0],[.025,.01],[.03,.04],[.015,.07],[.012,.09],[0,.12]].map(([r,y])=>new THREE.Vector2(r,y)),12),brassA); fin.position.set(0,.8,.03); g.add(fin);
      box(.56,.04,.12,cw,0,.62,.06,g); box(.6,.025,.14,cw,0,.65,.06,g);
      for(const sx of [-1,1]){ const col=new THREE.Mesh(new THREE.LatheGeometry([[.022,0],[.03,.06],[.036,.25],[.03,.42],[.022,.48]].map(([r,y])=>new THREE.Vector2(r,y)),14),cw); col.position.set(sx*.235,.1,.08); g.add(col);
        for(const y of [.08,.58]){ const cap=new THREE.Mesh(new THREE.CylinderGeometry(.034,.03,.04,14),brassA); cap.position.set(sx*.235,y,.08); g.add(cap); } box(.09,.03,.1,cw,sx*.235,.065,.06,g); box(.06,.1,.06,cw,sx*.235,.0,.04,g); }
      const ring=new THREE.Mesh(new THREE.TorusGeometry(.13,.018,10,36),brassA); ring.position.set(0,.4,.055); g.add(ring);
      for(let i=0;i<12;i++){ const a=i/12*Math.PI*2, r=new THREE.Mesh(new THREE.SphereGeometry(.006,6,4),brassA); r.position.set(Math.sin(a)*.13,.4+Math.cos(a)*.13,.072); g.add(r); }
      const face=new THREE.Mesh(new THREE.CircleGeometry(.118,32),new THREE.MeshStandardMaterial({roughness:.6,map:textCanvas(256,256,(c,w,h)=>{ c.fillStyle='#efe5cc'; c.fillRect(0,0,w,h); c.strokeStyle='rgba(60,40,20,.5)'; c.lineWidth=2; c.beginPath(); c.arc(w/2,h/2,112,0,6.3); c.stroke(); c.fillStyle='#1e160e'; c.font='bold 30px serif'; c.textAlign='center'; c.textBaseline='middle'; for(let i=1;i<=12;i++){ const a=i/12*Math.PI*2; c.fillText(String(i),w/2+Math.sin(a)*90,h/2-Math.cos(a)*90); } for(let i=0;i<60;i++){ const a=i/60*Math.PI*2; c.fillRect(w/2+Math.sin(a)*118-1,h/2-Math.cos(a)*118-1,i%5?2:4,i%5?2:4); } })}));
      face.position.set(0,.4,.058); g.add(face);
      const glassC=new THREE.Mesh(new THREE.SphereGeometry(.12,24,8,0,Math.PI*2,0,.5),new THREE.MeshStandardMaterial({color:0xffffff,transparent:true,opacity:.12,roughness:.05,depthWrite:false})); glassC.rotation.x=Math.PI/2; glassC.position.set(0,.4,.03); g.add(glassC);
      const hand=(len,wd)=>{ const p=new THREE.Group(); p.position.set(0,.4,.062); g.add(p); const m=new THREE.Mesh(new THREE.BoxGeometry(wd,len,.004),black); m.position.y=len/2-.012; p.add(m); return p; };
      // the pendulum window and medallion
      const win=new THREE.Mesh(new THREE.CircleGeometry(.055,24),M2(0x1a0e08,.8)); win.position.set(0,.17,.052); g.add(win);
      const pend=new THREE.Group(); pend.position.set(0,.26,.056); g.add(pend); const rod=new THREE.Mesh(new THREE.CylinderGeometry(.003,.003,.08,5),brassA); rod.position.y=-.04; pend.add(rod);
      const med=new THREE.Mesh(new THREE.CylinderGeometry(.034,.034,.008,18),brassA); med.rotation.x=Math.PI/2; med.position.y=-.09; pend.add(med);
      const plq=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.006,14),brassA); plq.rotation.x=Math.PI/2; plq.scale.set(1.3,1,.8); plq.position.set(0,.05,.055); g.add(plq);
      // chains and acorn weights
      const acorn=new THREE.LatheGeometry([[0,0],[.008,.004],[.016,.03],[.018,.06],[.014,.08],[.006,.09],[0,.095]].map(([r,y])=>new THREE.Vector2(r,y)),12);
      for(const [x,len] of [[-.1,.14],[.1,.1]]){ const ch=new THREE.Mesh(new THREE.CylinderGeometry(.0025,.0025,len,4),brassA); ch.position.set(x,-.02-len/2,.04); g.add(ch); const w=new THREE.Mesh(acorn,brassA); w.rotation.x=Math.PI; w.position.set(x,-.02-len,.04); g.add(w); }
      for(const x of [-.05,.05]){ const ch=new THREE.Mesh(new THREE.CylinderGeometry(.002,.002,.09,4),brassA); ch.position.set(x,-.065,.04); g.add(ch); }
      ZHANG.hands={h:hand(.07,.012),m:hand(.1,.008),pend};
      g.traverse(o=>{ if(o.isMesh){ o.userData=ctag; pickables.push(o); } }); } }
  // a nameplate on the counter for guests to read: a dark wooden wedge, a gold face with a red double border, the title
  // small on the left and the name large (title and an optional second line from desk.title; the name from who.xu)
  { const g=new THREE.Group(); g.position.set(19.36,Y,21.95); scene.add(g); const tag=T('dplate'), L=.36, hgt=.09, dep=.1;
    const sh=new THREE.Shape(); sh.moveTo(-dep/2,0); sh.lineTo(dep/2,0); sh.lineTo(0,hgt); sh.closePath();
    const geo=new THREE.ExtrudeGeometry(sh,{depth:L,bevelEnabled:false}); geo.translate(0,0,-L/2); geo.rotateY(Math.PI/2);
    g.add(new THREE.Mesh(geo,M2(0x4a1a16,.45)));
    const t=textCanvas(512,128,(c,w,h)=>{ const gr=c.createLinearGradient(0,0,w,h); gr.addColorStop(0,'#c9a032'); gr.addColorStop(.5,'#f0d260'); gr.addColorStop(1,'#c49a2e'); c.fillStyle=gr; c.fillRect(0,0,w,h);
      for(let i=0;i<1600;i++){ c.fillStyle=`rgba(${i%2?255:120},${i%2?240:90},${i%2?180:20},.18)`; c.fillRect((i*137)%w,(i*71)%h,2,2); }
      c.strokeStyle='#a8282a'; c.lineWidth=3; c.strokeRect(10,10,w-20,h-20); c.lineWidth=1.5; c.strokeRect(17,17,w-34,h-34);
      c.fillStyle='#1a1410'; c.textBaseline='middle'; const title=String(NT('desk.title',0)||''), sub=String(NT('desk.title',1)||''), name=String(npcFull('xu')||'');
      c.font='bold 30px "Noto Serif TC",serif'; c.textAlign='left'; c.fillText(title,34,sub?h/2+4:h/2+14); if(sub){ c.font='bold 14px serif'; c.fillText(sub,34,h/2+30); }
      c.font='bold 60px "Noto Serif TC",serif'; c.textAlign='center'; c.fillText(name.split('').join(' '),350,h/2+2); });
    const pv=new THREE.Group(); pv.position.set(0,hgt/2,-dep/4); pv.rotation.x=Math.atan2(dep/2,hgt); g.add(pv);
    const f=new THREE.Mesh(new THREE.PlaneGeometry(L-.012,Math.hypot(dep/2,hgt)-.008),new THREE.MeshStandardMaterial({map:t,roughness:.35,metalness:.35})); f.rotation.y=Math.PI; f.position.z=-.0015; pv.add(f);
    g.traverse(o=>{ if(o.isMesh){ o.userData=tag; pickables.push(o); } }); }
}
// the seat behind the counter
SEAT_KIND.zhang={eye:1.16,pitch:-.28,front:true,sink:-.42,get label(){ return NT('zhang.label'); },get hello(){ return NT('zhang.hello'); },status:()=>NT('zhang.status')};
// what has happened today (kept in this browser): guests seen, films started, drinks and popcorn taken, laundry sent
const LEDGER={ get(){ const day=taipeiNow().day; let o=null; try{ o=JSON.parse(localStorage.getItem('hkLedger')||'null'); }catch{} if(!o||o.day!==day) o={day,guests:[],films:0,drinks:0,pop:0,laund:0}; return o; },
  set(o){ try{ localStorage.setItem('hkLedger',JSON.stringify(o)); }catch{} }, add(k){ const o=this.get(); o[k]=(o[k]||0)+1; this.set(o); } };
{ let filmOn=false, lastFilm=0, guestT=0;
  ZL_ANIM.push(dt=>{ const now=Date.now(); const busy=window.__cineBusy?window.__cineBusy():false; if(busy&&!filmOn&&now-lastFilm>30*60000){ LEDGER.add('films'); lastFilm=now; } filmOn=busy;
    if(now-guestT>10000){ guestT=now; const o=LEDGER.get(); let ch=false; const add=n=>{ n=String(n||'').trim(); if(n&&!o.guests.includes(n)&&o.guests.length<200){ o.guests.push(n); ch=true; } }; add(myName); for(const [,p] of others) add(p.p&&p.p.n); if(ch) LEDGER.set(o); } });
  const wrap=()=>{ const cd=window.__cineDrink; if(cd&&!cd.__led){ const t=cd.take; cd.take=i=>{ LEDGER.add('drinks'); return t(i); }; cd.__led=1; }
    const ca=window.__coolerAct; if(ca&&!ca.__led){ const f=u=>{ if(u&&u.type==='popcorn') LEDGER.add('pop'); return ca(u); }; f.__led=1; window.__coolerAct=f; }
    const la=window.__laundAct; if(la&&!la.__led){ const f=u=>{ const before=localStorage.getItem('hkLaundry'); const r=la(u); if(u&&u.type==='lddrop'&&localStorage.getItem('hkLaundry')!==before) LEDGER.add('laund'); return r; }; f.__led=1; window.__laundAct=f; } };
  wrap(); setTimeout(wrap,3000); }
function ledgerOpen(){ const T=taipeiNow(), d=new Date(T.day+'T12:00:00'), L=L8('ledger.labels'), U=L8('ledger.units'), o=LEDGER.get(), none=HT2('ledger.none');
  const meals=MEALS.filter(M=>M.k!=='n').map(M=>`${esc(MEALN[M.k])}　${esc(menuOf(T.dow,M.k)||'')}`).join('<br>');
  let wx=''; try{ wx=WX&&WX.label?WX.label+(WX.temp!=null?'　'+Math.round(WX.temp)+'°C':''):''; }catch{}
  const row=(k,v)=>`<tr><td style="white-space:nowrap;padding-right:1.2em;vertical-align:top">${esc(k||'')}</td><td>${v}</td></tr>`;
  const h=`<table style="line-height:2">${row(L[0],`${d.getFullYear()} 年 ${d.getMonth()+1} 月 ${d.getDate()} 日　${hhmm(Math.floor(T.min))}`)}${wx?row(L[1],esc(wx)):''}${row(L[2],meals)}`+
    row(L[3],o.guests.length?`${o.guests.length} ${esc(U[0]||'')}　<span class="meta">${esc(o.guests.slice(0,30).join('、'))}</span>`:esc(none))+row(L[4],o.films?o.films+' '+esc(U[1]||''):esc(none))+row(L[5],o.drinks?o.drinks+' '+esc(U[2]||''):esc(none))+
    row(L[6],o.pop?o.pop+' '+esc(U[3]||''):esc(none))+row(L[7],o.laund?o.laund+' '+esc(U[4]||''):esc(none))+`</table><h4>${esc(L[8]||'')}（${d.getMonth()+1} 月）</h4>`+acctHtml();
  openPanel(HT2('ledger.title'),h); }
// ---- the telephone: ring anyone in the house, or a guest online
function phoneRing(n){ try{ for(let i=0;i<n;i++){ noiseBurst(.35,2300,30,.04,i*.9); noiseBurst(.35,2500,30,.035,i*.9+.05); } }catch{} }
function phoneOpen(){ const fill=titleFill(); const staff=NPCS.map(x=>`<tr><td style="white-space:nowrap;padding-right:1em"><a href="#" data-pn="${x.id}">${esc(npcName(x.id))}</a></td><td class="meta">${esc(nState(NPC[x.id]))}</td></tr>`).join('');
  const peers=[]; for(const [,o] of others){ if(o.p&&typeof o.p.pid==='string') peers.push(o.p); }
  const pl=peers.length?peers.map((p,i)=>`<tr><td style="white-space:nowrap;padding-right:1em"><a href="#" data-pp="${i}">${esc(str(p.n,12)||'訪客')}</a></td><td class="meta">${esc(statusOf(p))}</td></tr>`).join(''):`<tr><td class="meta">${esc(HT2('phone.none'))}</td></tr>`;
  const S=L8('phone.staff'); const body=openPanel(HT2('phone.title'),`<p class="meta">${esc(HT2('phone.note'))}</p><h4>${esc(S[0]||'')}</h4><table>${staff}</table><h4>${esc(S[1]||'')}</h4><table>${pl}</table>`);
  body.querySelectorAll('[data-pn]').forEach(a=>a.onclick=e=>{ e.preventDefault(); closePanel(); phoneNpc(a.dataset.pn); });
  body.querySelectorAll('[data-pp]').forEach(a=>a.onclick=e=>{ e.preventDefault(); phoneGuest(peers[+a.dataset.pp]); }); }
function phoneNpc(id){ const k=NPC[id]; if(!k) return; const nm=npcName(id); toast(HF('phone.wait',{名:nm},0),2500); phoneRing(2);
  setTimeout(()=>{ if(k.lie||k.away){ toast(HT2('phone.sleep'),4000); return; }
    if(id==='xu'&&k.sSi===ZHANG.si){ npcSay('xu',HF('phone.self')); return; }
    npcSay(id,HF('phone.pick',{名:nm})); const B=L8('phone.btn'); if(k.ext){ npcChoices(id,[[B[1]||'',()=>{ npcSay(id,HF('phone.bye')); }]]); return; }
    npcChoices(id,[[B[0]||'',()=>{ const busy=!!(k.task||k.errand||k.lead||k.gather||k.follow), wait=busy?Math.min(90000,Math.max(8000,(k.busyUntil||0)-Date.now())):1200;
        npcSay(id,HF(busy?'phone.busy':'phone.come'));
        setTimeout(()=>{ if(k.lie) return; if(k.follow&&(id==='fu'||id==='lai')) callKid(id); doErrand(k,[{to:()=>({x:20.9,z:ZHANG.z0-.75}),face:()=>({x:19.6,z:22.8}),dur:45000,on:m=>{ npcSay(m.id,HF('phone.here')); }}]); },wait); }],
      [B[1]||'',()=>{ npcSay(id,HF('phone.bye')); }]]); },2000); }
function phoneGuest(p){ if(!p) return; const nm=str(p.n,12)||'訪客', M=L8('phone.msg');
  const body=openPanel(HT2('phone.title'),`<p>${esc(HF('phone.wait',{名:nm},0))}</p><p><input id="phMsg" maxlength="40" style="width:100%" placeholder="${esc(M[0]||'')}"></p><p><button id="phGo">${esc(M[1]||'')}</button></p>`);
  const go=()=>{ const msg=String(body.querySelector('#phMsg').value||'').slice(0,40); closePanel(); phoneRing(2); PHONE.out={pid:p.pid,nm,at:Date.now()};
    if(!NET.bcast||!NET.bcast({k:'phone',o:'call',to:p.pid,n:String(myName||'').slice(0,12),msg},p.pid)) toast(HF('phone.no',{名:nm},0),4000);
    setTimeout(()=>{ if(PHONE.out&&PHONE.out.pid===p.pid&&Date.now()-PHONE.out.at>=24000){ PHONE.out=null; toast(HF('phone.no',{名:nm},0),4000); } },25000); };
  body.querySelector('#phGo').onclick=go; body.querySelector('#phMsg').onkeydown=e=>{ e.stopPropagation(); if(e.key==='Enter') go(); }; }
const PHONE={out:null};
window.__phoneRecv=(d,from)=>{ if(!d||d.k!=='phone'||d.to!==MY_PID) return; const nm=str(d.n,12)||'訪客';
  if(d.o==='call'){ const s=SEATS[ME.seat]; if(s&&String(s.kind).startsWith('cine')){ NET.bcast&&NET.bcast({k:'phone',o:'re',r:'dnd',to:d.from||from,n:String(myName||'').slice(0,12)},d.from||from); return; }
    phoneRing(3); const I=L8('phone.in'); let done=false; const reply=r=>{ if(done) return; done=true; NET.bcast&&NET.bcast({k:'phone',o:'re',r,to:from,n:String(myName||'').slice(0,12)},from); };
    const body=openPanel(HF('phone.in',{名:nm},0),`<p><button id="phY">${esc(I[1]||'')}</button>　<button id="phN">${esc(I[2]||'')}</button></p>`);
    body.querySelector('#phY').onclick=()=>{ reply('ok'); openPanel(HF('phone.in',{名:nm},0),`<p class="meta">${esc(HF('phone.from',{名:nm},0))}</p><p style="font-size:1.2em;line-height:1.8">${esc(str(d.msg,40))}</p>`); };
    body.querySelector('#phN').onclick=()=>{ reply('no'); closePanel(); }; setTimeout(()=>{ if(!done){ reply('no'); } },22000); return; }
  if(d.o==='re'&&PHONE.out){ PHONE.out=null; toast(HF(d.r==='ok'?'phone.ok':d.r==='dnd'?'phone.dnd':'phone.no',{名:nm},0),4000); } };
// the counter's clicks
window.__zhangAct=u=>{ const k=u.type;
  if(k==='phone'){ phoneOpen(); return true; }
  if(k==='ledger'){ ledgerOpen(); return true; }
  if(k==='abacus'){ try{ for(let i=0;i<6;i++) noiseBurst(.03,3200+((i*7)%5)*300,8,.06,i*.09+((i%2)*.03)); }catch{} return true; }
  if(k==='dbell'){ try{ bell(); }catch{} const n=NPC.xu; if(!n) return true;
    if(n.sSi===ZHANG.si){ npcSay('xu',HF('bell.come')); return true; }
    if(n.lie||n.lead||n.gather||n.butler||n.errand||n.task){ toast(HF('bell.busy',{名:npcName('xu')},0),4000); return true; }
    ZHANG.bellWait=true; n.busyUntil=0; return true; }
  return false; };
// 許總管 at his counter: sits, writes, now and then the abacus; the lamp is on when he is there or after dark
ZL_ANIM.push(dt=>{ const Z=ZHANG, n=NPC.xu, at=n&&n.sSi===Z.si, T=taipeiNow();
  if(Z.gate){ const gx=(Z.gx0+Z.x0)/2, gz=Z.z0+.2, near=p=>p&&Math.abs(p.x-gx)<.75&&Math.abs(p.z-gz)<.85; let want=near(ME); if(!want) for(const id in NPC){ if(near(NPC[id])){ want=true; break; } } if(!want) for(const [,o] of others){ if(o.p&&near(o.p)){ want=true; break; } }
    Z.gate.a+=((want?1.45:0)-Z.gate.a)*Math.min(1,(dt||.016)*5); Z.gate.pv.rotation.y=-Z.gate.a; }
  if(Z.hands){ Z.hands.h.rotation.z=-(T.min%720)/720*Math.PI*2; Z.hands.m.rotation.z=-(T.min%60)/60*Math.PI*2; Z.hands.pend.rotation.z=Math.sin(performance.now()/1000*Math.PI)*.22; }
  if(Z.lamp){ const on=at||ME.seat===Z.si||SKY_DAY<.35; Z.lamp.lt.intensity=on?1.1:0; Z.lamp.shadeM.emissiveIntensity=on?.35:0; Z.lamp.bulb.material.color.setHex(on?0xfff2c8:0x5a5040); }
  if(at&&Math.hypot(ME.x-n.x,ME.z-n.z)<4&&Math.random()<dt/25){ try{ for(let i=0;i<5;i++) noiseBurst(.03,3000+i*170,8,.035,i*.11); }catch{} } });
// 阿春 brings drinks and snacks into the cinema: sit down in the cinema and after a little while she comes with a tray
// to your seat and asks what you would like (any of the twenty drinks, or popcorn); then not again for fifteen minutes
{ let since=0, chk=0;
  const free=n=>n&&!n.lie&&!n.errand&&!n.lead&&!n.gather&&!n.follow&&n.carry!=='cake'&&!n.seated;
  const inCine=()=>{ const s=SEATS[ME.seat]; return !!(s&&String(s.kind).startsWith('cine')); };
  ZL_ANIM.push(()=>{ const now=Date.now(); if(now-chk<2000) return; chk=now;
    if(!inCine()){ since=0; return; } if(!since) since=now; if(now-since<15000) return;
    let last=0; try{ last=+localStorage.getItem('hkCineServe')||0; }catch{} if(now-last<15*60000) return;
    const n=NPC.chun; if(!free(n)) return;
    try{ localStorage.setItem('hkCineServe',String(now)); }catch{}
    const si=ME.seat; n.carry='cake';
    doErrand(n,[{to:()=>{ const a=SEATS[si]&&SEATS[si].ap; return a?{x:a.x,z:a.z}:{x:CIN.xc,z:19.4}; },face:()=>ME,dur:40000,on:m=>{
      if(ME.seat!==si){ m.busyUntil=Date.now()+800; return; }
      npcSay('chun',HF('chun.cine')); const nm=window.__cineDrink?window.__cineDrink.names():[], B=L8('chun.cine.btn');
      const body=openPanel(HT2('chun.cine.title'),`<p class="meta">${esc(HT2('chun.cine.note'))}</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px">${nm.map((d,i)=>`<button class="btn" data-d="${i}">${esc(d)}</button>`).join('')}</div><p style="margin-top:10px"><button class="btn pri" id="ccPop">${esc(B[0]||'')}</button>　<button class="btn" id="ccNo">${esc(B[1]||'')}</button></p>`);
      const end=k=>{ closePanel(); npcSay('chun',HF(k)); m.busyUntil=Date.now()+1500; };
      body.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{ if(mySnack>=0) setSnack(-1); window.__cineDrink.take(+b.dataset.d); FOOD.biteK=''; end('chun.cine.thx'); });
      body.querySelector('#ccPop').onclick=()=>{ const i=SNACKS.findIndex(x=>x[2]==='popcorn'); if(i>=0){ setSnack(i); FOOD.biteK=''; LEDGER.add('pop'); } end('chun.cine.thx'); };
      body.querySelector('#ccNo').onclick=()=>end('chun.cine.no'); }}],m=>{ m.carry=null; }); }); }
Object.assign(aimLabels,(()=>{ const A=L8('zhang.aim'); return {phone:A[0]||'',ledger:A[1]||'',abacus:A[2]||'',dbell:A[3]||''}; })());
// {% endraw %}
