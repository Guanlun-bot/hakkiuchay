// {% raw %}
// ---- the gate: whoever opens the page names themselves and dresses first; the house is built behind it meanwhile
let playMode=(new URLSearchParams(location.search).get('room')?'multi':(LS.get('hk-mode')==='solo'?'solo':'multi'));
let playRoom=(new URLSearchParams(location.search).get('room')||LS.get('hk-room')||'HAKKIUCHAY-01').trim().toUpperCase().slice(0,16)||'HAKKIUCHAY-01';
function enterHouse(){ const G=window.__gate||{}; const nm=String(G.name||'').trim().slice(0,12);
  if(nm){ myName=nm; LS.set('hk-name',myName); }
  if(G.color&&/^#[0-9a-f]{6}$/i.test(G.color)){ myColor=G.color; LS.set('hk-color',myColor); }
  myLook=cleanLook(G.look); LS.set('hk-look',JSON.stringify(myLook));
  if(fpHands?.sleeveMat) fpHands.sleeveMat.color.set(myColor);
  if(ME.av){ setAvatarLook(ME.av,myColor,myLook); }
  const nextMode=G.mode==='solo'?'solo':'multi';
  const nextRoom=String(G.room||playRoom||'HAKKIUCHAY-01').trim().toUpperCase().slice(0,16)||'HAKKIUCHAY-01';
  const roomChanged=nextMode!==playMode||nextRoom!==playRoom;
  playMode=nextMode; playRoom=nextRoom;
  LS.set('hk-mode',playMode); LS.set('hk-room',playRoom);
  if(G.ctrlMode==='hand'||G.ctrlMode==='fps'){ ctrlMode=G.ctrlMode; LS.set('hk-ctrl-mode',ctrlMode); }
  syncCtrlModeUI();
  try{ actx=actx||new (window.AudioContext||window.webkitAudioContext)(); actx.resume(); }catch{}
  const gate=document.getElementById('gate'); if(gate){ gate.classList.add('out'); setTimeout(()=>gate.classList.add('hide'),700); } window.__loadDone?.();
  if(!window.__entered){ window.__entered=true; setView('entry'); connectRoom(); }
  else { toast('換好了。'); if(roomChanged){ room?.disconnect?.(); room=null; for(const [,o] of others) scene.remove(o.av.g); others.clear(); connectRoom(); } }
  pushPresence(); renderPeople(); try{ $('#c').focus(); }catch{} }

const SEAT_SPOT={desk:[.45,.85],lounge:[1.25,.51],gongfu:[.36,.645],irori:[.32,TATAMI.h+.045],modern:[.42,ZP.modern.h+.045]};
/* ---------- per frame ---------- */
function tickZhiliao(dt){ const now=Date.now(), tt=performance.now()/1000;
  // the fire: sprites lick upward at their own pace, the light flickers with them
  if(fireplace.light){ const f=fireplace.on?1:0; fireplace.light.intensity=f*3.2*(.8+.12*Math.sin(tt*11)+.08*Math.sin(tt*23.7)); fireplace.glow.material.opacity=f*(.7+.2*Math.sin(tt*7));
    for(const F of fireplace.flames){ const k=(.7+.3*Math.sin(tt*F.sp+F.ph))*(.85+.15*Math.sin(tt*F.sp*2.3+F.ph)); F.s.visible=f>0; const h=F.h*k+.05; F.s.scale.set(.15*(.8+.2*Math.sin(tt*3+F.ph)),h,1); F.s.position.y=.15+h/2; F.s.position.x=F.bx+Math.sin(tt*2.1+F.ph)*.012; F.s.material.opacity=.5+.45*k; } }
  tickShoji(dt); for(const f of ZL_ANIM) f(dt);
  // gongfu
  const GF=sharedLatest('gf',myGF), gel=GF?(now-GF.at)/1000:1e9;
  const glow=Math.min(1.6,(gel<0?0:gel<5?gel/5:gel<TEA_LAST?1:Math.max(0,1-(gel-TEA_LAST)/600))+(typeof FAN!=='undefined'?FAN.boost*.9:0));
  emberGF.emissiveIntensity=glow*(1.4+.4*Math.sin(tt*7)+.2*Math.sin(tt*13)); brazier.light.intensity=glow*1.4*(.9+.1*Math.sin(tt*11));
  const boilK=gel>6&&gel<TEA_LAST?Math.min(1,(gel-6)/6):0;
  for(const s of brazier.steam){ s.t=(s.t+dt*.5)%1; s.sp.position.set(brazier.spout.x+s.t*.05+Math.sin(s.t*8)*.01,brazier.spout.y+s.t*.3,Math.sin(s.t*6+s.sp.id)*.015); s.sp.material.opacity=.35*boilK*Math.sin(s.t*Math.PI); s.sp.scale.setScalar(.03+s.t*.1); }
  const served=gel>=22&&gel<TEA_LAST; const col=GF?TEAS[GF.t][2]:0;
  for(const c of GF_CUPS){ c.visible=served; c.userData.tea.visible=served; if(served) c.userData.tea.material.color.setHex(col); }
  for(const c of PINZI){ c.visible=!served; }
  if(GF&&gel<40&&(GF.mine||GF_SEATS.includes(ME.seat))){ const idx=GF_STEPS.filter(([t])=>gel>=t).length-1; const sk=GF.at+':'+idx;
    if(idx>=0&&sk!==gfStepSeen){ gfStepSeen=sk; toast(GF_STEPS[idx][1](TEAS[GF.t][0]),6000); if(idx===0) crackle(4); if(idx===1) boil(6.5,0,.6); if(idx===2) boil(3,0,1); if(idx===4) pour(1.6); if(idx===5) pour(1.2); } }
  // irori
  const IR=sharedLatest('ir',myIR), iel=IR?(now-IR.at)/1000:1e9;
  const want=irMode==='on'||(irMode==='auto'&&irSeason())||(iel<TEA_LAST&&irMode!=='off')?1:0;
  irori.fire+=(want-irori.fire)*Math.min(1,dt*.6);
  const fl=irori.fire*(.85+.1*Math.sin(tt*9)+.05*Math.sin(tt*23));
  ember.emissiveIntensity=1.6*fl; irori.light.intensity=3.2*fl;
  for(const s of irori.steam){ s.t=(s.t+dt*.4)%1; s.sp.position.set(irori.spout.x+s.t*.06,irori.spout.y+s.t*.35,Math.sin(s.t*6+s.sp.id)*.02); s.sp.material.opacity=.3*Math.max(0,irori.fire-.3)*Math.sin(s.t*Math.PI); s.sp.scale.setScalar(.04+s.t*.12); }
  const iserv=iel>=12&&iel<TEA_LAST;
  IRORI_CUPS.forEach(c=>{ c.visible=iserv; c.userData.tea.visible=iserv; if(iserv) c.userData.tea.material.color.setHex(TEAS[IR.t][2]); });
  if(IR&&iel<30&&(IR.mine||IRORI_SEATS.includes(ME.seat))){ const idx=IR_STEPS.filter(([t])=>iel>=t).length-1; const sk=IR.at+':'+idx;
    if(idx>=0&&sk!==irStepSeen){ irStepSeen=sk; toast(IR_STEPS[idx][1](TEAS[IR.t][0]),5000); if(idx===0){ boil(2.8,0,.9); pour(1.4,1.6); } if(idx===2) pour(1.4); if(idx===3) pour(1.0); } }
  // my snack in front of me
  const st=ME.seat>=0?SEATS[ME.seat]:null, sp=st&&SEAT_SPOT[st.kind];
  mySnackMesh.visible=mySnack>=0&&!!sp&&sp[0]>0;
  if(mySnackMesh.visible){ const [fx,fz]=lookY(st.yaw); mySnackMesh.position.set(st.x+fx*(sp[0]+.08)+fz*.2,sp[1]-.04,st.z+fz*(sp[0]+.08)-fx*.2); mySnackMesh.rotation.y=st.yaw; }
}
function teaStatus(kind){ const f=kind==='gongfu'?['gf',myGF,22]:kind==='modern'?['md',myMD,MD_SERVE]:['ir',myIR,12]; const s=sharedLatest(f[0],f[1]); if(!s) return ''; const el=(Date.now()-s.at)/1000; return el>=f[2]&&el<TEA_LAST?'・'+TEAS[s.t][0]:el>=0&&el<f[2]?'・泡茶中':''; }

/* ---------- two preset views: the plan, seen from above with the roof cut away, and the courtyard entrance at eye height ---------- */
const VIEW={mode:'walk',thirdPerson:false,theta:Math.PI,phi:.001,r:15.5,target:new THREE.Vector3(0,0,(ZP.front+ZP.back)/2)};
let ctrlMode=LS.get('hk-ctrl-mode')==='hand'?'hand':'fps';
function syncCtrlModeUI(){
  const cs=$('#ctrl-mode'); if(cs) cs.value=ctrlMode;
  if(window.__gate) window.__gate.ctrlMode=ctrlMode;
  if(ctrlMode==='hand'&&document.pointerLockElement===canvas) document.exitPointerLock();
}
$('#ctrl-mode')?.addEventListener('change',e=>{
  ctrlMode=e.target.value==='hand'?'hand':'fps';
  LS.set('hk-ctrl-mode',ctrlMode);
  syncCtrlModeUI();
  toast(ctrlMode==='hand'?'切換為手模式：自由鼠標點擊物件、拖曳轉動視角':'切換為 FPS 模式：點擊畫面鎖定視角、移動滑鼠轉向',3000);
});
syncCtrlModeUI();
let baseFov=fovFor(innerWidth/innerHeight), minFov=24, targetFov=baseFov, isRightMouseDown=false;
function toggleThirdPerson(){
  if(VIEW.mode==='plan') setView('walk');
  VIEW.thirdPerson=!VIEW.thirdPerson;
  const b=$('#bThird'); if(b) b.textContent=VIEW.thirdPerson?'第一人稱視角 (V)':'第三人稱視角 (V)';
  toast(VIEW.thirdPerson?'切換為第三人稱背後視角（按 V 切回第一人稱）':'切換為第一人稱視角',2600);
}
const planClip=[new THREE.Plane(new THREE.Vector3(0,-1,0),2.35)];
const planFill=new THREE.AmbientLight(0xfff1dc,0); scene.add(planFill);
function setView(mode){ closePanel(); if(mode!=='plan'&&PLAN_FOG){ PLAN_FOG=false; updateSky(); }
  if(mode==='plan'){ if(document.pointerLockElement===canvas) document.exitPointerLock(); if(ME.seat>=0) standUp(); ME.path=[]; VIEW.mode='plan'; VIEW.theta=Math.PI/2; VIEW.phi=.001; VIEW.r=62; VIEW.target.set(19.6,0,courtAxis); PLAN_FOG=true; updateSky(); renderer.clippingPlanes=planClip; planFill.intensity=1.1; $('#planbar').classList.remove('hide');
    toast(isTouch?'俯視平面：拖曳旋轉・按＋－縮放':'俯視平面：拖曳旋轉・滾輪縮放・按 W A S D 回到行走',8000); }
  else { VIEW.mode='walk'; renderer.clippingPlanes=[]; planFill.intensity=0; $('#planbar').classList.add('hide'); }
  if(mode==='entry'){ if(ME.seat>=0) standUp(); ME.path=[]; { let x=51.3, z=courtAxis; for(let k=0;k<30;k++){ const xx=50.5+Math.random()*1.6, zz=courtAxis+(Math.random()-.5)*6; if(walkable(xx,zz)){ x=xx; z=zz; break; } } ME.x=x; ME.z=z; } ME.yaw=Math.PI/2; ME.pitch=-.02; ME.targetYaw=null; pushPresence();
    toast((VRT.entry&&String(VRT.entry.body||'').trim())||'學鳩齋門前。走過第一進的埕，穿過過廳是第二進，再往北穿過南廳就是第三進：東廂學鳩齋、西廂知了間，正面是龍江衍派正廳。按「宅院平面」看大家在哪。',9000); } }
function applyCamera(){
  if(VIEW.mode==='plan'){ const t=VIEW.target, sp=Math.sin(VIEW.phi);
    rig.position.set(t.x+VIEW.r*sp*Math.sin(VIEW.theta),0,t.z+VIEW.r*sp*Math.cos(VIEW.theta)); rig.rotation.y=VIEW.theta;
    camera.position.set(0,VIEW.r*Math.cos(VIEW.phi),0); camera.rotation.set(-(Math.PI/2-VIEW.phi),0,0); return; }
  rig.position.set(ME.x,0,ME.z); rig.rotation.y=ME.yaw;
  const bob=(!renderer.xr.isPresenting&&ME.seat<0&&!(ME.jy>0))?(ME.bobY||0):0;
  if(!renderer.xr.isPresenting){
    if(VIEW.thirdPerson){
      const dist=2.25, p=Math.max(-0.55,Math.min(0.85,ME.pitch));
      const camY=Math.max(0.45,ME.eye+0.42-Math.sin(p)*1.25+bob);
      const camZ=Math.max(0.9,Math.cos(p)*dist);
      camera.position.set(0,camY,camZ);
      camera.rotation.set(p*0.65-0.12,0,0);
    } else {
      camera.position.set(0,ME.eye+bob,0); camera.rotation.set(ME.pitch,0,0);
    }
  } }
function planDrag(dx,dy){ const k=isTouch?.006:.0042; VIEW.theta-=dx*k; VIEW.phi=Math.max(.001,Math.min(1.3,VIEW.phi+dy*k)); }
function planZoom(f){ VIEW.r=Math.max(4,Math.min(44,VIEW.r*f)); }


applyLighting();

/* ---------------- coffee ordering ---------------- */
let myDrink=-1, brewing=null, myDoors={};
const steamMat=new THREE.SpriteMaterial({map:textCanvas(64,64,(g,w,h)=>{ const r=g.createRadialGradient(32,32,0,32,32,32); r.addColorStop(0,'rgba(255,255,255,.7)'); r.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=r; g.fillRect(0,0,w,h); }),transparent:true,depthWrite:false});
const steam=[]; for(let i=0;i<14;i++){ const sp=new THREE.Sprite(steamMatBase.clone()); sp.visible=false; sp.scale.set(.12,.12,1); scene.add(sp); steam.push({sp,t:Math.random()}); }
coffeeMachine.updateMatrixWorld(true);
const steamOrigin=coffeeMachine.localToWorld(new THREE.Vector3(0,1.12,.12));
function hiss(sec){ try{ actx=actx||new (window.AudioContext||window.webkitAudioContext)(); actx.resume(); const n=actx.sampleRate*sec, buf=actx.createBuffer(1,n,actx.sampleRate), d=buf.getChannelData(0); for(let i=0;i<n;i++) d[i]=(Math.random()*2-1)*Math.min(1,i/4000)*Math.min(1,(n-i)/9000);
  const src=actx.createBufferSource(); src.buffer=buf; const f=actx.createBiquadFilter(); f.type='bandpass'; f.frequency.value=3200; f.Q.value=.7; const g=actx.createGain(); g.gain.value=.05; src.connect(f).connect(g).connect(actx.destination); src.start(); }catch{} }
function showCoffee(){ const body=openPanel('咖啡',`<p class="meta">點一杯，咖啡做好後會送到你的座位；沒坐下的話就拿在手上。在齋的人也看得到你在喝什麼。</p><div class="vol">豆子：<b>${esc(BEANS[myBean][0])}</b>　<span class="ba">${esc(BEANS[myBean][1])}</span>　<button class="btn" id="cbean" style="margin:0 0 0 auto">換豆子</button></div><ul class="list menu">${DRINKS.map(([zh,en,d],i)=>`<li data-d="${i}"><div><div class="bt">${zh}　<span class="ba">${en}</span></div><div class="ba">${d}</div></div><span class="ba">${i===myDrink?'手上這杯':'點這杯'}</span></li>`).join('')}</ul>`);
  body.querySelector('#cbean').onclick=()=>showBeans(showCoffee);
  body.querySelector('.list').onclick=e=>{ const li=e.target.closest('li[data-d]'); if(!li) return; if(brewing){ toast('咖啡機正在做上一杯。'); return; } const i=+li.dataset.d; closePanel();
    brewing={i,t0:performance.now(),dur:9000}; grind(1.6); setTimeout(()=>hiss(5.5),1700); toast(`磨${BEANS[myBean][0]}，做${DRINKS[i][0]}……`,9000); }; }
function grind(sec){ try{ actx=actx||new (window.AudioContext||window.webkitAudioContext)(); actx.resume(); const o=actx.createOscillator(), n=actx.createGain(), f=actx.createBiquadFilter(); o.type='sawtooth'; o.frequency.value=95; f.type='lowpass'; f.frequency.value=900; n.gain.setValueAtTime(.0001,actx.currentTime); n.gain.exponentialRampToValueAtTime(.05,actx.currentTime+.1); n.gain.exponentialRampToValueAtTime(.0001,actx.currentTime+sec); o.connect(f).connect(n).connect(actx.destination); o.start(); o.stop(actx.currentTime+sec+.05); }catch{} }
function setDrink(i){ if(i>=0&&i!==myDrink||i>=0&&myDrink<0) myCoffeeAt=Date.now(); myDrink=i; $('#drink').classList.toggle('hide',i<0); if(i>=0) $('#dname').textContent='☕ '+DRINKS[i][0]+'（'+BEANS[myBean][0]+'）'; pushPresence(); renderPeople(); }
$('#dfin').onclick=()=>setDrink(-1); $('#dsip').onclick=()=>takeSip();
const myCup=classicCup(scene,0,0,0,{saucer:true}); myCup.visible=false;
if(false){ const crema=new THREE.Mesh(new THREE.CircleGeometry(.04,16),new THREE.MeshStandardMaterial({color:0x9a6a3e,roughness:.6})); crema.rotation.x=-Math.PI/2; crema.position.y=.042; myCup.add(crema); }

/* ---------------- record player ---------------- */
const BUILTIN_MUSIC=[
  {t:'Gymnopédie No. 1（書齋琴音）',a:'Erik Satie · 合成黑膠',synth:0},
  {t:'Clair de Lune（月夜微光）',a:'Claude Debussy · 合成黑膠',synth:1},
  {t:'春庭古韻（五聲音階）',a:'學鳩齋 · 古琴意象',synth:2},
  {t:'雨落茶室（靜心旋律）',a:'學鳩齋 · 氛圍黑膠',synth:3}
];
const _serverMusic=await (async()=>{ try{ const r=await fetch('/api/music'); if(!r.ok) return []; const j=await r.json(); return Array.isArray(j)?j:[]; }catch{ return []; } })();
const _rawMusic=(Array.isArray(VRD.music)&&VRD.music.filter(m=>m&&m.file).length)?VRD.music.filter(m=>m&&m.file).map(m=>({t:String(m.title||String(m.file).split('/').pop().replace(/\.[a-z0-9]+$/i,'')),a:String(m.artist||''),f:String(m.file)})):(_serverMusic.length?_serverMusic:(Array.isArray(D.music)?D.music:[]));
const MUSIC=_rawMusic.length?_rawMusic:BUILTIN_MUSIC;
const synthWavCache=new Map();
function buildSynthWavUrl(kind){
  if(synthWavCache.has(kind)) return synthWavCache.get(kind);
  const sr=22050, dur=42, n=sr*dur, buf=new Int16Array(n);
  const chords=[
    [[196,246.94,293.66,369.99],[164.81,246.94,293.66,369.99]], // Gymnopédie-like Gmaj7 / Em7
    [[174.61,220,261.63,329.63],[146.83,220,261.63,349.23]],   // Fmaj7 / Dm7
    [[220,261.63,293.66,329.63],[196,246.94,293.66,392.00]],   // Pentatonic
    [[164.81,196,246.94,329.63],[130.81,196,246.94,293.66]]    // Warm ambient
  ][kind%4];
  const mels=[
    [587.33,659.25,587.33,493.88,440,392,440,493.88],
    [523.25,659.25,587.33,523.25,440,392,440,523.25],
    [440,523.25,587.33,659.25,587.33,440,392,329.63],
    [392,493.88,587.33,493.88,440,392,329.63,293.66]
  ][kind%4];
  const beatDur=1.5;
  for(let i=0;i<n;i++){
    const t=i/sr, bar=Math.floor(t/(beatDur*2)), bt=(t%beatDur)/beatDur, ch=chords[bar%2];
    const padEnv=Math.sin(Math.min(1,(t%(beatDur*2))/(beatDur*2))*Math.PI);
    let sig=0;
    for(const f of ch) sig+=Math.sin(2*Math.PI*f*t)*0.11*(0.55+0.45*padEnv);
    const mIdx=Math.floor(t/beatDur)%mels.length, mf=mels[mIdx];
    const mEnv=Math.exp(-bt*3.2)*Math.min(1,bt*28);
    sig+=(Math.sin(2*Math.PI*mf*t)+0.25*Math.sin(4*Math.PI*mf*t))*0.18*mEnv;
    // subtle vinyl warmth
    sig+=(Math.sin(i*1.7)*0.004);
    const fade=Math.min(1,t*2,Math.max(0,(dur-t)*2));
    buf[i]=Math.max(-32767,Math.min(32767,Math.round(sig*fade*32767*0.8)));
  }
  const wav=new ArrayBuffer(44+buf.byteLength), dv=new DataView(wav);
  const ws=(o,s)=>{ for(let i=0;i<s.length;i++) dv.setUint8(o+i,s.charCodeAt(i)); };
  ws(0,'RIFF'); dv.setUint32(4,36+buf.byteLength,true); ws(8,'WAVE'); ws(12,'fmt ');
  dv.setUint32(16,16,true); dv.setUint16(20,1,true); dv.setUint16(22,1,true);
  dv.setUint32(24,sr,true); dv.setUint32(28,sr*2,true); dv.setUint16(32,2,true); dv.setUint16(34,16,true);
  ws(36,'data'); dv.setUint32(40,buf.byteLength,true);
  new Int16Array(wav,44).set(buf);
  const url=URL.createObjectURL(new Blob([wav],{type:'audio/wav'}));
  synthWavCache.set(kind,url); return url;
}
let myRec=null, recKey='', recEff=null, recVolume=+(LS.get('hk-vol')||.6), recMuted=LS.get('hk-mute')==='1', needGesture=false;
const audio=new Audio(); audio.preload='auto';
audio.addEventListener('ended',()=>{ if(recEff&&recEff.mine&&MUSIC.length){ myRec={t:(recEff.t+1)%MUSIC.length,at:Date.now()}; pushPresence(); syncRecord(); } });
function effectiveRec(){ let best=myRec&&num(myRec.at)>0?{t:myRec.t,at:myRec.at,by:'你',mine:true}:null;
  for(const [,o] of others){ const r=o.p&&o.p.rec; if(!r||typeof r!=='object') continue; const t=num(r.t,-2), at=num(r.at); if(t<-1||t>=MUSIC.length||!(at>0)) continue; if(!best||at>best.at) best={t,at,by:str(o.p.n,12)||'訪客',mine:false}; }
  return best; }
function syncRecord(){ const eff=effectiveRec(); const key=eff?eff.t+'@'+eff.at:''; recEff=eff; if(key===recKey) return; recKey=key;
  if(!eff||eff.t<0||!MUSIC[eff.t]){ audio.pause(); return; }
  const tr=MUSIC[eff.t];
  if(typeof tr.synth==='number'){ audio.src=buildSynthWavUrl(tr.synth); }
  else { const f=tr.f; audio.src=f.startsWith('/music/')?f:(/^(\/|https?:)/.test(f)?encodeURI(f):'music/'+encodeURIComponent(f)); }
  seekPending=eff; trySeek(); }
let seekPending=null;
audio.addEventListener('loadedmetadata',()=>trySeek());
function trySeek(){ if(!seekPending||audio.readyState<1) return; const eff=seekPending; seekPending=null;
  let off=(Date.now()-eff.at)/1000;
  if(off<0) off=0;
  if(isFinite(audio.duration)&&audio.duration>1&&off>=audio.duration-0.5) off=off%audio.duration;
  try{ audio.currentTime=Math.max(0,off); }catch{}
  audio.play().catch(()=>{ needGesture=true; toast('點一下畫面或按任意鍵，就會聽到唱片的聲音。'); }); }
function unlockRecAudio(){ if(!needGesture||!recEff||recEff.t<0) return; needGesture=false;
  let off=(Date.now()-recEff.at)/1000; if(off<0) off=0;
  if(isFinite(audio.duration)&&audio.duration>1&&off>=audio.duration-0.5) off=off%audio.duration;
  try{ if(audio.readyState>=1) audio.currentTime=Math.max(0,off); }catch{}
  audio.play().catch(()=>{ needGesture=true; }); }
addEventListener('pointerdown',unlockRecAudio);
addEventListener('keydown',unlockRecAudio);
function showRecord(){ const eff=effectiveRec(); const now=eff&&eff.t>=0&&MUSIC[eff.t];
  const list=MUSIC.length?`<ul class="list menu">${MUSIC.map((m,i)=>`<li data-m="${i}"><div><div class="bt">${esc(m.t)}</div>${m.a?`<div class="ba">${esc(m.a)}</div>`:''}</div><span class="ba">${now&&eff.t===i?'播放中':'放這張'}</span></li>`).join('')}</ul>`:'<p style="line-height:2">唱片架還是空的。把音檔傳給 Claude，就會放上唱片架。</p>';
  const body=openPanel('唱片機',`<p class="meta">${now?`正在播放〈${esc(now.t)}〉，${eff.mine?'是你放的':esc(eff.by)+' 放的'}。`:'現在沒有放唱片。'}在齋裡的人會一起聽到同一張；離唱片機越遠越小聲。</p>${list}
    <div class="vol">我的音量 <input type="range" min="0" max="1" step="0.05" value="${recVolume}" id="rv"></div>
    <button class="btn" id="rmute">${recMuted?'取消靜音':'我這裡靜音'}</button>${now?'<button class="btn" id="rstop">停止唱片</button>':''}`);
  const ul=body.querySelector('.list'); if(ul) ul.onclick=e=>{ const li=e.target.closest('li[data-m]'); if(!li) return; needGesture=false; myRec={t:+li.dataset.m,at:Date.now()}; pushPresence(); syncRecord(); showRecord(); };
  body.querySelector('#rv').oninput=e=>{ recVolume=+e.target.value; LS.set('hk-vol',recVolume); };
  body.querySelector('#rmute').onclick=()=>{ recMuted=!recMuted; LS.set('hk-mute',recMuted?'1':'0'); showRecord(); };
  const st=body.querySelector('#rstop'); if(st) st.onclick=()=>{ myRec={t:-1,at:Date.now()}; pushPresence(); syncRecord(); showRecord(); }; }

/* ---------------- per-frame extras ---------------- */
let syncT=0;
function tickExtras(dt){
  // brewing and steam
  if(brewing){ const k=(performance.now()-brewing.t0)/brewing.dur;
    for(const s of steam){ s.t=(s.t+dt*.9)%1; s.sp.visible=k<.75; s.sp.position.copy(steamOrigin).add(new THREE.Vector3(Math.sin(s.t*9+s.sp.id)*.03,s.t*.35,0)); s.sp.material.opacity=.6*(1-s.t); s.sp.scale.setScalar(.06+s.t*.16); }
    if(k>=1){ const i=brewing.i; brewing=null; for(const s of steam) s.sp.visible=false; setDrink(i); bell(); toast(ME.seat>=0?`${DRINKS[i][0]}送到你的座位了。`:`${DRINKS[i][0]}好了，先拿在手上；坐下時會放到你面前。`); } }
  // my cup on the table in front of me
  const st=ME.seat>=0?SEATS[ME.seat]:null; const spot=st&&SEAT_SPOT[st.kind];
  myCup.visible=myDrink>=0&&!!spot; if(myCup.visible){ myCup.position.set(st.x-Math.sin(st.yaw)*spot[0]+Math.cos(st.yaw)*.18,spot[1]-.045,st.z-Math.cos(st.yaw)*spot[0]-Math.sin(st.yaw)*.18); }
  // doors: follow the shared state; leaves swing first, then the bar slides in (reverse when opening)
  for(const key in DOORS){ const d=DOORS[key]; const want=doorState(key); if(want!==d.open) d.open=want;
    const sp=dt*1.4;
    if(d.open){ if(d.barK>0) d.barK=Math.max(0,d.barK-sp*1.6); else d.k=Math.min(1,d.k+sp); }
    else { if(d.k>0) d.k=Math.max(0,d.k-sp); else d.barK=Math.min(1,d.barK+sp*1.6); }
    doorPose(d); }
  // breeze
  { const t=performance.now()/1000, gust=.5+.5*Math.sin(t*.23)*Math.sin(t*.61);
    if(PINE) treeStep(dt,t);
    lanternStep(dt,t);
    const wv=windAt(t,2), drift=1.5+wv*1.6;
    for(const lf of LEAVES){ lf.t+=dt*(.05+gust*.03+wv*.012); if(lf.t>1) { lf.t=0; lf.x0=-5+Math.random()*10-Math.cos(WIND.dir)*drift*.5; lf.z0=courtAxis-5+Math.random()*10-Math.sin(WIND.dir)*drift*.5; lf.dir=WIND.dir+(Math.random()-.5)*.6; }
      lf.m.position.set(lf.x0+lf.t*drift*Math.cos(lf.dir)+Math.sin(t*2+lf.ph)*.3, 4.2*(1-lf.t)+.05, lf.z0+lf.t*drift*Math.sin(lf.dir)); lf.m.rotation.set(t*2+lf.ph,t*1.5,t+lf.ph); } }
  tickZhiliao(dt);
  // cuckoo clock (Taipei time)
  { const [h,m]=taipeiClock.format(new Date()).split(':').map(Number), sec=new Date().getSeconds();
    cuckoo.minH.rotation.z=-(m+sec/60)/60*Math.PI*2; cuckoo.hourH.rotation.z=-((h%12)+m/60)/12*Math.PI*2;
    cuckoo.pend.rotation.z=Math.sin(performance.now()/1000*Math.PI)*.18;
    if(m===0&&cuckoo.last!==h){ cuckoo.last=h; cuckoo.pop=((h%12)||12)*1.0+.6; if(zoneOf(ME)==='S') cuckooCall((h%12)||12); }
    if(m!==0) cuckoo.last=-1;
    if(cuckoo.pop>0){ cuckoo.pop-=dt; cuckoo.cu.position.z=Math.min(.24,cuckoo.cu.position.z+dt*.6); cuckoo.door.position.x=.05; } else { cuckoo.cu.position.z=Math.max(.1,cuckoo.cu.position.z-dt*.4); cuckoo.door.position.x=0; } }
  // cigarette smoke
  const inc=INCENSE[myIncense];
  for(const c of SMOKES) for(const p of c.smoke){ if(c.censer){ if(!inc[2]){ p.sp.material.opacity=0; continue; } p.sp.material.color.setHex(inc[2]); } p.t=(p.t+dt*.22)%1; p.sp.position.set(c.x+Math.sin(p.t*7+c.x*40)*.012*(1+p.t*3),c.y+p.t*.42,c.z+Math.cos(p.t*5)*.008*(1+p.t*3)); p.sp.material.opacity=.32*Math.sin(p.t*Math.PI); p.sp.scale.setScalar(.012+p.t*.07); }
  // record player: shared state, spatial volume, spinning platter
  syncT+=dt; if(syncT>.5){ syncT=0; syncRecord(); }
  trySeek();
  if(recEff&&recEff.t>=0&&audio.paused&&!needGesture&&!seekPending&&audio.readyState>=2){
    audio.play().catch(()=>{ needGesture=true; });
  }
  const playing=!audio.paused&&recEff&&recEff.t>=0; if(playing){ platter.rotation.y-=dt*3.49; if(TEA_PLATTER) TEA_PLATTER.rotation.y-=dt*3.49; }
  const d=Math.hypot(ME.x-recPos.x,ME.z-recPos.z), zone=zoneOf(ME);
  let v=Math.max(.14,Math.min(1,1.15-d/12)); if(zone==='C') v*=.45; else if(zone!=='S') v=Math.max(.12,v*.35);
  if(TEA_REC){ const d2=Math.hypot(ME.x-TEA_REC.x,ME.z-TEA_REC.z), rm=roomOf(ME); v=Math.max(v,rm==='NR'?Math.max(.25,Math.min(1,1.1-d2/7)):rm==='NM'?.35:rm==='NL'?.2:.12); }   // the tea room has its own gramophone
  audio.volume=recMuted?0:Math.min(1,recVolume*v*.75);
}
/* ---------------- avatars (others) ---------------- */
function nameTex(name,status,color){ const w=Math.round(512), h=Math.round(150); return textCanvas(w,h,(g)=>{ g.font=F(600,46); const tw=Math.min(w-20,Math.max(g.measureText(name).width, status?(g.font=F(400,34),g.measureText(status).width):0)+60);
  g.fillStyle='rgba(30,26,23,.78)'; const x0=(w-tw)/2; g.beginPath(); g.roundRect?g.roundRect(x0,8,tw,h-16,10):g.rect(x0,8,tw,h-16); g.fill(); g.fillStyle=color; g.fillRect(x0,8,8,h-16);
  g.textAlign='center'; g.fillStyle='#f3ecdc'; g.font=F(600,46); g.textBaseline='middle'; g.fillText(name,w/2,status?52:h/2); if(status){ g.font=F(400,32); g.fillStyle='#d7c9a8'; g.fillText(status,w/2,104);} }); }
function makeAvatarOld(color){ const g=new THREE.Group(); const body=new THREE.Mesh(new THREE.CylinderGeometry(0.17,0.3,1.15,16),new THREE.MeshStandardMaterial({color,roughness:.85})); body.position.y=0.6; g.add(body);
  const head=new THREE.Mesh(new THREE.SphereGeometry(0.13,16,12),new THREE.MeshStandardMaterial({color:0xe7cfb4,roughness:.7})); head.position.y=1.32; g.add(head);
  const hair=new THREE.Mesh(new THREE.SphereGeometry(0.135,16,8,0,Math.PI*2,0,Math.PI/2),new THREE.MeshStandardMaterial({color:0x1d1a18,roughness:.8})); hair.position.y=1.34; g.add(hair);
  const nose=new THREE.Mesh(new THREE.BoxGeometry(0.03,0.04,0.04),head.material); nose.position.set(0,1.31,-0.13); g.add(nose);
  const tag=new THREE.Sprite(new THREE.SpriteMaterial({depthTest:false,transparent:true})); tag.scale.set(0.9,0.26,1); tag.position.y=1.72; tag.renderOrder=5; g.add(tag);
  const cup=classicCup(g,.27,.88,-.14,{saucer:true,scale:1.1}); cup.visible=false;
  const snack=new THREE.Group(); g.add(snack);
  scene.add(g); return {g,body,tag,cup,snack,snI:-1,key:''}; }

/* ---------------- navigation ---------------- */
const ME={x:-4.9,z:courtAxis,yaw:-Math.PI/2,pitch:-0.04,seat:-1,eye:1.6,path:[],faceTo:null,afterArrive:null,av:null};
function walkable(x,z){ if(window.__caveWalk){ const c=window.__caveWalk(x,z); if(c!==undefined) return c; }
  const inRoom = x>-7.25*roomWidthScale && x<7.2*roomWidthScale && z>-3.25 && z<3.94;
  const axisZ=z-courtAxis;
  const inYard = Math.abs(x)<5.25 && Math.abs(axisZ)<5.25;
  const along = Math.min(Math.abs(x),Math.abs(axisZ));
  const towardRange = Math.max(Math.abs(x),Math.abs(axisZ));
  const sideHall = Math.abs(x)>Math.abs(axisZ);
  const sc = sideHall ? SIDE_SCALE : roomWidthScale;
  const dkey = sideHall ? (x<0?'W':'E') : (axisZ<0?'S':'N');
  const inDoor = along<(sideHall?1.3:.9)*sc && towardRange>=5.12 && towardRange<=6.5 && (!DOORS[dkey]||DOORS[dkey].open);
  const inOtherRange = axisZ>=0 || Math.abs(x)>Math.abs(axisZ);
  const inMatchingRoom = inOtherRange && along<7.2*sc &&
    towardRange>5.89 && towardRange<13.05;
  const fx=Math.abs(x-FIRST.cx)<Math.abs(x-FRONT.cx)?x-FIRST.cx:x-FRONT.cx, inFirst=(x>14.3&&x<FIRST.gate-.4||x>33.9&&x<FIRST.fx0+.5)&&z>FIRST.z0+.5&&z<FIRST.z1-.5;
  const inGateHall=x>25.45&&x<33.35&&Math.abs(axisZ)<4.55, inGateDoor=Math.abs(axisZ)<.83&&((x>24.4&&x<25.9)||(x>32.9&&x<34.3));
  const inFore=x>FIRST.fx0+.3&&x<FIRST.fx1-.45&&z>-3.75&&z<2*courtAxis+3.75||x>52.4&&x<53.7&&Math.abs(z-courtAxis)<1.25;   /* the court, and the gap in its low wall between the posts */
  const inBackDoor=x>12.9&&x<14.7&&Math.abs(axisZ)<.83;
  const inFirstWing=Math.abs(fx)<7.25*roomWidthScale&&((z>-3.25&&z<3.94)||(z>2*courtAxis-3.94&&z<2*courtAxis+3.25));
  const inFirstDoor=Math.abs(fx)<.8&&((z>=3.6&&z<=4.9)||(z>=2*courtAxis-4.9&&z<=2*courtAxis-3.6));
  let inSide=false; for(const r of SIDE_ROOMS) if(x>r.x0+.32&&x<r.x1-.32&&z>r.z0+.32&&z<r.z1-.32){ inSide=true; break; }
  const zz=z<courtAxis?z:2*courtAxis-z;   /* fold the west half onto the east: the rooms and doors are mirrored */
  const inSideDoor=(Math.abs(x+10.87)<.5&&zz>3.9&&zz<5.4)||(Math.abs(x-9.8)<.5&&zz>3.9&&zz<5.4)||(Math.abs(x-29.4)<.5&&zz>3.9&&zz<5.4);
  const inLaundryBack=x>LDRY.door.x0+.08&&x<LDRY.door.x1-.08&&z>23.3&&z<26.5;
  const inDine=(x>36.85&&x<41.55&&z>-3.86&&z<-3.0)||(x>36.7&&x<41.7&&z>20.98&&z<23.42)||(x>41.95&&x<46.5&&z>15.66&&z<23.45);   /* 明間 dining strip; the toilets in the west 明間 */   /* 明間: the strip behind the dining table's back bench */
  const inLand=!!(window.__landWalk&&window.__landWalk(x,z));
  if(!(inRoom||inYard||inDoor||inMatchingRoom||inFirst||inBackDoor||inFirstWing||inFirstDoor||inSide||inSideDoor||inGateHall||inGateDoor||inFore||inDine||inLand||inLaundryBack)) return false;
  if(inLand&&!inFore){ if(PATH_POSTS) for(const p of PATH_POSTS) if(Math.abs(x-p[0])<.26&&Math.abs(z-p[1])<.26) return false; return true; }
  if(zlBlocked(x,z)) return false;
  for(const o of OBST) if(x>o.x0-0.22&&x<o.x1+0.22&&z>o.z0-0.22&&z<o.z1+0.22) return false;
  if(!NPC_WALK) for(const b of DOOR_BLOCKS){ const d=DOORS[b.key]; if(d&&!d.open&&x>b.x0-.12&&x<b.x1+.12&&z>b.z0-.12&&z<b.z1+.12) return false; }
  return true; }
function segHitsRect(a,b,o,m=0.3){ for(let t=0;t<=1;t+=0.04){ const x=a.x+(b.x-a.x)*t,z=a.z+(b.z-a.z)*t; if(x>o.x0-m&&x<o.x1+m&&z>o.z0-m&&z<o.z1+m) return true;} return false; }
const ZONE_DIR={S:[0,-1],N:[0,1],W:[-1,0],E:[1,0]};
function zoneOf(p){ const dx=p.x, dz=p.z-courtAxis, ax=Math.abs(dx), az=Math.abs(dz);
  if(p.x>13.95||(p.x>12.2&&az>5.2)) return 'F';
  if(az>5.15&&p.x>7.4&&p.x<12.2) return 'E';   /* 過水間: reached through the 南廳 */
  if(az>5.15&&p.x<-7.4) return 'W';           /* 大房: reached through the 正廳 */
  if(ax<5.3&&az<5.3) return 'C';
  return az>=ax ? (dz<0?'S':'N') : (dx<0?'W':'E'); }
function doorPoint(zone,dist){ const [ux,uz]=ZONE_DIR[zone]; return {x:ux*dist+(zone==='N'?PX(PLAN.corridorX):0), z:courtAxis+uz*dist}; }   // 知了間: walk in along the corridor, clear of the divider wall
// straight line if it is clear; otherwise a grid search (A*) over walkable cells, then pull the path tight
function clearLine(a,b,lat=.07){ const L=Math.hypot(b.x-a.x,b.z-a.z), n=Math.max(1,Math.ceil(L/.05)), px=L?-(b.z-a.z)/L*lat:0, pz=L?(b.x-a.x)/L*lat:0; for(let k=1;k<=n;k++){ const x=a.x+(b.x-a.x)*k/n, z=a.z+(b.z-a.z)*k/n; if(!walkable(x,z)) return false; if(k<n&&(!walkable(x+px,z+pz)||!walkable(x-px,z-pz))) return false; } return true; }
let GRID_CLR=0;   // clearance a grid cell needs on all four sides (paths first try to keep a body's width off the walls)
function gridPath(a,b){ const h=.15, pad=8, x0=Math.min(a.x,b.x)-pad, z0=Math.min(a.z,b.z,courtAxis)-pad, nx=Math.ceil((Math.abs(a.x-b.x)+2*pad)/h)+1, nz=Math.ceil((Math.max(a.z,b.z,courtAxis)-Math.min(a.z,b.z,courtAxis)+2*pad)/h)+1;   // always spans the axis, where the halls' doors are
  const id=(i,j)=>j*nx+i, cx=i=>x0+i*h, cz=j=>z0+j*h, ok=new Int8Array(nx*nz).fill(-1);
  const free=(i,j)=>{ if(i<0||j<0||i>=nx||j>=nz) return false; const k=id(i,j); if(ok[k]<0){ const x=cx(i), z=cz(j), c=GRID_CLR; ok[k]=walkable(x,z)&&(!c||(walkable(x+c,z)&&walkable(x-c,z)&&walkable(x,z+c)&&walkable(x,z-c)))?1:0; } return ok[k]===1; };
  const near=p=>{ let best=null, bd=1e9; const i0=Math.round((p.x-x0)/h), j0=Math.round((p.z-z0)/h); for(let di=-3;di<=3;di++) for(let dj=-3;dj<=3;dj++){ const i=i0+di, j=j0+dj; if(free(i,j)){ const d=Math.hypot(cx(i)-p.x,cz(j)-p.z); if(d<bd){ bd=d; best=[i,j]; } } } return best; };
  const s0=near(a), g0=near(b); if(!s0||!g0) return null;
  const G=new Float32Array(nx*nz).fill(1e9), from=new Int32Array(nx*nz).fill(-1), done=new Uint8Array(nx*nz), open=[]; const goal=id(g0[0],g0[1]);
  const hf=(i,j)=>Math.hypot(i-g0[0],j-g0[1]); G[id(s0[0],s0[1])]=0; open.push([hf(s0[0],s0[1]),s0[0],s0[1]]);
  const up=k=>{ while(k){ const q=(k-1)>>1; if(open[q][0]<=open[k][0]) break; [open[q],open[k]]=[open[k],open[q]]; k=q; } }, pop=()=>{ const top=open[0], last=open.pop(); if(open.length){ open[0]=last; let k=0; for(;;){ const l=2*k+1, r=l+1; let m=k; if(l<open.length&&open[l][0]<open[m][0]) m=l; if(r<open.length&&open[r][0]<open[m][0]) m=r; if(m===k) break; [open[m],open[k]]=[open[k],open[m]]; k=m; } } return top; };
  let steps=0; while(open.length&&steps++<400000){ const [,i,j]=pop();
    const k=id(i,j); if(done[k]) continue; done[k]=1; if(k===goal) break;
    for(const [di,dj,c] of [[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,1.414],[1,-1,1.414],[-1,1,1.414],[-1,-1,1.414]]){ const ii=i+di, jj=j+dj; if(!free(ii,jj)||(di&&dj&&(!free(i+di,j)||!free(i,j+dj)))) continue;
      const kk=id(ii,jj), g=G[k]+c; if(g<G[kk]){ G[kk]=g; from[kk]=k; open.push([g+hf(ii,jj),ii,jj]); up(open.length-1); } } }
  if(!done[goal]) return null;
  const cells=[]; for(let k=goal;k>=0;k=from[k]) cells.push({x:cx(k%nx),z:cz(Math.floor(k/nx))}); cells.reverse(); cells.push(b);
  const out=[]; let cur=a; let i=0; while(i<cells.length){ let j=cells.length-1; while(j>i&&!clearLine(cur,cells[j])) j--; out.push(cells[j]); cur=cells[j]; i=j+1; }
  return out; }
function exitPts(z){ const back=[{x:15.0,z:courtAxis},{x:12.7,z:courtAxis}];
  return z==='F'?[...back,doorPoint('E',6.6),doorPoint('E',4.8)]:z==='C'?[]:[doorPoint(z,6.6),doorPoint(z,4.8)]; }
function route(a,b){ if(window.__stnRoute){ const sr=window.__stnRoute(a,b); if(sr) return sr; } const LO=window.__landOut;
  if(LO&&(LO(a)||LO(b))){ const gate={x:52.6,z:courtAxis}, out={x:55,z:courtAxis};
    if(LO(a)&&LO(b)) return window.__landRoute(a,b);
    if(LO(b)) return route(a,gate).concat([out]).concat(window.__landRoute(out,b));
    return window.__landRoute(a,out).concat([gate]).concat(route(gate,b)); }
  let pts=[a]; const za=zoneOf(a), zb=zoneOf(b);
  if(za!==zb){ if((za==='F'&&zb==='E')||(za==='E'&&zb==='F')){ const bk=[{x:15.0,z:courtAxis},{x:12.7,z:courtAxis}]; pts.push(...(za==='F'?bk:bk.reverse())); }
    else { pts.push(...exitPts(za)); pts.push(...exitPts(zb).reverse()); } }
  pts.push(b); const out=[pts[0]];
  for(let i=1;i<pts.length;i++){ const from=out[out.length-1], to=pts[i];
    if(clearLine(from,to,.2)){ out.push(to); continue; }
    // a path that keeps a body's width from walls and furniture; failing that one that just fits; failing that the straight line
    GRID_CLR=.2; let path=gridPath(from,to); GRID_CLR=0; if(!path&&clearLine(from,to)){ out.push(to); continue; } if(!path) path=gridPath(from,to);
    if(path) out.push(...path); else out.push(to); }
  return out.slice(1); }
function standUp(){ if(ME.seat<0) return; const s=SEATS[ME.seat]; ME.seat=-1; const back=seatApproach(s);
  ME.x=back.x; ME.z=back.z; if(!walkable(ME.x,ME.z)){ // the nearest open floor round the seat, never through a wall
    let best=null; for(let r=.2;r<2&&!best;r+=.15) for(let a=0;a<6.28;a+=.3){ const xx=back.x+Math.cos(a)*r, zz=back.z+Math.sin(a)*r; if(walkable(xx,zz)){ best={x:xx,z:zz}; break; } }
    if(best){ ME.x=best.x; ME.z=best.z; } } $('#timer').classList.add('hide'); setFocus('',0); pushPresence(); }
function goTo(x,z,{faceTo=null,after=null}={}){ if(ME.seat>=0) standUp(); if(!walkable(x,z)){ // nudge toward nearest walkable
    let best=null; for(let r=0.2;r<1.6&&!best;r+=0.2) for(let a=0;a<6.28;a+=0.4){ const xx=x+Math.cos(a)*r, zz=z+Math.sin(a)*r; if(walkable(xx,zz)){best={x:xx,z:zz};break;} } if(!best) return; x=best.x; z=best.z; }
  ME.path=route({x:ME.x,z:ME.z},{x,z}); ME.faceTo=faceTo; ME.afterArrive=after; }
function sit(si){ const s=SEATS[si]; if(occupied(si)&&!(window.__npcYield&&window.__npcYield(si))){ toast('這個位子有人坐了'); return; }
  const approach=seatApproach(s);
  goTo(approach.x,approach.z,{after:()=>{ ME.seat=si; const P=seatPlace(s); ME.x=P.x; ME.z=P.z; ME.yaw=s.yaw; ME.pitch=SEAT_KIND[s.kind].pitch; setTimerButtons(s.kind); $('#timer').classList.remove('hide'); updateTimerUI(); pushPresence();
    toast(SEAT_KIND[s.kind].hello); }}); }

/* ---------------- input ---------------- */
const keys=new Set();
addEventListener('keydown',e=>{ if(e.target.tagName==='INPUT'||e.target.tagName==='SELECT') return; if(e.key==='Enter'&&!e.repeat){ e.preventDefault(); openChat(); return; } if(e.key===' '){ e.preventDefault(); if(!e.repeat) doJump(); return; } if(e.key.toLowerCase()==='e'&&!e.repeat){ if(panel.classList.contains('open')||!$('#reader').classList.contains('hide')){ closePanel(); closeReader(); if(ctrlMode==='fps'&&!locked()&&VIEW.mode==='walk'&&!renderer.xr.isPresenting) try{ canvas.requestPointerLock?.()?.catch(()=>{}); }catch{} } else if(VIEW.mode==='walk'&&window.__entered&&!renderer.xr.isPresenting){ applyCamera(); camera.updateWorldMatrix(true,false); click(innerWidth/2,innerHeight/2); } return; } if(e.key.toLowerCase()==='z'&&!e.repeat){ toggleCrouch(); return; } if(e.key.toLowerCase()==='v'&&!e.repeat){ toggleThirdPerson(); return; } if(e.key.toLowerCase()==='c'&&!e.repeat){ toggleSmoke(); return; } if(e.key.toLowerCase()==='m'&&!e.repeat){ window.__toggleVoiceMic?.(); return; } if(e.key==='F2'){ e.preventDefault(); toggleDiag(); return; } keys.add(e.key.toLowerCase()); if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(e.key.toLowerCase())){ if(VIEW.mode==='plan') setView('walk'); ME.path=[]; if(ME.seat>=0) standUp(); } if(e.key==='Escape'){ closePanel(); closeReader(); } });
addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
addEventListener('blur',()=>{ keys.clear(); isRightMouseDown=false; });
const aim=document.getElementById('aim');
/* ---- the four-corner HUD: the almanac folds open for the lights and weather; on phones the actions fold into one button;
   晝／夜: by default the colours follow the time of day in Taipei; pressing the button sets day or night (sky, lamps and
   the HUD) for this visit only */
