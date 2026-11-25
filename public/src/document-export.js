import {t} from './i18n.js';
import {archiveName,createDocumentArchive} from './document-archive.js';
import {htmlExportName} from './local-files.js';
import {serializeBookSource} from './document.js';
import {download,escapeHTML as esc,icon} from './utils.js';
import {annotationOverview} from './annotation-review.js';
import {isVideoNote, videoNoteURL, validVideoAnchor} from './youtube-notes.js';
import {clock} from './youtube.js';

export function exportTypes(mode){return [{description:{archive:t('LibreMemo 원본 포함 보관 파일'),html:t('읽기용 HTML'),pdf:t('주석 포함 PDF')}[mode],accept:mode==='archive'?{'application/zip':['.librememo']}:mode==='pdf'?{'application/pdf':['.pdf']}:{'text/html':['.html']}}];}
export async function annotatedPDF(reader,{signal,onProgress=()=>{}}={}){
  if(!reader.pdf)throw Error(t('주석 포함 PDF는 PDF 원본 문서에서 사용할 수 있습니다.'));
  const {pdfExportPlan}=await import('./pdf-export-plan.js');
  const plan=await pdfExportPlan(reader,{signal,onProgress});
  if(signal?.aborted)throw new DOMException(t('내보내기를 취소했습니다.'),'AbortError');
  const bytes=await reader.pdf.source.arrayBuffer();
  return new Promise((resolve,reject)=>{
    let worker,timer;const cancelled=()=>finish(new DOMException(t('내보내기를 취소했습니다.'),'AbortError'));
    const finish=(error,value)=>{clearTimeout(timer);signal?.removeEventListener('abort',cancelled);worker?.terminate();error?reject(error):resolve(new Blob([value],{type:'application/pdf'}));};
    try{
      worker=new Worker(new URL('src/pdf-export-worker.js',document.baseURI),{type:'module'});
      signal?.addEventListener('abort',cancelled,{once:true});
      timer=setTimeout(()=>finish(Error(t('PDF를 만드는 시간이 너무 오래 걸립니다. 원본 포함 보관 파일로 저장해주세요.'))),180000);
      worker.onmessage=({data})=>data.progress?onProgress(data.progress):finish(data.error?Error(t(data.error)):null,data.bytes);
      worker.onerror=()=>finish(Error(t('PDF 내보내기 도구를 불러오지 못했습니다. 앱을 업데이트한 뒤 다시 시도해주세요.')));
      worker.postMessage({bytes,plan},[bytes]);if(signal?.aborted)cancelled();
    }catch(error){finish(error);}
  });
}
function readingPDFScript(){
  const decode=s=>{const text=atob(s),bytes=new Uint8Array(text.length);for(let n=0;n<text.length;n++)bytes[n]=text.charCodeAt(n);return bytes;};
  const engine=decode(document.getElementById('librememo-pdf-writer').textContent);
  // Messages chosen in the interface language at export time; older copies have none.
  let text={};try{text=JSON.parse(document.getElementById('librememo-pdf-text')?.textContent||'{}');}catch{}
  const failed=text.failed||'PDF를 표시하지 못했습니다. 이 HTML을 LibreMemo에서 가져오면 원본과 주석을 복원할 수 있습니다.';
  const script=`\nself.onmessage=async({data})=>{try{const s=data.encoded,parts=[];for(let at=0;at<s.length;at+=262144){const raw=atob(s.slice(at,at+262144)),bytes=new Uint8Array(raw.length);for(let n=0;n<raw.length;n++)bytes[n]=raw.charCodeAt(n);parts.push(new Blob([bytes]));}for(const a of data.plan.annotations)if(a.png){const s=atob(a.png);a.png=Uint8Array.from(s,c=>c.charCodeAt(0));}const bytes=await __librememoWritePDF(await new Blob(parts).arrayBuffer(),data.plan);self.postMessage({bytes},[bytes.buffer]);}catch(e){self.postMessage({error:'PDF를 표시하지 못했습니다. 이 HTML을 LibreMemo에서 가져오면 원본과 주석을 복원할 수 있습니다.',detail:String(e?.message||e)});}}`;
  // A file:// page has an opaque origin: a second blob module import fails CORS.
  // Put the writer and handler in one classic worker, with no subresource fetches.
  const workerURL=URL.createObjectURL(new Blob([engine,script],{type:'text/javascript'})),worker=new Worker(workerURL),hint=document.getElementById('pdf-hint');let pdfURL;
  worker.onmessage=({data})=>{if(data.error){hint.textContent=failed;console.error('PDF reading copy:',data.detail);worker.terminate();return;}pdfURL=URL.createObjectURL(new Blob([data.bytes],{type:'application/pdf'}));document.getElementById('pdf-viewer').src=pdfURL;for(const link of document.querySelectorAll('[data-pdf-link]')){link.href=pdfURL;link.removeAttribute('aria-disabled');}hint.textContent=navigator.pdfViewerEnabled?text.ready||'PDF 안에 주석과 북마크가 함께 들어 있습니다.':text.noViewer||'PDF가 표시되지 않으면 PDF 열기 또는 저장을 눌러 기기의 PDF 뷰어에서 보세요.';worker.terminate();};
  worker.onerror=()=>{hint.textContent=failed;worker.terminate();};
  worker.postMessage({encoded:document.getElementById('htmlmemo-pdf-source').content.textContent.trim(),plan:JSON.parse(document.getElementById('librememo-pdf-plan').textContent)});
  window.addEventListener('pagehide',()=>{worker.terminate();for(const url of [workerURL,pdfURL])if(url)URL.revokeObjectURL(url);},{once:true});
}
const encodedJSON=value=>JSON.stringify(value).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026');
async function appendBase64(parts,blob,{signal,onProgress=()=>{}}={}){
  for(let at=0;at<blob.size;at+=196608){if(signal?.aborted)throw new DOMException(t('내보내기를 취소했습니다.'),'AbortError');const bytes=new Uint8Array(await blob.slice(at,at+196608).arrayBuffer());let s='';for(let n=0;n<bytes.length;n+=8192)s+=String.fromCharCode(...bytes.subarray(n,n+8192));parts.push(new Blob([btoa(s)]));onProgress({done:Math.min(at+196608,blob.size),total:blob.size});}
}
export async function pdfReadingHTML(pdf,metadata,plan,options={}){
  // Keep the legacy PDF archive marker, original bytes and metadata. Old receivers can
  // still restore editable notes; direct browsers generate a standard PDF locally.
  const [engineResponse,licenseResponse]=await Promise.all(['pdf-export.js','THIRD-PARTY-NOTICES.txt'].map(name=>fetch(new URL('vendor/pdf-export/'+name,document.baseURI),{signal:options.signal})));
  if(!engineResponse.ok||!licenseResponse.ok)throw Error(t('오프라인 PDF 내보내기 도구를 찾지 못했습니다. 앱을 업데이트한 뒤 다시 시도해주세요.'));
  const engine=await engineResponse.blob(),license=await licenseResponse.text(),portablePlan={...plan,annotations:plan.annotations.map(a=>({...a,...(a.png?{png:btoa(Array.from(a.png,c=>String.fromCharCode(c)).join(''))}:{})}))};
  const parts=[`<!--HTMLMemo-PDF:1--><!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' blob:; worker-src blob:; style-src 'unsafe-inline'; frame-src blob:; object-src blob:; base-uri 'none'; connect-src blob:"><title>${esc(metadata.title)}</title><script type="application/json" id="htmlmemo-data">${encodedJSON(metadata)}</script><script type="application/json" id="librememo-pdf-plan">${encodedJSON(portablePlan)}</script><script type="application/json" id="librememo-pdf-text">${encodedJSON({failed:t('PDF를 표시하지 못했습니다. 이 HTML을 LibreMemo에서 가져오면 원본과 주석을 복원할 수 있습니다.'),ready:t('PDF 안에 주석과 북마크가 함께 들어 있습니다.'),noViewer:t('PDF가 표시되지 않으면 PDF 열기 또는 저장을 눌러 기기의 PDF 뷰어에서 보세요.')})}</script><script type="application/octet-stream" id="librememo-pdf-writer">`];
  await appendBase64(parts,engine,options);
  parts.push(`</script><style>html,body{margin:0;height:100%;font:14px system-ui;color:#202633;background:#f5f6f8}body{display:flex;flex-direction:column}header{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:10px 14px;background:#fff;border-bottom:1px solid #ddd}h1{font-size:1rem;margin:0;flex:1;min-width:0;overflow-wrap:anywhere}a{color:#245eb7}a[aria-disabled]{pointer-events:none;opacity:.5}p,details{margin:0;padding:6px 14px;font-size:.8rem}pre{white-space:pre-wrap;max-height:10rem;overflow:auto}iframe{width:100%;flex:1;border:0;min-height:0}@media(prefers-color-scheme:dark){body{background:#15171c;color:#e5e7eb}header{background:#20232b;border-color:#444}a{color:#9dc2ff}}</style></head><body><header><h1>${esc(metadata.title)}</h1><a data-pdf-link aria-disabled="true" target="_blank" rel="noopener">${t('PDF 열기')}</a><a data-pdf-link aria-disabled="true" download="${esc(archiveName(metadata.title,'pdf'))}">${t('PDF 저장')}</a></header><p id="pdf-hint">${t('이 기기에서 주석과 북마크가 포함된 PDF를 준비하는 중…')}</p><iframe id="pdf-viewer" title="${t('주석과 북마크가 포함된 PDF')}"></iframe><details><summary>${t('오픈소스 고지')}</summary><pre>${esc(license)}</pre></details><template id="htmlmemo-pdf-source">`);
  await appendBase64(parts,pdf,options);parts.push('</template><script>('+readingPDFScript.toString()+')();</script></body></html>');return new Blob(parts,{type:'text/html;charset=utf-8'});
}
export async function documentExportBlob(mode,reader,stored,{signal,onProgress=()=>{}}={}){
  if(reader.bookIntegrity?.complete===false)throw Error(reader.bookIntegrity.message);
  const state=structuredClone(reader.metadata),source=reader.pdf?.source||stored.file||new Blob([stored.html],{type:'text/html;charset=utf-8'}),original=stored.originalFile instanceof Blob?stored.originalFile:source;
  if(mode==='archive'){
    // Raw HTML/PDF already is its own read source; Office/MHTML keep their immutable
    // rendered snapshot too so parser updates cannot detach old annotation anchors.
    const rawHTML=/\.html?$/i.test(stored.name)&&original===stored.originalFile&&!reader.pdf;
    return createDocumentArchive({name:stored.name||archiveName(state.title,reader.pdf?'pdf':'html'),original,reading:rawHTML||stored.originalReading?original:source,metadata:state,originalExact:stored.originalExact!==false&&(!!stored.originalFile||!!reader.pdf)}, {signal,onProgress});
  }
  if(mode==='pdf')return annotatedPDF(reader,{signal,onProgress});
  if(mode!=='html')throw Error(t('내보내기 형식이 올바르지 않습니다.'));
  if(reader.pdf){const {pdfExportPlan}=await import('./pdf-export-plan.js');return pdfReadingHTML(reader.pdf.source,state,await pdfExportPlan(reader,{signal,onProgress}),{signal,onProgress});}
  if(reader.bookIntegrity?.complete)return serializeBookSource(source,state);
  return new Blob([reader.html()],{type:'text/html;charset=utf-8'});
}

