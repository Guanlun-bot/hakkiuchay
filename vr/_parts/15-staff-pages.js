// {% raw %}
/* ================= 傭人作息：起床收簾、洗澡、就寢 =================
   The household's day by Taipei time (back office: day.times). At getting-up time 玉姨 walks the east side and 阿財 the
   west, rolling up every blind as they come to it; at lights-out they go round again letting them down, then everyone
   is in bed (the men in 22 號房, the women in 26 號房), a lamp lit on the cabinet for the first half hour. In the evening
   each takes a basin from their room, changes at the lockers (towel on), washes at a station, soaks in the tub (four
   places, two facing two), sometimes sits in the sauna, dresses and goes back. The women go first, then the men.
   All of it is worked out from the clock, so everyone in the house sees the same; blinds are shared over the network. */
const STAFF={bed:{xu:0,shui:1,huo:2,cai:3,yu:4,chun:5,li:6,he:7,fu:8,lai:9},round:{yu:'e',cai:'w'},R:null};
// the pages keep shorter hours (back office kids.times: getting up, lights out)
const KIDS=(()=>{ const t=String(NT('kids.times')).split(/[,，、\s]+/).map(s=>{ const m=/^(\d{1,2})[:：](\d{2})$/.exec(s.trim()); return m?+m[1]*60+ +m[2]:null; }); return {wake:t[0]??330,sleep:t[1]??1290}; })();
const kidAsleep=m=>m<KIDS.wake||m>=KIDS.sleep;
const minsSince=(m,s)=>((m-s)%1440+1440)%1440;
const tpMin=t=>((t/60000+480)%1440+1440)%1440, wallNow=()=>Date.now()+MEAL_SHIFT*60000;
const bedOf=n=>BEDS[STAFF.bed[n.id]], bedIn=b=>Math.sign(b.cx-b.x)||1;
const bedAp=b=>({x:b.x+bedIn(b)*(b.W/2+.38),z:b.z});
function npcStand(n,p){ n.pose=null; n.sSi=-1; n.inSauna=false; n.lie=false; n.atBed=false; if(p) npcPlace(n,p); }
// the two rounds: from the bed, each blind on their side in turn (nearest next), a few seconds at each
function staffRoutes(){ if(STAFF.R) return STAFF.R; try{ if(!BLINDS.length||!BEDS.length) return null; }catch{ return null; } const SPD=1.05, DW=3500, R={};
  const todo={e:[],w:[]}; BLINDS.forEach((b,i)=>{ b.g.updateMatrixWorld(true); const c=b.g.getWorldPosition(new THREE.Vector3()), n=new THREE.Vector3(0,0,1).applyQuaternion(b.g.getWorldQuaternion(new THREE.Quaternion())).setY(0).normalize();
    const sides=[1,-1].map(s=>({x:c.x+n.x*s*.75,z:c.z+n.z*s*.75})).filter(p=>walkable(p.x,p.z)); b.off=0; if(sides.length) todo[c.z<courtAxis?'e':'w'].push({i,sides,c}); });
  for(const id of ['yu','cai']){ const side=STAFF.round[id], list=todo[side].slice(), start=bedAp(BEDS[STAFF.bed[id]]); let cur=start, t=0; const pts=[{x:start.x,z:start.z,t:0}], hits=[];
    while(list.length){ let bi=0, bd=1e9; list.forEach((L,k)=>{ const d=Math.hypot(L.c.x-cur.x,L.c.z-cur.z); if(d<bd){ bd=d; bi=k; } }); const L=list.splice(bi,1)[0];
      const to=L.sides.reduce((a,p)=>Math.hypot(p.x-cur.x,p.z-cur.z)<Math.hypot(a.x-cur.x,a.z-cur.z)?p:a);
      const path=(route(cur,to)||[to]).slice(1); for(const q of path){ const last=pts[pts.length-1]; t+=Math.hypot(q.x-last.x,q.z-last.z)/SPD*1000; pts.push({x:q.x,z:q.z,t}); }
      if(!path.length){ t+=Math.hypot(to.x-cur.x,to.z-cur.z)/SPD*1000; pts.push({x:to.x,z:to.z,t}); }
      const at=t; t+=DW; pts.push({x:to.x,z:to.z,t,face:L.c,dwell:true}); hits.push({i:L.i,t:at+1200}); BLINDS[L.i].off=at+1200; BLINDS[L.i].who=id; cur=to; }
    const back=(route(cur,start)||[start]).slice(1); for(const q of back){ const last=pts[pts.length-1]; t+=Math.hypot(q.x-last.x,q.z-last.z)/SPD*1000; pts.push({x:q.x,z:q.z,t}); }
    R[id]={pts,total:t,hits}; }
  return STAFF.R=R; }
// is a round on now for this person? then put them on it
function roundOn(n,m){ if(!STAFF.round[n.id]) return false; const R=staffRoutes(); if(!R) return false; const r=R[n.id];
  for(const s of [DAY.wake,DAY.sleep%1440]){ const el=minsSince(m,s)*60000; if(el<r.total){ if(!n.tl){ npcStand(n,null); npcBathLook(n,null); n.carry=null; } n.tl={r,start:Date.now()-el}; n.path=[]; n.busyUntil=Infinity; return true; } }
  return false; }
// moving along the round: walking between windows, arms up at each blind
function staffTL(n,dt){ const T=n.tl, r=T.r, e=Date.now()-T.start; if(e>=r.total){ n.tl=null; n.busyUntil=0; n.act='idle'; return; }
  const P=r.pts; let k=1; while(k<P.length-1&&P[k].t<e) k++; const a=P[k-1], b=P[k], f=b.t>a.t?Math.min(1,Math.max(0,(e-a.t)/(b.t-a.t))):1;
  n.x=a.x+(b.x-a.x)*f; n.z=a.z+(b.z-a.z)*f; const still=b.dwell||(Math.hypot(b.x-a.x,b.z-a.z)<.01);
  if(still){ n.act='blind'; if(b.face) npcFace(n,b.face); } else { n.act='walk'; const want=Math.atan2(-(b.x-a.x),-(b.z-a.z)); let dy=want-n.yaw; dy=Math.atan2(Math.sin(dy),Math.cos(dy)); n.yaw+=dy*Math.min(1,dt*6); } }