var SKY_FORCE=null;
{ const ut=$('#utility'), dn=$('#bDayNight'), bl=$('#hud-bl');
  const T=k=>(window.HK_LOOK&&window.HK_LOOK.labels[k])||({'hud.day':'晝','hud.night':'夜'})[k];
  const apply=()=>{ const night=SKY_FORCE?SKY_FORCE==='night':SKY_DAY<.35; document.documentElement.dataset.hud=night?'night':'day'; dn.textContent=T(night?'hud.night':'hud.day'); dn.setAttribute('aria-pressed',SKY_FORCE?'true':'false'); };
  dn.addEventListener('click',()=>{ const night=document.documentElement.dataset.hud==='night'; SKY_FORCE=night?'day':'night'; updateSky(); apply(); toast(T(SKY_FORCE==='night'?'hud.night':'hud.day')); });
  window.__hudTheme=apply; setInterval(apply,5000); apply();
  // the dashboard: Tab opens and closes it (Esc closes); a click in the scene closes it
  // opening pops the card out from the menu button; closing plays it back in before the card is folded away
  let shutT=0; const dash=on=>{ clearTimeout(shutT); if(on){ ut.classList.remove('shut'); ut.open=true; if(document.pointerLockElement===canvas) document.exitPointerLock(); }
    else if(ut.open&&!ut.classList.contains('shut')){ ut.classList.add('shut'); shutT=setTimeout(()=>{ ut.open=false; ut.classList.remove('shut'); },170); } };
  window.__dash=dash; ut.querySelector('summary').addEventListener('click',e=>{ e.preventDefault(); dash(!ut.open||ut.classList.contains('shut')); });
  addEventListener('keydown',e=>{ if(e.target.tagName==='INPUT'||e.target.tagName==='SELECT'||e.target.tagName==='TEXTAREA') return;
    if(e.key==='Tab'){ e.preventDefault(); dash(!ut.open||ut.classList.contains('shut')); } else if(e.key==='Escape'&&ut.open) dash(false); });
  $('#bar').addEventListener('click',e=>{ const b=e.target.closest('button'); if(b&&!['bSmoke','bEmote'].includes(b.id)) dash(false); });
  canvas.addEventListener('pointerdown',()=>dash(false));
  document.documentElement.style.setProperty('--blh','0px');
  // the voice volume shows only once you have joined the voice
  const mu=$('#voice-mute'); new MutationObserver(()=>bl.classList.toggle('voice',!mu.hidden)).observe(mu,{attributes:true,attributeFilter:['hidden']}); }

