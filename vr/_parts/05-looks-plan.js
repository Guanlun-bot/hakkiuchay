// {% raw %}
/* ================= v45: who you are (name, figure, clothes, accessory), a cigarette, the door of 學鳩齋, the whole compound in plan ================= */
// ---- looks: gender, outfit, accessory; shared with everyone as presence `av`
const cleanLook=l=>window.HK_LOOK?window.HK_LOOK.clean(l):{g:'m',o:'robe',h:'none',f:'none',a:'none',hs:'short',hc:'#1e1b18',p:'scholar'};
var myLook=cleanLook((()=>{ try{ return JSON.parse(LS.get('hk-look')||'null'); }catch{ return null; } })());
const AVM={ skin:new THREE.MeshStandardMaterial({color:0xe7cfb4,roughness:.7}),
  shirt:new THREE.MeshStandardMaterial({color:0xf2efe8,roughness:.8}), shoe:new THREE.MeshStandardMaterial({color:0x1a1716,roughness:.45}), clothShoe:new THREE.MeshStandardMaterial({color:0x221f1d,roughness:.9}),
  sneaker:new THREE.MeshStandardMaterial({color:0xece8e0,roughness:.7}), jeans:new THREE.MeshStandardMaterial({color:0x3b4a66,roughness:.9}),
  straw:new THREE.MeshStandardMaterial({color:0xc8a96a,roughness:.9,side:THREE.DoubleSide}), tie:new THREE.MeshStandardMaterial({color:0x7a2a2a,roughness:.6}),
  metal:new THREE.MeshStandardMaterial({color:0x2a2622,metalness:.5,roughness:.4}), gold:new THREE.MeshStandardMaterial({color:0xc9a35e,metalness:.85,roughness:.3}),
  glass:new THREE.MeshStandardMaterial({color:0xdfeaf0,transparent:true,opacity:.28,roughness:.05}), dglass:new THREE.MeshStandardMaterial({color:0x1a1a1c,roughness:.15,metalness:.3}),
  canvas:new THREE.MeshStandardMaterial({color:0x8a7a5c,roughness:.95}), leather:new THREE.MeshStandardMaterial({color:0x5a3a22,roughness:.55}),
  paper:new THREE.MeshStandardMaterial({color:0xefe6d0,roughness:.9,side:THREE.DoubleSide}), wood:new THREE.MeshStandardMaterial({color:0x4a3020,roughness:.6}),
  black:new THREE.MeshStandardMaterial({color:0x1c1a19,roughness:.7}), white:new THREE.MeshStandardMaterial({color:0xf4f0e8,roughness:.85}),
  lace:new THREE.MeshStandardMaterial({color:0xf6f2ea,roughness:.9,side:THREE.DoubleSide}), red:new THREE.MeshStandardMaterial({color:0xa8343a,roughness:.7}),
  felt:new THREE.MeshStandardMaterial({color:0x6b5a44,roughness:.95}), feather:new THREE.MeshStandardMaterial({color:0xf6f4ee,roughness:.9,side:THREE.DoubleSide}),
  veil:new THREE.MeshStandardMaterial({color:0xf4f0e8,transparent:true,opacity:.45,roughness:.9,side:THREE.DoubleSide,depthWrite:false}),
  oilpaper:new THREE.MeshStandardMaterial({color:0xc9a35e,roughness:.7,side:THREE.DoubleSide}), clay:new THREE.MeshStandardMaterial({color:0x7a3e2a,roughness:.5}) };
// a woven tweed: small checks over a warm ground, multiplied by the chosen colour
const TWEED=ctex(64,64,(g,w,h)=>{ g.fillStyle='#d8d0c0'; g.fillRect(0,0,w,h); const R=rnd(5); for(let i=0;i<500;i++){ g.fillStyle=`rgba(${R()<.5?'90,70,50':'240,230,210'},.35)`; g.fillRect(R()*w,R()*h,1.5,1.5); }
  g.strokeStyle='rgba(70,50,40,.5)'; g.lineWidth=1; for(let i=0;i<w;i+=16){ g.beginPath(); g.moveTo(i,0); g.lineTo(i,h); g.stroke(); g.beginPath(); g.moveTo(0,i); g.lineTo(w,i); g.stroke(); } },{rep:[4,4]});
/* A visitor's figure, facing −z, about 1.7 m: head and hair → body and clothes → arms on shoulder pivots (posture) →
   face things → hat → things carried. Everything from simple turned and boxed shapes. */