// lying down and getting up
function goLie(n,now){ const b=bedOf(n); if(!b) return; const lie=()=>{ npcStand(n,null); n.lie=true; n.atBed=true; n.yaw=b.yaw; const lz=b.L/2-.1-1.7*(n.hh||1); n.x=b.x+Math.sin(b.yaw)*lz; n.z=b.z+Math.cos(b.yaw)*lz; n.path=[]; n.act='lie'; n.busyUntil=Date.now()+30000; };
  if(now) return lie(); npcGo(n,bedAp(b),()=>lie()); }
function bedSit(n,until,pose='bedsit'){ const b=bedOf(n); npcGo(n,bedAp(b),m=>{ const s=bedIn(b); npcPlace(m,{x:b.x+s*(b.W/2-.14),z:b.z},-s*Math.PI/2); m.pose=pose; m.atBed=true; m.carry=null; m.act='staff'; m.busyUntil=until; }); }
// sitting in one of the bath's places: a stool, the tub, the sauna
const freeSeat=list=>list.find(si=>si!==ME.seat&&!occupied(si));
function bathSeat(n,list,pose,until,then){ const si=freeSeat(list); if(si==null){ n.act='idle'; n.st=-1; n.busyUntil=Date.now()+8000; return; } const s=SEATS[si];
  n.sSi=si; npcGo(n,s.ap,m=>{ const back=pose==='wash'?.12:0; npcPlace(m,{x:s.x+Math.sin(s.yaw)*back,z:s.z+Math.cos(s.yaw)*back},s.yaw); m.sSi=si; m.pose=pose; m.act='staff'; m.busyUntil=until; if(then) then(m); }); }
function lockSpot(n){ const ids=n.look0fem?['yu','chun','li','he']:['xu','shui','huo','cai'], k=Math.max(0,ids.indexOf(n.id)), L=BATH.lockPt; return {x:L.x-.55+k*(1.1/Math.max(1,ids.length-1)),z:L.z}; }
const hashF=s=>{ let h=7; for(const c of s) h=(h*31+c.charCodeAt(0))%100003; return h/100003; };
function bathPlan(n,m){ if(!BATH.lockPt||n.kid) return false; const F=!!n.look0fem, b0=F?DAY.wf:DAY.wm, b1=F?DAY.wm:DAY.sleep, len=b1-b0, prep=b0-10;
  if(!(m>=prep&&m<b1)) return false; const T=taipeiNow(), day=T.day+(F?'f':'m'), at=mm=>Date.now()+(mm-m)*60000;
  const tWash=b0+.36*len, tSoak=b0+.7*len, tSauna=b0+.84*len, tDress=b1-4;
  if(n.bday!==day){ n.bday=day; n.wantSauna=hashF(n.id+day)<.55; n.bs=0; n.st=-1;
    // arriving partway through (the page opened late): start from where they would be
    if(m>=b0+2){ n.bs=m<tWash?2:m<tSoak?3:(m<tSauna&&n.wantSauna)?4:m<tDress?5:6; if(n.bs<6){ npcStand(n,lockSpot(n)); npcBathLook(n,n.bs<5?'towel':null); } } }
  const now=Date.now(); if(n.st===n.bs){ // the current step is done: stand up and move on
    if(n.sSi>=0){ const s=SEATS[n.sSi]; npcStand(n,s.ap); } n.pose=null; n.inSauna=false; npcBathLook(n,n.look==='soak'?'towel':n.look);
    n.bs=n.bs===3?(n.wantSauna&&m<tSauna-3?4:5):n.bs+1; }
  n.st=n.bs;
  switch(n.bs){
    case 0: { const b=bedOf(n); npcGo(n,bedAp(b),k=>{ k.act='load'; k.busyUntil=Date.now()+3000; k.carry='basin'; }); return true; }
    case 1: npcGo(n,lockSpot(n),k=>{ npcFace(k,{x:k.x,z:30}); k.act='undress'; k.busyUntil=Date.now()+22000; k.next=()=>{ npcBathLook(k,'towel'); k.busyUntil=0; }; }); return true;
    case 2: n.carry='basin'; bathSeat(n,BATH.wseats,'wash',at(tWash)); return true;
    case 3: n.carry=null; bathSeat(n,BATH.seats,'soak',at(n.wantSauna?tSoak:tSauna),k=>npcBathLook(k,'soak')); return true;
    case 4: bathSeat(n,BATH.sseats,'ssit',at(tSauna),k=>{ k.inSauna=true; }); return true;
    case 5: npcGo(n,lockSpot(n),k=>{ npcFace(k,{x:k.x,z:30}); k.act='undress'; k.busyUntil=Date.now()+20000; k.next=()=>{ npcBathLook(k,null); k.carry='basin'; k.busyUntil=0; }; }); return true;
    case 6: bedSit(n,at(b1)); return true;
    default: bedSit(n,at(b1)); return true; } }
