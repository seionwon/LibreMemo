// A DOM that cannot execute scripts or request resources, used only by the
// ebook import worker. Namespace additions bridge linkedom's XML subset.
import {DOMParser as Parser,Document,Element} from 'linkedom';
const XMLNS='http://www.w3.org/2000/xmlns/';
const originalNames=new WeakMap(),docMeta=new WeakMap();
export const serializedDocs=new Map();
function namespace(node,prefix){
  if(prefix==='xml')return 'http://www.w3.org/XML/1998/namespace';
  if(prefix==='xmlns')return XMLNS;
  for(let el=node.nodeType===9?node.documentElement:node;el;el=el.parentElement){
    const value=el.getAttribute(prefix?'xmlns:'+prefix:'xmlns');if(value)return value;
  }
  return null;
}
const nativeNamespaceURI=Object.getOwnPropertyDescriptor(Element.prototype,'namespaceURI')?.get;
Object.defineProperty(Element.prototype,'namespaceURI',{
  get(){
    const name=originalNames.get(this)||this.localName,i=name.indexOf(':');
    return namespace(this,i>=0?name.slice(0,i):null)??(this.ownerDocument?._isXML?null:nativeNamespaceURI?.call(this)??null);
  },
  configurable:true,
});
for(const proto of [Document.prototype,Element.prototype]){
  proto.lookupNamespaceURI=function(prefix){return namespace(this,prefix);};
  proto.lookupPrefix=function(uri){for(let el=this.nodeType===9?this.documentElement:this;el;el=el.parentElement)for(const a of el.attributes)if(a.name.startsWith('xmlns:')&&a.value===uri)return a.name.slice(6);return null;};
  proto.getElementsByTagNameNS=function(ns,name){return [...this.querySelectorAll('*')].filter(el=>(name==='*'||el.localName===name)&&(ns==='*'||el.namespaceURI===ns));};
  const queryOne=proto.querySelector;
  proto.querySelector=function(selector){return selector==='parsererror'?null:queryOne.call(this,selector);};
  const query=proto.querySelectorAll;
  proto.querySelectorAll=function(selector){
    const meta=docMeta.get(this);
    if(meta){
      if(selector==='[*|href]:not([href])'&&!meta.hasXlinkHref)return [];
      if(selector==='[poster]'&&!meta.hasPoster)return [];
      if(selector==='[srcset]'&&!meta.hasSrcset)return [];
      if(selector==='object[data]'&&!meta.hasObject)return [];
      if(selector==='style'&&!meta.hasStyleTag)return [];
      if(selector==='[style]'&&!meta.hasStyleAttr)return [];
      if(selector==='[src]'&&!meta.hasSrcAttr)return [];
    }
    if(selector!=='[*|href]:not([href])')return query.call(this,selector);
    const out=[];
    for(const el of query.call(this,'*')){
      if(el.hasAttribute('href'))continue;
      const attrs=el.attributes;
      for(let i=0;i<attrs.length;i++)if(attrs[i].name.endsWith(':href')){out.push(el);break;}
    }
    return out;
  };
}
Element.prototype.getAttributeNS=function(ns,name){for(const a of this.attributes){const parts=a.name.split(':');if(parts.at(-1)===name&&(parts.length>1?namespace(this,parts[0]):null)===ns)return a.value;}return null;};
Element.prototype.setAttributeNS=function(ns,name,value){const prefix=name.includes(':')?'':this.lookupPrefix(ns);this.setAttribute(prefix?prefix+':'+name:name,value);};
function xmlDocument(doc){
  doc._isXML=true;
  for(const el of doc.querySelectorAll('*')){
    const name=el.localName,colon=name.indexOf(':');
    if(colon>=0){
      originalNames.set(el,name);
      Object.defineProperty(el,'localName',{value:name.slice(colon+1),configurable:true});
    }
    const attrs=el.attributes;
    for(let i=0;i<attrs.length;i++){
      const attr=attrs[i],aColon=attr.name.indexOf(':');
      if(aColon>=0){
        Object.defineProperty(attr,'namespaceURI',{value:namespace(el,attr.name.slice(0,aColon)),configurable:true});
        Object.defineProperty(attr,'localName',{value:attr.name.slice(aColon+1),configurable:true});
      }
    }
  }
  let body,head;
  Object.defineProperties(doc,{
    body:{get:()=>body?.isConnected?body:(body=doc.querySelector('body')),configurable:true},
    head:{get:()=>head?.isConnected?head:(head=doc.querySelector('head')),configurable:true},
  });
  return doc;
}
export class InertDOMParser {
  parseFromString(input,type='text/html'){
    let text=String(input);
    const cached=serializedDocs.get(text);
    if(cached&&cached.type===type){serializedDocs.delete(text);return cached.doc;}
    if(text.length>512*1024*1024)throw Error('전자책의 한 부분이 너무 큽니다.');
    if(/<!\s*ENTITY\b|<!\s*DOCTYPE[^>]*\[/i.test(text))throw Error('엔터티 선언이 있는 전자책은 열 수 없습니다.');
    // Legacy EPUB XHTML doctypes are allowed as inert declarations only.
    text=text.replace(/<!DOCTYPE[^>]*>/gi,'');
    if(type==='text/html'&&!/<html(?:\s|>)/i.test(text))text='<html><head></head><body>'+text+'</body></html>';
    const doc=new Parser().parseFromString(text,type);
    const out=type==='text/html'?doc:xmlDocument(doc);
    docMeta.set(out,{
      type,
      hasXlinkHref:text.includes(':href'),
      hasPoster:/poster\s*=/i.test(text),
      hasSrcset:/srcset\s*=/i.test(text),
      hasObject:/<object[\s>]/i.test(text),
      hasStyleTag:/<style[\s>]/i.test(text),
      hasStyleAttr:/style\s*=/i.test(text),
      hasSrcAttr:/src\s*=/i.test(text),
    });
    return out;
  }
}
export const resourceBlobs=new Map();let sequence=0;
URL.createObjectURL=blob=>{const url='blob:librememo-ebook/'+(++sequence);resourceBlobs.set(url,blob);return url;};
URL.revokeObjectURL=url=>resourceBlobs.delete(url);
globalThis.CustomEvent??=class extends Event{constructor(type,options={}){super(type,options);this.detail=options.detail;}};
const inertDocument=new InertDOMParser().parseFromString('<html><head></head><body></body></html>','text/html');
inertDocument.implementation={createDocument:(ns,tag)=>new InertDOMParser().parseFromString('<'+tag+' xmlns="'+ns+'"/>','application/xml')};
export function activateEbookDOM(){
  serializedDocs.clear();
  globalThis.DOMParser=InertDOMParser;
  globalThis.XMLSerializer=class{serializeToString(node){const str=node.toString(),meta=docMeta.get(node);if(meta&&node.body)serializedDocs.set(str,{doc:node,type:meta.type});return str;}};
  globalThis.ProcessingInstruction=class{};
  globalThis.CSS={escape:value=>Array.from(String(value),c=>/[a-zA-Z0-9_-]/.test(c)?c:'\\'+c.codePointAt(0).toString(16)+' ').join('')};
  globalThis.document=inertDocument;
}
activateEbookDOM();
