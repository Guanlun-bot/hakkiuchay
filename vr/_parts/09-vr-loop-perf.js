// {% raw %}
/* ---------------- VR ---------------- */
const vrBtn=$('#bVR');
let xrOK=false, enteringVR=false, vrCard=null, snapHeld=false;
(async()=>{
  try { xrOK=!!(navigator.xr && await navigator.xr.isSessionSupported('immersive-vr')); }
  catch { xrOK=false; }
  if(!xrOK) vrBtn.textContent='VR 操作說明';
})();
function clearTravel(){
  ME.path=[]; ME.faceTo=null; ME.afterArrive=null; ME.targetYaw=null;
  keys.clear();
}
vrBtn.onclick=async()=>{
  if(!xrOK){
    showText('進入 VR','<p>請用支援 WebXR 的頭盔瀏覽器直接開啟 HTTPS 網頁。</p><p>板機指地面瞬移、指書架看書、指椅子就座。搖桿左右轉向，按卡片可關閉。</p>');
    return;
  }
  if(enteringVR || renderer.xr.isPresenting) return;
  enteringVR=true;
  let session;
  try {
    session=await navigator.xr.requestSession('immersive-vr',{requiredFeatures:['local-floor']});
    renderer.xr.setReferenceSpaceType('local-floor');
    await renderer.xr.setSession(session);
    clearTravel(); snapHeld=false;
    $('#hud').classList.add('hide'); closePanel(); closeReader();
    session.addEventListener('end',()=>{
      closeVRCard();
      $('#hud').classList.remove('hide');
      camera.position.set(0,ME.eye,0);
    },{once:true});
  } catch(e) {
    if(session) await session.end().catch(()=>{});
    toast('無法進入 VR：'+(e.message||e));
  } finally { enteringVR=false; }
};
const controllers=[];
const tmpM=new THREE.Matrix4();
const headOffset=new THREE.Vector3();
function offsetFromRig(){
  headOffset.setFromMatrixPosition(renderer.xr.getCamera().matrixWorld);
  headOffset.x-=rig.position.x; headOffset.z-=rig.position.z;
  return headOffset;
}
function closeVRCard(){
  if(!vrCard) return;
  scene.remove(vrCard);
  vrCard.geometry.dispose(); vrCard.material.map.dispose(); vrCard.material.dispose();
  vrCard=null;
}
function vrPick(controller){
  controller.updateWorldMatrix(true,false);
  tmpM.extractRotation(controller.matrixWorld);
  ray.ray.origin.setFromMatrixPosition(controller.matrixWorld);
  ray.ray.direction.set(0,0,-1).applyMatrix4(tmpM);
  ray.far=30;
  return ray.intersectObjects(vrCard?[...pickables,vrCard]:pickables,false)[0];
}
for(let i=0;i<2;i++){
  const controller=renderer.xr.getController(i);
  const line=new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3(0,0,-1)]),
    new THREE.LineBasicMaterial({color:0xffe2a8})
  );
  controller.add(line); rig.add(controller); controllers.push({controller,line});
  controller.addEventListener('select',()=>{
    const h=vrPick(controller);
    if(!h) return;
    if(h.object===vrCard){ closeVRCard(); return; }
    let u=h.object.userData;
    if(u.type==='floor' && walkable(h.point.x,h.point.z)){
      standUp(); clearTravel(); closeVRCard();
      const offset=offsetFromRig();
      ME.x=h.point.x-offset.x; ME.z=h.point.z-offset.z;
      pushPresence();
    } else if(u.type==='seat'){
      const gsi=groupSeat(u,h.point); if(gsi==null){ vrShow('座位使用中',NT('bath.full')); return; }
      u={...u,si:gsi}; const seat=SEATS[u.si];
      if(occupied(u.si)){ vrShow('座位使用中','請選另一張椅子。'); return; }
      standUp(); clearTravel();
      const offset=offsetFromRig();
      ME.seat=u.si; ME.x=seat.x-offset.x; ME.z=seat.z-offset.z;
      $('#timer').classList.remove('hide'); updateTimerUI(); pushPresence();
      vrShow(seatLabel(u.si),'點選地面即可起身並移動。');
    } else if(u.type==='shelf' || u.type==='case'){
      const shelf=caseObjs[u.ci], {W,H,layout}=shelf.info;
      const px=h.uv.x*W, py=(1-h.uv.y)*H;
      const match=u.type==='shelf' && [...layout].find(([,r])=>px>=r.x0&&px<=r.x1&&py>=r.y0-6&&py<=r.y1+4);
      if(match){
        const [i]=match; highlight(i);
        const b=BOOKS[i]; vrShow(b[0],b.slice(1,6).filter(Boolean).join('\n'));
      } else {
        const ids=CASES[u.ci].cats.flatMap(([,list])=>list);
        vrShow(CASES[u.ci].label,ids.length?'共 '+ids.length+' 冊。指向書脊查看書目。':'這座書架尚未匯入書目。');
      }
    } else if(u.type==='post'){
      const p=POSTS[u.pi];
      vrShow(p.title,(p.summary||p.body||'').slice(0,130));
    } else if(u.type==='cab'){
      const c=CAB[u.ci];
      vrShow(c.name,postsBy(c.cat).length?'指向櫃中的書冊查看文章摘要。':'這個櫃子目前沒有文章。');
    } else if(u.type==='hou') vrShow(HOU.term+HOU.hou||'節候',HOU.yu);
    else if(u.type==='quote') vrShow(D.quote_src,D.quote);
    else if(u.type==='about') vrShow('學鳩齋',D.intro.split('\n\n')[0]);
    else if(u.type==='zhiliao') vrShow('知了間','左手榻榻米圍著囲炉裏，右手是福建工夫茶席。');
    else if(u.type==='gffan') fanFire();
    else if(u.type==='modern'){ startMD(); vrShow('當代茶席','點爐泡'+TEAS[myTea][0]+'。'); }
    else if(u.type==='gongfu'){ startGF(); vrShow('工夫茶','起炭泡'+TEAS[myTea][0]+'。'); }
    else if(u.type==='irori'){ startIR(); vrShow('囲炉裏','用蓋碗泡'+TEAS[myTea][0]+'。'); }
    else if(u.type==='tin'){ if(u.t>=0) pickTea(u.t); vrShow('錫茶罐','手邊這罐：'+TEAS[myTea][0]); }
    else if(u.type==='inst'){ const I=INST[u.k]; I.pluck?pluck(TUNE[u.k][0]):bow(TUNE[u.k][0]); vrShow(I.name,'內弦 '+noteOf(TUNE[u.k][0]).name); }
    else if(u.type==='wash') wash();
    else if(u.type==='shoji') toggleShoji();
    else if(u.type==='snack'){ const i=Math.floor(Math.random()*SNACKS.length); setSnack(i); vrShow('矮櫃','摸出'+SNACKS[i][0]+'。'); }
  });
}
function vrShow(title,body){ closeVRCard();
  const tex=textCanvas(1024,640,(g,w,h)=>{ g.fillStyle='rgba(241,239,232,.96)'; g.fillRect(0,0,w,h); g.fillStyle='#a8343a'; g.fillRect(0,0,12,h); g.fillStyle='#3f3a39'; g.font=F(700,48); let y=80; const wrap=(t,fs,lh)=>{ g.font=F(fs>40?700:400,fs); for(const para of t.split('\n')){ let line=''; for(const ch of para){ if(g.measureText(line+ch).width>w-90){ g.fillText(line,50,y); y+=lh; line=ch; } else line+=ch; } g.fillText(line,50,y); y+=lh; } };
    g.save(); g.beginPath(); g.rect(40,25,w-80,h-110); g.clip();
    wrap(title,48,64); y+=16; wrap(body,32,46); g.restore();
    g.font=F(400,28); g.fillText('板機點卡片關閉',50,h-40); });
  vrCard=new THREE.Mesh(new THREE.PlaneGeometry(1.0,0.625),new THREE.MeshBasicMaterial({map:tex,transparent:true})); const view=renderer.xr.getCamera();
  const cam=new THREE.Vector3().setFromMatrixPosition(view.matrixWorld);
  const forward=new THREE.Vector3(0,0,-1).applyQuaternion(new THREE.Quaternion().setFromRotationMatrix(view.matrixWorld));
  vrCard.position.copy(cam).addScaledVector(forward,1.3);
  vrCard.lookAt(cam); scene.add(vrCard); }