function buildFigure(look,color){ const L=cleanLook(look), F=new THREE.Group(), c=new THREE.Color(color), dark=c.clone().multiplyScalar(.62), dd=c.clone().multiplyScalar(.42), lt=c.clone().lerp(new THREE.Color(0xf2ecdf),.35);
  const M=(col,r=.85,o={})=>new THREE.MeshStandardMaterial({color:col,roughness:r,...o});
  const cloth=M(c), clothD=M(dark), clothDD=M(dd), clothL=M(lt), hairM=M(new THREE.Color(L.hc),L.hs==='center'||L.hs==='back'?.42:.8);
  const add=(o,p=F)=>{ o.castShadow=true; p.add(o); return o; };
  const cyl=(rt,rb,h,m,x,y,z,p=F,seg=16)=>{ const o=add(new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg),m),p); o.position.set(x,y,z); return o; };
  const sph=(r,m,x,y,z,p=F)=>{ const o=add(new THREE.Mesh(new THREE.SphereGeometry(r,16,12),m),p); o.position.set(x,y,z); return o; };
  const bx=(w,h,d,m,x,y,z,p=F)=>{ const o=add(new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m),p); o.position.set(x,y,z); return o; };
  const tor=(r,t,m,x,y,z,p=F,arc=Math.PI*2)=>{ const o=add(new THREE.Mesh(new THREE.TorusGeometry(r,t,8,24,arc),m),p); o.position.set(x,y,z); return o; };
  // turned shape from [radius, height] pairs; depth squashed so bodies are oval, not round; an open front for coats
  const lathe=(pts,m,{dz=.8,open=0,p=F}={})=>{ const geo=new THREE.LatheGeometry(pts.map(([r,y])=>new THREE.Vector2(r,y)),28,open?Math.PI/2+open:0,open?Math.PI*2-2*open:Math.PI*2);
    const o=add(new THREE.Mesh(geo,m),p); o.scale.z=dz; if(open) o.material.side=THREE.DoubleSide; return o; };
  const fem=L.g==='f', sh=fem?.17:.2, O=L.o, west=['suit','tails','frock','vest','tweed','gown','trench','victorian','edwardian','blouse'].includes(O);
  const up=L.p==='upright', casual=L.p==='casual', behind=L.p==='behind';
  // ---- head, neck, face
  sph(.105,AVM.skin,0,1.56,0); bx(.026,.036,.03,AVM.skin,0,1.55,-.105); cyl(.042,.046,.09,AVM.skin,0,1.43,0);
  for(const sx of [-1,1]){ const e=sph(.011,AVM.black,sx*.038,1.57,-.097); e.scale.set(1,.7,.5); sph(.022,AVM.skin,sx*.104,1.555,0).scale.set(.5,1,.8); }
  const brow=M(new THREE.Color(L.hc)); for(const sx of [-1,1]){ const b=bx(.03,.006,.006,brow,sx*.038,1.592,-.098); b.rotation.z=sx*-.12; }
  bx(.03,.005,.006,M(0xb5786a),0,1.515,-.101);   // lips
  // ---- hair
  const HS=L.hs;
  const cap=add(new THREE.Mesh(new THREE.SphereGeometry(.113,18,10,0,Math.PI*2,0,Math.PI/2),hairM)); cap.position.set(0,1.585,.018); cap.rotation.x=-.32;
  if(HS==='back'){ cap.scale.set(1,1,1.08); const b=sph(.1,hairM,0,1.565,.045); b.scale.set(1,.9,1); }
  if(HS==='center'){ bx(.006,.004,.11,M(0x0e0c0b),0,1.672,-.02).rotation.x=-.32; for(const sx of [-1,1]) sph(.05,hairM,sx*.07,1.6,-.04).scale.set(.6,.7,1); }
  if(HS==='short'||HS==='center'||HS==='back'){ const nape=sph(.098,hairM,0,1.545,.03); nape.scale.set(1,.85,.9); }
  if(HS==='bun'){ sph(.05,hairM,0,1.69,.0); cyl(.004,.004,.14,AVM.gold,0,1.7,0).rotation.z=Math.PI/2; const nape=sph(.1,hairM,0,1.55,.03); nape.scale.set(1,.88,.92); }
  if(HS==='updo'){ const nape=sph(.1,hairM,0,1.55,.03); nape.scale.set(1,.88,.95); const b=sph(.06,hairM,0,1.56,.12); b.scale.set(1.2,1,.9); cyl(.004,.004,.16,AVM.gold,.02,1.58,.13).rotation.z=1.2; }
  if(HS==='braids'){ const nape=sph(.1,hairM,0,1.55,.03); nape.scale.set(1,.9,.95); for(const sx of [-1,1]){ for(let i=0;i<7;i++) sph(.024-i*.0012,hairM,sx*(.075+i*.004),1.46-i*.045,.07-i*.004); cyl(.012,.012,.02,AVM.red,sx*.105,1.14,.04); } }
  if(HS==='wavy'){ for(let i=0;i<14;i++){ const a=Math.PI*(.15+i/13*.7), r=.105; const s=sph(.042,hairM,Math.cos(a)*r*(i%2?1.02:1),1.5-(i%3)*.02-.03*Math.abs(Math.cos(a)),Math.sin(a)*r*.9); s.scale.set(1,1.4,1); } for(let i=0;i<7;i++){ const x=(i-3)*.03; sph(.032,hairM,x,1.64+.01*Math.cos(i),-.07); } }
  // ---- body and clothes
  let body;
  const legs=(m,shoe=AVM.shoe,r=.07)=>{ for(const sx of [-1,1]){ cyl(r,r-.006,.86,m,sx*.08,.45,0); bx(.085,.05,.17,shoe,sx*.08,.025,-.03); } };
  const clothShoes=()=>{ for(const sx of [-1,1]){ const s=cyl(.05,.05,.045,AVM.clothShoe,sx*.07,.022,-.02); s.scale.z=1.5; } };
  const longRobe=(m,hem,{waist=.82}={})=>lathe([[0,.05],[hem,.05],[hem-.02,.4],[sh-.02,waist],[sh-.01,1.15],[sh,1.36],[sh-.06,1.41],[.06,1.43],[0,1.43]],m);
  const jacket=(m,hemY,{flare=.02,dz=.8}={})=>lathe([[0,hemY],[sh+flare,hemY],[sh-.015,(hemY+1.36)/2],[sh,1.36],[sh-.06,1.41],[.06,1.43],[0,1.43]],m,{dz});
  const standCollar=(m,h=.05)=>cyl(.052,.054,h,m,0,1.41+h/2-.02,0);
  const frontLine=(m,y0,y1,z=-(sh*.8)-.003)=>bx(.012,y1-y0,.006,m,0,(y0+y1)/2,z);
  const buttons=(m,y0,y1,n,{x=0,z=-(sh*.8)-.006,r=.009}={})=>{ for(let i=0;i<n;i++) sph(r,m,x,y1-(y1-y0)*i/(n-1),z); };
  const knots=(y0,y1,n,m=AVM.gold)=>{ for(let i=0;i<n;i++){ const y=y1-(y1-y0)*i/(n-1); bx(.05,.008,.008,m,0,y,-(sh*.8)-.006); sph(.008,m,.03,y,-(sh*.8)-.008); } };
  const sash=(m,y=.98,r=sh-.005)=>{ const s=cyl(r+.006,r+.006,.05,m,0,y,0); s.scale.z=.82; return s; };
  // 右衽 cross collar: the outer band from the wearer's left at the neck down to the right underarm, the under band's tip showing
  const crossCollar=(m)=>{ const z=-(sh*.8)-.006; const a=bx(.036,.3,.008,m,.03,1.27,z); a.rotation.z=.58; const b=bx(.034,.1,.008,m,-.02,1.35,z+.002); b.rotation.z=-.6; };
  const skirt=(m,hem,top=1.0,{pleats=0}={})=>{ const o=lathe([[0,.04],[hem,.04],[hem*.8,.35],[.17,top-.05],[.15,top],[0,top]],m); if(pleats) for(let i=0;i<pleats;i++){ const a=i/pleats*Math.PI*2; const b=bx(.006,top-.1,.006,M(new THREE.Color(m.color).multiplyScalar(.75)),Math.sin(a)*(hem*.8+.02),(top+.04)/2,Math.cos(a)*(hem*.8+.02)*.8); b.rotation.z=-Math.sin(a)*(hem-.15)*1.2; b.rotation.x=Math.cos(a)*(hem-.15)*1.2; } return o; };
  const bodice=(m,bot=.96)=>lathe([[0,bot],[.15,bot],[.14,1.05],[sh,1.32],[sh-.05,1.4],[.055,1.43],[0,1.43]],m);
  switch(O){
    case 'robe': body=longRobe(cloth,fem?.2:.26); standCollar(clothD); bx(.012,.4,.008,clothD,.05,1.22,-(sh*.8)-.004).rotation.z=.25; clothShoes(); break;
    case 'qipao': body=lathe([[0,.06],[.19,.06],[.17,.45],[.14,.85],[.15,1.02],[sh,1.32],[sh-.05,1.4],[.055,1.43],[0,1.43]],cloth); cyl(.055,.057,.07,clothD,0,1.43,0); for(const z of [-1]) bx(.01,.36,.006,clothD,.07,.24,z*(.13)); const pip=bx(.012,.22,.006,clothD,.06,1.3,-.142); pip.rotation.z=.9; knots(1.18,1.36,3); clothShoes(); break;
    case 'magua': body=longRobe(clothL,fem?.2:.26); jacket(clothDD,.95,{flare:.03}); standCollar(clothDD); buttons(AVM.gold,1.0,1.36,5); clothShoes(); break;
    case 'rushan': body=longRobe(cloth,fem?.21:.28); crossCollar(clothDD); sash(clothDD,.98); bx(.05,.4,.01,clothDD,.06,.72,-(sh*.8)-.01); clothShoes(); break;
    case 'lanshan': body=longRobe(cloth,fem?.21:.28); lathe([[fem?.21:.28,.05],[fem?.21:.28,.17]],clothDD); crossCollar(clothDD); sash(clothDD,.98); clothShoes(); break;
    case 'daopao': body=longRobe(cloth,fem?.22:.29); crossCollar(AVM.white); sash(clothDD,.97); for(const sx of [-1,1]) bx(.035,.42,.01,clothDD,sx*.04,.72,-(sh*.8)-.01); clothShoes(); break;
    case 'cloak': body=longRobe(cloth,fem?.2:.26); standCollar(clothD); lathe([[.4,.2],[.36,.6],[sh+.06,1.3],[sh+.02,1.39],[.09,1.45]],clothDD,{open:.38}); cyl(.1,.11,.06,clothDD,0,1.43,0); clothShoes(); break;
    case 'gown': body=longRobe(AVM.black,fem?.22:.3); for(const sx of [-1,1]) bx(.06,1.25,.008,cloth,sx*.06,.72,-(sh*.8)-.006); lathe([[.16,1.0],[.2,1.15],[.15,1.3],[.07,1.38]],cloth,{open:2.2}).position.z=.03; break;
    case 'aoqun': skirt(clothD,fem?.3:.32,1.0); lathe([[fem?.3:.32,.04],[fem?.301:.321,.1]],clothDD); body=jacket(cloth,.9,{flare:.05}); lathe([[sh+.05,.9],[sh+.05,.94]],clothDD); standCollar(clothDD); knots(1.05,1.36,4); clothShoes(); break;
    case 'beizi': skirt(clothL,.3,1.0); body=bodice(clothL); lathe([[.27,.12],[.24,.6],[sh+.01,1.3],[sh-.04,1.4],[.07,1.43]],cloth,{open:.28}); for(const sx of [-1,1]){ const t=bx(.03,1.25,.01,clothDD,sx*.05,.78,-(sh*.8)-.012); t.rotation.z=sx*.07; } clothShoes(); break;
    case 'victorian': skirt(cloth,.46,.98); for(const y of [.2,.36]) lathe([[.46-(y-.04)*.37,y],[.47-(y-.04)*.37,y+.06]],clothD); body=bodice(cloth,.95); cyl(.05,.052,.09,AVM.lace,0,1.45,0); for(const sx of [-1,1]) sph(.07,cloth,sx*(sh+.02),1.33,0); buttons(AVM.gold,1.0,1.36,6,{z:-.13}); break;
    case 'edwardian': skirt(cloth,.34,.98); lathe([[.33,.08],[.34,.14]],AVM.lace); body=bodice(AVM.white,.95); sash(cloth,.97,.15); cyl(.05,.052,.1,AVM.lace,0,1.45,0); for(let i=0;i<5;i++) tor(.06-i*.004,.005,AVM.lace,0,1.38-i*.04,-.1).scale.set(1,.3,1); break;
    case 'blouse': skirt(clothD,.32,1.0); body=bodice(AVM.white,.97); sash(AVM.black,.98,.15); cyl(.05,.052,.06,AVM.lace,0,1.43,0); for(const sx of [-1,1]) sph(.065,AVM.white,sx*(sh+.02),1.33,0); buttons(AVM.white,1.04,1.36,5,{z:-.137,r:.007}); break;
    case 'zhongshan': case 'student': { legs(cloth); body=jacket(cloth,.86); const col=O==='student'?cyl(.056,.058,.06,clothD,0,1.43,0):null; if(!col){ for(const sx of [-1,1]){ const l=bx(.06,.05,.012,clothD,sx*.035,1.4,-.12); l.rotation.z=sx*.5; } }
      buttons(O==='student'?AVM.gold:clothDD,.92,1.36,5); frontLine(clothD,.86,1.36);
      if(O==='zhongshan') for(const sx of [-1,1]) for(const [y,w,h] of [[1.25,.07,.06],[.98,.08,.08]]){ bx(w,h,.008,clothD,sx*.1,y,-(sh*.78)-.005); bx(w,.02,.01,clothD,sx*.1,y+h/2,-(sh*.78)-.008); }
      break; }
    case 'tang': legs(AVM.black,AVM.clothShoe); body=jacket(cloth,.9,{flare:.03}); standCollar(clothD); frontLine(clothD,.9,1.4); knots(.98,1.36,5); break;
    case 'duanda': legs(M(0x2f2b28),AVM.clothShoe,.075); body=jacket(cloth,.97,{flare:.04}); frontLine(clothDD,.97,1.42); for(let i=0;i<5;i++) bx(.04,.008,.008,AVM.white,0,1.34-i*.08,-(sh*.8)-.006); sash(AVM.red,.99,sh+.02); break;
    case 'modern': body=cyl(fem?.16:.18,fem?.15:.17,.54,cloth,0,1.12,0); tor(.06,.015,clothD,0,1.4,0).rotation.x=Math.PI/2; for(const sx of [-1,1]){ cyl(.07,.065,.86,AVM.jeans,sx*.08,.43,0); bx(.085,.06,.16,AVM.sneaker,sx*.08,.03,-.03); } break;
    case 'vest': legs(M(0x2f2b28)); body=jacket(AVM.shirt,.9); lathe([[0,.9],[sh+.01,.9],[sh-.005,1.12],[sh+.005,1.3],[.09,1.34],[0,1.34]],cloth,{dz:.82}); bx(.06,.18,.01,AVM.shirt,0,1.27,-.17); buttons(AVM.gold,.95,1.2,4,{z:-.168}); bx(.02,.12,.01,AVM.tie,0,1.3,-.172); break;
    case 'suit': case 'tweed': case 'tails': case 'frock': case 'trench': {
      const cm=O==='tweed'?new THREE.MeshStandardMaterial({map:TWEED,color:c.clone().lerp(new THREE.Color(0xb59a74),.4),roughness:.95}):cloth;
      if(fem&&O==='suit'){ skirt(clothD,.22,.98); for(const sx of [-1,1]) cyl(.04,.035,.44,AVM.skin,sx*.06,.22,0); bx(.07,.04,.13,AVM.shoe,-.06,.02,-.03); bx(.07,.04,.13,AVM.shoe,.06,.02,-.03); }
      else legs(O==='tweed'?M(0x6b5a44):O==='tails'||O==='frock'?AVM.black:clothD);
      const hem=O==='frock'?.5:O==='trench'?.38:O==='tails'?1.08:.86;
      body=jacket(cm,hem,{flare:O==='trench'?.08:O==='frock'?.05:.02});
      bx(.09,.2,.01,AVM.shirt,0,1.3,-(sh*.8)-.004);
      for(const sx of [-1,1]){ const lp=bx(.05,.24,.01,O==='tails'?M(0x101010,.3):O==='trench'?cm:clothD,sx*.055,1.26,-(sh*.8)-.008); lp.rotation.z=sx*-.38; }
      if(O==='tails'){ bx(.06,.03,.012,AVM.white,0,1.37,-.17); for(const sx of [-1,1]){ const t=bx(.1,.55,.02,cm,sx*.07,.82,(sh*.8)); t.rotation.x=.08; } bx(.12,.12,.01,AVM.white,0,1.15,-.165); }
      else if(!fem) bx(.03,.22,.012,O==='frock'?AVM.black:AVM.tie,0,1.24,-(sh*.8)-.009);
      if(O==='suit'||O==='tweed') bx(.045,.025,.006,AVM.white,-.11,1.25,-(sh*.8)-.006);
      if(O==='tweed') for(const sx of [-1,1]) bx(.045,.06,.006,M(0x5a3a22),sx*(sh+.03),1.1,.0).visible=false;
      if(O==='trench'){ sash(cm,.95,sh+.03); bx(.04,.03,.01,AVM.gold,0,.95,-(sh*.8)-.035); for(const sx of [-1,1]){ for(const y of [1.25,1.12,.99]) sph(.01,M(0x2a2622),sx*.05,y,-(sh*.8)-.012); bx(.07,.012,.04,cm,sx*(sh-.03),1.375,0); } }
      if(O==='frock') buttons(AVM.black,1.0,1.15,3,{x:-.04});
      break; }
    default: body=longRobe(cloth,.26); clothShoes();
  }
  // ---- arms on shoulder pivots: the posture decides how they hang; wide sleeves for robes
  const wide=['robe','rushan','lanshan','daopao','gown','beizi','magua','cloak','aoqun'].includes(O);
  const sleeveM=O==='vest'||O==='blouse'||O==='edwardian'?AVM.white:O==='gown'?AVM.black:O==='magua'?clothDD:O==='tweed'?body.material:cloth;
  const arms=[]; for(const sx of [-1,1]){ const p=new THREE.Group(); p.position.set(sx*(sh+.03),1.37,0); F.add(p);
    cyl(.045,wide?.085:.05,.5,sleeveM,0,-.25,0,p); if(wide&&O!=='gown') cyl(.087,.087,.05,O==='lanshan'||O==='rushan'?clothDD:sleeveM,0,-.49,0,p);
    if(O==='gown'){ cyl(.09,.12,.06,AVM.black,0,-.5,0,p); for(const y of [-.18,-.26,-.34]) tor(.058,.008,cloth,0,y,0,p).rotation.x=Math.PI/2; }
    if(O==='tang') cyl(.054,.054,.05,AVM.white,0,-.48,0,p);
    if(['suit','tails','frock','tweed','trench','vest','zhongshan'].includes(O)) cyl(.042,.042,.03,AVM.shirt,0,-.505,0,p);
    sph(.038,AVM.skin,0,-.53,0,p); arms.push(p); }
  const [aL,aR]=arms;
  F.userData.arms=arms;
  if(behind){ for(const [a,sx] of [[aL,-1],[aR,1]]){ a.rotation.x=-.42; a.rotation.z=sx*.32; } }
  else if(casual){ aL.rotation.x=.1; aL.rotation.z=.03; aR.rotation.x=-.08; aR.rotation.z=-.03; F.rotation.z=.02; F.rotation.y=.08; }
  else if(up){ for(const a of arms) a.rotation.x=-.05; F.scale.set(1,1.02,1); }
  else { aL.rotation.x=.18; aR.rotation.x=.18; aL.rotation.z=.12; aR.rotation.z=-.12; }   // 儒雅端方: hands drawn in a little before the body
  // ---- face things
  const FC=L.f, eyeY=1.572, fz=-.104;
  const rings=(r,m,t=.0045,{both=true,lens=null}={})=>{ for(const sx of both?[-1,1]:[1]){ tor(r,t,m,sx*.042,eyeY,fz); if(lens){ const l=add(new THREE.Mesh(new THREE.CircleGeometry(r,16),lens)); l.position.set(sx*.042,eyeY,fz+.002); l.rotation.y=Math.PI; } } };
  const temples=m=>{ for(const sx of [-1,1]) bx(.004,.004,.1,m,sx*.07,eyeY,-.055); };
  if(FC==='round'){ rings(.027,AVM.metal); bx(.028,.004,.004,AVM.metal,0,eyeY+.004,fz); temples(AVM.metal); }
  if(FC==='gold'){ rings(.025,AVM.gold,.003,{lens:AVM.glass}); bx(.026,.003,.003,AVM.gold,0,eyeY+.004,fz); temples(AVM.gold); }
  if(FC==='shades'){ rings(.026,AVM.metal,.004,{lens:AVM.dglass}); bx(.028,.004,.004,AVM.metal,0,eyeY+.004,fz); temples(AVM.metal); }
  if(FC==='half'){ for(const sx of [-1,1]){ bx(.05,.008,.006,AVM.metal,sx*.042,eyeY+.016,fz); tor(.025,.002,AVM.metal,sx*.042,eyeY,fz,F,Math.PI).rotation.z=Math.PI; } temples(AVM.metal); }
  if(FC==='monocle'){ tor(.026,.004,AVM.gold,.042,eyeY,fz); const l=add(new THREE.Mesh(new THREE.CircleGeometry(.026,16),AVM.glass)); l.position.set(.042,eyeY,fz+.002); const ch=bx(.002,.3,.002,AVM.gold,.075,1.43,-.1); ch.rotation.z=-.2; }
  if(FC==='pince'){ rings(.022,AVM.metal,.003,{lens:AVM.glass}); tor(.01,.003,AVM.metal,0,eyeY+.006,fz,F,Math.PI); }
  const facial=M(new THREE.Color(L.hc),.9);
  if(FC==='mous'){ for(const sx of [-1,1]){ const m=bx(.03,.01,.01,facial,sx*.016,1.528,-.104); m.rotation.z=sx*.3; } }
  if(FC==='rendan') bx(.026,.012,.01,facial,0,1.53,-.104);
  if(FC==='handlebar'){ for(const sx of [-1,1]){ const m=bx(.035,.009,.01,facial,sx*.02,1.528,-.104); m.rotation.z=sx*.15; const t=tor(.012,.004,facial,sx*.044,1.538,-.1,F,Math.PI); t.rotation.z=sx>0?Math.PI*1.5:0; } }
  if(FC==='goatee'){ const g=add(new THREE.Mesh(new THREE.ConeGeometry(.022,.07,10),facial)); g.position.set(0,1.46,-.09); g.rotation.x=Math.PI; for(const sx of [-1,1]) bx(.024,.008,.01,facial,sx*.016,1.528,-.104).rotation.z=sx*.3; }
  if(FC==='beard'){ const b=add(new THREE.Mesh(new THREE.SphereGeometry(.108,18,10,0,Math.PI*2,Math.PI*.52,Math.PI*.36),facial)); b.position.set(0,1.555,-.004); b.scale.set(1.02,1.05,1.05); for(const sx of [-1,1]) bx(.03,.01,.01,facial,sx*.016,1.53,-.105).rotation.z=sx*.3; }
  if(FC==='veil'){ const v=add(new THREE.Mesh(new THREE.CylinderGeometry(.13,.15,.16,20,1,true,Math.PI*.55,Math.PI*.9),AVM.veil)); v.position.set(0,1.56,0); }
  // ---- hats
  const H=L.h, hy=1.655;
  const brim=(r,m,y=hy,t=.012)=>cyl(r,r,t,m,0,y,0,F,28), crown=(rt,rb,h,m,y=hy)=>cyl(rt,rb,h,m,0,y+h/2,0,F,24);
  const blk=AVM.black, band=(r,m,y,h=.025)=>cyl(r,r,h,m,0,y,0,F,24);
  switch(H){
    case 'shusheng': { const c2=crown(.105,.115,.1,blk,1.62); c2.scale.z=.9; for(const sx of [-1,1]){ const f=bx(.012,.16,.06,blk,sx*.05,1.66,.12); f.rotation.x=.5; } break; }
    case 'guapi': { const d=add(new THREE.Mesh(new THREE.SphereGeometry(.115,20,10,0,Math.PI*2,0,Math.PI/2),blk)); d.position.y=1.63; d.scale.y=.7; band(.116,blk,1.635,.03); sph(.014,AVM.red,0,1.715,0); for(let i=0;i<6;i++){ const s=bx(.003,.08,.003,M(0x333030),Math.sin(i*1.05)*.1,1.67,Math.cos(i*1.05)*.1); s.rotation.set(Math.cos(i*1.05)*.7,0,-Math.sin(i*1.05)*.7); } break; }
    case 'dongpo': { bx(.2,.16,.2,blk,0,1.69,0); bx(.15,.08,.15,blk,0,1.79,0); break; }
    case 'rujin': { const c2=crown(.1,.115,.13,M(0x3a3632),1.62); c2.scale.z=.9; for(const sx of [-1,1]){ const w=bx(.012,.1,.04,M(0x3a3632),sx*.075,1.79,.02); w.rotation.z=sx*.4; } break; }
    case 'douli': { const h=add(new THREE.Mesh(new THREE.ConeGeometry(.3,.15,28,1,true),AVM.straw)); h.position.y=1.72; sph(.012,AVM.straw,0,1.8,0); for(const sx of [-1,1]) bx(.003,.15,.003,M(0x5a4a30),sx*.09,1.6,-.02); break; }
    case 'straw': brim(.22,AVM.straw); crown(.115,.12,.1,AVM.straw); band(.121,AVM.tie,1.675); break;
    case 'felt': brim(.15,AVM.felt,hy,.015); { const d=add(new THREE.Mesh(new THREE.SphereGeometry(.115,20,10,0,Math.PI*2,0,Math.PI/2),AVM.felt)); d.position.y=hy; d.scale.y=.85; } break;
    case 'turban': for(let i=0;i<4;i++){ const t=tor(.1-i*.004,.03,AVM.white,0,1.63+i*.03,0); t.rotation.x=Math.PI/2+(i%2?.12:-.12); } break;
    case 'flatcap': { const d=add(new THREE.Mesh(new THREE.SphereGeometry(.12,20,10,0,Math.PI*2,0,Math.PI/2),AVM.felt)); d.position.set(0,1.64,.0); d.scale.set(1,.45,1.08); const v=bx(.17,.012,.09,AVM.felt,0,1.65,-.13); v.rotation.x=.15; sph(.012,AVM.felt,0,1.7,-.02); break; }
    case 'fedora': { brim(.19,M(0x2f2b28),hy); const c2=crown(.1,.115,.12,M(0x2f2b28)); c2.scale.z=.9; band(.117,AVM.tie,1.68); bx(.06,.02,.15,M(0x2a2622),0,1.775,0); break; }
    case 'tophat': brim(.17,blk,hy,.012); crown(.11,.105,.2,blk); band(.108,M(0x3a3632),1.695,.035); break;
    case 'bowler': brim(.15,blk,hy,.01); { const d=add(new THREE.Mesh(new THREE.SphereGeometry(.118,20,12,0,Math.PI*2,0,Math.PI/2),blk)); d.position.y=hy; d.scale.y=1.05; } band(.119,M(0x2a2622),1.67,.02); break;
    case 'tricorn': { const g=new THREE.Group(); g.position.y=hy; F.add(g); for(let i=0;i<3;i++){ const w=bx(.2,.08,.012,blk,0,.04,0,g); const a=i*Math.PI*2/3+Math.PI; w.position.set(Math.sin(a)*.1,.04,Math.cos(a)*.1); w.rotation.y=a; w.rotation.x=-.25; } const d=add(new THREE.Mesh(new THREE.SphereGeometry(.112,18,10,0,Math.PI*2,0,Math.PI/2),blk),g); d.scale.y=.6; break; }
    case 'panama': brim(.2,M(0xe8dcb8,.9)); crown(.1,.115,.11,M(0xe8dcb8,.9)); band(.117,blk,1.675); break;
    case 'mortar': { crown(.115,.115,.07,blk,1.62); const b=bx(.3,.012,.3,blk,0,1.7,0); b.rotation.y=Math.PI/4; sph(.012,AVM.gold,0,1.71,0); const t=bx(.004,.13,.004,AVM.gold,.13,1.64,-.05); break; }
    case 'bonnet': { const b=add(new THREE.Mesh(new THREE.SphereGeometry(.135,20,12,0,Math.PI*2,0,Math.PI*.6),clothL)); b.position.set(0,1.58,.03); b.rotation.x=-.5; tor(.13,.012,AVM.lace,0,1.6,-.03).rotation.x=-.9; for(const sx of [-1,1]){ const r=bx(.015,.14,.004,clothD,sx*.08,1.47,-.06); r.rotation.z=sx*.2; } sph(.025,AVM.white,.08,1.68,-.04); break; }
    case 'pillbox': { const p=crown(.08,.08,.06,clothD,1.665); p.position.x=.03; p.rotation.z=-.15; const v=add(new THREE.Mesh(new THREE.CircleGeometry(.09,16),AVM.veil)); v.position.set(.02,1.66,-.1); v.rotation.x=.3; v.rotation.y=Math.PI; break; }
  }
  // ---- things carried: in the right hand (on the arm pivot), at the neck or on the body
  const A=L.a, hand=new THREE.Group(); hand.position.set(0,-.55,-.02); aR.add(hand);
  const inH=(o,x=0,y=0,z=0)=>{ o.position.set(x,y,z); hand.add(o); return o; };
  const C=(r1,r2,h,m,seg=12)=>{ const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,seg),m); o.castShadow=true; return o; };
  const Bx=(w,h,d,m)=>{ const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m); o.castShadow=true; return o; };
  switch(A){
    case 'scroll': { const s=inH(C(.025,.025,.26,AVM.paper),0,0,-.02); s.rotation.x=Math.PI/2; for(const z of [-.15,.11]) inH(C(.012,.012,.03,AVM.wood),0,0,z).rotation.x=Math.PI/2; break; }
    case 'painting': { inH(C(.02,.02,.5,AVM.paper),0,.12,0); for(const y of [-.14,.38]) inH(C(.012,.012,.03,AVM.wood),0,y,0); inH(Bx(.004,.4,.004,AVM.tie),.02,.12,-.015); break; }
    case 'book': { inH(Bx(.04,.2,.15,AVM.leather),.0,.02,-.05); inH(Bx(.035,.19,.14,AVM.paper),.006,.02,-.05); inH(Bx(.002,.02,.1,AVM.gold),-.021,.08,-.05); break; }
    case 'parchment': { const s=inH(C(.03,.03,.22,M(0xe2cf9e,.9)),0,0,-.02); s.rotation.x=Math.PI/2; inH(Bx(.004,.025,.04,AVM.red),.03,0,-.02); break; }
    case 'fan': { const f=inH(new THREE.Mesh(new THREE.CircleGeometry(.15,18,Math.PI*.2,Math.PI*.6),AVM.paper),.0,.02,-.04); f.rotation.y=Math.PI/2; for(let i=0;i<7;i++){ const r=inH(Bx(.003,.15,.003,AVM.wood),.001,.02+Math.sin(Math.PI*(.2+i*.1))*.075,-.04+Math.cos(Math.PI*(.2+i*.1))*.075); r.rotation.x=-(Math.PI*(.2+i*.1))+Math.PI/2; } break; }
    case 'featherfan': { const g=new THREE.Group(); hand.add(g); g.position.set(0,.08,-.03); for(let i=0;i<9;i++){ const a=(i-4)*.14; const fth=new THREE.Mesh(new THREE.PlaneGeometry(.045,.22),AVM.feather); fth.position.set(0,.11*Math.cos(a),.11*Math.sin(a)); fth.rotation.set(-a,Math.PI/2,0); g.add(fth); } inH(C(.012,.015,.1,AVM.wood),0,-.02,-.03); break; }
    case 'brush': { const b=inH(C(.007,.007,.22,M(0x9a7a4a,.6)),0,.04,-.03); b.rotation.x=.3; const tip=inH(new THREE.Mesh(new THREE.ConeGeometry(.012,.04,8),AVM.black),0,.16,-.07); tip.rotation.x=.3; break; }
    case 'quill': { const q=inH(new THREE.Mesh(new THREE.PlaneGeometry(.04,.26),AVM.feather),0,.12,-.05); q.rotation.set(.35,Math.PI/2,0); inH(C(.003,.003,.08,AVM.white),0,-.02,-.02).rotation.x=.35; break; }
    case 'briefcase': { inH(Bx(.09,.26,.34,AVM.leather),0,-.17,0); inH(Bx(.02,.012,.08,AVM.leather),0,-.02,0); for(const z of [-.08,.08]) inH(Bx(.095,.02,.02,AVM.gold),0,-.1,z); break; }
    case 'longpipe': { const p=inH(C(.006,.006,.7,AVM.wood),0,.2,-.06); p.rotation.x=.15; inH(C(.016,.012,.03,AVM.gold),0,.55,-.11); break; }
    case 'cane': { inH(C(.011,.009,.86,M(0x2a2016,.4)),0,-.42,-.02); inH(new THREE.Mesh(new THREE.SphereGeometry(.022,12,10),AVM.gold),0,.02,-.02); break; }
    case 'magnifier': { const g=new THREE.Group(); g.position.set(0,.05,-.06); g.rotation.x=.4; hand.add(g); g.add(C(.009,.009,.1,AVM.wood)); const r=new THREE.Mesh(new THREE.TorusGeometry(.04,.006,8,20),AVM.gold); r.position.y=.1; r.rotation.y=Math.PI/2; g.add(r); const l=new THREE.Mesh(new THREE.CircleGeometry(.04,16),AVM.glass); l.position.y=.1; l.rotation.y=Math.PI/2; g.add(l); break; }
    case 'telescope': { const g=new THREE.Group(); g.position.set(0,.02,-.05); g.rotation.x=1.1; hand.add(g); const a=C(.025,.025,.2,AVM.leather); g.add(a); const b=C(.02,.02,.16,AVM.gold); b.position.y=.16; g.add(b); const e=C(.028,.028,.02,AVM.gold); e.position.y=-.1; g.add(e); break; }
    case 'teapot': { const g=new THREE.Group(); g.position.set(0,-.06,-.04); hand.add(g); const b=new THREE.Mesh(new THREE.SphereGeometry(.07,16,12),AVM.clay); b.scale.y=.75; g.add(b); const sp=C(.008,.012,.07,AVM.clay); sp.position.set(0,.01,-.08); sp.rotation.x=-1; g.add(sp); const lid=C(.03,.035,.015,AVM.clay); lid.position.y=.055; g.add(lid); const hd=new THREE.Mesh(new THREE.TorusGeometry(.035,.007,6,12,Math.PI),AVM.clay); hd.position.set(0,.0,.07); hd.rotation.set(0,Math.PI/2,Math.PI/2); g.add(hd); break; }
    case 'umbrella': case 'parasol': { const m=A==='umbrella'?AVM.oilpaper:AVM.lace; inH(C(.008,.008,1.0,A==='umbrella'?AVM.wood:M(0x5a4a3a,.5)),0,.48,-.02); const g=new THREE.Group(); g.position.set(0,.98,-.02); hand.add(g); const cn=new THREE.Mesh(new THREE.ConeGeometry(A==='umbrella'?.55:.45,.16,A==='umbrella'?24:12,1,true),m); cn.castShadow=true; g.add(cn); for(let i=0;i<(A==='umbrella'?16:8);i++){ const a=i/(A==='umbrella'?16:8)*Math.PI*2, R=A==='umbrella'?.55:.45; const r=C(.003,.003,R+.02,A==='umbrella'?AVM.wood:AVM.metal); r.position.set(Math.sin(a)*R/2,-.04,Math.cos(a)*R/2); r.rotation.set(Math.cos(a)*1.27,0,-Math.sin(a)*1.27); g.add(r); } if(A==='parasol') { const fr=new THREE.Mesh(new THREE.CylinderGeometry(.46,.46,.03,24,1,true),AVM.lace); fr.position.y=-.09; g.add(fr); } break; }
  }
  if(A==='scarf'){ const sc=M(c.getHSL({}).h<.05||c.getHSL({}).h>.95?0x2f4f6f:0xa8343a,.95); const t=tor(.065,.032,sc,0,1.41,0); t.rotation.x=Math.PI/2; bx(.07,.3,.025,sc,.05,1.23,-(sh*.8)-.02); }
  if(A==='bowtie'){ for(const sx of [-1,1]){ const w=add(new THREE.Mesh(new THREE.ConeGeometry(.022,.045,4),AVM.black)); w.position.set(sx*.022,1.385,-.14); w.rotation.z=sx*Math.PI/2; } sph(.01,AVM.black,0,1.385,-.142); }
  if(A==='neckerchief'){ const k=add(new THREE.Mesh(new THREE.ConeGeometry(.07,.13,3),M(c.getHSL({}).h<.05||c.getHSL({}).h>.95?0xc9a35e:0xa8343a,.8))); k.position.set(0,1.32,-.13); k.rotation.set(Math.PI,0,0); k.scale.z=.3; tor(.055,.012,k.material,0,1.4,0).rotation.x=Math.PI/2; }
  if(A==='bag'){ bx(.26,.3,.07,AVM.canvas,sh+.1,.95,.0); bx(.24,.1,.075,M(0x7a6a4c),sh+.1,1.06,.0); const st=bx(.025,.66,.012,AVM.canvas,0,1.15,-(sh*.8)-.02); st.rotation.z=-.62; }
  if(A==='bundle'){ const b=sph(.16,M(0x5b6f8a,.95),0,1.15,.22); b.scale.set(1.1,.8,.6); for(const sx of [-1,1]){ const k=bx(.03,.36,.01,M(0x5b6f8a,.95),sx*.06,1.25,-(sh*.8)-.012); k.rotation.z=sx*.45; } sph(.04,M(0x4a5d78),0,1.0,-(sh*.8)-.02); }
  if(A==='watch'){ const ch=tor(.09,.0025,AVM.gold,0,1.08,-(sh*.8)-.008,F,Math.PI); ch.rotation.z=Math.PI; sph(.02,AVM.gold,.09,1.08,-(sh*.8)-.015).scale.z=.4; }
  if(A==='pipe'){ const p=cyl(.005,.005,.09,AVM.wood,.03,1.5,-.15); p.rotation.set(Math.PI/2.3,0,.3); cyl(.016,.014,.035,AVM.wood,.055,1.48,-.19); }
  if(A==='gourd'){ const g1=sph(.045,M(0xc9963e,.6),-(sh+.04),.95,.0); const g2=sph(.032,M(0xc9963e,.6),-(sh+.04),1.02,.0); bx(.01,.03,.01,AVM.red,-(sh+.04),1.06,0); }
  /* sitting: everything below the hip is hidden or cut away, and a seated lower body takes its place: thighs forward
     and shins down to the floor on a chair, or crossed on a cushion; long robes and skirts drape over the lap instead.
     `sink` is where the figure's feet would be (the seat kind's height offset); the floor is then at local y −sink. */
  const HIP=.86, longWear=['robe','qipao','magua','rushan','lanshan','daopao','cloak','gown','aoqun','beizi','victorian','edwardian','blouse'].includes(O)||(fem&&O==='suit');
  const armSet=new Set(); for(const a of arms) a.traverse(o=>armSet.add(o));
  let seated=null; const cut=new THREE.Plane(new THREE.Vector3(0,-1,0),0), saved=[];
  F.userData.sit=(on,sink=-.42,low=false)=>{
    if(seated){ F.remove(seated); seated=null; for(const [m,vis,mat] of saved){ m.visible=vis; m.material=mat; } saved.length=0; }
    if(!on) return;
    let legMat=null;
    F.traverse(m=>{ if(!m.isMesh||armSet.has(m)) return; const g=m.geometry; if(!g.boundingBox) g.computeBoundingBox(); const bb=g.boundingBox, sy=m.scale.y;
      const lo=m.position.y+bb.min.y*sy, hi=m.position.y+bb.max.y*sy; if(m.parent!==F) return;
      if(hi<HIP+.02){ saved.push([m,m.visible,m.material]); if(!legMat&&m.material!==AVM.shoe&&m.material!==AVM.clothShoe&&m.material!==AVM.sneaker) legMat=m.material; m.visible=false; }
      else if(lo<HIP){ saved.push([m,m.visible,m.material]); const mm=m.material.clone(); mm.clippingPlanes=[cut]; m.material=mm; if(!legMat) legMat=m.material; } });
    seated=new THREE.Group(); F.add(seated); const lm=(legMat||cloth).clone(); lm.clippingPlanes=null; const floor=-sink;
    const C=(r1,r2,h,m,x,y,z,rx=0,rz=0)=>{ const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,12),m); o.position.set(x,y,z); o.rotation.set(rx,0,rz); o.castShadow=true; seated.add(o); return o; };
    const B=(w,h,d,m,x,y,z)=>{ const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m); o.position.set(x,y,z); o.castShadow=true; seated.add(o); return o; };
    const shoe=longWear&&!['victorian','edwardian','blouse'].includes(O)?AVM.clothShoe:AVM.shoe;
    if(low){ // cross-legged on a cushion or the tatami
      if(longWear){ const lap=new THREE.Mesh(new THREE.SphereGeometry(.3,18,10),lm); lap.scale.set(1.15,.3,.85); lap.position.set(0,HIP-.03,-.1); seated.add(lap); }
      for(const sx of [-1,1]){ C(.065,.06,.42,longWear?lm:lm,sx*.1,HIP-.02,-.13,0,Math.PI/2+sx*.35).rotation.y=sx*.5; }
      for(const sx of [-1,1]) B(.07,.05,.14,shoe,sx*.12,HIP-.04,-.3);
    } else { const knee=-.44, shin=Math.max(.15,HIP-.02-floor);
      if(longWear){ B(2*sh+.04,.12,.5,lm,0,HIP-.02,-.2); const drape=B(2*sh+.06,shin,.05,lm,0,HIP-.06-shin/2,knee-.02); drape.position.y=Math.max(floor+shin/2,HIP-.06-shin/2);
        for(const sx of [-1,1]) B(.08,.05,.15,shoe,sx*.08,floor+.025,knee-.06); }
      else { for(const sx of [-1,1]){ C(.07,.068,.46,lm,sx*.08,HIP-.02,-.21,Math.PI/2); C(.065,.06,shin,lm,sx*.08,HIP-.02-shin/2,knee); B(.085,.05,.17,shoe,sx*.08,floor+.025,knee-.04); } } }
  };
  // update the cut plane: called when the figure has been placed in the world
  F.userData.sitCut=()=>{ if(!seated) return; F.updateMatrixWorld(true); const p=new THREE.Vector3(0,HIP,0).applyMatrix4(F.matrixWorld); cut.constant=p.y; };
  F.userData.armBase=arms.map(a=>({x:a.rotation.x,z:a.rotation.z})); F.userData.baseRot={x:F.rotation.x,z:F.rotation.z};
  return {F,body}; }
