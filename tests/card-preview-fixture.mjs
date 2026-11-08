// Shared deterministic fixtures for trusted Chrome and published-app checks.
// This function is self-contained so CI can run it in the published app.
export async function seedCardPreviewFixtures(samples,onProgress=()=>{}){
  const s=await import(new URL('src/storage.js',document.baseURI).href),{parseHTML}=await import(new URL('src/document.js',document.baseURI).href),{prepareOffice}=await import(new URL('src/office-import.js',document.baseURI).href),{prepareImage}=await import(new URL('src/image-document.js',document.baseURI).href),{preparePDF}=await import(new URL('src/pdf-document.js',document.baseURI).href);
  const rows=[];
  for(const sample of samples){
    onProgress(sample.format);
    const file=new File([Uint8Array.from(sample.bytes)],'미리보기.'+sample.format,{type:sample.type||''});let result;
    if(sample.format==='pdf'){const parsed=preparePDF(file,{title:'PDF 첫 쪽'});result={file,metadata:parsed.metadata};}
    else{
      const prepared=typeof sample.readingHTML==='string'?{html:sample.readingHTML}:sample.format==='png'?await prepareImage({image:file,title:'스크린샷'}):sample.format==='html'?{html:await file.text()}:await prepareOffice({office:file,officeFormat:sample.format,title:sample.format+' 미리보기'});
      const html=prepared.html||await prepared.file.text(),parsed=parseHTML('<h1>fixture</h1>',{title:sample.format+' 미리보기'},{allowScripts:false});
      result={file:new Blob([html],{type:'text/html'}),metadata:parsed.metadata};
    }
    result.metadata.annotations=[{id:'kept-note',type:'note',anchor:'body',points:[{x:20,y:30}],text:'미리보기에서도 보존할 메모',color:'#334155',width:2,opacity:1}];result.metadata.bookmarks=[{id:'kept-bookmark',title:'저장한 위치',top:30,left:0}];
    const row=await s.putDocumentRevision({id:'preview-'+sample.format,title:sample.label||sample.format.toUpperCase()+' 미리보기',name:file.name,source:'',created:1000,modified:2000,...result,originalFile:file},{baseline:true});rows.push(row.id);
  }
  // First request must remain entirely inert, including remote resources.
  const unsafe='<h1>HTML 본문 미리보기</h1><script>window.cardPreviewUnsafe=true</script><img src="https://preview-forbidden.invalid/pixel"><iframe src="https://preview-forbidden.invalid/frame"></iframe><p>한국어로 읽고 메모하는 문서입니다. 저장한 내용으로 미리보기를 만듭니다.</p>';
  const metadata=parseHTML('<h1>HTML</h1>',{title:'웹 문서'},{allowScripts:false}).metadata;
  await s.putDocumentRevision({id:'preview-web',title:'웹 문서',name:'미리보기.html',created:1000,modified:2000,html:unsafe,metadata},{baseline:true});rows.unshift('preview-web');
  const blank=document.createElement('canvas');blank.width=320;blank.height=180;const ctx=blank.getContext('2d');ctx.fillStyle='#334155';ctx.fillRect(0,0,320,180);ctx.fillStyle='#fff';ctx.font='24px sans-serif';ctx.fillText('YouTube',90,100);const picture=blank.toDataURL('image/jpeg');
  await s.putDocumentRevision({id:'preview-video',title:'유튜브 영상',name:'video.html',created:1000,modified:2000,html:'<p>자막</p>',metadata:{...structuredClone(metadata),youtube:{videoId:'dQw4w9WgXcQ',thumbnail:picture}}},{baseline:true});rows.push('preview-video');
  return rows;
}