function staffPlan(n){ if(!BEDS.length||n.lead) return false; if(n.follow||n.errand) return true; const m=taipeiNow().min;
  if(n.kid) return window.__kidPlan(n,m);
  if(roundOn(n,m)) return true;
  if(asleepAt(m)){ if(n.look) npcBathLook(n,null); n.carry=null;
    if(!n.lie){ const late=minsSince(m,DAY.sleep%1440)>20; goLie(n,late||Math.hypot(ME.x-n.x,ME.z-n.z)>30); } else { n.act='lie'; n.busyUntil=Date.now()+30000; }
    return true; }
  if(n.lie){ const b=bedOf(n); npcStand(n,bedAp(b)); }
  if(bathPlan(n,m)) return true;
  // after their bath and before lights out: sitting on the bed, a lamp on
  const F=!!n.look0fem; if(m>=(F?DAY.wm:DAY.sleep)&&m<1440&&!asleepAt(m)){ if(n.look) npcBathLook(n,null); if(n.pose!=='bedsit') bedSit(n,Date.now()+60000); else n.busyUntil=Date.now()+60000; return true; }
  if(window.__dayPlan&&window.__hasPlan(n)) return window.__dayPlan(n,m);
  if(window.__oplan&&window.__oplan(n,m)) return true;
  if(n.pose||n.look||n.atBed){ npcBathLook(n,null); const p=n.sSi>=0?SEATS[n.sSi].ap:null; npcStand(n,p); n.carry=n.carry==='basin'?null:n.carry; }
  return false; }
for(const id in NPC) NPC[id].look0fem=!!NPCS.find(d=>d.id===id).look.fem;
window.__seatNpc0=window.__seatNpc; window.__seatNpc=si=>{ if(window.__seatNpc0&&window.__seatNpc0(si)) return true; for(const id in NPC) if(NPC[id].sSi===si) return true; return false; };
// poses for the evening: on a stool, in the water, on the sauna bench, on the bed's edge, lying under the quilt
function staffPose(n,P,dt,w){ const g=n.g; g.rotation.order='YXZ';
  const sh=!n.lie; if(P.shoes[0].visible!==sh) P.shoes.forEach(o=>o.visible=sh);
  if(n.lie){ g.position.y=.62; g.rotation.x=Math.PI/2; P.F.position.y=0; P.legs[0].rotation.x=P.legs[1].rotation.x=0; P.arms[0].rotation.x=P.arms[1].rotation.x=0; P.head.rotation.x=0; return; }
  g.rotation.x=0; if(n.tl&&n.act==='blind'){ P.arms[0].rotation.x=2.3; P.arms[1].rotation.x=2.1+Math.sin(w*3)*.15; P.head.rotation.x=-.25; return; }
  const legs=a=>{ P.legs[0].rotation.x=P.legs[1].rotation.x=a; };
  switch(n.pose){
    case 'wash': P.F.position.y=-.6; legs(1.05); P.arms[0].rotation.x=.9+Math.sin(w*3)*.25; P.arms[1].rotation.x=1.1-Math.sin(w*3)*.25; P.head.rotation.x=.25; break;
    case 'soak': P.F.position.y=-.87; legs(1.25); P.arms[0].rotation.x=P.arms[1].rotation.x=.25; P.head.rotation.x=-.12; break;
    case 'ssit': { const s=SEATS[n.sSi], hi=s&&s.kind==='sauna2'; P.F.position.y=hi?.08:-.37; legs(1.35); P.arms[0].rotation.x=P.arms[1].rotation.x=.55; P.head.rotation.x=.18; break; }
    case 'bedsit': case 'dsit': P.F.position.y=-.33; legs(1.3); P.arms[0].rotation.x=P.arms[1].rotation.x=.5; P.head.rotation.x=.15; break;
    case 'mend': P.F.position.y=-.33; legs(1.3); P.arms[0].rotation.x=.95; P.arms[1].rotation.x=.9+Math.sin(w*4)*.15; P.head.rotation.x=.45; break;
    case 'class': P.F.position.y=-.42*(n.hh||1); legs(1.45); P.arms[0].rotation.x=1.0; P.arms[1].rotation.x=1.05+Math.sin(w*5)*.06; P.head.rotation.x=.35; break;
    case 'pray': { const ph=(w*.25)%1, bow=ph>.55&&ph<.8; P.F.position.y=-.5*(n.hh||1); legs(1.55); P.arms[0].rotation.x=P.arms[1].rotation.x=bow?.9:.35; P.head.rotation.x=bow?.7:.25; break; } }
  if(n.act==='undress'&&!n.pose){ P.arms[0].rotation.x=1.2+Math.sin(w*2)*.3; P.arms[1].rotation.x=1.0-Math.sin(w*2)*.3; P.head.rotation.x=.3; }
  if((n.carry==='basin'||n.propK)&&!n.pose){ P.arms[0].rotation.x=P.arms[1].rotation.x=.9; } }
// the basin they carry: a small hinoki tub with soap and a folded cloth
for(const id in NPC){ const n=NPC[id], P=n.g.userData.parts, b=new THREE.Group(); b.position.set(0,.95,-.3); P.F.add(b); b.visible=false; n.basin=b;
  const wd=new THREE.MeshStandardMaterial({color:0xd8b88a,roughness:.6}); const c=new THREE.Mesh(new THREE.CylinderGeometry(.15,.12,.1,16,1,true),wd); c.material.side=THREE.DoubleSide; b.add(c); const bt=new THREE.Mesh(new THREE.CircleGeometry(.12,16),wd); bt.rotation.x=-Math.PI/2; bt.position.y=-.045; b.add(bt);
  box(.12,.03,.09,new THREE.MeshStandardMaterial({color:0xf3efe6,roughness:.95}),.03,-.02,0,b); box(.05,.03,.035,new THREE.MeshStandardMaterial({color:0xe8d9b0,roughness:.5}),-.06,-.025,.02,b); }
