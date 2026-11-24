// {% raw %}
/* ---------------- people: chat, run / jump / crouch, a network check panel, adaptive resolution ---------------- */
const NET={st:'',run:false,peers:null,errs:0};
// chat: the last line each person said rides along in their shared state; new lines show in the log and over their head
const HUD_TXT={'chat.all':'全齋','chat.jin':'同進','chat.ph':'說點什麼，Enter 送出，Esc 取消','chat.btn':'聊天 (Enter)',
  'place.xjz':'學鳩齋','place.zlj':'知了間','place.zt':'正廳','place.j3':'第三進','place.nt':'南廳','place.j2':'第二進','place.gt':'過廳','place.j1':'第一進','place.qt':'前庭',
  'help.btn':'? 操作說明 (H)','help.title':'操作說明','help.keys':'Tab 選單｜WASD 移動｜Shift 奔跑｜空白鍵 跳躍｜Z 蹲下｜E 互動・入座｜V 第三人稱｜右鍵＋滾輪 放大｜左鍵 互動・揮拳｜M 麥克風｜C 抽菸｜G 微動作｜N 小地圖｜X 許總管｜H 操作說明｜Enter 聊天｜Esc 釋放滑鼠｜VR 手把扳機 指向互動・搖桿 移動',
  'smoke.cig':'紙菸','smoke.pipe':'菸斗','smoke.cigar':'雪茄','smoke.longpipe':'旱菸桿','emote.btn':'微動作 (G)','emote.bow':'作揖','emote.behind':'負手','emote.think':'沉思','emote.clap':'撫掌','map.title':'宅院平面・點一下就過去','map.close':'關閉','map.tea':'茶席','map.books':'書櫃','hud.join':'進來了','hud.leave':'離開了'};
const HT=k=>(window.HK_LOOK&&window.HK_LOOK.labels[k])||HUD_TXT[k]||'';
const chatUI=(()=>{ const css=document.createElement('style'); css.textContent=`
#chatwrap{position:fixed;left:14px;bottom:calc(var(--blh,120px) + 22px);width:min(380px,calc(100vw - 28px));z-index:7;background:var(--hud-bg);color:var(--hud-ink);border-radius:4px;box-shadow:var(--hud-sh);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);font:14px/1.6 "Noto Serif TC",serif;transition:opacity .2s,transform .2s;opacity:0;transform:translateY(8px);pointer-events:none}
#chatwrap.typing{opacity:1;transform:none;pointer-events:auto}
#chatwrap .ch{display:flex;gap:4px;padding:6px 8px 4px;border-bottom:1px solid var(--hud-rule);font-size:12px}
#chatwrap .ch button{background:transparent;border:1px solid var(--hud-rule);color:var(--hud-soft);border-radius:4px;padding:1px 8px;font:12px "Noto Serif TC",serif;cursor:pointer}
#chatwrap .ch button.on{background:var(--hud-on);color:var(--hud-on-ink);border-color:var(--hud-on)}
#chatlog{max-height:min(34vh,260px);overflow:auto;padding:6px 10px;display:flex;flex-direction:column;gap:2px;text-shadow:0 0 1px rgba(0,0,0,.05)}
#chatlog .m b{font-weight:700;margin-right:.2em}
#chatlog .m i{font-style:normal;font-size:11.5px;color:var(--hud-soft);margin-right:.2em}
#chatlog .m.me b{color:var(--hud-ink)}
#chatlog .m.sys{font-size:12px;color:var(--hud-soft)}
#chatbox{display:none;padding:6px 8px 8px;border-top:1px solid var(--hud-rule)}
#chatwrap.typing #chatbox{display:block}
#chatbox input{width:100%;box-sizing:border-box;padding:6px 10px;border:1px solid var(--hud-rule);background:transparent;font:15px "Noto Serif TC",serif;color:var(--hud-ink);outline:none;border-radius:4px}
#actbtns{position:fixed;right:12px;bottom:76px;display:flex;flex-direction:column;gap:8px;z-index:6}
#actbtns button{width:52px;height:52px;border-radius:50%;border:1px solid #b9b2a6;background:rgba(241,239,232,.9);font:15px "Noto Serif TC",serif;color:#3f3a39}
#actbtns button.on{background:#a8343a;color:#fff;border-color:#a8343a}
#netdiag{position:fixed;right:12px;top:90px;z-index:8;background:rgba(20,18,16,.86);color:#e8e2d6;font:12px/1.6 ui-monospace,monospace;padding:8px 10px;max-width:360px;white-space:pre;display:none}`; document.head.appendChild(css);
  const wrap=document.createElement('div'); wrap.id='chatwrap';
  wrap.innerHTML=`<div class="ch"><button data-c="all" class="on">${esc(HT('chat.all'))}</button><button data-c="jin">${esc(HT('chat.jin'))}</button></div><div id="chatlog"></div><div id="chatbox"><input maxlength="120" placeholder="${esc(HT('chat.ph'))}"></div>`;
  document.body.appendChild(wrap);
  const log=wrap.querySelector('#chatlog'), box=wrap.querySelector('#chatbox');
  const diag=document.createElement('div'); diag.id='netdiag'; document.body.appendChild(diag);
  const inp=box.querySelector('input');
  inp.addEventListener('keydown',e=>{ e.stopPropagation(); if(e.key==='Enter'){ const t=inp.value.trim(); if(t) sendChat(t); inp.value=''; closeChat(); } else if(e.key==='Escape'){ inp.value=''; closeChat(); } });
  // the chat stays out of sight; Enter brings it up with the box to type in, Enter again (or Esc) puts it away
  const st={chan:'all'}; wrap.addEventListener('pointerdown',e=>{ if(e.target!==inp) e.preventDefault(); });
  wrap.querySelector('.ch').onclick=e=>{ const b=e.target.closest('button'); if(!b) return; st.chan=b.dataset.c; wrap.querySelectorAll('.ch button').forEach(x=>x.classList.toggle('on',x===b)); filterChat(); inp.focus(); };
  inp.addEventListener('blur',()=>setTimeout(()=>{ if(document.activeElement!==inp) wrap.classList.remove('typing'); },120));
  function wake(){}
  return {log,box,inp,diag,wrap,st,wake}; })();