function excerptEntry(note) {
  const quote = ['highlight','underline','strike','note','text'].includes(note.type) ? note.textAnchor?.quote?.trim() : '';
  const comment = note.text?.trim();
  return quote || comment ? {note, quote, comment} : null;
}

// Render user-provided text literally, even when pasted into an editor that
// enables Markdown links or inline HTML.
function markdownLiteral(text) {
  return String(text).replace(/\r\n?/g, '\n')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/([\\`*_\[\]~|])/g, '\\$1')
    .replace(/^([ \t]*)([#+=\-])/gm, '$1\\$2')
    .replace(/^([ \t]*\d+)([.)])(?=\s)/gm, '$1\\$2');
}

function excerptPosition(entry) {
  const {note, scene} = entry;
  if (scene) return scene.seconds;
  // PDF text offsets are relative to the loaded page window. Page geometry
  // remains stable when other pages enter or leave that window.
  if (note.pdfPage || note.pdfRects?.length) return (note.pdfRects?.[0] || note.points?.[0])?.y ?? Infinity;
  return Number.isFinite(note.textAnchor?.start) ? note.textAnchor.start : Infinity;
}

export function excerptMarkdown(reader, title) {
  const {tree, contexts} = annotationOverview(reader);
  const sections = [];
  function visit(group, ancestors) {
    const path = [...ancestors, group.title];
    const entries = [];
    for (const note of group.annotations) {
      const entry = excerptEntry(note);
      if (!entry) continue;
      const context = contexts.get(note.id);
      const scene = isVideoNote(note) ? note.videoAnchor :
        {videoId:reader.metadata.youtube?.videoId, seconds:context?.videoSeconds};
      if (validVideoAnchor(scene)) entry.scene = scene;
      entries.push(entry);
    }
    if (entries.length) {
      // Sort inside the real chapter/page tree. Equal or unknown positions keep
      // their stored order. Do not mutate the reader's annotation array.
      entries.sort((a, b) => excerptPosition(a) - excerptPosition(b));
      const heading = path.map(value => String(value).replace(/\s+/g, ' ').trim()).filter(Boolean).join(' › ');
      const blocks = entries.map(({note, quote, comment, scene}) => {
        const parts = [];
        if (scene) parts.push(`[${clock(scene.seconds)}](${videoNoteURL({videoAnchor:scene})})`);
        const firstPage = note.pdfPage || note.pdfRects?.[0]?.page;
        if (firstPage) {
          const lastPage = note.pdfRects?.at(-1)?.page || firstPage;
          if (lastPage !== firstPage) parts.push(t('{a}–{b}쪽', {a:firstPage, b:lastPage}));
          // The page may already be the section name, in either language.
          else if (!path.includes(firstPage + '쪽') && !path.includes(t('{n}쪽', {n:firstPage}))) parts.push(t('{n}쪽', {n:firstPage}));
        }
        if (quote) parts.push(markdownLiteral(quote).split('\n').map(line => '> ' + line).join('\n'));
        if (comment) parts.push(markdownLiteral(comment));
        return parts.join('\n\n');
      });
      sections.push('## ' + markdownLiteral(heading) + '\n\n' + blocks.join('\n\n'));
    }
    group.children.forEach(child => visit(child, path));
  }
  tree.forEach(group => visit(group, []));
  if (!sections.length) return '';
  const heading = String(title || reader.metadata.title || t('발췌 노트')).replace(/\s+/g, ' ').trim();
  return '# ' + markdownLiteral(heading) + '\n\n' + sections.join('\n\n') + '\n';
}

export function openDocumentExport(tab,{modal,getDocument,onSaved,toast}){
  const r=tab.reader;
  const hasExcerpts = r.metadata.annotations.some(note => excerptEntry(note) !== null);
  const options=[['archive',t('원본 포함 보관 파일'),t('.librememo · 원본·주석·북마크·읽던 위치 보존. LibreMemo에서 이어서 편집합니다.')],['html',t('읽기용 HTML 사본'),t('.html · 읽기 화면을 전달합니다. 원본 편집 구조는 보존하지 않습니다.')],['pdf',t('주석 포함 PDF'),r.pdf?t('.pdf · 표준 주석과 북마크로 저장해 다른 PDF 뷰어에서도 봅니다.'):t('PDF 원본 문서에서 사용할 수 있습니다.')]];
  modal(`<form data-document-export><div class="dialog-heading"><h2>${t('문서 내보내기')}</h2><button class="icon-button" type="button" data-export-close aria-label="${t('닫기')}">×</button></div><p class="dialog-description">${esc(tab.record.title||tab.record.name)}${t(' · 주석 {n}개',{n:r.metadata.annotations.length})}${t(' · 북마크 {n}개',{n:r.metadata.bookmarks.length})}</p><fieldset style="border:0;padding:0;display:grid;gap:.6rem"><legend class="small">${t('저장할 형식')}</legend>${options.map(([id,label,hint])=>`<label class="setting-row" style="cursor:pointer;align-items:flex-start;gap:.6rem;${id==='pdf'&&!r.pdf?'opacity:.5':''}"><input type="radio" name="export-format" value="${id}" ${id==='archive'?'checked':''} ${id==='pdf'&&!r.pdf?'disabled':''}><span><strong>${label}</strong><br><span class="small">${hint}</span></span></label>`).join('')}</fieldset><p class="dialog-description small" data-export-warning>${r.pdf?t('읽기용 HTML은 PDF를 포함합니다. 브라우저에서 표시되지 않으면 포함된 PDF를 저장해 기기의 PDF 뷰어로 열 수 있습니다.'):t('원본 포함 보관 파일은 원본 형식과 현재 상태를 함께 보존합니다.')}</p><div class="excerpt-action"><button type="button" class="secondary-button" data-excerpt-copy title="${t('표시한 문장과 메모를 마크다운으로 복사')}" disabled>${icon('excerpt-copy',16)} ${t('발췌 노트 복사')}</button>
    <span class="small" data-excerpt-status role="status">${hasExcerpts?'':t('복사할 문장이나 메모가 없습니다.')}</span></div>
    <textarea class="excerpt-manual" data-excerpt-manual aria-label="${t('직접 복사할 마크다운 발췌 노트')}" rows="4" readonly hidden></textarea>
    <p class="small" data-export-progress role="status">${t('문서 상태를 확인하는 중…')}</p><p class="save-error small" data-export-error role="alert" hidden></p><div class="dialog-actions"><button type="button" class="secondary-button" data-export-cancel>${t('취소')}</button><button class="primary-button" type="submit" disabled data-export-save>${t('내보내기')}</button></div></form>`,dialog=>{
    const form=dialog.querySelector('form'),save=form.querySelector('[data-export-save]'),progress=form.querySelector('[data-export-progress]'),error=form.querySelector('[data-export-error]');let busy=false,controller=null,stored;
    const copy = form.querySelector('[data-excerpt-copy]');
    const copyStatus = form.querySelector('[data-excerpt-status]');
    const manual = form.querySelector('[data-excerpt-manual]');
    const alive=()=>dialog.open&&form.isConnected&&dialog.contains(form);
    const close=()=>{controller?.abort();if(alive())dialog.close();};
    const cancel=event=>{event.preventDefault();close();},closed=()=>{if(alive())return;controller?.abort();dialog.removeEventListener('cancel',cancel);dialog.removeEventListener('close',closed);};
    form.querySelector('[data-export-close]').onclick=close;form.querySelector('[data-export-cancel]').onclick=close;dialog.addEventListener('cancel',cancel);dialog.addEventListener('close',closed);
    // The clipboard action only needs the open reader. Preparing the separate
    // file export must neither delay copying nor hide missing-source warnings.
    Promise.resolve(r.ready).then(()=>{if(alive())copy.disabled=!hasExcerpts;})
      .catch(e=>{if(alive())copyStatus.textContent=e.message;});
    getDocument(tab.record.id).then(value=>{
      if(!alive())return;
      if(!value||value.trashedAt)throw Error(t('문서가 삭제되었거나 이동되었습니다.'));
      stored=value;save.disabled=false;
      progress.textContent=t('원본은 변경하지 않고 새 파일로 저장합니다.');
      if(value.originalExact===false||!value.originalFile&&!r.pdf)form.querySelector('[data-export-warning]').textContent+=t(' 이전에 원본 바이트를 보관하지 않은 문서는 현재 읽기용 사본을 보관합니다.');
    }).catch(e=>{if(alive()){error.hidden=false;error.textContent=e.message;progress.textContent='';}});
    copy.onclick = async () => {
      if (copy.disabled || busy) return;
      let text;
      try {text = excerptMarkdown(r, tab.record.title || tab.record.name);}
      catch {copyStatus.textContent = t('발췌 노트를 만들지 못했습니다. 문서를 다시 연 뒤 시도해주세요.'); return;}
      if (!text) {copyStatus.textContent = t('복사할 문장이나 메모가 없습니다.'); return;}
      copy.disabled = true;
      try {
        await navigator.clipboard.writeText(text);
        if (!alive()) return;
        manual.hidden = true;
        manual.value = '';
        copyStatus.textContent = t('마크다운 발췌 노트를 복사했습니다.');
      } catch {
        if (!alive()) return;
        manual.value = text;
        manual.hidden = false;
        manual.focus();
        manual.select();
        copyStatus.textContent = t('선택된 발췌 노트를 직접 복사하세요.');
      } finally {
        if (alive() && !busy) copy.disabled = false;
      }
    };
    form.onsubmit=async event=>{
      event.preventDefault();if(busy||!stored)return;busy=true;save.disabled=true;copy.disabled=true;form.querySelector('fieldset').disabled=true;error.hidden=true;controller=new AbortController();
      const mode=form.querySelector('input:checked').value,name=mode==='html'?htmlExportName(stored.name,true):mode==='pdf'?archiveName(stored.name,'pdf').replace(/\.pdf$/,t('-주석')+'.pdf'):archiveName(stored.name);
      let handle;
      try{
        // Keep transient user activation: ask for a destination before any await.
        if(typeof window.showSaveFilePicker==='function')try{handle=await window.showSaveFilePicker({suggestedName:name,types:exportTypes(mode)});}catch(e){if(!['SecurityError','NotSupportedError'].includes(e.name))throw e;}
        if(handle?.isSameEntry)for(const sourceHandle of [stored.fileHandle,stored.originalHandle])if(sourceHandle&&await handle.isSameEntry(sourceHandle))throw Error(t('원본을 덮어쓰지 않도록 다른 이름이나 위치를 선택해주세요.'));
        await r.ready;r.rememberPosition();await tab.queue.flush();
        const blob=await documentExportBlob(mode,r,stored,{signal:controller.signal,onProgress:({done,total})=>{if(alive())progress.textContent=t('파일을 준비하는 중… ')+(total?Math.min(100,Math.round(done/total*100))+'%':'');}});
        if(controller.signal.aborted)throw new DOMException(t('내보내기를 취소했습니다.'),'AbortError');
        progress.textContent=t('파일을 저장하는 중…');
        if(handle){const writer=await handle.createWritable(),cancel=()=>{void writer.abort().catch(()=>{});};controller.signal.addEventListener('abort',cancel,{once:true});try{await writer.write(blob);if(controller.signal.aborted)throw new DOMException(t('내보내기를 취소했습니다.'),'AbortError');await writer.close();}catch(e){await writer.abort().catch(()=>{});throw e;}finally{controller.signal.removeEventListener('abort',cancel);}}else download(blob,name);
        if(alive())dialog.close();toast(mode==='html'?t('현재 주석을 포함한 HTML을 내보냈습니다. 저장한 .html 파일을 보내세요.'):mode==='pdf'?t('주석과 북마크를 포함한 PDF를 내보냈습니다.'):t('원본 포함 보관 파일을 내보냈습니다. LibreMemo에서 가져오기로 열어주세요.'));onSaved?.(mode,name);
      }catch(e){if(e.name!=='AbortError'&&alive()){error.hidden=false;error.textContent=e.message;progress.textContent=t('입력한 형식으로 다시 시도하거나 다른 형식을 선택하세요.');}}
      finally{busy=false;if(alive()){save.disabled=false;copy.disabled=!hasExcerpts;form.querySelector('fieldset').disabled=false;}}
    };
  });
}
