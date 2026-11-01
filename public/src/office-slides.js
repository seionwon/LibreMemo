import {buildRenderSlide,HeuristicMetrics} from '../vendor/office/genoffice.js';
import {esc,number,color,font,imageSource,safeLink} from './office-common.js';
const n=number;
class BrowserMetrics extends HeuristicMetrics {
  constructor(){super();try{this.context=new OffscreenCanvas(1,1).getContext('2d');}catch{/* Node checks use deterministic upstream metrics. */}}
  measure(text,style){
    const fallback=super.measure(text,style);
    if(!this.context||!text)return fallback;
    const family='"'+font(style.fontFamily).replace(/"/g,'')+'", sans-serif';
    this.context.font=(style.italic?'italic ':'')+(style.bold?'700 ':'400 ')+style.fontSizePx+'px '+family;
    this.context.fontKerning=style.kerning===false?'none':'normal';
    const width=this.context.measureText(text).width;
    return Number.isFinite(width)&&width>=fallback*.55?width:fallback;
  }
}
function dataURL(bytes,type){let binary='';for(let i=0;i<bytes.length;i+=16384)binary+=String.fromCharCode(...bytes.subarray(i,i+16384));return 'data:'+type+';base64,'+btoa(binary);}
const mimes={png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',gif:'image/gif',webp:'image/webp',svg:'image/svg+xml',bmp:'image/bmp'};
function mediaResolver(archive){const cache=new Map();return path=>{
  if(cache.has(path))return cache.get(path);const type=mimes[String(path).split('.').at(-1).toLowerCase()],bytes=archive.readBytes(path);
  const result=type&&bytes?dataURL(bytes,type):undefined;cache.set(path,result);return result;
};}
function paintFactory(prefix){let next=0;const definitions=[];
  const fill=value=>{
    if(!value||value.kind==='none')return 'none';
    if(value.kind==='solid')return color(value.color,'none');
    if(value.kind==='pattern')return color(value.bg,'white');
    if(value.kind==='gradient'){
      const id=prefix+'-fill-'+(++next),radial=!!value.radial,tag=radial?'radialGradient':'linearGradient';
      const attrs=radial?'cx="'+n(value.center?.x,.5)+'" cy="'+n(value.center?.y,.5)+'" r=".75"':'x1="0" y1="0" x2="1" y2="0" gradientTransform="rotate('+n(value.angleDeg)+' .5 .5)"';
      definitions.push('<'+tag+' id="'+id+'" '+attrs+'>'+value.stops.map(s=>'<stop offset="'+Math.max(0,Math.min(1,n(s.pos)))+'" stop-color="'+esc(color(s.color,'white'))+'"/>').join('')+'</'+tag+'>');return 'url(#'+id+')';
    }
    const src=imageSource(value.dataUrl);if(src){const id=prefix+'-fill-'+(++next);definitions.push('<pattern id="'+id+'" width="1" height="1" patternContentUnits="objectBoundingBox"><image href="'+esc(src)+'" width="1" height="1" preserveAspectRatio="none"/></pattern>');return 'url(#'+id+')';}
    return 'none';
  };
  return {fill,definitions};
}
const stroke=s=>s?'stroke="'+esc(color(s.color,'#777'))+'" stroke-width="'+Math.max(0,n(s.widthPx,1))+'"'+(s.dash?.length?' stroke-dasharray="'+s.dash.map(n).join(' ')+'"':''): 'stroke="none"';
const hasWideChar=text=>/[^\u0000-\u024f]/.test(String(text||''));
const normDeg=deg=>{const d=((n(deg)%360)+360)%360;return d>180?d-360:d;};
const isInvertedDeg=deg=>Math.abs(Math.abs(normDeg(deg))-180)<=1;
function canMergeRuns(a,b){
  if(!a||!b||a.image||b.image||!a.text||!b.text)return false;
  if(a.isBullet||b.isBullet||a.rotate90||b.rotate90||a.rotate270||b.rotate270||a.rtl||b.rtl)return false;
  if(a.justifyExtraPx||b.justifyExtraPx||String(a.text).includes('\t')||String(b.text).includes('\t'))return false;
  if(Math.abs(n(a.fontSizePx,16)-n(b.fontSizePx,16))>=.1||Math.abs(n(a.baselineY)-n(b.baselineY))>=.5)return false;
  if(color(a.color,'#202633')!==color(b.color,'#202633'))return false;
  if(Boolean(a.bold)!==Boolean(b.bold)||Boolean(a.italic)!==Boolean(b.italic))return false;
  if(Boolean(a.underline)!==Boolean(b.underline)||Boolean(a.strike)!==Boolean(b.strike))return false;
  if((a.highlight||'')!==(b.highlight||'')||(a.link||'')!==(b.link||''))return false;
  if(Math.abs(n(a.letterSpacingPx)-n(b.letterSpacingPx))>=.1)return false;
  if(font(a.fontFamily)!==font(b.fontFamily)&&!(a.srcRunIdx!=null&&a.srcRunIdx===b.srcRunIdx))return false;
  const size=Math.max(1,n(a.fontSizePx,16)),gap=n(b.x)-(n(a.x)+n(a.widthPx));
  return gap>=-Math.max(4,size*.35)&&gap<=Math.max(4,size*.35);
}
function normalizeAndMergeRuns(line,isVertical){
  const rawRuns=line?.runs||[];
  if(!rawRuns.length||isVertical)return rawRuns;
  let shift=0;
  const adjusted=rawRuns.map(run=>{
    if(!run||run.image||!run.text)return run;
    const size=Math.max(1,n(run.fontSizePx,16)),rawLs=n(run.letterSpacingPx),minLs=-size*.12;
    const x=n(run.x)+shift;
    if(rawLs<minLs){
      const chars=[...String(run.text)].length,add=(minLs-rawLs)*chars;
      const newW=Math.max(size*.5*chars,n(run.widthPx)+add);
      shift+=newW-n(run.widthPx);
      return {...run,x,widthPx:newW,letterSpacingPx:minLs};
    }
    return shift?{...run,x}:run;
  });
  const desiredShift=shift>0?(line.align==='center'?shift/2:line.align==='right'?shift:0):0;
  const alignShift=Math.max(0,Math.min(desiredShift,n(adjusted[0]?.x)));
  const aligned=alignShift>0?adjusted.map(r=>r?{...r,x:n(r.x)-alignShift}:r):adjusted;
  const merged=[];
  for(const run of aligned){
    const prev=merged.at(-1);
    if(prev&&canMergeRuns(prev,run)){
      const nextFont=!hasWideChar(prev.text)&&hasWideChar(run.text)&&run.fontFamily?run.fontFamily:prev.fontFamily;
      prev.text+=run.text;
      prev.fontFamily=nextFont;
      prev.widthPx=Math.max(n(prev.widthPx)+n(run.widthPx),n(run.x)+n(run.widthPx)-n(prev.x));
      prev.ascentPx=Math.max(n(prev.ascentPx),n(run.ascentPx));
    }else merged.push(run?{...run}:run);
  }
  return merged;
}
function textLayout(layout){
  if(!layout)return '';
  const ins=layout.insets||{l:0,t:0},ox=n(ins.l),oy=n(ins.t),isVertical=Boolean(layout.vert);
  return layout.lines.map(line=>normalizeAndMergeRuns(line,isVertical).map(run=>{
    const rx=ox+n(run.x),by=oy+n(run.baselineY);
    if(run.image){const src=imageSource(run.image);return src?'<image href="'+esc(src)+'" x="'+rx+'" y="'+n(by-n(run.ascentPx))+'" width="'+n(run.widthPx)+'" height="'+n(run.ascentPx)+'"/>':'';}
    const rotation=run.rotate90?90:run.rotate270?-90:0;
    const size=Math.max(1,n(run.fontSizePx,16)),ascent=n(run.ascentPx,size*.8),top=by-ascent;
    const ls=Math.max(-size*.12,n(run.letterSpacingPx)+n(run.justifyExtraPx));
    const family="'"+font(run.fontFamily).replace(/'/g,'')+"',sans-serif";
    const style='font-family:'+family+';font-size:'+size+'px;line-height:1;white-space:pre;color:'+color(run.color,'#202633')+';font-weight:'+(run.bold?'700':'400')+';font-style:'+(run.italic?'italic':'normal')+(Math.abs(ls)>=.05?';letter-spacing:'+n(ls)+'px':'')+(run.underline||run.strike?';text-decoration:'+([run.underline?'underline':'',run.strike?'line-through':''].filter(Boolean).join(' ')):'')+(run.rtl?';direction:rtl;unicode-bidi:plaintext':'');
    let text='<foreignObject x="'+rx+'" y="'+top+'" width="'+Math.max(size,n(run.widthPx)+size)+'" height="'+size*1.5+'" overflow="visible"'+(rotation?' transform="rotate('+rotation+' '+rx+' '+by+')"':'')+'><span xmlns="http://www.w3.org/1999/xhtml" data-office-text style="display:inline-block;'+esc(style)+'">'+esc(run.text)+'</span></foreignObject>';
    const href=/^slide:\d+$/.test(run.link||'')?'#office-slide-'+run.link.slice(6):safeLink(run.link);
    if(href)text='<a href="'+esc(href)+'">'+text+'</a>';
    if(run.highlight)text='<rect x="'+rx+'" y="'+n(by-size*.85)+'" width="'+n(run.widthPx)+'" height="'+n(size*1.15)+'" fill="'+esc(color(run.highlight,'transparent'))+'"/>'+text;
    return text;
  }).join('')).join('');
}
function chartHTML(chart,paint){
  const rect=r=>'<rect x="'+n(r.x)+'" y="'+n(r.y)+'" width="'+Math.max(0,n(r.w))+'" height="'+Math.max(0,n(r.h))+'" fill="'+esc(r.fill?paint.fill(r.fill):color(r.color,'none'))+'"/>';
  const lines=[...(chart.gridLines||[]),...(chart.axisLines||[])].map(l=>'<line x1="'+n(l.x1)+'" y1="'+n(l.y1)+'" x2="'+n(l.x2)+'" y2="'+n(l.y2)+'" '+stroke(l)+'/>').join('');
  const polylines=(chart.polylines||[]).map(l=>'<'+(l.closed?'polygon':'polyline')+' points="'+l.points.map(n).join(' ')+'" fill="'+esc(color(l.fill,'none'))+'" '+stroke(l)+'/>').join('');
  const paths=(chart.paths||[]).map(p=>'<path d="'+esc(p.d)+'" fill="'+esc(color(p.fill,'none'))+'"/>').join('');
  const wedges=(chart.wedges||[]).map(w=>{
    const point=(radius,angle)=>[n(w.cx)+radius*Math.cos(angle*Math.PI/180),n(w.cy)+radius*Math.sin(angle*Math.PI/180)];
    const start=n(w.startDeg)-90,sweep=Math.min(359.999,Math.max(.001,n(w.sweepDeg))),end=start+sweep,r=Math.max(0,n(w.outerR)),inner=Math.max(0,n(w.innerR));
    const a=point(r,start),b=point(r,end),c=point(inner,end),d=point(inner,start);
    const path='M '+a.join(' ')+' A '+r+' '+r+' 0 '+(sweep>180?1:0)+' 1 '+b.join(' ')+' L '+c.join(' ')+(inner?' A '+inner+' '+inner+' 0 '+(sweep>180?1:0)+' 0 '+d.join(' '):'')+' Z';
    return '<path d="'+path+'" fill="'+esc(color(w.color,'#667085'))+'"/>';
  }).join('');
  const labels=(chart.labels||[]).map(l=>'<text x="'+n(l.x)+'" y="'+n(l.y+n(l.fontSizePx,12))+'" font-size="'+n(l.fontSizePx,12)+'" font-family="'+esc(font(l.fontFamily))+'" fill="'+esc(color(l.color,'#202633'))+'"'+(l.bold?' font-weight="700"':'')+(l.rotationDeg?' transform="rotate('+n(l.rotationDeg)+' '+n(l.x)+' '+n(l.y)+')"':'')+'>'+esc(l.text)+'</text>').join('');
  return (chart.bgFill?rect({x:0,y:0,w:chart.box.w,h:chart.box.h,fill:chart.bgFill}):'')+(chart.plotRect?rect(chart.plotRect):'')+lines+(chart.bars||[]).map(rect).join('')+polylines+paths+wedges+(chart.markers||[]).map(m=>'<circle cx="'+n(m.x)+'" cy="'+n(m.y)+'" r="'+n(m.r)+'" fill="'+esc(color(m.color))+'"/>').join('')+(chart.swatches||[]).map(rect).join('')+labels;
}
function renderNode(node,paint,warnings,depth=0,parentState={rot:0,flipH:false,flipV:false}){
  if(depth>64)throw Error('슬라이드 개체가 너무 깊게 중첩되어 있습니다.');
  const b=node.box,w=Math.max(0,n(b.w)),h=Math.max(0,n(b.h));let body='';
  const transform='translate('+n(b.x)+' '+n(b.y)+')'+(b.rotationDeg?' rotate('+n(b.rotationDeg)+' '+w/2+' '+h/2+')':'')+(b.flipH||b.flipV?' translate('+(b.flipH?w:0)+' '+(b.flipV?h:0)+') scale('+(b.flipH?-1:1)+' '+(b.flipV?-1:1)+')':'');
  if(node.type==='group'){
    const nextState={rot:normDeg(n(parentState.rot)+n(b.rotationDeg)),flipH:Boolean(parentState.flipH)!==Boolean(b.flipH),flipV:Boolean(parentState.flipV)!==Boolean(b.flipV)};
    body=node.children.map(c=>renderNode(c,paint,warnings,depth+1,nextState)).join('');
    return '<g transform="'+transform+'">'+body+'</g>';
  }
  if(node.type==='picture'){
    const src=imageSource(node.dataUrl);if(src){
      const crop=node.srcRect||{},left=n(crop.l),top=n(crop.t),cw=Math.max(.001,1-left-n(crop.r)),ch=Math.max(.001,1-top-n(crop.b));
      body='<svg width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'" overflow="hidden"><image href="'+esc(src)+'" x="'+(-left*w/cw)+'" y="'+(-top*h/ch)+'" width="'+(w/cw)+'" height="'+(h/ch)+'" preserveAspectRatio="none" opacity="'+Math.max(0,Math.min(1,n(node.opacity,1)))+'"/></svg>';
    }else{warnings.add('일부 그림·미디어는 미리보기가 없어 표시하지 못했습니다.');body='<rect width="'+w+'" height="'+h+'" fill="#eef1f5"/><text x="8" y="20" font-size="14">'+esc(node.name||'그림')+'</text>';}
  }else if(node.type==='table')body=node.cells.map(c=>'<g transform="translate('+n(c.x)+' '+n(c.y)+')"><rect width="'+n(c.w)+'" height="'+n(c.h)+'" fill="'+esc(paint.fill(c.fill))+'"/>'+Object.entries(c.borders||{}).map(([side,s])=>{const p=side==='l'?[0,0,0,c.h]:side==='r'?[c.w,0,c.w,c.h]:side==='t'?[0,0,c.w,0]:[0,c.h,c.w,c.h];return '<line x1="'+n(p[0])+'" y1="'+n(p[1])+'" x2="'+n(p[2])+'" y2="'+n(p[3])+'" '+stroke(s)+'/>';}).join('')+textLayout(c.text)+'</g>').join('');
  else if(node.type==='chart')body=chartHTML(node,paint);
  else if(node.type==='placeholder-chip'){warnings.add('일부 슬라이드 개체는 원래 모양을 표시하지 못했습니다.');body='<text x="8" y="20" font-size="14">'+esc(node.label)+'</text>';}
  else{
    const style='fill="'+esc(paint.fill(node.fill))+'" '+stroke(node.stroke);
    let geom='';
    if(node.line)geom='<polyline points="'+node.line.points.map(n).join(' ')+'" fill="none" '+stroke(node.stroke||{widthPx:1,color:'#333'})+'/>';
    else if(node.pathData)geom='<path d="'+esc(node.pathData)+'" '+style+'/>';
    else if(node.polygonPoints)geom='<polygon points="'+node.polygonPoints.map(n).join(' ')+'" '+style+'/>';
    else if(node.presetGeometry==='ellipse')geom='<ellipse cx="'+w/2+'" cy="'+h/2+'" rx="'+w/2+'" ry="'+h/2+'" '+style+'/>';
    else geom='<rect width="'+w+'" height="'+h+'" rx="'+n(node.cornerRadiusPx)+'" '+style+'/>';
    if(node.fillPathData)geom+='<path d="'+esc(node.fillPathData)+'" fill="'+esc(paint.fill(node.fill))+'"/>';
    if(node.strokePathData)geom+='<path d="'+esc(node.strokePathData)+'" fill="none" '+stroke(node.stroke)+'/>';
    const geomTransform=[
      b.rotationDeg?'rotate('+n(b.rotationDeg)+' '+w/2+' '+h/2+')':'',
      b.flipH||b.flipV?'translate('+(b.flipH?w:0)+' '+(b.flipV?h:0)+') scale('+(b.flipH?-1:1)+' '+(b.flipV?-1:1)+')':'',
    ].filter(Boolean).join(' ');
    if(geomTransform)geom='<g transform="'+geomTransform+'">'+geom+'</g>';
    let txt=textLayout(node.text);
    if(txt){
      const ownRot=normDeg(b.rotationDeg);
      let textRot=isInvertedDeg(ownRot)?0:ownRot;
      if(isInvertedDeg(n(parentState.rot)+textRot))textRot=normDeg(textRot+180);
      const textTransform=[
        parentState.flipH||parentState.flipV?'translate('+(parentState.flipH?w:0)+' '+(parentState.flipV?h:0)+') scale('+(parentState.flipH?-1:1)+' '+(parentState.flipV?-1:1)+')':'',
        textRot?'rotate('+n(textRot)+' '+w/2+' '+h/2+')':'',
      ].filter(Boolean).join(' ');
      if(textTransform)txt='<g transform="'+textTransform+'">'+txt+'</g>';
    }
    return '<g transform="translate('+n(b.x)+' '+n(b.y)+')">'+geom+txt+'</g>';
  }
  return '<g transform="'+transform+'">'+body+'</g>';
}
const SKIP_PLACEHOLDERS=new Set(['dt','ftr','sldNum','hdr']);
const cleanSlideTitle=text=>{
  const cleaned=String(text||'').replace(/\s+/g,' ').replace(/^[•·▪▫◦‣⁃\-*]\s+/,'').trim();
  return cleaned.length>80?cleaned.slice(0,80).trimEnd()+'…':cleaned;
};
const isSlideNumberText=text=>/^(?:slide|슬라이드|p|page|쪽)?\s*\d+(?:\s*[/|-]\s*\d+)?$/i.test(String(text||'').trim());
const isBadgeOrStatText=text=>{
  const t=String(text||'').trim();
  if(!t||isSlideNumberText(t))return true;
  if(/^(?:(?:part|step|chap(?:ter)?|section|sec|장|절|부)\s*)?(?:0?\d{1,3}|[IVXLCDM]{1,5})[.:)]?$/i.test(t))return true;
  return /^[+-]?\d[\d,.\s%$₩€£¥배건명개년월일시분초pPtT+/*-]*$/.test(t);
};
export function formatSlideTocTitle(index,total,rawTitle=''){
  const prefix=(index+1)+'/'+total;
  const cleaned=cleanSlideTitle(rawTitle).replace(new RegExp('^'+(index+1)+'\\s*/\\s*'+total+'(?:\\s+|[-:.)]\\s*)?'),'').trim();
  return cleaned?prefix+' '+cleaned:prefix;
}
function extractSlideTitle(slide,tree,slideNo){
  const sources=new Map(),indexElements=list=>{for(const el of list||[]){if(el?.id)sources.set(el.id,el);if(el?.children)indexElements(el.children);}};
  indexElements(slide?.elements);
  const H=Math.max(1,n(tree?.heightPx,540)),W=Math.max(1,n(tree?.widthPx,960)),candidates=[];
  const pushSegments=(lines,box,meta)=>{
    const groups=[];
    for(const line of lines||[]){
      const runs=(line.runs||[]).filter(r=>!r.isBullet&&String(r.text||'').trim());
      const text=(line.runs||[]).filter(r=>!r.isBullet).map(r=>r.text||'').join('').replace(/\s+/g,' ').trim();
      if(!text||!runs.length)continue;
      const fontSize=Math.max(0,...runs.map(r=>n(r.fontSizePx,16))),bold=runs.some(r=>r.bold);
      const x=box.x+n(runs[0]?.x),y=box.y+n(line.top,n(runs[0]?.baselineY)-n(runs[0]?.ascentPx,fontSize*.8));
      const prev=groups.at(-1);
      if(prev&&!line.paraStart&&(prev.softBreakAfter==null||Math.abs(prev.fontSize-fontSize)<=1.5)){
        prev.text+=(prev.trailingText||' ')+text;prev.fontSize=Math.max(prev.fontSize,fontSize);prev.bold=prev.bold||bold;
        prev.trailingText=line.trailingText;prev.softBreakAfter=line.softBreakAfter;
      }else groups.push({text,fontSize,bold,x,y,trailingText:line.trailingText,softBreakAfter:line.softBreakAfter});
    }
    let seenMainTitle=false;
    groups.forEach(seg=>{
      const text=cleanSlideTitle(seg.text);if(!text)return;
      const isMain=meta.titleKind===2&&!seenMainTitle&&!isBadgeOrStatText(text);
      if(isMain)seenMainTitle=true;
      candidates.push({...meta,text,fontSize:seg.fontSize,bold:seg.bold,x:seg.x,y:seg.y,titleKind:meta.titleKind===2?(isMain?2:1):meta.titleKind});
    });
  };
  const visit=(nodes,ox=0,oy=0)=>{
    for(const node of nodes||[]){
      if(!node||SKIP_PLACEHOLDERS.has(node.placeholder))continue;
      const bx=ox+n(node.box?.x),by=oy+n(node.box?.y);
      if(node.type==='group'){visit(node.children,bx,by);continue;}
      const el=sources.get(node.sourceId),ph=node.placeholder||el?.placeholder||'',name=String(el?.name||node.name||'').trim();
      const titleKind=ph==='title'||ph==='ctrTitle'||/^(?:title|ctrtitle|center\s*title|제목|표제)(?:\s+\d+)?$/i.test(name)?2:ph==='subTitle'||/^subtitle(?:\s+\d+)?$/i.test(name)?1:0;
      const meta={decoration:!!node.decoration,titleKind};
      if(node.text?.lines?.length)pushSegments(node.text.lines,{x:bx,y:by},meta);
      else if(node.type==='table')for(const cell of node.cells||[])if(cell.text?.lines?.length)pushSegments(cell.text.lines,{x:bx+n(cell.x),y:by+n(cell.y)},{...meta,titleKind:0});
      else if(node.type==='chart'&&node.labels?.length){
        for(const l of node.labels){const text=cleanSlideTitle(l.text);if(text)candidates.push({...meta,titleKind:0,text,fontSize:n(l.fontSizePx,12),bold:!!l.bold,x:bx+n(l.x),y:by+n(l.y)});}
      }
    }
  };
  visit(tree?.nodes);
  const active=candidates.some(c=>!c.decoration)?candidates.filter(c=>!c.decoration):candidates;
  const score=c=>{
    const font=Math.min(c.fontSize||16,44);
    const topZone=c.y<=H*.28&&c.fontSize>=20?35:c.y<=H*.45&&c.fontSize>=24?15:0;
    const penalty=isSlideNumberText(c.text)?120:isBadgeOrStatText(c.text)?60:0;
    return (c.titleKind===2?200:c.titleKind===1?8:0)+font*2.2+topZone+(c.bold?4:0)-(c.y/H)*20-(c.x/W)*4-penalty;
  };
  const ranked=[...active].sort((a,b)=>score(b)-score(a));
  const best=ranked.find(c=>!isSlideNumberText(c.text))||ranked[0];
  if(!best||isSlideNumberText(best.text)&&String(best.text).replace(/\D+/g,'')===String(slideNo))return '';
  return best.text;
}
export function renderSlides(opened,warnings){
  const media=mediaResolver(opened.archive),issues=new Set(),metrics=new BrowserMetrics(),total=opened.deck.slides.length;
  if(total>10000)throw Error('슬라이드가 10,000장을 넘는 문서는 나누어 가져와 주세요.');
  const outline=[];
  const body=opened.deck.slides.map((slide,index)=>{
    const tree=buildRenderSlide(slide,opened.deck.size,{fitWidthPx:960,media,metrics,slideNo:index+1}),paint=paintFactory('office-slide-'+index);
    const bg=paint.fill(tree.background),content=tree.nodes.map(node=>renderNode(node,paint,issues)).join('');
    const title=formatSlideTocTitle(index,total,extractSlideTitle(slide,tree,index+1));
    outline.push('<a href="#office-slide-'+(index+1)+'" data-level="1">'+esc(title)+'</a>');
    return '<section class="office-slide" id="office-slide-'+(index+1)+'" data-slide-title="'+esc(title)+'" style="width:60em"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+tree.widthPx+' '+tree.heightPx+'" role="group" aria-label="'+esc(title)+'"><defs>'+paint.definitions.join('')+'</defs><rect width="100%" height="100%" fill="'+esc(bg==='none'?'white':bg)+'"/>'+content+'</svg></section>';
  });
  let bodyLen=0;for(const s of body)bodyLen+=s.length;
  warnings.push(...issues);
  const head='<article data-office-slides><template data-ebook-outline>'+outline.join('')+'</template>';
  return bodyLen>=64*1024*1024?new Blob([head,...body,'</article>']):head+body.join('')+'</article>';
}