const locked=()=>document.pointerLockElement===canvas;
document.addEventListener('pointerlockchange',()=>{ drag=null; keys.clear(); aim.hidden=!locked(); });
document.addEventListener('mousemove',e=>{
  if(!locked()||VIEW.mode!=='walk'||renderer.xr.isPresenting) return;
  ME.targetYaw=null;
  ME.yaw-=e.movementX*.0025;
  ME.pitch=Math.max(-1.25,Math.min(1.2,ME.pitch-e.movementY*.0025));
});
document.addEventListener('pointerlockerror',()=>toast('滑鼠鎖定不可用，可拖曳轉動視角'));
for(const id of ['bName','voice-toggle','voice-mute']){
  document.getElementById(id)?.addEventListener('focus',()=>{if(locked()) document.exitPointerLock();});
}
let drag=null;
canvas.addEventListener('contextmenu',e=>e.preventDefault());
canvas.addEventListener('pointerdown',e=>{ canvas.focus();
  if(e.pointerType==='mouse'&&e.button===2&&VIEW.mode==='walk'&&window.__entered&&!renderer.xr.isPresenting){
    isRightMouseDown=true;
    if(locked()&&myDrink>=0&&!(mySip&&(Date.now()-mySip.a)<2000)) takeSip();
    return;
  }
  if(e.pointerType==='mouse'&&e.button===0&&VIEW.mode==='walk'&&window.__entered&&!renderer.xr.isPresenting){
    if(locked()){ applyCamera(); camera.updateWorldMatrix(true,false); tryPunchCharacter(); return; }
    if(ctrlMode==='fps'&&canvas.requestPointerLock){ try{ canvas.requestPointerLock()?.catch(()=>{}); return; }catch{} }
  }
  drag={id:e.pointerId,x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,t:performance.now()}; canvas.setPointerCapture(e.pointerId); });
