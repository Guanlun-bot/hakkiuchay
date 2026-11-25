// 海拔表（不用開瀏覽器）：node vr/_parts/tools/elev.mjs '[mx…]' '[my…]'，或 node elev.mjs places 列出各地名海拔
import fs from 'fs'; import path from 'path';
const here=path.dirname(new URL(import.meta.url).pathname), src=fs.readFileSync(path.join(here,'..','18z-township.js'),'utf8');
const T=new Function('LAND','THREE',src+';return TWP;')({FIELD:{x0:-195,x1:250,z0:-185,z1:205}},{});
if(process.argv[2]==='places'){ for(const p of T.PLACES){ const [mx,my]=T.l2m(p.x,p.z); console.log(p.id.padEnd(8),String(Math.round(mx)).padStart(6),String(Math.round(my)).padStart(5),T.elevM(mx,my).toFixed(0).padStart(6)); } process.exit(); }
const xs=JSON.parse(process.argv[2]||'[0,200,400,600,800,900]'), ys=JSON.parse(process.argv[3]||'[0,200,350,450,600,750]');
console.log('my\\mx'.padStart(6)+xs.map(x=>String(x).padStart(6)).join(''));
for(const my of ys) console.log(String(my).padStart(6)+xs.map(mx=>T.elevM(mx,my).toFixed(0).padStart(6)).join(''));