function makeAvatar(color,look){ const g=new THREE.Group(); const fig=buildFigure(look||{},color); g.add(fig.F);
  const tag=new THREE.Sprite(new THREE.SpriteMaterial({depthTest:false,transparent:true})); tag.scale.set(0.9,0.26,1); tag.position.y=1.95; tag.renderOrder=5; g.add(tag);
  const cup=classicCup(g,.27,.88,-.14,{saucer:true,scale:1.1}); cup.visible=false;
  const snack=new THREE.Group(); g.add(snack);
  const smoke=smokeRig(g);
  scene.add(g); return {g,fig:fig.F,body:fig.body,tag,cup,snack,smoke,snI:-1,key:'',look:''}; }
function setAvatarLook(av,color,look){ const k=JSON.stringify(cleanLook(look))+color; if(av.look===k) return; av.look=k; av.g.remove(av.fig); av.sitKey=undefined; const fig=buildFigure(look,color); av.g.add(fig.F); av.fig=fig.F; av.body=fig.body; }

// ---- smoking: a silver case, a lighter's flame, the ember and smoke; ~2½ minutes a cigarette, shared as presence `sm`
var mySmoke=0; const SMOKE_T=150;
const smokeMat=()=>{ const m=steamMatBase.clone(); m.color=new THREE.Color(0xd8d6d2); m.opacity=0; return m; };
// four things to smoke, all lit with a match: 紙菸 a cigarette, 菸斗 a briar pipe, 雪茄 a cigar, 旱菸桿 a long pipe with a
// small brass bowl. In the rig, x runs from the mouth end (0) out to where it burns. A matchbox and a match: struck
// along the box's side, it flares, is held to the tip, then shaken out.
var mySmokeType=(()=>{ try{ return localStorage.getItem('hk-smoke-type')||'cig'; }catch{ return 'cig'; } })();
const SMOKE_TYPES=['cig','pipe','cigar','longpipe'];
function smokeRig(parent){ const R=new THREE.Group(); parent.add(R); R.visible=false;
  const M_=(c,r=.7,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:r,...o});
  const C=(r1,r2,h,m,seg=10)=>{ const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,seg),m); return o; };
  const tools={}, ember=new THREE.Mesh(new THREE.SphereGeometry(.0055,8,6),new THREE.MeshBasicMaterial({color:0xff6a1a}));
  { const g=new THREE.Group(); const paper=C(.0045,.0045,.07,AVM.shirt); paper.rotation.z=Math.PI/2; paper.position.x=.035; g.add(paper); const f=C(.0047,.0047,.022,M_(0xc89a5a,.8)); f.rotation.z=Math.PI/2; f.position.x=-.011; g.add(f); tools.cig={g,burn:paper,tip:.071,len:.07}; }
  { const g=new THREE.Group(), wood=M_(0x5a2f1a,.4); const st=C(.004,.0055,.08,M_(0x1a1715,.3)); st.rotation.z=Math.PI/2; st.position.x=.03; g.add(st);
    const bowl=C(.016,.013,.04,wood,14); bowl.position.set(.075,.012,0); g.add(bowl); const rim=C(.012,.012,.002,M_(0x241008,.9)); rim.position.set(.075,.032,0); g.add(rim); tools.pipe={g,tip:[.075,.033,0]}; }
  { const g=new THREE.Group(); const body=C(.0085,.009,.12,M_(0x6b4226,.75)); body.rotation.z=Math.PI/2; body.position.x=.06; g.add(body); const band=C(.0092,.0092,.012,M_(0xb0302a,.4,{metalness:.3})); band.rotation.z=Math.PI/2; band.position.x=.018; g.add(band); tools.cigar={g,burn:body,tip:.121,len:.12}; }
  { const g=new THREE.Group(); const jade=C(.005,.005,.03,M_(0x6f9a7a,.3)); jade.rotation.z=Math.PI/2; jade.position.x=.015; g.add(jade); const stem=C(.0045,.0045,.36,M_(0x3a2416,.6)); stem.rotation.z=Math.PI/2; stem.position.x=.21; g.add(stem);
    const bowl=C(.011,.008,.022,M_(0xb8913e,.35,{metalness:.7}),12); bowl.position.set(.395,.009,0); g.add(bowl); tools.longpipe={g,tip:[.395,.021,0]}; }
  for(const k in tools){ R.add(tools[k].g); tools[k].g.visible=false; }
  R.add(ember);
  // matchbox and match
  const box=new THREE.Group(); box.position.set(-.01,-.03,.03); R.add(box); const bx=new THREE.Mesh(new THREE.BoxGeometry(.05,.014,.036),M_(0xd8c49a,.8)); box.add(bx);
  const strip=new THREE.Mesh(new THREE.BoxGeometry(.05,.004,.002),M_(0x5a3a2a,.9)); strip.position.set(0,0,.019); box.add(strip);
  const match=new THREE.Group(); R.add(match); const stick=C(.0018,.0018,.05,M_(0xe6d2a6,.8),6); stick.rotation.z=Math.PI/2; stick.position.x=-.025; match.add(stick);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.0035,8,6),M_(0x8a1f1f,.6)); match.add(head);
  const flame=new THREE.Mesh(new THREE.ConeGeometry(.006,.026,8),new THREE.MeshBasicMaterial({color:0xffb347,transparent:true,opacity:.92,depthWrite:false})); flame.position.y=.012; match.add(flame);
  const glow=new THREE.PointLight(0xff9a40,0,1.2,2); match.add(glow);
  const puffs=[]; for(let i=0;i<10;i++){ const s=new THREE.Sprite(smokeMat()); scene.add(s); puffs.push({s,t:1,v:new THREE.Vector3()}); }
  return {R,tools,ember,box,match,head,flame,glow,puffs,next:0,type:null}; }
