// Page layout for reflowable ebooks. Paged reading keeps the single vertical
// flow and moves a line-aligned window over it, so annotations, pen strokes,
// bookmarks, search and read-aloud use the same geometry in both modes.
export const DEFAULT_READING_LAYOUT=Object.freeze({enabled:true,flow:'continuous',margin:48,width:720,lineHeight:0,paragraph:0,align:'original',hyphens:false,letterSpacing:0,indent:0,weight:0});
const number=(value,low,high,fallback)=>Number.isFinite(value)?Math.min(high,Math.max(low,value)):fallback;
export function normalizeReadingLayout(value,defaults=DEFAULT_READING_LAYOUT){
  const input=value&&typeof value==='object'&&!Array.isArray(value)?value:{};
  return {
    enabled:typeof input.enabled==='boolean'?input.enabled:defaults.enabled,
    flow:['continuous','paged'].includes(input.flow)?input.flow:defaults.flow,
    margin:number(input.margin,0,160,defaults.margin),
    width:number(input.width,400,1400,defaults.width),
    lineHeight:input.lineHeight===0?0:number(input.lineHeight,1.1,2.6,defaults.lineHeight),
    paragraph:input.paragraph===0?0:number(input.paragraph,.1,2,defaults.paragraph),
    align:['original','left','justify'].includes(input.align)?input.align:defaults.align,
    hyphens:typeof input.hyphens==='boolean'?input.hyphens:defaults.hyphens,
    letterSpacing:number(input.letterSpacing,0,.2,defaults.letterSpacing),
    indent:number(input.indent,0,4,defaults.indent),
    weight:[0,500,600].includes(input.weight)?input.weight:defaults.weight,
  };
}
const BOOK='article[data-ebook]:not([data-ebook-layout="fixed"])',TEXT=BOOK+' .ebook-section:not(.ebook-comic-page)';
export function readingLayoutCss(layout){
  let css='html[data-htmlmemo-paged]{overflow:hidden!important;scrollbar-width:none}html[data-htmlmemo-paged]::-webkit-scrollbar{display:none}html[data-htmlmemo-paged] '+BOOK+'{padding-block-end:100vh!important}#htmlmemo-page-top,#htmlmemo-page-bottom{position:fixed;left:0;right:0;z-index:2147483000;pointer-events:none;background:var(--htmlmemo-reader-paper,#fff)}';
  if(!layout.enabled)return css;
  // min() keeps a usable text column on phones whatever margin was chosen.
  css+=BOOK+'{box-sizing:border-box!important;max-width:'+(layout.width+layout.margin*2)+'px!important;margin-inline:auto!important;padding-inline:min('+layout.margin+'px,8vw)!important}'+TEXT+'{max-width:none!important;margin-inline:0!important}';
  if(layout.lineHeight)css+=TEXT+' :is(p,li,dd,dt,blockquote,div,td){line-height:'+layout.lineHeight+'!important}';
  if(layout.paragraph)css+=TEXT+' p{margin-block:0 '+layout.paragraph+'em!important}';
  if(layout.align!=='original')css+=TEXT+' :is(p,li,dd,blockquote){text-align:'+layout.align+'!important}';
  if(layout.letterSpacing)css+=TEXT+' :is(p,li,dd,blockquote){letter-spacing:'+layout.letterSpacing+'em!important}';
  if(layout.indent)css+=TEXT+' p{text-indent:'+layout.indent+'em!important}';
  if(layout.weight)css+=TEXT+' :is(p,li,dd,blockquote){font-weight:'+layout.weight+'!important}';
  if(layout.hyphens)css+=TEXT+' :is(p,li,dd,blockquote){hyphens:auto!important;-webkit-hyphens:auto!important}';
  return css;
}
export const PAGE_TOP=24,PAGE_BOTTOM=32;
/** Where the page ends: above a cut line or at a chapter, never before real progress. */
export function pageBreak({height,cut,sectionTop}){
  const limit=height-PAGE_BOTTOM;
  let end=cut&&cut.top>PAGE_TOP&&cut.top<limit&&cut.bottom>limit?cut.top:limit;
  if(Number.isFinite(sectionTop)&&sectionTop>PAGE_TOP+40&&sectionTop<end)end=sectionTop;
  return end;
}
export function pageNumbers({top,contentHeight,pageHeight}){
  const size=Math.max(1,pageHeight),pages=Math.max(1,Math.ceil(contentHeight/size)),page=Math.min(pages,Math.floor((top+size/2)/size)+1);
  return {page,pages,percent:Math.min(100,Math.max(0,Math.round(contentHeight>0?(top+size)/contentHeight*100:100)))};
}

