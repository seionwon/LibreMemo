// Seed ordinary stored records in an isolated test profile. The app opens them through the library.
export async function seedReviewDocument() {
  const moduleURL = file => new URL('./src/' + file, document.baseURI).href;
  const {parseHTML, textIndex} = await import(moduleURL('document.js'));
  const {putDocumentRevision} = await import(moduleURL('storage.js'));
  const body = '<html lang="ko"><head><title>독서 모임 노트</title></head><body><h1>1장 관찰</h1><p>관찰 일지는 같은 자리에서 시작한다.</p><div style="height:1400px"></div><h2>2장 질문</h2><p>다음 답사에서 빛의 방향을 비교한다.</p></body></html>';
  const parsed = parseHTML(body);
  const doc = new DOMParser().parseFromString(parsed.html, 'text/html');
  const indexed = textIndex(doc).text;
  const first = '관찰 일지는 같은 자리에서 시작한다.';
  const second = '다음 답사에서 빛의 방향을 비교한다.';
  const textAnchor = quote => {
    const start = indexed.indexOf(quote);
    if (start < 0) throw new Error('Missing fixture quote');
    return {start, end: start + quote.length, quote, prefix: '', suffix: ''};
  };
  const base = {width: 3, opacity: 0.35, created: 1000};
  parsed.metadata.annotations = [
    {...base, id:'review-note', type:'note', color:'#fde047', text:'다시 확인할 질문', textAnchor:textAnchor(second), points:[{x:0.1,y:0.7}]},
    {...base, id:'review-highlight', type:'highlight', color:'#fde047', textAnchor:textAnchor(first)},
    {...base, id:'review-underline', type:'underline', color:'#3b82f6', textAnchor:textAnchor(second)}
  ];
  await putDocumentRevision({id:'review-book', title:'독서 모임 노트', name:'관찰.html', folderId:'', created:1000, modified:1000, html:parsed.html, metadata:parsed.metadata});
}