function setSmokeType(S,type){ if(!SMOKE_TYPES.includes(type)) type='cig'; if(S.type===type) return; S.type=type; for(const k in S.tools) S.tools[k].g.visible=k===type; }
const _tip=new THREE.Vector3();
// t: seconds since starting (-1 when not smoking). Matchbox 0–2.8; the match is struck at 0.8–1.2, flares, goes to the
// tip 1.5–2.3, is shaken out at 2.3–2.6; smoke rises from the tip after that, and a draw every nine seconds
function poseSmoke(S,t,dt,mouth){ const on=t>=0&&t<SMOKE_T; S.R.visible=on; if(!on){ for(const p of S.puffs) p.s.material.opacity=0; S.glow.intensity=0; return; }
  const T=S.tools[S.type]||S.tools.cig, burnt=Math.min(1,t/SMOKE_T);
  let tip;
  if(T.burn){ T.burn.scale.y=1-burnt*.6; T.burn.position.x=(T===S.tools.cig?.035:.06)-burnt*.3*T.len; tip=[T.tip-burnt*.6*T.len,0,0]; } else tip=T.tip;
  S.ember.position.set(tip[0],tip[1],tip[2]);
  S.box.visible=t<2.8; S.match.visible=t>.6&&t<2.7;
  if(S.match.visible){ let x,y,z, f=0;
    if(t<1.2){ const k=(t-.6)/.6; x=-.035+k*.07; y=-.022; z=.05; f=t>1.05?.6:0; }                         // drawn along the strip
    else if(t<1.5){ x=.04; y=-.01; z=.05; f=1.9-(t-1.2)*3; }                                          // the flare
    else if(t<2.3){ const k=Math.min(1,(t-1.5)/.5); x=.04+(tip[0]-.04)*k; y=-.01+(tip[1]-.012+.01)*k; z=.05-(.05-tip[2])*k; f=1; }   // to the tip
    else { x=tip[0]+.02*Math.sin(t*60); y=tip[1]-.01; z=tip[2]+.01; f=Math.max(0,1-(t-2.3)*6); }        // shaken out
    S.match.position.set(x,y,z); S.flame.visible=f>0; S.flame.scale.set(f,f*(1+.15*Math.sin(t*40)),f); S.glow.intensity=.7*f; } else S.glow.intensity=0;
  S.ember.visible=t>2.0;
  const draw=(t%9)<1.2&&t>3; S.ember.material.color.setHex(draw?0xffb050:0xff5a10); S.ember.scale.setScalar((draw?1.4:1)*(S.type==='pipe'?1.6:1));
  S.ember.getWorldPosition(_tip);
  S.next-=dt; if(t>2.4&&S.next<=0){ S.next=S.type==='cig'?.28:.4; const p=S.puffs.find(p=>p.t>=1); if(p){ p.t=0; p.big=false; p.s.position.copy(_tip);
      // the wind carries the smoke
      const w=typeof windAt==='function'?windAt(performance.now()/1000)*.03:0; p.v.set((Math.random()-.5)*.02+Math.cos(WIND.dir)*w,.12,(Math.random()-.5)*.02+Math.sin(WIND.dir)*w); } }
  if(t>3&&(t%9)>2.2&&(t%9)<2.2+dt*1.01&&mouth){ for(let i=0;i<(S.type==='cigar'?4:3);i++){ const p=S.puffs.find(p=>p.t>=1); if(!p) break; p.t=0; p.big=true; p.s.position.copy(mouth.p); p.v.copy(mouth.f).multiplyScalar(.25+i*.05).add(new THREE.Vector3(0,.05,0)); } }
  for(const p of S.puffs){ if(p.t>=1){ p.s.material.opacity=0; continue; } p.t+=dt/(p.big?2.6:3.2); p.s.position.addScaledVector(p.v,dt); p.v.y+=dt*.02; p.v.multiplyScalar(1-dt*.4);
    p.s.material.opacity=(p.big?.5:.4)*Math.sin(Math.min(1,p.t)*Math.PI); p.s.scale.setScalar((p.big?.07:.03)+p.t*(p.big?.4:.26)); } }
