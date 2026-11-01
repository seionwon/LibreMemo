import {mkdir,copyFile,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url),source=new URL('node_modules/djvu-rs/',root),target=new URL('public/vendor/djvu/',root);
const pkg=JSON.parse(await readFile(new URL('package.json',source),'utf8'));
if(pkg.version!=='0.43.0'||pkg.license!=='MIT')throw Error('Review the pinned DjVu decoder and its licenses before upgrading.');
const files=['djvu_rs.js','scalar/djvu_rs.js','scalar/djvu_rs_bg.wasm','simd128/djvu_rs.js','simd128/djvu_rs_bg.wasm','LICENSE','THIRD_PARTY_NOTICES'],hashes={};
for(const name of files){await mkdir(new URL('./',new URL(name,target)),{recursive:true});await copyFile(new URL(name,source),new URL(name,target));hashes[name]=createHash('sha256').update(await readFile(new URL(name,target))).digest('hex');}
await writeFile(new URL('UPSTREAM.json',target),JSON.stringify({name:pkg.name,version:pkg.version,license:pkg.license,repository:pkg.repository.url,release:'https://github.com/matyushkin/djvu-rs/tree/v0.43.0',files:hashes,changes:'Unmodified npm scalar/SIMD decoder and complete notices for the 38 embedded Rust crates. No DjVuLibre, DjVu.js, viewer UI, OCR, encoder or network document loader is used.'},null,2)+'\n');
console.log('djvu-rs '+pkg.version+': local MIT decoder and transitive license notices');