export class ReadingPager {
  constructor(reader){this.reader=reader;this.history=[];this.frame=0;this.end=0;this.turning=false;this.lastWheel=0;this.touch=null;}
  get doc(){return this.reader.doc;}
  get win(){return this.doc.defaultView;}
  get active(){return this.reader.readingLayout?.()?.flow==='paged'&&this.reader.supportsReadingLayout?.();}
  get top(){return this.win.scrollY;}
  article(){return this.doc.querySelector('article[data-ebook]');}
  contentBottom(){return this.doc.querySelector('article[data-ebook]>.ebook-section:last-of-type')?.getBoundingClientRect().bottom??this.article()?.getBoundingClientRect().bottom??0;}
  mask(id){
    let node=this.doc.getElementById(id);
    if(!node){node=this.doc.createElement('div');node.id=id;node.setAttribute('data-htmlmemo-ui','');node.setAttribute('aria-hidden','true');this.doc.body.append(node);}
    return node;
  }
  clear(){this.stopAuto();cancelAnimationFrame(this.frame);this.frame=0;this.history=[];for(const id of ['htmlmemo-page-top','htmlmemo-page-bottom'])this.doc?.getElementById(id)?.remove();this.doc?.documentElement?.removeAttribute('data-htmlmemo-paged');}
  /** The text line, picture or row crossing a viewport y, if any. */
  crossing(y){
    const box=this.article()?.getBoundingClientRect();if(!box)return null;
    for(const share of [.5,.3,.7]){
      const x=box.left+box.width*share,caret=this.doc.caretRangeFromPoint?.(x,y),node=caret?.startContainer;
      if(node?.nodeType===3&&node.data.length){
        const range=this.doc.createRange(),offset=Math.min(caret.startOffset,node.data.length-1);range.setStart(node,offset);range.setEnd(node,offset+1);
        const rect=range.getBoundingClientRect();
        if(rect.height&&rect.top<y-1&&rect.bottom>y+1)return {top:rect.top,bottom:rect.bottom};
        if(rect.height)continue;
      }
      const block=this.doc.elementFromPoint(x,y)?.closest?.('img,svg,tr,figure,pre,table');
      if(block){const rect=block.getBoundingClientRect();if(rect.top<y-1&&rect.bottom>y+1)return {top:rect.top,bottom:rect.bottom};}
    }
    return null;
  }
  nextSectionTop(limit){
    const sections=this.doc.querySelectorAll('article[data-ebook]>.ebook-section');let low=0,high=sections.length-1,found=Infinity;
    while(low<=high){const middle=(low+high)>>1,top=sections[middle].getBoundingClientRect().top;if(top>PAGE_TOP+40){found=top;high=middle-1;}else low=middle+1;}
    return found<limit?found:Infinity;
  }
  /** Show exactly one page: nudge a partial first line in, then hide what follows. */
  render({snap=false}={}){
    this.frame=0;
    if(!this.active||this.reader.host?.hidden||this.reader.disposed||!this.doc?.body)return;
    this.doc.documentElement.setAttribute('data-htmlmemo-paged','');
    const height=this.win.innerHeight;
    if(snap&&this.top>0){const cut=this.crossing(PAGE_TOP);if(cut&&Math.abs(cut.top-PAGE_TOP)>=1){this.turning=true;this.win.scrollBy(0,cut.top-PAGE_TOP);}}
    const limit=height-PAGE_BOTTOM,end=pageBreak({height,cut:this.crossing(limit),sectionTop:this.nextSectionTop(limit)});
    this.end=end;
    const top=this.mask('htmlmemo-page-top'),bottom=this.mask('htmlmemo-page-bottom');
    top.style.cssText='top:0;height:'+(this.top>0?PAGE_TOP:0)+'px';
    bottom.style.cssText='top:'+end+'px;bottom:0';
    this.reader.updateReadingControls?.();
  }
  schedule(options){
    if(!this.active||this.frame)return;
    this.frame=requestAnimationFrame(()=>this.render(options));
  }
  scrolled(){
    if(this.turning){this.turning=false;this.schedule();return;}
    // A jump from the table of contents, search or a note is not a page turn.
    if(this.active){this.history=[];this.schedule({snap:true});}
  }
  // The scroll event arrives after this returns; `turning` tells it apart from a jump.
  go(top){const target=Math.max(0,top);if(Math.abs(target-this.top)>=1)this.turning=true;this.win.scrollTo(this.win.scrollX,target);this.render();this.reader.rememberPosition?.();this.reader.callbacks?.onView?.();}
  next(){
    if(!this.active)return false;
    this.render();
    if(this.contentBottom()<=this.end+1)return false;
    this.history.push(this.top);this.go(this.top+Math.max(this.end-PAGE_TOP,40));return true;
  }
  previous(){
    if(!this.active||this.top<=0)return false;
    const back=this.history.pop();
    if(back!==undefined){this.go(back);return true;}
    this.go(this.top-(this.win.innerHeight-PAGE_TOP-PAGE_BOTTOM));
    const cut=this.crossing(PAGE_TOP);if(cut)this.go(this.top+cut.top-PAGE_TOP);
    return true;
  }
  wheel(event){
    this.stopAuto();
    if(!this.active||event.ctrlKey)return false;
    event.preventDefault();
    const now=performance.now(),delta=Math.abs(event.deltaY)>=Math.abs(event.deltaX)?event.deltaY:event.deltaX;
    if(delta&&now-this.lastWheel>260){this.lastWheel=now;if(delta>0)this.next();else this.previous();}
    return true;
  }
  free(){return this.reader.tool==='select'&&!this.reader.annotationDrag&&!String(this.doc.getSelection?.()||'').trim();}
  click(event){
    this.stopAuto();
    if(!this.active||event.defaultPrevented||!this.free())return;
    const target=event.target?.nodeType===1?event.target:event.target?.parentElement;
    if(target?.closest?.('a[href],button,summary,[data-htmlmemo-mark],[data-htmlmemo-id],[data-htmlmemo-ui]'))return;
    const width=this.win.innerWidth;
    if(event.clientX<width*.25)this.previous();else if(event.clientX>width*.75)this.next();
  }
  // Continuous reading only; any deliberate input hands control back at once.
  startAuto(speed){
    this.stopAuto();if(this.active||!this.reader.supportsReadingLayout?.())return false;
    let last=performance.now(),carry=0;this.autoSpeed=speed;
    const step=now=>{
      if(!this.autoSpeed||this.reader.disposed||this.reader.host?.hidden){this.stopAuto();return;}
      carry+=(now-last)/1000*this.autoSpeed;last=now;
      const whole=Math.floor(carry);if(whole){carry-=whole;this.win.scrollBy(0,whole);}
      if(this.contentBottom()<=this.win.innerHeight){this.stopAuto();return;}
      this.autoFrame=this.win.requestAnimationFrame(step);
    };
    this.autoFrame=this.win.requestAnimationFrame(step);return true;
  }
  stopAuto(){const was=!!this.autoSpeed;this.autoSpeed=0;if(this.autoFrame)this.win?.cancelAnimationFrame(this.autoFrame);this.autoFrame=0;if(was)this.reader.onAutoScrollEnd?.();}
  touchStart(event){this.stopAuto();this.touch=this.active&&event.touches.length===1&&this.free()?{x:event.touches[0].clientX,y:event.touches[0].clientY}:null;}
  touchEnd(event){
    const start=this.touch;this.touch=null;const end=event.changedTouches?.[0];
    if(!start||!end||!this.active)return;
    const x=end.clientX-start.x,y=end.clientY-start.y,dominant=Math.abs(x)>Math.abs(y)?x:y;
    if(Math.abs(dominant)<50)return;
    if(dominant<0)this.next();else this.previous();
  }
}