// my own cigarette, held low in the right of view (filter toward player, lit tail pointing outward)
const FP_SMOKE=smokeRig(camera); FP_SMOKE.R.position.set(.16,-.13,-.34); FP_SMOKE.R.rotation.set(.12,1.25,.08); FP_SMOKE.R.scale.setScalar(.85);
// first-person hands (appear when holding items or punching)
const fpHands=(()=>{
  const g=new THREE.Group(); camera.add(g);
  const rh=new THREE.Group(); rh.position.set(.24,-.22,-.36); g.add(rh);
  const sleeveMat=new THREE.MeshStandardMaterial({color:0x3e5873,roughness:.78});
  const cuffMat=new THREE.MeshStandardMaterial({color:0xf3eee4,roughness:.55});
  const skinMat=new THREE.MeshStandardMaterial({color:0xe7cfb4,roughness:.52});
  const sleeve=new THREE.Mesh(new THREE.CylinderGeometry(.036,.042,.26,12),sleeveMat); sleeve.rotation.x=Math.PI/2; sleeve.position.z=.15; rh.add(sleeve);
  const cuff=new THREE.Mesh(new THREE.CylinderGeometry(.034,.035,.03,12),cuffMat); cuff.rotation.x=Math.PI/2; cuff.position.z=.02; rh.add(cuff);
  const palm=new THREE.Mesh(new THREE.BoxGeometry(.052,.034,.068),skinMat); palm.position.set(0,.004,-.025); rh.add(palm);
  for(let i=0;i<4;i++){
    const f=new THREE.Mesh(new THREE.CylinderGeometry(.007,.0085,.038,8),skinMat);
    f.rotation.x=Math.PI/2.5; f.position.set(-.018+i*.012,.006,-.068); rh.add(f);
  }
  const thumb=new THREE.Mesh(new THREE.CylinderGeometry(.008,.009,.032,8),skinMat);
  thumb.rotation.set(Math.PI/3,0,-.45); thumb.position.set(-.028,.012,-.035); rh.add(thumb);
  const cup=classicCup(rh,0,.032,-.06,{saucer:true,scale:.95}); cup.visible=false;
  const snack=new THREE.Mesh(new THREE.CylinderGeometry(.028,.024,.02,12),new THREE.MeshStandardMaterial({color:0xd8a85c,roughness:.75}));
  snack.position.set(0,.025,-.055); snack.visible=false; rh.add(snack);
  g.visible=false;
  return {g,rh,sleeveMat,cup,snack,baseX:.24,baseY:-.22,baseZ:-.36};
})();
function toggleSmoke(){ try{ actx=actx||new (window.AudioContext||window.webkitAudioContext)(); actx.resume(); }catch{}
  if(mySmoke&&(Date.now()-mySmoke)/1000<SMOKE_T){ mySmoke=0; pushPresence(); toast('把菸捻熄了。'); return; }
  mySmoke=Date.now(); pushPresence(); toast(SMOKE_TXT[mySmokeType][0],2500); noiseBurst(.03,2600,6,.06,.15);
  // the match: a scratch along the strip, the flare's hiss, then shaken out
  setTimeout(()=>{ noiseBurst(.18,3200,1.4,.07); },800); setTimeout(()=>{ noiseBurst(.45,1100,.6,.05,.02); toast(SMOKE_TXT[mySmokeType][1],3000); },1200); setTimeout(()=>noiseBurst(.08,1800,2,.03),2300); }