// the 進 a point belongs to, and where to say it is (for the chat's labels and the 同進 channel)
function jinOf(p){ return p.x<9.8?3:p.x<29.4?2:p.x<46.84?1:0; }
function placeName(p){ if(Math.abs(p.x)<7.64&&p.z<4.3) return HT('place.xjz'); if(Math.abs(p.x)<7.64&&p.z>15.3) return HT('place.zlj');
  return HT(p.x<-5.5?'place.zt':p.x<5.5?'place.j3':p.x<14.1?'place.nt':p.x<25.1?'place.j2':p.x<33.7?'place.gt':p.x<46.84?'place.j1':'place.qt'); }
function filterChat(){ const mine=jinOf(ME); for(const d of chatUI.log.children) d.style.display=chatUI.st.chan==='jin'&&d.dataset.j!==undefined&&d.dataset.j!==''&&+d.dataset.j!==mine?'none':''; }
let myChat=null, myAct=null;
function openChat(){ if(document.pointerLockElement===canvas) document.exitPointerLock(); chatUI.wrap.classList.add('typing'); chatUI.wake(); keys.clear(); chatUI.inp.focus(); }
function closeChat(){ chatUI.wrap.classList.remove('typing'); chatUI.inp.blur(); chatUI.wake(); }
// one line: the speaker's name in their own colour (yours in ink), where they are, the words; system lines small and grey
function chatLine(name,text,color,{me=false,sys=false,at=null}={}){ const d=document.createElement('div'); d.className='m'+(me?' me':'')+(sys?' sys':'');
  if(!sys){ const b=document.createElement('b'); b.textContent=name; if(!me&&color){ const c=new THREE.Color(color); if(document.documentElement.dataset.hud==='night') c.lerp(new THREE.Color(0xffffff),.35); else c.multiplyScalar(.8); b.style.color='#'+c.getHexString(); } d.appendChild(b);
    if(at){ const i=document.createElement('i'); i.textContent='['+placeName(at)+']'; d.appendChild(i); d.dataset.j=jinOf(at); } d.appendChild(document.createTextNode('：')); }
  d.appendChild(document.createTextNode(text)); chatUI.log.appendChild(d);
  while(chatUI.log.children.length>60) chatUI.log.firstChild.remove(); filterChat(); chatUI.log.scrollTop=chatUI.log.scrollHeight; chatUI.wake(); }
