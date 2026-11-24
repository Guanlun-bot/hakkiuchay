// {% raw %}
/* ================= 對話：閒聊、問事情、關心、吩咐；人物之間的對話；臨時差事 =================
   Every one of the ten opens with a line for the hour, the weather or (to the master) for him, then a menu in four parts.
   All lines are in the back office (npc: g.<id>.<時段>, w.<id>.<雨熱冷>, k.<id>, b.<id>, praise.<id>, rest.<id>,
   s.<id>.<n> their own story, told a part at a time and remembered in this browser, p.<a>_<b>.<n> two of them talking). */
const slotOf=m=>m>=300&&m<480?'dawn':m>=480&&m<660?'morn':m>=660&&m<840?'noon':m>=840&&m<1020?'aft':m>=1020&&m<1200?'dusk':'night';
const wxOf=()=>{ try{ if(raining()) return 'rain'; }catch{} const t=WX&&WX.temp; return t>=30?'hot':t!=null&&t<=15?'cold':null; };
const sayK=(id,key)=>{ const t=npcLine(key,titleFill()); if(t) npcSay(id,t); return !!t; };
const STORY=(()=>{ try{ return JSON.parse(localStorage.getItem('npcStory')||'{}'); }catch{ return {}; } })();
function tellStory(id){ const k=(STORY[id]||0)+1, t=NT('s.'+id+'.'+k,0); if(t){ STORY[id]=k; try{ localStorage.setItem('npcStory',JSON.stringify(STORY)); }catch{} npcSay(id,String(t).replace(/\{稱呼\}/g,titleFill().稱呼)); } else sayK(id,'s.'+id+'.end'); }
function greet(id){ const m=taipeiNow().min, w=wxOf(), r=Math.random();
  if(isBoss()&&r<.3) return sayK(id,'b.'+id); if(w&&r<.55) return sayK(id,'w.'+id+'.'+w); return sayK(id,'g.'+id+'.'+slotOf(m)); }
const MEALN={b:'早飯',l:'午飯',d:'晚飯',n:'宵夜'};
function sayMenu(id){ const M=nextMeal(), T=taipeiNow(), dish=menuOf(T.dow,M.k); if(!dish) return sayK(id,'ask.menuNone'); npcSay(id,String(NT('ask.menu')).replace('{餐}',MEALN[M.k]||'').replace('{菜}',dish)); }
// ---- one-off errands the master gives
function errandSay(id){ npcSay(id,npcLine('ui.o.ok',titleFill())); }
function doErrand(n,steps,done){ leaveSpot(n); n.follow=false; n.task=null; n.errand=true; n.next=null; let i=0;
  const step=()=>{ const s=steps[i++]; if(!s){ n.errand=false; n.prop=null; n.busyUntil=0; if(done) done(n); return; } if(s.prop!==undefined) n.prop=s.prop;
    const p=typeof s.to==='function'?s.to():s.to; npcGo(n,p,k=>{ if(s.face) npcFace(k,typeof s.face==='function'?s.face():s.face); if(s.drop) k.prop=null; k.act=s.act||'idle'; if(s.on) s.on(k); k.busyUntil=Date.now()+(s.dur||3000); k.next=step; }); };
  step(); }