const SMOKE_TXT={cig:['從菸盒取出一支菸。','劃一根火柴，點著了。'],pipe:['填好菸斗。','火柴湊近菸斗，吸了幾口，點著了。'],cigar:['剪開一支雪茄。','火柴慢慢轉著烤雪茄頭，點著了。'],longpipe:['旱菸桿裝上一撮菸絲。','劃一根火柴，湊到銅菸鍋上點著了。']};
const _mouth={p:new THREE.Vector3(),f:new THREE.Vector3()};
ZL_ANIM.push(dt=>{ const now=Date.now();
  // mine
  const t=mySmoke?(now-mySmoke)/1000:-1; if(mySmoke&&t>=SMOKE_T){ mySmoke=0; pushPresence(); toast('菸抽完了，捻熄在菸灰缸裡。'); }
  camera.getWorldPosition(_mouth.p); _mouth.p.y-=.08; _mouth.f.set(-Math.sin(ME.yaw),0,-Math.cos(ME.yaw)); _mouth.p.addScaledVector(_mouth.f,.15);
  const showFP=VIEW.mode!=='plan'&&!VIEW.thirdPerson&&!renderer.xr.isPresenting;
  setSmokeType(FP_SMOKE,mySmokeType); FP_SMOKE.R.visible=showFP; poseSmoke(FP_SMOKE,showFP?t:-1,dt,_mouth);
  const sb=$('#bSmoke'); if(sb){ sb.classList.toggle('on',!!mySmoke); }
  // everyone else: cigarette by the right hand, raised toward the mouth on a draw
  if(typeof others==='undefined') return;
  for(const [,o] of others){ const S=o.av.smoke; if(!S) continue; const at=num(o.p.sm,0), ot=at>0?(now-at)/1000:-1; setSmokeType(S,str(o.p.sk,10)||'cig');
    const draw=ot>3&&(ot%9)<1.6; S.R.position.set(.22,draw?1.5:.92,draw?-.14:-.08); S.R.rotation.set(0,Math.PI/2,0);
    const g=o.av.g; _mouth.p.set(0,1.5,-.15).applyMatrix4(g.matrixWorld); _mouth.f.set(-Math.sin(g.rotation.y),0,-Math.cos(g.rotation.y));
    poseSmoke(S,ot,dt,_mouth); }
  if(ME.av?.smoke){ const S=ME.av.smoke; setSmokeType(S,mySmokeType); const draw=t>3&&(t%9)<1.6; S.R.position.set(.22,draw?1.5:.92,draw?-.14:-.08); S.R.rotation.set(0,Math.PI/2,0);
    _mouth.p.set(0,1.5,-.15).applyMatrix4(ME.av.g.matrixWorld); _mouth.f.set(-Math.sin(ME.av.g.rotation.y),0,-Math.cos(ME.av.g.rotation.y));
    poseSmoke(S,VIEW.thirdPerson?t:-1,dt,_mouth); } });

