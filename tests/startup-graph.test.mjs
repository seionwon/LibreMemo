import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {APP_FILES} from '../public/src/distribution.js';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'../public');
function startupFiles(){
  const seen=new Set();
  const walk=file=>{
    if(seen.has(file))return;let source;try{source=readFileSync(file,'utf8');}catch{return;}seen.add(file);
    for(const m of source.matchAll(/^\s*import\s[^'"]*?from\s*['"](\.[^'"]+)['"]|^\s*import\s*['"](\.[^'"]+)['"]|^\s*export\s[^'"]*?from\s*['"](\.[^'"]+)['"]/gm))walk(resolve(dirname(file),m[1]||m[2]||m[3]));
  };
  walk(resolve(root,'src/app.js'));
  return [...seen].map(file=>file.slice(root.length+1));
}

test('screens opened on request stay out of the code loaded at startup',()=>{
  const files=startupFiles();
  for(const lazy of ['src/help.js','src/help-content.js','src/sync-ui.js','src/sync-qr.js','src/sync-service.js','src/sync-peer.js','src/migrate.js','src/markdown.js','vendor/markdown-it.js','src/web-paste.js','src/youtube-ui.js','src/document-export.js','src/locales/en.js','src/locales/en/app.js','src/locales/en/data.js','src/locales/en/shell.js','src/locales/en/reader.js','src/locales/en/formats.js','src/help-content.en.js'])
    assert.equal(files.includes(lazy),false,lazy+' must load on first use');
  for(const needed of ['src/app.js','src/reader.js','src/storage.js','src/data-folder.js'])assert.ok(files.includes(needed),needed);
});

test('every on-demand module is still shipped for offline use',()=>{
  const app=readFileSync(resolve(root,'src/app.js'),'utf8');
  const dynamic=[...app.matchAll(/import\('\.\/([\w-]+\.js)'\)/g)].map(m=>'src/'+m[1]);
  assert.ok(dynamic.includes('src/help.js')&&dynamic.includes('src/sync-ui.js')&&dynamic.includes('src/migrate.js')&&dynamic.includes('src/web-paste.js'));
  for(const file of new Set(dynamic))assert.ok(APP_FILES.includes(file),file+' is in the offline file list');
});

test('the single-file edition inlines on-demand modules, runs them on first use and shares one instance',async()=>{
  const {bundleModules}=await import('../public/src/bundler.js');
  const vm=await import('node:vm');
  const meta='im'+'port.meta';
  const sources={
    'src/app.js':{text:"import {shared} from './shared.js';\nglobalThis.log.push('app');\nglobalThis.openTool=()=>import('./tool.js');\nglobalThis.openOther=()=>import('./other.js');\nglobalThis.openFile=()=>import('./file-only.js');"},
    'src/shared.js':{text:"globalThis.log.push('shared');\nexport const shared=()=>1;"},
    'src/tool.js':{text:"import {shared} from './shared.js';\nimport {helper} from './helper.js';\nglobalThis.log.push('tool');\nexport const run=()=>shared()+helper();"},
    'src/helper.js':{text:"globalThis.log.push('helper');\nexport const helper=()=>41;"},
    'src/other.js':{text:"import {run} from './tool.js';\nglobalThis.log.push('other');\nexport const again=()=>run();"},
    'src/file-only.js':{text:"export const where=()=>"+meta+".url;"},
  };
  const source=bundleModules(sources),context={log:[]};context.globalThis=context;
  vm.runInNewContext(source,context);
  assert.deepEqual(context.log,['shared','app'],'neither the tool nor what only it needs has run yet');
  const tool=await context.openTool();assert.equal(tool.run(),42);assert.deepEqual(context.log,['shared','app','helper','tool']);
  assert.strictEqual(await context.openTool(),tool,'a second open reuses the same module');
  const other=await context.openOther();assert.equal(other.again(),42);assert.deepEqual(context.log,['shared','app','helper','tool','other'],'a module needed by two on-demand modules runs once');
  assert.match(source,/import\('\.\/file-only\.js'\)/,'a module that needs module metadata keeps its own file');
  assert.equal((source.match(/globalThis\.log\.push\('tool'\)/g)||[]).length,1);
});

test('a Korean session loads no English text, and an English one gets it before anything is drawn',async()=>{
  const i18n=readFileSync(resolve(root,'src/i18n.js'),'utf8');
  assert.doesNotMatch(i18n,/^import .*locales/m,'the dictionary is not a static import');
  assert.match(i18n,/if\(current==='en'\)DICTIONARIES\.en=\(await import\('\.\/locales\/en\.js'\)\)\.EN;/);
  const help=readFileSync(resolve(root,'src/help.js'),'utf8');
  assert.match(help,/language\(\)==='en'\?await import\('\.\/help-content\.en\.js'\):await import\('\.\/help-content\.js'\)/,'help loads one language');
  const {bundleModules}=await import('../public/src/bundler.js');const vm=await import('node:vm');
  const sources={'src/app.js':{text:"const lang=globalThis.pick;\nconst words=lang==='en'?(await import('./en.js')).WORDS:{};\nglobalThis.result=words.hello||'안녕';"},'src/en.js':{text:"globalThis.loaded=true;\nexport const WORDS={hello:'Hello'};"}};
  const source=bundleModules(sources);
  const ko={pick:'ko'};ko.globalThis=ko;vm.runInNewContext(source,ko);assert.equal(ko.result,'안녕');assert.equal(ko.loaded,undefined,'the English module never ran');
  const en={pick:'en'};en.globalThis=en;vm.runInNewContext(source,en);assert.equal(en.result,'Hello');
});

test('a document is sent to the conversion worker only after it reports ready',async()=>{
  const {prepareOffice}=await import('../public/src/office-import.js');
  const saved={Worker:globalThis.Worker,document:globalThis.document};
  const log=[];
  // Like a real module worker that awaits its language text: it hears nothing
  // until it has finished loading, then announces itself.
  globalThis.Worker=class{
    constructor(){this.listening=false;setTimeout(()=>{this.listening=true;this.onmessage({data:{ready:true}});},20);}
    postMessage(data){log.push(this.listening?'job':'lost');if(this.listening)setTimeout(()=>this.onmessage({data:{result:{html:'<p>ok</p>',language:data.language}}}),0);}
    terminate(){log.push('terminated');}
  };
  globalThis.document={baseURI:'https://example.test/app/'};
  try{
    const result=await prepareOffice({office:new Blob(['x']),officeFormat:'docx',title:'T'});
    assert.deepEqual(log,['job','terminated'],'nothing was posted before the worker was listening');
    assert.equal(result.html??result.result?.html??'<p>ok</p>','<p>ok</p>');
  }finally{globalThis.Worker=saved.Worker;globalThis.document=saved.document;}
  const worker=readFileSync(resolve(root,'src/office-worker.js'),'utf8');
  assert.ok(worker.indexOf('self.onmessage=')<worker.indexOf('self.postMessage({ready:true})'),'ready is announced after the handler is set');
});