canvas.addEventListener('pointermove',e=>{ if(locked()) return; if(!drag||drag.id!==e.pointerId) { hover(e); return; } const dx=e.clientX-drag.x, dy=e.clientY-drag.y; drag.x=e.clientX; drag.y=e.clientY; if(VIEW.mode==='plan'){ planDrag(dx,dy); return; } const k=isTouch?0.006:0.0042; ME.yaw+=dx*k; ME.pitch=Math.max(-1.25,Math.min(1.2,ME.pitch+dy*k)); });
canvas.addEventListener('pointerup',e=>{ if(e.button===2) isRightMouseDown=false; if(!drag||drag.id!==e.pointerId) return; const moved=Math.hypot(e.clientX-drag.sx,e.clientY-drag.sy); const dt=performance.now()-drag.t; drag=null; if(moved<8&&dt<600) click(e.clientX,e.clientY); });
canvas.addEventListener('pointercancel',()=>{ drag=null; isRightMouseDown=false; });
const ray=new THREE.Raycaster(); const ndc=new THREE.Vector2();
function pickAt(cx,cy){ ndc.set(cx/innerWidth*2-1,-(cy/innerHeight)*2+1); ray.setFromCamera(ndc,camera); ray.far=40; const h=ray.intersectObjects(pickables,false)[0]; return h||null; }
const aimAction=document.getElementById('aim-action');
const aimLabels={npc:'交談',seat:'入座',door:'操作門扇',shoji:'開關障子',shelf:'看書',case:'看書',post:'閱讀文章',irori:'使用囲炉裏',gongfu:'泡工夫茶',modern:'使用茶席',coffee:'點咖啡',record:'操作唱片機',vivlamp:'調整雨林燈管亮度'};
let nextAimCheck=0;
function updateAimHint(){
  if(!locked()||VIEW.mode!=='walk'||renderer.xr.isPresenting||utility.open||panel.classList.contains('open')||!document.getElementById('reader').classList.contains('hide')){
    aimAction.hidden=true; return;
  }
  const now=performance.now();
  if(now<nextAimCheck) return;
  nextAimCheck=now+100;
  camera.updateWorldMatrix(true,false);
  const type=pickAt(innerWidth/2,innerHeight/2)?.object.userData.type;
  const label=type&&(aimLabels[type]||(VRT[type]?.body?'查看說明':''));
  aimAction.hidden=!label;
  if(label&&aimAction.textContent!=='按 E '+label) aimAction.textContent='按 E '+label;
}
function hover(e){ if(isTouch) return; const h=pickAt(e.clientX,e.clientY); const t=h&&h.object.userData.type; canvas.style.cursor=(t&&t!=='block')?'pointer':'grab'; }
const marker=new THREE.Mesh(new THREE.RingGeometry(0.16,0.22,32),new THREE.MeshBasicMaterial({color:0xfff0c8,transparent:true,opacity:0,depthWrite:false})); marker.rotation.x=-Math.PI/2; scene.add(marker);
function click(cx,cy){ const h=pickAt(cx,cy); if(!h) return;
  act(h); }