function chatSys(text){ chatLine('',text,null,{sys:true}); }
function sendChat(t){ t=t.replace(/[\u0000-\u001f]/g,'').slice(0,120); myChat=[t,Date.now()]; chatLine(myName,t,myColor,{me:true,at:{x:ME.x,z:ME.z}}); pushPresence(); }
function bubbleTex(text){ const c=document.createElement('canvas'); c.width=512; c.height=160; const g=c.getContext('2d'); g.font='30px "Noto Serif TC",serif';
  const lines=[]; let cur=''; for(const ch of text){ if(g.measureText(cur+ch).width>460){ lines.push(cur); cur=ch; if(lines.length===2) break; } else cur+=ch; } if(lines.length<3&&cur) lines.push(cur); if(lines.length>3) lines.length=3;
  const h=24+lines.length*40; g.fillStyle='rgba(246,243,236,.95)'; g.strokeStyle='#8a8478'; g.lineWidth=2; g.beginPath(); g.roundRect(4,4,504,h,10); g.fill(); g.stroke();
  g.fillStyle='#3f3a39'; g.textBaseline='top'; lines.forEach((l,i)=>g.fillText(l,20,16+i*40)); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return {t,h}; }
function showBubble(o,text){ if(o.bub){ o.av.g.remove(o.bub); o.bub.material.map.dispose(); }
  const {t,h}=bubbleTex(text); const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false,transparent:true})); sp.scale.set(1.2,1.2*160/512,1); sp.center.set(.5,1-(h+8)/160); sp.position.y=2.02; sp.renderOrder=6; o.av.g.add(sp); o.bub=sp; o.bubT=6.5; }
/* ---- 操作說明 (H) and the small map (N) ---- */
const helpUI=(()=>{ const css=document.createElement('style'); css.textContent=`
#helpbox{position:fixed;inset:0;z-index:40;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.25)}
#helpbox.on{display:flex}
#helpbox .w{background:var(--hud-bg);color:var(--hud-ink);border-radius:4px;box-shadow:var(--hud-sh);padding:16px 20px;max-width:min(560px,92vw);font:14px/1.9 "Noto Serif TC",serif;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
#helpbox h3{margin:0 0 8px;font-size:16px;letter-spacing:.1em;border-left:3px solid var(--seal);padding-left:8px}
#helpbox dl{display:grid;grid-template-columns:auto 1fr;gap:2px 14px;margin:0}
#helpbox dt{white-space:nowrap}#helpbox dt kbd{font:12.5px "Noto Serif TC",serif;border:1px solid var(--hud-rule);border-bottom-width:2px;border-radius:3px;padding:0 6px}
#helpbox dd{margin:0;color:var(--hud-soft)}
#hud-tr .mm{position:relative;width:160px;height:160px;overflow:hidden;background:var(--hud-bg);box-shadow:var(--hud-sh);cursor:pointer;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}
#hud-tr .mm canvas{width:100%;height:100%;display:block}
#hud-tr .mtools{display:flex;gap:6px;justify-content:flex-end;margin-top:6px}
#hud-tr.mmoff .mm{display:none}
`; document.head.appendChild(css);
  const box=document.createElement('div'); box.id='helpbox'; document.body.appendChild(box);
  const render=()=>{ box.innerHTML=`<div class="w"><h3>${esc(HT('help.title'))}</h3><dl>${HT('help.keys').split('｜').map(p=>{ const m=p.match(/^(.+?)\s+(\S.*)$/)||[p,p,'']; return `<dt><kbd>${esc(m[1])}</kbd></dt><dd>${esc(m[2])}</dd>`; }).join('')}</dl></div>`; };
  box.onclick=()=>box.classList.remove('on');
  const hb=document.createElement('button'); hb.id='bHelp'; hb.textContent=HT('help.btn'); $('#bar').appendChild(hb); hb.onclick=()=>toggle();
  function toggle(on){ render(); on=on??!box.classList.contains('on'); box.classList.toggle('on',on); hb.classList.toggle('on',on); if(on&&document.pointerLockElement===canvas) document.exitPointerLock(); }
  return {toggle}; })();

