import {esc} from './office-common.js';

const LIMIT=256*1024*1024,MAX_CUES=1000000;
function clock(value){
  const m=String(value).trim().match(/^(?:(\d{1,3}):)?(\d{1,2}):(\d{2})[.,](\d{1,3})$/);
  if(!m||+m[2]>=60||+m[3]>=60)return null;
  return (+m[1]||0)*3600000+(+m[2])*60000+(+m[3])*1000+Number(m[4].padEnd(3,'0'));
}
export function subtitleTime(ms,precise=false){const seconds=Math.floor(ms/1000),pad=n=>String(n).padStart(2,'0');return pad(Math.floor(seconds/3600))+':'+pad(Math.floor(seconds/60)%60)+':'+pad(seconds%60)+(precise?'.'+String(ms%1000).padStart(3,'0'):'');}
const entities={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' ',lrm:'\u200e',rlm:'\u200f'};
function unescape(value){return value.replace(/&(#x[0-9a-f]{1,6}|#\d{1,7}|amp|lt|gt|quot|apos|nbsp|lrm|rlm);/gi,(whole,key)=>{if(key[0]!=='#')return entities[key.toLowerCase()];const number=parseInt(key.slice(/^#x/i.test(key)?2:1),/^#x/i.test(key)?16:10);return number>0&&number<=0x10ffff&&!(number>=0xd800&&number<=0xdfff)?String.fromCodePoint(number):'�';});}
function cueText(value){
  // A subtitle is data, never executable HTML/CSS. Convert only line breaks,
  // voice labels and character entities, then escape the complete result.
  return unescape(value.replace(/<!--[^]*?-->/g,'').replace(/<(script|style)\b[^>]*>[^]*?<\/\1\s*>/gi,'').replace(/<br\s*\/?\s*>/gi,'\n').replace(/<v(?:\.[^\s>]+)?\s+([^>]+)>/gi,(_,voice)=>voice+': ').replace(/<[^>]*>/g,'')).replace(/\r/g,'').trim();
}
function add(cues,start,end,text,speaker=''){
  if(start===null||!Number.isFinite(start)||start<0||start>3599999999||end!=null&&(!Number.isFinite(end)||end<start))return false;
  const body=cueText(text);if(!body)return true;
  if(cues.length>=MAX_CUES)throw Error('자막은 500,000개 대사 이하로 나누어 가져와 주세요.');
  cues.push({start,end,text:body,speaker:cueText(speaker)});return true;
}
function timedBlocks(text,format,cues){
  let invalid=0;
  if(format==='vtt'&&!/^WEBVTT(?:[ \t]|\n|$)/.test(text))throw Error('WebVTT 파일의 시작 표시가 없습니다.');
  for(const block of text.split(/\n[ \t]*\n/)){
    const lines=block.trim().split('\n');
    if(!lines[0]||format==='vtt'&&/^(?:WEBVTT(?:\s|$)|NOTE(?:\s|$)|STYLE$|REGION$)/.test(lines[0]))continue;
    const at=lines.findIndex(line=>line.includes('-->'));if(at<0){invalid++;continue;}
    const m=lines[at].match(/^\s*(\S+)\s+-->\s+(\S+)(?:\s.*)?$/);
    const start=m?clock(m[1]):null,end=m?clock(m[2]):null;
    if(!m||end===null||!add(cues,start,end,lines.slice(at+1).join('\n')))invalid++;
  }
  return invalid;
}
function sami(text,cues){
  if(!/<sami\b/i.test(text))throw Error('SAMI 파일의 시작 표시가 없습니다.');
  const labels=new Map();for(const m of text.matchAll(/\.([\w-]+)\s*\{([^}]+)\}/g)){const name=m[2].match(/\bName\s*:\s*([^;]+)/i)?.[1]?.trim();if(name)labels.set(m[1].toLowerCase(),name);}
  const sync=[...text.matchAll(/<sync\b[^>]*\bstart\s*=\s*["']?(\d+)["']?[^>]*>/gi)];let invalid=0;
  if(sync.length>MAX_CUES)throw Error('자막은 500,000개 시간 구간 이하로 나누어 가져와 주세요.');
  for(let i=0;i<sync.length;i++){
    const mark=sync[i],start=Number(mark[1]),end=i+1<sync.length?Number(sync[i+1][1]):null,body=text.slice(mark.index+mark[0].length,sync[i+1]?.index??text.length);
    const paragraphs=[...body.matchAll(/<p\b([^>]*)>([^]*?)(?=<p\b|$)/gi)];
    if(!paragraphs.length){if(!add(cues,start,end,body))invalid++;continue;}
    for(const p of paragraphs){const cls=p[1].match(/\bclass\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i),name=cls?(cls[1]||cls[2]||cls[3]):'';if(!add(cues,start,end,p[2],paragraphs.length>1?labels.get(name.toLowerCase())||name:''))invalid++;}
  }
  return invalid;
}
function ass(text,cues,warnings){
  let events=false,fields=['layer','start','end','style','name','marginl','marginr','marginv','effect','text'],invalid=0,drawings=0;
  for(const line of text.split('\n')){
    if(/^\s*\[.*\]\s*$/.test(line)){events=/^\s*\[events\]\s*$/i.test(line);continue;}
    if(!events)continue;
    if(/^Format\s*:/i.test(line)){fields=line.slice(line.indexOf(':')+1).split(',').map(v=>v.trim().toLowerCase());continue;}
    if(!/^Dialogue\s*:/i.test(line))continue;
    if(fields.at(-1)!=='text'||!fields.includes('start')||!fields.includes('end'))throw Error('자막의 Dialogue 열 구성을 읽을 수 없습니다. SRT 사본으로 가져와 주세요.');
    let rest=line.slice(line.indexOf(':')+1).trimStart();const values=[];
    for(let i=0;i<fields.length-1;i++){const at=rest.indexOf(',');if(at<0)break;values.push(rest.slice(0,at));rest=rest.slice(at+1);}values.push(rest);
    if(values.length!==fields.length){invalid++;continue;}
    const get=key=>values[fields.indexOf(key)]||'',raw=get('text');
    if(/\{[^}]*\\p[1-9]/.test(raw)){drawings++;continue;}
    const body=raw.replace(/\{[^}]*\}/g,'').replace(/\\[Nn]/g,'\n').replace(/\\h/g,' '),start=clock(get('start')),end=clock(get('end'));
    if(end===null||!add(cues,start,end,body,get('name')||get('actor')))invalid++;
  }
  if(drawings)warnings.push('ASS/SSA의 벡터 그림 '+drawings+'개는 읽기 본문에서 생략했습니다. 대사·화자는 보존하며 위치·움직임·가라오케 효과는 재현하지 않습니다.');
  return invalid;
}
export function parseSubtitles(text,format,warnings=[]){
  if(text.length>LIMIT)throw Error('자막 파일은 2GB 이하로 나누어 가져와 주세요.');
  text=text.replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n');const cues=[];let invalid;
  if(['srt','vtt'].includes(format))invalid=timedBlocks(text,format,cues);
  else if(['smi','sami'].includes(format))invalid=sami(text,cues);
  else if(['ass','ssa'].includes(format))invalid=ass(text,cues,warnings);
  else throw Error('지원하지 않는 자막 형식입니다.');
  if(!cues.length)throw Error('읽을 수 있는 자막 대사와 시간을 찾지 못했습니다. 파일 형식과 인코딩을 확인해주세요.');
  if(invalid)warnings.push('시간이나 형식이 맞지 않는 자막 '+invalid+'개를 생략했습니다. 원본 파일에서 확인해주세요.');
  return cues.map((cue,index)=>({...cue,index})).sort((a,b)=>a.start-b.start||a.index-b.index);
}
export function renderSubtitles(text,format,warnings=[]){
  const cues=parseSubtitles(text,format,warnings),parts=['<article class="office-subtitles" data-subtitles>'];let group=-1;
  for(const cue of cues){
    const next=Math.floor(cue.start/300000);
    if(next!==group){if(group>=0)parts.push('</section>');group=next;parts.push('<section id="subtitle-section-'+group+'"><h2 data-tts-skip>'+subtitleTime(group*300000)+' – '+subtitleTime((group+1)*300000)+'</h2>');}
    parts.push('<div class="subtitle-cue" id="subtitle-cue-'+cue.index+'"><p class="subtitle-time" data-tts-skip>'+subtitleTime(cue.start,true)+(cue.end!=null?' → '+subtitleTime(cue.end,true):'')+'</p><p class="subtitle-text">'+(cue.speaker?'<strong>'+esc(cue.speaker)+'</strong> · ':'')+esc(cue.text).replace(/\n/g,'<br>')+'</p></div>');
  }
  parts.push('</section></article>');return parts.join('');
}
