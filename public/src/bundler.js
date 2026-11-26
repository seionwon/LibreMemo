const utf8=new TextDecoder();
export function assetBytes(asset) {
  if(typeof asset?.text==='string')return new TextEncoder().encode(asset.text);
  if(typeof asset?.base64==='string'){const binary=atob(asset.base64);return Uint8Array.from(binary,c=>c.charCodeAt(0));}
  throw new Error('앱 파일을 읽을 수 없습니다.');
}
export const assetText = asset => utf8.decode(assetBytes(asset));
const resolveModule=(parent,relative)=>{const parts=parent.split('/');parts.pop();for(const part of relative.split('/')){if(part==='.'||!part)continue;if(part==='..')parts.pop();else parts.push(part);}return parts.join('/');};
export function bundleModules(sources,entry='src/app.js') {
  // Static imports become eager modules. A module reached only through
  // a dynamic import is inlined as well but runs on first use, so the single
  // file works without a server and still starts without running every screen.
  let compiled=new Set(),lazied=new Set(),visiting=new Set(),output=['(()=>{\nconst modules=Object.create(null),lazy=Object.create(null);'];
  function compile(name,onDemand=false){
    if(compiled.has(name)||onDemand&&lazied.has(name))return;
    if(lazied.has(name)){output.push('modules['+JSON.stringify(name)+']=lazy['+JSON.stringify(name)+']();');compiled.add(name);return;}
    if(visiting.has(name))throw new Error('앱 모듈이 서로 순환 참조합니다.');if(!Object.hasOwn(sources,name))throw new Error('앱 모듈이 누락되었습니다: '+name);visiting.add(name);
    const original=assetText(sources[name]);const exports=[...original.matchAll(/\bexport\s+(?:async\s+)?(?:function|class|const|let|var)\s+([$\w]+)/g)].map(match=>match[1]);
    const source=original.replace(/^import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"];?\s*$/gm,(_,names,relative)=>{if(!relative.startsWith('.'))throw new Error('외부 앱 모듈은 지원하지 않습니다.');const dependency=resolveModule(name,relative),key=JSON.stringify(dependency);compile(dependency,onDemand);return 'const {'+names.trim().replace(/\s+as\s+/g,':')+'}=modules['+key+']'+(onDemand?'??lazy['+key+']()':'')+';';}).replace(/\bexport\s+(?=(?:async\s+)?(?:function|class|const|let|var)\b)/g,'')
      // An awaited import of an inlined module is simply that module: nothing to wait
      // for in a single file, and a classic script has no top-level await.
      .replace(/\bawait\s+import\(\s*(['"])(\.[^'"]+)\1\s*\)/g,(whole,quote,relative)=>{
        const dependency=resolveModule(name,relative),key=JSON.stringify(dependency);
        if(!Object.hasOwn(sources,dependency)||visiting.has(dependency))return whole;
        const saved={compiled:new Set(compiled),lazied:new Set(lazied),visiting:new Set(visiting),length:output.length};
        try{compile(dependency,true);}catch{compiled=saved.compiled;lazied=saved.lazied;visiting=saved.visiting;output.length=saved.length;return whole;}
        return '(modules['+key+']??lazy['+key+']())';
      })
      .replace(/\bimport\(\s*(['"])(\.[^'"]+)\1\s*\)/g,(whole,quote,relative)=>{
        const dependency=resolveModule(name,relative),key=JSON.stringify(dependency);
        if(!Object.hasOwn(sources,dependency)||visiting.has(dependency))return whole;
        // A module the bundler cannot inline keeps its dynamic import; the rest still works.
        const saved={compiled:new Set(compiled),lazied:new Set(lazied),visiting:new Set(visiting),length:output.length};
        try{compile(dependency,true);}catch{compiled=saved.compiled;lazied=saved.lazied;visiting=saved.visiting;output.length=saved.length;return whole;}
        return 'Promise.resolve().then(()=>modules['+key+']??lazy['+key+']())';
      });
    if(/^\s*(?:import|export)\s/m.test(source))throw new Error('지원하지 않는 앱 모듈 구문입니다: '+name);
    // Module-only metadata (the meta object) cannot run in a classic script;
    // such a module stays a separate file.
    if(/\bimport\.meta\b/.test(source))throw new Error('단일 파일에 넣을 수 없는 앱 모듈입니다: '+name);
    const body='(()=>{\n'+source+'\nreturn {'+exports.join(',')+'};\n})()';
    if(onDemand){output.push('lazy['+JSON.stringify(name)+']=(()=>{let loaded;return ()=>loaded??=modules['+JSON.stringify(name)+']??'+body+';})();');lazied.add(name);}
    else{output.push('modules['+JSON.stringify(name)+']='+body+';');compiled.add(name);}
    visiting.delete(name);
  }
  compile(entry);output.push('})();');return output.join('\n');
}
export function standaloneHTML(assets) {
  const app=assets.app;let html=assetText(app['index.html']);
  html=html.replace(/<link rel="manifest"[^>]*>/,'').replace(/<link rel="icon"[^>]*>/,'<link rel="icon" href="data:image/svg+xml;base64,'+btoa(String.fromCharCode(...assetBytes(app['icons/icon.svg'])))+'">').replace(/<link rel="apple-touch-icon"[^>]*>/,'');
  html=html.replace('<link rel="stylesheet" href="./styles.css">',()=>'<style>'+assetText(app['styles.css'])+'</style>').replace(/<script src="\.\/shared\/capture\.js" defer><\/script>\s*/,'').replace(/<script type="module" src="\.\/src\/app\.js"><\/script>/,'');
  html=html.replaceAll('src="./icons/icon.svg"','src="data:image/svg+xml;base64,'+btoa(String.fromCharCode(...assetBytes(app['icons/icon.svg'])))+'"');
  const json=JSON.stringify(assets).replace(/</g,'\\u003c');
  const script=(assetText(app['shared/capture.js'])+'\n'+bundleModules(app)).replace(/<\/script/gi,'<\\/script');
  return html.replace('</body>',()=>'<script type="application/json" id="htmlmemo-package-assets">'+json+'</script>\n<script>'+script+'</script>\n</body>');
}