canvas.addEventListener('wheel',e=>{
  if(VIEW.mode==='plan'){ e.preventDefault(); planZoom(Math.exp(e.deltaY*.0012)); return; }
  if(VIEW.mode==='walk'&&isRightMouseDown&&!renderer.xr.isPresenting){
    e.preventDefault();
    const step=Math.min(12,Math.max(4,Math.abs(e.deltaY)*0.06));
    if(e.deltaY<0) targetFov=Math.max(minFov,targetFov-step);
    else if(e.deltaY>0&&targetFov<baseFov) targetFov=Math.min(baseFov,targetFov+step);
  }
},{passive:false});
const ACTION_TYPES=new Set(['cave','phone','ledger','abacus','dbell','mango','cooler','popcorn','lddrop','ldbundle','gramo','snackdish','blind','alarm','sampan','jetty','cinescreen','cinefridge','cineswitch','npc','seat','door','shoji','modern','gongfu','gffan','irori','tin','fire','floorlamp','vivlamp','shelf','case','post','cab','dtable','dmenu','kgas','ktap','kpantry','kfire','knood','kbasin','wcdoor','wcseat','wcspout','wcslide','wcuri','bathlatch','bathshower','bathwash','bathdoor','bathsdoor','clsboard','clslaptop','clsproj','clsscreen']);
function act(h){ const u=h.object.userData; if(!ACTION_TYPES.has(u.type)&&VRT[u.type]&&String(VRT[u.type].body||'').trim()){ showText(VRT[u.type].title||'',vrParas(VRT[u.type].body)); return; } switch(u.type){
  case 'floor': break;
  case 'npc': npcTalk(u.id); break;
  case 'shelf': { const o=caseObjs[u.ci]; const px=h.uv.x*o.info.W, py=(1-h.uv.y)*o.info.H; let best=null; for(const [i,r] of o.info.layout){ if(px>=r.x0&&px<=r.x1&&py>=r.y0-6&&py<=r.y1+4){best=i;break;} } if(best!=null){ highlight(best); showBook(best); } else showCase(u.ci); break; }
  case 'case': showCase(u.ci); break;
  case 'post': openReader(u.pi); break;
  case 'cab': showCab(u.ci); break;
  case 'seat': { const si=groupSeat(u,h.point); if(si==null){ toast(NT('bath.full')); break; } sit(si); break; }
  case 'hou': showText(`${HOU.term}・${HOU.hou}`,`<p style="font-size:22px;letter-spacing:.2em;margin:6px 0 14px">${esc(HOU.yu)}</p><p class="meta">七十二候，五日一候。今天是${esc(HOU.term)}${esc(HOU.hou)}。書齋的時節依臺北時間更新；天色也跟著日出日落（06:00～18:00 為白天）。</p>`); break;
  case 'quote': showText(D.quote_src,`<div style="line-height:2.1;font-size:15.5px">${esc(D.quote).replace(/\n/g,'<br>')}</div>`); break;
  case 'about': showText('學鳩齋',D.intro.split('\n\n').map(p=>`<p style="line-height:2">${esc(p)}</p>`).join('')+`<p><a class="btn pri" href="https://hakkiuchay.space/" target="_blank" rel="noopener">學鳩齋網站</a><a class="btn" href="https://otterslibrary.pages.dev/" target="_blank" rel="noopener">獺祭魚書庫</a></p>`); break;
  case 'kgas': case 'ktap': case 'kpantry': case 'kfire': case 'knood': case 'kbasin': case 'wcdoor': case 'wcseat': case 'wcspout': case 'wcslide': case 'wcuri': case 'bathlatch': case 'bathshower': case 'bathwash': case 'bathdoor': case 'bathsdoor': if(window.__kitchenAct) window.__kitchenAct(u); break;
  case 'clsboard': case 'clslaptop': case 'clsproj': case 'clsscreen': if(window.__clsAct) window.__clsAct(u); break;
  case 'blind': window.__blindAct?.(u); break;
  case 'sampan': window.__boatAct?.(u); break;
  case 'cave': window.__caveAct?.(u); break;
  case 'snackdish': window.__snackAct?.(u); break;
  case 'gramo': window.__gramoAct?.(u); break;
  case 'jetty': toast(NT('boat.jetty'),5000); break;
  case 'alarm': toast(String(NT('alarm.msg')).replace('{now}',hhmm(taipeiNow().min)).replace('{wake}',hhmm(DAY.wake)),4000); break;
  case 'cinescreen': case 'cinefridge': case 'cineswitch': if(window.__cineAct) window.__cineAct(u); break;
  case 'mango': window.__mangoAct&&window.__mangoAct(u); break;
  case 'cooler': case 'popcorn': window.__coolerAct&&window.__coolerAct(u); break;
  case 'phone': case 'ledger': case 'abacus': case 'dbell': window.__zhangAct&&window.__zhangAct(u); break;
  case 'lddrop': case 'ldbundle': if(!(window.__laundAct&&window.__laundAct(u))&&VRT[u.type]) showText(VRT[u.type].title||'',vrParas(VRT[u.type].body)); break;
  case 'dtable': case 'dmenu': if(typeof dineText==='function') dineText(); break;
  case 'zhiliao': showText('知了間',`<p style="line-height:2">茶寮「知了間」，與學鳩齋隔院相望。</p><p style="line-height:2">分成三間。進門是明間，正對翹頭案與《玉川煎茶圖》、對聯，兩側各一對太師椅。左邊是和室：土間脫鞋，上式台，拉開障子是九疊榻榻米與囲炉裏，床之間掛葡萄知了圖。右邊是茶室：工夫茶席、當代茶席、整面牆的茶壺展示櫃，進門正對一米八高、不封頂的淺色茶櫃，錫罐、普洱、洗手盆和一格雨林缸，雨林缸上方掛《美人》。</p><p style="line-height:2">有緣人路過，歡迎進來食茶。</p>`); break;
  case 'irori': showIrori(); break;
  case 'shoji': toggleShoji(); break;
  case 'bonsai': showText('盆景','<p style="line-height:2">知了間裡的中式盆景：矮櫃上幾盆小松，玄關桌旁高几一盆，羅漢床邊和壁爐旁各一盆落地黑松，工夫茶席旁一盆竹。</p>'); break;
  case 'luohan': showText('羅漢床','<p style="line-height:2">三面圍板的羅漢床，中間一張炕几，一把紫砂壺兩只杯。點床上的坐墊可以坐下。</p>'); break;
  case 'teabooks': showText('書架','<p style="line-height:2">一架茶書與琴譜。</p>'); break;
  case 'potcase': showText('茶壺多寶格','<p style="line-height:2">大小不一的格子，各放一把壺：朱泥、紫砂、柴燒、銀壺、鐵壺，還有提梁壺和幾組小杯。</p>'); break;
  case 'byobu': showText('六曲屏風','<p style="line-height:2">兩座六曲屏風，淡金底上幾株水墨松，在榻榻米的兩側折成一角，轉角留著入口。</p>'); break;
  case 'aquarium': showText('魚缸','<p style="line-height:2">玻璃缸裡幾尾金魚，水草、石頭，缸頂一條燈。</p>'); break;
  case 'bogu': showText('博古架','<p style="line-height:2">茶碗、花瓶、茶寵與一盆小盆景，各據一格。</p>'); break;
  case 'puer': showText('普洱茶櫃','<p style="line-height:2">上層是竹箬包好、麻繩綁著的一提提七子餅；中層幾餅拆開的放在餅架上，露出棉紙；下層是茶磚、沱茶和一甕散茶。</p>'); break;
  case 'cicada': showText('葡萄知了','<p style="line-height:2">水墨葡萄藤下垂著一隻知了，紙本，藍地小花紋的裱。掛在和室的床之間。</p><p class="meta">The Metropolitan Museum of Art 開放資料。</p>'); break;
  case 'beauty': showText('Beauty Revealed','<p style="line-height:2">Sarah Goodridge，1828 年，象牙上的水彩細密畫，裝在紅色皮盒裡。</p><p class="meta">The Metropolitan Museum of Art 開放資料。</p>'); break;
  case 'ikebana2': showText('插花','<p style="line-height:2">窗戶另一邊，矮櫃上一隻白瓷長頸瓶，依真、副、控三枝插山茶：高枝紅花，斜出一枝白花，低處一朵紅。</p>'); break;
  case 'pyra': showText('火棘','<p style="line-height:2">條案左側高几上一盆火棘，斜幹，細枝拱垂，小葉深綠，一簇簇紅果。</p>'); break;
  case 'plum2': showText('老樁梅','<p style="line-height:2">條案右側高几上一盆老樁梅：樹樁劈裂中空，只抽出幾條細枝，開著淡粉的花，紅苞未放；橢圓宜興盆裡伴一塊小靈璧石。</p>'); break;
  case 'viv': showText('雨林缸','<p style="line-height:2">茶櫃裡的一格做成雨林缸：苔蘚、沉木、鳳梨科，兩隻綠色樹蛙，紅眼睛。</p>'); break;
  case 'teapaint': showText('玉川煎茶圖','<p style="line-height:2">明・丁雲鵬《玉川煎茶圖》，壬子年（1612）冬作。畫盧仝（玉川子）在芭蕉、太湖石下烹茶，一僕提壺汲水，一婢捧盒。</p><p style="line-height:2">兩旁對聯：上聯「知味粗茶堪作伴」，下聯「了心陋室可安身」。</p>'); break;
  case 'couplet': showText('對聯','<p style="line-height:2">上聯　知味粗茶堪作伴<br>下聯　了心陋室可安身</p><p class="meta">兩句句首合為「知了」。</p>'); break;
  case 'altar2': showText('翹頭案','<p style="line-height:2">明間正中的翹頭案，案上一隻錫茶罐、一副蓋碗；牆上掛《玉川煎茶圖》與對聯。</p>'); break;
  case 'taishi': showText('太師椅','<p style="line-height:2">明間兩側各一對太師椅，中間一張茶几。點椅子可以坐下。</p>'); break;
  case 'console': showText('玄關桌','<p style="line-height:2">畫下的長桌，放隨身的東西。</p>'); break;
  case 'chandelier2': showText('水晶吊燈','<p style="line-height:2">跟學鳩齋一樣的兩層銅吊燈，S 形燈臂、燭台和水晶垂珠，從屋脊垂下。</p>'); break;
  case 'banana': showText('芭蕉','<p style="line-height:2">茶室後角一盆芭蕉，大葉子越過屏風的左端。隔壁明間的《玉川煎茶圖》裡，盧仝就坐在芭蕉下煎茶。</p>'); break;
  case 'floorlamp': toggleFloorLamp(u.i); break;
  case 'teapendant': showText('長條燈','<p style="line-height:2">茶室天花板下一支細長的燈，深色金屬燈身，底下一條柔和的暖光，把整間照得均勻。</p>'); break;
  case 'vivlamp': toggleViv(); break;
  case 'fountain': showText('獅頭吐水','<p style="line-height:2">博古架旁的角落，牆上一面古銅獅頭，細水從口中吐進高陶甕，甕口一圈圈水紋。旁邊擱一支竹杓，取水煮茶。</p>'); break;
  case 'teaware': showText('茶櫃','<p style="line-height:2">一格一個樣子：大陶壺、鐵壺、木茶箱、紙包茶、幾隻錫罐、一疊杯子、幾本書，留些空處。</p>'); break;
  case 'screen': showText('山水屏風','<p style="line-height:2">後牆前立一架六曲水墨屏風：右起崖上老松、瀑布、草堂裡對坐的高士，中段雪後山徑的行旅，左端一片空闊的水面、遠山與飛雁。</p>'); break;
  case 'shoin': showText('付書院','<p style="line-height:2">窗前的書院板：硯箱、筆、三冊線裝書，一只小銅香爐。</p>'); break;
  case 'songlamp': showText('宋式大燈','<p style="line-height:2">八角木框，素紗，掛在中軸上方。</p>'); break;
  case 'fire': fireplace.on=!fireplace.on; toast(fireplace.on?'打開壁爐。':'關掉壁爐。'); break;
  case 'display': showText('博古架','<p style="line-height:2">後牆一座圓形博古架，圓框裡錯落幾層，只擺幾件：青瓷瓶、朱泥壺、一塊供石、紫砂壺、鐵壺、兩隻白瓷杯。背後襯一輪和紙圓光。</p>'); break;
  case 'genkan': showText('玄關','<p style="line-height:2">入門直走道的盡頭：一張窄玄關桌，桌後掛一幅水墨山水。</p>'); break;
  case 'modern': showModern(); break;
  case 'gongfu': showGongfu(); break;
    case 'gffan': fanFire(); break;
  case 'tin': if(u.t>=0) pickTea(u.t); showTeaShelf(); break;
  case 'inst': showInstrument(u.k); break;
  case 'wash': wash(); break;
  case 'snack': showSnacks(); break;
  case 'kakejiku': showText('床之間','<p style="line-height:2">床之間的掛軸還空著，等你決定要掛哪一幅畫。</p><p class="meta">旁邊是生花：真、副、體三枝，一枝紅椿。</p>'); break;
  case 'ikebana': showText('生花','<p style="line-height:2">床之間的竹花入，照花道的生花格式，留白多於花葉。花跟著節氣換：'+SEASON_FLOWER.t+'</p>'); break;
  case 'coffee': showCoffee(); break;
  case 'grinder': showBeans(); break;
  case 'censer': showIncense(); break;
  case 'door': toggleDoor(u.key); break;
  case 'record': showRecord(); break;
  case 'altar': showText('插花','<p style="line-height:2">掛軸右下一瓶梅。</p><p class="meta">中軸留空，從大門一路看得到掛軸。</p>'); break;
  case 'otter': showText('水獺圖','<p style="line-height:2">三隻水獺在水中嬉游，絹本設色，裱成掛軸，掛在咖啡機上方。</p><p class="meta">獺祭魚：水獺把捕到的魚排在岸邊，像在祭祀。</p>'); break;
  case 'clock': { const [h,m]=taipeiClock.format(new Date()).split(':'); showText('布穀鳥鐘',`<p style="line-height:2">現在臺北時間 ${h}:${m}。整點時布穀鳥會出來報時。</p>`); break; }
  case 'lamp': { const l=LAMPS[u.li]; l.f.on=!l.f.on; applyLighting(); break; }
  case 'zendo': showText('禪堂','<p style="line-height:2">後大廳是禪堂。坐上蒲團，按「靜坐 30 分」開始一炷香，結束時會響磬。</p><p class="meta">在齋的人會看到你在靜坐。</p>'); break;
} }

