// Original fixtures: JPEG pixels from our generated reading image, invented
// OCR strings and an uncompressed DjVu text layer. No third-party book data.
import {readFile} from 'node:fs/promises';
export function iffChunk(tag,data){const size=Buffer.alloc(4);size.writeUInt32BE(data.length);return Buffer.concat([Buffer.from(tag),size,data,...(data.length%2?[Buffer.alloc(1)]:[])]);}
export function djvuForm(kind,chunks,magic=true){return Buffer.concat([magic?Buffer.from('AT&T'):Buffer.alloc(0),iffChunk('FORM',Buffer.concat([Buffer.from(kind),...chunks]))]);}
function u24(value){return Buffer.from([value>>>16&255,value>>>8&255,value&255]);}
export async function singleDjvu({text='DjVu 한국어 annotation test',rotation=1,plain=false}={}){
  const info=Buffer.alloc(10);info.writeUInt16BE(1600,0);info.writeUInt16BE(1000,2);info[4]=26;info.writeUInt16LE(200,6);info[8]=22;info[9]=rotation;
  const bytes=Buffer.from(text),zone=Buffer.alloc(17);zone[0]=5;[80,760,800,40,0].forEach((v,i)=>zone.writeUInt16BE(v+32768,1+i*2));u24(bytes.length).copy(zone,11);
  const tx=Buffer.concat([u24(bytes.length),bytes,Buffer.from([1]),...(plain?[]:[zone])]);
  return djvuForm('DJVU',[iffChunk('INFO',info),iffChunk('BGjp',await readFile(new URL('fixtures/images/reading.jpg',import.meta.url))),iffChunk('TXTa',tx)]);
}