const nearMe=(d=1.1)=>{ const fx=-Math.sin(ME.yaw), fz=-Math.cos(ME.yaw); const p={x:ME.x+fx*d,z:ME.z+fz*d}; return walkable(p.x,p.z)?p:{x:ME.x,z:ME.z+.8}; };
const ORDERS={
  xu:()=>[[NT('ui.o.call'),()=>npcChoices('xu',NPCS.filter(d=>d.id!=='xu'&&!d.ext).map(d=>[npcName(d.id),()=>{ errandSay('xu'); const k=NPC[d.id]; if(k.lie||k.look) return npcSay('xu',npcLine('xu.findNone')); doErrand(k,[{to:()=>nearMe(1.2),face:()=>ME,dur:20000,on:m=>sayK(m.id,'ui.o.come')}]); }]).concat([[NT('ui.back'),()=>talkMenu('xu')]]))]],
  yu:()=>[[NT('ui.o.mail'),()=>{ errandSay('yu'); doErrand(NPC.yu,[{to:P(3,1),prop:'mail',act:'unload',drop:true,dur:3000},{to:NP.gate,dur:1000}]); }]],
  chun:()=>[[NT('ui.o.tea'),()=>teaFetch('chun')]],
  lai:()=>[[NT('ui.o.tea'),()=>teaFetch('lai')]],
  shui:()=>[[NT('ui.o.flower'),()=>{ errandSay('shui'); doErrand(NPC.shui,[{to:NP.garden,act:'prune',dur:4000},{to:P(-4.5,21.5),prop:'flowers',act:'unload',drop:true,dur:3000}]); }]],
  cai:()=>[[NT('ui.o.blind'),()=>{ errandSay('cai'); const bs=BLINDS.map((b,i)=>({i,d:b.g.getWorldPosition(new THREE.Vector3()).distanceTo(new THREE.Vector3(ME.x,1.5,ME.z))})).filter(o=>o.d<6).sort((a,b)=>a.d-b.d); if(!bs.length) return;
      const c=BLINDS[bs[0].i].g.getWorldPosition(new THREE.Vector3()); doErrand(NPC.cai,[{to:()=>{ const p={x:c.x+(ME.x-c.x)*.25,z:c.z+(ME.z-c.z)*.25}; return walkable(p.x,p.z)?p:{x:ME.x,z:ME.z}; },face:{x:c.x,z:c.z},act:'blind',dur:2500,on:()=>bs.forEach(o=>window.__blindAct&&window.__blindAct({i:o.i}))}]); }],
           [NT('ui.o.fix'),()=>{ errandSay('cai'); doErrand(NPC.cai,[{to:P(10.6,21.4),prop:'tools',act:'prep',dur:25000}]); }]],
  li:()=>[[NT('ui.o.sheet'),()=>{ errandSay('li'); doErrand(NPC.li,[{to:P(33.64,16.63),act:'load',dur:12000},{to:P(34.56,22.57),act:'load',dur:12000}]); }]],
  he:()=>[[NT('ui.o.sweep'),()=>{ errandSay('he'); const p=nearMe(1.4); doErrand(NPC.he,[{to:p,act:'sweep',dur:30000}]); }]],
  fu:()=>[[NT('ui.o.ink'),()=>{ errandSay('fu'); doErrand(NPC.fu,[{to:P(3,1),face:P(3,-1),act:'write',dur:60000}]); }]],
};
function teaFetch(id){ errandSay(id); const back=()=>nearMe(1.0); doErrand(NPC[id],[{to:P(10.4,-2.2),face:P(10.4,-4.5),act:'load',dur:5000},{to:back,face:()=>ME,dur:6000,on:m=>sayK(m.id,id==='lai'?'lai.tea':'chun.served')}]); }
// ---- the menu
function talkMenu(id){ const n=NPC[id], boss=isBoss(), back=[NT('ui.back'),()=>talkMenu(id)], say=k=>npcSay(id,npcLine(k)), c=NS.cake.st;
  const chat=[[NT('ui.today2'),()=>sayK(id,'g.'+id+'.'+slotOf(taipeiNow().min))],[NT('ui.weather'),()=>{ const w=wxOf(); w?sayK(id,'w.'+id+'.'+w):sayK(id,'g.'+id+'.'+slotOf(taipeiNow().min)); }],[NT('ui.story'),()=>tellStory(id)]];
  if(boss) chat.push([NT('ui.boss'),()=>sayK(id,'b.'+id)]);
  if(id==='li') chat.push(['家鄉在哪裡？',()=>say2('li','li.home')]); if(id==='he') chat.push([NT('he.chatL'),()=>say2('he','he.chat')]); if(id==='fu') chat.push([NT('fu.bookL'),()=>say2('fu','fu.book')]); if(id==='lai') chat.push([NT('lai.askL'),()=>say2('lai','lai.ask')]);
  const ask=[[NT('ui.busy'),()=>sayK(id,'k.'+id)],[NT('ui.menu'),()=>sayMenu(id)]];
  if(id==='xu') ask.unshift([NT('ui.find'),findMenu],[NT('ui.today'),()=>say(c===5?'xu.today':'xu.todayWait')],[NT('ui.book'),npcBookList]);
  if(id==='chun'){ ask.unshift([NT('ui.tea'),()=>say(myMD&&Date.now()-(myMD.at||0)>8000?'chun.served':'chun.ask')],[NT('ui.cake'),()=>say(c===5?'chun.cake':'chun.steaming')]); if(n.act==='write') ask.push([NT('ui.write'),()=>say('chun.writing')]); }
  if(id==='shui') ask.unshift([NT('ui.hanxiao'),()=>say(hanxiaoBloom()?'shui.bloom':'shui.bud')],[NT('ui.prune'),()=>say('shui.prune')]);
  if(id==='li') ask.push(['有衣服要洗',()=>say2('li','li.wash')]); if(id==='lai') ask.push([NT('lai.whatL'),()=>say2('lai','lai.what')]);
  const care=[[NT('ui.praise'),()=>sayK(id,'praise.'+id)],[NT('ui.rest'),()=>sayK(id,'rest.'+id)]];
  if(boss&&(id==='shui'||id==='cai')) care.push([NT('ui.sup'),()=>sayK(id,'sup.'+id)]);
  const top=[[NT('ui.chat'),()=>npcChoices(id,chat.concat([back]))],[NT('ui.ask'),()=>npcChoices(id,ask.concat([back]))],[NT('ui.care'),()=>npcChoices(id,care.concat([back]))]];
  if(id==='xu') top.unshift([NT('ui.lead'),()=>openButler('lead')],[NT('h.title',1),()=>openButler()]);
  if(id==='chun') top.unshift([NT('snack.order'),()=>window.__food&&window.__food.snackMenu('chun')]);
  if(id==='he') top.unshift(['逗她',()=>npcChoices('he',[1,2,3,4,5].map(k=>[NT('he.t'+k,1),()=>tease(k)]).concat([back]))]);
  if(boss&&ORDERS[id]) top.push([NT('ui.order'),()=>npcChoices(id,ORDERS[id]().concat([back]))]);
  npcChoices(id,top); }
window.__npcTalk2=id=>{ const n=NPC[id], VRm=renderer.xr.isPresenting;
  if(id==='zhan'&&window.__stnTalk) return window.__stnTalk();
  if(id==='li'&&n.pose==='pray'){ say2('li','li.pray'); return true; }
  if(id==='xu'&&n.lead){ npcChoices(id,[[NT('ui.stop'),()=>leadEnd(true)]]); return true; }
  if(id==='chun'&&n.carry==='cake'){ npcSay(id,npcLine('chun.tray')); return true; }
  if(id==='cai'&&(n.carry==='wood'||n.carry==='water'||n.carry==='both'||n.act==='chop')){ npcSay(id,npcLine(n.act==='chop'?'cai.chop':n.carry==='water'?'cai.water':'cai.stopped')); return true; }
  if(id==='yu'&&!NS.first){ NS.first=true; npcSave(); npcSay(id,npcLine('yu.first')); }
  else if(id==='xu'&&!NS.talked.xu){ NS.talked.xu=true; npcSave(); npcSay(id,npcLine('xu.first')); }
  else greet(id);
  if(VRm){ if(id==='xu') leadStart(); return true; }
  talkMenu(id); return true; };
// ---- two of them meeting: a short exchange, now and then, when you are near enough to hear
const PAIRS=[['shui','cai'],['huo','cai'],['chun','he'],['li','he'],['xu','fu'],['xu','lai'],['yu','xu'],['lai','huo'],['lai','he']].map(([a,b])=>({a,b,next:0,i:0}));
let pairT=0;
ZL_ANIM.push(()=>{ const now=Date.now(); if(!window.__entered||now-pairT<1500) return; pairT=now;
  for(const p of PAIRS){ const A=NPC[p.a], B=NPC[p.b]; if(!A||!B||now<p.next) continue; const free=n=>n.g.visible&&!n.lie&&!n.look&&!n.tl&&!n.follow&&!n.gather&&!n.cineW&&performance.now()>(n.talk||0);
    if(!free(A)||!free(B)||Math.hypot(A.x-B.x,A.z-B.z)>2.6||Math.hypot(ME.x-A.x,ME.z-A.z)>9) continue;
    let k=0; for(;k<6;k++) if(NT('p.'+p.a+'_'+p.b+'.'+(((p.i+k)%6)+1),0)) break; const idx=((p.i+k)%6)+1, x=NT('p.'+p.a+'_'+p.b+'.'+idx,0); if(!x) continue; p.i=idx; p.next=now+4*60000;
    npcFace(A,B); npcFace(B,A); npcSay(p.a,String(x).replace(/\{稱呼\}/g,titleFill().稱呼)); setTimeout(()=>{ const y=NT('p.'+p.a+'_'+p.b+'.'+idx,1); if(y) npcSay(p.b,String(y).replace(/\{稱呼\}/g,titleFill().稱呼)); },3200); break; } });