/* ---------------- loop ---------------- */
const clock=new THREE.Clock(); const fwd=new THREE.Vector3(); let presT=0;
function step(dt){
  const prevX=ME.x, prevZ=ME.z;
  // keyboard
  let mx=0,mz=0; if(keys.has('w')||keys.has('arrowup')) mz-=1; if(keys.has('s')||keys.has('arrowdown')) mz+=1; if(keys.has('a')) mx-=1; if(keys.has('d')) mx+=1;
  if(keys.has('arrowleft')) ME.yaw+=dt*1.8; if(keys.has('arrowright')) ME.yaw-=dt*1.8;
  const sprinting=keys.has('shift')||NET.run;
  if(mx||mz){ const len=Math.hypot(mx,mz)||1; const nx=mx/len, nz=mz/len; const sp=ME.fly?(sprinting?60:14)*dt:(ME.crouch?1.1:sprinting?4.4:2.2)*dt*FOOD.speed(); const s=Math.sin(ME.yaw), c=Math.cos(ME.yaw); const dx=(nx*c+nz*s)*sp, dz=(-nx*s+nz*c)*sp; if(ME.fly){ ME.x+=dx; ME.z+=dz; } else tryMove(dx,dz); }
  else if(ME.path.length){ const t=ME.path[0]; const dx=t.x-ME.x, dz=t.z-ME.z, d=Math.hypot(dx,dz); const sp=(ME.crouch?1.2:NET.run?4.4:2.4)*dt*FOOD.speed();
    const want=Math.atan2(-dx,-dz); if(d>0.4 && !ME.faceTo){ let dy=want-ME.yaw; dy=Math.atan2(Math.sin(dy),Math.cos(dy)); ME.yaw+=dy*Math.min(1,dt*3.2); }
    if(d<=sp){ ME.x=t.x; ME.z=t.z; ME.path.shift(); if(!ME.path.length){ if(ME.faceTo){ const f=ME.faceTo; ME.targetYaw=Math.atan2(-(f.x-ME.x),-(f.z-ME.z)); ME.targetPitch=Math.atan2(f.y-ME.eye,Math.hypot(f.x-ME.x,f.z-ME.z)); ME.faceTo=null; } const a=ME.afterArrive; ME.afterArrive=null; a&&a(); } }
    else if(ME.fly){ const f=Math.min(d,sp*6); ME.x+=dx/d*f; ME.z+=dz/d*f; } else { const ok=tryMove(dx/d*sp,dz/d*sp); if(!ok){ ME.path=[]; ME.afterArrive=null; } } }
  ME.vx=dt>0?(ME.x-prevX)/dt:0; ME.vz=dt>0?(ME.z-prevZ)/dt:0;
  const isMoving=(ME.vx*ME.vx+ME.vz*ME.vz)>0.04 && ME.seat<0;
  if(isMoving && !(ME.jy>0) && !ME.fly){
    ME.walkBob=(ME.walkBob||0)+dt*(sprinting?11:7.5);
    ME.stepTimer=(ME.stepTimer||0)+dt;
    if(ME.stepTimer>=(sprinting?0.28:0.38)){ ME.stepTimer=0; playStep(); }
    ME.bobY=Math.sin(ME.walkBob*2)*(ME.crouch?0.012:0.022);
  } else {
    ME.walkBob=(ME.walkBob||0)+dt*1.4;
    ME.stepTimer=0;
    ME.bobY=ME.seat<0&&!(ME.jy>0)?Math.sin(ME.walkBob*2)*0.003:0;
  }
  if(ME.targetYaw!=null){ let dy=ME.targetYaw-ME.yaw; dy=Math.atan2(Math.sin(dy),Math.cos(dy)); ME.yaw+=dy*Math.min(1,dt*5); ME.pitch+=(ME.targetPitch-ME.pitch)*Math.min(1,dt*5); if(Math.abs(dy)<0.01){ ME.targetYaw=null; } }
  const wasAir=ME.jy>0;
  const eyeT=ME.seat>=0?SEAT_KIND[SEATS[ME.seat].kind].eye:(ME.crouch?1.05:1.6)+floorY(ME.x,ME.z); ME.eb=(ME.eb??ME.eye); ME.eb+=(eyeT-ME.eb)*Math.min(1,dt*6); if(ME.jv||ME.jy){ ME.jv-=9.8*dt; ME.jy=Math.max(0,(ME.jy||0)+ME.jv*dt); if(ME.jy===0){ ME.jv=0; if(wasAir) playStep(); } } ME.eye=ME.eb+(ME.jy||0);
  if(ME.fly&&window.__flyStep){ window.__flyStep(dt); ME.eye=ME.fy; ME.eb=ME.fy; ME.jv=0; ME.jy=0; }
  applyCamera();
  // Zoom FOV lerp
  if(VIEW.mode!=='walk'||renderer.xr.isPresenting){ targetFov=baseFov; isRightMouseDown=false; }
  else if(!isRightMouseDown&&targetFov<baseFov){ targetFov+=(baseFov-targetFov)*Math.min(1,dt*6.5); if(Math.abs(baseFov-targetFov)<0.05) targetFov=baseFov; }
  if(Math.abs(camera.fov-targetFov)>0.02){ camera.fov+=(targetFov-camera.fov)*Math.min(1,dt*14); camera.updateProjectionMatrix(); }
  else if(camera.fov!==targetFov){ camera.fov=targetFov; camera.updateProjectionMatrix(); }
  // Punch timers & First-person hands (appear when holding items or punching)
  if(punchCooldown>0) punchCooldown=Math.max(0,punchCooldown-dt);
  if(punchAnimTimer>0) punchAnimTimer=Math.max(0,punchAnimTimer-dt);
  {
    const holdingBottle=window.__cineBt>=0, holdingDrink=myDrink>=0&&ME.seat<0&&!holdingBottle, holdingSnack=mySnack>=0&&ME.seat<0&&!holdingBottle, holdingSmoke=mySmoke>0;
    const showHand=VIEW.mode==='walk'&&!VIEW.thirdPerson&&!renderer.xr.isPresenting&&(holdingBottle||holdingDrink||holdingSnack||holdingSmoke||punchAnimTimer>0);
    fpHands.g.visible=showHand;
    if(showHand){
      fpHands.cup.visible=holdingDrink;
      fpHands.snack.visible=holdingSnack&&!holdingDrink;
      const sipAge=mySip?(Date.now()-mySip.a)/1000:99;
      const sipT=holdingBottle?(CIN.sipT||0):(holdingDrink&&sipAge>=0&&sipAge<1.4)?Math.sin((sipAge/1.4)*Math.PI):0;
      const pT=punchAnimTimer>0?Math.sin((1-punchAnimTimer/0.22)*Math.PI):0;
      const bobY=Math.sin((ME.walkBob||0)*2)*(isMoving?0.015:0.003);
      const bobX=Math.cos(ME.walkBob||0)*(isMoving?0.01:0.002);
      fpHands.rh.position.set(fpHands.baseX+bobX-sipT*0.14-pT*0.06, fpHands.baseY+bobY+sipT*0.14+pT*0.04, fpHands.baseZ+sipT*0.08-pT*0.24);
      fpHands.rh.rotation.set(sipT*0.55+pT*0.35, sipT*0.2, sipT*0.25);
    }
  }
  // Third-person local player avatar
  if(!ME.av){ ME.av=makeAvatar(myColor,myLook); ME.av.g.visible=false; ME.av.tag.visible=false; }
  {
    const show3P=VIEW.mode==='walk'&&VIEW.thirdPerson&&!renderer.xr.isPresenting;
    ME.av.g.visible=show3P;
    if(show3P){
      const st=ME.seat>=0&&SEATS[ME.seat]?SEATS[ME.seat]:null, spot=st&&SEAT_SPOT[st.kind];
      let ay=ME.fly?ME.fy-1.6:floorY(ME.x,ME.z); if(st) ay=seatPlace(st).y;
      const wBob=(isMoving&&!(ME.jy>0))?Math.abs(Math.sin((ME.walkBob||0)*1.2))*0.03:0;
      ME.av.g.position.set(ME.x,ay+(ME.jy||0)+wBob,ME.z);
      ME.av.g.rotation.y=ME.yaw; poseSeated(ME.av,st);
      ME.av.g.scale.y=ME.crouch&&ME.seat<0?0.66:1;
      ME.av.cup.visible=myDrink>=0&&!!DRINKS[myDrink];
      const sipAge=mySip?(Date.now()-mySip.a)/1000:99;
      const sipLift=(ME.av.cup.visible&&sipAge>=0&&sipAge<1.6)?Math.sin((sipAge/1.6)*Math.PI):0;
      if(spot) ME.av.cup.position.set(.18-sipLift*.06,spot[1]-ay-.045+sipLift*.28,-spot[0]-sipLift*.06);
      else ME.av.cup.position.set(.27-sipLift*.12,.92+sipLift*.45,-.16-sipLift*.06);
      ME.av.cup.rotation.x=sipLift*.45;
    }
  }
  marker.material.opacity=Math.max(0,marker.material.opacity-dt*1.2);
  if(hl.visible){ const t=(performance.now()-hl.userData.t0)/1000; hl.material.opacity=0.6+0.4*Math.sin(t*5); hlGlow.material.opacity=0.18+0.12*Math.sin(t*5); if(t>40){ hl.visible=hlGlow.visible=false; } }
  // lanterns sway
  const tt=clock.elapsedTime;
  clouds.forEach((cloud,i)=>{
    const bearing=i*Math.PI*2/clouds.length+tt*.006;
    cloud.position.set(65*Math.cos(bearing),22+i%3*10,courtAxis+65*Math.sin(bearing));
  });
  // sync lighting & color temperature from room peers
  {
    let bestLt=null;
    for(const [,o] of others){ const lt=o.p&&o.p.lt; if(lt&&typeof lt==='object'&&num(lt.at)>lightSyncAt&&(!bestLt||lt.at>bestLt.at)) bestLt=lt; }
    if(bestLt){
      lightSyncAt=bestLt.at;
      const nv=Math.max(0,Math.min(100,Math.round(num(bestLt.v,45))));
      const nk=Math.max(2200,Math.min(6500,Math.round(num(bestLt.k,3000)/100)*100));
      if(+lightLevel.value!==nv||+ctemp.value!==nk){
        lightLevel.value=String(nv); ctemp.value=String(nk);
        LS.set('hk-light',lightLevel.value); LS.set('hk-ctemp',ctemp.value);
        applyLighting();
      }
    }
  }
  // others (velocity prediction + smooth interpolation + walking bob + coffee sip + punch knockback)
  const nowMs=performance.now(), nowEpoch=Date.now(), rAlpha=1-Math.exp(-16*dt), yAlpha=1-Math.exp(-18*dt);
  for(const [,o] of others){ const p=o.p; const s=num(p.s,-1); let x=num(p.x), z=num(p.z), r=num(p.r), y=num(p.fy)>0?num(p.fy)-1.6:floorY(x,z);
    if(s>=0&&SEATS[s]){ const P=seatPlace(SEATS[s]); x=P.x; z=P.z; r=P.yaw; y=P.y; }
    else { const lead=Math.min(0.18,Math.max(0,(nowMs-(o.lastNet||nowMs))/1000)); x+=num(p.vx)*lead; z+=num(p.vz)*lead; }
    // remote punch hit notification
    if(p.ht&&typeof p.ht==='object'&&num(p.ht.at)>0&&o.htAt!==p.ht.at){
      o.htAt=p.ht.at;
      if(p.ht.to&&room&&NET.peers){
        const tgt=others.get(p.ht.to);
        if(tgt){ tgt.knockVx=num(p.ht.kx); tgt.knockVz=num(p.ht.kz); tgt.knockTime=0.22; tgt.hitStreak=(tgt.hitStreak||0)+1; tgt.hitResetTimer=4.0; if(tgt.hitStreak>=6){ tgt.hitStreak=0; tgt.fallenTimer=4.5; } }
      }
      if(p.ht.to&&!(others.get(p.ht.to))&&nowEpoch-p.ht.at<1500){
        tryMove(num(p.ht.kx)*0.12,num(p.ht.kz)*0.12); playPunch();
      }
    }
    o.av.cup.visible=num(p.dk,-1)>=0&&!!DRINKS[p.dk];
    { const st=s>=0&&SEATS[s]?SEATS[s]:null, spot=st&&SEAT_SPOT[st.kind];
      const spObj=p.sp&&typeof p.sp==='object'?p.sp:null;
      const spAt=spObj?num(spObj.a||spObj.at):0;
      if(spAt>0&&o.sipAtKey!==spAt){ o.sipAtKey=spAt; if(Math.abs(nowEpoch-spAt)<12000) o.sipLocalAt=nowMs; }
      const sipAge=o.sipLocalAt?(nowMs-o.sipLocalAt)/1000:99;
      const sipLift=(o.av.cup.visible&&sipAge>=0&&sipAge<1.6)?Math.sin((sipAge/1.6)*Math.PI):0;
      if(spot) o.av.cup.position.set(.18-sipLift*.06,spot[1]-y-.045+sipLift*.28,-spot[0]-sipLift*.06);
      else o.av.cup.position.set(.27-sipLift*.12,.92+sipLift*.45,-.16-sipLift*.06);
      o.av.cup.rotation.x=sipLift*.45;
      const sn=num(p.sn,-1); if(o.av.snI!==sn){ o.av.snI=sn; o.av.g.remove(o.av.snack); o.av.snack=snackMesh(SNACKS[sn]?sn:-1); o.av.g.add(o.av.snack); }
      if(spot) o.av.snack.position.set(-.2,spot[1]-y-.04,-spot[0]-.08); else o.av.snack.position.set(-.27,.86,-.14); }
    const g=o.av.g;
    if(o.hitResetTimer>0){ o.hitResetTimer-=dt; if(o.hitResetTimer<=0) o.hitStreak=0; }
    if(o.knockTime>0){
      o.knockTime=Math.max(0,o.knockTime-dt);
      const nx=g.position.x+(o.knockVx||0)*dt, nz=g.position.z+(o.knockVz||0)*dt;
      if(walkable(nx,g.position.z)) g.position.x=nx;
      if(walkable(g.position.x,nz)) g.position.z=nz;
    } else {
      const dSq=(x-g.position.x)**2+(z-g.position.z)**2;
      if(dSq>36){ g.position.x=x; g.position.z=z; } else { g.position.x+=(x-g.position.x)*rAlpha; g.position.z+=(z-g.position.z)*rAlpha; }
    }
    poseSeated(o.av,s>=0&&SEATS[s]&&!(o.fallenTimer>0)?SEATS[s]:null);
    if(o.fallenTimer>0){ o.fallenTimer=Math.max(0,o.fallenTimer-dt); g.rotation.x=-Math.PI/2; g.position.y=0.2; }
    else {
      g.rotation.x=o.knockTime>0?-0.22:0;
      const spSq=num(p.vx)**2+num(p.vz)**2; let wBob=0;
      if(spSq>0.08&&s<0){ o.walkPhase=(o.walkPhase||0)+dt*9; wBob=Math.abs(Math.sin(o.walkPhase))*0.03; }
      o.by=(o.by??g.position.y); o.by+=(y-o.by)*Math.min(1,dt*8); g.position.y=o.by+(o.jyNow||0)+wBob;
    }
    let dy=r-g.rotation.y; dy=Math.atan2(Math.sin(dy),Math.cos(dy)); g.rotation.y+=dy*yAlpha; }
  // seat cushions show occupancy
  presT+=dt; if(presT>0.12){ presT=0; pushPresence(); }
  tickExtras(dt); tickLights(dt);
  // XR snap turn
  if(renderer.xr.isPresenting){
    const axes=Array.from(renderer.xr.getSession().inputSources,src=>src.gamepad?.axes?.[2]||0);
    const turn=axes.find(axis=>Math.abs(axis)>0.7);
    if(turn && !snapHeld){
      const offset=offsetFromRig();
      const angle=-Math.sign(turn)*Math.PI/6;
      const x=offset.x, z=offset.z;
      ME.x+=x-(x*Math.cos(angle)+z*Math.sin(angle));
      ME.z+=z-(-x*Math.sin(angle)+z*Math.cos(angle));
      ME.yaw+=angle; snapHeld=true;
    } else if(axes.every(axis=>Math.abs(axis)<0.3)) snapHeld=false;
    scene.updateMatrixWorld();
    for(const {controller,line} of controllers){
      if(!controller.visible) continue;
      const hit=vrPick(controller);
      line.scale.z=hit?.distance||6;
      const valid=hit && hit.object.userData.type!=='block' &&
        (hit.object.userData.type!=='floor'||walkable(hit.point.x,hit.point.z));
      line.material.color.setHex(valid?0xa8e6ac:0xffe2a8);
    }
  }
}
function tryMove(dx,dz){ if(walkable(ME.x+dx,ME.z+dz)){ ME.x+=dx; ME.z+=dz; return true; } if(walkable(ME.x+dx,ME.z)){ ME.x+=dx; return true; } if(walkable(ME.x,ME.z+dz)){ ME.z+=dz; return true; } return false; }
/* ---------------- performance: merge static meshes, share a small pool of point lights ---------------- */
function mergeGeos(list){ let nv=0, ni=0; for(const g of list){ nv+=g.attributes.position.count; ni+=g.index?g.index.count:g.attributes.position.count; }
  const pos=new Float32Array(nv*3), nor=new Float32Array(nv*3), uv=new Float32Array(nv*2), idx=new Uint32Array(ni); let vo=0, io=0;
  for(const g of list){ const n=g.attributes.position.count; pos.set(g.attributes.position.array.subarray(0,n*3),vo*3);
    if(g.attributes.normal) nor.set(g.attributes.normal.array.subarray(0,n*3),vo*3); if(g.attributes.uv) uv.set(g.attributes.uv.array.subarray(0,n*2),vo*2);
    if(g.index){ const a=g.index.array; for(let i=0;i<a.length;i++) idx[io+i]=a[i]+vo; io+=a.length; } else { for(let i=0;i<n;i++) idx[io+i]=vo+i; io+=n; }
    vo+=n; }
  const out=new THREE.BufferGeometry(); out.setAttribute('position',new THREE.BufferAttribute(pos,3)); out.setAttribute('normal',new THREE.BufferAttribute(nor,3)); out.setAttribute('uv',new THREE.BufferAttribute(uv,2)); out.setIndex(new THREE.BufferAttribute(idx,1)); out.computeBoundingSphere(); out.computeBoundingBox(); return out; }
