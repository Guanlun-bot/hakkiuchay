// 線上書齋的截圖工具（給 Claude 檢查畫面用，不上線）
// 先在另一個終端機跑 python3 vr/_parts/serve.py；需要 playwright 與 three@0.160.0（npm i --no-save three@0.160.0 playwright）
// 用法：node vr/_parts/tools/shot.mjs '[["名稱",[從mx,my],[看向mx,my],離地高度,俯仰]]' [map]
//   第六項可給眼睛的遊戲 y（地底用）；座標用輿圖單位（110 單位＝1 公里）；圖存在 /tmp/shots/<名稱>.png，640×360，盡量少拍
import fs from 'fs'; import path from 'path'; import { createRequire } from 'module';
const req=createRequire(import.meta.url), here=path.dirname(new URL(import.meta.url).pathname);
const PW=process.env.PLAYWRIGHT||(fs.existsSync('/opt/npm-tools/node_modules/playwright/index.mjs')?'/opt/npm-tools/node_modules/playwright/index.mjs':req.resolve('playwright'));
const { chromium }=await import(PW);
const three=fs.readFileSync(process.env.THREE_JS||req.resolve('three/build/three.module.js'),'utf8');
const src=fs.readFileSync(path.join(here,'..','18z-township.js'),'utf8');
const T=new Function('LAND','THREE',src+';return TWP;')({FIELD:{x0:-195,x1:250,z0:-185,z1:205}},{});
const VIEWS=JSON.parse(process.argv[2]||'[]'), views=VIEWS.filter(v=>v[1]!=='cave').map(([n,f,t,up,pitch,abs])=>{ const [x,z]=T.m2l(...f), [tx,tz]=T.m2l(...t); return [n,x,z,Math.atan2(-(tx-x),-(tz-z)),pitch||0,abs!=null?abs:T.elevM(...f)-8+(up||20)]; });   /* abs: the eye's game y outright (e.g. underground) */
const extra=process.argv[3]||''; fs.mkdirSync('/tmp/shots',{recursive:true});
const b=await chromium.launch({executablePath:fs.existsSync('/usr/bin/google-chrome')?'/usr/bin/google-chrome':undefined,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:640,height:360}});
const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR '+e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push('CONSOLE '+m.text().slice(0,300)); });
await p.route('**/*',async r=>{ const u=r.request().url();
  if(u.includes('three@0.160.0/build/three.module.js')) return r.fulfill({body:three,contentType:'application/javascript'});
  if(u.startsWith('http://localhost:8000/vr/vr-house.js')){ const res=await r.fetch(); let t=await res.text(); t=t.replace('const ME={x:-4.9','const ME=window.__ME={x:-4.9').replace('const scene = new THREE.Scene();','const scene = window.__scene = new THREE.Scene();'); return r.fulfill({body:t,contentType:'application/javascript'}); }
  if(u.startsWith('http://localhost:8000')) return r.continue(); return r.abort(); });
await p.goto('http://localhost:8000/vr/?room=TEST-SHOT#day',{waitUntil:'domcontentloaded'}); await p.waitForTimeout(3000);
await p.evaluate(()=>{ const n=document.querySelector('#gname'); if(n){ n.value='測試'; n.dispatchEvent(new Event('input',{bubbles:true})); } });
await p.click('#genter',{timeout:20000}).catch(e=>errs.push('click '+e.message));
for(let i=0;i<150;i++){ await p.waitForTimeout(2000); if(await p.evaluate(()=>!!window.__entered&&!!window.__ME)) break; }
await p.waitForTimeout(4000);
for(const [name,,k,dyaw,pitch] of VIEWS.filter(v=>v[1]==='cave')){   /* ["名稱","cave",沿洞多遠0–1,轉頭,俯仰]：在暗河裡拍 */
  await p.evaluate(([k,dyaw,pitch])=>{ window.__ME.fly=false; window.__caveEnter(k); window.__ME.yaw+=dyaw||0; window.__ME.pitch=pitch||0; },[k,dyaw,pitch]);
  await p.waitForTimeout(3000); await p.screenshot({path:`/tmp/shots/${name}.png`}); console.log('/tmp/shots/'+name+'.png'); }
for(const [name,x,z,yaw,pitch,fy] of views){
  await p.evaluate(([x,z,yaw,pitch,fy])=>{ const M=window.__ME; M.path=[]; M.x=x; M.z=z; M.yaw=yaw; M.targetYaw=null; M.pitch=pitch; M.fly=true; M.fy=fy; },[x,z,yaw,pitch,fy]);
  await p.waitForTimeout(3000); await p.screenshot({path:`/tmp/shots/${name}.png`}); console.log('/tmp/shots/'+name+'.png'); }
if(extra.includes('map')){ await p.evaluate(()=>{ window.__ME.fly=false; window.__ME.x=60; window.__ME.z=10; window.__tmap.show(); }); await p.waitForTimeout(4000); await p.screenshot({path:'/tmp/shots/map.png'}); console.log('/tmp/shots/map.png'); }
const bad=errs.filter(e=>!e.includes('ERR_FAILED')&&!e.includes('404')&&!e.includes('NaN')); if(bad.length) console.log(bad.slice(0,10).join('\n'));
await b.close();
