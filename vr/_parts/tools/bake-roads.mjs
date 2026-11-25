// 路線算好存起來（改了 18z-township.js 的 ROADS2 之後跑一次）：node vr/_parts/tools/bake-roads.mjs
import fs from 'fs'; import path from 'path';
const here=path.dirname(new URL(import.meta.url).pathname), src=fs.readFileSync(path.join(here,'..','18z-township.js'),'utf8');
const T=new Function('LAND','THREE',src+';return TWP;')({FIELD:{x0:-195,x1:250,z0:-185,z1:205}},{});
const out={}; for(const R of T.ROADS) if(R.key) out[R.id]={k:R.key,m:R.M.map(([x,y])=>[+x.toFixed(1),+y.toFixed(1)])};
fs.writeFileSync(path.join(here,'..','18y-roads-baked.js'),'// {% raw %}\n// 斗安鄉道路：A* 算好的路線（由 tools/bake-roads.mjs 產生，不要手改）\nconst ROADS_BAKED='+JSON.stringify(out)+';\n// {% endraw %}\n');
console.log('baked',Object.keys(out).length,'roads');
