/* 學鳩齋線上書齋：扮相目錄（門口的選單、預覽圖，與 3D 人物共用）
   Every item has a short code that travels with the visitor (presence `av`) and a name; the names here are the
   defaults, the back office (_data/vr.yml › look) can rename any of them. The gate draws a flat preview in SVG; the
   house (vr-house.js) builds the same look in 3D. */
(function(){
  const G=(label,items)=>({label,items});
  const CAT={
    o:{label:'衣著',groups:[
      G('中式文人',[['robe','長袍'],['magua','馬褂'],['rushan','儒衫'],['lanshan','襕衫'],['daopao','道袍'],['cloak','披風大氅']]),
      G('民初市井',[['zhongshan','中山裝'],['student','學生裝'],['tang','唐裝'],['duanda','對襟短打'],['modern','便服']]),
      G('西洋紳士學者',[['suit','西裝'],['tails','燕尾服'],['frock','常禮服'],['vest','馬甲襯衫'],['tweed','英倫花呢獵裝'],['gown','歐式學者長袍'],['trench','雙排扣風衣']]),
      G('中西女子',[['qipao','旗袍'],['aoqun','襖裙'],['beizi','褙子長裙'],['victorian','維多利亞長裙'],['edwardian','愛德華蕾絲洋裝'],['blouse','歐式襯衫長裙']])]},
    h:{label:'帽冠',groups:[
      G('',[['none','無']]),
      G('中式與民初',[['shusheng','書生巾'],['guapi','瓜皮帽'],['dongpo','東坡巾'],['rujin','儒巾'],['douli','斗笠'],['straw','草帽'],['felt','氈帽'],['turban','包頭巾'],['flatcap','鴨舌帽']]),
      G('西洋與歐陸',[['fedora','禮帽'],['tophat','高頂大禮帽'],['bowler','圓頂硬禮帽'],['tricorn','三角帽'],['panama','巴拿馬草帽'],['mortar','學者方帽'],['bonnet','洋式花邊女帽'],['pillbox','歐式無簷小女帽']])]},
    f:{label:'面飾',groups:[
      G('',[['none','無']]),
      G('眼鏡鏡飾',[['round','圓框眼鏡'],['gold','金絲眼鏡'],['half','半框眼鏡'],['shades','圓形墨鏡'],['monocle','單片眼鏡'],['pince','夾鼻眼鏡']]),
      G('鬍鬚與面紗',[['mous','八字鬍'],['goatee','山羊鬍'],['beard','絡腮鬍'],['rendan','仁丹鬍'],['handlebar','英式翹八字鬍'],['veil','面紗']])]},
    a:{label:'隨身',groups:[
      G('',[['none','無']]),
      G('典籍與書寫',[['scroll','書卷'],['painting','畫軸'],['book','精裝洋書'],['parchment','羊皮紙捲軸'],['fan','摺扇'],['featherfan','羽扇'],['brush','毛筆'],['quill','鵝毛筆']]),
      G('頸飾與包袋',[['scarf','圍巾'],['bowtie','英倫領結'],['neckerchief','絲巾領巾'],['bag','書袋'],['bundle','包袱'],['briefcase','皮質公事包'],['watch','懷錶']]),
      G('器物',[['pipe','煙斗'],['longpipe','長煙桿'],['cane','紳士手杖'],['magnifier','放大鏡'],['telescope','單筒望遠鏡'],['teapot','茶壺'],['umbrella','油紙傘'],['parasol','長柄洋傘'],['gourd','葫蘆']])]},
    hs:{label:'髮型',groups:[G('',[['center','中分油頭'],['bun','書生髮髻'],['short','民初短髮'],['back','後梳背頭'],['braids','麻花雙辮'],['updo','古典盤髮'],['wavy','波浪捲髮']])]},
    p:{label:'氣質',groups:[G('',[['scholar','儒雅端方'],['behind','負手而行'],['upright','紳士挺拔'],['casual','隨性自在']])]},
    g:{label:'身形',groups:[G('',[['m','男'],['f','女']])]},
  };
  const COLORS=[['#3e5873','紺鼠'],['#3d6b4f','千歳緑'],['#86683c','朽葉'],['#a8343a','臙脂'],['#5b4b6b','二藍'],['#2f5f6b','藍鼠'],['#7a5a2e','煤竹'],['#6c7163','利休鼠']];
  const HAIR=[['#1e1b18','墨黑'],['#3e2723','深栗'],['#7a7672','花白'],['#d6d3ce','銀白']];
  const ids=k=>CAT[k].groups.flatMap(g=>g.items.map(i=>i[0]));
  const labels={}; for(const k in CAT){ labels['cat.'+k]=CAT[k].label; CAT[k].groups.forEach((g,i)=>{ if(g.label) labels['grp.'+k+'.'+i]=g.label; for(const [id,l] of g.items) labels[k+'.'+id]=l; }); }
  for(const [c,l] of COLORS) labels['color.'+c]=l; for(const [c,l] of HAIR) labels['hair.'+c]=l;
  const FEM_O=['qipao','aoqun','beizi','victorian','edwardian','blouse'];
  // a look from anywhere (old saves, other visitors, the network) made safe; old single-slot accessories are moved over
  function clean(l){ l=l&&typeof l==='object'?l:{}; const pick=(k,v,d)=>ids(k).includes(v)?v:d;
    let h=l.h, f=l.f, a=l.a;
    if(h===undefined&&f===undefined){ if(a==='douli'||a==='straw'){ h=a; a='none'; } else if(a==='glasses'){ f='round'; a='none'; } }
    const g=pick('g',l.g,'m');
    return {g, o:pick('o',l.o,'robe'), h:pick('h',h,'none'), f:pick('f',f,'none'), a:pick('a',a,'none'),
      hs:pick('hs',l.hs,g==='f'?'updo':'short'), hc:HAIR.some(x=>x[0]===l.hc)?l.hc:HAIR[0][0], p:pick('p',l.p,'scholar')}; }
  // a matching set at random: women's or men's clothes by figure, hats and things that go with the clothes' world
  function random(g){ const R=a=>a[Math.floor(Math.random()*a.length)]; g=g||R(['m','f']);
    const west=Math.random()<.45, fem=g==='f';
    const o=fem?R(west?['victorian','edwardian','blouse','suit','trench']:['qipao','aoqun','beizi','robe','tang']):R(west?['suit','tails','frock','vest','tweed','gown','trench']:['robe','magua','rushan','lanshan','daopao','cloak','zhongshan','student','tang','duanda']);
    const h=Math.random()<.4?'none':fem?R(west?['bonnet','pillbox','panama']:['none','straw','douli']):R(west?['fedora','tophat','bowler','panama','mortar','tricorn','flatcap']:['shusheng','guapi','dongpo','rujin','douli','straw','felt']);
    const f=Math.random()<.5?'none':fem?R(west?['round','gold','veil','pince']:['round','gold']):R(west?['gold','monocle','pince','handlebar','mous','half']:['round','goatee','mous','beard','rendan']);
    const a=Math.random()<.25?'none':R(west?['book','quill','briefcase','watch','pipe','cane','magnifier','telescope','parasol','bowtie','neckerchief']:['scroll','painting','fan','featherfan','brush','bag','bundle','longpipe','teapot','umbrella','gourd','scarf']);
    const hs=fem?R(['updo','braids','wavy','bun','short']):R(west?['center','back','short','wavy']:['bun','short','center','back']);
    const hc=Math.random()<.75?HAIR[0][0]:R(HAIR)[0];
    return clean({g,o,h,f,a,hs,hc,p:R(ids('p'))}); }

  /* ---- the flat preview: background things → body and clothes → things in hand → head and hair → face → hat ---- */
  function shade(c,k){ const n=parseInt(c.slice(1),16); const f=v=>Math.max(0,Math.min(255,Math.round(v*k))); return `rgb(${f(n>>16)},${f(n>>8&255)},${f(n&255)})`; }
  function svg(look,color){ const L=clean(look), c=color||'#3e5873', d=shade(c,.62), dd=shade(c,.45), lt=shade(c,1.25), f=L.g==='f', sh=f?24:28, skin='#e7cfb4', hair=L.hc, ink='#2a2622';
    const P=[], back=[], hand=[], top=[]; let s='';
    const behind=L.p==='behind', casual=L.p==='casual', up=L.p==='upright';
    const xl=60-sh, xr=60+sh, hy=131, hxL=xl-4.5, hxR=xr+4.5;   // shoulders, hands
    const shoes=(y=198,col='#1a1716')=>`<rect x="47" y="${y}" width="11" height="6" rx="2" fill="${col}"/><rect x="62" y="${y}" width="11" height="6" rx="2" fill="${col}"/>`;
    const legs=(col,w=15)=>`<rect x="${60-w-2}" y="130" width="${w}" height="68" fill="${col}"/><rect x="62" y="130" width="${w}" height="68" fill="${col}"/>`;
    const longBody=(wTop,wBot,col)=>`<path d="M${60-wTop} 70 L${60+wTop} 70 L${60+wBot} 196 L${60-wBot} 196 Z" fill="${col}"/>`;
    const jacket=(len,col)=>`<path d="M${xl} 70 L${xr} 70 L${xr-2} ${70+len} L${xl+2} ${70+len} Z" fill="${col}"/>`;
    const O=L.o;
    // cloak and umbrellas sit behind
    if(O==='cloak') back.push(`<path d="M${xl-6} 68 L${xr+6} 68 L${xr+16} 190 L${xl-16} 190 Z" fill="${dd}"/>`);
    if(L.a==='umbrella') back.push(`<path d="M8 36 Q60 -6 112 36 Z" fill="#c9a35e" stroke="#8a6a3a"/><path d="M60 8 L60 36" stroke="#8a6a3a"/>`);
    if(L.a==='parasol') back.push(`<path d="M14 34 Q60 -2 106 34 Q96 30 88 34 Q78 30 70 34 Q60 30 50 34 Q42 30 32 34 Q22 30 14 34 Z" fill="#f4efe6" stroke="#b9ab92"/>`);
    if(L.a==='bundle') back.push(`<path d="M${xr-6} 76 Q${xr+22} 70 ${xr+20} 104 Q${xr+4} 112 ${xr-8} 100 Z" fill="#5b6f8a"/>`);
    // bodies
    if(['robe','rushan','lanshan','daopao','gown','qipao'].includes(O)){ const wb=O==='qipao'?24:f?27:36; s+=longBody(sh,wb,O==='gown'?'#2a2622':c);
      if(O==='robe'||O==='qipao') s+=`<rect x="53" y="64" width="14" height="8" fill="${d}"/><path d="M60 72 Q66 78 ${60+sh-6} 80" stroke="${d}" stroke-width="2" fill="none"/>`;
      if(O==='qipao') s+=`<path d="M${60+wb-6} 160 L${60+wb-2} 196" stroke="${d}" stroke-width="2"/>`;
      if(O==='rushan'||O==='daopao') s+=`<path d="M52 66 L66 96 M68 66 L56 82" stroke="${O==='daopao'?'#f2efe8':d}" stroke-width="4" fill="none"/>`;
      if(O==='lanshan') s+=`<rect x="${60-wb}" y="186" width="${2*wb}" height="10" fill="${dd}"/><path d="M52 66 L66 96" stroke="${dd}" stroke-width="4"/><rect x="${xl+2}" y="112" width="${2*sh-4}" height="5" fill="${dd}"/>`;
      if(O==='daopao') s+=`<rect x="${xl+2}" y="112" width="${2*sh-4}" height="6" fill="${dd}"/>`;
      if(O==='gown') s+=`<path d="M56 70 L52 196 M64 70 L68 196" stroke="${c}" stroke-width="4"/>`;
      s+=shoes(); }
    else if(O==='magua'||O==='cloak'){ s+=longBody(sh,f?27:36,O==='magua'?lt:c); if(O==='magua'){ s+=jacket(54,dd); for(let y=78;y<120;y+=10) s+=`<circle cx="60" cy="${y}" r="1.6" fill="#d8c9a0"/>`; } s+=`<rect x="53" y="64" width="14" height="8" fill="${d}"/>`+shoes(); }
    else if(['victorian','edwardian','blouse','aoqun','beizi'].includes(O)){
      const skirtW=O==='victorian'?46:O==='beizi'?32:36, skirtC=O==='blouse'||O==='aoqun'?d:c, topC=O==='blouse'||O==='edwardian'?'#f4f0e8':c;
      s+=`<path d="M48 124 L72 124 L${60+skirtW} 198 L${60-skirtW} 198 Z" fill="${skirtC}"/>`;
      if(O==='victorian') s+=`<path d="M${60-skirtW+4} 180 L${60+skirtW-4} 180" stroke="${d}" stroke-width="3"/>`;
      s+=`<path d="M${xl+3} 70 L${xr-3} 70 L${xr-6} 126 L${xl+6} 126 Z" fill="${topC}"/>`;
      if(O==='edwardian') s+=`<path d="M48 74 Q60 86 72 74" stroke="#cfc6b6" stroke-width="3" fill="none"/><path d="M${60-skirtW+6} 168 L${60+skirtW-6} 168" stroke="#efe9de" stroke-width="3"/>`;
      if(O==='aoqun') s+=`<path d="M${xl+3} 70 L${xr-3} 70 L${xr} 138 L${xl} 138 Z" fill="${c}"/>`+[54,60,66].map(x=>`<path d="M${x} 140 L${x+(x-60)*.6} 196" stroke="${dd}" stroke-width="1.2"/>`).join('');
      if(O==='beizi') s+=`<path d="M${xl-2} 70 L${xr+2} 70 L${xr+12} 190 L${xr-8} 190 L60 80 L${xl+8} 190 L${xl-12} 190 Z" fill="${lt}"/>`;
      if(O==='blouse') s+=`<rect x="56" y="70" width="8" height="10" fill="#e8e1d4"/>`;
      s+=`<rect x="50" y="198" width="9" height="5" fill="#1a1716"/><rect x="61" y="198" width="9" height="5" fill="#1a1716"/>`; }
    else { // trousers and a jacket of one kind or another
      const len=O==='frock'?96:O==='trench'?104:O==='duanda'?52:O==='tails'?58:60, trousers=O==='modern'?'#3b4a66':O==='tweed'?'#6b5a44':O==='duanda'?'#2f2b28':O==='vest'?'#2f2b28':d;
      s+=legs(trousers);
      if(O==='tails') s+=`<path d="M${xl+4} 120 L${xl+10} 176 L58 128 Z M${xr-4} 120 L${xr-10} 176 L62 128 Z" fill="${dd}"/>`;
      if(O==='vest'){ s+=jacket(60,'#f2efe8')+`<path d="M${xl+6} 72 L${xr-6} 72 L${xr-8} 128 L${xl+8} 128 Z" fill="${c}"/><path d="M56 72 L60 90 L64 72" fill="#f2efe8"/>`; }
      else s+=jacket(len,O==='tweed'?c:c);
      if(O==='tweed') for(let y=76;y<128;y+=8) s+=`<path d="M${xl+3} ${y} L${xr-3} ${y}" stroke="${d}" stroke-width=".8" opacity=".7"/>`;
      if(['suit','tails','frock','tweed','trench'].includes(O)) s+=`<path d="M53 70 L67 70 L60 96 Z" fill="#f2efe8"/>`+(f?'':`<path d="M58 74 L62 74 L63 96 L60 100 L57 96 Z" fill="#7a2a2a"/>`);
      if(O==='zhongshan'||O==='student'){ s+=`<rect x="54" y="66" width="12" height="6" fill="${d}"/>`; for(let y=78;y<128;y+=10) s+=`<circle cx="60" cy="${y}" r="1.5" fill="${O==='student'?'#d8c08a':dd}"/>`; if(O==='zhongshan') s+=`<rect x="${xl+5}" y="82" width="10" height="8" fill="${d}"/><rect x="${xr-15}" y="82" width="10" height="8" fill="${d}"/><rect x="${xl+5}" y="108" width="11" height="10" fill="${d}"/><rect x="${xr-16}" y="108" width="11" height="10" fill="${d}"/>`; }
      if(O==='tang'||O==='duanda'){ s+=`<path d="M60 70 L60 ${70+len}" stroke="${dd}" stroke-width="1.5"/>`; for(let y=78;y<70+len-4;y+=9) s+=`<path d="M56 ${y} L64 ${y}" stroke="${O==='tang'?'#d8c08a':'#e8e1d4'}" stroke-width="2"/>`; }
      if(O==='duanda') s+=`<rect x="${xl+2}" y="118" width="${2*sh-4}" height="5" fill="#8a3a2a"/>`;
      if(O==='trench'){ s+=`<rect x="${xl+2}" y="118" width="${2*sh-4}" height="5" fill="${dd}"/>`; for(const x of [54,66]) for(let y=82;y<114;y+=12) s+=`<circle cx="${x}" cy="${y}" r="1.6" fill="${dd}"/>`; }
      if(O==='modern') s+=`<rect x="54" y="66" width="12" height="6" rx="3" fill="${d}"/>`;
      s+=O==='modern'?`<rect x="45" y="198" width="15" height="7" rx="2" fill="#ece8e0" stroke="#bbb"/><rect x="61" y="198" width="15" height="7" rx="2" fill="#ece8e0" stroke="#bbb"/>`:O==='duanda'?shoes(198,'#2a2622'):`<rect x="43" y="198" width="15" height="6" fill="#1a1716"/><rect x="62" y="198" width="15" height="6" fill="#1a1716"/>`; }
    // arms: at the sides, or folded behind the back
    const sleeve=O==='vest'?'#f2efe8':O==='gown'?'#2a2622':(O==='blouse'||O==='edwardian')?'#f4f0e8':O==='magua'?dd:c;
    const wide=['robe','rushan','lanshan','daopao','gown','beizi'].includes(O);
    if(behind) s+=`<rect x="${xl-7}" y="72" width="8" height="38" rx="4" fill="${sleeve}"/><rect x="${xr-1}" y="72" width="8" height="38" rx="4" fill="${sleeve}"/>`;
    else s+=`<rect x="${xl-(wide?12:9)}" y="72" width="${wide?12:9}" height="56" rx="4" fill="${sleeve}"/><rect x="${xr}" y="72" width="${wide?12:9}" height="56" rx="4" fill="${sleeve}"/><circle cx="${hxL}" cy="${hy}" r="5" fill="${skin}"/><circle cx="${hxR}" cy="${hy}" r="5" fill="${skin}"/>`;
    // things carried (in the right hand, or on the body)
    const A=L.a, R=hxR, Y=hy;
    const HELD={scroll:`<rect x="${R-3}" y="${Y-22}" width="8" height="30" rx="3" fill="#e8dcc0" stroke="#a8956c"/>`,
      painting:`<rect x="${R-2}" y="${Y-40}" width="5" height="56" fill="#8a3a2a"/><circle cx="${R+.5}" cy="${Y-41}" r="3" fill="#3a2a20"/><circle cx="${R+.5}" cy="${Y+17}" r="3" fill="#3a2a20"/>`,
      book:`<rect x="${R-9}" y="${Y-16}" width="16" height="21" fill="#5a2a22" stroke="#c9a35e"/>`,
      parchment:`<path d="M${R-6} ${Y-20} L${R+8} ${Y-20} L${R+8} ${Y+4} Q${R+1} ${Y+9} ${R-6} ${Y+4} Z" fill="#e2cf9e" stroke="#a88a4e"/>`,
      fan:`<path d="M${R} ${Y} L${R+25} ${Y-20} A28 28 0 0 1 ${R+28} ${Y+8} Z" fill="#efe6d0" stroke="#b9a77d"/>`,
      featherfan:`<path d="M${R} ${Y} Q${R+6} ${Y-34} ${R+18} ${Y-34} Q${R+30} ${Y-20} ${R+4} ${Y-2} Z" fill="#f6f4ee" stroke="#c9c3b6"/>`,
      brush:`<path d="M${R} ${Y+4} L${R+4} ${Y-24}" stroke="#7a5a2e" stroke-width="3"/><path d="M${R+4} ${Y-24} L${R+6} ${Y-32}" stroke="#1a1716" stroke-width="3"/>`,
      quill:`<path d="M${R} ${Y+4} Q${R+4} ${Y-20} ${R+14} ${Y-36} Q${R+10} ${Y-14} ${R+2} ${Y}" fill="#f2efe8" stroke="#bdb5a5"/>`,
      briefcase:`<rect x="${R-12}" y="${Y+4}" width="26" height="20" rx="2" fill="#5a3a22"/><path d="M${R-4} ${Y+4} Q${R+1} ${Y-2} ${R+6} ${Y+4}" stroke="#3a2416" stroke-width="2" fill="none"/>`,
      longpipe:`<path d="M${R} ${Y} L${R+6} ${Y-50}" stroke="#4a3020" stroke-width="2.5"/><rect x="${R+4}" y="${Y-56}" width="6" height="6" fill="#8a7a5a"/>`,
      cane:`<path d="M${R} ${Y} L${R+4} 204" stroke="#2a2016" stroke-width="3"/><circle cx="${R}" cy="${Y-2}" r="3.5" fill="#b8954e"/>`,
      magnifier:`<path d="M${R} ${Y+2} L${R+8} ${Y-12}" stroke="#4a3020" stroke-width="3"/><circle cx="${R+12}" cy="${Y-19}" r="8" fill="#dfeaf0" fill-opacity=".6" stroke="#b8954e" stroke-width="2"/>`,
      telescope:`<path d="M${R-6} ${Y+4} L${R+20} ${Y-14}" stroke="#7a5a2e" stroke-width="6"/><path d="M${R+16} ${Y-11} L${R+28} ${Y-19}" stroke="#b8954e" stroke-width="7"/>`,
      teapot:`<ellipse cx="${R+6}" cy="${Y+6}" rx="11" ry="9" fill="#7a3e2a"/><path d="M${R+16} ${Y+4} L${R+24} ${Y-4}" stroke="#7a3e2a" stroke-width="3"/><rect x="${R+3}" y="${Y-5}" width="6" height="3" fill="#5a2a1a"/>`,
      umbrella:`<path d="M${R} ${Y} L${R-1} 38" stroke="#8a6a3a" stroke-width="2"/>`, parasol:`<path d="M${R} ${Y} L${R-1} 36" stroke="#5a4a3a" stroke-width="2"/>`};
    if(HELD[A]&&!behind) hand.push(HELD[A]);
    if(A==='scarf'){ const sc=c==='#a8343a'?'#2f4f6f':'#a8343a'; top.push(`<rect x="46" y="62" width="28" height="9" rx="4" fill="${sc}"/><rect x="62" y="68" width="8" height="30" fill="${sc}"/>`); }
    if(A==='bowtie') top.push(`<path d="M53 66 L60 70 L53 74 Z M67 66 L60 70 L67 74 Z" fill="#2a2622"/>`);
    if(A==='neckerchief') top.push(`<path d="M50 66 L70 66 L60 84 Z" fill="${c==='#a8343a'?'#c9a35e':'#a8343a'}"/>`);
    if(A==='bag') top.push(`<path d="M${xl} 70 L${xr+10} 118" stroke="#8a7a5c" stroke-width="4"/><rect x="${xr+2}" y="110" width="24" height="28" rx="2" fill="#8a7a5c"/>`);
    if(A==='watch') top.push(`<path d="M${xl+8} 104 Q60 112 ${xr-10} 102" stroke="#c9a35e" stroke-width="1.2" fill="none"/><circle cx="${xr-10}" cy="104" r="4" fill="#d9bf7a" stroke="#8a6a3a"/>`);
    if(A==='pipe') top.push(`<path d="M62 50 Q70 58 74 56" stroke="#4a3020" stroke-width="2.5" fill="none"/><rect x="72" y="50" width="6" height="7" rx="1.5" fill="#5a3a22"/>`);
    if(A==='gourd') top.push(`<circle cx="${xl+4}" cy="124" r="5" fill="#c9963e"/><circle cx="${xl+4}" cy="134" r="7" fill="#c9963e"/>`);
    s+=hand.join('')+top.filter(t=>!t.includes('stroke-width="4"')).join('');
    // head and hair (hair at the back first)
    let hb='', hf='';
    const HS=L.hs;
    if(HS==='braids') hb+=`<path d="M45 44 L42 104" stroke="${hair}" stroke-width="6" stroke-dasharray="5 2"/><path d="M75 44 L78 104" stroke="${hair}" stroke-width="6" stroke-dasharray="5 2"/>`;
    if(HS==='wavy') hb+=`<path d="M41 36 Q36 54 42 72 Q50 78 46 60 M79 36 Q84 54 78 72 Q70 78 74 60" fill="${hair}" stroke="${hair}" stroke-width="6"/>`;
    if(HS==='updo') hb+=`<circle cx="60" cy="58" r="7" fill="${hair}"/>`;
    s+=hb+`<rect x="55" y="54" width="10" height="12" fill="${skin}"/><circle cx="60" cy="40" r="17" fill="${skin}"/>`;
    hf+=`<path d="M43 40 A17 17 0 0 1 77 40 L77 34 A17 15 0 0 0 43 34 Z" fill="${hair}"/>`;
    if(HS==='center') hf+=`<path d="M43 38 Q50 22 60 26 Q70 22 77 38 Q72 28 60 30 Q48 28 43 38 Z" fill="${hair}"/><path d="M60 24 L60 30" stroke="${skin}" stroke-width="1.2"/>`;
    else if(HS==='back') hf+=`<path d="M43 36 Q60 16 77 36 Q70 26 60 25 Q50 26 43 36 Z" fill="${hair}"/>`;
    else hf+=`<path d="M43 38 Q60 18 77 38 Q72 26 60 24 Q48 26 43 38 Z" fill="${hair}"/>`;
    if(HS==='bun') hf+=`<circle cx="60" cy="20" r="7" fill="${hair}"/><rect x="58" y="12" width="4" height="4" fill="#c9a35e"/>`;
    if(HS==='wavy') hf+=`<path d="M44 34 Q50 28 54 34 Q58 28 62 34 Q66 28 70 34 Q74 28 76 34" stroke="${hair}" stroke-width="5" fill="none"/>`;
    s+=hf+`<circle cx="54" cy="41" r="1.4" fill="${ink}"/><circle cx="66" cy="41" r="1.4" fill="${ink}"/>`;
    // face
    const F=L.f, gl=(col,w,extra='')=>`<circle cx="53" cy="41" r="5" fill="${extra||'none'}" stroke="${col}" stroke-width="${w}"/><circle cx="67" cy="41" r="5" fill="${extra||'none'}" stroke="${col}" stroke-width="${w}"/><path d="M58 41 L62 41" stroke="${col}" stroke-width="${w}"/>`;
    if(F==='round') s+=gl(ink,1.6); if(F==='gold') s+=gl('#c9a35e',1.1); if(F==='shades') s+=gl(ink,1.4,'#2a2622');
    if(F==='half') s+=`<path d="M48 39 L58 39 M62 39 L72 39" stroke="${ink}" stroke-width="2"/><path d="M48 39 Q53 47 58 39 M62 39 Q67 47 72 39" stroke="${ink}" stroke-width=".8" fill="none"/>`;
    if(F==='monocle') s+=`<circle cx="67" cy="41" r="5" fill="none" stroke="#c9a35e" stroke-width="1.4"/><path d="M71 44 Q76 60 72 74" stroke="#c9a35e" stroke-width=".7" fill="none"/>`;
    if(F==='pince') s+=`<circle cx="54" cy="42" r="4" fill="none" stroke="${ink}" stroke-width="1"/><circle cx="66" cy="42" r="4" fill="none" stroke="${ink}" stroke-width="1"/><path d="M58 41 Q60 39 62 41" stroke="${ink}" stroke-width="1" fill="none"/>`;
    if(F==='mous') s+=`<path d="M52 49 Q60 45 68 49 Q60 48 52 49 Z" fill="${hair}" stroke="${hair}" stroke-width="1.5"/>`;
    if(F==='goatee') s+=`<path d="M56 52 L64 52 L60 62 Z" fill="${hair}"/>`;
    if(F==='beard') s+=`<path d="M43 42 Q44 62 60 62 Q76 62 77 42 Q72 54 60 52 Q48 54 43 42 Z" fill="${hair}"/>`;
    if(F==='rendan') s+=`<rect x="56" y="47" width="8" height="3" fill="${hair}"/>`;
    if(F==='handlebar') s+=`<path d="M60 48 Q52 46 48 50 Q46 44 52 45 M60 48 Q68 46 72 50 Q74 44 68 45" stroke="${hair}" stroke-width="2.4" fill="none"/>`;
    if(F==='veil') s+=`<path d="M41 34 L79 34 L76 58 L44 58 Z" fill="#f4f0e8" fill-opacity=".55" stroke="#d8d0c0" stroke-width=".6"/>`;
    // hats
    const H=L.h, hc=dd;
    const HAT={shusheng:`<path d="M43 30 L77 30 L74 16 L46 16 Z" fill="#2a2622"/><path d="M74 20 L84 28" stroke="#2a2622" stroke-width="3"/>`,
      guapi:`<path d="M43 30 A17 13 0 0 1 77 30 Z" fill="#2a2622"/><circle cx="60" cy="16" r="2.4" fill="#a8343a"/>`,
      dongpo:`<rect x="45" y="12" width="30" height="20" fill="#2a2622"/><rect x="49" y="6" width="22" height="8" fill="#2a2622"/>`,
      rujin:`<path d="M43 30 L77 30 L72 12 L48 12 Z" fill="#3a3632"/><path d="M48 12 L44 4 M72 12 L76 4" stroke="#3a3632" stroke-width="3"/>`,
      douli:`<path d="M20 34 L60 10 L100 34 Z" fill="#c8a96a" stroke="#a88a4e"/>`,
      straw:`<ellipse cx="60" cy="27" rx="34" ry="5" fill="#c8a96a"/><rect x="44" y="13" width="32" height="15" rx="4" fill="#c8a96a"/><rect x="44" y="22" width="32" height="4" fill="#7a2a2a"/>`,
      felt:`<path d="M42 30 Q44 12 60 12 Q76 12 78 30 Z" fill="#6b5a44"/><rect x="40" y="27" width="40" height="5" rx="2" fill="#5a4a36"/>`,
      turban:`<path d="M42 32 Q42 14 60 14 Q78 14 78 32 Q60 26 42 32 Z" fill="#e8e1d4" stroke="#bdb2a0"/><path d="M46 22 Q60 28 74 20" stroke="#bdb2a0" fill="none"/>`,
      flatcap:`<path d="M42 30 Q44 16 62 16 Q76 18 78 28 L86 32 L42 32 Z" fill="#6b5a44"/>`,
      fedora:`<ellipse cx="60" cy="28" rx="27" ry="4.5" fill="#2f2b28"/><path d="M45 28 L47 14 Q60 9 73 14 L75 28 Z" fill="#2f2b28"/><rect x="46" y="22" width="28" height="4" fill="#7a2a2a"/>`,
      tophat:`<ellipse cx="60" cy="28" rx="25" ry="4" fill="#1a1716"/><rect x="47" y="0" width="26" height="28" fill="#1a1716"/><rect x="47" y="20" width="26" height="4" fill="#3a3632"/>`,
      bowler:`<ellipse cx="60" cy="29" rx="24" ry="4" fill="#1e1b18"/><path d="M45 29 Q45 11 60 11 Q75 11 75 29 Z" fill="#1e1b18"/>`,
      tricorn:`<path d="M36 28 Q60 8 84 28 Q72 22 60 24 Q48 22 36 28 Z" fill="#1e1b18"/><path d="M48 24 Q60 12 72 24 Z" fill="#1e1b18"/>`,
      panama:`<ellipse cx="60" cy="28" rx="29" ry="5" fill="#e8dcb8"/><path d="M46 28 L48 14 Q60 10 72 14 L74 28 Z" fill="#e8dcb8"/><rect x="47" y="22" width="26" height="4" fill="#2a2622"/>`,
      mortar:`<path d="M40 18 L60 10 L80 18 L60 26 Z" fill="#1a1716"/><rect x="47" y="20" width="26" height="10" fill="#1a1716"/><path d="M74 18 L76 34" stroke="#c9a35e" stroke-width="1.5"/>`,
      bonnet:`<path d="M40 44 Q38 14 60 14 Q82 14 80 44 Q74 26 60 26 Q46 26 40 44 Z" fill="${lt}" stroke="#efe9de" stroke-width="2"/><path d="M42 44 Q50 60 56 58" stroke="${hc}" stroke-width="2" fill="none"/>`,
      pillbox:`<rect x="48" y="16" width="24" height="10" rx="3" fill="${hc}"/><path d="M48 26 L72 26 L70 34 L50 34 Z" fill="#2a2622" fill-opacity=".35"/>`};
    if(HAT[H]) s+=HAT[H];
    // back things first, the body and all
    let body=back.join('')+s;
    const tr=casual?'rotate(-3 60 200)':up?'translate(0 -3) scale(1 1.015)':'';
    return `<svg viewBox="0 0 120 210" width="100%" height="100%" preserveAspectRatio="xMidYMax meet"><ellipse cx="60" cy="205" rx="34" ry="5" fill="#000" fill-opacity=".1"/><g transform="${tr}">${body}${top.filter(t=>t.includes('stroke-width="4"')).join('')}</g></svg>`; }

  window.HK_LOOK={CAT,COLORS,HAIR,FEM_O,ids,labels,clean,random,svg,
    // back-office names override the defaults: entries {key:'o.robe', label:'長袍'}
    rename(list){ for(const e of Array.isArray(list)?list:[]) if(e&&e.key&&String(e.label||'').trim()&&e.key in labels) labels[e.key]=String(e.label).trim(); },
    name(k){ return labels[k]||''; } };
})();