// ---- small things carried: letters, a sieve, cut flowers, a toolbox
{ const mk=c=>new THREE.MeshStandardMaterial({color:c,roughness:.85});
  for(const id in NPC){ const n=NPC[id], P0=n.g.userData.parts, g=new THREE.Group(); g.position.set(0,.98,-.28); P0.F.add(g); g.visible=false; n.propG={};
    const add=(k,f)=>{ const h=new THREE.Group(); f(h); h.visible=false; g.add(h); n.propG[k]=h; };
    add('mail',h=>{ for(let i=0;i<3;i++){ const b=new THREE.Mesh(new THREE.BoxGeometry(.16,.008,.1),mk(i%2?0xf1e7cf:0xe6d7b4)); b.position.y=i*.009; b.rotation.y=i*.15; h.add(b); } });
    add('sieve',h=>{ const s=new THREE.Mesh(new THREE.CylinderGeometry(.2,.19,.04,20,1,true),mk(0xc8ad74)); s.material.side=THREE.DoubleSide; h.add(s); const bt=new THREE.Mesh(new THREE.CircleGeometry(.19,20),mk(0x6b5a3a)); bt.rotation.x=-Math.PI/2; bt.position.y=-.015; h.add(bt); });
    add('flowers',h=>{ for(let i=0;i<5;i++){ const st=new THREE.Mesh(new THREE.CylinderGeometry(.004,.004,.32,5),mk(0x4f7a3a)); st.position.set((i-2)*.02,.12,0); st.rotation.z=(i-2)*.12; h.add(st); const f=new THREE.Mesh(new THREE.SphereGeometry(.025,8,6),mk([0xf3efe0,0xe8b9c0,0xf0e2a8][i%3])); f.position.set((i-2)*.045,.28,0); h.add(f); } });
    add('tools',h=>{ h.add(new THREE.Mesh(new THREE.BoxGeometry(.32,.12,.14),mk(0x7a5a3a))); const hd=new THREE.Mesh(new THREE.TorusGeometry(.05,.008,6,12,Math.PI),mk(0x3a2a1e)); hd.position.y=.06; h.add(hd); });
    n.propRoot=g; } }
ZL_ANIM.push(()=>{ for(const id in NPC){ const n=NPC[id]; if(!n.propRoot) continue; const k=n.pose?null:n.prop||(n.task&&TASKS[n.task]&&TASKS[n.task].hold)||null; if(n.propK!==k){ n.propK=k; for(const q in n.propG) n.propG[q].visible=q===k; n.propRoot.visible=!!k; } } });