/* ---------------- highlight marker ---------------- */
const hl=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1,1,0.02)),new THREE.LineBasicMaterial({color:0xffd27a,transparent:true,depthTest:false})); hl.visible=false; hl.renderOrder=4; scene.add(hl);
const hlGlow=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({color:0xffd27a,transparent:true,opacity:.25,depthWrite:false})); hlGlow.visible=false; scene.add(hlGlow);
function highlight(i){ const w=bookWorld(i); if(!w) return; const o=caseObjs[w.ci]; for(const m of [hl,hlGlow]){ m.visible=true; m.position.copy(w.p); m.quaternion.copy(o.grp.quaternion); m.scale.set(w.w+0.01,w.h+0.01,1); m.translateZ(0.012);} hl.userData.t0=performance.now(); }
function walkToBook(i){ const w=bookWorld(i); if(!w) return; highlight(i); const o=caseObjs[w.ci]; const n=new THREE.Vector3(0,0,1).applyQuaternion(o.grp.quaternion); const tx=w.p.x+n.x*1.25, tz=w.p.z+n.z*1.25;
  goTo(tx,tz,{faceTo:{x:w.p.x,z:w.p.z,y:w.p.y}}); }

/* ---------------- panels ---------------- */
const panel=$('#panel');
function openPanel(title,html){ if(document.pointerLockElement===canvas) document.exitPointerLock(); $('#ptitle').textContent=title; $('#pbody').innerHTML=html; panel.classList.add('open'); return $('#pbody'); }
function closePanel(){ panel.classList.remove('open'); }
$('#pclose').onclick=closePanel;
function showText(t,html){ openPanel(t,html); }
function bookLine(i){ const b=BOOKS[i]; return `<li data-b="${i}"><div class="bt">${esc(b[0])}</div><div class="ba">${esc([b[1],b[2],b[3]].filter(Boolean).join('・'))}</div></li>`; }
function showBook(i){ const b=BOOKS[i]; const body=openPanel('獺祭魚書庫',`<div class="card"><div class="tt">${esc(b[0])}</div><dl>
  ${b[1]?`<dt>作者</dt><dd>${esc(b[1])}</dd>`:''}${b[2]?`<dt>出版年</dt><dd>${esc(b[2])}</dd>`:''}${b[3]?`<dt>出版社</dt><dd>${esc(b[3])}</dd>`:''}
  <dt>分類</dt><dd>${esc(b[4])}${b[5]?'／'+esc(b[5]):''}</dd>${b[7]?`<dt>語言</dt><dd>${esc(b[7])}</dd>`:''}<dt>形式</dt><dd>${b[6]==='電'?'電子書':'紙本書'}</dd></dl>
  <button class="btn" id="goBook">走到書前</button><button class="btn" id="sameShelf">同一架的書</button>
  <div class="sec" style="border-color:var(--c-academic);margin-top:16px">去哪裡讀</div>
  <p class="meta" style="line-height:1.8">書架上的書有版權，這裡只放書目。可以從這些地方找試閱、館藏或公版全文：</p>
  ${(()=>{ const q=encodeURIComponent((b[0]+' '+(b[1]||'')).trim()), qt=encodeURIComponent(b[0]);
    return [['Google 圖書（試閱）','https://www.google.com/search?tbm=bks&q='+q],['Internet Archive（公版、借閱）','https://archive.org/search?query='+qt],['博客來','https://search.books.com.tw/search/query/key/'+qt],['獺祭魚書庫（你的電子書）','https://otterslibrary.pages.dev/']]
      .map(([n,u])=>`<a class="btn" href="${u}" target="_blank" rel="noopener">${n}</a>`).join(''); })()}</div>`);
  body.querySelector('#goBook').onclick=()=>{ walkToBook(i); if(isTouch) closePanel(); };
  body.querySelector('#sameShelf').onclick=()=>showCase(bookIndex.get(i).ci); }
