// {% raw %}
/* ================= 斗安鄉：全鄉的地形資料（照《斗安鄉志》的輿圖）=================
   The whole township as data, in the game's own coordinates. The house stays where it always was (the game's origin);
   the township is laid round it. 許宅 stands on the west bank of 大陂溪 just north of 渡頭站, beside 斗安大橋, its gate
   facing north-east down the river toward the mouth and the sea. So the game's +x is north-east and +z south-east:
     geo east E = (x+z)/√2, geo north N = (x−z)/√2;   x = (E+N)/√2, z = (E−N)/√2.
   The gazetteer's map (輿圖, 1000×660, north up) is the base: one map unit is S metres (110 units to the kilometre), the
   house sits at (HX, HY) on it. Heights are metres above the sea; the game's y is height − E0 (the house's ground).
   Everything here is plain data and functions; the meshes are made in 19-land (ground, water) and 19c (buildings,
   rail, roads). The house's own fields (LAND.FIELD) stay flat: the township's ground slips under them. */
var TWP=(()=>{
  const S=1000/110, HX=769.7, HY=340.3, R2=Math.SQRT1_2, E0=8;
  const toL=(E,N)=>[(E+N)*R2,(E-N)*R2], toG=(x,z)=>[(x+z)*R2,(x-z)*R2];
  const m2g=(mx,my)=>[(mx-HX)*S,(HY-my)*S], g2m=(E,N)=>[HX+E/S,HY-N/S];
  const m2l=(mx,my)=>toL(...m2g(mx,my)), l2m=(x,z)=>g2m(...toG(x,z));
  const NORTH={x:R2,z:-R2}, EAST={x:R2,z:R2};   // the compass in the game's coordinates
  const sm=(x,a,b)=>{ const t=Math.min(1,Math.max(0,(x-a)/(b-a))); return t*t*(3-2*t); };
  const h2=(x,z)=>{ const h=Math.sin(x*127.1+z*311.7)*43758.5453; return h-Math.floor(h); };
  const vn=(x,z)=>{ const xi=Math.floor(x), zi=Math.floor(z), xf=x-xi, zf=z-zi, u=xf*xf*(3-2*xf), v=zf*zf*(3-2*zf); const a=h2(xi,zi), b=h2(xi+1,zi), c=h2(xi,zi+1), d=h2(xi+1,zi+1); return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v; };
  const fbm=(x,z,o=4)=>{ let s=0,a=.5,f=1; for(let i=0;i<o;i++){ s+=a*vn(x*f+i*17.3,z*f-i*9.1); a*=.5; f*=2.03; } return s; };
  const ridged=(x,z,o=5)=>{ let s=0,a=.55,f=1,w=1; for(let i=0;i<o;i++){ let n=1-Math.abs(vn(x*f+i*31.7,z*f+i*11.3)*2-1); n*=n*w; w=Math.min(1,n*1.8); s+=n*a; a*=.5; f*=2.07; } return s; };
  const segD=(px,pz,ax,az,bx,bz)=>{ const dx=bx-ax, dz=bz-az, l=dx*dx+dz*dz||1; let t=((px-ax)*dx+(pz-az)*dz)/l; t=t<0?0:t>1?1:t; return [Math.hypot(ax+dx*t-px,az+dz*t-pz),t]; };
  const inPoly=(x,z,P)=>{ let c=false; for(let i=0,j=P.length-1;i<P.length;j=i++){ const xi=P[i][0],zi=P[i][1],xj=P[j][0],zj=P[j][1]; if(((zi>z)!==(zj>z))&&(x<(xj-xi)*(z-zi)/(zj-zi)+xi)) c=!c; } return c; };
  const polyD=(x,z,P)=>{ let d=1e9; for(let i=0;i<P.length;i++){ const a=P[i], b=P[(i+1)%P.length], q=segD(x,z,a[0],a[1],b[0],b[1])[0]; if(q<d) d=q; } return d; };
  const sdPoly=(x,z,P)=>polyD(x,z,P)*(inPoly(x,z,P)?1:-1);

  // ---- the map's land, in map units
  const ANCHORS=[[132,320,182],[186,400,138],[262,352,110],[340,320,86],[392,250,82],[476,330,70],[300,200,112],[230,130,140],[200,50,160],[350,80,118],
    [450,150,86],[560,120,62],[650,110,48],[760,110,26],[860,150,11],[915,200,5],[830,250,9],[790,300,8.5],[752,338,8],[770,340,8],[805,335,7.5],[870,290,5],
    [630,430,21],[548,478,27],[700,418,19.5],[735,386,19],[745,402,15],[772,385,10],[808,412,12],[790,450,15],[700,470,23],[600,505,40],[935,300,2.5],[955,318,2.5],[930,420,4],[915,560,6],[860,610,14],
    [520,420,30],[460,430,45],[300,430,95],[200,430,128]];
  const TERR=[[520,210],[580,192],[650,190],[700,195],[730,215],[736,300],[718,345],[695,350],[660,352],[640,360],[530,390],[514,300]];   // 河階 中階 (斗安)
  const POOL=[[671.2,377.6],[673.9,367.7],[681,364.4],[689.9,367.2],[698.7,368.3],[706.9,363.9],[715.2,365.5],[722.9,371],[722.9,380.9],[719.6,389.2],[712.4,396.3],[701.4,399.6],[690.4,398.5],[680.5,396.3],[673.9,388.6]];
  const coastX=my=>930+6*Math.sin(my*.045)+42*Math.exp(-(((my-318)/42)**2));
  const bump=t=>t<1?(1-t*t)**2:0;
  function elevM(mx,my){
    let sw=0, se=0; for(const [ax,ay,ae] of ANCHORS){ const d2=(mx-ax)**2+(my-ay)**2+60, w=1/(d2*d2); sw+=w; se+=w*ae; } let e=se/sw;
    e+=4*(fbm(mx*.03,my*.03,3)-.5);
    // the 湖濱下階 (30 m) along the terrace's south-east foot, a 12 m low cliff down to the pool's lowland
    const sd=sdPoly(mx,my,TERR);
    if(mx>590&&mx<745&&my>335&&my<400&&sd<0&&sd>-18) e=e+(30+1.2*(fbm(mx*.2,my*.2,2)-.5)-e)*sm(sd,-13.6,-12.3);
    // the 中階 terrace (45 m) with 和尚崙 (70 m) at its north-east end: a sharp cliff on the side of the pool, gentle elsewhere
    { const sharp=my>300&&mx>560, w=sharp?sm(sd,-.3,.7):sm(sd,-10,10); if(w>0){ const eT=45+25*bump(Math.hypot(mx-700,my-238)/30)+1.5*(fbm(mx*.08,my*.08,2)-.5); e=e+(eT-e)*w; } }
    // 磺水嶺 east of the river mouth: a round hill (120 m) and its north spur over the hot-spring street
    { const n=.85+.3*fbm(mx*.05+7,my*.05,3); e+=112*bump(Math.hypot(mx-868,my-394)/72*(1+.12*(vn(mx*.07,my*.07)-.5)))*n+52*bump(Math.hypot(mx-848,my-322)/38)*n; }
    // the 中央山脈 to the west, the 南稜 hills to the south, low hills north beyond the map
    const r=ridged(mx*.011,my*.011,5);
    { const w=172-mx; if(w>0) e=Math.max(e,175+2700*(1-Math.exp(-w/650))*sm(w,0,130)*(.68+.62*r)); }
    { const s=my-470+12*Math.sin(mx*.02); if(s>0) e+=600*(1-Math.exp(-s/260))*(.55+.8*r)*(1-sm(mx,880,960)); }
    { const s=-40-my; if(s>0) e+=240*(1-Math.exp(-s/380))*(.5+.8*r)*(1-sm(mx,820,900)); }
    // the sea
    { const xc=coastX(my); if(mx>xc-5) e=Math.min(e,2.4-(mx-(xc-5))*.5); }
    return e; }

  // ---- water: rivers as polylines with the water's height at each point ([kind,a,b,height]: 'm' map units, 'l' game x,z)
  const pt=p=>p[0]==='l'?[p[1],p[2],p[3]]:[...m2l(p[1],p[2]),p[3]];
  const FIELD={x0:-195,x1:250,z0:-185,z1:205};   // the house's fields (as LAND.FIELD): flat, made by 19-land
  const fieldOut=(x,z)=>Math.hypot(Math.max(FIELD.x0-x,0,x-FIELD.x1),Math.max(FIELD.z0-z,0,z-FIELD.z1));
  // the land before the water is cut in
  const landL=(x,z)=>{ const [mx,my]=l2m(x,z); return elevM(mx,my); };
  const RIVERS=[
    {id:'up',hw:14,dep:2.2,P:[['m',-200,440,330],['m',-60,430,215],['m',0,425,190],['m',60,418,166],['m',120,410,148],['m',190,405,132],['m',260,415,112],['m',330,450,84],['m',420,458,52],['m',500,463,33],['m',560,466,25],['m',610,458,21],['m',650,425,18.8],['m',666,405,18.2],['m',676,394,18]].map(pt)},
    {id:'down',hw:16,dep:2.4,P:[['m',724,384,18],['m',740,378,15],['l',-300,150,8.7],['l',-190,183,8.05],['l',-60,180,7.95],['l',40,150,7.92],['l',95,85,7.9],['l',113,25,7.9],['l',150,-8,7.88],['l',230,-5,7.85],['l',330,40,7.7],['l',775,257,5],['l',1148,270,2.5],['l',1437,302,.4],['l',1680,400,-.6]].map(pt)}];
  // the rivers every 30 m, the water never above the land round it (but kept as given along the house's fields)
  for(const R of RIVERS){ const Q=[]; let last=1e9; for(let i=0;i<R.P.length-1;i++){ const a=R.P[i], b=R.P[i+1], n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/30));
      for(let k=0;k<n;k++){ const t=k/n, x=a[0]+(b[0]-a[0])*t, z=a[1]+(b[1]-a[1])*t; let w=a[2]+(b[2]-a[2])*t; if(fieldOut(x,z)>60) w=Math.min(w,landL(x,z)-.8); w=Math.min(w,last); last=w; Q.push([x,z,w]); } }
    const e=R.P[R.P.length-1]; Q.push([e[0],e[1],Math.min(e[2],last)]); R.P=Q; }
  // the brooks: their water just under the land (worked out once the land is known), flowing into the river nearest their mouth
  const BROOKS=[['jq',[[60,340],[90,360],[130,385],[150,404]]],['qz',[[120,230],[140,300],[150,360],[165,405]]],['ht',[[95,560],[100,500],[115,460],[130,412]]],['bs',[[0,380],[60,388],[120,398],[150,404]]],['hs',[[846,328],[830,345],[812,358]]]];
  const POOL_L=POOL.map(([a,b])=>m2l(a,b)), POOL_Y=18;
  for(const [id,pts] of BROOKS){ const P=pts.map(([a,b])=>m2l(a,b));
    let best=null, bd=1e9; const [ex,ez]=P[P.length-1]; for(const R of RIVERS) for(let i=0;i<R.P.length-1;i++){ const a=R.P[i], b=R.P[i+1], [d,t]=segD(ex,ez,a[0],a[1],b[0],b[1]); if(d<bd){ bd=d; best=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t]; } }
    if(best&&bd<600) P.push([best[0],best[1]]);
    // every 30 m along, the water just under the land, never running uphill
    const Q=[]; let last=1e9; for(let i=0;i<P.length-1;i++){ const [ax,az]=P[i], [bx,bz]=P[i+1], n=Math.max(1,Math.ceil(Math.hypot(bx-ax,bz-az)/30)); for(let k=0;k<n;k++){ const x=ax+(bx-ax)*k/n, z=az+(bz-az)*k/n, w=Math.min(last-.05,landL(x,z)-1.2); last=w; Q.push([x,z,w]); } }
    Q.push([...P[P.length-1],best&&bd<600?Math.max(best[2],last-.05):last-.05]);
    RIVERS.push({id,hw:id==='hs'?3:4.5,dep:1,P:Q,brook:true}); }
  for(const R of RIVERS){ let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9; for(const [x,z] of R.P){ x0=Math.min(x0,x); x1=Math.max(x1,x); z0=Math.min(z0,z); z1=Math.max(z1,z); } R.box=[x0-80,x1+80,z0-80,z1+80]; }
  // where the nearest river is: distance from the centre line and the water's height there
  // each river's segments in 150 m cells (with 95 m to spare round each), so a point only looks at the few near it
  const CELL=150; for(const R of RIVERS){ R.cells=new Map(); const P=R.P; for(let i=0;i<P.length-1;i++){ const a=P[i], b=P[i+1];
      for(let cx=Math.floor((Math.min(a[0],b[0])-95)/CELL);cx<=Math.floor((Math.max(a[0],b[0])+95)/CELL);cx++) for(let cz=Math.floor((Math.min(a[1],b[1])-95)/CELL);cz<=Math.floor((Math.max(a[1],b[1])+95)/CELL);cz++){ const k=cx+','+cz; if(!R.cells.has(k)) R.cells.set(k,[]); R.cells.get(k).push(i); } } }
  const riverAt=(x,z,R)=>{ let bd=1e9, w=0; const P=R.P, L=R.cells.get(Math.floor(x/CELL)+','+Math.floor(z/CELL)); if(!L) return [bd,w]; for(const i of L){ const a=P[i], b=P[i+1], [d,t]=segD(x,z,a[0],a[1],b[0],b[1]); if(d<bd){ bd=d; w=a[2]+(b[2]-a[2])*t; } } return [bd,w]; };
  function water(x,z){   // {y (water height), d (distance inside the water; <0 outside)} or null
    let best=null;
    for(const R of RIVERS){ const B=R.box; if(x<B[0]||x>B[1]||z<B[2]||z>B[3]) continue; const [d,w]=riverAt(x,z,R); if(d<R.hw&&(!best||R.hw-d>best.d)) best={y:w,d:R.hw-d,r:R}; }
    if(inPoly(x,z,POOL_L)){ const d=polyD(x,z,POOL_L); if(!best||d>best.d) best={y:POOL_Y,d,pool:true}; }
    const [mx,my]=l2m(x,z); if(mx>coastX(my)-2&&elevM(mx,my)<0) return {y:0,d:99,sea:true};
    return best; }
  function elevL(x,z){
    const [mx,my]=l2m(x,z); let e=elevM(mx,my);
    for(const R of RIVERS){ const B=R.box; if(x<B[0]||x>B[1]||z<B[2]||z>B[3]) continue; const [d,w]=riverAt(x,z,R), hw=R.hw;
      if(d<hw+70){ const bed=R.brook?(d<hw+9?w-.6:w-.6+(d-hw-9)*.35):d<hw?w-R.dep*(1-(d/hw)**2)-.3:w+.4+(d-hw)*.22; if(bed<e) e=bed; } }   // the brooks are narrower than the 20 m grid: a broad wet floor keeps them in sight
    { const d=polyD(x,z,POOL_L), inside=inPoly(x,z,POOL_L); const bed=inside?POOL_Y-1.4-9.6*sm(d,0,130):POOL_Y+.5+d*.2; if(inside||d<70) e=Math.min(e,bed); }
    // the house's fields: flat and just under the paddies' own ground, easing out to the land round them
    const fo=fieldOut(x,z); if(fo<45) e=E0-.42+(e-(E0-.42))*sm(fo,0,45);
    return e; }

  // ---- the land as a grid of heights (geo axes, 20 m): the meshes and the walking both read it
  const G={E0:-7400,N0:-3700,st:20,nE:0,nN:0,h:null};
  G.nE=Math.round((3900-G.E0)/G.st); G.nN=Math.round((3700-G.N0)/G.st);
  G.h=new Float32Array((G.nE+1)*(G.nN+1));
  for(let j=0;j<=G.nN;j++) for(let i=0;i<=G.nE;i++){ const E=G.E0+i*G.st, N=G.N0+j*G.st, [x,z]=toL(E,N); G.h[j*(G.nE+1)+i]=elevL(x,z); }
  const gridH=(E,N)=>{ const fx=(E-G.E0)/G.st, fz=(N-G.N0)/G.st, i=Math.floor(fx), j=Math.floor(fz); if(i<0||j<0||i>=G.nE||j>=G.nN) return null;
    const u=fx-i, v=fz-j, W=G.nE+1, k=j*W+i; return (G.h[k]*(1-u)+G.h[k+1]*u)*(1-v)+(G.h[k+W]*(1-u)+G.h[k+W+1]*u)*v; };
  // height of the ground (metres above the sea) anywhere: the grid inside the township, the bare function beyond it
  const heightAt=(x,z)=>{ const [E,N]=toG(x,z), g=gridH(E,N); if(g!=null) return g; const [mx,my]=g2m(E,N); return elevM(mx,my); };

  // ---- places on the map (names are in _data/vr.yml › npc `twp.<id>`: 甲＝名字，乙＝一句介紹)
  const PL=(id,kind,mx,my,extra)=>Object.assign({id,kind,mx,my},extra||{});
  const PLACES=[
    PL('house','house',0,0,{l:[0,0]}), PL('dou','town',640,300,{n:70,r:9}), PL('hsl','vil',700,238,{n:6,r:4}), PL('gp','vil',630,430,{n:22,r:6}), PL('zhl','vil',548,478,{n:16,r:4}),
    PL('fw','vil',476,330,{n:38,r:7}), PL('ry','vil',418,370,{n:12,r:4,jp:1}), PL('sfs','vil',340,320,{n:14,r:4}), PL('xfw','vil',392,250,{n:30,r:7}), PL('wc','vil',262,352,{n:24,r:5}),
    PL('bt','sight',186,400), PL('qlc','vil',132,320,{n:20,r:6}), PL('dh','school',505,310), PL('ly','vil',958,318,{n:32,r:5}), PL('qzw','sight',100,250), PL('zx','vil',86,520,{n:16,r:5}),
    PL('dt','vil',752,338), PL('kll','vil',812,420,{n:26,r:6}), PL('hsj','vil',830,322,{n:16,r:3.5}), PL('pool','sight',697,382), PL('chim','sight',575,402),
    PL('t_dag','temple',612,334), PL('t_yas','temple',707,228), PL('t_fl','temple',722,250), PL('t_fx','temple',488,318), PL('t_sz','temple',362,340), PL('t_bj','temple',562,458),
    PL('t_ws','temple',690,358), PL('t_sx','temple',800,384), PL('t_ys','temple',850,318), PL('t_ym','temple',400,236), PL('t_wu','temple',270,342), PL('t_bg','temple',146,334),
    PL('c_kl','church',826,426), PL('c_zx','church',128,552), PL('c_dou','church',600,286),
    PL('s_ly','station',955,321), PL('s_hs','station',812,338), PL('s_dt','station',762,350,{l:[-112,13]}), PL('s_dou','station',558,305), PL('s_fw','station',475,330), PL('s_sfs','station',372,345), PL('s_wc','station',262,368), PL('s_ql','station',160,348)];
  for(const p of PLACES){ if(p.l){ const [mx,my]=l2m(p.l[0],p.l[1]); p.mx=mx; p.my=my; } else p.l=m2l(p.mx,p.my); p.x=p.l[0]; p.z=p.l[1]; }
  const place=id=>PLACES.find(p=>p.id===id);
  // ---- lines: the branch line (芎寮—羅灣) with 渡頭站's own track, the 縱貫線, the roads (game x,z)
  const L=p=>p[0]==='l'?[p[1],p[2]]:m2l(p[1],p[2]);
  const RAIL=[['m',160,348],['m',262,368],['m',372,345],['m',475,330],['m',558,305],['l',-700,-420],['l',-300,-170],['l',-109,-60],['l',-109,150],['l',-109,215],['l',-60,262],['l',60,285],['l',190,270],['l',287,257],['l',380,300],['l',790,625],['l',1200,950],['l',1322,1059]].map(L);
  const RAIL_TUNNEL=[14];   // the segment(s) under 磺水嶺 (index of the start point): 望洋隧道
  const RAIL_OWN=[-109,-12,-109,152];   // 渡頭站's own track (19b) runs here: the line is not drawn over it
  const TRUNK=[[565,-700],[560,0],[560,270],[548,420],[548,470],[540,660],[532,1100]].map(([a,b])=>m2l(a,b));
  const ROADS=[
    {id:'hw',w:7,P:[['m',700,-700],['m',700,0],['m',690,120],['m',660,220],['m',640,300],['l',-382,-515],['l',-240,-250],['l',-215,110],['l',-55,150],['l',-35,215],['l',-191,836],['l',-449,1608],['l',-1412,2700],['m',872,900]].map(L)},
    {id:'ind',w:5,P:[['m',560,270],['m',450,250],['m',300,260],['m',175,320],['m',150,380],['m',115,540],['m',100,700]].map(L)},
    {id:'old',w:6,street:1,P:[['m',698,248],['m',668,272],['m',642,296],['m',616,326]].map(L)},
    {id:'new',w:8,street:1,P:[['m',616,326],['m',592,314],['m',562,303]].map(L)},
    {id:'stn',w:4,P:[['l',-133,-8],['l',-225,-8]].map(L)}];
  return {S,HX,HY,E0,NORTH,EAST,toL,toG,m2l,l2m,m2g,g2m,elevM,elevL,heightAt,water,gridH,G,RIVERS,POOL,POOL_L,POOL_Y,TERR,coastX,FIELD,fieldOut,
    PLACES,place,RAIL,RAIL_TUNNEL,RAIL_OWN,TRUNK,ROADS,sm,fbm,vn,h2,segD,inPoly,polyD};
})();
// {% endraw %}