// bedside lamps (one for each bed, lit while its sleeper is there, for the first half hour and just before getting up)
// and one twin-bell alarm clock on each cabinet, ringing at getting-up time where someone sleeps by it
const BEDSIDE={lamps:[],clocks:[]};
{ const porc=new THREE.MeshStandardMaterial({color:0xefe7d8,roughness:.3}), brassM=new THREE.MeshStandardMaterial({color:0xc29a52,metalness:.8,roughness:.3}), dk=new THREE.MeshStandardMaterial({color:0x2a2420,roughness:.5});
  for(const [si,St] of STANDS.entries()){ const top=.605, c=Math.cos(St.yaw), sn=Math.sin(St.yaw), W2=(x,z)=>({x:St.x+c*x+sn*z, z:St.z-sn*x+c*z});
    for(const lx of [-(St.cab/2-.16),St.cab/2-.16]){ const p=W2(lx,.04), bi=St.beds.reduce((a,b)=>Math.abs(BEDS[b].x-p.x)<Math.abs(BEDS[a].x-p.x)?b:a);
      const g=new THREE.Group(); g.position.set(p.x,top,p.z); scene.add(g);
      const base=lathe([[0,0],[.06,0],[.065,.02],[.04,.06],[.05,.12],[.03,.17],[.012,.19],[0,.19]],porc,18); g.add(base);
      const shM=new THREE.MeshStandardMaterial({color:0xf2e6cc,roughness:.9,side:THREE.DoubleSide,emissive:0xffb060,emissiveIntensity:0});
      const sh=new THREE.Mesh(new THREE.CylinderGeometry(.075,.1,.16,20,1,true),shM); sh.position.y=.27; g.add(sh);
      const gl=new THREE.Mesh(new THREE.PlaneGeometry(.75,.75),new THREE.MeshBasicMaterial({map:SOFT_TEX,color:0xffb060,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));
      const wp=W2(lx,.17); gl.position.set(wp.x,top+.38,wp.z); gl.rotation.y=St.yaw+Math.PI; scene.add(gl);
      const pool=new THREE.Mesh(new THREE.CircleGeometry(.3,20),gl.material.clone()); pool.rotation.x=-Math.PI/2; pool.position.set(p.x,top+.003,p.z); scene.add(pool);
      g.traverse(o=>{ if(o.isMesh) o.userData={type:'bedlamp'}; pickables.push(o); });
      BEDSIDE.lamps.push({bi,shM,gl,pool,k:0}); NPC_DYN.push(g,gl,pool); }
    // the clock faces the room: a round brass case, a cream dial, two bells and the hammer between them, two feet
    const g=new THREE.Group(); const p=W2(0,-.02); g.position.set(p.x,top,p.z); g.rotation.y=St.yaw; scene.add(g); const body=new THREE.Group(); body.position.y=.12; g.add(body); const pk={type:'alarm',i:si};
    const cs=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,.045,24),brassM); cs.rotation.x=Math.PI/2; body.add(cs);
    const dial=new THREE.Mesh(new THREE.CircleGeometry(.06,24),new THREE.MeshStandardMaterial({color:0xf3ead6,roughness:.5,map:textCanvas(128,128,(q,w,h)=>{ q.fillStyle='#f3ead6'; q.fillRect(0,0,w,h); q.fillStyle='#2a2018'; for(let i=0;i<12;i++){ const a=i/12*Math.PI*2; q.save(); q.translate(64,64); q.rotate(a); q.fillRect(-2,-58,4,i%3?8:14); q.restore(); } })}));
    dial.position.z=-.0235; dial.rotation.y=Math.PI; body.add(dial);
    const hand=(L,wd)=>{ const pv=new THREE.Group(); pv.position.z=-.026; body.add(pv); const h=new THREE.Mesh(new THREE.BoxGeometry(wd,L,.002),dk); h.position.y=L/2-.006; pv.add(h); return pv; };
    const hh=hand(.034,.007), mh=hand(.05,.005);
    const bells=[]; for(const sx of [-1,1]){ const b=new THREE.Mesh(new THREE.SphereGeometry(.035,16,8,0,Math.PI*2,0,Math.PI/2),brassM); b.position.set(sx*.045,.072,0); b.rotation.z=sx*-.5; body.add(b); bells.push(b); }
    const ham=new THREE.Group(); ham.position.set(0,.06,.005); body.add(ham); const hr=new THREE.Mesh(new THREE.CylinderGeometry(.003,.003,.05,6),brassM); hr.position.y=.025; ham.add(hr); const hb=new THREE.Mesh(new THREE.SphereGeometry(.008,8,6),brassM); hb.position.y=.05; ham.add(hb);
    const hd=new THREE.Mesh(new THREE.TorusGeometry(.025,.003,6,16,Math.PI),brassM); hd.position.y=.1; body.add(hd);
    for(const sx of [-1,1]){ const f=new THREE.Mesh(new THREE.CylinderGeometry(.006,.009,.06,8),brassM); f.position.set(sx*.045,.03,0); f.rotation.z=sx*.4; g.add(f); }
    g.traverse(o=>{ if(o.isMesh){ o.userData=pk; pickables.push(o); } });
    BEDSIDE.clocks.push({g,body,hh,mh,ham,beds:St.beds,x:p.x,z:p.z,rang:'',ring:0,kids:St.room==='kids'}); NPC_DYN.push(g); } }
function ringBell(x,z){ const d=Math.hypot(ME.x-x,ME.z-z); if(d>9) return; try{ actx=actx||new (window.AudioContext||window.webkitAudioContext)(); actx.resume(); const t0=actx.currentTime, v=.12*Math.max(.1,1-d/9), out=actx.createGain(); out.gain.value=v; out.connect(actx.destination);
  for(let k=0;k<64;k++){ const t=t0+k*.075; for(const [f,a] of [[2150,1],[3380,.5],[5200,.25]]){ const o=actx.createOscillator(), g=actx.createGain(); o.frequency.value=f*(k%2?1.04:1); g.gain.setValueAtTime(a,t); g.gain.exponentialRampToValueAtTime(.001,t+.07); o.connect(g); g.connect(out); o.start(t); o.stop(t+.08); } } }catch{} }
