import {validThumbnail} from './model.js';
export const CARD_PREVIEW_PREFIX='card-preview-v1:';
export const cardPreviewKey=record=>JSON.stringify([record.contentKey||record.sourceIdentity?.digest||record.id,record.bodyVersion||0,record.metadata?.format||'html']);
export function savedCardPicture(record){
  const image=record.metadata?.youtube?.thumbnail||record.metadata?.thumbnail;
  return image&&validThumbnail(image)?image:'';
}
/** One visible card at a time, bounded memory, reusable local derived cache.
 * Preview writes never touch source headers, annotations, history or save dates. */
export class CardPreviewQueue{
  constructor({load,read,write,generate,publish,current=()=>true,delay=80,timeout=12000}){
    Object.assign(this,{load,read,write,generate,publish,current,delay,timeout});
    this.pending=new Map();this.cache=new Map();this.paused=false;this.running=null;
  }
  request(record){
    if(this.paused||savedCardPicture(record))return;
    const key=cardPreviewKey(record),cached=this.cache.get(record.id);
    if(cached?.key===key){if(cached.image)this.publish(record,cached.image);return;}
    if(this.running?.id===record.id&&this.running.key===key)return;
    this.pending.set(record.id,{record,key});this.schedule();
  }
  cancel(id){this.pending.delete(id);if(this.running?.id===id)this.running.controller.abort();}
  pause(){this.paused=true;clearTimeout(this.timer);this.timer=null;this.pending.clear();this.running?.controller.abort();}
  resume(){this.paused=false;}
  schedule(){if(!this.paused&&!this.running&&!this.timer&&this.pending.size)this.timer=setTimeout(()=>{this.timer=null;void this.next();},this.delay);}
  remember(id,value){this.cache.delete(id);this.cache.set(id,value);while(this.cache.size>128)this.cache.delete(this.cache.keys().next().value);}
  async next(){
    if(this.paused||this.running||!this.pending.size)return;
    const [id,{record,key}]=this.pending.entries().next().value;this.pending.delete(id);
    const controller=new AbortController();this.running={id,key,controller};
    const timer=setTimeout(()=>controller.abort(),this.timeout),signal=controller.signal;
    const valid=()=>!signal.aborted&&!this.paused&&this.current(record,key);
    try{
      let cached;try{cached=await this.read(CARD_PREVIEW_PREFIX+id);}catch{/* a cache is optional */}
      if(!valid())return;
      if(cached?.key===key&&typeof cached.image==='string'&&validThumbnail(cached.image)){
        this.remember(id,cached);if(cached.image)this.publish(record,cached.image);return;
      }
      const source=await this.load(id);if(!valid()||!source||cardPreviewKey(source)!==key)return;
      const image=await this.generate(source,{signal});if(!valid()||typeof image!=='string'||!validThumbnail(image))return;
      const result={key,image};this.remember(id,result);if(image)this.publish(record,image);
      try{await this.write(CARD_PREVIEW_PREFIX+id,result);}catch{/* quota/full storage must not block reading */}
    }catch{/* unsupported/corrupt files keep their format tile; cancellation is silent */}
    finally{clearTimeout(timer);this.running=null;this.schedule();}
  }
}
