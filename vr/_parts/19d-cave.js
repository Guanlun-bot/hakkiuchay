// {% raw %}
// ═══ 鐘乳石伏流（鄉志）：斗灣潭東壁水下洞口 → 平地底下 → 磺水嶺南段 → 嶺東南麓海蝕洞入海 ═══
// 潭東壁到天坑一段整條淹在水裡（只在潭邊看得到洞口）；能走的從天坑起：
//   天坑（坍塌的落水洞，木梯下去）→ 低矮的水道，坐小船 → 磺水嶺底下的大廳（棧道、石筍、鐘乳石、流石，天窗透光）→ 海蝕洞走出去到海蝕平台。
// 洞裡不吃場景的燈：牆面自己算「頭燈」與天窗的光（CAVE_MAT）。在洞裡時 window.__caveWalk、__caveFloor 接管走路與地面高度。
const CAVE=(()=>{
  const PM=[[790,470],[805,480],[822,492],[840,505],[858,520],[875,535],[893,550],[910,565],[928,580],[945,592],[962,603],[978,611],[992,617]];
  const curve=new THREE.CatmullRomCurve3(PM.map(([mx,my])=>{ const [x,z]=TWP.m2l(mx,my); return new THREE.Vector3(x,0,z); }),false,'catmullrom',.5);
  const LEN=curve.getLength(), MOUTH=LEN-Math.hypot(17,7)*TWP.S;   /* the sea cave's mouth, where the cliff meets the platform */
  const ss=(x,a,b)=>{ const t=Math.min(1,Math.max(0,(x-a)/(b-a))); return t*t*(3-2*t); };
  const h1=(a,b)=>{ const s=Math.sin(a*127.1+b*311.7)*43758.5453; return s-Math.floor(s); };
  const n1=s=>{ const i=Math.floor(s), f=s-i, u=f*f*(3-2*f); return h1(i,3)*(1-u)+h1(i+1,3)*u; };
  // the cave's shape along it (s in metres from the 天坑): floor, ceiling, width, water; boat between B0 and B1
  const B0=34, B1=LEN*.33, S2=LEN*.47, HALL=[LEN*.45,LEN*.7];
  const prof=s=>{ const u=s/LEN;
    const wat=4-3.7*ss(u,0,1);
    let fl=u<.02?1:B0<s&&s<B1?-3:4.5+2.5*n1(s/60);
    if(s>=B1&&s<B1+20) fl=-3+(7.5)*ss(s,B1,B1+20);
    if(s>MOUTH-90) fl=fl+(.9-fl)*ss(s,MOUTH-90,MOUTH);
    let ce=fl+7+5*n1(s/45+7); for(const c of HALL) ce+=26*Math.exp(-(((s-c)/70)**2)); if(B0<s&&s<B1) ce=wat+4.5+3*n1(s/30);
    if(s>MOUTH-60) ce=Math.max(ce,fl+12);
    const wd=(B0<s&&s<B1?9+4*n1(s/40):12+8*n1(s/50+3))+(HALL.reduce((a,c)=>a+22*Math.exp(-(((s-c)/80)**2)),0));
    return {fl,ce,wd,wat:s>MOUTH-90?Math.min(wat,.35):wat}; };
  // samples every 2 m: position, sideways, profile
  const N=Math.ceil(LEN/2), SM=[];
  for(let i=0;i<=N;i++){ const s=i/N*LEN, p=curve.getPointAt(i/N), t=curve.getTangentAt(i/N), l=Math.hypot(t.x,t.z)||1; SM.push({s,x:p.x,z:p.z,tx:t.x/l,tz:t.z/l,nx:-t.z/l,nz:t.x/l,...prof(s)}); }
  let last=0;
  const project=(x,z)=>{ let bi=last, bd=1e18; const lo=Math.max(0,last-60), hi=Math.min(N,last+60);
    const scan=(a,b)=>{ for(let i=a;i<=b;i++){ const q=SM[i], d=(x-q.x)**2+(z-q.z)**2; if(d<bd){ bd=d; bi=i; } } };
    scan(lo,hi); if(bd>400) scan(0,N); last=bi; const q=SM[bi], lat=(x-q.x)*q.nx+(z-q.z)*q.nz, along=(x-q.x)*q.tx+(z-q.z)*q.tz;
    return {q,s:q.s+along,lat,d:Math.sqrt(bd)}; };
  return {curve,LEN,MOUTH,B0,B1,S2,HALL,SM,N,project,prof,h1,n1,ss,on:false,ride:null};
})();