/* ---- every half second: send people to the table when the meal starts, set the table, the lamp, steam and smoke ---- */
const MEALRUN={t:1,id:'',called:'',bowl:'',chatAt:0,chatI:0};
function mealTick(dt){ if(!window.__entered) return; const now=performance.now(), w=now/1000;
  // steam and smoke move every frame
  const M=MEALRUN.M; const cooking=M&&M.phase==='cook', noodle=(cooking&&(M.k==='l'||M.k==='n'))||KNOOD.on||NPC.huo.act==='noodle', fire=(cooking&&(M.k==='b'||M.k==='d'))||NS.cake.st===1||NS.cake.st===2;
  if(NOODLE_STEAM.at) NOODLE_STEAM.s.forEach((s,i)=>{ const ph=(w*.45+i/10)%1, A=NOODLE_STEAM.at; s.position.set(A.x+(i%2?-.1:.1)+Math.sin(i*2+w)*.04,A.y+ph*.8,A.z+((i%3)-1)*.43+Math.cos(i*3)*.04); s.material.opacity=noodle?(1-ph)*.45:0; s.scale.setScalar(.22+ph*.5); });
  DINE.smoke.forEach((s,i)=>{ const ph=(w*.18+i/8)%1; s.position.set(46.25+Math.sin(i*2.3+w*.3)*.2+ph*.5*WIND.speed*.08,6.85+ph*2.2,-3.79-ph*.4); s.material.opacity=fire?(1-ph)*.32:0; s.scale.setScalar(.35+ph*1.2); });
  calPage();
  // gas flames flicker, the tap runs, the pantry door swings; 火師 lights a ring when he stirs and runs the tap when he washes
  const hu=NPC.huo, autoGas=hu.act==='stir', autoTap=hu.act==='wash';
  // the stove fire: lit by hand, for the cake, or when 火師 cooks at it
  { const on=KFIRE.on||fire||(Math.hypot(hu.x-NP.stove.x,hu.z-NP.stove.z)<.5&&['cook','steam','fire'].includes(hu.act)&&cooking);
    for(const F of KFIRE.fl){ if(F.f){ F.f.visible=on; if(on){ const k=Math.sin(w*9+F.ph)*.5+Math.sin(w*17+F.ph*2)*.3; F.f.scale.set(.9+k*.15,1+k*.35,1); F.f.position.y=F.base+.02*(1+k*.35); } }
      if(F.glow) F.glow.material.opacity=on?.35+Math.sin(w*7)*.08:0; if(F.end) F.end.material.emissiveIntensity=on?1.2+Math.sin(w*5+F.end.position.x*40)*.4:0; }
    if(on){ NPCP.fire.intensity=1.5+Math.sin(w*11)*.35+Math.sin(w*23)*.2; KFIRE.lit=true; } else if(KFIRE.lit){ KFIRE.lit=false; NPCP.fire.intensity=0; } }
  // the noodle well boils when switched on, when 火師 cooks noodles, or at lunch and the late meal
  { const on=KNOOD.on||noodle||hu.act==='noodle'; KNOOD.cur=on; for(const B0 of KNOOD.bub){ B0.b.visible=on; if(on){ const ph=(w*1.6+B0.ph)%1; B0.b.scale.setScalar(.3+ph*1.1); B0.b.material.opacity=.8*(1-ph); } } }
  // the wash basin
  { const on=KBASIN.on; KBASIN.st.visible=KBASIN.pool.visible=KBASIN.spl.visible=on; if(on){ KBASIN.spl.children.forEach((d,k)=>{ const ph=(w*3+k/8)%1, a=k*.8; d.position.set(Math.cos(a)*.05*ph,Math.sin(ph*Math.PI)*.04,Math.sin(a)*.05*ph); }); } }
  KTAP.splash.children.forEach((d,k)=>{ if(k===0) return; const ph=(w*3+k/8)%1, a=k*.8; d.position.set(Math.cos(a)*.05*ph,Math.sin(ph*Math.PI)*.04,Math.sin(a)*.05*ph); });
  KGAS.forEach((G,i)=>{ const on=G.on||(autoGas&&i===0); G.fl.visible=on; G.fl.userData.light.intensity=on?.5:0; if(on) G.fl.children.forEach((c,k)=>{ if(c.isMesh) c.scale.y=.8+Math.sin(w*23+k*1.7)*.3; }); });
  { const on=KTAP.on||autoTap; KTAP.stream.visible=KTAP.splash.visible=on; if(on){ KTAP.splash.children[0].scale.setScalar(.8+Math.sin(w*30)*.2); KTAP.stream.scale.x=KTAP.stream.scale.z=.9+Math.sin(w*40)*.1; } }
  if(KPANTRY.pv){ const want=KPANTRY.open?1.75:0; KPANTRY.pv.rotation.y+=(want-KPANTRY.pv.rotation.y)*Math.min(1,dt*6); }
  MEALRUN.t+=dt; if(MEALRUN.t<.5) return; MEALRUN.t=0;
  const S=mealState(); MEALRUN.M=S;
  // the table: dishes come in during the last ten minutes, stay through the meal; then the cover and the teapot
  const sets=DINE.sets, GMon=!!(window.__guestMealOn&&window.__guestMealOn()&&!S.phase); const showK=GMon?'d':(S.phase==='serve'||S.phase==='eat')?S.k:null;
  for(const k of ['b','l','d','n']) sets[k].visible=k===showK&&(GMon||S.phase==='eat'||S.r>-7);
  sets.x.visible=!(showK&&(GMon||S.phase==='eat'||S.r>-7)); DINE.places.visible=!!showK&&(GMon||S.phase==='eat'||S.r>-8);
  // the lamp: on for meals and after dark
  const on=!!showK||SKY_DAY<.35; DINE.shade.material.emissiveIntensity=on?.55:0; DINE.bulb.material.emissiveIntensity=on?1.4:0; DINE.lamp.intensity=on?1.6:0;
  if(KITCHEN_STRIP) KITCHEN_STRIP.emissiveIntensity=(S.phase||SKY_DAY<.35)?1.1:0;
  // the menu board for today
  { const m=DINE.menu, T=S.T; if(m.day!==T.day+NT('meal.b')){ m.day=T.day+NT('meal.b'); const g=m.c.getContext('2d'); g.fillStyle='#2f3a33'; g.fillRect(0,0,240,360); g.strokeStyle='#c9b48a'; g.lineWidth=6; g.strokeRect(6,6,228,348);
      g.fillStyle='#efe6cf'; g.font='700 30px "Noto Serif TC",serif'; g.textAlign='center'; g.fillText(NT('dine.today'),120,46);
      let y=82; for(const k of ['b','l','d']){ g.font='700 20px "Noto Serif TC",serif'; g.textAlign='left'; g.fillStyle='#e3c58c'; g.fillText(NT('meal.'+k),18,y); y+=26; g.fillStyle='#efe6cf'; g.font='16px "Noto Serif TC",serif';
        let line=''; for(const ch of menuOf(T.dow,k)){ if(g.measureText(line+ch).width>200){ g.fillText(line,18,y); y+=21; line=''; } line+=ch; } if(line){ g.fillText(line,18,y); y+=21; } y+=10; }
      m.t.needsUpdate=true; } }
  // call to the table, once a meal, if the guest is about
  if(S.phase==='eat'&&MEALRUN.called!==S.id){ MEALRUN.called=S.id; if(Math.hypot(ME.x-DINE.x,ME.z-DINE.z)<14) npcSay('huo',npcLine('huo.call')); }
  // everyone not carrying something goes to eat now; people carrying finish first and then come
  if(S.phase==='eat') for(const id in DINE_SEAT){ const n=NPC[id]; if(n.meal===S.id||n.carry||!n.g.visible||n.lead||now<n.talk) continue; mealSend(n,S); }
  // a guest who sits down during the meal gets a bowl and a word from the cook
  if(ME.seat>=0&&SEATS[ME.seat].kind==='dine'&&(S.phase==='eat'||S.phase==='serve')&&MEALRUN.bowl!==S.id){ MEALRUN.bowl=S.id; npcSay('huo',npcLine('huo.bowl')); }
  // table talk now and then
  if(S.phase==='eat'&&Math.hypot(ME.x-DINE.x,ME.z-DINE.z)<6&&now>MEALRUN.chatAt){ MEALRUN.chatAt=now+22000+Math.random()*12000; const ids=Object.keys(DINE_SEAT).filter(id=>NPC[id].seated);
    if(ids.length){ const id=ids[(MEALRUN.chatI++)%ids.length]; npcSay(id,npcLine('mchat.'+id)); } } }
