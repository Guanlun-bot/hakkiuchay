// {% raw %}
// ------------------------------------------------------------ 教室：黑板、投影、多人同步
// The blackboard is a list of strokes, words and pictures; the projection is one picture at a time. Both go to everyone in
// the house as they happen (through the house server's relay), and someone already here hands a newcomer what is on the
// board when they arrive. Nothing is stored anywhere else: when the last person leaves, the board is gone.
SEAT_KIND.cls={eye:1.12,pitch:-.04,front:false,sink:-.42,get label(){ return NT('cls.label',0); },get hello(){ return NT('cls.hello',0); },status:()=>NT('cls.status',0)};
SEAT_KIND.clst={eye:1.27,pitch:-.3,front:false,sink:-.27,get label(){ return NT('cls.label',1); },get hello(){ return NT('cls.hello',1); },status:()=>NT('cls.status',1)};
{ const R=CLS_ROOM, W=2048, H=800, bx=R.bx;
  const COLORS=['#f3f0e6','#f2d36a','#e7806e','#8db6e0'], WIDTHS=[5,9,16], SIZES=[56,84,124];
  const list=k=>String(NT(k,0)||'').split(/[,，、]/).map(s=>s.trim());
  const ST={ops:[],tool:'pen',color:0,width:1,size:1,vert:false,mine:[]}; let seq=0, dirty=false;
  const uid=()=>MY_PID.slice(0,8)+'-'+(seq++).toString(36)+'-'+Math.random().toString(36).slice(2,6);
  const send=(d,to)=>{ try{ return !!(NET.bcast&&NET.bcast(Object.assign({k:'cls'},d),to)); }catch{ return false; } };
  const rngOf=s=>{ let h=2166136261; for(const c of String(s)) h=Math.imul(h^c.charCodeAt(0),16777619); return ()=>((h=Math.imul(h^(h>>>15),2246822507)>>>0)/4294967296); };
  // ---- drawing
  function seg(op,i){ const p=op.p, x0=p[i-2]/1e4*W, y0=p[i-1]/1e4*H, x1=p[i]/1e4*W, y1=p[i+1]/1e4*H, w=WIDTHS[op.w]||8, r=rngOf(op.id+i), L=Math.hypot(x1-x0,y1-y0);
    bx.save(); bx.lineCap=bx.lineJoin='round';
    if(op.e){ bx.strokeStyle=R.bgPat; bx.lineWidth=w*4; bx.beginPath(); bx.moveTo(x0,y0); bx.lineTo(x1,y1); bx.stroke();
      bx.strokeStyle='rgba(225,230,220,.025)'; bx.lineWidth=w*4.4; bx.stroke(); bx.restore(); return; }
    bx.strokeStyle=COLORS[op.c]||COLORS[0]; bx.globalAlpha=.72; bx.lineWidth=w*.82; bx.beginPath(); bx.moveTo(x0,y0); bx.lineTo(x1,y1); bx.stroke();
    bx.globalAlpha=.55; bx.fillStyle=COLORS[op.c]||COLORS[0]; const n=Math.ceil(L*w*.09)+2;
    for(let k=0;k<n;k++){ const t=r(), a=r()*Math.PI*2, d=r()*w*.62; bx.fillRect(x0+(x1-x0)*t+Math.cos(a)*d,y0+(y1-y0)*t+Math.sin(a)*d,1+r()*1.6,1+r()*1.6); }
    bx.globalAlpha=1; bx.fillStyle=R.bgPat; const g=Math.ceil(L*w*.05)+1;
    for(let k=0;k<g;k++){ const t=r(), a=r()*Math.PI*2, d=r()*w*.42; bx.fillRect(x0+(x1-x0)*t+Math.cos(a)*d,y0+(y1-y0)*t+Math.sin(a)*d,1+r()*1.4,1+r()*1.4); }
    bx.restore(); }
  function dot(op){ const x=op.p[0]/1e4*W, y=op.p[1]/1e4*H, w=WIDTHS[op.w]||8; bx.save(); bx.fillStyle=op.e?R.bgPat:(COLORS[op.c]||COLORS[0]); bx.globalAlpha=op.e?1:.72; bx.beginPath(); bx.arc(x,y,(op.e?w*2:w*.41),0,Math.PI*2); bx.fill(); bx.restore(); }
  const FONT='"Kaiti TC","BiauKai","STKaiti","KaiTi","DFKai-SB","TW-Kai","Noto Serif TC",serif';
  function drawText(op){ const s=SIZES[op.s]||70, x=op.x/1e4*W, y=op.y/1e4*H, lines=String(op.tx||'').split('\n'), tc=document.createElement('canvas'); tc.width=W; tc.height=H; const g=tc.getContext('2d');
    g.fillStyle=COLORS[op.c]||COLORS[0]; g.font=`${s}px ${FONT}`; g.textBaseline='top'; let x0,x1,y0=y,y1;
    if(op.v){ lines.forEach((ln,j)=>[...ln].forEach((ch,k)=>g.fillText(ch,x-s-j*s*1.25+(s-g.measureText(ch).width)/2,y+k*s*1.08))); x0=x-lines.length*s*1.25; x1=x; y1=y+Math.max(...lines.map(l=>[...l].length))*s*1.08; }
    else { lines.forEach((ln,j)=>g.fillText(ln,x,y+j*s*1.3)); x0=x; x1=x+Math.max(...lines.map(l=>g.measureText(l).width)); y1=y+lines.length*s*1.3; }
    const r=rngOf(op.id), n=Math.min(60000,(x1-x0)*(y1-y0)*.012); g.globalCompositeOperation='destination-out';
    for(let k=0;k<n;k++){ g.globalAlpha=.3+r()*.6; g.fillRect(x0+r()*(x1-x0),y0+r()*(y1-y0),1+r()*1.8,1+r()*1.8); }
    bx.save(); bx.globalAlpha=.92; bx.drawImage(tc,0,0); bx.restore(); }
  const IMG=new Map();
  function drawImg(op){ let im=IMG.get(op.id); if(!im){ im=new Image(); im.onload=()=>{ im.ok=true; redraw(); }; im.src=op.src; IMG.set(op.id,im); return; } if(!im.ok) return;
    bx.save(); bx.globalAlpha=op.raster?1:.92; bx.drawImage(im,op.x/1e4*W,op.y/1e4*H,op.w/1e4*W,op.h/1e4*H); bx.restore(); }
  function drawOp(op){ if(op.t==='s'){ if(op.p.length===2) dot(op); for(let i=2;i<op.p.length;i+=2) seg(op,i); } else if(op.t==='t'){ if(!op.nd) drawText(op); } else if(op.t==='i') drawImg(op); }
  function redraw(){ bx.drawImage(R.BG,0,0); for(const op of ST.ops) drawOp(op); dirty=true; }
  const find=id=>ST.ops.find(o=>o.id===id);
  // ---- changes, wherever they come from
  function apply(d,from){ if(d.o==='sp'){ let op=find(d.id); if(!op){ op={t:'s',id:d.id,u:d.u,c:d.c|0,w:d.w|0,e:!!d.e,p:[]}; ST.ops.push(op); }
      const at=op.p.length; for(const v of (Array.isArray(d.p)?d.p:[])) op.p.push(+v||0); if(op.p.length===2&&at===0) dot(op); for(let i=Math.max(2,at);i<op.p.length;i+=2) seg(op,i); dirty=true; return; }
    if(d.o==='op'&&d.op&&d.op.id&&!find(d.op.id)){ ST.ops.push(d.op); drawOp(d.op); dirty=true; return; }
    if(d.o==='undo'){ const i=ST.ops.findIndex(o=>o.id===d.id); if(i>=0){ ST.ops.splice(i,1); redraw(); } return; }
    if(d.o==='clr'){ ST.ops=[]; ST.mine=[]; IMG.clear(); redraw(); if(from) toast(NT('cls.cleared',0)); return; } }
  window.__clsBoard=()=>({ops:ST.ops.length});
  // ---- the editor
  const css=document.createElement('style'); css.textContent=`
#clsui{position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;background:rgba(24,20,16,.5);font-family:"Noto Serif TC",serif}
#clsui.hide{display:none}
#clsui .box{background:#f4efe4;color:#2b2621;border:1px solid #cfc6b4;padding:10px 12px 12px;max-width:min(1240px,97vw);width:100%;box-sizing:border-box;max-height:97vh;overflow:auto}
#clsui .bar{display:flex;flex-wrap:wrap;gap:5px;align-items:center;margin-bottom:8px;font-size:13px}
#clsui .bar .t{font-size:15px;letter-spacing:.15em;margin-right:6px}
#clsui .bar .sp{flex:1}
#clsui button,#clsui select,#clsui input[type=text],#clsui input[type=number]{font:inherit;font-size:13px;color:#2b2621;background:#fbf8f1;border:1px solid #cfc6b4;padding:3px 8px;border-radius:2px;cursor:pointer}
#clsui button.on{background:#2b2621;color:#f4efe4;border-color:#2b2621}
#clsui button.sw{width:22px;height:22px;padding:0;border-radius:50%;border:2px solid #cfc6b4}
#clsui button.sw.on{border-color:#2b2621;outline:1px solid #f4efe4;outline-offset:-4px}
#clsui .grp{display:flex;gap:3px;align-items:center;padding-right:6px;margin-right:2px;border-right:1px solid #e0d8c8}
#clsui .wrap{position:relative;line-height:0}
#clsui canvas.main{width:100%;max-width:calc(78vh * 2.56);margin:0 auto;height:auto;touch-action:none;cursor:crosshair;display:block}
#clsui textarea{position:absolute;background:rgba(30,40,34,.55);border:1px dashed rgba(240,236,226,.6);outline:none;resize:none;line-height:1.3;padding:0 2px;font-family:${FONT};overflow:hidden;min-width:2em;min-height:1.3em}
#clsui .note{font-size:12px;color:#7a7066;margin-top:6px;line-height:1.6}
#clsui .row{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-top:8px;font-size:13px}
#clsui .row input[type=text]{flex:1;min-width:160px;cursor:text}
#clsui .pv{position:relative;line-height:0}
#clsui .pv canvas{width:100%;max-width:calc(58vh * 16 / 9);height:auto;display:block;margin:0 auto}
#clsui .pv.lz canvas{cursor:none}
`; document.head.appendChild(css);
  const ui=document.createElement('div'); ui.id='clsui'; ui.className='hide'; document.body.appendChild(ui);
  let mode=null, ta=null;
  const btn=(label,fn,cls='')=>{ const b=document.createElement('button'); b.type='button'; b.textContent=label; if(cls) b.className=cls; b.onclick=fn; return b; };
  const grp=(...els)=>{ const g=document.createElement('div'); g.className='grp'; els.forEach(e=>g.append(e)); return g; };
  function close(){ commitText(); ui.className='hide'; ui.innerHTML=''; mode=null; LZ.on=false; laserSend(null); }
  function shell(title){ if(document.pointerLockElement) document.exitPointerLock(); ui.className=''; ui.innerHTML=''; const box=document.createElement('div'); box.className='box'; const bar=document.createElement('div'); bar.className='bar';
    const t=document.createElement('span'); t.className='t'; t.textContent=title; bar.append(t); box.append(bar); ui.append(box); ui.onpointerdown=e=>{ if(e.target===ui) close(); }; return {box,bar}; }
  // -- blackboard editor
  function openBoard(){ if(renderer.xr.isPresenting){ toast(NT('cls.vr',0)); return; } mode='board'; const {box,bar}=shell(NT('cls.board',0));
    const tools=grp(), cols=grp(), wid=grp(), act=grp(), io=grp();
    const tb={pen:btn(NT('cls.pen',0),()=>setTool('pen')),eraser:btn(NT('cls.pen',1),()=>setTool('eraser')),text:btn(NT('cls.text',0),()=>setTool('text'))};
    tools.append(tb.pen,tb.eraser,tb.text);
    const vb=btn(NT('cls.text',1),()=>{ ST.vert=!ST.vert; vb.classList.toggle('on',ST.vert); commitText(); }); vb.classList.toggle('on',ST.vert); tools.append(vb);
    const cnames=list('cls.colors'); const sws=COLORS.map((c,i)=>{ const b=btn('',()=>{ ST.color=i; sws.forEach((s,k)=>s.classList.toggle('on',k===i)); if(ST.tool==='eraser') setTool('pen'); if(ta) ta.style.color=COLORS[i]; },'sw'); b.style.background=c; b.title=cnames[i]||''; b.classList.toggle('on',i===ST.color); return b; }); cols.append(...sws);
    const wnames=String(NT('cls.colors',1)).split(/[,，、]/); const wbs=WIDTHS.map((w,i)=>{ const b=btn((wnames[i]||'').trim(),()=>{ ST.width=i; ST.size=i; wbs.forEach((s,k)=>s.classList.toggle('on',k===i)); }); b.classList.toggle('on',i===ST.width); return b; }); wid.append(...wbs);
    let clrArm=0; const cb=btn(NT('cls.undo',1),()=>{ if(Date.now()-clrArm>3000){ clrArm=Date.now(); cb.textContent=NT('cls.clearq',0); setTimeout(()=>{ if(cb.isConnected) cb.textContent=NT('cls.undo',1); },3000); return; } clrArm=0; cb.textContent=NT('cls.undo',1); apply({o:'clr'}); send({o:'clr'}); });
    act.append(btn(NT('cls.undo',0),undo),cb);
    const fi=document.createElement('input'); fi.type='file'; fi.accept='image/*'; fi.hidden=true; fi.onchange=()=>{ const f=fi.files&&fi.files[0]; fi.value=''; if(f) pasteImage(f); };
    io.append(fi,btn(NT('cls.load',0),()=>fi.click()),btn(NT('cls.export',0),savePng),btn(NT('cls.export',1),saveTxt));
    const sp=document.createElement('span'); sp.className='sp'; bar.append(tools,cols,wid,act,io,sp,btn(NT('cls.ui',1),close));
    const wrap=document.createElement('div'); wrap.className='wrap'; R.BCV.className='main'; wrap.append(R.BCV); box.append(wrap);
    const note=document.createElement('div'); note.className='note'; note.textContent=NT('cls.texthint',0); box.append(note);
    function setTool(t){ commitText(); ST.tool=t; for(const k in tb) tb[k].classList.toggle('on',k===t); R.BCV.style.cursor=t==='text'?'text':'crosshair'; }
    setTool(ST.tool);
    const at=e=>{ const r=R.BCV.getBoundingClientRect(); return [Math.max(0,Math.min(1e4,Math.round((e.clientX-r.left)/r.width*1e4))),Math.max(0,Math.min(1e4,Math.round((e.clientY-r.top)/r.height*1e4)))]; };
    let cur=null, pend=[], ft=0;
    const flush=end=>{ if(!cur) return; if(pend.length||end){ send({o:'sp',id:cur.id,u:cur.u,c:cur.c,w:cur.w,e:cur.e?1:0,p:pend,f:end?1:0}); pend=[]; } };
    R.BCV.onpointerdown=e=>{ e.preventDefault(); if(ST.tool==='text'){ placeText(e); return; } R.BCV.setPointerCapture(e.pointerId);
      cur={t:'s',id:uid(),u:MY_PID,c:ST.color,w:ST.width,e:ST.tool==='eraser',p:at(e)}; ST.ops.push(cur); ST.mine.push(cur.id); dot(cur); dirty=true; pend=[...cur.p]; ft=performance.now(); };
    R.BCV.onpointermove=e=>{ if(!cur) return; const evs=e.getCoalescedEvents?e.getCoalescedEvents():[e]; for(const ev of (evs.length?evs:[e])){ const p=at(ev), n=cur.p.length; if(Math.hypot(p[0]-cur.p[n-2],(p[1]-cur.p[n-1])*H/W)<12) continue; cur.p.push(p[0],p[1]); pend.push(p[0],p[1]); seg(cur,cur.p.length-2); } dirty=true;
      if(performance.now()-ft>70){ ft=performance.now(); flush(false); } };
    R.BCV.onpointerup=R.BCV.onpointercancel=()=>{ if(!cur) return; flush(true); cur=null; };
    function placeText(e){ commitText(); const r=R.BCV.getBoundingClientRect(), p=at(e), k=r.width/W, s=SIZES[ST.size];
      ta=document.createElement('textarea'); ta.dataset.x=p[0]; ta.dataset.y=p[1]; ta.rows=1; ta.style.color=COLORS[ST.color]; ta.style.fontSize=(s*k)+'px';
      if(ST.vert){ ta.style.writingMode='vertical-rl'; ta.style.left=(e.clientX-r.left-s*k*1.15)+'px'; ta.style.top=(e.clientY-r.top)+'px'; ta.style.height=Math.max(3*s*k,40)+'px'; ta.style.width=(s*k*1.3)+'px'; }
      else { ta.style.left=(e.clientX-r.left)+'px'; ta.style.top=(e.clientY-r.top)+'px'; ta.style.width=Math.max(5*s*k,120)+'px'; ta.style.height=(s*k*1.35)+'px'; }
      ta.oninput=()=>{ if(ST.vert){ ta.style.height='auto'; ta.style.height=Math.max(ta.scrollHeight,3*s*k)+'px'; ta.style.width=Math.max(s*k*1.3,ta.scrollWidth)+'px'; } else { ta.style.width='auto'; ta.style.width=Math.max(5*s*k,ta.scrollWidth+8)+'px'; ta.style.height=Math.max(s*k*1.35,ta.scrollHeight)+'px'; } };
      ta.onblur=()=>setTimeout(commitText,0); wrap.append(ta); setTimeout(()=>ta&&ta.focus(),0); }
  }
  function commitText(){ const t=ta; if(!t) return; ta=null; const tx=t.value.replace(/\s+$/,''); t.remove(); if(!tx) return;
    const s=SIZES[ST.size], x=+t.dataset.x, y=+t.dataset.y, op={t:'t',id:uid(),u:MY_PID,x,y,s:ST.size,c:ST.color,v:ST.vert?1:0,tx:tx.slice(0,2000)};
    ST.ops.push(op); ST.mine.push(op.id); drawOp(op); dirty=true; send({o:'op',op}); }
  function undo(){ commitText(); while(ST.mine.length){ const id=ST.mine.pop(); if(find(id)){ apply({o:'undo',id}); send({o:'undo',id}); return; } } }
  function pasteImage(f){ const fr=new FileReader(); fr.onload=()=>{ const im=new Image(); im.onload=()=>{ const s=Math.min(1,900/Math.max(im.width,im.height)), c=document.createElement('canvas'); c.width=Math.round(im.width*s); c.height=Math.round(im.height*s); c.getContext('2d').drawImage(im,0,0,c.width,c.height);
      const src=c.toDataURL('image/jpeg',.82), maxW=.42*W, maxH=.75*H, k=Math.min(maxW/c.width,maxH/c.height), w=c.width*k, h=c.height*k;
      const op={t:'i',id:uid(),u:MY_PID,x:Math.round((W-w)/2/W*1e4),y:Math.round((H-h)/2/H*1e4),w:Math.round(w/W*1e4),h:Math.round(h/H*1e4),src};
      ST.ops.push(op); ST.mine.push(op.id); drawOp(op); send({o:'op',op}); }; im.src=fr.result; }; fr.readAsDataURL(f); }
  const stamp=()=>{ const d=new Date(), p=n=>String(n).padStart(2,'0'); return `${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`; };
  const download=(href,name)=>{ const a=document.createElement('a'); a.href=href; a.download=name; document.body.append(a); a.click(); a.remove(); };
  function savePng(){ commitText(); download(R.BCV.toDataURL('image/png'),`${NT('cls.board',0)}-${stamp()}.png`); }
  function boardText(){ const ts=ST.ops.filter(o=>o.t==='t'); const hz=ts.filter(o=>!o.v).sort((a,b)=>(a.y-b.y)||(a.x-b.x)), vt=ts.filter(o=>o.v).sort((a,b)=>(b.x-a.x)||(a.y-b.y));
    return [...hz.map(o=>o.tx),...vt.map(o=>o.tx)].join('\n\n'); }
  function saveTxt(){ commitText(); const t=boardText(); if(!t){ toast(NT('cls.notext',0)); return; }
    try{ navigator.clipboard&&navigator.clipboard.writeText(t).catch(()=>{}); }catch{}
    const u=URL.createObjectURL(new Blob([t],{type:'text/plain;charset=utf-8'})); download(u,`${NT('cls.board',0)}-${stamp()}.txt`); setTimeout(()=>URL.revokeObjectURL(u),4000); toast(NT('cls.notext',1)); }
  // ---- the projector
  const PJ={down:false,k:0,has:false,page:0,total:0,src:null,busy:false,img:null};
  const LZ={on:false,x:.5,y:.5,show:false,t:0,remote:null,rt:0};
  const PDFJS='https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/', JSZIP='https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm';
  function fit(src,sw,sh,bg='#111'){ const c=R.px; c.fillStyle=bg; c.fillRect(0,0,1920,1080); const k=Math.min(1920/sw,1080/sh), w=sw*k, h=sh*k; c.drawImage(src,(1920-w)/2,(1080-h)/2,w,h); R.projTex.needsUpdate=true; }
  async function loadFile(f,name=''){ const nm=(name||f.name||'').toLowerCase(), ty=f.type||'';
    if(/\.ppt$/.test(nm)||ty==='application/vnd.ms-powerpoint') throw new Error(NT('cls.err',1));
    if(/\.pdf$/.test(nm)||ty==='application/pdf'){ const pdfjs=await import(PDFJS+'pdf.min.mjs'); pdfjs.GlobalWorkerOptions.workerSrc=PDFJS+'pdf.worker.min.mjs';
      const doc=await pdfjs.getDocument({data:new Uint8Array(await f.arrayBuffer())}).promise;
      return {total:doc.numPages,render:async n=>{ const pg=await doc.getPage(n), v=pg.getViewport({scale:1}), k=Math.min(1920/v.width,1080/v.height), vp=pg.getViewport({scale:k}), c=document.createElement('canvas'); c.width=Math.round(vp.width); c.height=Math.round(vp.height);
        const g=c.getContext('2d'); g.fillStyle='#fff'; g.fillRect(0,0,c.width,c.height); await pg.render({canvasContext:g,viewport:vp}).promise; return c; }}; }
    if(/\.pptx$/.test(nm)||/presentationml/.test(ty)) return pptx(f);
    if(/^image\//.test(ty)||/\.(png|jpe?g|gif|webp|bmp|svg)$/.test(nm)){ const bm=await createImageBitmap(f); return {total:1,render:async()=>bm}; }
    throw new Error(NT('cls.err',0)); }
  async function pptx(f){ const JSZip=(await import(JSZIP)).default, zip=await JSZip.loadAsync(await f.arrayBuffer());
    const xml=async p=>{ const z=zip.file(p); return z?new DOMParser().parseFromString(await z.async('string'),'application/xml'):null; };
    const tag=(n,t)=>n.getElementsByTagName(t), at=(n,a)=>n&&n.getAttribute(a);
    const pres=await xml('ppt/presentation.xml'); if(!pres) throw new Error(NT('cls.err',0)); const sz=tag(pres,'p:sldSz')[0], SWd=+at(sz,'cx')||12192000, SHd=+at(sz,'cy')||6858000;
    const rels=async p=>{ const d=await xml(p), m={}; if(d) for(const r of tag(d,'Relationship')) m[at(r,'Id')]=at(r,'Target'); return m; };
    const pr=await rels('ppt/_rels/presentation.xml.rels'), join=(base,t)=>{ const parts=(base+'/'+t).split('/'), out=[]; for(const s of parts){ if(s==='..') out.pop(); else if(s&&s!=='.') out.push(s); } return out.join('/'); };
    const slides=[...tag(pres,'p:sldId')].map(e=>join('ppt',pr[at(e,'r:id')]||'')).filter(Boolean);
    return {total:slides.length,render:async n=>{ const path=slides[n-1], doc=await xml(path), dir=path.replace(/\/[^/]+$/,''), sr=await rels(dir+'/_rels/'+path.split('/').pop()+'.rels');
      const c=document.createElement('canvas'), k=Math.min(1920/SWd,1080/SHd); c.width=Math.round(SWd*k); c.height=Math.round(SHd*k); const g=c.getContext('2d'); g.fillStyle='#fff'; g.fillRect(0,0,c.width,c.height);
      if(!doc) return c; const E=v=>(+v||0)*k;
      const box=(n,isTitle)=>{ const off=tag(n,'a:off')[0], ext=tag(n,'a:ext')[0]; if(off&&ext) return [E(at(off,'x')),E(at(off,'y')),E(at(ext,'cx')),E(at(ext,'cy'))]; return isTitle?[c.width*.06,c.height*.05,c.width*.88,c.height*.18]:[c.width*.06,c.height*.26,c.width*.88,c.height*.66]; };
      const tree=tag(doc,'p:spTree')[0]; if(!tree) return c;
      const walk=async node=>{ for(const n of [...node.children]){ const nm=n.tagName;
        if(nm==='p:grpSp'){ await walk(n); continue; }
        if(nm==='p:pic'){ const bl=tag(n,'a:blip')[0], rid=at(bl,'r:embed'), t=rid&&sr[rid]; if(!t) continue; const zf=zip.file(join(dir,t)); if(!zf||/\.(emf|wmf)$/i.test(t)) continue;
          try{ const bm=await createImageBitmap(await zf.async('blob')); const [x,y,w,h]=box(n); g.drawImage(bm,x,y,w,h); }catch{} continue; }
        if(nm==='p:sp'){ const ph=tag(n,'p:ph')[0], isTitle=/title|ctrTitle/i.test(at(ph,'type')||''), [x,y,w,h]=box(n,isTitle);
          const fill=tag(n,'p:spPr')[0]; const sf=fill&&[...fill.children].find(e=>e.tagName==='a:solidFill'); const fc=sf&&tag(sf,'a:srgbClr')[0]; if(fc){ g.fillStyle='#'+at(fc,'val'); g.fillRect(x,y,w,h); }
          const tb=tag(n,'p:txBody')[0]; if(!tb) continue; let yy=y+6*k*12700/100;
          for(const p of tag(tb,'a:p')){ const runs=[...tag(p,'a:r')]; const txt=runs.map(r=>(tag(r,'a:t')[0]||{}).textContent||'').join(''); const rp=runs.length?tag(runs[0],'a:rPr')[0]:null; const pt=(+at(rp,'sz')||(isTitle?4000:2400))/100, fs=pt*12700*k;
            const clr=rp&&tag(rp,'a:srgbClr')[0]; g.fillStyle=clr?'#'+at(clr,'val'):'#222'; g.font=`${at(rp,'b')==='1'?'bold ':''}${fs}px "Noto Sans TC","Noto Serif TC",sans-serif`; g.textBaseline='top';
            const algn=at(tag(p,'a:pPr')[0],'algn'), lines=[]; let ln='';
            for(const ch of txt){ if(g.measureText(ln+ch).width>w-8&&ln){ lines.push(ln); ln=ch; } else ln+=ch; } lines.push(ln);
            for(const l of lines){ const lw=g.measureText(l).width, lx=algn==='ctr'?x+(w-lw)/2:algn==='r'?x+w-lw-4:x+4; if(l) g.fillText(l,lx,yy); yy+=fs*1.25; } yy+=fs*.2; } } } };
      await walk(tree); return c; }}; }
  async function show(n){ if(!PJ.src) return; n=Math.max(1,Math.min(PJ.src.total,n)); PJ.busy=true; refreshPanel();
    try{ const im=await PJ.src.render(n); fit(im,im.width,im.height,'#111'); PJ.page=n; PJ.total=PJ.src.total; PJ.has=true; if(!PJ.down) setDown(true,false);
      const c=document.createElement('canvas'); c.width=1280; c.height=720; c.getContext('2d').drawImage(R.PCV,0,0,1280,720); PJ.img=c.toDataURL('image/jpeg',.72);
      send({o:'pj',down:PJ.down,page:PJ.page,total:PJ.total,img:PJ.img}); }
    catch(e){ toast(NT('cls.err',0)); console.warn(e); }
    PJ.busy=false; refreshPanel(); }
  function setDown(v,tell=true){ PJ.down=!!v; if(tell) send({o:'pj',down:PJ.down,page:PJ.page,total:PJ.total}); refreshPanel(); }
  function stop(){ PJ.src=null; PJ.has=false; PJ.img=null; PJ.page=PJ.total=0; R.px.fillStyle='#111'; R.px.fillRect(0,0,1920,1080); R.projTex.needsUpdate=true; send({o:'pj',down:PJ.down,page:0,total:0,img:''}); refreshPanel(); }
  function takeProj(d){ if('down' in d) PJ.down=!!d.down; if(typeof d.img==='string'){ if(d.img){ const im=new Image(); im.onload=()=>{ fit(im,im.width,im.height); PJ.has=true; refreshPanel(); }; im.src=d.img; PJ.img=d.img; } else { PJ.has=false; PJ.img=null; PJ.src=null; R.px.fillStyle='#111'; R.px.fillRect(0,0,1920,1080); R.projTex.needsUpdate=true; } }
    if(d.page!=null){ PJ.page=d.page|0; PJ.total=d.total|0; if(PJ.src&&d.img) PJ.src=null; } refreshPanel(); }
  let laserAt=0; function laserSend(p){ const now=performance.now(); if(p&&now-laserAt<66) return; laserAt=now; send({o:'lz',p:p?[Math.round(p[0]*1e3),Math.round(p[1]*1e3)]:null}); }
  let panelRefs=null;
  function openProj(){ if(renderer.xr.isPresenting){ toast(NT('cls.vr',0)); return; } mode='proj'; const {box,bar}=shell(NT('cls.proj',0));
    const sp=document.createElement('span'); sp.className='sp'; bar.append(sp,btn(NT('cls.ui',1),close));
    const r1=document.createElement('div'); r1.className='row'; const fi=document.createElement('input'); fi.type='file'; fi.accept='.pdf,.ppt,.pptx,image/*'; fi.hidden=true;
    const st=document.createElement('span'); st.className='note'; st.style.margin='0';
    const load=async(getter)=>{ st.textContent=NT('cls.loading',0); try{ const {f,name}=await getter(); PJ.src=await loadFile(f,name); st.textContent=''; await show(1); }catch(e){ st.textContent=String(e&&e.message||NT('cls.err',0)); } };
    fi.onchange=()=>{ const f=fi.files&&fi.files[0]; fi.value=''; if(f) load(async()=>({f})); };
    const url=document.createElement('input'); url.type='text'; url.placeholder='https://…'; url.onkeydown=e=>{ if(e.key==='Enter'&&!e.isComposing) lb.click(); };
    const lb=btn(NT('cls.file',1),()=>{ const u=url.value.trim(); if(!/^https?:\/\//.test(u)) return; load(async()=>{ let r; try{ r=await fetch(u); }catch{ throw new Error(NT('cls.urlerr',0)); } if(!r.ok) throw new Error(NT('cls.urlerr',0)); const b=await r.blob(); return {f:b,name:u.split(/[?#]/)[0]}; }); });
    r1.append(fi,btn(NT('cls.file',0),()=>fi.click()),url,lb); box.append(r1);
    const pv=document.createElement('div'); pv.className='pv'; pv.style.marginTop='8px'; const pc=document.createElement('canvas'); pc.width=960; pc.height=540; pv.append(pc); box.append(pv);
    const r2=document.createElement('div'); r2.className='row';
    const prev=btn(NT('cls.nav',0),()=>show(PJ.page-1)), next=btn(NT('cls.nav',1),()=>show(PJ.page+1));
    const pn=document.createElement('input'); pn.type='number'; pn.min=1; pn.style.width='4.5em'; pn.onchange=()=>show(+pn.value||1); const pt=document.createElement('span');
    const sb=btn('',()=>setDown(!PJ.down)); const lzl=document.createElement('label'); const lzc=document.createElement('input'); lzc.type='checkbox'; lzc.checked=LZ.on; lzc.onchange=()=>{ LZ.on=lzc.checked; pv.classList.toggle('lz',LZ.on); if(!LZ.on) laserSend(null); }; lzl.append(lzc,' '+NT('cls.laser',0));
    const off=btn(NT('cls.laser',1),stop);
    r2.append(prev,pn,pt,next,sb,lzl,off,st); box.append(r2);
    const note=document.createElement('div'); note.className='note'; note.textContent=NT('cls.projhint',0); box.append(note);
    pv.onpointermove=e=>{ if(!LZ.on) return; const r=pc.getBoundingClientRect(), p=[(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height]; LZ.x=p[0]; LZ.y=p[1]; LZ.show=true; LZ.t=performance.now(); laserSend(p); refreshPanel(); };
    pv.onpointerleave=()=>{ if(LZ.on){ LZ.show=false; laserSend(null); } };
    panelRefs={pc,prev,next,pn,pt,sb,off}; refreshPanel(); }
  function refreshPanel(){ const P=panelRefs; if(!P||mode!=='proj'||!P.pc.isConnected) return; const g=P.pc.getContext('2d'); g.drawImage(R.PCV,0,0,960,540);
    if(LZ.on&&LZ.show){ g.fillStyle='rgba(255,40,30,.9)'; g.beginPath(); g.arc(LZ.x*960,LZ.y*540,6,0,7); g.fill(); }
    const local=!!PJ.src; P.prev.disabled=!local||PJ.busy||PJ.page<=1; P.next.disabled=!local||PJ.busy||PJ.page>=PJ.total; P.pn.disabled=!local; P.pn.value=PJ.page||''; P.pn.max=PJ.total||1;
    P.pt.textContent=PJ.total?'/ '+PJ.total:''; P.sb.textContent=NT('cls.screen',PJ.down?1:0); P.off.disabled=!PJ.has; }
  // ---- keys while a panel is open: none reach the house (no walking off while typing); Esc closes, arrows turn pages
  addEventListener('keydown',e=>{ if(!mode) return; const inText=e.target&&(e.target.tagName==='TEXTAREA'||e.target.tagName==='INPUT');
    if(e.key==='Escape'){ e.preventDefault(); if(ta&&e.target===ta){ ta.value=''; commitText(); } else close(); }
    else if(e.target===ta&&e.key==='Enter'&&!e.shiftKey&&!e.isComposing&&e.keyCode!==229){ e.preventDefault(); commitText(); }
    else if(mode==='proj'&&!inText&&PJ.src&&(e.key==='ArrowLeft'||e.key==='ArrowRight'||e.key==='PageUp'||e.key==='PageDown')){ e.preventDefault(); show(PJ.page+(e.key==='ArrowLeft'||e.key==='PageUp'?-1:1)); }
    e.stopImmediatePropagation(); },true);
  addEventListener('keyup',e=>{ if(mode) e.stopImmediatePropagation(); },true);
  // ---- in the room: the screen rolls, the lever follows it, the beam and the laser dot, the board's texture refreshes
  ZL_ANIM.push(dt=>{ dt=dt||.016; if(dirty){ R.boardTex.needsUpdate=true; dirty=false; }
    const want=PJ.down?1:0; PJ.k+=Math.sign(want-PJ.k)*Math.min(Math.abs(want-PJ.k),dt*.55);
    const k=PJ.k, s=R.scr; s.visible=k>.005; s.scale.y=Math.max(.001,k); R.bar.position.y=R.STOP-R.SH*k-.016;
    const full=k>.995&&PJ.has; if((s.material.map===R.projTex)!==full){ s.material.map=full?R.projTex:null; s.material.color.setHex(full?0xffffff:0xe9e6de); s.material.needsUpdate=true; }
    R.beam.visible=full; R.lever.rotation.z+=((PJ.down?-.9:.9)-R.lever.rotation.z)*Math.min(1,dt*8);
    const lm=R.lap.m, la=PJ.has; if((lm.map===R.projTex)!==la){ lm.map=la?R.projTex:null; lm.color.setHex(la?0xffffff:0x1b2026); lm.needsUpdate=true; }
    R.lamps[2].intensity=R.base[2]*(full?.5:1);
    const L2=LZ.on&&LZ.show&&performance.now()-LZ.t<4000?LZ:(LZ.remote&&performance.now()-LZ.rt<4000?LZ.remote:null);
    R.laser.visible=!!(L2&&full); if(R.laser.visible){ R.laser.position.set(R.XC+R.SW/2-L2.x*R.SW,R.STOP-L2.y*R.SH,R.SZ-.004); R.laser.scale.setScalar(.8+Math.sin(performance.now()/90)*.12); } });
  // ---- the network: what others do, and handing the board over to someone who has just arrived
  let helloAt=0, snapFor=new Map();
  window.__clsHello=()=>{ helloAt=Date.now(); send({o:'hi'}); };
  window.__clsRecv=(d,from)=>{ if(!d||d.k!=='cls') return;
    if(d.o==='hi'){ if(!ST.ops.length&&!PJ.has&&!PJ.down) return; const ids=[...((NET.peers&&NET.peers.keys&&NET.peers.keys())||[])].filter(i=>i!==from).concat(MY_PID).sort(), rank=Math.max(0,ids.indexOf(MY_PID));
      clearTimeout(snapFor.get(from)); snapFor.set(from,setTimeout(()=>{ snapFor.delete(from); sendSnap(from); },120+rank*450+Math.random()*150)); return; }
    if(d.o==='snap'){ if(d.for&&snapFor.has(d.for)){ clearTimeout(snapFor.get(d.for)); snapFor.delete(d.for); } if(d.for!==MY_PID) return;
      if(Array.isArray(d.ops)){ ST.ops=d.ops.filter(o=>o&&o.id); ST.mine=[]; IMG.clear(); redraw(); } if(d.pj) takeProj(d.pj); return; }
    if(d.o==='pj'){ takeProj(d); return; }
    if(d.o==='lz'){ LZ.remote=d.p?{x:d.p[0]/1e3,y:d.p[1]/1e3}:null; LZ.rt=performance.now(); return; }
    apply(d,from); };
  function sendSnap(to){ let ops=ST.ops; const pj={down:PJ.down,page:PJ.page,total:PJ.total,img:PJ.img||''};
    let s=JSON.stringify({ops,pj}); if(s.length>700000){ const c=document.createElement('canvas'); c.width=1600; c.height=625; c.getContext('2d').drawImage(R.BCV,0,0,1600,625);
      ops=[{t:'i',id:uid(),u:'',raster:1,x:0,y:0,w:1e4,h:1e4,src:c.toDataURL('image/jpeg',.8)},...ST.ops.filter(o=>o.t==='t').map(o=>({...o,nd:1}))]; }
    send({o:'snap',for:to,ops,pj}); }
  window.__clsAct=u=>{ if(u.type==='clsboard') openBoard(); else if(u.type==='clslaptop'||u.type==='clsproj') openProj(); else if(u.type==='clsscreen'){ setDown(!PJ.down); toast(NT('cls.screened',PJ.down?0:1)); } return true; };
  window.__cls={ST,PJ,LZ,openBoard,openProj,close,apply,show,boardText};
}
// {% endraw %}