let LIGHT_POOL=[], VLIGHTS=[];
// one material per look: a texture's repeat/offset is baked into the UVs so walls sharing a texture merge into one draw
const canonMats=new Map();
function canonical(m){ const live=[lampPaper,lanternSilk,...ZL_LIVE,...LAMPS.map(l=>l.mat)]; if(live.includes(m)) return {m,uv:null};
  const t=m.map; const sig=[m.type,m.color?m.color.getHex():'',m.roughness,m.metalness,m.emissive?m.emissive.getHex():'',m.emissiveIntensity,m.side,m.transparent,m.opacity,m.flatShading,m.toneMapped,m.fog,m.depthWrite,m.alphaTest,m.vertexColors,
    t?t.source.uuid+','+t.wrapS+','+t.wrapT+','+t.colorSpace+','+t.anisotropy+','+t.flipY:''].join('|');
  let uv=null; if(t){ if(t.matrixAutoUpdate) t.updateMatrix(); const e=t.matrix.elements; if(!(e[0]===1&&e[4]===1&&e[6]===0&&e[7]===0&&e[1]===0&&e[3]===0)) uv=t.matrix.clone(); }
  let c=canonMats.get(sig); if(!c){ c=m; if(uv){ c=m.clone(); c.map=t.clone(); c.map.repeat.set(1,1); c.map.offset.set(0,0); c.map.rotation=0; c.map.updateMatrix(); } canonMats.set(sig,c); }
  return {m:c,uv}; }
await __yield(0.86);
// {% endraw %}