let staffT=0;
ZL_ANIM.push(dt=>{ if(!window.__entered) return; dt=dt||.016; const w=performance.now()/1000, T=taipeiNow(), m=T.min;
  for(const id in NPC){ const n=NPC[id]; if(n.basin) n.basin.visible=n.carry==='basin'&&!n.pose; }
  // the quilt spread over a sleeper, folded at the foot otherwise
  const sleeper=bi=>{ for(const id in NPC){ const n=NPC[id]; if(STAFF.bed[id]===bi) return n; } return null; };
  BEDS.forEach((b,bi)=>{ const n=sleeper(bi), on=!!(n&&n.lie); if(b.sq.visible!==on){ b.sq.visible=on; b.fq.visible=!on; } });
  const quietA=asleepAt(m)&&minsSince(m,DAY.sleep%1440)>=30&&minsSince(DAY.wake,m)>12, quietK=kidAsleep(m)&&minsSince(m,KIDS.sleep)>=30&&minsSince(KIDS.wake,m)>12;
  for(const L of BEDSIDE.lamps){ const n=sleeper(L.bi), on=!!(n&&n.atBed&&!n.follow)&&!(n&&n.kid?quietK:quietA)&&!(n&&n.task==='nap'); L.k+=((on?1:0)-L.k)*Math.min(1,dt*3); L.shM.emissiveIntensity=L.k*1.4; L.gl.material.opacity=L.k*.42; L.pool.material.opacity=L.k*.5; }
  staffT+=dt; const tick=staffT>.5; if(tick) staffT=0;
  for(const C of BEDSIDE.clocks){ if(tick){ const hm=m%720; C.hh.rotation.z=-(hm/720)*Math.PI*2; C.mh.rotation.z=-((m%60)/60)*Math.PI*2; }
    const used=C.beds.some(bi=>sleeper(bi)), el=minsSince(m,C.kids?KIDS.wake:DAY.wake)*60;
    if(used&&el<5&&C.rang!==T.day){ C.rang=T.day; C.ring=5; ringBell(C.x,C.z); if(Math.hypot(ME.x-C.x,ME.z-C.z)<6) toast(NT('alarm.ring'),3000); }
    if(C.ring>0){ C.ring-=dt; C.ham.rotation.z=Math.sin(w*80)*.5; C.body.position.x=Math.sin(w*95)*.003; C.body.rotation.z=Math.sin(w*60)*.04; } else if(C.ham.rotation.z){ C.ham.rotation.z=0; C.body.position.x=0; C.body.rotation.z=0; } } });
window.__staff={STAFF,BEDS,STANDS,BEDSIDE,staffRoutes,DAY}; window.__staffPlan=staffPlan; window.__staffTL=staffTL; window.__staffPose=staffPose;
/* ================= 阿莉、阿荷、阿福、阿來：作息、對話、呼喚 =================
   Each of the four keeps a day written in the back office (plan.li, plan.he, plan.fu, plan.lai: "05:00 禮拜、05:20 收衣…");
   meals, the women's bath and lights out are the household's. The pages answer only to the master (the name in
   boss.name): F calls 阿福, R calls 阿來 (or the buttons), again to send them back; they come even from bed, walk a step
   behind, wait outside the bath and the toilets, sit with you at the pictures, and 阿來 carries a lantern after dark. */