// ---- others' looks follow their presence
ZL_ANIM.push(()=>{ if(typeof others==='undefined') return; for(const [,o] of others){ if(!o.av.fig) continue; const c=/^#[0-9a-f]{6}$/i.test(o.p.c)?o.p.c:'#888888'; setAvatarLook(o.av,c,o.p.av); } });

// ---- plan of the whole compound: name tags for everyone, yourself marked
function tickPlanLabels(){ const box=$('#planlabels'); if(!box) return; const on=VIEW.mode==='plan'; box.classList.toggle('hide',!on); if(!on) return;
  const W=innerWidth, H=innerHeight, v=new THREE.Vector3(), list=[{n:myName,c:myColor,x:ME.x,z:ME.z,me:true}];
  for(const [,o] of others){ const g=o.av.g; list.push({n:str(o.p.n,12)||'訪客',c:/^#[0-9a-f]{6}$/i.test(o.p.c)?o.p.c:'#888',x:g.position.x,z:g.position.z}); }
  while(box.children.length<list.length){ const d=document.createElement('div'); d.className='pl'; d.innerHTML='<i></i><span></span>'; box.appendChild(d); }
  [...box.children].forEach((d,i)=>{ const p=list[i]; if(!p){ d.style.display='none'; return; } v.set(p.x,1.2,p.z).project(camera); d.style.display=v.z<1?'':'none';
    d.style.transform=`translate(${(v.x*.5+.5)*W}px,${(-v.y*.5+.5)*H}px)`; d.firstChild.style.background=p.c; d.classList.toggle('me',!!p.me); const nm=p.me?p.n+'（你）':p.n; if(d.lastChild.textContent!==nm) d.lastChild.textContent=nm; }); }
ZL_ANIM.push(tickPlanLabels);

// {% endraw %}