// the compound in plan, 正廳 (−x, south) up, the gate (north) down; the same drawing serves the small round map and the big one
const HPLAN={ blds:[], yards:[[-5.5,5.5,4.3,15.3],[14.1,25.1,4.3,15.3],[33.7,46.84,4.3,15.3],[46.84,53.3,-4.3,23.9]], labels:[] };
for(const cx of [0,19.6,39.2]) HPLAN.blds.push([cx-7.64,cx+7.64,-4.3,4.3],[cx-7.64,cx+7.64,15.3,23.9]);
for(const [a,b] of [[-14.1,-5.5],[5.5,14.1],[25.1,33.7]]) HPLAN.blds.push([a,b,4.3,15.3]);
for(const [a,b] of [[-14.1,-7.64],[7.64,11.96],[27.24,31.56]]) HPLAN.blds.push([a,b,-4.3,4.49],[a,b,15.11,23.9]);
HPLAN.labels=[['place.xjz',0,0],['place.zlj',0,19.6],['place.zt',-9.8,9.8],['place.j3',0,9.8],['place.nt',9.8,9.8],['place.j2',19.6,9.8],['place.gt',29.4,9.8],['place.j1',40,9.8],['place.qt',50,9.8]];
const POIS=[['map.tea',ZP.modern.cx,ZP.modern.cz],['map.books',-2,-2.6]];
function drawPlan(g,W,H,{cx,cz,scale,round=false,labels=false}){ const S=scale, X=z=>W/2-(z-cz)*S, Y=x=>H/2+(x-cx)*S;
  const night=document.documentElement.dataset.hud==='night', ink=night?'#f0ece1':'#1f1d1a', soft=night?'rgba(240,236,225,.35)':'rgba(31,29,26,.28)', yard=night?'rgba(240,236,225,.06)':'rgba(120,110,90,.10)';
  g.clearRect(0,0,W,H);
  const rect=(r,fill,stroke)=>{ const [x0,x1,z0,z1]=r, a=X(z1), b=X(z0), c=Y(x0), d=Y(x1); if(fill){ g.fillStyle=fill; g.fillRect(a,c,b-a,d-c); } if(stroke){ g.strokeStyle=stroke; g.lineWidth=1; g.strokeRect(a+.5,c+.5,b-a,d-c); } };
  for(const r of HPLAN.yards) rect(r,yard,null);
  for(const r of HPLAN.blds) rect(r,night?'rgba(240,236,225,.12)':'rgba(31,29,26,.10)',soft);
  g.font=`${labels?13:10}px "Noto Serif TC",serif`; g.textAlign='center'; g.textBaseline='middle';
  if(labels) for(const [k,x,z] of HPLAN.labels){ g.fillStyle=ink; g.fillText(HT(k),X(z),Y(x)); }
  for(const [k,x,z] of POIS){ g.fillStyle=night?'#d8b56a':'#8a6a2e'; g.beginPath(); g.arc(X(z),Y(x),labels?4:3,0,Math.PI*2); g.fill(); if(labels){ g.fillText(HT(k),X(z),Y(x)-12); } }
  for(const [,o] of others){ const p=o.av.g.position, c=/^#[0-9a-f]{6}$/i.test(o.p.c)?o.p.c:'#888'; g.fillStyle=c; g.beginPath(); g.arc(X(p.z),Y(p.x),labels?5:4,0,Math.PI*2); g.fill(); g.strokeStyle=ink; g.lineWidth=1; g.stroke(); }
  // you: a dot and the way you are looking (正廳 up: the screen's up is −x, right is −z)
  const px=X(ME.z), py=Y(ME.x), fx=Math.cos(ME.yaw), fy=-Math.sin(ME.yaw);   // forward (−sin yaw, −cos yaw) in (x,z) lands on screen as (cos yaw, −sin yaw)
  const ang=Math.atan2(fy,fx); g.fillStyle=night?'rgba(240,236,225,.22)':'rgba(31,29,26,.18)'; g.beginPath(); g.moveTo(px,py); g.arc(px,py,labels?40:26,ang-.55,ang+.55); g.closePath(); g.fill();
  g.fillStyle=ink; g.beginPath(); g.arc(px,py,labels?5:4,0,Math.PI*2); g.fill(); }
// the small map: the house's own plan view (roofs cut away, as in 宅院平面) seen from straight above, a rectangle that
// follows you, 正廳 up; drawn into a texture a few times a second and copied to a little canvas with the people on top.
// Click it for the whole compound, click there to go.
const mapUI=(()=>{ const tr=$('#hud-tr'), W=140, H=296, DPR=2; tr.innerHTML=`<canvas width="${W*DPR}" height="${H*DPR}" style="width:${W}px;height:${H}px;display:block"></canvas>`; const c=tr.querySelector('canvas'), g=c.getContext('2d');
  if(LS.get('hk-map')==='off') tr.classList.add('mmoff');
  /* the small map is the plan view itself (宅院平面: walls cut at 2.35 m, the even plan light, no haze), seen whole from
     straight above, upright like the plan view: the 正廳 (south) at the top, the gate (north) at the bottom */
  const cam=new THREE.PerspectiveCamera(30,W/H,1,200), C={x:19.6,z:9.8}, SPAN_X=72, SPAN_Z=34;
  const r=Math.max(SPAN_X, SPAN_Z/(W/H))/2/Math.tan(THREE.MathUtils.degToRad(cam.fov/2))+2.35;
  cam.up.set(-1,0,0); cam.position.set(C.x,r,C.z); cam.lookAt(C.x,0,C.z); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  const R=(()=>{ const t=new THREE.WebGLRenderTarget(W*DPR,H*DPR); t.texture.colorSpace=THREE.SRGBColorSpace; return {t,buf:new Uint8Array(W*DPR*H*DPR*4),img:new ImageData(W*DPR,H*DPR)}; })();
  let base=null;   // the building, drawn once in a while; people go on top every frame it is shown
  function shoot(){ if(renderer.xr.isPresenting) return false; const w=W*DPR, h=H*DPR;
    const clip=renderer.clippingPlanes, fog=scene.fog, fi=planFill.intensity; renderer.clippingPlanes=planClip; scene.fog=null; planFill.intensity=1.1;
    const prev=renderer.getRenderTarget(); renderer.setRenderTarget(R.t); renderer.render(scene,cam); renderer.setRenderTarget(prev);
    renderer.clippingPlanes=clip; scene.fog=fog; planFill.intensity=fi;
    renderer.readRenderTargetPixels(R.t,0,0,w,h,R.buf); const d=R.img.data, row=w*4; for(let y=0;y<h;y++) d.set(R.buf.subarray((h-1-y)*row,(h-y)*row),y*row);
    if(!base){ base=document.createElement('canvas'); base.width=w; base.height=h; } base.getContext('2d').putImageData(R.img,0,0); return true; }
  const v=new THREE.Vector3(); const at=(x,z)=>{ v.set(x,0,z).project(cam); return [(v.x+1)/2*W*DPR,(1-v.y)/2*H*DPR]; };
  function marks(){ g.drawImage(base,0,0); const rr=3.2*DPR;
    for(const [,o] of others){ const p=o.av.g.position, [X,Y]=at(p.x,p.z); g.fillStyle=/^#[0-9a-f]{6}$/i.test(o.p.c)?o.p.c:'#888'; g.beginPath(); g.arc(X,Y,rr,0,Math.PI*2); g.fill(); g.lineWidth=1.5; g.strokeStyle='#fff'; g.stroke(); }
    const [px,py]=at(ME.x,ME.z), [fx,fy]=at(ME.x-Math.sin(ME.yaw),ME.z-Math.cos(ME.yaw)), a=Math.atan2(fy-py,fx-px);
    g.fillStyle='rgba(168,52,58,.3)'; g.beginPath(); g.moveTo(px,py); g.arc(px,py,rr*6,a-.55,a+.55); g.closePath(); g.fill();
    g.fillStyle='#a8343a'; g.beginPath(); g.arc(px,py,rr*1.2,0,Math.PI*2); g.fill(); g.lineWidth=2; g.strokeStyle='#fff'; g.stroke(); }
  // a click on the small map opens the full plan view (宅院平面)
  tr.onclick=()=>{ if(VIEW.mode!=='plan') setView('plan'); };
  function teleport(x,z){ if(ME.seat>=0) standUp(); let best=null; for(let r=0;r<3&&!best;r+=.25) for(let a=0;a<Math.PI*2;a+=Math.PI/8){ const px=x+Math.cos(a)*r, pz=z+Math.sin(a)*r; if(walkable(px,pz)){ best={x:px,z:pz}; break; } }
    if(!best){ toast('那裡走不進去'); return; } ME.x=best.x; ME.z=best.z; ME.path=[]; ME.targetYaw=null; if(VIEW.mode!=='walk') setView('walk'); pushPresence(true); }
  let t=9, mt=0;
  function tick(dt){ if(!window.__entered) return; const hide=tr.classList.contains('mmoff')||VIEW.mode==='plan'; tr.style.visibility=VIEW.mode==='plan'?'hidden':''; if(hide) return;
    t+=dt; mt+=dt; if(t>2||!base){ t=0; shoot(); } if(base&&mt>.1){ mt=0; marks(); } }
  function toggle(){ tr.classList.toggle('mmoff'); LS.set('hk-map',tr.classList.contains('mmoff')?'off':'on'); }
  return {tick,toggle,teleport}; })();
ZL_ANIM.push(dt=>mapUI.tick(dt||.016));
addEventListener('keydown',e=>{ if(e.target.tagName==='INPUT'||e.target.tagName==='SELECT'||e.repeat) return; const k=e.key.toLowerCase();
  if(k==='h'){ e.preventDefault(); helpUI.toggle(); } else if(k==='n'){ e.preventDefault(); mapUI.toggle(); } else if(k==='escape'){ $('#helpbox')?.classList.remove('on'); } });
/* ---- the little capsule rows over the action bar: what to smoke, and the gestures (G) ----
   Gestures play on the figure's arms (and a bow of the body); everyone sees them (presence `em`); moving ends them. */
var myEmote=null;   // [id, start ms]
const EMOTES=['bow','behind','think','clap'];
const capUI=(()=>{ const css=document.createElement('style'); css.textContent=`
#hud-br .caps{display:none;gap:6px;justify-content:flex-end;flex-wrap:wrap}
#hud-br .caps.on{display:flex}
#hud-br .caps button{background:var(--hud-bg);border:1px solid var(--hud-rule);color:var(--hud-ink);font:13px "Noto Serif TC",serif;padding:5px 12px;border-radius:999px;box-shadow:var(--hud-sh);cursor:pointer}
#hud-br .caps button.on{background:var(--hud-on);color:var(--hud-on-ink);border-color:var(--hud-on)}`; document.head.appendChild(css);
  const br=$('#hud-br'), bar=$('#bar');
  const mk=(id,list,key,pick)=>{ const d=document.createElement('div'); d.className='caps'; d.id=id; d.innerHTML=list.map(k=>`<button data-k="${k}">${esc(HT(key+'.'+k))}</button>`).join(''); br.insertBefore(d,bar); d.onclick=e=>{ const b=e.target.closest('button'); if(b) pick(b.dataset.k); }; return d; };
  const sm=mk('smokepick',SMOKE_TYPES,'smoke',k=>{ mySmokeType=k; try{ localStorage.setItem('hk-smoke-type',k); }catch{} pushPresence(); sync(); });
  const em=mk('emotepick',EMOTES,'emote',k=>{ if(myEmote&&myEmote[0]===k){ myEmote=null; } else { myEmote=[k,Date.now()]; } pushPresence(); sync(); });
  const eb=document.createElement('button'); eb.id='bEmote'; eb.textContent=HT('emote.btn'); bar.insertBefore(eb,$('#bThird')); eb.onclick=()=>toggleEmotes();
  function toggleEmotes(on){ on=on??!em.classList.contains('on'); em.classList.toggle('on',on); eb.classList.toggle('on',on||!!myEmote); }
  function sync(){ sm.classList.toggle('on',!!mySmoke); sm.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.k===mySmokeType)); em.querySelectorAll('button').forEach(b=>b.classList.toggle('on',!!myEmote&&b.dataset.k===myEmote[0])); eb.classList.toggle('on',em.classList.contains('on')||!!myEmote); }
  setInterval(sync,400);
  return {toggleEmotes,sync}; })();