const isBoss=()=>{ try{ return String(myName||'').trim()===String(NT('boss.name')).trim()&&!!String(NT('boss.name')).trim(); }catch{ return false; } };
const titleFill=()=>({稱呼:NT('boss.title',isBoss()?0:1)});
const say2=(id,key)=>npcSay(id,npcLine(key,titleFill()));
const seatsOf=k=>SEATS.map((s,i)=>s.kind===k?i:-1).filter(i=>i>=0);
const DPLAN={};
for(const id of ['li','he','fu','lai']){ DPLAN[id]=String(NT('plan.'+id)).split(/[、,，;；\n]+/).map(x=>{ const m=/(\d{1,2})[:：](\d{2})\s*(.+)/.exec(x.trim()); return m?{at:+m[1]*60+ +m[2],k:m[3].trim()}:null; }).filter(Boolean).sort((a,b)=>a.at-b.at); }
const planNow=(id,m)=>{ const L=DPLAN[id]; if(!L||!L.length) return null; let cur=L[L.length-1]; for(const e of L) if(e.at<=m) cur=e; return cur.k; };
window.__hasPlan=n=>!!DPLAN[n.id];
// where each kind of work is done
const R26=()=>bedOf(NPC.li), P=(x,z)=>({x,z});
const TASKS={
  禮拜:{bed:true,pose:'pray'}, 休息:{bed:true,pose:'bedsit'}, 縫補:{bed:true,pose:'mend'}, 摺衣:{bed:true,pose:'mend'}, 補衣:{bed:true,pose:'mend'}, 梳洗:{bed:true,pose:'bedsit'},
  午睡:{nap:true},
  收衣:{spots:[P(33.64,19.6),P(34.56,19.6),P(34.1,0),P(29.4,1.2)],act:'load',dur:20000},
  洗衣:{spots:[P(44.2,6.4),P(43.5,7.0)],act:'wash',dur:60000,face:P(46,6.4)},
  補毛巾:{spots:[P(42.9,22.4),P(43.2,18.2)],act:'load',dur:25000},
  幫忙茶具:{spots:[P(10.4,-2.2)],act:'prep',dur:60000,face:P(10.4,-4.5)},
  聊天:{dine:true},
  掃地:{spots:[P(36.2,5.3),P(43.6,5.3),P(43.6,14.25),P(36.2,14.25),P(39.2,9.8)],act:'sweep',dur:40000},
  擦拭:{spots:[P(22,5.3),P(17,5.3),P(22,14.25),P(20,9.8)],act:'prep',dur:40000},
  掃三進:{spots:[P(0,5.6),P(3,1),P(-5.5,2.5),P(5.5,2.5)],act:'sweep',dur:40000},
  浴室:{spots:[P(42.9,22.4),P(44.8,19.6),P(43.2,18.2)],act:'sweep',dur:45000},
  幫廚:{spots:[()=>NP.sink],act:'wash',dur:60000,face:P(47,-.05)},
  乘涼:{spots:[P(39.2,13.9)],act:'idle',dur:60000,face:P(39.2,9.8),hum:true},
  磨墨:{spots:[P(3,1)],act:'write',dur:60000,face:P(3,-1)},
  撣塵:{spots:[P(5.5,2.5),P(-5.5,2.5),P(6.5,-1),P(-6.5,-1)],act:'sweep',dur:35000},
  整理書房:{spots:[P(3,1),P(0,2.8),P(-5.5,2.5)],act:'prep',dur:40000},
  溫書:{spots:[P(0,2.8),P(3,1)],act:'book',dur:60000},
  茶室:{spots:[P(-6.3,20.7),P(-3,19.9)],act:'sweep',dur:40000},
  掃院:{spots:[P(39.2,9.8),P(36.2,5.3),P(20,9.8),P(17,5.3)],act:'sweep',dur:35000},
  收茶具:{spots:[P(-6.3,20.7),P(10.4,-2.2)],act:'load',dur:15000},
  上課:{cls:true},
  跑腿:{errand:true},
  送信:{spots:[P(3,1),()=>NP.gate],act:'unload',dur:30000,hold:'mail'},
  點門燈:{spots:[()=>({x:NP.gate.x-.6,z:NP.gate.z+.4})],act:'blind',dur:20000},
  巡宅:{spots:[P(39.2,9.8),P(20,9.8),P(0,5.6),P(-3,19.9),P(10.6,21.4)],act:'idle',dur:9000},
  對菜單:{spots:[P(44.2,-1.6)],act:'book',dur:60000,face:()=>NPC.huo},
  考背書:{spots:[P(1.6,2.0)],act:'book',dur:60000,face:P(0,2.8)},
  揀茶:{spots:[P(10.4,-2.2)],act:'prep',dur:60000,face:P(10.4,-4.5),hold:'sieve'},
  教寫字:{dine:true}, 學寫字:{dine:true},
  插花:{spots:[()=>NP.garden,P(-4.5,21.5)],act:'prune',dur:20000},
  餵魚:{spots:[P(-4.5,21.5)],act:'prep',dur:30000},
  石階:{by:{shui:P(16.2,14.0),cai:P(16.9,14.0)},act:'idle',dur:60000,face:()=>NP.garden},
  醃菜脯:{spots:[()=>NP.sink],act:'prep',dur:60000}, 泡豆子:{spots:[()=>NP.sink],act:'wash',dur:60000},
  修門:{spots:[P(10.6,21.4)],act:'prep',dur:60000,hold:'tools'},
  巡院:{spots:[P(39.2,9.8),P(20,9.8),P(0,10.2),P(51.0,12.6)],act:'idle',dur:7000},
  換床單:{spots:[P(33.64,16.63),P(34.56,22.57),P(33.64,0),P(34.56,-2.97)],act:'load',dur:20000},
  巡夜:{spots:[P(50.2,9.8),P(39.2,9.8),P(29.4,9.8),P(20,9.8),P(9.8,9.8),P(.4,9.8),P(-3,19.9),P(10.6,21.4)],act:'idle',dur:12000},
  點燈:{spots:[P(39.2,13.9),P(20,13.9),P(0,5.6),P(-3,19.9)],act:'blind',dur:9000} };
// the old six keep their own rounds, with a few windows of other work (back office plan.<id>: "08:30-08:50 送信、…")
const OPLAN={}; for(const id of ['yu','xu','chun','shui','huo','cai']){ OPLAN[id]=String(NT('plan.'+id)).split(/[、,，;；\n]+/).map(x=>{ const m=/(\d{1,2})[:：](\d{2})\s*[-–~～至]\s*(\d{1,2})[:：](\d{2})\s*(.+)/.exec(x.trim()); return m?{a:+m[1]*60+ +m[2],b:+m[3]*60+ +m[4],k:m[5].trim()}:null; }).filter(Boolean); }
window.__oplan=(n,m)=>{ const L=OPLAN[n.id]; if(!L) return false; const e=L.find(e=>m>=e.a&&m<e.b); if(e){ if(mealState().phase==='eat') return false; return runTask(n,e.k,m); } if(n.task&&TASKS[n.task]&&!n.errand){ leaveSpot(n); n.task=null; } return false; };
const DINE_SEAT2={li:3,he:5,fu:8,lai:11};
function seatAt(n,si,pose,until,then){ n.sSi=si; const s=SEATS[si]; npcGo(n,s.ap,m=>{ npcPlace(m,{x:s.x,z:s.z},s.yaw); m.pose=pose; m.act='staff'; m.busyUntil=until; if(then) then(m); }); }
function leaveSpot(n){ if(n.lie||n.pose||n.sSi>=0||n.atBed){ const p=n.sSi>=0?SEATS[n.sSi].ap:n.atBed||n.lie?bedAp(bedOf(n)):null; npcStand(n,p); } }
function runTask(n,key,m){ const T=TASKS[key]||TASKS.休息, now=Date.now(); if(n.task!==key){ leaveSpot(n); n.task=key; n.ti=0; }
  if(T.nap){ if(!n.lie) goLie(n,false); else { n.act='lie'; n.busyUntil=now+30000; } return true; }
  if(T.bed){ if(n.pose===T.pose&&n.atBed){ n.busyUntil=now+30000; return true; } leaveSpot(n); bedSit(n,now+30000,T.pose); return true; }
  if(T.dine){ const si=DINE_SEAT[n.id]; if(n.sSi===si){ n.busyUntil=now+30000; return true; } leaveSpot(n); seatAt(n,si,'dsit',now+30000); return true; }
  if(T.cls){ if(n.sSi>=0&&SEATS[n.sSi].kind==='cls'){ n.busyUntil=now+30000; return true; } leaveSpot(n); const si=seatsOf('cls').reverse().find(i=>i!==ME.seat&&!occupied(i)); if(si==null){ n.busyUntil=now+15000; return true; } seatAt(n,si,'class',now+30000); return true; }
  if(T.errand) return errand(n);
  leaveSpot(n); const sp=T.by?T.by[n.id]:T.spots[n.ti++%T.spots.length], p=typeof sp==='function'?sp():sp;
  npcGo(n,p,k=>{ if(T.face) npcFace(k,typeof T.face==='function'?T.face():T.face); k.act=T.act; k.busyUntil=Date.now()+T.dur*(.8+Math.random()*.4); if(T.hum&&near(k,8)&&Math.random()<.5) npcSay(k.id,NT('he.hum')); });
  return true; }
