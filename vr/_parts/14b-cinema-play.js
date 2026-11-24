// {% raw %}
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
    else if(d.k==='pack'){ const b=new THREE.Mesh(new THREE.BoxGeometry(.055,.1,.035),mt); b.position.y=.05; g.add(b); }
    else { const h=d.k==='bottle'?.2:.122, r=d.k==='bottle'?.026:.03, b=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,14),mt); b.position.y=h/2; g.add(b);
      if(d.k==='bottle'){ const n=new THREE.Mesh(new THREE.CylinderGeometry(.011,.024,.05,12),mt); n.position.y=h+.025; g.add(n); } } return g; };
  let fpB=null, fpIdx=-1, sipAt=0, sips=0; window.__cineBt=-1;
  window.__cineDrink={take:i=>takeDrink(i),sip:()=>{ sip(); FOOD.fx(FOOD.kindOf(names()[window.__cineBt]||''),names()[window.__cineBt]||''); },put:()=>putBack(),names:()=>names(),bottleOf:i=>bottleOf(i),left:()=>sips};
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
  window.__cineBusy=()=>!!(vid&&!vid.paused);
  window.__cine={S,L,FILMS,vid,openCine,openFridge,enterFs,exitFs,act,pos,play,takeDrink,sip,putBack};
}
const POPCORN={pops:null,kettle:null};
// ---- outside the cinema (the 明間 between it and the classroom), on the cinema side of the hall door: a popcorn cart
//      The cooler: lit shelves of twenty drinks (CIN.DRINK, names in cine.drinks), none with alcohol; take one and it is in
//      your hand (everyone sees it), sip it anywhere. The popcorn cart: a kettle in a lit glass case, popping all the time
//      and hardest before and after a film; a striped bucket to take.
{ const M2=(c,r=.5,o={})=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:r},o));
  // (the glass-door cooler that stood here is gone: 阿春 brings drinks and snacks into the cinema instead)
  // the popcorn cart: red, a glass case on top with a kettle, the popcorn in a heap, a warm lamp; buckets on the shelf
  { const g=new THREE.Group(); g.position.set(17.29,0,18.72); g.rotation.y=Math.PI/2; scene.add(g); const tag={type:'popcorn'}, red=M2(0xb8282a,.4), gold=M2(0xc9a24a,.35,{metalness:.6});
    box(.62,.82,.5,red,0,.45,0,g,tag); for(const sx of [-1,1]){ const w=new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,.04,16),M2(0x2a2a2a,.6)); w.rotation.x=Math.PI/2; w.rotation.z=Math.PI/2; w.position.set(sx*.33,.14,0); g.add(w); }
    box(.64,.04,.52,gold,0,.88,0,g); const glassM=new THREE.MeshStandardMaterial({color:0xfff4e0,transparent:true,opacity:.2,roughness:.05});
    for(const [w,h,d,x,z] of [[.62,.62,.01,0,.25],[.62,.62,.01,0,-.25],[.01,.62,.5,.31,0],[.01,.62,.5,-.31,0]]){ const p=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),glassM); p.position.set(x,1.21,z); p.userData=tag; pickables.push(p); g.add(p); }
    box(.66,.08,.54,red,0,1.56,0,g,tag); box(.5,.12,.02,M2(0xf2e6c8,.5),0,1.56,.28,g);
    const sign=new THREE.Mesh(new THREE.PlaneGeometry(.46,.1),new THREE.MeshBasicMaterial({map:textCanvas(256,56,(gg,w,h)=>{ gg.fillStyle='#b8282a'; gg.fillRect(0,0,w,h); gg.fillStyle='#f6e7b0'; gg.font=F('700',38); gg.textAlign='center'; gg.textBaseline='middle'; gg.fillText(NT('pop.sign'),w/2,h/2+2); })})); sign.position.set(0,1.56,.292); g.add(sign);
    const corn=M2(0xf6e7b8,.8); const heap=new THREE.Group(); heap.position.set(0,.92,0); g.add(heap); for(let i=0;i<70;i++){ const c=new THREE.Mesh(new THREE.IcosahedronGeometry(.022,0),corn); const a=Math.random()*6.28, r=Math.random()*.24; c.position.set(Math.cos(a)*r,Math.random()*.08*(1-r*2),Math.sin(a)*r*.8); heap.add(c); }
    const kettle=new THREE.Group(); kettle.position.set(0,1.38,0); g.add(kettle); const k=new THREE.Mesh(new THREE.CylinderGeometry(.12,.1,.12,16),M2(0xd0d4d6,.25,{metalness:.8})); kettle.add(k);
    const lamp=new THREE.PointLight(0xffc870,.6,1.6); lamp.position.set(0,1.45,0); g.add(lamp);
    const pops=[]; for(let i=0;i<14;i++){ const c=new THREE.Mesh(new THREE.IcosahedronGeometry(.02,0),corn); c.visible=false; g.add(c); pops.push({c,t:Math.random()*2,vx:0,vy:0,vz:0}); }
    for(let i=0;i<3;i++){ const b=snackMesh(SNACKS.findIndex(x=>x[2]==='popcorn')); b.position.set(-.18+i*.18,.5,.27); g.add(b); }
    OB(17.0,17.6,18.44,19.0); POPCORN.pops=pops; POPCORN.kettle=kettle; } }
ZL_ANIM.push(dt=>{ const P=POPCORN; if(!P.pops) return; dt=dt||.016; const film=window.__cineBusy?window.__cineBusy():false, rate=film?1.6:.7;
  P.kettle.rotation.z=Math.sin(performance.now()/180)*.15;
  for(const q of P.pops){ q.t-=dt*rate; if(q.t<=0&&!q.c.visible){ q.c.visible=true; q.c.position.set(0,1.42,0); q.vx=(Math.random()-.5)*.8; q.vz=(Math.random()-.5)*.6; q.vy=.6+Math.random()*.6; }
    if(q.c.visible){ q.vy-=3*dt; q.c.position.x+=q.vx*dt; q.c.position.y+=q.vy*dt; q.c.position.z+=q.vz*dt; if(Math.abs(q.c.position.x)>.28) q.vx*=-.5; if(Math.abs(q.c.position.z)>.22) q.vz*=-.5; if(q.c.position.y<.95){ q.c.visible=false; q.t=.3+Math.random()*2; } } } });
window.__coolerAct=u=>{ if(u.type==='popcorn'){ const i=SNACKS.findIndex(x=>x[2]==='popcorn'); setSnack(i); FOOD.biteK=''; toast(NT('pop.take'),2400); try{ noiseBurst(.2,2400,6,.05); }catch{} return true; }
  if(u.type==='cooler'&&window.__cineDrink){ const nm=window.__cineDrink.names(); const body=openPanel(NT('cooler.title'),`<p class="meta">${esc(NT('cooler.note'))}</p><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:6px">${CIN.DRINK.map((d,i)=>`<button class="btn" data-d="${i}">${esc(nm[i]||'')}</button>`).join('')}</div>`);
    body.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{ if(mySnack>=0) setSnack(-1); window.__cineDrink.take(+b.dataset.d); FOOD.biteK=''; closePanel(); }); return true; } return false; };
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