addEventListener('keydown',e=>{ if(e.target.tagName==='INPUT'||e.target.tagName==='SELECT'||e.repeat) return; const k=e.key.toLowerCase();
  if(k==='g'){ e.preventDefault(); capUI.toggleEmotes(); }
  if(myEmote&&['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' '].includes(k)){ myEmote=null; pushPresence(); capUI.sync(); } });
// arm targets for each gesture (shoulder pivots: x forward, z out to the side), and how the body leans
function emotePose(id,t,F){ const A=F.userData.arms, B=F.userData.armBase, R=F.userData.baseRot; if(!A) return;
  let L={x:B[0].x,z:B[0].z}, Rt={x:B[1].x,z:B[1].z}, lean=0, done=false;
  if(id==='bow'){ L={x:1.25,z:-.45}; Rt={x:1.25,z:.45}; const k=t<.6?t/.6:t<1.6?1:t<2.4?1-(t-1.6)/.8:0; lean=.28*Math.sin(Math.min(1,k)*Math.PI/2)*(t<2.4?1:0); if(t>3.2) done=true; }
  else if(id==='behind'){ L={x:-.42,z:.32*-1}; Rt={x:-.42,z:.32}; }
  else if(id==='think'){ Rt={x:2.3,z:.42}; L={x:1.0,z:-.55}; lean=.04; }
  else if(id==='clap'){ const c=Math.sin(t*14); L={x:1.15,z:-.32-.12*c}; Rt={x:1.15,z:.32+.12*c}; if(t>3) done=true; }
  const k=.25; A[0].rotation.x+=(L.x-A[0].rotation.x)*k; A[0].rotation.z+=(L.z-A[0].rotation.z)*k; A[1].rotation.x+=(Rt.x-A[1].rotation.x)*k; A[1].rotation.z+=(Rt.z-A[1].rotation.z)*k; F.rotation.x+=(lean-F.rotation.x)*k;
  return done; }
function emoteRest(F){ const A=F.userData.arms, B=F.userData.armBase, R=F.userData.baseRot; if(!A) return; const k=.2; A.forEach((a,i)=>{ a.rotation.x+=(B[i].x-a.rotation.x)*k; a.rotation.z+=(B[i].z-a.rotation.z)*k; }); F.rotation.x+=(R.x-F.rotation.x)*k; }
ZL_ANIM.push(()=>{ const now=Date.now();
  if(ME.av&&ME.av.fig){ if(myEmote){ if(emotePose(myEmote[0],(now-myEmote[1])/1000,ME.av.fig)){ myEmote=null; pushPresence(); } } else emoteRest(ME.av.fig); }
  if(typeof others==='undefined') return;
  for(const [,o] of others){ const F=o.av&&o.av.fig; if(!F) continue; const em=Array.isArray(o.p.em)?o.p.em:null, moving=(num(o.p.vx)**2+num(o.p.vz)**2)>.05;
    if(em&&EMOTES.includes(em[0])&&!moving&&now-num(em[1])<120000){ if(o.emDone!==em[1]&&emotePose(em[0],(now-num(em[1]))/1000,F)) o.emDone=em[1]; if(o.emDone===em[1]) emoteRest(F); } else emoteRest(F); } });

// actions
function doJump(){ if(ME.seat>=0||ME.jy>0||ME.jv>0) return; ME.jv=3.3; ME.jy=0.0001; playStep(); myAct=['j',Date.now()]; pushPresence(); }
function toggleCrouch(){ if(ME.seat>=0) return; ME.crouch=!ME.crouch; actBtn('蹲',ME.crouch); pushPresence(); }
function toggleRun(){ NET.run=!NET.run; actBtn('跑',NET.run); }
function actBtn(label,on){ const b=[...document.querySelectorAll('#actbtns button')].find(x=>x.textContent===label); if(b) b.classList.toggle('on',on); }
if(isTouch){ const w=document.createElement('div'); w.id='actbtns'; for(const [l,f] of [['聊',openChat],['跑',toggleRun],['跳',doJump],['蹲',toggleCrouch]]){ const b=document.createElement('button'); b.textContent=l; b.onclick=e=>{ e.stopPropagation(); f(); }; w.appendChild(b); } document.body.appendChild(w); }
// others: chat bubbles, jumps and crouching, every frame
function tickPeople(dt){ for(const [,o] of others){ const p=o.p||{};
    const cm=Array.isArray(p.cm)?p.cm:null; if(o.cmAt===undefined) o.cmAt=cm?cm[1]:null; else if(cm&&cm[1]!==o.cmAt){ if(typeof cm[0]==='string'){ const nm=str(p.n,12)||'訪客'; chatLine(nm,cm[0].slice(0,120),/^#[0-9a-f]{6}$/i.test(p.c)?p.c:'#888',{at:{x:o.av.g.position.x,z:o.av.g.position.z}}); showBubble(o,cm[0].slice(0,120)); } o.cmAt=cm[1]; }
    if(o.bub){ o.bubT-=dt; if(o.bubT<=0){ o.av.g.remove(o.bub); o.bub.material.map.dispose(); o.bub=null; } }
    const ac=Array.isArray(p.ac)?p.ac:null; if(o.acAt===undefined) o.acAt=ac?ac[1]:null; else if(ac&&ac[1]!==o.acAt){ if(ac[0]==='j') o.jt=0; o.acAt=ac[1]; }
    let jy=0; if(o.jt!==undefined&&o.jt<.68){ o.jt+=dt; jy=Math.max(0,Math.sin(Math.PI*Math.min(1,o.jt/.68)))*.55; }
    const cr=p.cr===1&&num(p.s,-1)<0; o.cs=(o.cs??1)+((cr?.66:1)-(o.cs??1))*Math.min(1,dt*8); o.av.g.scale.y=o.cs; o.av.g.children.forEach(c=>{ if(c.isSprite) c.scale.y=(c===o.bub?1.2*160/512:.26)/o.cs; });
    const fx=Array.isArray(p.fx)?p.fx:null; if(o.fxAt===undefined) o.fxAt=fx?fx[1]:null; else if(fx&&fx[1]!==o.fxAt){ o.fxAt=fx[1]; if(typeof fx[0]==='string'&&Date.now()-fx[1]<15000){ showBubble(o,fx[0].slice(0,20)); o.bubT=3.2; } }
    o.jyNow=jy; }
  if(chatUI.diag.style.display==='block'){ diagT+=dt; if(diagT>.5){ diagT=0; renderDiag(); } } }
let diagT=0;
function renderDiag(){ const now=Date.now(); const L=[`連線：${room?(window.claude&&typeof window.claude.use==='function'?'Claude 房間':(window.__roomKind||'本機')):'離線'}  狀態：${NET.st||'-'}  ${room&&room.mode?room.mode():''}`,`我：${myName}  x ${ME.x.toFixed(1)}  z ${ME.z.toFixed(1)}  畫質 ${renderer.getPixelRatio().toFixed(2)}  ${FPS.v.toFixed(0)} fps`];
  if(!others.size) L.push('（目前沒有收到其他人的資料）');
  for(const [k,o] of others){ const p=o.p||{}, v=NET.peers&&NET.peers.get(k); L.push(`${str(p.n,12)||'訪客'}  x ${num(p.x).toFixed(1)}  z ${num(p.z).toFixed(1)}  座位 ${num(p.s,-1)}`+(v?`  即時 ${v.fast?((now-v.fast)/1000).toFixed(1)+'s':'—'}  同步 ${v.slow?((now-v.slow)/1000).toFixed(1)+'s':'—'}`:'')); }
  chatUI.diag.textContent=L.join('\n'); }
function toggleDiag(){ chatUI.diag.style.display=chatUI.diag.style.display==='block'?'none':'block'; if(chatUI.diag.style.display==='block') renderDiag(); }
// resolution follows the frame rate: down when it stutters, back up when there is room
const FPS={v:60,n:0,t:0,pr:renderer.getPixelRatio(),max:renderer.getPixelRatio(),good:0};
function tickFPS(dt){ FPS.n++; FPS.t+=dt; if(FPS.t<2) return; FPS.v=FPS.n/FPS.t; FPS.n=0; FPS.t=0; if(renderer.xr.isPresenting) return;
  if(FPS.v<38&&FPS.pr>.6){ FPS.pr=Math.max(.6,FPS.pr-.15); renderer.setPixelRatio(FPS.pr); FPS.good=0; }
  else if(FPS.v>56&&FPS.pr<FPS.max){ if(++FPS.good>=3){ FPS.pr=Math.min(FPS.max,FPS.pr+.1); renderer.setPixelRatio(FPS.pr); FPS.good=0; } } else FPS.good=0; }

/* ---------------- toast ---------------- */
let toastT=0; function toast(s,ms=5200){ const h=$('#hint'); h.textContent=s; h.style.opacity=1; clearTimeout(toastT); toastT=setTimeout(()=>h.style.opacity=0,ms); }

// {% endraw %}