// 許總管 sends 阿來 (or 阿福) off with something: to him, then to the gate, the store or the kitchen, and back to work
function errand(n){ const xu=NPC.xu, to=[NP.gate,NP.store,NP.kitchenIn,NP.tea][Math.floor(Math.random()*4)];
  leaveSpot(n); n.errand=true; npcGo(n,{x:xu.x+.7,z:xu.z+.3},k=>{ npcFace(k,xu); npcFace(xu,k); if(near(k,9)) npcSay('xu',NT('xu.call')); k.act='idle'; k.busyUntil=Date.now()+2500;
    k.next=()=>{ npcGo(k,to,j=>{ j.act='unload'; j.busyUntil=Date.now()+3000; j.next=()=>{ j.errand=false; j.task=null; j.busyUntil=0; }; }); }; });
  return true; }
window.__dayPlan=(n,m)=>{ const M=mealState(); if(M.phase==='eat'){ leaveSpot(n); n.task=null; return false; }
  if(n.seated&&typeof mealStand==='function') mealStand(n);
  return runTask(n,planNow(n.id,m),m); };
window.__kidPlan=(n,m)=>{ if(kidAsleep(m)){ if(n.task!=='sleep'){ leaveSpot(n); n.task='sleep'; } if(!n.lie){ const late=minsSince(m,KIDS.sleep)>20&&m>KIDS.sleep-1||m<KIDS.wake; goLie(n,late||Math.hypot(ME.x-n.x,ME.z-n.z)>30); } else { n.act='lie'; n.busyUntil=Date.now()+30000; } return true; }
  if(n.task==='sleep'){ n.task=null; leaveSpot(n); }
  return window.__dayPlan(n,m); };
// meals: the four sit at the free places of the round table
{ const f0=window.__seatNpc; for(const id in DINE_SEAT2) if(DINE.seats[DINE_SEAT2[id]]) DINE_SEAT[id]=DINE.seats[DINE_SEAT2[id]].si; }
// ---- calling the pages
const FOLLOW={last:{x:0,z:0,t:Date.now()}};
function callKid(id){ if(!isBoss()) return; const n=NPC[id]; if(!n) return;
  if(n.follow){ n.follow=false; n.errand=false; n.teaRun=false; n.busyUntil=0; n.path=[]; n.act='idle'; if(n.sSi>=0) npcStand(n,SEATS[n.sSi].ap); n.task=null; say2(id,id+'.bye'); renderKidUI(); return; }
  const woke=!!n.lie; leaveSpot(n); n.next=null; n.then=null; n.errand=false; n.task=null; n.follow=true; n.busyUntil=Infinity; n.carry=null; FOLLOW.last={x:ME.x,z:ME.z,t:Date.now()};
  npcSay(id,String(NT(id+'.call',woke?1:0)||NT(id+'.call',0)).replace('{稱呼}',titleFill().稱呼)); renderKidUI(); }
const kidUI=document.createElement('div'); kidUI.style.cssText='position:fixed;left:14px;bottom:132px;display:none;flex-direction:column;gap:5px;z-index:27';
document.body.append(kidUI);
function renderKidUI(){ const show=window.__entered&&isBoss(); kidUI.style.display=show?'flex':'none'; if(!show) return;
  const btn=(label,fn)=>{ const b=document.createElement('button'); b.type='button'; b.textContent=label; b.style.cssText='font:13px "Noto Serif TC",serif;padding:4px 10px;background:#f3ead8e8;color:#2a211a;border:1px solid #8a6a48;border-radius:2px;cursor:pointer;text-align:left'; b.onclick=e=>{ e.stopPropagation(); fn(); }; return b; };
  kidUI.innerHTML=''; for(const [id,key] of [['fu','F'],['lai','R']]){ const n=NPC[id]; kidUI.append(btn(String(NT('kid.callL',n.follow?1:0)).replace('{名}',npcName(id))+'（'+key+'）',()=>callKid(id))); }
  const L=NPC.lai; if(L.follow&&ME.seat>=0&&!L.teaRun) kidUI.append(btn(NT('lai.teaL'),teaRun)); }