ZL_ANIM.push(dt=>mealTick(dt||.016));
const WCMUSIC=(()=>{ let ac=null, out=null, t0=0, nextAt=0, vol=0, step=0;
  const inside=()=>VIEW.mode==='walk'&&((ME.x>36.6&&ME.x<41.8&&ME.z>20.97&&ME.z<23.6)||(ME.x>41.9&&ME.x<46.6&&ME.z>15.6&&ME.z<23.6));
  const inBathRoom=()=>ME.x>41.9&&ME.x<46.6&&ME.z>15.6&&ME.z<23.6; let water=null;
  function start(){ const A=window.AudioContext||window.webkitAudioContext; if(!A) return; ac=new A(); out=ac.createGain(); out.gain.value=0;
    const rev=ac.createConvolver(), len=ac.sampleRate*3.2, buf=ac.createBuffer(2,len,ac.sampleRate); for(let c=0;c<2;c++){ const d=buf.getChannelData(c); for(let i=0;i<len;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.6); } rev.buffer=buf;
    const dry=ac.createGain(); dry.gain.value=.55; const wet=ac.createGain(); wet.gain.value=.6; out.connect(dry).connect(ac.destination); out.connect(rev).connect(wet).connect(ac.destination);
    // a soft run of water: filtered noise, heard only in the bathroom
    { const nb=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate), d=nb.getChannelData(0); let b1=0; for(let i=0;i<d.length;i++){ b1=.97*b1+.03*(Math.random()*2-1); d[i]=b1*3; }
      const src=ac.createBufferSource(); src.buffer=nb; src.loop=true; const bp=ac.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=900; bp.Q.value=.6; water=ac.createGain(); water.gain.value=0; src.connect(bp).connect(water).connect(ac.destination); src.start(); }
    const resume=()=>{ if(ac.state==='suspended') ac.resume(); }; addEventListener('pointerdown',resume); addEventListener('keydown',resume); resume(); }
  const hz=m=>440*Math.pow(2,(m-69)/12);
  // D major pentatonic, slow: a chord every eight seconds, two or three soft piano notes between
  const CH=[[50,57,62,66],[47,54,59,62],[43,50,55,59],[45,52,57,61]], MEL=[74,76,78,81,83,86];
  function pad(t,notes,dur){ for(const n of notes) for(const det of [-4,4]){ const o=ac.createOscillator(), g=ac.createGain(), f=ac.createBiquadFilter(); o.type='triangle'; o.frequency.value=hz(n); o.detune.value=det; f.type='lowpass'; f.frequency.value=900;
      g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.022,t+2.4); g.gain.setValueAtTime(.022,t+dur-2.6); g.gain.linearRampToValueAtTime(0,t+dur+.4); o.connect(f).connect(g).connect(out); o.start(t); o.stop(t+dur+.5); } }
  function bell(t,n){ for(const [mul,a] of [[1,.07],[2,.018],[3,.008]]){ const o=ac.createOscillator(), g=ac.createGain(); o.type='sine'; o.frequency.value=hz(n)*mul; g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(a,t+.012); g.gain.exponentialRampToValueAtTime(.0001,t+3.2/mul); o.connect(g).connect(out); o.start(t); o.stop(t+3.4); } }
  function tick(dt){ const want=inside()?.9:0; if(want&&!ac) start(); if(!ac) return; vol+=(want-vol)*Math.min(1,dt*.8); out.gain.value=vol*.6; if(water) water.gain.value+=((inBathRoom()?.05:0)-water.gain.value)*Math.min(1,dt*.8);
    if(vol<.02) return; const t=ac.currentTime; if(t<nextAt-.5) return; const at=Math.max(t+.05,nextAt); const ch=CH[step%CH.length]; pad(at,ch,8.4);
    for(let i=0;i<2+(step%2);i++) bell(at+1.2+i*2.3+Math.random()*.6,MEL[(step*3+i*2+(Math.random()*2|0))%MEL.length]);
    if(step%2===0) bell(at+.1,ch[0]+12); step++; nextAt=at+8; }
  return {tick}; })();
