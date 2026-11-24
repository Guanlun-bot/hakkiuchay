// {% raw %}
/* ================= 全鄉地圖（N）、飛行、傳送門 =================
   N opens the whole of 斗安鄉 as a map, north up, drawn from the same data the land is made of (TWP): the ground shaded
   by its height, the rivers, 斗灣潭 and the sea, the roads, the branch line and the 縱貫線, the villages, temples and
   stations, you and the others. Its scale bar is true (the land is built at full size). Click a place (or pick one
   from the list) and 「傳送」 takes you there through a portal: a ring of light where you stand and where you come out,
   which the others in the room see too.
   Flying: press Space twice quickly to take off or to land; Space climbs, Z sinks, Shift is fast. Others see you in
   the air. On a phone: the 飛行 / 地圖 buttons. Words in _data/vr.yml › npc (tmap.*, fly.*, tp.*, twp.<place>). */
{
const R2=Math.SQRT1_2;
const PN=id=>NT('twp.'+id)||id, PD=id=>NT('twp.'+id,1)||'';
// ---- the portal: a ring of light, a column, sparks; seen by everyone in the room
const PORTAL=(()=>{ const live=[];
  const glowT=textCanvas(64,256,(g,w,h)=>{ const gr=g.createLinearGradient(0,h,0,0); gr.addColorStop(0,'rgba(255,240,200,.9)'); gr.addColorStop(.3,'rgba(180,220,255,.45)'); gr.addColorStop(1,'rgba(160,200,255,0)'); g.fillStyle=gr; g.fillRect(0,0,w,h); });
  const burst=(x,z)=>{ const y=floorY(x,z), G=new THREE.Group(); G.position.set(x,y,z); scene.add(G);
    const ringM=new THREE.MeshBasicMaterial({color:0xbfe3ff,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
    const ring=new THREE.Mesh(new THREE.TorusGeometry(1,.06,8,48),ringM); ring.rotation.x=Math.PI/2; ring.position.y=.05; G.add(ring);
    const ring2=new THREE.Mesh(new THREE.TorusGeometry(1,.03,6,48),ringM.clone()); ring2.rotation.x=Math.PI/2; ring2.position.y=1.1; G.add(ring2);
    const colM=new THREE.MeshBasicMaterial({map:glowT,transparent:true,opacity:.0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
    const col=new THREE.Mesh(new THREE.CylinderGeometry(.9,.9,6,24,1,true),colM); col.position.y=3; G.add(col);
    const N=90, pos=new Float32Array(N*3), vel=[]; for(let i=0;i<N;i++){ const a=Math.random()*6.283, r=.2+Math.random()*.9; pos.set([Math.cos(a)*r,Math.random()*.4,Math.sin(a)*r],i*3); vel.push([Math.cos(a)*(.3+Math.random()),1.5+Math.random()*3,Math.sin(a)*(.3+Math.random())]); }
    const pg=new THREE.BufferGeometry(); pg.setAttribute('position',new THREE.BufferAttribute(pos,3));
    const pm=new THREE.PointsMaterial({color:0xe8f4ff,size:.12,transparent:true,opacity:1,blending:THREE.AdditiveBlending,depthWrite:false}); const pts=new THREE.Points(pg,pm); G.add(pts);
    const light=new THREE.PointLight(0xbfe3ff,0,14,2); light.position.y=1.5; G.add(light);
    live.push({G,ring,ring2,col,pts,pos,vel,light,t0:performance.now()}); };
  ZL_ANIM.push(dt=>{ dt=dt||.016; const now=performance.now();
    for(let i=live.length-1;i>=0;i--){ const P=live[i], k=(now-P.t0)/1600;
      if(k>=1){ scene.remove(P.G); P.G.traverse(o=>{ if(o.geometry) o.geometry.dispose(); if(o.material) o.material.dispose(); }); live.splice(i,1); continue; }
      const out=Math.sin(Math.min(1,k*1.4)*Math.PI);
      P.ring.scale.setScalar(.4+k*2.2); P.ring.material.opacity=.9*(1-k); P.ring2.scale.setScalar(1.6-k); P.ring2.position.y=.3+k*2.6; P.ring2.material.opacity=.7*(1-k);
      P.col.material.opacity=.75*out; P.col.scale.set(1-.6*k,1,1-.6*k); P.light.intensity=6*out;
      for(let j=0;j<P.vel.length;j++){ P.pos[j*3]+=P.vel[j][0]*dt; P.pos[j*3+1]+=P.vel[j][1]*dt; P.pos[j*3+2]+=P.vel[j][2]*dt; } P.pts.geometry.attributes.position.needsUpdate=true; P.pts.material.opacity=1-k; } });
  // the screen: a swirl closing in, a flash, opening out
  const fx=document.createElement('div'); fx.id='tpfx'; document.body.appendChild(fx);
  const st=document.createElement('style'); st.textContent=`#tpfx{position:fixed;inset:0;pointer-events:none;z-index:60;opacity:0;
    background:radial-gradient(circle at 50% 50%,rgba(255,255,255,0) 0,rgba(255,255,255,0) var(--r),rgba(205,232,255,.92) calc(var(--r) + 6%),rgba(12,26,48,.96) calc(var(--r) + 30%)),
      repeating-conic-gradient(from var(--a),rgba(170,210,255,.0) 0deg,rgba(170,210,255,.28) 8deg,rgba(170,210,255,0) 16deg);background-blend-mode:screen}
    #tpfx.go{animation:tpin .65s ease-in forwards} #tpfx.back{animation:tpout .8s ease-out forwards}
    @property --r{syntax:'<percentage>';inherits:false;initial-value:120%} @property --a{syntax:'<angle>';inherits:false;initial-value:0deg}
    @keyframes tpin{0%{opacity:0;--r:120%;--a:0deg}100%{opacity:1;--r:0%;--a:200deg}} @keyframes tpout{0%{opacity:1;--r:0%;--a:200deg;filter:brightness(2.2)}100%{opacity:0;--r:130%;--a:420deg;filter:brightness(1)}}`;
  document.head.appendChild(st);
  // where to come out: the nearest place you can stand (a spiral out to 60 m)
  const spot=(x,z)=>{ if(walkable(x,z)) return {x,z}; for(let r=1.5;r<=60;r+=1.5) for(let a=0;a<6.283;a+=Math.max(.12,1.5/r)){ const px=x+Math.cos(a)*r, pz=z+Math.sin(a)*r; if(walkable(px,pz)) return {x:px,z:pz}; } return null; };
  let busy=false;
  const go=(x,z,name)=>{ if(busy) return false; const to=spot(x,z); if(!to){ toast(NT('tmap.far'),3500); return false; } busy=true;
    const from={x:ME.x,z:ME.z}; burst(from.x,from.z); try{ NET.bcast&&NET.bcast({k:'tp',a:[+from.x.toFixed(1),+from.z.toFixed(1)],b:[+to.x.toFixed(1),+to.z.toFixed(1)]}); }catch{}
    fx.className=''; void fx.offsetWidth; fx.className='go';
    setTimeout(()=>{ if(ME.seat>=0) standUp(); ME.x=to.x; ME.z=to.z; ME.path=[]; ME.targetYaw=null; ME.afterArrive=null; if(ME.fly) ME.fy=floorY(to.x,to.z)+1.6; ME.eb=floorY(to.x,to.z)+1.6; ME.jv=0; ME.jy=0;
      if(VIEW.mode!=='walk') setView('walk'); pushPresence(true); burst(to.x,to.z); fx.className='back'; if(name) toast(NT('tp.arrive').replace('{地}',name),3500); setTimeout(()=>{ busy=false; },900); },680);
    return true; };
  window.__tpRecv=(d)=>{ if(!d||d.k!=='tp'||!Array.isArray(d.a)||!Array.isArray(d.b)) return; const ok=v=>Array.isArray(v)&&v.length===2&&v.every(n=>typeof n==='number'&&isFinite(n));
    if(!ok(d.a)||!ok(d.b)) return; burst(d.a[0],d.a[1]); setTimeout(()=>burst(d.b[0],d.b[1]),680); };
  return {burst,go}; })();
window.__portal=PORTAL;

// ---- the map
const TMAP=(()=>{ const MX0=-1600, MY0=-60, MX1=1080, MY1=720, K=1.1;   /* west to 三叉嶺 */   // the map's area (map units) and its base resolution (px a unit)
  const BW=Math.round((MX1-MX0)*K), BH=Math.round((MY1-MY0)*K);
  let base=null, open=false, zoom=1, cam={x:0,y:0}, sel=null, drag=null, moved=false;
  const box=document.createElement('div'); box.id='tmap'; box.innerHTML=`<div class="tm-head"><b></b><span></span><button class="tm-x" type="button"></button></div><div class="tm-body"><canvas></canvas><div class="tm-list"></div></div><div class="tm-pop"></div>`;
  document.body.appendChild(box);
  const st=document.createElement('style'); st.textContent=`#tmap{position:fixed;inset:4vh 4vw;z-index:55;display:none;flex-direction:column;background:var(--paper,#f4f1ea);color:var(--ink,#2b2622);border:1px solid rgba(0,0,0,.25);box-shadow:0 10px 40px rgba(0,0,0,.35);font-family:"Noto Serif TC",serif}
    #tmap.on{display:flex} #tmap .tm-head{display:flex;align-items:baseline;gap:1em;padding:.5em .9em;border-bottom:1px solid rgba(0,0,0,.15)} #tmap .tm-head b{font-size:1.1em;letter-spacing:.15em} #tmap .tm-head span{font-size:.8em;opacity:.7;flex:1}
    #tmap .tm-x{font:inherit;background:none;border:1px solid rgba(0,0,0,.3);padding:.15em .8em;cursor:pointer;color:inherit}
    #tmap .tm-body{flex:1;display:flex;min-height:0} #tmap canvas{flex:1;min-width:0;cursor:crosshair;touch-action:none;background:#dfe6e4}
    #tmap .tm-list{width:13em;overflow:auto;border-left:1px solid rgba(0,0,0,.15);font-size:.85em;padding:.4em .6em} #tmap .tm-list h4{margin:.8em 0 .2em;font-size:.95em;letter-spacing:.1em;opacity:.75}
    #tmap .tm-list a{display:block;padding:.12em 0;color:inherit;text-decoration:none;cursor:pointer} #tmap .tm-list a:hover{color:#a8343a}
    #tmap .tm-pop{position:absolute;display:none;background:var(--paper,#f4f1ea);border:1px solid rgba(0,0,0,.3);padding:.5em .7em;font-size:.85em;max-width:18em;box-shadow:0 4px 14px rgba(0,0,0,.25)}
    #tmap .tm-pop b{display:block;margin-bottom:.2em} #tmap .tm-pop button{margin-top:.5em;font:inherit;background:#a8343a;color:#fff;border:0;padding:.25em .9em;cursor:pointer}
    @media (max-width:700px){ #tmap{inset:0} #tmap .tm-list{display:none} }
    #flybtns{position:fixed;left:10px;bottom:150px;z-index:40;display:flex;flex-direction:column;gap:6px} #flybtns button{font:14px "Noto Serif TC",serif;padding:.45em .7em;background:rgba(244,241,234,.85);border:1px solid rgba(0,0,0,.25);color:#2b2622}`;
  document.head.appendChild(st);
  const cv=box.querySelector('canvas'), g=cv.getContext('2d'), pop=box.querySelector('.tm-pop');
  const toB=(mx,my)=>[(mx-MX0)*K,(my-MY0)*K];
  // the base: the ground shaded by height (light from the north-west), the water, the lines, the names
  function makeBase(){ const c=document.createElement('canvas'); c.width=BW; c.height=BH; const b=c.getContext('2d');
    const s=2, w=Math.ceil(BW/s), h=Math.ceil(BH/s), img=b.createImageData(w,h), H=new Float32Array(w*h);
    for(let j=0;j<h;j++) for(let i=0;i<w;i++){ const mx=MX0+i*s/K, my=MY0+j*s/K, [x,z]=TWP.m2l(mx,my); H[j*w+i]=TWP.heightAt(x,z); }
    const stepM=s/K*TWP.S;
    const ramp=[[-60,[118,160,190]],[0,[170,205,222]],[.01,[196,214,170]],[20,[206,220,170]],[60,[222,222,170]],[120,[228,212,160]],[300,[208,186,140]],[800,[180,156,120]],[1600,[160,146,128]],[2600,[220,220,214]]];
    const colAt=e=>{ for(let k=1;k<ramp.length;k++) if(e<ramp[k][0]){ const [e0,c0]=ramp[k-1], [e1,c1]=ramp[k], t=(e-e0)/(e1-e0); return c0.map((v,q)=>v+(c1[q]-v)*t); } return ramp[ramp.length-1][1]; };
    for(let j=0;j<h;j++) for(let i=0;i<w;i++){ const k=j*w+i, e=H[k], ex=(H[j*w+Math.min(w-1,i+1)]-H[j*w+Math.max(0,i-1)])/(2*stepM), ey=(H[Math.min(h-1,j+1)*w+i]-H[Math.max(0,j-1)*w+i])/(2*stepM);
      const nx=-ex, ny=-ey, nz=1, l=Math.hypot(nx,ny,nz), sh=e<0?1:Math.max(.55,Math.min(1.25,.85+.6*((nx*-.6+ny*-.6)/l*.9+nz/l*.3-.3)));
      const c0=colAt(e); img.data[k*4]=c0[0]*sh; img.data[k*4+1]=c0[1]*sh; img.data[k*4+2]=c0[2]*sh; img.data[k*4+3]=255; }
    const tmp=document.createElement('canvas'); tmp.width=w; tmp.height=h; tmp.getContext('2d').putImageData(img,0,0); b.imageSmoothingEnabled=true; b.drawImage(tmp,0,0,BW,BH);
    const path=P=>{ b.beginPath(); P.forEach(([x,z],i)=>{ const [mx,my]=TWP.l2m(x,z), [X,Y]=toB(mx,my); i?b.lineTo(X,Y):b.moveTo(X,Y); }); };
    b.lineJoin=b.lineCap='round';
    // water
    b.fillStyle='rgb(150,195,220)'; path(TWP.POOL_L); b.closePath(); b.fill();
    for(const R of TWP.RIVERS){ b.strokeStyle='rgb(120,175,210)'; b.lineWidth=Math.max(1.2,R.hw*2/TWP.S*K); path(R.P); b.stroke(); }
    // roads, the lines
    for(const R of TWP.ROADS){ b.strokeStyle=R.street?'rgba(60,50,45,.85)':R.id==='hw'?'rgba(200,70,50,.9)':'rgba(200,120,60,.85)'; b.lineWidth=R.id==='hw'?2.4:R.street?2.2:1.6; path(R.P); b.stroke(); }
    const rail=(P,w)=>{ b.strokeStyle='#1d2226'; b.lineWidth=w; path(P); b.stroke(); b.strokeStyle='#f4f1ea'; b.lineWidth=w*.45; b.setLineDash([6,6]); path(P); b.stroke(); b.setLineDash([]); };
    rail(TWP.TRUNK,4); rail(TWP.RAIL,3);
    return c; }
  const font=(px,bold)=>`${bold?700:400} ${px}px "Noto Serif TC",serif`;
  function view(){ const r=cv.getBoundingClientRect(), dpr=Math.min(2,devicePixelRatio||1); if(cv.width!==Math.round(r.width*dpr)||cv.height!==Math.round(r.height*dpr)){ cv.width=Math.round(r.width*dpr); cv.height=Math.round(r.height*dpr); } return {w:cv.width,h:cv.height,dpr}; }
  const scr=(mx,my,V)=>{ const [bx,by]=toB(mx,my); return [(bx-cam.x)*zoom*V.dpr+V.w/2,(by-cam.y)*zoom*V.dpr+V.h/2]; };
  const unscr=(sx,sy,V)=>{ const bx=(sx-V.w/2)/(zoom*V.dpr)+cam.x, by=(sy-V.h/2)/(zoom*V.dpr)+cam.y; return [bx/K+MX0,by/K+MY0]; };
  const SYM={town:'■',vil:'■',school:'■',temple:'卍',church:'✝',station:'●',sight:'△',house:'◆'};
  function draw(){ if(!open) return; if(!base) base=makeBase(); const V=view(); g.setTransform(1,0,0,1,0,0); g.fillStyle='#c9dbe3'; g.fillRect(0,0,V.w,V.h);
    const [ox,oy]=scr(MX0,MY0,V); g.imageSmoothingEnabled=true; g.drawImage(base,ox,oy,BW*zoom*V.dpr,BH*zoom*V.dpr);
    // names: villages always, the rest as you come closer
    g.textBaseline='middle'; const z=zoom;
    for(const p of TWP.PLACES){ const show=p.kind==='town'||p.kind==='vil'||p.kind==='house'||(p.kind==='station'&&z>.9)||z>1.6; if(!show) continue;
      const [X,Y]=scr(p.mx,p.my,V), big=p.kind==='town', px=(big?16:p.kind==='vil'||p.kind==='house'?12.5:11)*V.dpr*Math.min(1.4,Math.max(.85,Math.sqrt(z)));
      g.font=font(px*.9,true); g.fillStyle=p.kind==='house'?'#a8343a':p.kind==='temple'||p.kind==='church'?'#7a1f5c':p.kind==='station'?'#1d2226':'#2b2622'; g.textAlign='center'; g.fillText(SYM[p.kind]||'■',X,Y);
      g.font=font(px,big||p.kind==='house'); g.textAlign='left'; g.lineWidth=3*V.dpr; g.strokeStyle='rgba(244,241,234,.85)'; const t=PN(p.id); g.strokeText(t,X+px*.8,Y); g.fillText(t,X+px*.8,Y); }
    // the others, you
    for(const [,o] of others){ const p=o.av&&o.av.g.position; if(!p) continue; const [mx,my]=TWP.l2m(p.x,p.z), [X,Y]=scr(mx,my,V); g.fillStyle=/^#[0-9a-f]{6}$/i.test(o.p.c)?o.p.c:'#888'; g.beginPath(); g.arc(X,Y,5*V.dpr,0,6.283); g.fill(); g.lineWidth=1.5*V.dpr; g.strokeStyle='#fff'; g.stroke(); }
    { const [mx,my]=TWP.l2m(ME.x,ME.z), [X,Y]=scr(mx,my,V), fx=-Math.sin(ME.yaw), fz=-Math.cos(ME.yaw), E=(fx+fz)*R2, N=(fx-fz)*R2, a=Math.atan2(-N,E);
      g.fillStyle='rgba(168,52,58,.28)'; g.beginPath(); g.moveTo(X,Y); g.arc(X,Y,34*V.dpr,a-.5,a+.5); g.closePath(); g.fill();
      g.fillStyle='#a8343a'; g.beginPath(); g.arc(X,Y,6*V.dpr,0,6.283); g.fill(); g.lineWidth=2*V.dpr; g.strokeStyle='#fff'; g.stroke(); }
    if(sel){ const [X,Y]=scr(sel.mx,sel.my,V); g.strokeStyle='#a8343a'; g.lineWidth=2*V.dpr; g.beginPath(); g.arc(X,Y,11*V.dpr,0,6.283); g.stroke(); g.beginPath(); g.moveTo(X-16*V.dpr,Y); g.lineTo(X+16*V.dpr,Y); g.moveTo(X,Y-16*V.dpr); g.lineTo(X,Y+16*V.dpr); g.stroke(); }
    // the scale bar (true: one map unit is TWP.S metres) and the north arrow
    { const mPerPx=TWP.S/(K*zoom*V.dpr), want=150*V.dpr*mPerPx, nice=[50,100,200,500,1000,2000,5000,10000].find(v=>v>=want*.6)||10000, L=nice/mPerPx, x0=24*V.dpr, y0=V.h-28*V.dpr, U=(NT('tmap.scale')||'公尺,公里').split(/[,，]/);
      g.fillStyle='rgba(244,241,234,.85)'; g.fillRect(x0-10*V.dpr,y0-22*V.dpr,L+80*V.dpr,36*V.dpr);
      g.strokeStyle='#2b2622'; g.lineWidth=2*V.dpr; g.beginPath(); g.moveTo(x0,y0); g.lineTo(x0+L,y0); g.moveTo(x0,y0-6*V.dpr); g.lineTo(x0,y0+6*V.dpr); g.moveTo(x0+L/2,y0-4*V.dpr); g.lineTo(x0+L/2,y0+4*V.dpr); g.moveTo(x0+L,y0-6*V.dpr); g.lineTo(x0+L,y0+6*V.dpr); g.stroke();
      g.fillStyle='#2b2622'; g.font=font(12*V.dpr); g.textAlign='left'; g.fillText(nice>=1000?(nice/1000)+' '+(U[1]||'km'):nice+' '+(U[0]||'m'),x0+L+8*V.dpr,y0);
      const nx=V.w-34*V.dpr, ny=46*V.dpr; g.fillStyle='rgba(244,241,234,.85)'; g.beginPath(); g.arc(nx,ny,24*V.dpr,0,6.283); g.fill(); g.fillStyle='#2b2622'; g.beginPath(); g.moveTo(nx,ny-18*V.dpr); g.lineTo(nx+7*V.dpr,ny+8*V.dpr); g.lineTo(nx,ny+3*V.dpr); g.lineTo(nx-7*V.dpr,ny+8*V.dpr); g.closePath(); g.fill(); g.font=font(12*V.dpr,true); g.textAlign='center'; g.fillText('北',nx,ny+17*V.dpr); } }
  // the list of places
  function list(){ const L=box.querySelector('.tm-list'), groups=(NT('tmap.groups')||'聚落,廟宇與教會,車站,名勝').split(/[,，]/), K2=[['town','vil','house'],['temple','church'],['station'],['sight','school']];
    L.innerHTML=K2.map((ks,i)=>`<h4>${esc(groups[i]||'')}</h4>`+TWP.PLACES.filter(p=>ks.includes(p.kind)).map(p=>`<a data-id="${p.id}">${esc(PN(p.id))}</a>`).join('')).join('');
    L.onclick=e=>{ const a=e.target.closest('a'); if(!a) return; const p=TWP.place(a.dataset.id); if(!p) return; cam={...(([bx,by])=>({x:bx,y:by}))(toB(p.mx,p.my))}; zoom=Math.max(zoom,1.6); select(p.mx,p.my,p); }; }
  function select(mx,my,p){ const [x,z]=TWP.m2l(mx,my); sel={mx,my,x,z,p}; const V=view(), [X,Y]=scr(mx,my,V), r=cv.getBoundingClientRect(), br=box.getBoundingClientRect();
    const e=Math.round(TWP.heightAt(x,z)); pop.innerHTML=`<b>${esc(p?PN(p.id):NT('tmap.spot')||'')}</b>${p&&PD(p.id)?`<div>${esc(PD(p.id))}</div>`:''}<div style="opacity:.7">${esc((NT('tmap.elev')||'海拔 {高} 公尺').replace('{高}',e))}</div><button type="button">${esc(NT('tmap.go')||'傳送')}</button>`;
    pop.style.display='block'; pop.style.left=Math.min(br.width-260,Math.max(8,X/V.dpr+r.left-br.left+14))+'px'; pop.style.top=Math.min(br.height-140,Math.max(40,Y/V.dpr+r.top-br.top+14))+'px';
    pop.querySelector('button').onclick=()=>{ const name=p?PN(p.id):''; if(PORTAL.go(x,z,name)) close(); }; }
  const nearest=(mx,my,V)=>{ let best=null, bd=22*V.dpr; for(const p of TWP.PLACES){ const [X,Y]=scr(p.mx,p.my,V), [sx,sy]=scr(mx,my,V), d=Math.hypot(X-sx,Y-sy); if(d<bd){ bd=d; best=p; } } return best; };
  cv.addEventListener('pointerdown',e=>{ drag={x:e.clientX,y:e.clientY,cx:cam.x,cy:cam.y}; moved=false; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove',e=>{ if(!drag) return; const dx=e.clientX-drag.x, dy=e.clientY-drag.y; if(Math.hypot(dx,dy)>4) moved=true; if(moved){ cam.x=drag.cx-dx/zoom; cam.y=drag.cy-dy/zoom; pop.style.display='none'; } });
  cv.addEventListener('pointerup',e=>{ const was=drag; drag=null; if(!was||moved) return; const V=view(), r=cv.getBoundingClientRect(), sx=(e.clientX-r.left)*V.dpr, sy=(e.clientY-r.top)*V.dpr, [mx,my]=unscr(sx,sy,V), p=nearest(mx,my,V); select(p?p.mx:mx,p?p.my:my,p); });
  cv.addEventListener('wheel',e=>{ e.preventDefault(); const V=view(), r=cv.getBoundingClientRect(), sx=(e.clientX-r.left)*V.dpr, sy=(e.clientY-r.top)*V.dpr, [mx,my]=unscr(sx,sy,V), k=Math.exp(-e.deltaY*.0015); zoom=Math.min(12,Math.max(.15,zoom*k));
    const [bx,by]=toB(mx,my); cam.x=bx-(sx-V.w/2)/(zoom*V.dpr); cam.y=by-(sy-V.h/2)/(zoom*V.dpr); pop.style.display='none'; },{passive:false});
  box.querySelector('.tm-x').onclick=()=>close();
  function show(){ open=true; box.classList.add('on'); box.querySelector('.tm-head b').textContent=NT('tmap.title')||'斗安鄉全圖'; box.querySelector('.tm-head span').textContent=NT('tmap.title',1)||''; box.querySelector('.tm-x').textContent=NT('tmap.close')||'關閉';
    try{ document.exitPointerLock?.(); }catch{} list(); const V=view(); cam={x:(500-MX0)*K,y:(330-MY0)*K}; zoom=Math.min(V.w/(1180*K*V.dpr),V.h/(780*K*V.dpr)); if(!(zoom>0)) zoom=1;   /* the whole township at first */ sel=null; pop.style.display='none'; }
  function close(){ open=false; box.classList.remove('on'); pop.style.display='none'; }
  const toggle=()=>open?close():show();
  ZL_ANIM.push(()=>{ if(open) draw(); });
  addEventListener('keydown',e=>{ if(e.key==='Escape'&&open) close(); });
  return {toggle,show,close,isOpen:()=>open}; })();
window.__tmap=TMAP;

// ---- flying
ME.fly=false; ME.fy=0;
const FLY={last:0,up:false,down:false};
const setFly=on=>{ if(!!on===ME.fly) return;
  if(on){ if(ME.seat>=0) standUp(); ME.fly=true; ME.fy=(ME.eye||floorY(ME.x,ME.z)+1.6)+.4; ME.jv=0; ME.jy=0; if(ME.crouch) ME.crouch=false; toast(NT('fly.on'),5000); }
  else { if(!walkable(ME.x,ME.z)){ toast(NT('fly.nofloor'),3500); return; } ME.fly=false; ME.eb=ME.fy; toast(NT('fly.off'),2000); }
  flyBtns(); pushPresence(true); };
window.__setFly=setFly;
addEventListener('keydown',e=>{ if(e.target.tagName==='INPUT'||e.target.tagName==='SELECT'||e.target.tagName==='TEXTAREA') return; if(!window.__entered) return;
  if(e.key===' '){ const now=e.timeStamp||performance.now(); if(!e.repeat&&now-FLY.last<320){ FLY.last=0; FLY.up=false; setFly(!ME.fly); e.preventDefault(); e.stopImmediatePropagation(); return; } if(!e.repeat) FLY.last=now;
    if(ME.fly){ FLY.up=true; e.preventDefault(); e.stopImmediatePropagation(); } return; }
  if(ME.fly&&e.key.toLowerCase()==='z'){ FLY.down=true; e.preventDefault(); e.stopImmediatePropagation(); return; }
  if(e.key.toLowerCase()==='n'&&!e.repeat&&!e.ctrlKey&&!e.metaKey){ e.preventDefault(); e.stopImmediatePropagation(); TMAP.toggle(); } },true);
addEventListener('keyup',e=>{ if(e.key===' ') FLY.up=false; if(e.key.toLowerCase()==='z') FLY.down=false; });
addEventListener('blur',()=>{ FLY.up=FLY.down=false; });
window.__flyStep=dt=>{ const v=(keys.has('shift')?40:8)*dt; if(FLY.up) ME.fy+=v; if(FLY.down) ME.fy-=v; const fl=floorY(ME.x,ME.z)+.9; if(ME.fy<fl) ME.fy=fl; if(ME.fy>3500) ME.fy=3500; };
// phones: buttons for the map and for flying (hold ▲ ▼ to climb and sink)
const FB=document.createElement('div'); FB.id='flybtns'; if(isTouch) document.body.appendChild(FB);
function flyBtns(){ if(!isTouch) return; FB.innerHTML=`<button type="button" data-k="map">${esc(NT('tmap.btn')||'地圖')}</button><button type="button" data-k="fly">${esc(NT('fly.btn',ME.fly?1:0)||'飛行')}</button>`+(ME.fly?`<button type="button" data-k="up">▲</button><button type="button" data-k="down">▼</button>`:''); }
FB.addEventListener('click',e=>{ const k=e.target.dataset&&e.target.dataset.k; if(k==='map') TMAP.toggle(); if(k==='fly') setFly(!ME.fly); });
for(const [ev,on] of [['pointerdown',true],['pointerup',false],['pointerleave',false],['pointercancel',false]]) FB.addEventListener(ev,e=>{ const k=e.target.dataset&&e.target.dataset.k; if(k==='up') FLY.up=on; if(k==='down') FLY.down=on; });
flyBtns(); FB.style.display='none';
// each frame: the buttons only once inside; the sky's sun and moon go with the eye; the near plane opens out up high
const _sd=new THREE.Vector3(), _cp=new THREE.Vector3(); let nearNow=camera.near;
ZL_ANIM.push(()=>{ FB.style.display=window.__entered&&!renderer.xr.isPresenting?'flex':'none';
  camera.getWorldPosition(_cp);
  _sd.copy(daylight.position).sub(daylight.target.position).normalize(); sunDisk.position.copy(_sd).multiplyScalar(86).add(_cp);
  if(moon.userData.lastSet&&moon.position.equals(moon.userData.lastSet)) _sd.copy(moon.position).sub(moon.userData.lastCam); else _sd.copy(moon.position).sub(skyCenter);
  const mr=_sd.length()||1; _sd.multiplyScalar(1/mr); moon.position.copy(_sd).multiplyScalar(mr).add(_cp); moon.userData.lastSet=moon.position.clone(); moon.userData.lastCam=_cp.clone();
  const h=ME.fly?ME.fy-floorY(ME.x,ME.z):0, want=ME.fly?Math.min(2.5,Math.max(.05,h*.01)):.05; if(Math.abs(want-nearNow)>.02){ nearNow=want; camera.near=want; camera.updateProjectionMatrix(); } });
}
// {% endraw %}
