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
  const ANCHORS=[[132,320,182],[186,400,138],[262,352,110],[340,320,86],[392,250,82],[476,330,100],[300,200,112],[230,130,140],[200,50,160],[350,80,118],
    [450,150,86],[560,120,62],[650,110,48],[760,110,26],[860,150,11],[915,200,5],[830,250,9],[790,300,8.5],[752,338,8],[770,340,8],[805,335,7.5],[870,290,5],
    [630,430,21],[548,478,27],[700,418,19.5],[735,386,19],[745,402,15],[772,385,10],[808,412,12],[790,450,15],[700,470,23],[600,505,40],[935,300,2.5],[955,318,2.5],[930,420,4],[915,560,6],[860,610,14],
    [520,420,30],[460,430,45],[300,430,95],[200,430,128]];
  const TERR=[[520,210],[580,192],[650,190],[700,195],[730,215],[736,300],[718,345],[695,350],[660,352],[640,360],[530,390],[514,300]];   // 河階 中階 (斗安)
  // 斗灣潭 (鄉志：方形曲流潭，約 4 公頃): a rounded square about 205 m a side under the terrace's south-east foot, turned a
  // little along its two sets of faults, its banks not quite straight
  const POOL=(()=>{ const cx=647, cy=385, R=11.3, rot=.21, out=[]; for(let i=0;i<48;i++){ const a=i/48*Math.PI*2, c=Math.cos(a), sn=Math.sin(a), k=Math.pow(Math.pow(Math.abs(c),5)+Math.pow(Math.abs(sn),5),-1/5)*(1+.035*Math.sin(a*3+1)+.025*Math.sin(a*7+2));
    const u=c*R*k, v=sn*R*k; out.push([cx+u*Math.cos(rot)-v*Math.sin(rot),cy+u*Math.sin(rot)+v*Math.cos(rot)]); } return out; })();
  // the coast; 磺水嶺 stands out into the sea as a headland some 400 m wide (so the mountain has room for its 700 m)
  const coastX=my=>930+6*Math.sin(my*.045)+42*sm(my,340,405)*(1-sm(my,690,790));
  // 磺水嶺 (海岸山脈南端餘脈，約 380 公尺): a ridge from the river mouth south along the coast, steep on both sides,
  // joining the 南稜 hills; [x, y, height, half-width west, half-width east] in map units
  // 磺水嶺's crest from north to south: [my, crest mx, crest height, west foot (the fault's trace) mx]
  const RIDGE=[[278,866,30,846],[296,876,160,848],[314,884,320,847],[332,888,480,846],[352,889,450,843],[372,897,600,837],[392,903,700,832],[418,905,660,830],[440,903,610,834],
    [468,897,540,836],[492,889,500,832],[545,881,520,822],[610,873,560,812],[700,866,600,805],[780,860,600,800]]
  const fract=v=>v-Math.floor(v);
  const DRYCH=[[[205,412],[270,398],[340,392],[410,398],[470,404]],[[215,408],[290,383],[350,372],[420,378],[470,382]],[[230,404],[300,414],[380,428],[440,440]]];
  // ravines: 0 in a ravine's bed, 1 on the spur between (spacing sp, wandering)
  const gul=(a,sp,ph,b)=>{ const q=a/sp+ph+1.3*fbm(a*.03+ph,b*.015,2)+.4*Math.sin(a*.021+ph*5); return 1-(1-Math.pow(Math.abs(fract(q)-.5)*2,1.6))*(.35+.9*fbm(Math.floor(q)*1.7+ph,3.1,2)); };
  const lerpT=(T,x)=>{ if(x<=T[0][0]) return T[0][1]; for(let i=0;i<T.length-1;i++) if(x<=T[i+1][0]){ const k=(x-T[i][0])/(T[i+1][0]-T[i][0]); return T[i][1]+(T[i+1][1]-T[i][1])*k*k*(3-2*k); } return T[T.length-1][1]; };
  // 南稜: where its foot meets the river's plain, and its crest height, west to east
  const SFOOT=[[-40,440],[100,432],[200,445],[300,482],[400,492],[500,500],[560,508],[650,502],[750,482],[820,462],[880,452]];
  const SCREST=[[-40,900],[100,720],[200,600],[300,520],[400,450],[500,380],[600,330],[700,350],[780,470],[860,600],[900,600]];
  const ridgeAt=my=>{ if(my<RIDGE[0][0]||my>RIDGE[RIDGE.length-1][0]) return null; let i=0; while(RIDGE[i+1][0]<my) i++; const a=RIDGE[i], b=RIDGE[i+1], t=(my-a[0])/(b[0]-a[0]), k=t*t*(3-2*t);
    const L=(p,q)=>p+(q-p)*k; return [L(a[1],b[1]), L(a[2],b[2]), L(a[3],b[3])+3*Math.sin(my*.13)+2*Math.sin(my*.047)]; };
  const SPURS=[[887,332,858,298,440,30,15],[887,332,908,300,440,25,13],[882,312,866,280,260,15,11],[886,320,895,290,330,20,10]];
  // 羅灣's sand spit: from just south of the mouth, curving south outside the ridge's north end (the bay opens south)
  const SPIT=[[930,262],[948,272],[960,296],[963,326],[955,352]];
  // valleys cut into the 中央山脈 (map units): 大陂溪's gorge up to 三叉嶺 and the brooks
  const VALLEYS=[[[-1380,405],[-1300,410],[-1000,420],[-700,430],[-400,445],[-200,440],[-60,430],[0,425],[60,418],[120,410],[190,405]],
    [[-120,330],[0,335],[60,340],[90,360],[130,385],[150,404]],[[40,120],[90,180],[120,230],[140,300],[150,360],[165,405]],[[40,700],[80,620],[95,560],[100,500],[115,460],[130,412]],[[-200,370],[-80,375],[0,380],[60,388],[120,398],[150,404]]];
  const SANCHA={mx:-1470,my:395};   // 三叉嶺 (2,860 m), 大陂溪's source
  const bump=t=>t<1?(1-t*t)**2:0;
  // the west's heights (鄉志 戊): villages and summits the rise passes through, plus a few to hold the slopes' sides
  const WEST=[[476,330,100],[392,250,120],[340,320,235],[262,352,410],[186,400,570],[146,330,655],[-650,360,2030],[-1470,395,2860],
    [420,462,106],[500,465,46],[560,470,27],[300,200,190],[230,130,300],[200,50,380],[350,80,165],
    [120,60,760],[120,650,700],[-650,0,1960],[-650,750,1960],[-1470,0,2450],[-1470,800,2450]];
  const westB=(()=>{ const n=WEST.length, P=WEST.map(([x,y])=>[x/100,y/100]), f=r2=>r2>1e-12?r2*Math.log(r2)*.5:0, N=n+3, M=[...Array(N)].map(()=>new Float64Array(N+1));
    for(let i=0;i<n;i++){ for(let j=0;j<n;j++) M[i][j]=f((P[i][0]-P[j][0])**2+(P[i][1]-P[j][1])**2); M[i][n]=1; M[i][n+1]=P[i][0]; M[i][n+2]=P[i][1]; M[n][i]=1; M[n+1][i]=P[i][0]; M[n+2][i]=P[i][1]; M[i][N]=WEST[i][2]; }
    for(let c=0;c<N;c++){ let b=c; for(let r=c+1;r<N;r++) if(Math.abs(M[r][c])>Math.abs(M[b][c])) b=r; [M[c],M[b]]=[M[b],M[c]]; for(let r=0;r<N;r++) if(r!==c){ const k=M[r][c]/M[c][c]; if(k) for(let q=c;q<=N;q++) M[r][q]-=k*M[c][q]; } }
    const w=M.map((row,i)=>row[N]/row[i]);
    return (mx,my)=>{ const x=mx/100, y=my/100; let v=w[n]+w[n+1]*x+w[n+2]*y; for(let i=0;i<n;i++) v+=w[i]*f((x-P[i][0])**2+(y-P[i][1])**2); return v; }; })();
  // the villages sit on their own gentler ground (no ridges or gullies under the houses)
  const WFLAT=[[86,520,10],[476,330,14],[392,250,14],[340,320,11],[262,352,12],[186,400,10],[146,330,10]];
  const westFlat=(mx,my)=>{ let f=0; for(const [x,y,r] of WFLAT){ const d=Math.hypot(mx-x,my-y); if(d<r*2) f=Math.max(f,1-sm(d,r,r*2)); } return f; };
  // west of 吳厝 (鄉志 戊): rice terraces on the lower slopes, tea gardens higher up toward 芎寮; [paddy, tea] weights
  const agri=(mx,my)=>{ if(mx<80||mx>275||my<230||my>500) return [0,0]; const band=sm(my,235,265)*(1-sm(my,470,495)), patch=sm(fbm(mx*.045+7,my*.045,3),.3,.42);
    if(band*patch<=0) return [0,0]; const v=1-westFlat(mx,my), tea=(sm(mx,85,105)*(1-sm(mx,178,196)))*band*patch*v, pad=(sm(mx,172,190)*(1-sm(mx,250,270)))*band*patch*v;
    return [pad,tea]; };
  function elevM(mx,my){
    let sw=0, se=0; for(const [ax,ay,ae] of ANCHORS){ const d2=(mx-ax)**2+(my-ay)**2+60, w=1/(d2*d2); sw+=w; se+=w*ae; } let e=se/sw;
    e+=4*(fbm(mx*.03,my*.03,3)-.5);
    // the 湖濱下階 (30 m) along the terrace's south-east foot, a 12 m low cliff down to the pool's lowland
    const sd=sdPoly(mx,my,TERR);
    if(mx>590&&mx<745&&my>335&&my<400&&sd<0&&sd>-18) e=e+(30+1.2*(fbm(mx*.2,my*.2,2)-.5)-e)*sm(sd,-13.6,-12.3);
    // the 中階 terrace (45 m) with 和尚崙 (70 m) at its north-east end: a sharp cliff on the side of the pool, gentle elsewhere
    { const sharp=my>300&&mx>560, w=sharp?sm(sd,-.3,.7):sm(sd,-10,10); if(w>0){ const eT=45+25*bump(Math.hypot(mx-700,my-238)/30)+1.5*(fbm(mx*.08,my*.08,2)-.5); e=e+(eT-e)*w; } }
    // 公埔: the old lake bed (1912), a flat damp hollow at 19–22 m south-west of the pool
    { const k=((mx-612)/64)**2+((my-442)/34)**2; if(k<1.2){ const w=1-sm(k,.55,1.1); e=e+(20.2+1.6*(fbm(mx*.09,my*.09,2)-.5)-e)*w; } }
    // 宮ノ台 (the shrine's knoll on the 中階) and 伯公崗 (the 福德祠's knoll, a Hakka graveyard, in 福尾)
    e+=13*bump(Math.hypot(mx-540,my-250)/9)+8*bump(Math.hypot(mx-462,my-350)/8);
    // 1951: where the lake undercut the cliff's foot, the edge of the 中階 under the old street's north-east end slid away;
    // a bitten-out scallop in the cliff and the slumped earth lying on the 下階 below it
    { const d=Math.hypot(mx-690,my-347); if(d<9&&e>30) e=Math.min(e,30+15*sm(d,3.5,9));
      const d2=Math.hypot((mx-690)/1.4,my-357); if(d2<6) e=Math.max(e,30+3.2*(1-(d2/6)**2)); }
    // the fan's dry channels: old braids of the river, a couple of metres down, grass and stones
    if(mx>190&&mx<480&&my>360&&my<450) for(const C of DRYCH) for(let i=0;i<C.length-1;i++){ const d=segD(mx,my,C[i][0],C[i][1],C[i+1][0],C[i+1][1])[0]; if(d<3.2){ e-=2.2*(1-sm(d,.6,3.2))*(1-westFlat(mx,my)); break; } }
    // dunes behind the beach along the north coast, up to 羅灣
    if(my<292&&my>-400){ const dc=coastX(my)-mx; if(dc>1.5&&dc<15) e=Math.max(e,2.2+5.5*bump(Math.abs(dc-7)/6.5)*(.55+.6*fbm(my*.09,mx*.2,2))); }
    // 磺水嶺 (鄉志): main peak ~700 m, 望洋隘口 ~450 m between it and a lesser knob to the north; the west face a fault
    // scarp (steep below, gullied into triangular facets, its foot wandering, little fans at the gullies' mouths where
    // the hot springs come up), the east face falling to sea cliffs; the north end tapering in spurs toward 羅灣, the
    // south end joining 南稜 and rising with it
    { const hw=ridgeAt(my); if(hw){ const [Cx,Ch,Fw]=hw, cX=coastX(my);
      let h=-1e9;
      if(mx<Cx){ const u=(mx-Fw)/(Cx-Fw);
        if(u>=0){ const base=Ch*(.3*sm(u,0,.5)+.7*Math.pow(u,1.05)), g=gul(my,11,.3,mx), cut=Ch*.16*sm(u,.04,.45)*(1-sm(u,.8,1));
          h=8+(base-8)*(.9+.2*fbm(mx*.07,my*.07,3))-cut*(1-g); }
        else if(u>-.35){ const g=gul(my,11,.3,mx); h=8+(10+8*g)*Math.exp(u*9)*(1-g*.5); } }   // the fans at the foot
      else { const v=Math.min(1,(mx-Cx)/Math.max(8,cX-Cx)), g=gul(my,9,.7,mx), cut=Ch*.1*sm(v,.1,.5)*(1-sm(v,.85,1));
        h=Ch*(1-.72*Math.pow(v,1.5))*(.9+.2*fbm(mx*.07+5,my*.07,3))-cut*(1-g); }   // still high at the shore: the sea cliff
      // the crest itself: crags
      h+=Ch*.04*(ridged(mx*.09,my*.09,2)-.5)*Math.max(0,1-Math.abs(mx-Cx)/12);
      const fade=1-sm(my,700,760);
      if(h>e) e=e+(h-e)*fade; }
      // the north spurs off the knob, down to the shore by 羅灣
      for(const [ax,ay,bx,by,ha,hb,w] of SPURS){ const [d,t]=segD(mx,my,ax,ay,bx,by); if(d<w){ const hh=(ha+(hb-ha)*t)*Math.pow(1-d/w,1.4)*(.9+.2*fbm(mx*.08,my*.08,2)); if(hh>e) e=hh; } } }
    // the 中央山脈 to the west, the 南稜 hills to the south, low hills north beyond the map
    const r=ridged(mx*.011,my*.011,5);
    // 中央山脈: rising straight from the fan's head (800–1,000 m within two kilometres, 箭竹山稜 over 1,500 m some five or
    // six kilometres in, 三叉嶺 2,860 m fifteen kilometres in), cut by V-shaped valleys
    // the west (戊): one smooth rise from 西福尾 up through the villages to 箭竹山稜 and 三叉嶺, steepest by the villages and
    // easing toward the crest (a thin-plate surface through the heights below), with ridges and V-shaped valleys growing
    // out of it westward; it takes over from the fan's anchors west of 福尾
    { const wB=sm(500-mx,0,108); if(wB>0){ let vd=1e9; for(const V of VALLEYS) for(let i=0;i<V.length-1;i++){ const q=segD(mx,my,V[i][0],V[i][1],V[i+1][0],V[i+1][1])[0]; if(q<vd) vd=q; }
      const B=westB(mx,my), A=10+540*sm(190-mx,0,760), ds=Math.hypot(mx-SANCHA.mx,my-SANCHA.my);
      const vf=Math.max(sm(vd,2,30+Math.max(0,165-mx)*.04),Math.max(0,1-ds/90)), flat=westFlat(mx,my);
      let eW=B+A*(1-flat)*(vf*(.62+.7*(r-.5))-.5)+3*(fbm(mx*.05,my*.05,2)-.5);
      eW=Math.min(eW,2860-1.1*Math.max(0,ds-12));   // nothing higher than 三叉嶺
      e=e+(eW-e)*wB; } }
    // 三叉嶺: three ridges meet at the summit, the 中央山脈's main ridge running north and south and the spur east toward 箭竹山稜
    if(mx<-850) for(const [bx,by,hb] of [[-1505,-320,2380],[-1450,1080,2420],[-980,372,2120]]){ const [d,t]=segD(mx,my,SANCHA.mx,SANCHA.my,bx,by), w=70+40*t;
      if(d<w){ const hh=(2840+(hb-2840)*t)*(1-.42*Math.pow(d/w,1.25))*(.96+.08*fbm(mx*.03,my*.03,2)); if(hh>e) e=e+(Math.min(hh,2860)-e)*(1-sm(d,w*.6,w)); } }
    // 南稜 (鄉志): the hills south of the river, 300–600 m, their crest the township's southern line; low by 公埔 and
    // higher both ways, joining 磺水嶺 in the east and the 中央山脈 in the west; ravines run down north to the river
    { const fy=lerpT(SFOOT,mx), cy=700+14*Math.sin(mx*.021)+8*Math.sin(mx*.057), t=(my-fy)/(cy-fy);
      if(t>0&&mx>-40){ const Hs=lerpT(SCREST,mx), base=e, q=Math.min(t,1);
        let h=t<=1?base+(Hs-base)*Math.pow(sm(q,0,1),.85):Hs-(Hs-160)*sm((my-cy)/130,0,1);
        const g=gul(mx,52,.4,my), cut=h*.22*sm(t,.12,.6)*(1-sm(t,.88,1));
        h=h*(.93+.14*r)-cut*(1-g);
        const w=sm(t,0,.12)*sm(mx,-40,160);
        e=mx<165?Math.max(e,h*w+e*(1-w)):e+(h-e)*w; } }
    { const s=-40-my; if(s>0) e+=240*(1-Math.exp(-s/380))*(.5+.8*r)*(1-sm(mx,820,900))*(1-sm(165-mx,0,200)); }
    // the sea
    { const dc=coastX(my)-mx; if(dc<5) e=Math.min(e,dc>0?(dc<2.6?1.4+dc*.2:1.4+.52+(dc-2.6)*60):1.4+dc*.5); }   // a narrow shore (beach, or rock platform under the cliffs), then the sea
    if(mx>900&&my>240&&my<370){ let d=1e9; for(let i=0;i<SPIT.length-1;i++){ const q=segD(mx,my,SPIT[i][0],SPIT[i][1],SPIT[i+1][0],SPIT[i+1][1])[0]; if(q<d) d=q; } if(d<2) e=Math.max(e,2.6*(1-(d/2)**2)); }
    return e; }

  // ---- water: rivers as polylines with the water's height at each point ([kind,a,b,height]: 'm' map units, 'l' game x,z)
  const pt=p=>p[0]==='l'?[p[1],p[2],p[3]]:[...m2l(p[1],p[2]),p[3]];
  const FIELD={x0:-195,x1:250,z0:-185,z1:205};   // the house's fields (as LAND.FIELD): flat, made by 19-land
  const fieldOut=(x,z)=>Math.hypot(Math.max(FIELD.x0-x,0,x-FIELD.x1),Math.max(FIELD.z0-z,0,z-FIELD.z1));
  // the land before the water is cut in
  const landL=(x,z)=>{ const [mx,my]=l2m(x,z); return elevM(mx,my); };
  const RIVERS=[
    {id:'up',hw:14,dep:2.2,P:[['m',-1380,405,2450],['m',-1300,410,2100],['m',-1000,420,1500],['m',-700,430,1000],['m',-400,445,600],['m',-200,440,330],['m',-60,430,215],['m',0,425,190],['m',60,418,166],['m',120,410,148],['m',190,405,132],['m',260,415,112],['m',330,450,84],['m',420,458,52],['m',500,463,33],['m',560,466,25],['m',610,458,21],['m',628,432,19.5],['m',636,410,18.6],['m',640,397,18]].map(pt)},
    {id:'down',hw:16,dep:2.4,P:[['m',659,383,18],['l',-950,-300,17],['l',-790,-270,16],['l',-770,-110,15],['l',-630,-130,13.5],['l',-570,20,12.5],['l',-440,-10,11],['l',-400,120,9.8],['l',-300,150,8.7],['l',-190,183,8.05],['l',-60,180,7.95],['l',40,150,7.92],['l',95,85,7.9],['l',113,25,7.9],['l',150,-8,7.88],['l',230,-5,7.85],['l',330,40,7.7],
      ['l',460,-100,7.3],['l',610,-30,6.9],['l',680,150,6.4],['l',840,70,5.9],['l',950,-90,5.3],['l',1090,60,4.6],['l',1180,230,3.8],['l',1340,140,3],['l',1440,250,2],['l',1560,274,1],['l',1700,330,-.6]].map(pt)}];
  // 大陂溪 up in the west runs on the floor of the rise (戊): its water a little under the land there
  for(const q of RIVERS[0].P){ const [mx,my]=l2m(q[0],q[1]); if(mx<500) q[2]=Math.min(q[2]+1e9*(mx<480),elevM(mx,my)-(mx<165?3:2.2)); }
  // the rivers every 30 m, the water never above the land round it (but kept as given along the house's fields)
  for(const R of RIVERS){ const Q=[]; let last=1e9; for(let i=0;i<R.P.length-1;i++){ const a=R.P[i], b=R.P[i+1], n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/30));
      for(let k=0;k<n;k++){ const t=k/n, x=a[0]+(b[0]-a[0])*t, z=a[1]+(b[1]-a[1])*t; let w=a[2]+(b[2]-a[2])*t; if(fieldOut(x,z)>60) w=Math.min(w,landL(x,z)-.8); w=Math.min(w,last); last=w; Q.push([x,z,w]); } }
    const e=R.P[R.P.length-1]; Q.push([e[0],e[1],Math.min(e[2],last)]); R.P=Q; }
  // the brooks: their water just under the land (worked out once the land is known), flowing into the river nearest their mouth
  const BROOKS=[['jq',[[60,340],[90,360],[130,385],[150,404]]],['qz',[[120,230],[140,300],[150,360],[165,405]]],['ht',[[95,560],[100,500],[115,460],[130,412]]],['bs',[[0,380],[60,388],[120,398],[150,404]]],['hs',[[832,333],[822,348],[812,358]]]];
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
  // west of it, up the 中央山脈 to 三叉嶺, a 50 m grid of its own
  const G2={E0:-21500,N0:-6500,st:50,nE:0,nN:0,h:null}; G2.nE=Math.round((G.E0+G.st*2-G2.E0)/G2.st); G2.nN=Math.round((6500-G2.N0)/G2.st); G2.h=new Float32Array((G2.nE+1)*(G2.nN+1));
  for(let j=0;j<=G2.nN;j++) for(let i=0;i<=G2.nE;i++){ const E=G2.E0+i*G2.st, N=G2.N0+j*G2.st, [x,z]=toL(E,N); G2.h[j*(G2.nE+1)+i]=elevL(x,z); }
  const gridH2=(E,N)=>{ const fx=(E-G2.E0)/G2.st, fz=(N-G2.N0)/G2.st, i=Math.floor(fx), j=Math.floor(fz); if(i<0||j<0||i>=G2.nE||j>=G2.nN) return null;
    const u=fx-i, v=fz-j, W=G2.nE+1, k=j*W+i; return (G2.h[k]*(1-u)+G2.h[k+1]*u)*(1-v)+(G2.h[k+W]*(1-u)+G2.h[k+W+1]*u)*v; };
  const heightAt=(x,z)=>{ const [E,N]=toG(x,z); let g=gridH(E,N); if(g!=null) return g; g=gridH2(E,N); if(g!=null) return g; const [mx,my]=g2m(E,N); return elevM(mx,my); };

  // ---- places on the map (names are in _data/vr.yml › npc `twp.<id>`: 甲＝名字，乙＝一句介紹)
  const PL=(id,kind,mx,my,extra)=>Object.assign({id,kind,mx,my},extra||{});
  const PLACES=[
    PL('house','house',0,0,{l:[0,0]}), PL('dou','town',640,300,{n:70,r:9}), PL('hsl','vil',700,238,{n:6,r:4}), PL('gp','vil',630,430,{n:22,r:6}), PL('zhl','vil',548,478,{n:16,r:4}),
    PL('fw','vil',476,330,{n:38,r:7}), PL('ry','vil',418,370,{n:12,r:4,jp:1}), PL('sfs','vil',340,320,{n:14,r:4}), PL('xfw','vil',392,250,{n:30,r:7}), PL('wc','vil',262,352,{n:24,r:5}),
    PL('bt','sight',186,400), PL('qlc','vil',146,330,{n:20,r:4}), PL('dh','school',505,310), PL('ly','vil',922,312,{n:30,r:3.5}), PL('qzw','sight',100,250), PL('zx','vil',86,520,{n:16,r:5}),
    PL('dt','vil',752,338), PL('kll','vil',812,420,{n:26,r:6}), PL('hsj','vil',838,333,{n:16,r:3}), PL('pool','sight',647,385), PL('sancha','sight',-1470,395), PL('jzs','sight',-650,360), PL('wyk','sight',889,352), PL('gnd','sight',540,250), PL('bgg','sight',462,350), PL('s1951','sight',690,350), PL('hpk','sight',903,392), PL('chim','sight',575,402),
    PL('t_dag','temple',612,334), PL('t_yas','temple',707,228), PL('t_fl','temple',722,250), PL('t_fx','temple',488,318), PL('t_sz','temple',362,340), PL('t_bj','temple',562,458),
    PL('t_ws','temple',652,367), PL('t_sx','temple',800,384), PL('t_ys','temple',845,342), PL('t_ym','temple',400,236), PL('t_wu','temple',270,342), PL('t_bg','temple',146,334),
    PL('c_kl','church',826,426), PL('c_zx','church',128,552), PL('c_dou','church',600,286),
    PL('s_ly','station',918,300), PL('s_hs','station',812,338), PL('s_dt','station',762,350,{l:[-112,13]}), PL('s_dou','station',558,305), PL('s_fw','station',475,330), PL('s_sfs','station',372,345), PL('s_wc','station',262,368), PL('s_ql','station',158,350)];
  for(const p of PLACES){ if(p.l){ const [mx,my]=l2m(p.l[0],p.l[1]); p.mx=mx; p.my=my; } else p.l=m2l(p.mx,p.my); p.x=p.l[0]; p.z=p.l[1]; }
  const place=id=>PLACES.find(p=>p.id===id);
  // ---- lines: the branch line (芎寮—羅灣) with 渡頭站's own track, the 縱貫線, the roads (game x,z)
  const L=p=>p[0]==='l'?[p[1],p[2]]:m2l(p[1],p[2]);
  const RAIL=[['m',160,348],['m',262,368],['m',372,345],['m',475,330],['m',558,305],['l',-700,-420],['l',-300,-170],['l',-109,-60],['l',-109,150],['l',-109,215],['l',-60,262],['l',60,285],['l',190,270],['l',287,257],['l',380,300],['l',1100,640],['l',1212,693]].map(L);
  const RAIL_TUNNEL=[14];   // the segment(s) under 磺水嶺 (index of the start point): 望洋隧道
  const RAIL_OWN=[-109,-12,-109,152];   // 渡頭站's own track (19b) runs here: the line is not drawn over it
  const TRUNK=[[565,-700],[560,0],[560,270],[548,420],[548,470],[540,660],[532,1100]].map(([a,b])=>m2l(a,b));
  const ROADS=[
    {id:'hw',w:7,P:[['m',700,-700],['m',700,0],['m',690,120],['m',660,220],['m',640,300],['l',-382,-515],['l',-240,-250],['l',-215,110],['l',-55,150],['l',-35,215],['l',-191,836],['l',-449,1608],['l',-1412,2700],['m',872,900]].map(L)},
    {id:'ind',w:5,P:[['m',560,270],['m',450,250],['m',300,260],['m',175,320],['m',150,380],['m',115,540],['m',100,700]].map(L)},
    {id:'old',w:6,street:1,P:[['m',698,248],['m',668,272],['m',642,296],['m',616,326]].map(L)},
    {id:'new',w:8,street:1,P:[['m',616,326],['m',592,314],['m',562,303]].map(L)},
    {id:'stn',w:4,P:[['l',-133,-8],['l',-225,-8]].map(L)}];
  // 鄉界 (鄉志): north along a creek to 金港, west on the 中央山脈's main ridge through 三叉嶺, south on 南稜's crest
  const BOUND=(()=>{ const P=[]; for(let my=-330;my<=752;my+=12) P.push([coastX(my),my]);
    for(const q of [[880,745],[860,738]]) P.push(q); for(let mx=840;mx>=-40;mx-=20) P.push([mx,700+14*Math.sin(mx*.021)+8*Math.sin(mx*.057)]);
    for(const q of [[-300,742],[-700,770],[-1100,790],[-1460,800],[-1480,700],[-1470,395],[-1490,100],[-1505,-260],[-1200,-285],[-800,-300],[-300,-330],[100,-358],[400,-322],[700,-340]]) P.push(q);
    return P; })();
  return {DRYCH,BOUND,agri,S,HX,HY,E0,NORTH,EAST,toL,toG,m2l,l2m,m2g,g2m,elevM,elevL,heightAt,water,gridH,G,G2,SPIT,RIDGE,SANCHA,RIVERS,POOL,POOL_L,POOL_Y,TERR,coastX,FIELD,fieldOut,
    PLACES,place,RAIL,RAIL_TUNNEL,RAIL_OWN,TRUNK,ROADS,sm,fbm,vn,h2,segD,inPoly,polyD};
})();
// {% endraw %}
