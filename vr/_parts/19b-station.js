// {% raw %}
// ==== 渡船頭站 — the station house, the platform and its stretch of the line (layout in STN, near LAND)
//      After an old white wooden station of the Japanese era: a grey tiled gable roof with a round window in each gable,
//      white boarded walls, a deep veranda on posts with diagonal braces on both long sides; a waiting room with benches and
//      the ticket window, the station office behind it; one platform, one track, no footbridge. The track runs through, over
//      level crossings at the dikes; beyond the fields the branch line goes on (19c) toward 斗安 one way and over 大陂溪 to
//      磺水嶺 the other. Everything is at the same true scale as the house.
const STNB={signal:null,chair:-1,benches:[]};
{ const S=STN, M=(c,r=.7,o={})=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:r},o)), TX=S.TX, Y=.9, H=3.2, T=k=>({type:k});
  const boardT=textCanvas(256,256,(g,w,h)=>{ const gr=g.createLinearGradient(0,0,w,0); gr.addColorStop(0,'#d9a766'); gr.addColorStop(.5,'#e3b475'); gr.addColorStop(1,'#d6a160'); g.fillStyle=gr; g.fillRect(0,0,w,h); for(let x=0;x<w;x+=32){ g.fillStyle='rgba(110,60,20,.28)'; g.fillRect(x,0,2,h); g.fillStyle='rgba(255,230,180,.25)'; g.fillRect(x+2,0,1,h); } for(let i=0;i<260;i++){ g.strokeStyle=`rgba(140,80,30,${.05+(i%7)/70})`; g.beginPath(); const x=(i*53)%w; g.moveTo(x,0); g.bezierCurveTo(x+6,h*.3,x-6,h*.6,x+3,h); g.stroke(); } });
  boardT.wrapS=boardT.wrapT=THREE.RepeatWrapping; boardT.repeat.set(2,2);
  const white=new THREE.MeshStandardMaterial({map:boardT,roughness:.7}), trim=M(0xa8693a,.55), pale=M(0xf1ead8,.6), glass=new THREE.MeshStandardMaterial({color:0xbfd2d8,roughness:.1,metalness:.2,transparent:true,opacity:.35,depthWrite:false}),
    stone=M(0x9c978d,.9), dark=M(0x3a3632,.8), floorM=M(0xb9a67e,.75), plat=M(0xa59a84,.95), rust=M(0x6a4a34,.7,{metalness:.3}), steel=M(0x8e8f8c,.45,{metalness:.7}), gravel=M(0x8c8476,1);
  const tileT=textCanvas(256,256,(g,w,h)=>{ g.fillStyle='#3f6a5c'; g.fillRect(0,0,w,h); const s2=32; for(let y=-s2;y<h+s2;y+=s2/2) for(let x=((y/(s2/2))%2?s2/2:0)-s2;x<w+s2;x+=s2){ const v=((x*7+y*13)%23)/23; g.fillStyle=`rgb(${62+v*22|0},${104+v*24|0},${90+v*18|0})`; g.beginPath(); g.moveTo(x,y-s2/2); g.lineTo(x+s2/2,y); g.lineTo(x,y+s2/2); g.lineTo(x-s2/2,y); g.closePath(); g.fill(); g.strokeStyle='rgba(20,40,34,.55)'; g.lineWidth=2; g.stroke(); } });
  tileT.wrapS=tileT.wrapT=THREE.RepeatWrapping; const tile=new THREE.MeshStandardMaterial({map:tileT,roughness:.75});
  const G=new THREE.Group(); scene.add(G);
  // ---- ground: the plaza and path (gravel), the station's stone base, the platform
  { const gp=(x0,x1,z0,z1,y,m)=>{ const p=new THREE.Mesh(new THREE.PlaneGeometry(x1-x0,z1-z0),m); p.rotation.x=-Math.PI/2; p.position.set((x0+x1)/2,y,(z0+z1)/2); p.userData={type:'floor'}; pickables.push(p); G.add(p); return p; };
    const gvT=textCanvas(256,256,(g,w,h)=>{ g.fillStyle='#a69b86'; g.fillRect(0,0,w,h); for(let i=0;i<2600;i++){ const v=120+((i*97)%90); g.fillStyle=`rgb(${v},${v-6},${v-18})`; g.fillRect((i*137)%w,(i*71)%h,2+(i%3),2); } }); gvT.wrapS=gvT.wrapT=THREE.RepeatWrapping; gvT.repeat.set(8,12);
    const gv=new THREE.MeshStandardMaterial({map:gvT,roughness:1});
    gp(-133,-123.2,-10,31,.02,gv); gp(-123.2,-106.8,-9.4,-5.6,.02,gv);
    box(S.HS.x1-S.HS.x0+.2,Y,S.HS.z1-S.HS.z0+.2,stone,(S.HS.x0+S.HS.x1)/2,Y/2,(S.HS.z0+S.HS.z1)/2,G);
    box(2.4,Y,15.4,stone,-124.4,Y/2,9.5,G); OB_STN(-125.6,-123.2,2,3.6); OB_STN(-125.6,-123.2,7.2,17);   // the raised veranda base: up only by the steps
    for(let i=0;i<4;i++) box(.6,(i+1)*.225,3.6,stone,-125.3+i*.6,(i+1)*.225/2,5.4,G,{type:'floor'});
    gp(S.HS.x0,S.HS.x1,S.HS.z0,S.HS.z1,Y+.005,floorM);
    box(S.PL.x1-S.PL.x0,Y,S.PL.z1-S.PL.z0,plat,(S.PL.x0+S.PL.x1)/2,Y/2,(S.PL.z0+S.PL.z1)/2,G,{type:'floor'});
    box(.3,.06,S.PL.z1-S.PL.z0,M(0xd8d2c4,.8),S.PL.x1-.15,Y+.03,(S.PL.z0+S.PL.z1)/2,G);   // the coping stones along the edge
  }
  function OB_STN(x0,x1,z0,z1){ S.OBS.push({x0,x1,z0,z1}); }
  // ---- walls with openings: along z at x (ops [z0,z1,y0,y1] above the floor) and along x at z
  const win=(g,w,h)=>{ box(w,h,.03,glass,0,0,0,g); for(const [ww,hh,xx,yy] of [[w+.12,.07,0,h/2],[w+.12,.07,0,-h/2],[.07,h,-w/2,0],[.07,h,w/2,0],[w,.035,0,h/6],[w,.035,0,-h/6],[.035,h,0,0]]) box(ww,hh,.06,trim,xx,yy,0,g); };
  const wallZ=(x,z0,z1,ops,t=.15)=>{ const cuts=[z0,...ops.flatMap(o=>[o[0],o[1]]),z1];
    for(let i=0;i<cuts.length;i+=2){ const a=cuts[i], b=cuts[i+1]; if(b-a>.01) box(t,H,b-a,white,x,Y+H/2,(a+b)/2,G,{type:'stnhouse'}); }
    for(const [a,b,y0,y1] of ops){ if(y0>0) box(t,y0,b-a,white,x,Y+y0/2,(a+b)/2,G); if(y1<H) box(t,H-y1,b-a,white,x,Y+(y1+H)/2,(a+b)/2,G); if(y0>0){ const g=new THREE.Group(); g.position.set(x,Y+(y0+y1)/2,(a+b)/2); g.rotation.y=Math.PI/2; G.add(g); win(g,b-a,y1-y0); } else { box(t+.04,.08,b-a+.1,trim,x,Y+y1+.04,(a+b)/2,G); } } };
  const wallX=(z,x0,x1,ops,t=.15)=>{ const cuts=[x0,...ops.flatMap(o=>[o[0],o[1]]),x1];
    for(let i=0;i<cuts.length;i+=2){ const a=cuts[i], b=cuts[i+1]; if(b-a>.01) box(b-a,H,t,white,(a+b)/2,Y+H/2,z,G,{type:'stnhouse'}); }
    for(const [a,b,y0,y1] of ops){ if(y0>0) box(b-a,y0,t,white,(a+b)/2,Y+y0/2,z,G); if(y1<H) box(b-a,H-y1,t,white,(a+b)/2,Y+(y1+H)/2,z,G); if(y0>0){ const g=new THREE.Group(); g.position.set((a+b)/2,Y+(y0+y1)/2,z); G.add(g); win(g,b-a,y1-y0); } } };
  const X0=S.HS.x0, X1=S.HS.x1, Z0=S.HS.z0, Z1=S.HS.z1;
  wallZ(X0+.075,Z0,Z1,[[2.6,3.8,1.0,2.4],[4.2,6.6,0,2.6],[7.4,9.4,1.0,2.4],[11.2,12.8,1.0,2.4],[14.2,15.8,1.0,2.4]]);          // north (the plaza side): the entrance
  wallZ(X1-.075,Z0,Z1,[[2.6,3.9,1.0,2.4],[4.6,6.2,0,2.4],[7.2,9.4,1.0,2.4],[11.4,13.4,1.0,2.4],[14.6,15.4,0,2.2]]);          // south (the platform): the ticket gate, the office door
  wallX(Z0+.075,X0,X1,[[-121.4,-120.0,1.0,2.4],[-118.4,-117.0,1.0,2.4]]); wallX(Z1-.075,X0,X1,[[-121.4,-120.0,1.0,2.4],[-118.4,-117.0,1.0,2.4]]);
  wallX(10.025,X0+.15,X1-.15,[[-121.5,-120.7,1.0,1.5]],.12);                                                                // the partition, with the ticket window
  OB_STN(X0,X0+.15,Z0,4.2); OB_STN(X0,X0+.15,6.6,Z1); OB_STN(X1-.15,X1,Z0,4.6); OB_STN(X1-.15,X1,6.2,14.6); OB_STN(X1-.15,X1,15.4,Z1); OB_STN(X0,X1,Z0,Z0+.15); OB_STN(X0,X1,Z1-.15,Z1); OB_STN(X0,X1,9.96,10.09);
  // wainscot and corner boards; a ceiling
  for(const [x,z0,z1] of [[X0-.01,Z0,Z1],[X1+.01,Z0,Z1]]) box(.04,.08,z1-z0,trim,x,Y+1.0,(z0+z1)/2,G);
  for(const [x,z] of [[X0,Z0],[X0,Z1],[X1,Z0],[X1,Z1]]) box(.2,H,.2,trim,x,Y+H/2,z,G);
  { const c=new THREE.Mesh(new THREE.PlaneGeometry(X1-X0,Z1-Z0),M(0xf3efe6,.9)); c.rotation.x=Math.PI/2; c.position.set((X0+X1)/2,Y+H-.02,(Z0+Z1)/2); G.add(c); }
  // ---- the roof: a grey tiled gable over the house, ridge along the line, round windows in the gables; lean-to verandas
  { const top=Y+H, half=(X1-X0)/2+.5, rise=2.3, cx=(X0+X1)/2, L=Z1-Z0+1.0, slope=Math.hypot(half,rise), a=Math.atan2(rise,half);
    for(const sx of [-1,1]){ const r=box(slope,.12,L,tile,cx+sx*half/2,top+rise/2,(Z0+Z1)/2,G,{type:'stnhouse'}); r.rotation.z=-sx*a; r.material.map.repeat.set(slope/1.2,L/1.2); }
    box(.3,.22,L+.1,M(0x2f5246,.6),cx,top+rise+.05,(Z0+Z1)/2,G);
    for(const z of [Z0-.45,Z1+.45]){ box(.35,.5,.25,M(0x2f5246,.6),cx,top+rise+.2,z,G); }
    for(const [z,sz] of [[Z0+.07,-1],[Z1-.07,1]]){ const sh=new THREE.Shape(); sh.moveTo(-half+.5,0); sh.lineTo(half-.5,0); sh.lineTo(0,rise-.25); sh.closePath();
      const gm=new THREE.Mesh(new THREE.ExtrudeGeometry(sh,{depth:.15,bevelEnabled:false}),white); gm.position.set(cx,top,z-.075); G.add(gm);
      for(const sx of [-1,1]){ const bd=box(Math.hypot(half,rise)+.2,.2,.08,trim,cx+sx*half/2,top+rise/2+.05,z+sz*.06,G); bd.rotation.z=-sx*a; }
      const ring=new THREE.Mesh(new THREE.TorusGeometry(.32,.05,8,24),pale); ring.position.set(cx,top+1.1,z+sz*.09); G.add(ring);
      const og=new THREE.Mesh(new THREE.CircleGeometry(.3,24),glass); og.position.copy(ring.position); og.rotation.y=sz>0?0:Math.PI; G.add(og);
      box(.6,.03,.03,pale,cx,top+1.1,z+sz*.1,G); box(.03,.6,.03,pale,cx,top+1.1,z+sz*.1,G);
      box(half*2,.06,.06,trim,cx,top+.02,z+sz*.08,G); }
    // verandas: north over the steps, south over the platform; posts with diagonal braces
    for(const [xe,xo,z0,z1,PZ] of [[X0,-125.9,Z0-.4,Z1+.4,[Z0-.1,3.3,7.5,11,14.2,Z1+.1]],[X1,-112.3,Z0-2,Z1+2,[Z0-1.7,Z0+1.3,Z0+4.3,Z0+7.3,Z0+10.3,Z0+13.3,Z1+1.7]]]){ const w=Math.abs(xo-xe), y1=top-.35, y2=top-.95, aa=Math.atan2(y1-y2,w), len=Math.hypot(w,y1-y2);
      const r=box(len,.08,z1-z0,tile,(xe+xo)/2,(y1+y2)/2,(z0+z1)/2,G,{type:'stnhouse'}); r.rotation.z=(xo<xe?1:-1)*aa; r.material=tile.clone(); r.material.map=tileT.clone(); r.material.map.repeat.set(len/1.2,(z1-z0)/1.2); r.material.map.needsUpdate=true;
      const px=xo+(xo<xe?.3:-.3); box(.12,.14,z1-z0,trim,px,y2-.05,(z0+z1)/2,G);
      for(const z of PZ){ const base=Y; box(.16,y2-base,.16,trim,px,(y2+base)/2,z,G,{type:'stnhouse'}); OB_STN(px-.08,px+.08,z-.08,z+.08);
        for(const sz of [-1,1]){ const br=box(.08,.9,.08,trim,px,y2-.45,z+sz*.32,G); br.rotation.x=sz*.75; }
        const xb=box(Math.abs(px-xe),.1,.1,trim,(px+xe)/2,y2-.05,z,G); } } }
  // ---- the station name over the entrance and on the platform (stn.name; small text under it in the second slot)
  const nameTex=(w,h,big,small)=>textCanvas(w,h,(c,W,Hh)=>{ c.fillStyle='#f8f5ee'; c.fillRect(0,0,W,Hh); c.strokeStyle='#2a2a2a'; c.lineWidth=6; c.strokeRect(6,6,W-12,Hh-12); c.fillStyle='#1a1a1a'; c.textAlign='center'; c.textBaseline='middle';
    c.font=`bold ${Math.round(Hh*(small?.48:.6))}px "Noto Serif TC",serif`; c.fillText(String(big).split('').join(' '),W/2,Hh*(small?.4:.52)); if(small){ c.font=`${Math.round(Hh*.16)}px serif`; c.fillText(String(small),W/2,Hh*.8); } });
  { const nm=NT('stn.name',0)||'', sub=NT('stn.name',1)||'';
    const fb=new THREE.Mesh(new THREE.PlaneGeometry(2.4,.6),new THREE.MeshStandardMaterial({map:nameTex(512,128,nm,''),roughness:.6})); fb.position.set(-126.06,Y+H-.62,5.4); fb.rotation.y=-Math.PI/2; box(.06,.68,2.52,trim,-126.02,Y+H-.62,5.4,G); fb.userData=T('stnsign'); pickables.push(fb); G.add(fb);
    const sg=new THREE.Group(); sg.position.set(-113.9,Y,22); sg.rotation.y=Math.PI/2; G.add(sg);
    for(const sx of [-1,1]) box(.08,1.9,.08,dark,sx*.9,.95,0,sg); const pl=new THREE.Mesh(new THREE.PlaneGeometry(2.0,.8),new THREE.MeshStandardMaterial({map:nameTex(512,200,nm,sub),roughness:.6,side:THREE.DoubleSide})); pl.position.set(0,1.6,0); pl.userData=T('stnsign'); pickables.push(pl); sg.add(pl);
    OB_STN(-114.1,-113.7,20.9,23.1); }
  // ---- inside: benches in the waiting room (seats), the fare board, a clock; the office: desk and chair, cabinet, token instrument
  const wood=M(0x8a6a48,.6), woodD=M(0x5a3e28,.55);
  const bench=(x,z0,z1,face)=>{ const g=new THREE.Group(); g.position.set(x,Y,(z0+z1)/2); G.add(g); const L=z1-z0;
    box(.42,.05,L,wood,0,.45,0,g,{type:'stnhouse'}); box(.05,.42,L,wood,-face*.2,.7,0,g); for(const z of [-L/2+.1,L/2-.1]) box(.4,.45,.05,woodD,0,.22,z,g);
    for(let z=z0+.35;z<z1-.2;z+=.6){ const si=addSeat(x+face*.02,z,face>0?-Math.PI/2:Math.PI/2,'stnb'); SEATS[si].ap={x:x+face*.65,z}; const hit=new THREE.Mesh(new THREE.BoxGeometry(.42,.3,.55),new THREE.MeshBasicMaterial({visible:false})); hit.position.set(x,Y+.6,z); hit.userData={type:'seat',si}; pickables.push(hit); G.add(hit); STNB.benches.push(si); }
    OB_STN(x-.22,x+.22,z0,z1); };
  bench(-122.7,2.4,4.0,1); bench(-122.7,6.8,9.7,1); bench(-117.4,2.45,3.9,-1);
  { const fb=new THREE.Mesh(new THREE.PlaneGeometry(1.6,1.0),new THREE.MeshStandardMaterial({roughness:.7,map:textCanvas(320,200,(c,w,h)=>{ c.fillStyle='#2a2420'; c.fillRect(0,0,w,h); c.strokeStyle='#c9a45a'; c.lineWidth=4; c.strokeRect(6,6,w-12,h-12); c.fillStyle='#f0e6cc'; c.textAlign='center'; c.font='bold 28px "Noto Serif TC",serif'; c.fillText(String(NT('stn.board',0)||''),w/2,40); c.font='20px "Noto Serif TC",serif'; String(NT('stn.board',1)||'').split('\n').slice(0,5).forEach((t,i)=>c.fillText(t,w/2,82+i*26)); })}));
    fb.position.set(-118.2,Y+1.8,9.94); fb.rotation.y=Math.PI; fb.userData=T('stnboard'); pickables.push(fb); G.add(fb); }
  { box(.9,.04,.3,wood,-121.1,Y+1.0,9.85,G,T('stnticket')); box(.9,.04,.3,wood,-121.1,Y+1.0,10.2,G); for(let i=0;i<5;i++) box(.012,.5,.012,steel,-121.42+i*.16,Y+1.25,10.03,G);
    const tb=new THREE.Mesh(new THREE.PlaneGeometry(.8,.22),new THREE.MeshStandardMaterial({roughness:.7,map:textCanvas(256,64,(c,w,h)=>{ c.fillStyle='#f6f2e8'; c.fillRect(0,0,w,h); c.fillStyle='#1a1a1a'; c.textAlign='center'; c.textBaseline='middle'; c.font='bold 34px "Noto Serif TC",serif'; c.fillText(String(NT('stn.window',0)||''),w/2,h/2); })}));
    tb.position.set(-121.1,Y+1.68,9.94); tb.rotation.y=Math.PI; tb.userData=T('stnticket'); pickables.push(tb); G.add(tb); }
  { // the office
    box(.9,.05,1.8,wood,-115.85,Y+.76,12.3,G,T('stnoffice')); for(const [x,z] of [[-116.25,11.45],[-115.45,11.45],[-116.25,13.15],[-115.45,13.15]]) box(.05,.76,.05,woodD,x,Y+.38,z,G);
    box(.3,.02,.42,M(0xefe6cf,.9),-115.85,Y+.79,12.1,G); box(.06,.1,.06,M(0x1a1a1a,.4),-115.7,Y+.84,12.7,G);
    OB_STN(-116.3,-115.35,11.4,13.2);
    const cg=new THREE.Group(); cg.position.set(-116.95,Y,12.3); G.add(cg); box(.44,.05,.44,woodD,0,.46,0,cg); for(const [x,z] of [[-.19,-.19],[.19,-.19],[-.19,.19],[.19,.19]]) box(.04,.46,.04,woodD,x,.23,z,cg); box(.04,.5,.44,woodD,-.2,.72,0,cg);
    STNB.chair=addSeat(-116.95,12.3,-Math.PI/2,'stnchair'); SEATS[STNB.chair].ap={x:-117.6,z:12.3};
    box(.45,1.8,1.6,wood,-122.8,Y+.9,12.6,G,T('stnoffice')); OB_STN(-123.05,-122.55,11.8,13.4);
    // the tablet instrument for the single line: a dark green cabinet with brass on a stand
    box(.5,.75,.5,woodD,-122.75,Y+.375,15.7,G); box(.42,.6,.42,M(0x2e4a3a,.5),-122.75,Y+1.05,15.7,G,T('stntoken')); for(const y of [.95,1.2]) box(.02,.08,.3,M(0xb8924e,.3,{metalness:.8}),-122.53,Y+y,15.7,G); OB_STN(-123.05,-122.45,15.4,16.0);
    const clk=new THREE.Group(); clk.position.set(-119.2,Y+2.55,10.1); G.add(clk); const cf=new THREE.Mesh(new THREE.CircleGeometry(.2,24),new THREE.MeshStandardMaterial({roughness:.6,map:textCanvas(128,128,(c,w,h)=>{ c.fillStyle='#f3ead6'; c.fillRect(0,0,w,h); c.fillStyle='#222'; c.font='bold 14px serif'; c.textAlign='center'; c.textBaseline='middle'; for(let i=1;i<=12;i++){ const a=i/12*Math.PI*2; c.fillText(String(i),w/2+Math.sin(a)*48,h/2-Math.cos(a)*48); } })}));
    cf.rotation.y=Math.PI; cf.position.z=-.08; clk.add(cf); const rim=new THREE.Mesh(new THREE.TorusGeometry(.2,.025,6,24),woodD); rim.position.z=-.08; clk.add(rim);
    const hand=(len,wd)=>{ const p=new THREE.Group(); p.position.z=-.09; clk.add(p); const m=new THREE.Mesh(new THREE.BoxGeometry(wd,len,.004),M(0x111111,.4)); m.position.y=len/2-.01; p.add(m); return p; }; STNB.hands={h:hand(.11,.012),m:hand(.16,.008)}; }
  // the ticket gate on the platform side: a little wooden booth beside the opening
  { const g=new THREE.Group(); g.position.set(-114.7,Y,6.55); G.add(g); box(.5,1.0,.5,wood,0,.5,0,g,T('stngate')); box(.56,.05,.56,woodD,0,1.02,0,g); OB_STN(-114.95,-114.45,6.3,6.8);
    for(const z of [4.45,6.35]){ box(.06,1.0,.06,wood,-114.95,Y+.5,z,G); } }
  // a low white fence along the back of the platform where the house is not
  for(const [z0,z1] of [[S.PL.z0,S.HS.z0],[S.HS.z1,S.PL.z1]]){ const L=z1-z0; box(.05,.06,L,trim,S.PL.x0+.05,Y+.85,(z0+z1)/2,G); box(.05,.06,L,trim,S.PL.x0+.05,Y+.45,(z0+z1)/2,G); for(let z=z0;z<=z1;z+=1.2) box(.07,.95,.07,trim,S.PL.x0+.05,Y+.47,z,G); }
  box(S.PL.x1-S.PL.x0,.06,.05,trim,(S.PL.x0+S.PL.x1)/2,Y+.85,S.PL.z0+.03,G); box(S.PL.x1-S.PL.x0,.06,.05,trim,(S.PL.x0+S.PL.x1)/2,Y+.45,S.PL.z0+.03,G);
  // ---- the line: ballast, sleepers, rails from the buffer to the end of the tunnel
  { const z0=S.RAIL.z0, z1=S.RAIL.z1, L=z1-z0, zc=(z0+z1)/2;
    const bal=new THREE.Shape(); bal.moveTo(-1.9,0); bal.lineTo(1.9,0); bal.lineTo(1.3,.2); bal.lineTo(-1.3,.2); bal.closePath();
    const bg=new THREE.ExtrudeGeometry(bal,{depth:L,bevelEnabled:false}); const bT=textCanvas(128,128,(g,w,h)=>{ g.fillStyle='#7a7468'; g.fillRect(0,0,w,h); for(let i=0;i<900;i++){ const v=90+((i*53)%90); g.fillStyle=`rgb(${v},${v-4},${v-10})`; g.fillRect((i*37)%w,(i*91)%h,3,3); } }); bT.wrapS=bT.wrapT=THREE.RepeatWrapping; bT.repeat.set(.6,.6);
    const bm=new THREE.Mesh(bg,new THREE.MeshStandardMaterial({map:bT,roughness:1})); bm.position.set(TX,-.02,z0); bm.userData={type:'floor'}; pickables.push(bm); G.add(bm);
    const n=Math.floor(L/.62), sl=new THREE.InstancedMesh(new THREE.BoxGeometry(2.0,.12,.2),M(0x4e3a2a,.9),n), m4=new THREE.Matrix4();
    for(let i=0;i<n;i++){ m4.makeTranslation(TX,.24,z0+.3+i*.62); sl.setMatrixAt(i,m4); } sl.instanceMatrix.needsUpdate=true; G.add(sl);
    for(const sx of [-1,1]){ const r=box(.07,.13,L,steel,TX+sx*.5685,.365,zc,G); box(.14,.02,L,rust,TX+sx*.5685,.31,zc,G); }
    // level crossings where the dikes cross the line, west of the station: planks and a crossbuck each side
    const xbM=M(0xf2efe6,.6), xbK=M(0x1c1c1c,.6);
    for(let z=Math.ceil((31-LAND.DIKE.oz)/LAND.DIKE.dz)*LAND.DIKE.dz+LAND.DIKE.oz;z<S.RAIL.z1-4;z+=LAND.DIKE.dz){ box(2.6,.06,1.2,M(0x6a5640,.9),TX,.35,z,G,{type:'floor'});
      for(const sx of [-1,1]){ const g=new THREE.Group(); g.position.set(TX+sx*2.4,0,z+sx*.9); G.add(g); box(.08,1.9,.08,xbK,0,.95,0,g); for(const r of [.6,-.6]){ const a=box(.9,.12,.03,xbM,0,1.7,0,g); a.rotation.z=r; } } } }
  // ---- the signal at the west end of the platform (a colour-light signal on a mast; it shows red until the train comes)
  { const g=new THREE.Group(); g.position.set(TX+2.2,0,34); G.add(g); box(.14,4.2,.14,M(0x3a3a3a,.5),0,2.1,0,g,T('stnsignal')); box(.5,.9,.3,M(0x1c1c1c,.5),0,4.0,-.05,g,T('stnsignal'));
    const red=new THREE.MeshStandardMaterial({color:0x5a0a0a,emissive:0xff2a1a,emissiveIntensity:1.2}), grn=new THREE.MeshStandardMaterial({color:0x0a3a1a,emissive:0x30ff7a,emissiveIntensity:0});
    const r=new THREE.Mesh(new THREE.CircleGeometry(.1,16),red); r.position.set(0,4.2,.11); g.add(r); const gg=new THREE.Mesh(new THREE.CircleGeometry(.1,16),grn); gg.position.set(0,3.8,.11); g.add(gg);
    for(const y of [4.2,3.8]){ const hood=new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,.12,16,1,true,0,Math.PI),M(0x1c1c1c,.5,{side:THREE.DoubleSide})); hood.rotation.x=Math.PI/2; hood.position.set(0,y+.02,.17); g.add(hood); }
    STNB.signal={red,grn}; }
  G.traverse(o=>{ if(o.isMesh&&!o.userData.type) o.userData={type:'stnhouse'}; });
}
SEAT_KIND.stnb={eye:2.02,pitch:-.05,front:true,sink:-.42+.9,get label(){ return NT('stnb.label'); },get hello(){ return NT('stnb.hello'); },status:()=>NT('stnb.status')};
SEAT_KIND.stnchair={eye:2.04,pitch:-.2,front:true,sink:-.42+.9,get label(){ return NT('stnb.label'); },get hello(){ return NT('stnb.hello2'); },status:()=>NT('stnb.status')};
// the station clock and the signal
ZL_ANIM.push(()=>{ const T=taipeiNow(); if(STNB.hands){ STNB.hands.h.rotation.z=(T.min%720)/720*Math.PI*2; STNB.hands.m.rotation.z=(T.min%60)/60*Math.PI*2; } });
// ---- the station master (站長): keeps the station from first light to late evening — the desk in the office, the ticket
//      window, the gate, sweeping the platform, a look down the line; at night he goes to his quarters (to be built)
{ const n=NPC.zhan; if(n){ n.ext=true; n.speed=1.0;
  const NODES={K:{x:-130.5,z:-6.0},A:{x:-126.2,z:5.4},B:{x:-119.5,z:5.4},C:{x:-116.3,z:5.4},D:{x:-113.6,z:5.4},E:{x:-113.6,z:15.0},F:{x:-116.4,z:15.0},G:{x:-121.1,z:10.75},H:{x:-117.6,z:12.3},I:{x:-112.9,z:28.0},J:{x:-112.9,z:-1.0},L:{x:-121.1,z:9.2}};
  const EDGES=[['K','A'],['A','B'],['B','C'],['C','D'],['D','E'],['E','F'],['F','G'],['F','H'],['G','H'],['D','J'],['E','I'],['B','L'],['D','I']];
  const near=p=>{ let best=null, bd=1e9; for(const k in NODES){ const q=NODES[k], d=Math.hypot(q.x-p.x,q.z-p.z); if(d<bd){ bd=d; best=k; } } return best; };
  const path=(a,b)=>{ const s=near(a), t=near(b), prev={[s]:null}, Q=[s]; while(Q.length){ const u=Q.shift(); if(u===t) break; for(const [p,q] of EDGES){ const v=p===u?q:q===u?p:null; if(v&&!(v in prev)){ prev[v]=u; Q.push(v); } } }
    const out=[]; let u=t; while(u){ out.unshift(NODES[u]); u=prev[u]; } return out; };
  window.__stnRoute=(a,b)=>{ if(!STN.inR(STN.RECT,a.x,a.z)||!STN.inR(STN.RECT,b.x,b.z)) return null; const p=path(a,b).map(q=>({x:q.x,z:q.z})); p.push({x:b.x,z:b.z}); return p; };
  const DAYW=5*60+30, DAYE=22*60+30;
  const show=v=>{ n.g.visible=v; n.away=!v; };
  window.__extPlan=m=>{ if(m.id!=='zhan') return false; const T=taipeiNow(), now=Date.now();
    if(m.errand||m.lead||m.follow) return true;
    if(T.min<DAYW||T.min>=DAYE){ if(!m.away){ leaveSpot(m); npcGo(m,NODES.K,k=>{ show(false); k.busyUntil=Date.now()+60000; }); } else m.busyUntil=now+60000; return true; }
    if(m.away){ show(true); npcPlace(m,NODES.K,Math.PI/2); }
    leaveSpot(m); m.si=((m.si||0)+1)%6; const k=m.si;
    if(k===0||k===3){ if(STNB.chair>=0&&ME.seat!==STNB.chair&&!occupied(STNB.chair)){ seatAt(m,STNB.chair,'dsit',now+50000+Math.random()*30000,q=>{ q.act='write'; }); return true; } }
    if(k===1) return npcGo(m,NODES.G,q=>{ q.yaw=0; q.act='idle'; q.busyUntil=Date.now()+35000; }), true;
    if(k===2) return npcGo(m,{x:-113.4,z:6.0},q=>{ npcFace(q,{x:-113.4,z:20}); q.act='sweep'; q.busyUntil=Date.now()+9000; q.next=()=>npcGo(q,{x:-113.0,z:20.0},r=>{ r.act='sweep'; r.busyUntil=Date.now()+9000; }); }), true;
    if(k===4) return npcGo(m,NODES.I,q=>{ npcFace(q,{x:STN.TX,z:80}); q.act='idle'; q.busyUntil=Date.now()+18000; }), true;
    return npcGo(m,{x:-114.2,z:5.4},q=>{ npcFace(q,{x:-111,z:5.4}); q.act='idle'; q.busyUntil=Date.now()+25000; }), true; };
  // talking to him
  window.__stnTalk=()=>{ npcSay('zhan',npcLine(n.sSi===STNB.chair?'zhan.desk':'zhan.hi',titleFill())); return true; };
} }
// {% endraw %}