function bindList(el){ el.addEventListener('click',e=>{ const li=e.target.closest('li[data-b]'); if(li){ const i=+li.dataset.b; showBook(i); walkToBook(i); } }); }
function showCase(ci){ const C=CASES[ci]; const all=C.cats.flatMap(([n,l])=>l); const subs=[...new Set(all.map(i=>BOOKS[i][5]||BOOKS[i][4]))];
  const body=openPanel(C.label,`<div class="meta">${all.length} 冊</div><input class="srch" placeholder="在這一架裡找…"><div class="chips"><button class="on" data-s="">全部</button>${subs.slice(0,40).map(s=>`<button data-s="${esc(s)}">${esc(s.split('／').pop())}</button>`).join('')}</div><ul class="list"></ul>`);
  const ul=body.querySelector('.list'), inp=body.querySelector('.srch'); let sub='';
  const render=()=>{ const q=inp.value.trim().toLowerCase(); const r=all.filter(i=>{ const b=BOOKS[i]; return (!sub||(b[5]||b[4])===sub)&&(!q||(b[0]+b[1]+b[3]).toLowerCase().includes(q)); }); ul.innerHTML=r.slice(0,300).map(bookLine).join('')+(r.length>300?`<li class="meta">還有 ${r.length-300} 冊，請輸入關鍵字縮小範圍</li>`:''); };
  inp.oninput=render; body.querySelector('.chips').onclick=e=>{ const b=e.target.closest('button'); if(!b) return; sub=b.dataset.s; body.querySelectorAll('.chips button').forEach(x=>x.classList.toggle('on',x===b)); render(); };
  bindList(ul); render(); }
