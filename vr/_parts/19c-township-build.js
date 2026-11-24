// {% raw %}
/* ================= 斗安鄉：房子、廟、車站、鐵道、道路與橋（粗略的第一版）=================
   What stands on the township's ground (TWP), as about 2000: the villages as clusters of one-storey houses under red
   tiles (若葉's old Japanese houses dark, 羅灣's fishermen's grey), 斗安's 老街 and 新街 lined both sides with two-storey
   old shophouses (老街屋: brick and plaster fronts, an arcade, tiled roofs); the temples red under orange tiles, the
   churches white with a cross; the school; 公埔's sugar-mill chimney. The branch line (芎寮—羅灣) on its ballast, over
   大陂溪 beside 斗安大橋 and into 望洋隧道 under 磺水嶺; the 縱貫線; the 公路, the 產業道路 and the streets, with a
   bridge wherever they cross water. You can walk anywhere on the ground outside the house's fields except in the water
   and through the buildings; roads and bridges carry you over (TWP.walk, TWP.floorY). Rough for now: boxes and roofs. */
{ const {FOOT,reflect,mergeGeo,FARPIER}=TWP, E0=TWP.E0, ss=THREE.MathUtils.smoothstep, RNG=(()=>{ let s=20261125; return ()=>{ s=(s*1664525+1013904223)>>>0; return s/4294967296; }; })();
  const parts=[], lamps=[];
  const colorize=(g,hex)=>{ const c=new THREE.Color(hex), n=g.attributes.position.count, a=new Float32Array(n*3); for(let i=0;i<n;i++) a.set([c.r,c.g,c.b],i*3); g.setAttribute('color',new THREE.BufferAttribute(a,3)); return g; };
  const put=(g,hex,x,y,z,yaw)=>{ g=g.index?g.toNonIndexed():g; colorize(g,hex); if(yaw) g.rotateY(yaw); g.translate(x,y,z); parts.push(g); };
  const gable=(w,d,h)=>{ const s=new THREE.Shape(); s.moveTo(-d/2,0); s.lineTo(0,h); s.lineTo(d/2,0); s.lineTo(-d/2,0); const g=new THREE.ExtrudeGeometry(s,{depth:w,bevelEnabled:false}); g.rotateY(Math.PI/2); g.translate(-w/2,0,0); return g; };   // ridge along local x
  const rot=(dx,dz,yaw)=>{ const c=Math.cos(yaw), s=Math.sin(yaw); return [dx*c+dz*s,-dx*s+dz*c]; };   // THREE's rotateY
  // footprints in 40 m cells: where you cannot walk
  const FG=new Map(), CELL=40;
  const foot=(x,z,hw,hd,yaw)=>{ const f={x,z,hw,hd,yaw,c:Math.cos(yaw),s:Math.sin(yaw)}; FOOT.push(f); const R=Math.hypot(hw,hd)+.4;
    for(let cx=Math.floor((x-R)/CELL);cx<=Math.floor((x+R)/CELL);cx++) for(let cz=Math.floor((z-R)/CELL);cz<=Math.floor((z+R)/CELL);cz++){ const k=cx+','+cz; if(!FG.has(k)) FG.set(k,[]); FG.get(k).push(f); } };
  const blocked=(x,z,m=.35)=>{ const L=FG.get(Math.floor(x/CELL)+','+Math.floor(z/CELL)); if(!L) return false; for(const f of L){ const dx=x-f.x, dz=z-f.z, u=dx*f.c-dz*f.s, v=dx*f.s+dz*f.c; if(Math.abs(u)<f.hw+m&&Math.abs(v)<f.hd+m) return true; } return false; };
  const yAt=(x,z)=>TWP.heightAt(x,z)-E0;
  // ---- lines along the ground: sampled every few metres; over water a deck (bridge), into 望洋隧道 hidden
  const sample=(P,step)=>{ const out=[]; for(let i=0;i<P.length-1;i++){ const [ax,az]=P[i], [bx,bz]=P[i+1], L=Math.hypot(bx-ax,bz-az), n=Math.max(1,Math.ceil(L/step)); for(let k=0;k<n;k++){ const t=k/n; out.push({x:ax+(bx-ax)*t,z:az+(bz-az)*t,seg:i}); } } const e=P[P.length-1]; out.push({x:e[0],z:e[1],seg:P.length-2});
    out.forEach((s,i)=>{ const a=out[Math.max(0,i-1)], b=out[Math.min(out.length-1,i+1)], l=Math.hypot(b.x-a.x,b.z-a.z)||1; s.tx=(b.x-a.x)/l; s.tz=(b.z-a.z)/l; }); return out; };
  // heights: the ground smoothed over `win` samples; over water at least `clear` above it, ramps at `grade` up to the deck
  const profile=(S,win,clear,grade,step,noDeck)=>{ const g=S.map(s=>{ const w=TWP.water(s.x,s.z); s.wet=!!w; return w?Math.max(yAt(s.x,s.z),w.y-E0):yAt(s.x,s.z); });
    const sm=g.map((_,i)=>{ let a=0,n=0; for(let k=-win;k<=win;k++){ const j=i+k; if(j<0||j>=g.length) continue; a+=g[j]; n++; } return a/n; });
    const deck=S.map((s,i)=>s.wet&&!(noDeck&&noDeck(s))?(TWP.water(s.x,s.z).y-E0+clear):-1e9);
    const D=[]; deck.forEach((d,i)=>{ if(d>-1e8) D.push([i,d]); });
    S.forEach((s,i)=>{ let y=sm[i]; for(const [j,d] of D){ if(Math.abs(i-j)>30) continue; const r=d-Math.abs(i-j)*step*grade; if(r>y) y=r; }   /* a bridge's approaches only, not a ramp across the hills */ s.y=y; s.g=g[i]; s.bridge=s.wet||y>g[i]+6; s.dy=y-g[i]; }); return S; };
  // an embankment under a line where it stands up off the ground (and a cutting where it goes below)
  const bank=(S,half,hex)=>{ const pos=[], col=[], idx=[], c=new THREE.Color(hex); S.forEach((s,i)=>{ const nx=-s.tz, nz=s.tx, up=Math.max(0,Math.min(s.dy,6)), w=half+up*1.6;
      for(const [o,y] of [[-w,s.g-.3],[-half,s.y],[half,s.y],[w,s.g-.3]]){ pos.push(s.x+nx*o,(s.bridge&&!s.wet&&s.dy>6)?s.y:y,s.z+nz*o); const k=.85+.25*TWP.h2(s.x+o,s.z); col.push(c.r*k,c.g*k,c.b*k); }
      if(i<S.length-1&&!S[i].skip&&!S[i+1].skip&&!(S[i].wet&&S[i+1].wet)){ const a=i*4; for(let j=0;j<3;j++) idx.push(a+j,a+j+4,a+j+1,a+j+1,a+j+4,a+j+5); } });
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(col,3)); g.setIndex(idx); g.computeVertexNormals(); return g; };
  const ribbon=(S,cols,hex,yOff)=>{ const pos=[], col=[], idx=[], c=new THREE.Color(hex);
    S.forEach((s,i)=>{ const nx=-s.tz, nz=s.tx; for(const [o,dy] of cols){ pos.push(s.x+nx*o,s.y+yOff+dy,s.z+nz*o); const k=.9+.2*TWP.h2(s.x+o,s.z); col.push(c.r*k,c.g*k,c.b*k); }
      if(i<S.length-1&&!S[i].skip&&!S[i+1].skip){ const n=cols.length, a=i*n; for(let j=0;j<n-1;j++) idx.push(a+j,a+j+n,a+j+1,a+j+1,a+j+n,a+j+n+1); } });
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(col,3)); g.setIndex(idx); g.computeVertexNormals(); return g; };
  const lineMeshes=[];
  const bridgeBits=(S,deckW,deckHex,pierHex,every)=>{ let last=-1e9; S.forEach((s,i)=>{ if(!s.bridge||s.skip) return;
      const yaw=Math.atan2(-s.tz,s.tx); put(new THREE.BoxGeometry(4.2,.8,deckW),deckHex,s.x,s.y-.45,s.z,yaw);
      if(i*1>last+every&&s.dy>2&&(s.wet||s.dy>6)){ last=i; const h=s.dy+3; put(new THREE.CylinderGeometry(.7,.9,h,8),pierHex,s.x,s.y-.8-h/2,s.z,0); } }); };
  // ---- the branch line and the 縱貫線
  { const own=TWP.RAIL_OWN, isOwn=(x,z)=>Math.abs(x-own[0])<3&&z>own[1]&&z<own[3];
    const TUN=TWP.RAIL_TUNNEL, S=profile(sample(TWP.RAIL,4),15,2,.025,4,s=>TUN.includes(s.seg));
    // the tunnel: straight and nearly level between its portals
    const ti=S.map((s,i)=>TUN.includes(s.seg)?i:-1).filter(i=>i>=0);
    if(ti.length){ const a=ti[0], b=ti[ti.length-1], ya=S[a].y, yb=S[b].y; for(const i of ti){ S[i].y=ya+(yb-ya)*(i-a)/(b-a||1); S[i].skip=i>a+2&&i<b-2; S[i].bridge=false; }
      for(const i of [a,b]){ const s=S[i], yaw=Math.atan2(-s.tz,s.tx); put(new THREE.BoxGeometry(1.2,9,14),0x8f8a80,s.x,s.y+3.6,s.z,yaw); put(new THREE.BoxGeometry(1.4,.6,15),0x7e7a72,s.x,s.y+8.3,s.z,yaw); } }
    for(const s of S) if(isOwn(s.x,s.z)) s.skip=true;
    for(const s of S) if(TWP.fieldOut(s.x,s.z)<1&&!s.bridge&&s.dy<.5){ s.y=Math.min(s.y,-.02); }
    for(const s of S) if(TWP.fieldOut(s.x,s.z)>=1) s.y+=.25;
    lineMeshes.push(bank(S,2,0x6f6a52)); lineMeshes.push(ribbon(S,[[-1.9,0],[-1.3,.2],[1.3,.2],[1.9,0]],0x7a7468,0));
    for(const o of [-.57,.57]) lineMeshes.push(ribbon(S,[[o-.04,.37],[o+.04,.37]],0x8e8f8c,0));
    bridgeBits(S,4.6,0x5a5048,0x9a948a,6);
    TWP.railS=S;
    const T=profile(sample(TWP.TRUNK,6),12,4,.02,6); for(const s of T) s.y+=.25; lineMeshes.push(bank(T,2.3,0x6f6a52)); lineMeshes.push(ribbon(T,[[-2.2,0],[-1.5,.25],[1.5,.25],[2.2,0]],0x6e695f,0)); for(const o of [-.57,.57]) lineMeshes.push(ribbon(T,[[o-.04,.42],[o+.04,.42]],0x8e8f8c,0)); bridgeBits(T,5,0x5a5048,0x9a948a,4); TWP.trunkS=T; }
  // ---- roads, streets and their bridges (walkable: TWP.roadAt)
  const RS=new Map(), RC=30;
  for(const R of TWP.ROADS){ const S=profile(sample(R.P,3),5,2.6,.09,3);
    for(const s of S){ if(TWP.fieldOut(s.x,s.z)<1&&!s.bridge&&s.dy<1) s.y=Math.max(s.y,-.2); else if(!s.bridge) s.y+=.3; }
    lineMeshes.push(bank(S,R.w/2+.4,0x6f6a52));
    const hw=R.w/2; lineMeshes.push(ribbon(S,[[-hw-.4,-.15],[-hw,.06],[hw,.06],[hw+.4,-.15]],R.street?0x75716a:0x6b6b6c,.12));
    bridgeBits(S,R.w+.6,0xbdb8ae,0xa8a39a,8);
    // a parapet along each side where the road stands up off the ground
    S.forEach((s,i)=>{ if(s.dy>1.4&&i%2===0){ const yaw=Math.atan2(-s.tz,s.tx); for(const sd of [-1,1]) put(new THREE.BoxGeometry(6.1,.9,.25),0xc8c4bc,s.x-s.tz*sd*(hw+.1),s.y+.55,s.z+s.tx*sd*(hw+.1),yaw); } });
    for(let i=0;i<S.length-1;i++){ const a=S[i], b=S[i+1], seg={ax:a.x,az:a.z,ay:a.y+.18,bx:b.x,bz:b.z,by:b.y+.18,hw};
      for(let cx=Math.floor((Math.min(a.x,b.x)-hw)/RC);cx<=Math.floor((Math.max(a.x,b.x)+hw)/RC);cx++) for(let cz=Math.floor((Math.min(a.z,b.z)-hw)/RC);cz<=Math.floor((Math.max(a.z,b.z)+hw)/RC);cz++){ const k=cx+','+cz; if(!RS.has(k)) RS.set(k,[]); RS.get(k).push(seg); } }
    R.S=S; }
  TWP.roadAt=(x,z)=>{ const L=RS.get(Math.floor(x/RC)+','+Math.floor(z/RC)); if(!L) return null; let best=null, bd=1e9; for(const q of L){ const [d,t]=TWP.segD(x,z,q.ax,q.az,q.bx,q.bz); if(d<q.hw&&d<bd){ bd=d; best=q.ay+(q.by-q.ay)*t; } } return best; };
  // ---- buildings
  const nearLine=(x,z,m)=>{ if(TWP.roadAt(x,z)!=null) return true; for(const R of TWP.ROADS) for(let i=0;i<R.P.length-1;i++){ const a=R.P[i], b=R.P[i+1]; if(TWP.segD(x,z,a[0],a[1],b[0],b[1])[0]<R.w/2+m) return true; }
    for(const P of [TWP.RAIL,TWP.TRUNK]) for(let i=0;i<P.length-1;i++){ const a=P[i], b=P[i+1]; if(TWP.segD(x,z,a[0],a[1],b[0],b[1])[0]<4+m) return true; } return false; };
  const fits=(x,z,hw,hd,yaw,m=1.5)=>{ if(TWP.fieldOut(x,z)<hw+hd+6) return null; const cs=[[0,0],[hw,hd],[-hw,hd],[hw,-hd],[-hw,-hd]].map(([u,v])=>{ const [dx,dz]=rot(u,v,yaw); return [x+dx,z+dz]; });
    let lo=1e9, hi=-1e9; for(const [cx,cz] of cs){ if(TWP.water(cx,cz)) return null; const y=yAt(cx,cz); lo=Math.min(lo,y); hi=Math.max(hi,y); if(blocked(cx,cz,m)) return null; } if(hi-lo>2.6) return null; return lo; };
  const WALL=[0xe6e1d4,0xd8d0bf,0xcfc4ad,0xbdb4a2,0xe1d6bd,0x9a5a44,0xa8644a], TILE=[0x8a4a36,0x9a5238,0x7a4232], GREY=0x5e5e60;
  const house=(x,z,yaw,o)=>{ const w=o.w, d=o.d, h=o.h, y0=fits(x,z,w/2,d/2,yaw); if(y0==null) return false; const yb=y0-.4;
    put(new THREE.BoxGeometry(w,h+.4,d),o.wall,x,yb+(h+.4)/2,z,yaw); put(gable(w+.6,d+.9,o.roofH||1.8),o.roof,x,yb+h+.4,z,yaw);
    if(o.arcade){ const [dx,dz]=rot(0,-d/2-.6,yaw); put(new THREE.BoxGeometry(w,.25,1.4),0x7a756c,x+dx,yb+3.4,z+dz,yaw); }
    foot(x,z,w/2,d/2,yaw); if(RNG()<.6) lamps.push([x,yb+1.6+(h>5&&RNG()<.5?3.2:0),z]); return true; };
  const geoYaw=k=>Math.PI/4+k*Math.PI/2;   // walls square to the compass (the game's axes are 45° off it)
  // 斗安's streets: old shophouses both sides, fronts on the street
  for(const R of TWP.ROADS.filter(r=>r.street)){ for(let i=0;i<R.P.length-1;i++){ const a=R.P[i], b=R.P[i+1], L=Math.hypot(b[0]-a[0],b[1]-a[1]), tx=(b[0]-a[0])/L, tz=(b[1]-a[1])/L, nx=-tz, nz=tx;
      for(let s=4;s<L-3;s+=6.4) for(const side of [1,-1]){ const w=5.6+RNG()*.6, d=11+RNG()*4, off=R.w/2+1.6+d/2, x=a[0]+tx*s+nx*side*off, z=a[1]+tz*s+nz*side*off, yaw=Math.atan2(-tz,tx)+(side>0?Math.PI:0);
        house(x,z,yaw,{w,d,h:RNG()<.2?3.6:6.6,wall:RNG()<.45?WALL[5+(RNG()*2|0)]:WALL[RNG()*5|0],roof:TILE[RNG()*3|0],roofH:1.6,arcade:true}); } } }
  // the villages (and the rest of 斗安 round its streets)
  for(const p of TWP.PLACES) if(p.n){ const R=(p.r||5)*TWP.S; let made=0;
    for(let k=0;k<p.n*14&&made<p.n;k++){ const a=RNG()*6.283, r=R*Math.sqrt(RNG()), x=p.x+Math.cos(a)*r, z=p.z+Math.sin(a)*r; if(nearLine(x,z,2)) continue;
      const yaw=geoYaw(RNG()*4|0)+(RNG()-.5)*.2, jp=p.jp, fish=p.id==='ly', town=p.kind==='town', two=town&&RNG()<.35;
      if(house(x,z,yaw,{w:8+RNG()*6,d:6+RNG()*2,h:two?6.4:3.4,wall:jp?0x5a4a3a:WALL[RNG()*5|0],roof:jp||fish?GREY:TILE[RNG()*3|0],roofH:jp?2.2:1.7})) made++; } }
  // temples, churches, the school, the chimney, the stations
  const MAJOR={t_dag:1.6,t_yas:1.4,t_sx:1.1};
  for(const p of TWP.PLACES){ const yaw=geoYaw(p.id==='t_ws'?3:0);
    if(p.kind==='temple'){ const k=MAJOR[p.id]||.75, w=14*k, d=10*k, y0=fits(p.x,p.z,w/2+2,d/2+3,yaw,0); const yb=(y0??yAt(p.x,p.z))-.4;
      put(new THREE.BoxGeometry(w+5,.6,d+7),0xb8b0a0,p.x,yb+.3,p.z,yaw); put(new THREE.BoxGeometry(w,4.6*k+.6,d),0xa8402c,p.x,yb+.6+(4.6*k)/2,p.z,yaw); put(gable(w+1.6,d+2,2.4*k),0xd0662e,p.x,yb+.6+4.6*k,p.z,yaw);
      for(const sd of [-1,1]){ const [dx,dz]=rot(sd*(w/2+.6),0,yaw), tip=new THREE.ConeGeometry(.3*k,1.8*k,5); tip.rotateZ(-sd*.9); put(tip,0x6a6a6a,p.x+dx,yb+.6+4.6*k+2.4*k,p.z+dz,yaw); }
      foot(p.x,p.z,w/2,d/2,yaw); lamps.push([p.x,yb+3,p.z]); }
    if(p.kind==='church'){ const y0=fits(p.x,p.z,7,5,yaw,0), yb=(y0??yAt(p.x,p.z))-.4; put(new THREE.BoxGeometry(14,6,9),0xece8de,p.x,yb+3,p.z,yaw); put(gable(14.6,9.8,3),0x6a6a70,p.x,yb+6,p.z,yaw);
      const [dx,dz]=rot(-8,0,yaw); put(new THREE.BoxGeometry(3.4,13,3.4),0xece8de,p.x+dx,yb+6.5,p.z+dz,yaw); put(new THREE.BoxGeometry(.3,2.6,.3),0x3a3a3a,p.x+dx,yb+14.3,p.z+dz,yaw); put(new THREE.BoxGeometry(1.5,.3,.3),0x3a3a3a,p.x+dx,yb+14.6,p.z+dz,yaw);
      foot(p.x,p.z,7,4.5,yaw); foot(p.x+dx,p.z+dz,1.7,1.7,yaw); }
    if(p.kind==='school'){ const y0=fits(p.x,p.z,30,7,yaw,0), yb=(y0??yAt(p.x,p.z))-.4; put(new THREE.BoxGeometry(60,11,14),0xe2ddd0,p.x,yb+5.5,p.z,yaw); for(let f=0;f<3;f++) put(new THREE.BoxGeometry(56,1.2,14.2),0x6a7480,p.x,yb+2+f*3.4,p.z,yaw); foot(p.x,p.z,30,7,yaw); }
    if(p.id==='chim'){ const yb=yAt(p.x,p.z)-.4; put(new THREE.CylinderGeometry(1.2,2.3,40,14),0x8a4c3a,p.x,yb+20,p.z,0); put(new THREE.CylinderGeometry(1.35,1.35,.9,14),0x5a3a2e,p.x,yb+39.6,p.z,0); foot(p.x,p.z,2.3,2.3,0); }
    if(p.kind==='station'&&p.id!=='s_dt'){ let best=null, bd=1e9; TWP.railS.forEach(s=>{ const d=Math.hypot(s.x-p.x,s.z-p.z); if(d<bd){ bd=d; best=s; } });
      if(best&&bd<60){ const s=best, yaw=Math.atan2(-s.tz,s.tx), nx=-s.tz, nz=s.tx, px=s.x+nx*4.2, pz=s.z+nz*4.2, hx=s.x+nx*10.5, hz=s.z+nz*10.5;
        put(new THREE.BoxGeometry(60,.9,4),0xa59a84,px,s.y+.45,pz,yaw); put(new THREE.BoxGeometry(12,3.6,7),0xd9a766,hx,s.y+1.8+.4,hz,yaw); put(gable(12.8,8.4,2.2),0x3f6a5c,hx,s.y+4.2,hz,yaw);
        foot(hx,hz,6,3.5,yaw); lamps.push([hx,s.y+2,hz]); p.x=hx+nx*7; p.z=hz+nz*7; } } }
  const town=new THREE.Mesh(mergeGeo(parts),new THREE.MeshLambertMaterial({vertexColors:true})); town.receiveShadow=true; scene.add(town); reflect(town);
  const lm=new THREE.MeshLambertMaterial({vertexColors:true,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
  for(const g of lineMeshes){ const m=new THREE.Mesh(g,lm); m.receiveShadow=true; scene.add(m); reflect(m); }
  // lit windows at night
  { const N=lamps.length, pos=new Float32Array(Math.max(1,N)*3); lamps.forEach(([x,y,z],i)=>pos.set([x+(TWP.h2(i,1)-.5)*4,y,z+(TWP.h2(1,i)-.5)*4],i*3));
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3));
    const m=new THREE.PointsMaterial({color:0xffd59a,size:1.4,transparent:true,opacity:0,depthWrite:false,sizeAttenuation:true}); const pts=new THREE.Points(g,m); scene.add(pts);
    ZL_ANIM.push(()=>{ const T=taipeiNow().min, late=T>=1410||T<300; m.opacity=SKY_DAY<.4?(late?.35:.9)*(1-SKY_DAY/.4):0; }); }
  // ---- walking out here
  const onPier=(x,z)=>{ const F=FARPIER; return TWP.segD(x,z,F.a.x,F.a.z,F.b.x,F.b.z)[0]<F.w; };
  TWP.blocked=blocked;
  TWP.floorY=(x,z)=>{ const r=TWP.roadAt(x,z); if(r!=null) return r; if(onPier(x,z)) return FARPIER.y; if(TWP.fieldOut(x,z)<=0) return null; return yAt(x,z); };
  TWP.walk=(x,z)=>{ if(TWP.roadAt(x,z)!=null||onPier(x,z)) return true; if(TWP.fieldOut(x,z)<=0) return false; if(TWP.water(x,z)) return false; return !blocked(x,z); };
}
// {% endraw %}
