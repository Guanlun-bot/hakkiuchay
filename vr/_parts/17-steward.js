// {% raw %}
/* ================= 許總管：管家面板（X 鍵）、帶路、全宅導覽、集合點名、宅務、作息、待客、電影院、提醒 =================
   X anywhere opens the steward's panel and brings 許總管 to you. The places he can take you to are in PLACES (names and
   one-line introductions in the back office: pl.<id>); guests are only taken to the door of the servants' rooms, and the
   正廳 and the two 大房 are not offered to them nor on the tour (they are not shut). The roll call, a film put on for a set
   time, today's changed meal and a later or earlier night are shared by everyone in the house (relay {k:'house'}); the
   rest (reminders, the reading timer, notes) are kept in this browser. */
const HT2=(k,i=0)=>String(NT(k,i)||'');
const HF=(k,fill,i)=>{ let t=i==null?npcLine(k,Object.assign(titleFill(),fill||{})):HT2(k,i); if(i!=null&&fill) t=t.replace(/\{(.+?)\}/g,(m,q)=>fill[q]!=null?fill[q]:m); return t.replace(/\{稱呼\}/g,titleFill().稱呼); };
const PLACES=[
  // id, group, where, {door: room rect for guests, boss: master only, notour}
  ['gate',1,P(50.2,9.8)],['well',1,P(44,6.6)],['dine',1,P(39.2,-.6)],['kit',1,P(44,1.2)],['bath',1,P(43.2,18.2)],['wc',1,P(39,21.6)],
  ['r22',1,P(34.4,-1.2),{door:[31.56,36.62,-4.3,4.3],notour:1}],['r26',1,P(34.4,20.8),{door:[31.56,36.62,15.3,23.9],notour:1}],
  ['gt',2,P(29.4,9.8)],['gramo',2,P(26.9,13.4)],['kids',2,P(29.4,-.6),{door:[27.24,31.56,-4.3,4.49],notour:1}],
  ['court2',3,P(20.4,9.8)],['garden',3,P(16.2,12.6)],['cls',3,P(23,19.6)],['cine',3,P(14.56,20.5)],['nt',3,P(9.8,9.8)],['prep',3,P(9.8,-.6)],['store',3,P(10.4,20.4),{notour:1}],
  ['court3',4,P(.4,9.8)],['lib',4,P(0,0)],['mid3',4,P(0,19.6)],['tea',4,P(-5,19.6)],['wa',4,P(5,19.6)],
  ['zt',4,P(-9.8,9.8),{boss:1,notour:1}],['dfE',4,P(-11,0),{boss:1,notour:1}],['dfW',4,P(-11,19.6),{boss:1,notour:1}],
  ['road',5,P(70,9.8),{notour:1}],['dock',5,P(89.5,9.8),{notour:1}],
].map(([id,g,p,o])=>Object.assign({id,g,x:p.x,z:p.z},o||{}));
const PL=Object.fromEntries(PLACES.map(p=>[p.id,p]));
const TOUR=['gate','well','dine','kit','bath','gt','gramo','court2','garden','cls','cine','nt','prep','court3','lib','mid3','tea','wa'];
const plName=id=>HT2('pl.'+id,0)||id, plIntro=id=>HT2('pl.'+id,1);
// a walkable point near a place
function plSpot(p){ for(let r=0;r<3;r+=.2) for(let a=0;a<Math.PI*2;a+=Math.PI/8){ const x=p.x+Math.cos(a)*r, z=p.z+Math.sin(a)*r; if(walkable(x,z)) return {x,z}; } return {x:p.x,z:p.z}; }
// 帶路 to one place (or the next on the tour)
function leadTo(id,tour){ const p=PL[id]; if(!p) return; const n=NPC.xu; if(n.look){ toast(HT2('h.bath'),3000); return; }
  leaveSpot(n); n.errand=false; n.butler=0; n.follow=false; n.task=null; n.next=null; n.then=null; n.carry=null;
  const s=plSpot(p), guestDoor=p.door&&!isBoss();
  npcSay('xu',tour&&tour.i>0?HF('h.tour.next',{地:plName(id)}):HF('h.lead',{地:plName(id)}));
  leadStart({x:s.x,z:s.z,id,name:plName(id),door:guestDoor?p.door:null},tour||null); }
function tourStart(){ closePanel(); npcSay('xu',HF('h.tour.start')); setTimeout(()=>leadTo(TOUR[0],{i:0}),2600); }
function tourNext(n){ const T=n.lead&&n.lead.tour; if(!T) return; T.i++; n.lead=null; if(T.i>=TOUR.length){ npcSay('xu',HF('h.tour.end')); n.act='idle'; n.busyUntil=Date.now()+8000; return; } leadTo(TOUR[T.i],T); }

/* ---- the shared part: one state, versioned, handed to whoever comes in ---- */
const HOUSE={v:0,id:'',show:null,sched:{sl:0,slU:0,wk:0,wkU:0},movr:{},gather:null,orders:[],gmeal:null,gramo:null};
const DAY0={wake:DAY.wake,sleep:DAY.sleep};
const hSend=(d,to)=>{ try{ return !!(NET.bcast&&NET.bcast(Object.assign({k:'house'},d),to)); }catch{ return false; } };
const hPack=()=>({o:'st',v:HOUSE.v,id:HOUSE.id,show:HOUSE.show,sched:HOUSE.sched,movr:HOUSE.movr,gather:HOUSE.gather,orders:HOUSE.orders,gmeal:HOUSE.gmeal,gramo:HOUSE.gramo});
function hTake(d){ const prevG=HOUSE.gather&&HOUSE.gather.t0, prevS=HOUSE.show&&HOUSE.show.at;
  Object.assign(HOUSE,{v:d.v|0,id:d.id||'',show:d.show||null,sched:Object.assign({sl:0,slU:0,wk:0,wkU:0},d.sched||{}),movr:d.movr||{},gather:d.gather||null,orders:Array.isArray(d.orders)?d.orders.slice(0,8):[],gmeal:d.gmeal||null,gramo:d.gramo||null});
  hApplySched(); if((HOUSE.gather&&HOUSE.gather.t0)!==prevG){ HOUSE.gather?gatherRun(HOUSE.gather):gatherEnd(); } if((HOUSE.show&&HOUSE.show.at)!==prevS&&!HOUSE.show) showEnd(); if(bIsOpen()&&!(document.activeElement&&document.activeElement.closest&&document.activeElement.closest('#bpane'))) bRender(); }