function showSearch(){ const body=openPanel('找書',`<input class="srch" placeholder="書名、作者、出版社…" autofocus><div class="meta" id="sc">${preview?'書目尚未匯入。':'獺祭魚書庫共 '+BOOKS.length+' 冊。點一本書，就會走到它的書架前。'}</div><div class="chips">${CASES.map((c,ci)=>`<button data-c="${ci}">${esc(c.label)}</button>`).join('')}</div><ul class="list"></ul>`);
  const ul=body.querySelector('.list'), inp=body.querySelector('.srch');
  inp.oninput=()=>{ const q=inp.value.trim().toLowerCase().replace(/台/g,'臺'); if(!q){ ul.innerHTML=''; return; } const r=[]; for(let i=0;i<BOOKS.length&&r.length<120;i++){ const b=BOOKS[i]; if((b[0]+'|'+b[1]+'|'+b[3]+'|'+b[5]).toLowerCase().replace(/台/g,'臺').includes(q)) r.push(i);} ul.innerHTML=r.map(bookLine).join('')||'<li class="meta">找不到</li>'; };
  body.querySelector('.chips').onclick=e=>{ const b=e.target.closest('button'); if(b) showCase(+b.dataset.c); };
  bindList(ul); setTimeout(()=>inp.focus(),300); }
function postLink(p){ const [y,m,d]=p.date.split('-'); return `https://hakkiuchay.space/posts/${y}/${m}/${d}/${p.slug}/`; }
function postItems(cat){ return postsBy(cat).map(([p,i])=>`<li data-p="${i}"><div class="bt">${esc(p.title)}</div><div class="ba">${esc([p.author,p.date].filter(Boolean).join('・'))}</div></li>`).join('')||'<li class="meta">這個櫃子還空著</li>'; }
function showCab(ci){ const c=CAB[ci]; const body=openPanel(c.name,`<ul class="list">${postItems(c.cat)}</ul>`); body.querySelector('.list').onclick=e=>{ const li=e.target.closest('li[data-p]'); if(li) openReader(+li.dataset.p); }; }
function showPosts(){ const body=openPanel('學鳩齋文章',CAB.map(c=>`<div class="sec" style="border-color:${c.col}">${c.name}</div><ul class="list">${postItems(c.cat)}</ul>`).join('')+`<p class="meta" style="margin-top:14px">櫃子在書齋東牆。文章來自學鳩齋網站，網站更新後重新產生這一頁就會同步。</p>`);
  body.onclick=e=>{ const li=e.target.closest('li[data-p]'); if(li) openReader(+li.dataset.p); }; }
function showSeats(){ const rows=SEATS.map((s,i)=>{ const who=occupant(i); return `<li data-s="${i}"><div class="bt">${esc(seatLabel(i))}</div><div class="ba">${who?esc(who)+' 坐著':'空位'}</div></li>`; }).join('');
  const body=openPanel('找位子',`<p class="meta">坐下後可以開始 25 分鐘專注計時，在齋裡的人會看到彼此在專注還是休息。</p><ul class="list">${rows}</ul>`); body.querySelector('.list').onclick=e=>{ const li=e.target.closest('li[data-s]'); if(li){ sit(+li.dataset.s); if(isTouch) closePanel(); } }; }
$('#bBooks').onclick=showSearch; $('#bPosts').onclick=showPosts; $('#bSeat').onclick=showSeats;
$('#bName').onclick=()=>{ if(window.__openGate){ window.__openGate(); return; } const body=openPanel('改名',`<input class="srch" maxlength="12" value="${esc(myName)}"><button class="btn pri">好</button>`); const inp=body.querySelector('input'); body.querySelector('button').onclick=()=>{ myName=(inp.value.trim()||'訪客').slice(0,12); LS.set('hk-name',myName); pushPresence(); renderPeople(); closePanel(); }; };

/* ---------------- reader (markdown) ---------------- */
function inline(s){ let h=esc(s);
  h=h.replace(/\+\+(.+?)\+\+/g,'$1');
  h=h.replace(/\[註(\d+)\]/g,'<sup><a href="#n$1" id="r$1">[$1]</a></sup>');
  h=h.replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>');
  h=h.replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/(^|[^*])\*([^*\n]+)\*/g,'$1<i>$2</i>');
  h=h.replace(/(^|[\s(（])(https?:\/\/[^\s<）)]+)/g,'$1<a href="$2" target="_blank" rel="noopener">$2</a>');
  return h; }
function joinLines(lines){ let out=''; for(const l of lines){ if(!out){ out=l; continue; } const a=out.slice(-1), b=l[0]||''; const br=/ {2}$/.test(out); out=out.replace(/\s+$/,''); out+=br?'\n':(/[A-Za-z0-9,.;:)]/.test(a)&&/[A-Za-z0-9(]/.test(b)?' ':'')+l; } return out; }
function md(src,link){ const blocks=src.replace(/\r/g,'').split(/\n\s*\n/); let html='';
  for(let b of blocks){ b=b.replace(/^\n+|\n+$/g,''); if(!b.trim()) continue; const lines=b.split('\n');
    const img=b.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/); if(img){ html+=`<a class="img" href="${esc(link)}" target="_blank" rel="noopener">〔圖〕${esc(img[1]||'')}　— 到網站看圖</a>`; continue; }
    if(/^#{1,4}\s/.test(b)){ const lv=Math.min(3,b.match(/^#+/)[0].length+1); html+=`<h${lv}>${inline(b.replace(/^#+\s*/,''))}</h${lv}>`; continue; }
    if(lines.every(l=>/^>/.test(l))){ html+=`<blockquote>${md(lines.map(l=>l.replace(/^>\s?/,'')).join('\n'),link)}</blockquote>`; continue; }
    if(lines.every(l=>/^\s*([-*]|\d+\.)\s/.test(l))){ const ol=/^\s*\d/.test(lines[0]); html+=`<${ol?'ol':'ul'}>${lines.map(l=>`<li>${inline(l.replace(/^\s*([-*]|\d+\.)\s+/,''))}</li>`).join('')}</${ol?'ol':'ul'}>`; continue; }
    html+=`<p>${inline(joinLines(lines)).replace(/\n/g,'<br>')}</p>`; }
  return html; }
function openReader(pi){ if(document.pointerLockElement===canvas) document.exitPointerLock(); const p=POSTS[pi]; const link=postLink(p); $('#rlink').href=link;
  const notes=(p.notes||[]).map((n,k)=>`<li id="n${k+1}">${inline(String(n))} <a href="#r${k+1}">↩</a></li>`).join('');
  const refs=(p.refs||[]).filter(Boolean).map(r=>/^##/.test(r)?`<h3>${esc(r.replace(/^#+\s*/,''))}</h3>`:`<p style="margin:0 0 .6em;padding-left:2em;text-indent:-2em">${inline(String(r))}</p>`).join('');
  $('#rbody').innerHTML=`<h1>${esc(p.title)}</h1>${p.subtitle?`<div class="sub">${esc(p.subtitle)}</div>`:''}<div class="by">${esc([p.author,p.date].filter(Boolean).join('・'))}</div>${p.source?`<div class="src">${inline(String(p.source))}</div>`:''}<article>${md(p.body,link)}</article>${notes?`<ol class="notes">${notes}</ol>`:''}${refs?`<div class="notes"><h3 style="margin-top:0">參考文獻</h3>${refs}</div>`:''}`;
  $('#reader').classList.remove('hide'); $('#reader').scrollTop=0; closePanel(); ME.reading=pi; pushPresence(); }
function closeReader(){ $('#reader').classList.add('hide'); ME.reading=-1; pushPresence(); }
$('#rclose').onclick=closeReader;

/* ---------------- focus timer ---------------- */
let focusMode='', focusEnd=0, actx=null;
function setFocus(mode,mins){ focusMode=mode; focusEnd=mode?Date.now()+mins*60000:0; updateTimerUI(); pushPresence(); }
function bell(){ try{ actx=actx||new (window.AudioContext||window.webkitAudioContext)(); const t=actx.currentTime; for(const [f,d] of [[523.25,0],[783.99,.02],[1046.5,.04]]){ const o=actx.createOscillator(), g=actx.createGain(); o.type='sine'; o.frequency.value=f; g.gain.setValueAtTime(0.0001,t+d); g.gain.exponentialRampToValueAtTime(0.18,t+d+0.02); g.gain.exponentialRampToValueAtTime(0.0001,t+d+2.6); o.connect(g).connect(actx.destination); o.start(t+d); o.stop(t+d+2.7);} }catch{} }
const mmss=ms=>{ const s=Math.max(0,Math.round(ms/1000)); return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0'); };
function updateTimerUI(){ const lab=$('#tlab'), clk=$('#tclk'); const s=SEATS[ME.seat];
  if(focusMode){ lab.textContent=MODE_LABEL[focusMode]||''; clk.textContent=mmss(focusEnd-Date.now()); $('#timer').style.borderTopColor=(focusMode==='focus'||focusMode==='zen')?'var(--c-talks)':'var(--c-life)'; }
  else { const k=s?SEAT_KIND[s.kind]:null; lab.textContent=k?k.label:'自習'; clk.textContent=mmss((k&&k.timer?k.timer[0][1]:25)*60000); $('#timer').style.borderTopColor='var(--rule)'; } }
const MODE_LABEL={focus:'專注中',break:'休息中',zen:'靜坐中',walk:'經行中'};
let timerModes=[['focus',25,'專注 25 分'],['break',5,'休息 5 分']];
function setTimerButtons(kind){ timerModes=(SEAT_KIND[kind]&&SEAT_KIND[kind].timer)||[['focus',25,'專注 25 分'],['break',5,'休息 5 分']]; $('#tfocus').textContent=timerModes[0][2]; $('#tbreak').textContent=timerModes[1][2]; }
$('#tfocus').onclick=()=>{ try{ actx=actx||new (window.AudioContext||window.webkitAudioContext)(); actx.resume(); }catch{} setFocus(timerModes[0][0],timerModes[0][1]); if(timerModes[0][0]==='zen') bell(); };
$('#tbreak').onclick=()=>setFocus(timerModes[1][0],timerModes[1][1]);
$('#tup').onclick=()=>standUp();
setInterval(()=>{ if(focusMode&&Date.now()>=focusEnd){ const was=focusMode; setFocus('',0); bell(); toast(({focus:'專注結束，起來走走，到窗邊倒杯咖啡。',break:'休息結束，回到書桌吧。',zen:'一炷香結束，慢慢起身。',walk:'經行結束，回到蒲團。'})[was]||'時間到。'); } if(ME.seat>=0) updateTimerUI(); renderPeople(); },1000);

await __yield(0.8);
// {% endraw %}