ZL_ANIM.push(dt=>WCMUSIC.tick(dt||.016));
ZL_ANIM.push(dt=>{ dt=dt||.016; const w=performance.now()/1000, k=Math.min(1,dt*6), B0=BATH; if(!B0.door) return;
  // the glass door slides open as you come near (or when clicked); the sauna door swings
  const D=B0.door, near=Math.abs(ME.x-D.x)<.9&&Math.abs(ME.z-D.zc)<.8; D.g.position.z+=((D.z0+((D.open||near)?.88:0))-D.g.position.z)*k;
  const S5=B0.sdoor, sNear=Math.abs(ME.z-S5.z)<.8&&ME.x>S5.x0-.1&&ME.x<S5.x1+.1, npcLock=Object.values(NPC).some(n=>n.inSauna);
  S5.g.rotation.y+=((!S5.locked&&!npcLock&&(S5.open||sNear)?1.4:0)-S5.g.rotation.y)*k;
  // the spout: the sheet streams, foam pulses, rings spread; the surface shimmers, the mist drifts, the tray bobs
  const P=B0.pour; P.tex.offset.y=(P.tex.offset.y+dt*1.6)%1; P.foam.scale.setScalar(1+Math.sin(w*9)*.12); P.rip.forEach((r,i)=>{ const ph=(w*.6+i/4)%1; r.scale.setScalar(1+ph*7); r.material.opacity=(1-ph)*.45; });
  B0.water.material.opacity=.58+Math.sin(w*2)*.03; B0.mist.position.y=.65+Math.sin(w*.7)*.03; B0.mist.rotation.z=w*.03; B0.mist.material.opacity=.17+Math.sin(w*.5)*.05;
  B0.tray.position.y=.56+Math.sin(w*1.1)*.012; B0.tray.rotation.x=Math.sin(w*.9)*.025; B0.tray.rotation.z=Math.cos(w*.7)*.02;
  // soft light that follows the day: the hidden coves, the mirror's ring, the plinth and tub glows come up after dark
  const nf=1-Math.max(0,Math.min(1,SKY_DAY)), lvl=.45+.55*nf;
  if(Math.abs((B0.lvl||0)-lvl)>.01){ B0.lvl=lvl; for(const m of B0.glows){ m.userData.o0=m.userData.o0??m.opacity; m.opacity=m.userData.o0*lvl; } for(const [l,b] of B0.lights) l.intensity=b*(.65+.35*nf);
    if(B0.toe) B0.toe.emissiveIntensity=.7*lvl; if(B0.rim) B0.rim.emissiveIntensity=.45*lvl; }
  // light off the water
  const Cs=B0.caust; if(Cs){ if(!Cs.drawn){ Cs.drawn=true; const g=Cs.cv.getContext('2d'), N=256, im=g.createImageData(N,N), d=im.data;
      for(let j=0;j<N;j++) for(let i=0;i<N;i++){ const x=i/N*Math.PI*2, y=j/N*Math.PI*2; let v=0; for(let k=0;k<3;k++){ const a=Math.sin(x*(2+k)+Math.sin(y*(3-k)+k*1.7)*1.3)+Math.sin(y*(2+k)+Math.sin(x*(1+k)+k)*1.4); v+=Math.pow(Math.max(0,1-Math.abs(a)*1.6),3); }
        const c=Math.min(255,v*150), o=(j*N+i)*4; d[o]=d[o+1]=d[o+2]=c; d[o+3]=255; } g.putImageData(im,0,0); Cs.cT.needsUpdate=true; }
    Cs.cT.offset.set(Math.sin(w*.17)*.08+w*.006,Math.cos(w*.13)*.08-w*.009); Cs.cM.opacity=.07+.06*nf+Math.sin(w*.6)*.012; }
  // the sauna: bolted from inside (or a member of the household in it) → the lamps flood the room with warm amber light
  //  and the heat climbs to about 55 °C in two minutes; a warm cast comes over your own view as it gets hot
  const Sa=B0.sauna; if(Sa){ const meIn=ME.x>Sa.x0&&ME.x<Sa.x1&&ME.z>Sa.z0&&ME.z<Sa.z1; if(S5.locked&&!meIn&&Math.hypot(ME.x-(S5.x0+S5.x1)/2,ME.z-S5.z)>1.2) S5.locked=false;
    const on=(S5.locked&&meIn)||npcLock; Sa.on=on;
    Sa.T+=((on?55:28)-Sa.T)*Math.min(1,dt/45); const h=Math.max(0,(Sa.T-28)/27); Sa.k+=((on?1:0)-Sa.k)*Math.min(1,dt/6);
    Sa.rl.intensity=Sa.k*2.6; Sa.rl2.intensity=Sa.k*1.2; if(Sa.lampM){ Sa.lampM.emissive.setHex(Sa.k>.05?0xffa83c:0xffd9a8); Sa.lampM.emissiveIntensity=.9+Sa.k*2.4; } S5.slitM.emissiveIntensity=Sa.k*1.6;
    if(!Sa.tint){ Sa.tint=document.createElement('div'); Sa.tint.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:5;background:radial-gradient(ellipse at center,rgba(255,176,70,.55),rgba(255,140,30,.8));mix-blend-mode:soft-light;opacity:0;transition:opacity .6s'; document.body.append(Sa.tint); }
    const tw=meIn?Sa.k*(.35+.55*h):0; if(Math.abs((Sa.tw||0)-tw)>.01){ Sa.tw=tw; Sa.tint.style.opacity=tw.toFixed(2); }
    const Th=B0.therm, tv=Math.round(Sa.T); if(Th&&tv!==Th.last){ Th.last=tv; const g=Th.cv.getContext('2d'); g.fillStyle='#efe6d2'; g.fillRect(0,0,128,200); g.strokeStyle='#6a5038'; g.lineWidth=6; g.strokeRect(3,3,122,194);
      g.fillStyle='#d9cfbd'; g.fillRect(56,22,16,126); g.fillStyle='#b3261e'; const hh=Math.max(4,Math.min(126,(tv-20)/60*126)); g.fillRect(56,148-hh,16,hh); g.beginPath(); g.arc(64,160,17,0,7); g.fill();
      g.fillStyle='#2a2018'; g.font='700 30px "Noto Serif TC",serif'; g.textAlign='center'; g.fillText(tv+'°',64,196-4); Th.tT.needsUpdate=true; }
    // a small note while you are in: the heat and how long; once at twelve minutes, a reminder to come out
    if(meIn){ if(!Sa.since){ Sa.since=performance.now(); Sa.reminded=false; } const sec=(performance.now()-Sa.since)/1000;
      if(!Sa.hud){ Sa.hud=document.createElement('div'); Sa.hud.style.cssText='position:fixed;right:14px;bottom:120px;padding:6px 12px;background:#2a1a12e0;color:#f6e3cc;font:14px "Noto Serif TC",serif;border-radius:3px;z-index:28;pointer-events:none;border-left:3px solid #c0442a'; document.body.append(Sa.hud); }
      const tx=NT('sauna.hud')+'　'+Math.round(Sa.T)+' °C　'+Math.floor(sec/60)+':'+String(Math.floor(sec%60)).padStart(2,'0'); if(Sa.hud.textContent!==tx) Sa.hud.textContent=tx; Sa.hud.style.display='block';
      if(sec>720&&!Sa.reminded){ Sa.reminded=true; toast(NT('sauna.remind'),7000); } }
    else { Sa.since=0; if(Sa.hud) Sa.hud.style.display='none'; } }
  // the plate by the noren
  const Sg=B0.sign; if(Sg&&(Sg.k===null||(Sg.t=(Sg.t||0)+dt)>1)){ Sg.t=0; const k=bathSlot(dayMin()); if(k!==Sg.k){ Sg.k=k; const g=Sg.cv.getContext('2d'); g.fillStyle='#d8bf94'; g.fillRect(0,0,96,256); g.strokeStyle='#6a5038'; g.lineWidth=5; g.strokeRect(4,4,88,248);
      const t=k?NT('bath.sign',k==='f'?0:1):NT('bath.sign0'); g.fillStyle=k==='f'?'#8a2a24':k==='m'?'#24364f':'#3a2a1e'; g.font='700 64px "Noto Serif TC",serif'; g.textAlign='center'; g.textBaseline='middle';
      const ch=[...t]; ch.forEach((c,i)=>g.fillText(c,48,128+(i-(ch.length-1)/2)*78)); Sg.sT.needsUpdate=true; } }
  const inBath=ME.seat>=0&&B0.seats.includes(ME.seat), base=inBath?.3:.17, C0=B0.tubC;
  B0.steam.forEach((S,i)=>{ const ph=(w*.14+S.ph)%1; if(S.spout) S.s.position.set(P.x+Math.sin(i*2.1+w*.6)*.1,.6+ph*1.0,P.z+Math.cos(i*1.7+w*.5)*.1); else S.s.position.set(C0.x+S.x*2*C0.sx+Math.sin(i*2.1+w*.2)*.15,.6+ph*1.5,C0.z+S.z*2*C0.sz+Math.cos(i*1.7+w*.15)*.15);
    S.s.material.opacity=(1-ph)*Math.min(1,ph*5)*base; S.s.scale.setScalar((S.spout?.25:.4)+ph*.8); });
  // the rain shower and the fog it makes
  const sh=B0.shower; for(const R of sh.rain){ R.d.visible=sh.on; if(sh.on){ const ph=(w*2.2+R.ph)%1; R.d.position.set(R.x,2.85-ph*2.7,R.z); } }
  sh.fog.forEach((F,i)=>{ const ph=(w*.2+F.ph)%1; F.s.position.set(sh.x+Math.sin(i*2+w*.3)*.3,.15+ph*.6,sh.z+Math.cos(i*1.6+w*.25)*.3); F.s.material.opacity=sh.on?(1-ph)*.18*Math.min(1,ph*4):0; F.s.scale.setScalar(.5+ph*.6); });
  // the vanity mirror (on the changing room's front wall) reflects while you stand in the changing room
  const Mi=B0.mirror; if(Mi&&!renderer.xr.isPresenting&&VIEW.mode==='walk'&&ME.x>41.9&&ME.x<43.6&&ME.z>Mi.at&&ME.z<18.9&&Math.abs(ME.x-Mi.cx)<2.4){ Mi.t=(Mi.t||0)+dt; if(Mi.t>.05){ Mi.t=0;
    camera.updateMatrixWorld(); const Pp=new THREE.Vector3().setFromMatrixPosition(camera.matrixWorld), Dv=new THREE.Vector3(0,0,-1).transformDirection(camera.matrixWorld), U=new THREE.Vector3(0,1,0).transformDirection(camera.matrixWorld);
    Pp.z=2*Mi.at-Pp.z; Dv.z=-Dv.z; U.z=-U.z; const c=Mi.cam; c.fov=62; c.aspect=1.6; c.near=.05; c.far=30; c.position.copy(Pp); c.up.copy(U); c.lookAt(Pp.clone().add(Dv)); c.updateProjectionMatrix(); c.updateMatrixWorld();
    Mi.mat.uniforms.tm.value.set(.5,0,0,.5, 0,.5,0,.5, 0,0,.5,.5, 0,0,0,1).multiply(c.projectionMatrix).multiply(c.matrixWorldInverse);
    const av=ME.av, avVis=av&&av.g.visible; if(av&&!avVis){ av.g.position.set(ME.x,floorY(ME.x,ME.z),ME.z); av.g.rotation.y=ME.yaw; av.g.visible=true; if(av.tag) av.tag.visible=false; }
    const clip=renderer.clippingPlanes, prev=renderer.getRenderTarget(); Mi.mesh.visible=false; renderer.clippingPlanes=Mi.clip; renderer.setRenderTarget(Mi.rt); renderer.render(scene,c); renderer.setRenderTarget(prev); renderer.clippingPlanes=clip; Mi.mesh.visible=true;
    if(av&&!avVis) av.g.visible=false; } } });
{ const smk=[]; const sm=new THREE.SpriteMaterial({color:0xe8e4dc,transparent:true,opacity:0,depthWrite:false,map:SOFT_TEX});
  for(const I of WC.incense) for(let k=0;k<4;k++){ const s=new THREE.Sprite(sm.clone()); s.scale.set(.05,.05,1); scene.add(s); smk.push({s,I,ph:k/4}); NPC_DYN.push(s); }
  ZL_ANIM.push(dt=>{ dt=dt||.016; const w=performance.now()/1000, k=Math.min(1,dt*6);
    const sitting=si=>si>=0&&(ME.seat===si||occupied(si));
    if(WC.lastSeat!==ME.seat){ const was=WC.lastSeat; WC.lastSeat=ME.seat; if(was>=0&&SEATS[was]&&SEATS[was].kind==='wc') toast(NT('act.flush')); }
    // the urinal's stall: standing still at it shuts the door; turning to go opens it again
    const still=(!ME.path||!ME.path.length)&&!['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].some(c=>keys.has(c));
    for(const D of WC.doors){ if(D.uri){ const inS=Math.abs(ME.x-D.uri)<.5&&ME.z>22.55&&ME.z<23.6; D.still=inS&&still?(D.still||0)+dt:0; }
      const busy=sitting(D.si)||(D.still||0)>.6; if(D.ind){ D.busy=busy; } const want=(D.open&&!busy)?-D.side*1.3:0; D.pv.rotation.y+=(want-D.pv.rotation.y)*k; if(D.ind){ const red=D.busy||!D.open; D.ind.color.setHex(red?0xb8322f:0x2f8a4a); D.ind.emissive.setHex(red?0x8a1a14:0x1a6a30); } }
    for(const S3 of WC.slides){ const want=S3.z0+.88*S3.open; S3.g.position.z+=(want-S3.g.position.z)*k; }
    // the mirror reflects only while you stand near it: the scene drawn again from the far side of the glass
    const Mi=WC.mirror; if(Mi&&!renderer.xr.isPresenting&&VIEW.mode==='walk'&&Math.hypot(ME.x-39.2,ME.z-Mi.z)<3.6){ Mi.t=(Mi.t||0)+dt; if(Mi.t>.05){ Mi.t=0;
      camera.updateMatrixWorld(); const P=new THREE.Vector3().setFromMatrixPosition(camera.matrixWorld), Dv=new THREE.Vector3(0,0,-1).transformDirection(camera.matrixWorld), U=new THREE.Vector3(0,1,0).transformDirection(camera.matrixWorld);
      P.z=2*Mi.z-P.z; Dv.z=-Dv.z; U.z=-U.z; const c=Mi.cam; c.fov=60; c.aspect=1; c.near=.05; c.far=40; c.position.copy(P); c.up.copy(U); c.lookAt(P.clone().add(Dv)); c.updateProjectionMatrix(); c.updateMatrixWorld();
      Mi.mat.uniforms.tm.value.set(.5,0,0,.5, 0,.5,0,.5, 0,0,.5,.5, 0,0,0,1).multiply(c.projectionMatrix).multiply(c.matrixWorldInverse);
      const av=ME.av, avVis=av&&av.g.visible; if(av&&!avVis){ av.g.position.set(ME.x,floorY(ME.x,ME.z),ME.z); av.g.rotation.y=ME.yaw; av.g.visible=true; if(av.tag) av.tag.visible=false; }
      const clip=renderer.clippingPlanes, prev=renderer.getRenderTarget(); Mi.mesh.visible=false; renderer.clippingPlanes=Mi.clip; renderer.setRenderTarget(Mi.rt); renderer.render(scene,c); renderer.setRenderTarget(prev); renderer.clippingPlanes=clip; Mi.mesh.visible=true;
      if(av&&!avVis) av.g.visible=false; } }
    for(const S2 of WC.seats){ const up=S2.open||sitting(S2.si); S2.lid.rotation.x+=((up?1.45:0)-S2.lid.rotation.x)*k; S2.led.emissiveIntensity=up?1.2:0; }
    const sp=WC.spout; if(sp.st){ sp.st.visible=sp.on; sp.rip.forEach((r,i)=>{ const ph=(w*.8+i/3)%1; r.scale.setScalar(1+ph*4); r.material.opacity=sp.on?(1-ph)*.6:0; }); }
    for(const P of smk){ const ph=(w*.25+P.ph)%1; P.s.position.set(P.I.x+Math.sin(w*1.3+P.ph*6)*.02*ph,P.I.y+ph*.45,P.I.z+Math.cos(w+P.ph*5)*.02*ph); P.s.material.opacity=(1-ph)*.25*Math.min(1,ph*4); P.s.scale.setScalar(.03+ph*.12); } }); }
window.__kitchenAct=u=>{ if(u.type==='kgas'){ const G=KGAS[u.i||0]; G.on=!G.on; toast(NT('act.gas',G.on?0:1)); return true; }
  if(u.type==='ktap'){ KTAP.on=!KTAP.on; toast(NT('act.tap',KTAP.on?0:1)); return true; }
  if(u.type==='kpantry'){ KPANTRY.open=!KPANTRY.open; return true; }
  if(u.type==='kfire'){ KFIRE.on=!KFIRE.on; toast(NT('act.fire',KFIRE.on?0:1)); return true; }
  if(u.type==='knood'){ KNOOD.on=!KNOOD.on; toast(NT('act.noodle',KNOOD.on?0:1)); return true; }
  if(u.type==='kbasin'){ KBASIN.on=!KBASIN.on; toast(NT('act.basin',KBASIN.on?0:1)); return true; }
  if(u.type==='wcdoor'){ const D=WC.doors[u.i]; D.open=!D.open; toast(NT('act.door',D.open?0:1)); return true; }
  if(u.type==='wcslide'){ const S3=WC.slides[u.i]; S3.open=S3.open<.99?1:0; toast(NT('act.slide',S3.open?0:1)); return true; }
  if(u.type==='wcseat'){ const S2=WC.seats[u.i]; S2.open=!S2.open; toast(NT('act.seat',S2.open?0:1)); return true; }
  if(u.type==='bathshower'){ BATH.shower.on=!BATH.shower.on; toast(NT('act.shower',BATH.shower.on?0:1)); return true; }
  if(u.type==='bathwash'){ BATH.wash=!BATH.wash; toast(NT('act.wash',BATH.wash?0:1)); return true; }
  if(u.type==='bathdoor'){ BATH.door.open=!BATH.door.open; toast(NT('act.bdoor',BATH.door.open?0:1)); return true; }
  if(u.type==='bathsdoor'){ const D=BATH.sdoor; if(Object.values(NPC).some(n=>n.inSauna)){ toast(NT('sauna.busy')); return true; } if(D.locked){ toast(NT('sauna.lock',0)); return true; } D.open=!D.open; toast(NT('act.sdoor',D.open?0:1)); return true; }
  if(u.type==='bathlatch'){ const D=BATH.sdoor, Sa=BATH.sauna, meIn=ME.x>Sa.x0&&ME.x<Sa.x1&&ME.z>Sa.z0&&ME.z<Sa.z1; if(!meIn){ toast(NT('sauna.lock',1)); return true; } D.locked=!D.locked; if(D.locked) D.open=false; toast(NT('sauna.bolt',D.locked?0:1)); return true; }
  if(u.type==='wcuri'){ goTo(u.x,23.6-.62,{faceTo:{x:u.x,z:24},after:()=>setTimeout(()=>toast(NT('act.urinal')),3500)}); return true; }
  if(u.type==='wcspout'){ WC.spout.on=!WC.spout.on; toast(NT('act.spout',WC.spout.on?0:1)); return true; } return false; };
// the calendar page for today in Taipei: 民國 year and 干支, the lunar month and day, the big date, the weekday
function calPage(){ const C=DINE.cal; if(!C) return; const T=taipeiNow(); if(C.day===T.day) return; C.day=T.day;
  const [Y,Mo,D]=T.day.split('-').map(Number), g=C.c.getContext('2d'), W=300, H=420, _sc=C.c.width/300; g.setTransform(_sc,0,0,_sc,0,0); const wk='日一二三四五六'[T.dow%7], mon=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][Mo-1];
  let lm='', ld='', yn=''; try{ const P=new Intl.DateTimeFormat('zh-TW-u-ca-chinese',{timeZone:'Asia/Taipei',year:'numeric',month:'long',day:'numeric'}).formatToParts(new Date(Date.now()+MEAL_SHIFT*60000));
    for(const p of P){ if(p.type==='month') lm=p.value; if(p.type==='day') ld=p.value; if(p.type==='yearName') yn=p.value; } }catch(e){}
  const cn='〇一二三四五六七八九十', dn=+ld; const lday=!dn?'':dn<=10?'初'+(dn===10?'十':cn[dn]):dn<20?'十'+cn[dn-10]:dn===20?'二十':dn<30?'廿'+cn[dn-20]:'三十';
  g.fillStyle='#fbf9f3'; g.fillRect(0,0,W,H); const blue='#1d4f9c', redc='#c0352c';
  g.fillStyle='#333'; g.font='600 15px "Noto Serif TC",serif'; g.textAlign='left'; g.textBaseline='top'; g.fillText((Y-1911)+'年',14,14); g.font='13px "Noto Serif TC",serif'; if(yn) g.fillText(yn+'年',14,34);
  g.textAlign='right'; g.fillStyle=blue; g.font='700 18px serif'; g.fillText(String(Y),W-14,14); g.strokeStyle=blue; g.lineWidth=2; g.strokeRect(W-58,38,44,32); g.font='700 20px serif'; g.textAlign='center'; g.fillText(Mo+'月',W-36,44); g.font='600 12px serif'; g.fillText(mon,W-36,74);
  g.strokeStyle=redc; g.lineWidth=2; g.strokeRect(12,64,36,150); g.fillStyle=redc; g.fillRect(12,64,36,22); g.fillStyle='#fff'; g.font='700 13px "Noto Serif TC",serif'; g.fillText('農',30,68);
  g.fillStyle=blue; g.font='700 22px "Noto Serif TC",serif'; [...(lm+lday)].forEach((ch,i)=>g.fillText(ch,30,90+i*25));
  g.fillStyle=blue; g.font='900 170px "Arial Narrow","Helvetica Neue",Arial,sans-serif'; g.textBaseline='middle'; g.fillText(String(D),W/2+12,150); g.textBaseline='top';
  g.fillStyle=blue; g.fillRect(12,240,W-24,36); g.fillStyle='#fff'; g.font='700 24px "Noto Serif TC",serif'; g.fillText('星期'+wk,W/2,244);
  g.strokeStyle=redc; g.lineWidth=2.5; g.strokeRect(14,292,W-28,114); g.fillStyle=redc; g.font='700 30px "Noto Serif TC",serif'; g.fillText(NT('cal.foot'),W/2,312); g.font='600 18px "Noto Serif TC",serif'; g.fillText(NT('cal.foot',1),W/2,360);
  C.t.needsUpdate=true; }
function dineText(){ const S=mealState(), T=S.T, nm=nextMeal(); let h=`<p style="line-height:2">${esc(NT('dine.intro'))}</p>`;
  h+=`<p style="line-height:2">${esc(S.phase&&S.phase!=='cook'&&S.phase!=='clear'?NT('dine.now').replace('{餐}',NT('meal.'+S.k)):NT('dine.next').replace('{餐}',NT('meal.'+nm.k)).replace('{時間}',hhmm(nm.at)))}</p>`;
  h+=`<p style="line-height:2"><b>${esc(NT('dine.today'))}</b></p>`+['b','l','d','n'].map(k=>`<p style="line-height:1.9;margin:.2em 0">${esc(NT('meal.'+k))}　${hhmm(MEALS.find(m=>m.k===k).at)}<br>${esc(menuOf(T.dow,k))}</p>`).join('');
  showText(NT('dine.title'),h); }

// {% endraw %}