function hAct(ch){ const st=Object.assign(hPack(),ch,{v:HOUSE.v+1,id:MY_PID}); hTake(st); hSend(st); }
const hRank=()=>{ const ids=[...((NET.peers&&NET.peers.keys&&NET.peers.keys())||[])].concat(MY_PID).sort(); return Math.max(0,ids.indexOf(MY_PID)); };
{ const snapFor=new Map();
  window.__houseHello=()=>hSend({o:'hi'});
  window.__houseRecv=(d,from)=>{ if(!d||d.k!=='house') return;
    if(d.o==='hi'){ if(!HOUSE.v) return; const ids=[...((NET.peers&&NET.peers.keys&&NET.peers.keys())||[])].filter(i=>i!==from).concat(MY_PID).sort(), rank=Math.max(0,ids.indexOf(MY_PID));
      clearTimeout(snapFor.get(from)); snapFor.set(from,setTimeout(()=>{ snapFor.delete(from); hSend(Object.assign(hPack(),{for:from}),from); },200+rank*400+Math.random()*120)); return; }
    if(d.o==='st'){ if(d.for&&snapFor.has(d.for)){ clearTimeout(snapFor.get(d.for)); snapFor.delete(d.for); } if(d.for&&d.for!==MY_PID) return;
      if((d.v|0)>HOUSE.v||((d.v|0)===HOUSE.v&&String(d.id||'')>HOUSE.id)) hTake(d); } }; }

/* ---- 作息: a later or earlier night, a later morning, for one night only ---- */
function hApplySched(){ const s=HOUSE.sched, now=Date.now(); DAY.sleep=DAY0.sleep+(now<s.slU?s.sl:0); DAY.wake=DAY0.wake+(now<s.wkU?s.wk:0); }
setInterval(hApplySched,5000);
// until the next getting-up time after the coming night
function untilMorning(){ const m=taipeiNow().min, w=DAY0.wake+120; const left=(m<w?w-m:1440-m+w); return Date.now()+left*60000; }

/* ---- 飲食: today's meal changed by the master ---- */
{ const base=menuOf; menuOf=(dow,k)=>{ const T=taipeiNow(), o=HOUSE.movr[T.day+k]; return o&&T.dow===dow?o:base(dow,k); }; }

/* ---- 許總管 comes to you ---- */
let bOpen=false, bTab=0, bClosedAt=0;
function xuCome(){ const n=NPC.xu; if(!n||!n.g.visible) return; if(n.look){ toast(HT2('h.bath'),3000); return; } if(n.lead) return;
  if(Math.hypot(n.x-ME.x,n.z-ME.z)<2.6&&!n.lie){ npcFace(n,ME); n.butler=Date.now(); n.errand=true; n.busyUntil=Infinity; return; }
  leaveSpot(n); n.errand=true; n.task=null; n.next=null; n.carry=null; n.butler=Date.now(); n.saidCome=false; xuGo(); }
function xuGo(){ const n=NPC.xu, t=nearMe(1.3); n.bT=t; npcGo(n,t,k=>{ npcFace(k,ME); k.act='idle'; k.busyUntil=Infinity; if(!k.saidCome){ k.saidCome=true; npcSay('xu',HF('h.come')); } }); }
setInterval(()=>{ const n=NPC.xu; if(!n||!n.butler||n.lead) return; const d=Math.hypot(n.x-ME.x,n.z-ME.z);
  if(!bOpen&&Date.now()-bClosedAt>20000){ n.butler=0; n.errand=false; n.busyUntil=0; n.act='idle'; return; }
  if(d>3.2&&(!n.bT||Math.hypot(n.bT.x-ME.x,n.bT.z-ME.z)>2.2)) xuGo(); else if(d<=3.2&&n.act!=='walk') npcFace(n,ME); },900);

/* ---- the panel ---- */
const TABS=['rep','lead','call','gather','food','house','day','guest','cine','rem'], GUEST_TABS=['rep','lead','food','day','rem'];
{ const st=document.createElement('style'); st.textContent=`.btabs{display:flex;flex-wrap:wrap;gap:4px;margin:0 0 12px}.btabs button{font:13px "Noto Serif TC",serif;padding:3px 9px;background:none;border:1px solid var(--rule,#c9bfae);color:inherit;border-radius:2px;cursor:pointer}
.btabs button.on{background:var(--ink,#2a211a);color:var(--paper,#f3ead8);border-color:var(--ink,#2a211a)}
.bp h4{font-size:14px;margin:14px 0 4px;font-weight:600}.bp p{margin:3px 0;line-height:1.8}.bp .meta{opacity:.7;font-size:13px}
.bp .bl{display:flex;flex-wrap:wrap;gap:5px;margin:4px 0 8px}.bp .bl button{font:13px "Noto Serif TC",serif;padding:4px 10px;background:var(--paper,#f3ead8);color:inherit;border:1px solid var(--rule,#8a6a48);border-radius:2px;cursor:pointer}
.bp .bl button:hover{border-color:var(--ink,#2a211a)}.bp table{border-collapse:collapse;width:100%}.bp td{padding:2px 8px 2px 0;vertical-align:top;line-height:1.7;font-size:14px}
.bp input,.bp select,.bp textarea{font:14px "Noto Serif TC",serif;padding:3px 5px;border:1px solid var(--rule,#c9bfae);background:transparent;color:inherit}.bp textarea{width:100%;box-sizing:border-box}`; document.head.append(st); }
function openButler(tab){ const boss=isBoss(), tabs=boss?TABS:GUEST_TABS; if(tab!=null){ const i=tabs.indexOf(tab); bTab=i<0?0:i; } if(bTab>=tabs.length) bTab=0;
  bOpen=true; xuCome(); closeChoices(); bRender(); }
function bRender(){ const boss=isBoss(), tabs=boss?TABS:GUEST_TABS, names=HT2('h.tabs').split(/[,，、]/), all=TABS;
  const body=openPanel(HT2('h.title'),`<div class="btabs">${tabs.map((t,i)=>`<button type="button" data-t="${i}" class="${i===bTab?'on':''}">${esc(names[all.indexOf(t)]||t)}</button>`).join('')}</div><div class="bp" id="bpane"></div>`);
  body.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{ bTab=+b.dataset.t; bRender(); });
  const pane=body.querySelector('#bpane'); try{ PANES[tabs[bTab]](pane,boss); }catch(e){ console.warn('butler',e); pane.textContent=String(e.message||e); } }