{ const {SM,N,LEN,MOUTH,B0,B1,S2,h1,n1,ss}=CAVE, E0=TWP.E0;
  // ── the light: a lamp at the eye, and the daylight falling in at the 天坑, the 天窗 and the mouth ──
  const SKY=[], skyU=[]; const addSky=(s,r,k)=>{ const q=SM[Math.round(s/LEN*N)]; SKY.push({x:q.x,y:q.ce-E0,z:q.z,r,k}); };
  addSky(6,30,1.4); addSky(S2,26,1.1); addSky(MOUTH,40,1.6);
  for(let i=0;i<3;i++) skyU.push(new THREE.Vector4(SKY[i].x,SKY[i].y,SKY[i].z,SKY[i].r));
  const U={uEye:{value:new THREE.Vector3()},uSky:{value:skyU},uDay:{value:1}};
  const caveMat=(col,opts={})=>{ const m=new THREE.MeshBasicMaterial({color:col,vertexColors:!!opts.vc,side:opts.side||THREE.DoubleSide,transparent:!!opts.tr,opacity:opts.op||1,depthWrite:!opts.tr});
    m.onBeforeCompile=sh=>{ Object.assign(sh.uniforms,U);
      sh.vertexShader='varying vec3 vCW;\n'+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\n#ifdef USE_INSTANCING\n vCW=(modelMatrix*instanceMatrix*vec4(transformed,1.)).xyz;\n#else\n vCW=(modelMatrix*vec4(transformed,1.)).xyz;\n#endif');
      sh.fragmentShader='varying vec3 vCW;\nuniform vec3 uEye; uniform vec4 uSky[3]; uniform float uDay;\n'+sh.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
        vec3 nn=normalize(cross(dFdx(vCW),dFdy(vCW))); vec3 toE=uEye-vCW; float de=length(toE);
        float lamp=(.2+.8*abs(dot(nn,toE/max(de,.001))))*1.05/(1.+de*de*.02);
        float sky=0.; for(int i=0;i<3;i++){ vec3 d=vCW-uSky[i].xyz; d.y*=.35; sky+=uDay*exp(-dot(d,d)/(uSky[i].w*uSky[i].w)); }
        diffuseColor.rgb*=.025+lamp+sky*.8;`);
    }; m.customProgramCacheKey=()=>'cave'+(opts.k||''); return m; };
  const G=new THREE.Group(); scene.add(G);

  // ── the tube: a ring every 2 m, flat floor, a vault above, rough ──
  const R=22, pos=[], col=[], idx=[];
  for(let i=0;i<=N;i++){ const q=SM[i], open=q.s<26||q.s>MOUTH+2;
    for(let j=0;j<R;j++){ const a=j/R*Math.PI*2, ca=Math.cos(a), sa=Math.sin(a), rough=1+.22*(h1(i*.37+j,j*1.3)-.5)+.25*(n1(q.s/9+j*.7)-.5);
      const hw=q.wd/2*rough; let y, lat=ca*hw;
      if(sa>=0) y=q.fl+(q.ce-q.fl)*Math.pow(sa,.55)*rough; else y=q.fl-(q.fl<q.wat-1?2.5:.6)*(-sa);
      if(open&&sa>.55) y=Math.max(q.fl+1,TWP.heightAt(q.x+q.nx*lat,q.z+q.nz*lat)-1.5);   /* no roof at the 天坑 and out at the mouth: the walls just meet the ground */
      pos.push(q.x+q.nx*lat,y-E0,q.z+q.nz*lat);
      const up=sa>.2?1:0, flow=(h1(Math.floor(q.s/7),j)>.78)?1:0, wet=sa<.15?1:0;
      const c=new THREE.Color(.62,.58,.50); if(flow) c.setRGB(.86,.82,.70); if(wet) c.multiplyScalar(.72); if(up) c.multiplyScalar(.88+.15*n1(q.s/5+j)); col.push(c.r,c.g,c.b); } }
  for(let i=0;i<N;i++) for(let j=0;j<R;j++){ const a=i*R+j, b=i*R+(j+1)%R, c=(i+1)*R+j, d=(i+1)*R+(j+1)%R; idx.push(a,c,b,b,c,d); }
  const tg=new THREE.BufferGeometry(); tg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); tg.setAttribute('color',new THREE.Float32BufferAttribute(col,3)); tg.setIndex(idx);
  const tube=new THREE.Mesh(tg,caveMat(0xffffff,{vc:true})); tube.userData={type:'floor'}; G.add(tube); pickables.push(tube);
  // ── water: the boat's channel full width, then a stream along the left of the halls, then the sea at the mouth ──
  { const P=[], I=[]; for(let i=0;i<=N;i++){ const q=SM[i]; let a,b,y;
      if(q.s<B1+6){ a=-q.wd*.48; b=q.wd*.48; y=q.wat; } else if(q.s>MOUTH-90){ a=-q.wd*.48; b=q.wd*.48; y=q.wat; } else { a=-q.wd*.45; b=-q.wd*.45+2.6; y=q.fl+.12; }
      P.push(q.x+q.nx*a,y-E0+.02,q.z+q.nz*a, q.x+q.nx*b,y-E0+.02,q.z+q.nz*b); }
    for(let i=0;i<N;i++){ const k=i*2; I.push(k,k+2,k+1,k+1,k+2,k+3); }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setIndex(I);
    G.add(new THREE.Mesh(g,caveMat(0x2f5a5a,{tr:true,op:.85,k:'w'}))); }
  // ── stalactites on the roofs, stalagmites and flowstone mounds on the floors (clear of the walkway) ──
  { const cone=new THREE.ConeGeometry(1,1,7,1), place=(flip,n,pick)=>{ const im=new THREE.InstancedMesh(cone,caveMat(flip?0xd8d0bc:0xc9bfa8,{k:'i'+flip}),n), m=new THREE.Matrix4(), q4=new THREE.Quaternion(), v=new THREE.Vector3(), sc=new THREE.Vector3(); let c=0;
      for(let k=0;k<n*3&&c<n;k++){ const r=pick(k); if(!r) continue; const [x,y,z,rad,len]=r; q4.setFromAxisAngle(new THREE.Vector3(1,0,0),flip?Math.PI:0); v.set(x,y+(flip?-len/2:len/2),z); sc.set(rad,len,rad); m.compose(v,q4,sc); im.setMatrixAt(c++,m); }
      im.count=c; im.frustumCulled=false; G.add(im); };
    place(1,900,k=>{ const i=Math.floor(h1(k,1)*N), q=SM[i]; if(q.s<26||q.s>MOUTH) return null; const lat=(h1(k,2)-.5)*q.wd*.7, len=.4+Math.pow(h1(k,3),2)*(q.ce-q.fl>15?5:1.6);
      return [q.x+q.nx*lat,q.ce-E0-.3-Math.abs(lat)/q.wd*2,q.z+q.nz*lat,.08+len*.07,len]; });
    place(0,320,k=>{ const i=Math.floor(h1(k,5)*N), q=SM[i]; if(q.s<B1+20||q.s>MOUTH-90) return null; const side=h1(k,6)>.5?1:-1, lat=side*(2.6+h1(k,7)*(q.wd*.45-2.6)); if(Math.abs(lat)>q.wd*.46) return null;
      const len=.3+Math.pow(h1(k,8),2)*(q.ce-q.fl>15?6:1.8); return [q.x+q.nx*lat,q.fl-E0,q.z+q.nz*lat,.15+len*.12,len]; }); }
  // ── the walkway in the halls: boards on low posts down the middle ──
  { const P=[], I=[]; for(let i=0;i<=N;i++){ const q=SM[i]; if(q.s<B1+4||q.s>MOUTH-6){ continue; } const k=P.length/3, y=q.fl+.18-E0; P.push(q.x-q.nx*1.1,y,q.z-q.nz*1.1, q.x+q.nx*1.1,y,q.z+q.nz*1.1); if(k>0&&SM[i-1].s>=B1+4) I.push(k-2,k,k-1,k-1,k,k+1); }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setIndex(I); const w=new THREE.Mesh(g,caveMat(0x7a5a3a,{k:'b'})); w.userData={type:'floor'}; G.add(w); pickables.push(w); }
  // ── the landings: at the foot of the 天坑's stair, and where the boat ends ──
  const landing=(s,len)=>{ const q=SM[Math.round(s/LEN*N)], m=new THREE.Mesh(new THREE.BoxGeometry(5,.3,len),caveMat(0x7a5a3a,{k:'b'})); m.position.set(q.x,Math.max(q.wat,q.fl)+.35-E0,q.z); m.rotation.y=Math.atan2(q.tx,q.tz); m.userData={type:'floor'}; G.add(m); pickables.push(m); return m; };
  landing(18,16); landing(B1+2,8);
  // ── the 天坑's wooden stair from the rim to the landing, and its sign ──
  { const q=SM[Math.round(10/LEN*N)], top=new THREE.Vector3(q.x-q.nx*14,0,q.z-q.nz*14); top.y=TWP.heightAt(top.x,top.z)-E0;
    for(let k=0;k<14;k++){ const t=k/13, st=new THREE.Mesh(new THREE.BoxGeometry(1.4,.12,.5),caveMat(0x6b4e32,{k:'b'})); st.position.set(top.x+(q.x-top.x)*t*.8,top.y+(4.6-E0-top.y)*t,top.z+(q.z-top.z)*t*.8); st.rotation.y=Math.atan2(q.nx,q.nz); G.add(st); }
    const sign=new THREE.Mesh(new THREE.BoxGeometry(.9,1.3,.12),new THREE.MeshLambertMaterial({color:0x5a4430})); sign.position.set(top.x-q.nx*2,TWP.heightAt(top.x-q.nx*2,top.z-q.nz*2)-E0+.65,top.z-q.nz*2); sign.userData={type:'cave',a:'down'}; scene.add(sign); pickables.push(sign);
    CAVE.rim={x:top.x-q.nx*3.5,z:top.z-q.nz*3.5}; CAVE.foot={s:16};
    const up=new THREE.Mesh(new THREE.BoxGeometry(.7,1.1,.1),caveMat(0x8a6a44,{k:'b'})); const f=SM[Math.round(12/LEN*N)]; up.position.set(f.x-f.nx*2.2,5.2-E0,f.z-f.nz*2.2); up.userData={type:'cave',a:'up'}; G.add(up); pickables.push(up); }
  // ── the boat: one small boat, at whichever end it was left ──
  const boat=new THREE.Group(); { const hm=caveMat(0x5d4128,{k:'b'}); const hull=new THREE.Mesh(new THREE.BoxGeometry(1.4,.45,4.2),hm); hull.position.y=.2; boat.add(hull);
    const lamp=new THREE.Mesh(new THREE.SphereGeometry(.12,8,6),new THREE.MeshBasicMaterial({color:0xffd27a})); lamp.position.set(0,.9,1.8); boat.add(lamp);
    boat.traverse(o=>{ if(o.isMesh){ o.userData={type:'cave',a:'boat'}; pickables.push(o); } }); G.add(boat); }
  let boatAt=B0+2;
  const putBoat=s=>{ const i=Math.max(0,Math.min(N,Math.round(s/LEN*N))), q=SM[i]; boat.position.set(q.x+q.nx*1.2,q.wat-E0,q.z+q.nz*1.2); boat.rotation.y=Math.atan2(q.tx,q.tz); };
  putBoat(boatAt);
  // ── the mouth on the lake's east wall: a dark arch just under the water ──
  { const [x,z]=TWP.m2l(661,389), m=new THREE.Mesh(new THREE.CircleGeometry(4,18,0,Math.PI),new THREE.MeshBasicMaterial({color:0x0d1414,transparent:true,opacity:.75,depthWrite:false}));
    m.position.set(x,TWP.POOL_Y-E0-5.2,z); m.rotation.y=Math.atan2(...(()=>{ const [a,b]=TWP.m2l(650,386); return [a-x,b-z]; })()); m.scale.y=1.2; scene.add(m); }

  // ── the sea cave's mouth seen from outside: a dark arch on the cliff foot (one-sided, so it does not block the view out) ──
  { const q=SM[Math.round(MOUTH/LEN*N)], m=new THREE.Mesh(new THREE.CircleGeometry(7,20,0,Math.PI),new THREE.MeshBasicMaterial({color:0x0b0f10}));
    m.position.set(q.x+q.tx*3,q.fl-E0,q.z+q.tz*3); m.rotation.y=Math.atan2(q.tx,q.tz); m.scale.y=1.6; scene.add(m); }
  // ── walking inside ──
  const at=s=>SM[Math.max(0,Math.min(N,Math.round(s/LEN*N)))];
  window.__caveWalk=(x,z)=>{ if(!CAVE.on) return undefined; if(CAVE.ride) return false; const {s,lat}=CAVE.project(x,z), q=at(s);
    if(s>MOUTH+8) return undefined;   /* out on the platform: the land's own rules */
    if(s<8||s>LEN) return false;
    if(s<B0) return Math.abs(lat)<2.3;   /* the landing at the stair's foot */
    if(s<B1) return s>B1-2&&Math.abs(lat)<2.3;   /* the low water: only by boat */
    if(s<B1+6) return Math.abs(lat)<2.3;
    return Math.abs(lat)<q.wd*.42; };
  window.__caveFloor=(x,z)=>{ if(!CAVE.on) return null; const {s}=CAVE.project(x,z), q=at(s);
    if(CAVE.ride) return q.wat-E0+.35;
    if(s<B0+2) return 4.65-E0; if(s<B1+6&&s>B1-4) return Math.max(q.wat,q.fl)+.5-E0;
    if(s>MOUTH) return Math.max(q.fl-E0,(TWP.floorY?TWP.floorY(x,z):0)??0);
    return q.fl+.18-E0; };
  const enter=s=>{ const q=at(s); CAVE.on=true; ME.fly=false; ME.path=[]; ME.x=q.x; ME.z=q.z; ME.yaw=Math.atan2(-q.tx,-q.tz); toast(NT('cave.in')); };
  window.__caveEnter=k=>enter(k*LEN);   /* for tests: k = how far along (0–1) */
  window.__caveAct=u=>{ if(u.a==='down'){ enter(16); return; }
    if(u.a==='up'){ CAVE.on=false; ME.path=[]; ME.x=CAVE.rim.x; ME.z=CAVE.rim.z; toast(NT('cave.out')); return; }
    if(u.a==='boat'){ if(!CAVE.on||CAVE.ride) return; const from=boatAt, to=from<(B0+B1)/2?B1-3:B0+2; CAVE.ride={from,to,t:0,T:Math.abs(to-from)/1.6}; toast(NT('cave.boat')); } };
  // ── each frame: the lamp, the boat, in and out at the mouth, light falling in by day ──
  let dayT=0;
  ZL_ANIM.push(dt=>{ dt=dt||.016;
    const near=Math.hypot(ME.x-SM[0].x,ME.z-SM[0].z)<900||Math.hypot(ME.x-SM[N].x,ME.z-SM[N].z)<900||CAVE.on; G.visible=near; if(!near) return;
    camera.getWorldPosition(U.uEye.value);
    if((dayT-=dt)<0){ dayT=10; const [hh]=taipeiClock.format(new Date()).split(':').map(Number); U.uDay.value=hh>=6&&hh<18?1:hh===5||hh===18?.4:0; }
    const pr=CAVE.project(ME.x,ME.z);
    if(!CAVE.on&&!ME.fly&&pr.s>MOUTH-4&&pr.s<MOUTH+4&&Math.abs(pr.lat)<5) CAVE.on=true;   /* walking in from the 海蝕平台 */
    if(CAVE.on&&(pr.s>MOUTH+10||pr.d>60)) CAVE.on=false;   /* out at the sea, or teleported away */
    if(CAVE.ride){ const R=CAVE.ride; R.t+=dt; const k=Math.min(1,R.t/R.T), s=R.from+(R.to-R.from)*(k*k*(3-2*k)); const q=at(s);
      ME.x=q.x+q.nx*1.2; ME.z=q.z+q.nz*1.2; ME.path=[]; boatAt=s; putBoat(s);
      if(k>=1){ CAVE.ride=null; const e=at(R.to>R.from?B1+3:B0-6); ME.x=e.x; ME.z=e.z; toast(NT('cave.land')); } }
  });
}
// {% endraw %}