setInterval(renderKidUI,1200);
addEventListener('keydown',e=>{ if(e.repeat||e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'||panel.classList.contains('open')||!window.__entered||!isBoss()) return; const k=e.key.toLowerCase();
  if(k==='f'){ e.preventDefault(); callKid('fu'); } else if(k==='r'){ e.preventDefault(); callKid('lai'); } });
function teaRun(){ const n=NPC.lai; if(!n.follow) return; n.teaRun=true; say2('lai','lai.teaGo'); n.path=[]; npcGo(n,{x:10.4,z:-2.2},k=>{ npcFace(k,{x:10.4,z:-4.5}); k.act='load'; k.busyUntil=Infinity; setTimeout(()=>{ k.carry=null; k.teaBack=true; k.path=[]; },4000); }); renderKidUI(); }
// where the followers stand: a step behind, one each side; outside the bath or the toilets; at the pictures, on the front sofa
const inBath=()=>ME.x>41.85&&ME.x<46.6&&ME.z>15.6&&ME.z<23.6, inWC=()=>ME.x>36.62&&ME.x<41.78&&ME.z>20.9&&ME.z<23.6;
ZL_ANIM.push(dt=>{ if(!window.__entered) return; const now=Date.now(); const ks=['fu','lai'].map(id=>NPC[id]).filter(n=>n.follow);
  // a lantern for 阿來 after dark while he is with you
  const L=NPC.lai; if(L.lantern){ const want=!!L.follow&&SKY_DAY<.35; if(L.lantern.visible!==want) L.lantern.visible=want; }
  if(!ks.length) return;
  if(Math.hypot(ME.x-FOLLOW.last.x,ME.z-FOLLOW.last.z)>.3||ME.seat>=0&&FOLLOW.seat!==ME.seat){ FOLLOW.last={x:ME.x,z:ME.z,t:now}; FOLLOW.seat=ME.seat; }
  const away=ME.x>53.4||now-FOLLOW.last.t>30*60000; if(away){ for(const n of ks){ n.follow=true; callKid(n.id); } return; }
  const fx=-Math.sin(ME.yaw), fz=-Math.cos(ME.yaw), rx=-fz, rz=fx, sk=ME.seat>=0?SEATS[ME.seat]:null, cine=sk&&(sk.kind==='cine'||sk.kind==='cine2');
  ks.forEach((n,i)=>{ const side=n.id==='fu'?-1:1;
    if(n.teaRun){ if(n.teaBack&&!n.path.length&&Math.hypot(n.x-ME.x,n.z-ME.z)>1.3){ npcGo(n,{x:ME.x+rx*side*.7,z:ME.z+rz*side*.7},k=>{ k.teaRun=false; k.teaBack=false; k.busyUntil=Infinity; npcFace(k,ME); say2('lai','lai.tea'); }); } else if(n.teaBack&&Math.hypot(n.x-ME.x,n.z-ME.z)<=1.3){ n.teaRun=false; n.teaBack=false; say2('lai','lai.tea'); } return; }
    if(cine){ if(n.sSi<0){ const si=seatsOf('cine').find(j=>j!==ME.seat&&!occupied(j)); if(si!=null) seatAt(n,si,'bedsit',Infinity); } return; }
    if(n.sSi>=0&&!cine){ npcStand(n,SEATS[n.sSi].ap); }
    let t; if(inBath()) t={x:40.9,z:19.0+i*.6}; else if(inWC()) t={x:38.9+i*.6,z:20.3}; else t={x:ME.x-fx*1.1+rx*side*.45,z:ME.z-fz*1.1+rz*side*.45};
    if((inBath()||inWC())&&!n.waitSaid){ n.waitSaid=true; if(i===0) say2(n.id,'kid.wait'); } if(!inBath()&&!inWC()) n.waitSaid=false;
    if(!walkable(t.x,t.z)) t={x:ME.x-fx*.9,z:ME.z-fz*.9};
    const d=Math.hypot(n.x-t.x,n.z-t.z), moved=!n.fT||Math.hypot(n.fT.x-t.x,n.fT.z-t.z)>.7;
    if(d>.6&&(moved||!n.path.length)){ n.fT=t; npcGo(n,t,k=>{ k.act='idle'; k.busyUntil=Infinity; }); }
    else if(d<=.6&&!n.path.length){ n.act='idle'; if(ME.seat>=0||d<.3) npcFace(n,ME); } n.busyUntil=Infinity; }); });
// a seat the master wants in class: the page moves to another
window.__npcYield=si=>{ for(const id of ['fu','lai']){ const n=NPC[id]; if(n.sSi===si&&!n.follow){ const alt=seatsOf(SEATS[si].kind).find(j=>j!==si&&j!==ME.seat&&!occupied(j)); if(alt==null) return false; const s=SEATS[alt]; n.sSi=alt; npcPlace(n,{x:s.x,z:s.z},s.yaw); return true; } } return false; };
// ---- talking with the four; teasing 阿荷
function tease(k){ const n=NPC.he, now=Date.now(); if(now-(n.teaseAt||0)>5*60000) n.teaseN=0; n.teaseAt=now; n.teaseN=(n.teaseN||0)+1;
  const you=NT('he.t'+k,0); if(you) toast(you,2600);
  if(n.teaseN>=3){ n.teaseN=0; say2('he','he.angry'); leaveSpot(n); n.task=null; n.errand=true; const c=NPC.chun; setTimeout(()=>npcGo(n,{x:c.x+.6,z:c.z+.4},m=>{ npcFace(m,c); npcFace(c,m); say2('chun','chun.defend'); m.act='idle'; m.busyUntil=Date.now()+8000; m.next=()=>{ m.errand=false; m.busyUntil=0; }; }),1800); return; }
  say2('he','he.r'+k); }

// 阿荷 sometimes speaks first when you pass; the master is welcomed home at the gate, and the pages nearby say hello
window.__npcNear=(n,now)=>{ if(n.id==='he'&&Math.random()<.35){ say2('he','he.hi'); return true; }
  if(n.id==='yu'&&isBoss()&&!FOLLOW.greeted){ FOLLOW.greeted=true; say2('yu','yu.boss'); for(const id of ['fu','lai']){ const k=NPC[id]; if(!k.follow&&!k.lie&&Math.hypot(k.x-ME.x,k.z-ME.z)<15) setTimeout(()=>say2(id,id+'.hi'),1500); } return true; }
  return false; };
// {% endraw %}