// the panel is ours while it is open under the steward's title
const bIsOpen=()=>panel.classList.contains('open')&&$('#ptitle').textContent===HT2('h.title');
setInterval(()=>{ const o=bIsOpen(); if(bOpen&&!o) bClosedAt=Date.now(); bOpen=o; },500);
addEventListener('keydown',e=>{ if(e.repeat||e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'||e.target.tagName==='SELECT'||!window.__entered) return; if(e.key.toLowerCase()!=='x') return;
  e.preventDefault(); if(bIsOpen()){ closePanel(); bOpen=false; bClosedAt=Date.now(); return; } openButler(); });
const btns=(list)=>`<div class="bl">${list.map(([l],i)=>`<button type="button" data-b="${i}">${esc(l)}</button>`).join('')}</div>`;
const wire=(el,list)=>{ el.querySelectorAll('[data-b]').forEach(b=>{ const f=list[+b.dataset.b][1]; b.onclick=e=>{ e.preventDefault(); f(); }; }); };
// one block of buttons: returns html, wired after the pane is filled
function blk(pane,title,list,note){ const d=document.createElement('div'); d.innerHTML=(title?`<h4>${esc(title)}</h4>`:'')+(note?`<p class="meta">${esc(note)}</p>`:'')+btns(list); wire(d,list); pane.append(d); return d; }
function para(pane,html){ const d=document.createElement('div'); d.innerHTML=html; pane.append(d); return d; }
const L8=k=>HT2(k).split(/[,，、]/);

/* ---- 報告 ---- */
function nState(n){ const S=L8('h.st'); if(n.lie) return S[0]; if(n.look||n.pose==='ssit') return S[1]; if(n.follow) return S[2]; if(n.lead) return S[5]; if(n.errand) return S[3]; if(n.seated||n.pose==='dsit') return S[4];
  if(n.task&&TASKS[n.task]) return n.task; const z=npcZone(n); return z?NT('zone.'+z,0):placeName(n); }
const VIS=(()=>{ let o={}; try{ o=JSON.parse(localStorage.getItem('hkVisitors')||'{}'); }catch{} return o; })();
setInterval(()=>{ if(!window.__entered||typeof others==='undefined') return; const d=taipeiNow().day; if(VIS.day!==d){ VIS.day=d; VIS.names=[]; } let ch=false;
  for(const [,o] of others){ const nm=str(o.p.n,12); if(nm&&!VIS.names.includes(nm)){ VIS.names.push(nm); ch=true; } } if(ch) try{ localStorage.setItem('hkVisitors',JSON.stringify(VIS)); }catch{} },10000);
function houseStatus(){ const out=[]; try{ let dn=0; for(const b of BLINDS) if(b.k>.5) dn++; out.push(HF('h.hs.blind',{下:dn,上:BLINDS.length-dn},0)); }catch{}
  try{ const shut=Object.keys(DOORS).filter(k=>!DOORS[k].open).length; out.push(shut?HF('h.hs.door',{關:shut},0):HT2('h.hs.door',1)); }catch{}
  try{ const s=bathSlot(taipeiNow().min), L=L8('h.hs.slot'); out.push(HF('h.hs.bath',{牌:s==='f'?L[0]:s==='m'?L[1]:L[2]},0)); }catch{}
  try{ const Sa=BATH.sauna; if(Sa&&BATH.sdoor&&BATH.sdoor.locked) out.push(HF('h.hs.sauna',{度:Math.round(Sa.T)},0)); }catch{}
  try{ const C=window.__cine; out.push(C&&C.S.p?HF('h.hs.cine',{片:C.S.ti||''},0):HT2('h.hs.cine',1)); }catch{}
  return out.filter(Boolean); }
function acctHtml(){ const lines=HT2('acct.list').split(/\n+/).map(s=>s.trim()).filter(Boolean); let sum=0;
  const rows=lines.map(l=>{ const m=/^(.*?)[\s　]+([\d,，.]+)\s*$/.exec(l); if(!m) return `<tr><td colspan="2">${esc(l)}</td></tr>`; const v=+m[2].replace(/[,，]/g,''); sum+=v||0; return `<tr><td>${esc(m[1])}</td><td style="text-align:right">${esc(m[2])}</td></tr>`; }).join('');
  return `<table>${rows}<tr><td style="border-top:1px solid var(--rule,#c9bfae)">${esc(HT2('acct.list',1)||'合計')}</td><td style="text-align:right;border-top:1px solid var(--rule,#c9bfae)">${sum.toLocaleString('en-US')}</td></tr></table>`; }
const PANES={};
PANES.rep=(pane,boss)=>{ const T=taipeiNow(), Lb=L8('h.r.labels'), d=new Date(T.day+'T12:00:00'), wd='日一二三四五六'[T.dow%7];
  let h=`<h4>${esc(Lb[0])}</h4><p>${d.getFullYear()} 年 ${d.getMonth()+1} 月 ${d.getDate()} 日　星期${wd}　${hhmm(Math.floor(T.min))}</p>`;
  try{ const w=WX&&WX.label?WX.label+(WX.temp!=null?'　'+Math.round(WX.temp)+'°C':''):''; if(w) h+=`<h4>${esc(Lb[1])}</h4><p>${esc(w)}</p>`; }catch{}
  const M=nextMeal(); h+=`<h4>${esc(Lb[2])}</h4><p>${esc(MEALN[M.k])}　${hhmm(M.at)}　${esc(menuOf(T.dow,M.k)||'')}</p>`;
  if(boss){ h+=`<h4>${esc(Lb[3])}</h4><table>`+NPCS.map(dd=>`<tr><td>${esc(npcName(dd.id))}</td><td class="meta">${esc(nState(NPC[dd.id]))}</td></tr>`).join('')+'</table>';
    h+=`<h4>${esc(Lb[4])}</h4>`+houseStatus().map(s=>`<p>${esc(s)}</p>`).join(''); }
  const on=[...(typeof others!=='undefined'?others.values():[])].map(o=>str(o.p.n,12)||'訪客'), seen=(VIS.day===T.day?VIS.names:[]).filter(n=>!on.includes(n));
  h+=`<h4>${esc(Lb[5])}</h4><p>${on.length?esc(on.join('、'))+'<span class="meta">　'+esc(HT2('h.r.online'))+'</span>':esc(HT2('h.r.none'))}</p>`+(seen.length?`<p class="meta">${esc(HT2('h.r.earlier'))}${esc(seen.join('、'))}</p>`:'');
  if(boss){ h+=`<h4>${esc(Lb[6])}</h4><p>${esc(npcName('fu'))}：${esc(HT2('lesson.'+T.dow,0))}</p><p>${esc(npcName('lai'))}：${esc(HT2('lesson.'+T.dow,1))}</p>`;
    h+=`<h4>${esc(Lb[7])}（${d.getMonth()+1} 月）</h4>`+acctHtml(); }
  para(pane,h); };

/* ---- 帶路 ---- */
PANES.lead=(pane,boss)=>{ const n=NPC.xu;
  if(n.lead) blk(pane,'',[[HT2('h.tour.btn',1),()=>{ leadEnd(true); bRender(); }]]);
  blk(pane,'',[[HT2('h.tour.btn',0),tourStart]],HT2('h.tour.note'));
  for(let g=1;g<=5;g++){ const list=PLACES.filter(p=>p.g===g&&(boss||!p.boss)); if(!list.length) continue;
    const d=para(pane,`<h4>${esc(HT2('pl.g'+g))}</h4><table>${list.map(p=>`<tr><td style="white-space:nowrap"><a href="#" data-p="${p.id}">${esc(plName(p.id))}</a></td><td class="meta">${esc(plIntro(p.id))}</td></tr>`).join('')}</table>`);
    d.querySelectorAll('[data-p]').forEach(a=>a.onclick=e=>{ e.preventDefault(); closePanel(); leadTo(a.dataset.p); }); } };

/* ---- 叫人 ---- */
function callOne(id){ const k=NPC[id]; if(!k) return; if(id==='fu'||id==='lai'){ if(!k.follow) callKid(id); return; }
  if(k.look||k.pose==='ssit'){ npcSay('xu',HF('h.call.bath',{名:npcName(id)})); return; }
  npcSay('xu',HF('h.call.go',{名:npcName(id)}));
  setTimeout(()=>doErrand(k,[{to:()=>nearMe(1.2),face:()=>ME,dur:45000,on:m=>{ sayK(m.id,'ui.o.come'); }}]),1200); }
PANES.call=(pane)=>{ para(pane,`<p class="meta">${esc(HT2('h.call.note'))}</p>`);
  const d=para(pane,'<table>'+NPCS.filter(x=>x.id!=='xu').map(x=>`<tr><td style="white-space:nowrap"><a href="#" data-c="${x.id}">${esc(npcName(x.id))}</a></td><td class="meta">${esc(nState(NPC[x.id]))}</td></tr>`).join('')+'</table>');
  d.querySelectorAll('[data-c]').forEach(a=>a.onclick=e=>{ e.preventDefault(); callOne(a.dataset.c); bRender(); });
  blk(pane,'',[[HT2('h.call.back'),()=>{ for(const x of NPCS){ const k=NPC[x.id]; if(x.id!=='xu'&&k.errand&&!k.lead&&!k.gather){ k.errand=false; k.busyUntil=0; k.prop=null; } if(k.follow&&(x.id==='fu'||x.id==='lai')) callKid(x.id); } npcSay('xu',HF('h.call.done')); bRender(); }]]); };

/* ---- 集合 ---- */
const COURTS=[39.2,19.6,0];
function gatherStart(){ const j=jinOf(ME), c=j===3?2:j===2?1:0; hAct({gather:{t0:Date.now(),c,by:myName}}); closePanel(); }
let GA=null;
function gatherRun(G){ gatherEnd(true); const cx=COURTS[G.c]||39.2, xu=NPC.xu, ids=NPCS.map(d=>d.id).filter(id=>id!=='xu');
  const present=ids.filter(id=>{ const n=NPC[id]; return n.g.visible&&!n.look&&n.pose!=='ssit'&&!n.tl; }), absent=ids.filter(id=>!present.includes(id));
  GA={G,cx,present,absent,i:-1,next:0,done:false,arrived:new Set(),start:Date.now()};
  if(xu.lead) leadEnd(false); leaveSpot(xu); xu.errand=true; xu.gather=true; xu.butler=0; xu.task=null; xu.next=null; xu.carry=null;
  npcSay('xu',HF('h.g.call')); const xs=plSpot({x:cx-.5,z:courtAxis}); npcGo(xu,xs,k=>{ npcFace(k,{x:cx+2,z:courtAxis}); k.act='idle'; k.busyUntil=Infinity; });
  present.forEach((id,i)=>{ const n=NPC[id], z=courtAxis+(i-(present.length-1)/2)*.85, s=plSpot({x:cx+1.4,z}); if(n.follow){ n.follow=false; renderKidUI(); }
    leaveSpot(n); n.errand=true; n.gather=true; n.task=null; n.next=null; n.carry=null; n.prop=null;
    setTimeout(()=>{ if(!GA||!n.gather) return; npcGo(n,s,k=>{ npcFace(k,{x:cx-3,z:k.z}); k.act='idle'; k.busyUntil=Infinity; GA&&GA.arrived.add(id); }); },300+i*250); }); }
function gatherEnd(quiet){ if(!GA) return; for(const id in NPC){ const n=NPC[id]; if(n.gather){ n.gather=false; n.errand=false; n.busyUntil=0; n.act='idle'; } } if(!quiet) npcSay('xu',HF('h.g.bye')); GA=null; }
setInterval(()=>{ if(!GA) return; const now=Date.now(), xu=NPC.xu;
  if(now-GA.start>5*60000){ if(hRank()===0&&HOUSE.gather) hAct({gather:null}); else gatherEnd(); return; }
  if(GA.done) return; if(GA.i<0){ if(GA.arrived.size>=GA.present.length||now-GA.start>70000){ GA.i=0; GA.next=now+1500; } return; }
  if(now<GA.next) return;
  if(GA.i<GA.present.length){ const id=GA.present[GA.i++]; npcSay('xu',HF('h.g.name',{名:npcName(id)})); setTimeout(()=>{ const kid=id==='fu'||id==='lai'; npcSay(id,HT2(kid?'h.g.yesK':'h.g.yes',Math.random()<.5?0:1)||'有。'); },1100); GA.next=now+2600; return; }
  GA.done=true; npcSay('xu',GA.absent.length?HF('h.g.missing',{名:GA.absent.map(npcName).join('、')}):HF('h.g.all')); },400);
PANES.gather=(pane)=>{ const G=HOUSE.gather;
  if(G){ blk(pane,'',[[HT2('h.g.btn',1),()=>{ hAct({gather:null}); bRender(); }]],HF('h.g.now',{人:G.by||''},0)); return; }
  blk(pane,'',[[HT2('h.g.btn',0),gatherStart]],HT2('h.g.note')); };

/* ---- 飲食 ---- */
const FOOD_EXTRA=[];   // the snacks and guest meals add their buttons here
PANES.food=(pane,boss)=>{ const T=taipeiNow();
  para(pane,`<h4>${esc(HT2('dine.today'))}</h4>`+MEALS.map(M=>{ const o=HOUSE.movr[T.day+M.k]; return `<p>${esc(MEALN[M.k])}　${hhmm(M.at)}<br>${esc(menuOf(T.dow,M.k)||'')}${o?'<span class="meta">　'+esc(HT2('h.f.changed'))+'</span>':''}</p>`; }).join(''));
  for(const f of FOOD_EXTRA) try{ f(pane,boss); }catch(e){ console.warn(e); }
  blk(pane,HT2('h.f.tea'),[[HT2('h.f.teaMe'),()=>{ teaFetch('chun'); closePanel(); }],[HT2('h.f.teaRoom'),()=>{ errandSay('chun'); doErrand(NPC.chun,[{to:P(10.4,-2.2),face:P(10.4,-4.5),act:'load',dur:5000},{to:()=>NP.tea,act:'unload',dur:5000,on:m=>{ if(near(m,9)) sayK('chun','h.f.teaDone'); }}]); closePanel(); }]]);
  if(!boss) return; const left=MEALS.filter(M=>M.at>T.min-10), alt=HT2('menu.alt').split(/\n+/).map(s=>s.trim()).filter(Boolean);
  if(left.length&&alt.length){ const d=para(pane,`<h4>${esc(HT2('h.f.change'))}</h4><p><select id="bfm">${left.map(M=>`<option value="${M.k}">${esc(MEALN[M.k])}</option>`).join('')}</select>　<select id="bfd">${alt.map((a,i)=>`<option value="${i}">${esc(a)}</option>`).join('')}</select></p>`);
    blk(pane,'',[[HT2('h.f.set'),()=>{ const k=d.querySelector('#bfm').value, a=alt[+d.querySelector('#bfd').value]; const mo=Object.assign({},HOUSE.movr); for(const x in mo) if(!x.startsWith(T.day)) delete mo[x]; mo[T.day+k]=a; hAct({movr:mo}); sayK('xu','h.f.ok'); bRender(); }],
      [HT2('h.f.reset'),()=>{ const mo={}; hAct({movr:mo}); bRender(); }]]); } };

/* ---- 宅務 ---- */
window.__blindAll=on=>{ try{ BLINDS.forEach((b,i)=>{ if(b.cine&&window.__cine&&window.__cine.S.p) return; const want=on?1:0; b.on=want; b.v++; b.id=MY_PID; b.at=wallNow(); b.ok=false; NET.bcast&&NET.bcast({k:'blind',o:'set',i,on:want,v:b.v,id:b.id,at:b.at}); }); }catch(e){ console.warn(e); } };
const PATROL=[P(50.2,9.8),P(39.2,9.8),P(29.4,9.8),P(20,9.8),P(9.8,9.8),P(.4,9.8),P(-3,19.9),P(10.6,21.4),P(9.8,-.6),P(39.2,9.8)];
function patrolNow(){ const n=NPC.xu; if(n.lead) leadEnd(false); n.butler=0; npcSay('xu',HF('h.h.patrol')); doErrand(n,PATROL.map(p=>({to:p,act:'idle',dur:5000}))); }
PANES.house=(pane)=>{ const say=k=>()=>{ sayK('xu',k); };
  blk(pane,HT2('h.h.blind'),[[HT2('h.h.up'),()=>{ window.__blindAll(0); say('h.h.ok')(); }],[HT2('h.h.down'),()=>{ window.__blindAll(1); say('h.h.ok')(); }]]);
  blk(pane,HT2('h.h.doors'),[[HT2('h.h.open'),()=>{ for(const k in DOORS) if(!DOORS[k].open) toggleDoor(k); say('h.h.ok')(); bRender(); }],[HT2('h.h.shut'),()=>{ for(const k in DOORS) if(DOORS[k].open&&k!=='dcine'&&k!=='dcls') toggleDoor(k); say('h.h.ok')(); bRender(); }]]);
  blk(pane,HT2('h.h.chores'),[
    [HT2('h.h.light'),()=>{ errandSay('fu'); doErrand(NPC.fu,TASKS.點燈.spots.map(p=>({to:p,act:'blind',dur:4000}))); }],
    [HT2('h.h.sweep'),()=>{ errandSay('he'); doErrand(NPC.he,[{to:()=>nearMe(1.6),act:'sweep',dur:40000}]); }],
    [HT2('h.h.sweepTea'),()=>{ errandSay('he'); doErrand(NPC.he,TASKS.茶室.spots.map(p=>({to:p,act:'sweep',dur:20000}))); }],
    [HT2('h.h.sweepLib'),()=>{ errandSay('fu'); doErrand(NPC.fu,TASKS.撣塵.spots.map(p=>({to:p,act:'sweep',dur:15000}))); }],
    [HT2('h.h.sheet'),()=>{ errandSay('li'); doErrand(NPC.li,TASKS.換床單.spots.map(p=>({to:p,act:'load',dur:9000}))); }],
    [HT2('h.h.flower'),()=>{ errandSay('shui'); doErrand(NPC.shui,[{to:NP.garden,act:'prune',dur:4000},{to:P(-4.5,21.5),prop:'flowers',act:'unload',drop:true,dur:3000},{to:P(3,1),act:'unload',dur:3000}]); }],
    [HT2('h.h.fix'),()=>{ errandSay('cai'); doErrand(NPC.cai,[{to:()=>nearMe(1.6),prop:'tools',act:'prep',dur:30000}]); }],
    [HT2('h.h.mail'),()=>{ errandSay('yu'); doErrand(NPC.yu,[{to:P(3,1),prop:'mail',act:'unload',drop:true,dur:3000},{to:NP.gate,dur:1000}]); }],
    [HT2('h.h.patrol0'),()=>{ closePanel(); patrolNow(); }]]); };

/* ---- 作息 ---- */
PANES.day=(pane,boss)=>{ const s=HOUSE.sched, now=Date.now();
  let h=`<h4>${esc(HT2('h.d.house'))}</h4><table>`+[[HT2('h.d.wake'),DAY.wake],[MEALN.b,MEALS[0].at],[MEALN.l,MEALS[1].at],[MEALN.d,MEALS[2].at],[HT2('h.d.wf'),DAY.wf],[MEALN.n,MEALS[3].at],[HT2('h.d.wm'),DAY.wm],[HT2('h.d.sleep'),DAY.sleep]].sort((a,b)=>(a[1]-DAY.wake+1440)%1440-(b[1]-DAY.wake+1440)%1440).map(([a,m])=>`<tr><td>${esc(a)}</td><td>${hhmm(((m%1440)+1440)%1440)}</td></tr>`).join('')+'</table>';
  if(now<s.slU&&s.sl) h+=`<p class="meta">${esc(HF('h.d.slNote',{分:Math.abs(s.sl),早晚:s.sl>0?HT2('h.d.late',0):HT2('h.d.late',1)},0))}</p>`;
  if(now<s.wkU&&s.wk) h+=`<p class="meta">${esc(HF('h.d.wkNote',{分:s.wk},0))}</p>`;
  h+=`<p class="meta">${esc(HF('h.d.kids',{起:hhmm(KIDS.wake),睡:hhmm(KIDS.sleep)},0))}</p>`;
  h+=`<h4>${esc(HT2('h.d.each'))}</h4><table>`+NPCS.map(d=>`<tr><td style="white-space:nowrap">${esc(npcName(d.id))}</td><td class="meta">${esc(String(NT('plan.'+d.id)||HT2('h.d.usual')).replace(/\n/g,'、'))}</td></tr>`).join('')+'</table>';
  para(pane,h); if(!boss) return;
  const set=(ch,k)=>()=>{ hAct({sched:Object.assign({},HOUSE.sched,ch)}); sayK('xu',k); bRender(); };
  blk(pane,HT2('h.d.change'),[[HT2('h.d.sl',0),set({sl:30,slU:untilMorning()},'h.d.ok')],[HT2('h.d.sl',1),set({sl:60,slU:untilMorning()},'h.d.ok')],[HT2('h.d.early'),set({sl:-30,slU:untilMorning()},'h.d.ok')],
    [HT2('h.d.wk'),set({wk:30,wkU:untilMorning()},'h.d.ok')],[HT2('h.d.reset'),set({sl:0,slU:0,wk:0,wkU:0},'h.d.ok')]]); };

/* ---- 待客 ---- */
let greetAt=0; const greeted=new Set();
setInterval(()=>{ const n=NPC.xu; if(!n||!n.greet) return; if(Date.now()>n.greet){ n.greet=0; n.errand=false; n.busyUntil=0; return; }
  for(const [,o] of (typeof others!=='undefined'?others:[])){ const p=o.av.g.position, nm=str(o.p.n,12)||'訪客'; if(!greeted.has(nm)&&Math.hypot(p.x-n.x,p.z-n.z)<4){ greeted.add(nm); npcFace(n,{x:p.x,z:p.z}); npcSay('xu',HF('h.gu.hi',{名:nm},Math.random()<.5?0:1)); } } },1000);
PANES.guest=(pane)=>{ const on=[...(typeof others!=='undefined'?others.values():[])].map(o=>str(o.p.n,12)||'訪客');
  para(pane,`<p>${on.length?esc(HF('h.gu.on',{名:on.join('、')},0)):esc(HT2('h.gu.on',1))}</p>`);
  blk(pane,'',[[HT2('h.gu.gate'),()=>{ const n=NPC.xu; if(n.lead) leadEnd(false); n.butler=0; closePanel(); npcSay('xu',HF('h.gu.go')); greeted.clear(); doErrand(n,[{to:P(50.6,10.8),face:P(55,9.8),act:'idle',dur:10*60000,on:k=>{ k.greet=Date.now()+10*60000; }}]); }],
    [HT2('h.gu.tea'),()=>{ errandSay('chun'); doErrand(NPC.chun,[{to:P(10.4,-2.2),face:P(10.4,-4.5),act:'load',dur:5000},{to:()=>NP.tea,act:'unload',dur:5000,on:m=>{ if(near(m,9)) sayK('chun','h.f.teaDone'); }}]); }],
    [HT2('h.gu.tour'),tourStart]]);
  for(const f of GUEST_EXTRA) try{ f(pane); }catch(e){ console.warn(e); } };
const GUEST_EXTRA=[];

/* ---- 電影院: a film at a set time; the household comes to watch ---- */
let SH=null;   // this browser's run of the shared showing
function showEnd(){ if(!SH) return; for(const id of SH.ids){ const n=NPC[id]; if(n&&n.cineW){ n.cineW=false; if(n.sSi>=0) npcStand(n,SEATS[n.sSi].ap); n.errand=false; n.busyUntil=0; n.act='idle'; } } SH=null; }
setInterval(()=>{ const S=HOUSE.show, now=Date.now(); if(!S){ if(SH) showEnd(); return; } const C=window.__cine; if(!C) return;
  if(!SH||SH.at!==S.at){ showEnd(); SH={at:S.at,called:false,started:false,ids:[]}; }
  if(!SH.called&&now>=S.at-5*60000){ SH.called=true; const f=C.FILMS[S.fi]; toast(HF('h.c.soon',{片:f?f.title:''},0),6000); if(near(NPC.xu,12)) npcSay('xu',HF('h.c.soon',{片:f?f.title:''},1));
    // the household takes the back seats first and leaves one for every guest in the house and one more
    const seats=SEATS.map((s,i)=>(s.kind==='cine'||s.kind==='cine2')?i:-1).filter(i=>i>=0).reverse(); seats.length=Math.max(0,seats.length-((typeof others!=='undefined'?others.size:0)+2));
    for(const d of NPCS){ const n=NPC[d.id]; if(n.lie||n.look||n.follow||n.lead||n.tl||n.gather||n.pose==='ssit') continue; const si=seats.find(i=>i!==ME.seat&&!occupied(i)&&!Object.values(NPC).some(m=>m.sSi===i)); if(si==null) break;
      leaveSpot(n); n.errand=true; n.cineW=true; n.task=null; n.next=null; n.carry=null; SH.ids.push(d.id); seatAt(n,si,'bedsit',Infinity); } }
  if(!SH.started&&now>=S.at){ SH.started=true; const f=C.FILMS[S.fi]; if(f&&hRank()===0&&!(C.S.p&&C.S.u===f.url)) C.act({u:f.url,ti:f.title,sb:f.subs,p:true,t:0,lt:'film',lv:1}); }
  if(SH.started&&now>S.at+90000&&!C.S.p){ if(!SH.idle) SH.idle=now; if(now-SH.idle>60000&&hRank()===0) hAct({show:null}); } else SH.idle=0;
  if(now>S.at+4*3600000&&hRank()===0) hAct({show:null}); },2000);
PANES.cine=(pane)=>{ const C=window.__cine, FL=C?C.FILMS:[], S=HOUSE.show;
  if(S){ const f=FL[S.fi]; para(pane,`<p>${esc(HF('h.c.set',{片:f?f.title:'',時:hhmm(((taipeiNow().min+(S.at-Date.now())/60000)%1440+1440)%1440),人:S.by||''},0))}</p>`); blk(pane,'',[[HT2('h.c.cancel'),()=>{ hAct({show:null}); bRender(); }]]); }
  if(!FL.length){ para(pane,`<p class="meta">${esc(HT2('h.c.none'))}</p>`); return; }
  const d=para(pane,`<h4>${esc(HT2('h.c.pick'))}</h4><p><select id="bcf">${FL.map((f,i)=>`<option value="${i}">${esc(f.title)}</option>`).join('')}</select></p><p>${esc(HT2('h.c.when'))}　<input id="bct" type="time" value="${hhmm(Math.ceil((taipeiNow().min+10)/5)*5%1440)}"></p>`);
  blk(pane,'',[[HT2('h.c.go'),()=>{ const fi=+d.querySelector('#bcf').value, v=d.querySelector('#bct').value, m=/^(\d{1,2}):(\d{2})/.exec(v); if(!m) return; let dm=(+m[1]*60+ +m[2])-taipeiNow().min; if(dm<-1) dm+=1440;
      hAct({show:{fi,at:Date.now()+Math.max(0,dm)*60000,by:myName}}); sayK('xu','h.c.ok'); bRender(); }],
    [HT2('h.c.now'),()=>{ const fi=+d.querySelector('#bcf').value; hAct({show:{fi,at:Date.now()+5*60000,by:myName}}); sayK('xu','h.c.ok'); bRender(); }]],HT2('h.c.note')); };

/* ---- 提醒、讀書計時、記事 (this browser only) ---- */
const REM=(()=>{ let o={}; try{ o=JSON.parse(localStorage.getItem('hkRemind')||'{}'); }catch{} o.list=o.list||[]; return o; })();
const remSave=()=>{ try{ localStorage.setItem('hkRemind',JSON.stringify(REM)); }catch{} };
function xuTell(text){ toast(npcName('xu')+'：'+text,8000); const n=NPC.xu; if(n&&!n.look&&!n.lead&&!n.gather&&Math.hypot(ME.x-n.x,ME.z-n.z)<60&&!(ME.x>53.4)){ xuCome(); setTimeout(()=>npcSay('xu',text),Math.min(9000,Math.hypot(ME.x-n.x,ME.z-n.z)*700)); } }
setInterval(()=>{ if(!window.__entered) return; const T=taipeiNow(), now=Date.now(); let ch=false;
  for(const r of REM.list){ if(r.done===T.day) continue; const [h,mi]=r.at.split(':').map(Number), m=h*60+mi; if(T.min>=m&&T.min<m+3){ r.done=T.day; ch=true; xuTell(HF('h.m.say',{事:r.t},0)); } }
  if(REM.read&&now>=REM.read){ const mins=REM.readMin||0; REM.read=0; ch=true; xuTell(HF('h.m.readDone',{分:mins},0)); }
  if(ch){ remSave(); if(bIsOpen()&&TABS[bTab]==='rem'&&!(document.activeElement&&document.activeElement.closest&&document.activeElement.closest('#bpane'))) bRender(); } },10000);
PANES.rem=(pane)=>{ const now=Date.now();
  const d=para(pane,`<h4>${esc(HT2('h.m.rem'))}</h4>`+(REM.list.length?'<table>'+REM.list.map((r,i)=>`<tr><td>${esc(r.at)}</td><td>${esc(r.t)}</td><td><a href="#" data-x="${i}">${esc(HT2('h.m.del'))}</a></td></tr>`).join('')+'</table>':`<p class="meta">${esc(HT2('h.m.empty'))}</p>`)+
    `<p><input id="brt" type="time" value="${hhmm(Math.ceil((taipeiNow().min+30)/5)*5%1440)}"> <input id="brx" type="text" maxlength="40" style="width:55%" placeholder="${esc(HT2('h.m.ph'))}"></p>`);
  d.querySelectorAll('[data-x]').forEach(a=>a.onclick=e=>{ e.preventDefault(); REM.list.splice(+a.dataset.x,1); remSave(); bRender(); });
  blk(pane,'',[[HT2('h.m.add'),()=>{ const at=d.querySelector('#brt').value, t=d.querySelector('#brx').value.trim(); if(!/^\d{1,2}:\d{2}/.test(at)||!t) return; REM.list.push({at:at.slice(0,5),t}); REM.list.sort((a,b)=>a.at<b.at?-1:1); remSave(); sayK('xu','h.m.ok'); bRender(); }]]);
  const left=REM.read&&REM.read>now?Math.ceil((REM.read-now)/60000):0;
  blk(pane,HT2('h.m.read'),left?[[HT2('h.m.readStop'),()=>{ REM.read=0; remSave(); bRender(); }]]:[25,45,60,90].map(m=>[m+' '+HT2('h.m.min'),()=>{ REM.read=Date.now()+m*60000; REM.readMin=m; remSave(); sayK('xu','h.m.readGo'); bRender(); }]),left?HF('h.m.readLeft',{分:left},0):HT2('h.m.readNote'));
  const nt=para(pane,`<h4>${esc(HT2('h.m.note'))}</h4><textarea id="bnote" rows="7">${esc(REM.note||'')}</textarea>`);
  nt.querySelector('#bnote').oninput=e=>{ REM.note=e.target.value.slice(0,4000); remSave(); }; };
/* ---- 日曆與節慶、新文章、獎賞 (報告 and 叫人) ---- */
function calInfo(off=0){ const dt=new Date(Date.now()+MEAL_SHIFT*60000+off), [Y,Mo,Dd]=dt.toLocaleString('sv',{timeZone:'Asia/Taipei'}).split(' ')[0].split('-').map(Number); let lm=0, ld=0, leap=false, yn='';
  try{ for(const p of new Intl.DateTimeFormat('en-u-ca-chinese',{timeZone:'Asia/Taipei',year:'numeric',month:'numeric',day:'numeric'}).formatToParts(dt)){ if(p.type==='month'){ leap=/bis|閏/i.test(p.value); lm=parseInt(p.value,10)||0; } if(p.type==='day') ld=parseInt(p.value,10)||0; }
    for(const p of new Intl.DateTimeFormat('zh-TW-u-ca-chinese',{timeZone:'Asia/Taipei',year:'numeric',month:'long',day:'numeric'}).formatToParts(dt)) if(p.type==='yearName') yn=p.value; }catch{}
  const cn='〇一二三四五六七八九十', mN=['','正','二','三','四','五','六','七','八','九','十','冬','臘'][lm]||'', dN=!ld?'':ld<=10?'初'+(ld===10?'十':cn[ld]):ld<20?'十'+cn[ld-10]:ld===20?'二十':ld<30?'廿'+cn[ld-20]:'三十';
  return {Y,Mo,Dd,lm,ld,leap,yn,roc:Y-1911,showa:Y-1925,lunar:(leap?'閏':'')+mN+'月'+dN}; }
// today's festival, from the back office lists (fest.solar: "MM-DD 名稱", fest.lunar: "M-D 名稱"); 除夕 is the day before 正月初一
function festOf(dayOffset=0){ const C=calInfo(dayOffset*86400000), out=[];
  for(const l of HT2('fest.solar').split(/\n+/)){ const m=/^(\d{1,2})[-\/](\d{1,2})\s+(.+)$/.exec(l.trim()); if(m&&+m[1]===C.Mo&&+m[2]===C.Dd) out.push(m[3]); }
  if(!C.leap) for(const l of HT2('fest.lunar').split(/\n+/)){ const m=/^(\d{1,2})[-\/](\d{1,2})\s+(.+)$/.exec(l.trim()); if(m&&+m[1]===C.lm&&+m[2]===C.ld) out.push(m[3]); }
  { const c2=calInfo((dayOffset+1)*86400000); if(c2.lm===1&&c2.ld===1&&!c2.leap) out.push(HT2('fest.eve')); }
  return out; }
function calLine(){ const C=calInfo(); return HF('h.cal',{民國:C.roc,昭和:C.showa,農曆:C.lunar,干支:C.yn},0); }
// the newest pieces on the site
const newPosts=()=>(Array.isArray(POSTS)?POSTS.map((p,i)=>({p,i})).filter(o=>o.p&&o.p.date&&o.p.title).sort((a,b)=>String(b.p.date).localeCompare(String(a.p.date))):[]);
{ const base=PANES.rep; PANES.rep=(pane,boss)=>{ base(pane,boss);
    const first=pane.querySelector('p'); if(first){ const f=festOf(0), up=[]; for(let k=1;k<=7&&up.length<2;k++){ const x=festOf(k); if(x.length) up.push(HF('h.fest.soon',{天:k,節:x.join('、')},0)); }
      first.insertAdjacentHTML('afterend',`<p class="meta">${esc(calLine())}</p>`+(f.length?`<p>${esc(HF('h.fest.today',{節:f.join('、')},0))}</p>`:'')+up.map(t=>`<p class="meta">${esc(t)}</p>`).join('')); }
    const L=newPosts().slice(0,4); if(!L.length) return; const d=document.createElement('div'); d.innerHTML=`<h4>${esc(HT2('h.posts'))}</h4>`+L.map(o=>`<p><a href="#" data-pi="${o.i}">${esc(o.p.title)}</a><span class="meta">　${esc(String(o.p.date).slice(0,10))}</span></p>`).join('');
    d.querySelectorAll('[data-pi]').forEach(a=>a.onclick=e=>{ e.preventDefault(); closePanel(); openReader(+a.dataset.pi); });
    const h4=[...pane.querySelectorAll('h4')][2]; if(h4) h4.parentNode.insertBefore(d,h4); else pane.append(d); }; }
// when he comes, the steward mentions a new piece once, and the day's festival once a day
{ const base=xuCome; xuCome=function(){ base.apply(this,arguments); const n=NPC.xu; if(!n||n.look) return; const T=taipeiNow(); let said=false;
    try{ const L=newPosts(); const top=L[0], seen=localStorage.getItem('hkLastPost')||''; if(top&&String(top.p.date)>seen){ localStorage.setItem('hkLastPost',String(top.p.date)); if(seen){ setTimeout(()=>npcSay('xu',HF('h.newpost',{題:top.p.title},0)),2500); said=true; } } }catch{}
    try{ const f=festOf(0); if(f.length&&localStorage.getItem('hkFestSaid')!==T.day){ localStorage.setItem('hkFestSaid',T.day); setTimeout(()=>npcSay('xu',HF('h.fest.greet',{節:f.join('、')},0)),said?6000:2500); } }catch{} }; }
// 表揚 and 紅包, from the master: the steward says it before the house, the one praised answers
const RW=(()=>{ try{ return JSON.parse(localStorage.getItem('hkReward')||'{}'); }catch{ return {}; } })();
function reward(id,kind){ const n=NPC[id]; if(!n) return; RW[id]=RW[id]||{p:0,r:0}; RW[id][kind]++; try{ localStorage.setItem('hkReward',JSON.stringify(RW)); }catch{}
  if(id!=='xu') npcSay('xu',HF(kind==='p'?'h.rw.praise':'h.rw.red',{名:npcName(id)},Math.random()<.5?0:1));
  setTimeout(()=>{ const t=NT('rw.'+id,kind==='p'?0:1); if(t) npcSay(id,String(t).replace(/\{稱呼\}/g,titleFill().稱呼)); },2600);
  if(!n.lie&&!n.look&&Math.hypot(n.x-ME.x,n.z-ME.z)<12) npcFace(n,ME); }
{ const base=PANES.call; PANES.call=(pane,boss)=>{ base(pane,boss); if(!boss) return;
    const d=document.createElement('div'); d.innerHTML=`<h4>${esc(HT2('h.rw.title'))}</h4><p class="meta">${esc(HT2('h.rw.note'))}</p><table>`+NPCS.filter(x=>x.id!=='xu').concat(NPCS.filter(x=>x.id==='xu')).map(x=>{ const r=RW[x.id]||{p:0,r:0};
      return `<tr><td style="white-space:nowrap">${esc(npcName(x.id))}</td><td><a href="#" data-rp="${x.id}">${esc(HT2('h.rw.p'))}</a>　<a href="#" data-rr="${x.id}">${esc(HT2('h.rw.r'))}</a></td><td class="meta">${r.p||r.r?esc(HF('h.rw.count',{表揚:r.p,紅包:r.r},0)):''}</td></tr>`; }).join('')+'</table>';
    d.querySelectorAll('[data-rp]').forEach(a=>a.onclick=e=>{ e.preventDefault(); reward(a.dataset.rp,'p'); bRender(); });
    d.querySelectorAll('[data-rr]').forEach(a=>a.onclick=e=>{ e.preventDefault(); reward(a.dataset.rr,'r'); bRender(); });
    pane.append(d); }; }
window.__butler={openButler,leadTo,tourStart,tourNext,HOUSE,hAct,PLACES,gatherRun,FOOD_EXTRA,GUEST_EXTRA,PANES};

// {% endraw %}
