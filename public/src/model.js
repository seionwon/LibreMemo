import { validTextStyle } from './text-style.js';
export const FORMAT_VERSION = 1;
export const TEXT_TOOLS = ['highlight', 'underline', 'strike'];
export const DRAW_TOOLS = ['pen', 'rect', 'circle', 'ellipse', 'arrow', 'area', 'area-underline'];
export const FILL_TOOLS = ['rect', 'circle', 'ellipse'];
export const ANNOTATION_LABELS = {pen:'펜 그림',highlight:'형광펜',underline:'밑줄',strike:'취소선',note:'메모',text:'텍스트',rect:'사각형',circle:'원',ellipse:'타원',arrow:'화살표',area:'영역 강조','area-underline':'영역 밑줄'};
export const READING_FONTS = [
  ['default', '기본'],
  ['sans', '고딕'],
  ['serif', '명조'],
  ['dotum', '돋움'],
  ['mono', '고정폭'],
  ['Pretendard', '프리텐다드 (Pretendard)'],
  ['Apple SD Gothic Neo', '애플 SD 산돌고딕 Neo'],
  ['Malgun Gothic', '맑은 고딕'],
  ['NanumGothic', '나눔고딕'],
  ['NanumBarunGothic', '나눔바른고딕'],
  ['NanumSquare', '나눔스퀘어'],
  ['Noto Sans KR', '본고딕 (Noto Sans KR)'],
  ['KoPubWorldDotum', 'KoPub 돋움'],
  ['Dotum', '돋움 (Dotum)'],
  ['Gulim', '굴림 (Gulim)'],
  ['AppleMyungjo', '애플명조 (AppleMyungjo)'],
  ['NanumMyeongjo', '나눔명조'],
  ['Noto Serif KR', '본명조 (Noto Serif KR)'],
  ['MaruBuri', '마루 부리 (MaruBuri)'],
  ['RIDIBatang', '리디바탕 (RIDIBatang)'],
  ['KoPubWorldBatang', 'KoPub 바탕'],
  ['Batang', '바탕 (Batang)'],
  ['Gungsuh', '궁서 (Gungsuh)'],
  ['D2Coding', 'D2Coding'],
  ['NanumGothicCoding', '나눔고딕코딩'],
  ['Consolas', 'Consolas'],
  ['Menlo', 'Menlo'],
  ['Courier New', 'Courier New'],
  ['Arial', 'Arial'],
  ['Helvetica', 'Helvetica'],
  ['Verdana', 'Verdana'],
  ['Georgia', 'Georgia'],
  ['Times New Roman', 'Times New Roman'],
];
export const READING_FONT_FAMILIES = {
  sans: "'Pretendard','Apple SD Gothic Neo','Malgun Gothic','Noto Sans CJK KR','Noto Sans KR',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
  serif: "'AppleMyungjo','NanumMyeongjo','KoPubWorldBatang','Batang','Noto Serif CJK KR','Noto Serif KR',Georgia,'Times New Roman',serif",
  dotum: "'AppleGothic','Dotum','Gulim','NanumBarunGothic','Noto Sans KR',Arial,Helvetica,sans-serif",
  mono: "'D2Coding','SFMono-Regular',Menlo,Monaco,Consolas,'Liberation Mono','Courier New',ui-monospace,monospace",
  Pretendard: "'Pretendard','Pretendard Variable','Apple SD Gothic Neo','Malgun Gothic','Noto Sans KR',sans-serif",
  'Apple SD Gothic Neo': "'Apple SD Gothic Neo','Pretendard','Malgun Gothic','Noto Sans KR',sans-serif",
  'Malgun Gothic': "'Malgun Gothic','맑은 고딕','Apple SD Gothic Neo','Noto Sans KR',sans-serif",
  NanumGothic: "'NanumGothic','Nanum Gothic','나눔고딕','Apple SD Gothic Neo','Malgun Gothic',sans-serif",
  NanumBarunGothic: "'NanumBarunGothic','Nanum Barun Gothic','나눔바른고딕','NanumGothic','Apple SD Gothic Neo','Malgun Gothic',sans-serif",
  NanumSquare: "'NanumSquare','Nanum Square','나눔스퀘어','NanumGothic','Apple SD Gothic Neo','Malgun Gothic',sans-serif",
  'Noto Sans KR': "'Noto Sans KR','Noto Sans CJK KR','본고딕','Source Han Sans KR','Apple SD Gothic Neo','Malgun Gothic',sans-serif",
  KoPubWorldDotum: "'KoPubWorldDotum','KoPubDotum','KoPub 돋움','Dotum','Apple SD Gothic Neo','Malgun Gothic',sans-serif",
  Dotum: "'Dotum','돋움','AppleGothic','Apple SD Gothic Neo','Malgun Gothic',sans-serif",
  Gulim: "'Gulim','굴림','Dotum','AppleGothic','Malgun Gothic',sans-serif",
  AppleMyungjo: "'AppleMyungjo','애플명조','NanumMyeongjo','Batang','Noto Serif KR',serif",
  NanumMyeongjo: "'NanumMyeongjo','Nanum Myeongjo','나눔명조','AppleMyungjo','Batang','Noto Serif KR',serif",
  'Noto Serif KR': "'Noto Serif KR','Noto Serif CJK KR','본명조','Source Han Serif KR','NanumMyeongjo','AppleMyungjo','Batang',serif",
  MaruBuri: "'MaruBuri','Maru Buri','마루 부리','NanumMyeongjo','AppleMyungjo','Batang',serif",
  RIDIBatang: "'RIDIBatang','리디바탕','NanumMyeongjo','AppleMyungjo','Batang',serif",
  KoPubWorldBatang: "'KoPubWorldBatang','KoPubBatang','KoPub 바탕','Batang','NanumMyeongjo','AppleMyungjo',serif",
  Batang: "'Batang','바탕','BatangChe','AppleMyungjo','NanumMyeongjo',serif",
  Gungsuh: "'Gungsuh','궁서','GungsuhChe','Batang','AppleMyungjo',serif",
  D2Coding: "'D2Coding','D2Coding ligature','NanumGothicCoding',Menlo,Consolas,'Courier New',ui-monospace,monospace",
  NanumGothicCoding: "'NanumGothicCoding','Nanum Gothic Coding','나눔고딕코딩','D2Coding',Menlo,Consolas,'Courier New',ui-monospace,monospace",
  Consolas: "Consolas,'D2Coding',Menlo,Monaco,'Courier New',ui-monospace,monospace",
  Menlo: "Menlo,'SFMono-Regular',Monaco,Consolas,'D2Coding','Courier New',ui-monospace,monospace",
  'Courier New': "'Courier New',Courier,'D2Coding',Menlo,Consolas,monospace",
  Arial: "Arial,Helvetica,'Apple SD Gothic Neo','Malgun Gothic','Noto Sans KR',sans-serif",
  Helvetica: "Helvetica,'Helvetica Neue',Arial,'Apple SD Gothic Neo','Malgun Gothic',sans-serif",
  Verdana: "Verdana,Geneva,Arial,'Apple SD Gothic Neo','Malgun Gothic',sans-serif",
  Georgia: "Georgia,'Times New Roman','AppleMyungjo','NanumMyeongjo','Batang',serif",
  'Times New Roman': "'Times New Roman',Times,Georgia,'AppleMyungjo','NanumMyeongjo','Batang',serif",
};
export const MONO_READING_FONTS = new Set(['mono', 'D2Coding', 'NanumGothicCoding', 'Consolas', 'Menlo', 'Courier New']);
const READING_FONT_LOOKUP = (() => {
  const map = new Map([['default', 'default'], ['기본', 'default'], ['고딕', 'sans'], ['명조', 'serif'], ['고정폭', 'mono']]);
  const aliases = {
    Pretendard: ['프리텐다드', 'Pretendard Variable'],
    'Apple SD Gothic Neo': ['애플 SD 산돌고딕 Neo', '산돌고딕', 'AppleSDGothicNeo'],
    'Malgun Gothic': ['맑은 고딕', '맑은고딕', 'MalgunGothic'],
    NanumGothic: ['나눔고딕', '나눔 고딕', 'Nanum Gothic'],
    NanumBarunGothic: ['나눔바른고딕', '나눔 바른고딕', 'Nanum Barun Gothic'],
    NanumSquare: ['나눔스퀘어', '나눔 스퀘어', 'Nanum Square'],
    'Noto Sans KR': ['본고딕', 'Noto Sans CJK KR', 'Source Han Sans KR'],
    KoPubWorldDotum: ['KoPub 돋움', 'KoPub돋움', 'KoPubDotum'],
    Dotum: ['돋움체', 'AppleGothic'],
    Gulim: ['굴림', '굴림체'],
    AppleMyungjo: ['애플명조', '애플 명조'],
    NanumMyeongjo: ['나눔명조', '나눔 명조', 'Nanum Myeongjo'],
    'Noto Serif KR': ['본명조', 'Noto Serif CJK KR', 'Source Han Serif KR'],
    MaruBuri: ['마루 부리', '마루부리', 'Maru Buri'],
    RIDIBatang: ['리디바탕', '리디 바탕'],
    KoPubWorldBatang: ['KoPub 바탕', 'KoPub바탕', 'KoPubBatang'],
    Batang: ['바탕', '바탕체'],
    Gungsuh: ['궁서', '궁서체'],
    NanumGothicCoding: ['나눔고딕코딩', '나눔 고딕 코딩', 'Nanum Gothic Coding'],
  };
  for (const [key, label] of READING_FONTS) {
    map.set(key, key);
    if (!map.has(key.toLowerCase())) map.set(key.toLowerCase(), key);
    if (!map.has(label)) map.set(label, key);
    if (!map.has(label.toLowerCase())) map.set(label.toLowerCase(), key);
  }
  for (const [key, names] of Object.entries(aliases)) {
    for (const name of names) {
      if (!map.has(name)) map.set(name, key);
      if (!map.has(name.toLowerCase())) map.set(name.toLowerCase(), key);
    }
  }
  return map;
})();
export function normalizeReadingFontFamily(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim().replace(/^['"]+|['"]+$/g, '');
  if (!trimmed) return null;
  return READING_FONT_LOOKUP.get(trimmed) || READING_FONT_LOOKUP.get(trimmed.toLowerCase()) || null;
}
/** A card picture: a small inline JPEG/PNG/WebP, or '' (looked, nothing suitable). */
export function validThumbnail(value){return value===''||typeof value==='string'&&value.length<=400000&&/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value);}
export function validPDFPosition(value){return value&&Number.isInteger(value.page)&&value.page>=1&&value.page<=100000&&Number.isFinite(value.y)&&value.y>=0&&value.y<=1;}
export function validateAnnotations(value) {
  if (!Array.isArray(value)) throw new Error('주석 데이터 형식이 올바르지 않습니다.');
  if (value.length > 20000) throw new Error('한 문서의 주석 수가 너무 많습니다.');
  const valid = [...TEXT_TOOLS, ...DRAW_TOOLS, 'note', 'text'];
  const ids = new Set();
  return value.map(item => {
    if (!item || typeof item.id !== 'string' || !/^[\w-]{1,80}$/.test(item.id) || ids.has(item.id) || !valid.includes(item.type)) throw new Error('지원하지 않거나 손상된 주석입니다.');
    ids.add(item.id);
    if(item.pdfPage!=null&&(!Number.isInteger(item.pdfPage)||item.pdfPage<1||item.pdfPage>100000))throw Error('주석의 PDF 페이지가 올바르지 않습니다.');
    if(item.pdfRects!=null&&(!TEXT_TOOLS.includes(item.type)||!Array.isArray(item.pdfRects)||!item.pdfRects.length||item.pdfRects.length>10000||item.pdfRects.some(r=>!validPDFPosition(r)||['x','w','h'].some(k=>!Number.isFinite(r[k])||r[k]<0||r[k]>1)||r.w<=0||r.h<=0||r.x+r.w>1.00001||r.y+r.h>1.00001)))throw Error('PDF 글자 주석 위치가 손상되었습니다.');
    if (!/^#[\da-f]{6}$/i.test(item.color)) throw new Error('주석 색상 형식이 올바르지 않습니다.');
    if (!Number.isFinite(item.width) || item.width < .1 || item.width > 100) throw new Error('주석 굵기가 올바르지 않습니다.');
    if (!Number.isFinite(item.opacity) || item.opacity < 0 || item.opacity > 1) throw new Error('주석 투명도가 올바르지 않습니다.');
    if (item.fill != null && (!FILL_TOOLS.includes(item.type) || typeof item.fill !== 'boolean')) throw new Error('도형 채움 설정이 올바르지 않습니다.');
    if ((item.fill === true || item.fillOpacity != null) && (!FILL_TOOLS.includes(item.type) || item.fill !== true || !Number.isFinite(item.fillOpacity) || item.fillOpacity < 0 || item.fillOpacity > 1)) throw new Error('도형 채움 투명도가 올바르지 않습니다.');
    if (TEXT_TOOLS.includes(item.type)) {
      const a = item.textAnchor;
      if (!a || typeof a.quote !== 'string' || !a.quote.length || !Number.isSafeInteger(a.start) || !Number.isSafeInteger(a.end) || a.start < 0 || a.end <= a.start || a.quote.length > 200000) throw new Error('주석의 텍스트 위치가 손상되었습니다.');
    } else {
      if (!Array.isArray(item.points) || !item.points.length || item.points.length > 100000 || item.points.some(p => !p || !Number.isFinite(p.x) || !Number.isFinite(p.y) || Math.abs(p.x) > 1e8 || Math.abs(p.y) > 1e8)) throw new Error('주석 좌표가 올바르지 않습니다.');
      if (item.anchor && !/^(body|n\d+|js\d+)$/.test(item.anchor)) throw new Error('주석의 문서 위치가 손상되었습니다.');
      if (item.penBasis != null) {
        const basis = item.penBasis;
        if (item.type !== 'pen' || !item.anchor || typeof basis !== 'object' ||
          ['width','height'].some(key=>!Number.isFinite(basis[key]) || basis[key] < 1 || basis[key] > 1e8) ||
          !Number.isFinite(basis.fontSize) || basis.fontSize < .1 || basis.fontSize > 1000) throw new Error('펜 그림의 글자 크기 기준이 손상되었습니다.');
        if(basis.textAnchor != null){
          const a=basis.textAnchor;
          if(!a || typeof a!=='object' || !Number.isSafeInteger(a.start) || !Number.isSafeInteger(a.end) || a.start<0 || a.end<=a.start || a.end>1e8 ||
            typeof a.quote!=='string' || !a.quote.length || a.quote.length>16 || a.end-a.start!==a.quote.length ||
            ['prefix','suffix'].some(key=>typeof a[key]!=='string' || a[key].length>40) ||
            ['x','y'].some(key=>!Number.isFinite(a[key]) || Math.abs(a[key])>1e8) ||
            !Number.isFinite(a.fontSize) || a.fontSize<.1 || a.fontSize>1000) throw new Error('펜 그림의 글자 기준 위치가 손상되었습니다.');
        }
      }
      if (item.anchorTarget != null) {
        const target = item.anchorTarget;
        if (!target || typeof target !== 'object' || !/^[a-z][a-z0-9-]{0,63}$/.test(target.tag) ||
          ['id','rootId','section'].some(key=>typeof target[key] !== 'string' || target[key].length > 1000) ||
          typeof target.quote !== 'string' || target.quote.length > 160 ||
          !Array.isArray(target.path) || target.path.length > 64 || target.path.some(index=>!Number.isSafeInteger(index) || index < 0 || index > 1000000)) throw new Error('주석의 본문 기준 위치가 손상되었습니다.');
      }
    }
    if (!TEXT_TOOLS.includes(item.type) && item.textAnchor != null && (typeof item.textAnchor?.quote !== 'string' || item.textAnchor.quote.length > 200000)) throw new Error('메모의 대상 문장이 손상되었습니다.');
    if (item.text != null && (typeof item.text !== 'string' || item.text.length > 10000)) throw new Error('메모가 너무 길거나 올바르지 않습니다.');
    if (item.style != null && (!['note','text'].includes(item.type) || !validTextStyle(item.style))) throw new Error('메모 상자 스타일이 올바르지 않습니다.');
    return structuredClone(item);
  });
}
export function validateOutlineEdits(value = []) {
  if (value == null) return [];
  if (!Array.isArray(value) || value.length > 5000) throw new Error('목차 수정 데이터 형식이 올바르지 않습니다.');
  const ids = new Set();
  return value.map(item => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) throw new Error('목차 수정 항목이 손상되었습니다.');
    if (typeof item.id !== 'string' || !/^[\w-]{1,80}$/.test(item.id) || ids.has(item.id)) throw new Error('목차 수정 항목 ID가 올바르지 않습니다.');
    ids.add(item.id);
    if (typeof item.title !== 'string' || !item.title.trim() || item.title.length > 1000) throw new Error('목차 제목이 올바르지 않습니다.');
    if (item.originalTitle != null && (typeof item.originalTitle !== 'string' || item.originalTitle.length > 1000)) throw new Error('원본 목차 제목이 올바르지 않습니다.');
    if (item.anchor != null && (typeof item.anchor !== 'string' || !/^(body|n\d+|js\d+)$/.test(item.anchor))) throw new Error('목차 항목의 문서 위치가 손상되었습니다.');
    if (item.href != null && (typeof item.href !== 'string' || item.href.length > 1000)) throw new Error('목차 항목의 연결 대상이 손상되었습니다.');
    if (item.index != null && (!Number.isSafeInteger(item.index) || item.index < 0 || item.index > 100000)) throw new Error('목차 항목 순서가 올바르지 않습니다.');
    if (item.level != null && (!Number.isSafeInteger(item.level) || item.level < 1 || item.level > 16)) throw new Error('목차 항목 단계가 올바르지 않습니다.');
    if (item.top != null && (!Number.isFinite(item.top) || item.top < -1e8 || item.top > 1e8)) throw new Error('목차 항목 위치가 올바르지 않습니다.');
    if (item.pdfPosition != null && !validPDFPosition(item.pdfPosition)) throw new Error('PDF 목차 위치가 손상되었습니다.');
    if (item.pdfQuote != null && (typeof item.pdfQuote !== 'string' || item.pdfQuote.length > 2000)) throw new Error('PDF 목차 본문 문맥이 손상되었습니다.');
    if (item.pdfQuoteOffset != null && (!Number.isFinite(item.pdfQuoteOffset) || Math.abs(item.pdfQuoteOffset) > 1)) throw new Error('PDF 목차 본문 위치가 손상되었습니다.');
    if (item.textAnchor != null) {
      const a = item.textAnchor;
      if (!a || typeof a !== 'object' || typeof a.quote !== 'string' || !a.quote.length || a.quote.length > 2000 ||
        (a.start != null && (!Number.isSafeInteger(a.start) || a.start < 0 || a.start > 1e8)) ||
        (a.end != null && (!Number.isSafeInteger(a.end) || a.end < 0 || a.end > 1e8)) ||
        (a.prefix != null && (typeof a.prefix !== 'string' || a.prefix.length > 200)) ||
        (a.suffix != null && (typeof a.suffix !== 'string' || a.suffix.length > 200))) throw new Error('목차 본문 문맥이 손상되었습니다.');
    }
    if (item.bookSection != null && (typeof item.bookSection !== 'string' || item.bookSection.length > 1000)) throw new Error('책 목차 절 정보가 손상되었습니다.');
    if (item.bookPath != null && (!Array.isArray(item.bookPath) || item.bookPath.length > 32 || item.bookPath.some(part => typeof part !== 'string' || part.length > 1000))) throw new Error('책 목차 경로가 손상되었습니다.');
    if (item.sourceKind != null && !['heading', 'toc', 'pdf'].includes(item.sourceKind)) throw new Error('목차 종류가 올바르지 않습니다.');
    return structuredClone(item);
  });
}
// Only preferences written inside this document's isolated runtime are kept.
// Pairs avoid prototype/property access and keep untrusted storage bounded.
export function cleanSourceStorage(value) {
  if(!Array.isArray(value))return [];
  const result=[],keys=new Set();let size=0;
  for(const pair of value.slice(0,256)){
    if(!Array.isArray(pair)||pair.length!==2||pair.some(v=>typeof v!=='string')||pair[0].length>1000||keys.has(pair[0]))continue;
    size+=pair[0].length+pair[1].length;if(size>262144)break;
    keys.add(pair[0]);result.push([...pair]);
  }
  return result;
}
// History owns its snapshots; current/undo/redo always return detached copies.
// Reuse only equal plain annotation data, including nested coordinates. Compare
// values (not caller identities), because callers may edit a returned snapshot.
function sameHistoryValue(a,b,left=new WeakMap(),right=new WeakMap(),depth=0) {
  if(Object.is(a,b))return true;
  if(!a||!b||typeof a!=='object'||typeof b!=='object'||depth>64)return false;
  const array=Array.isArray(a);
  if(array!==Array.isArray(b)||array&&a.length!==b.length)return false;
  if(!array&&(Object.getPrototypeOf(a)!==Object.prototype||Object.getPrototypeOf(b)!==Object.prototype))return false;
  if(left.has(a)||right.has(b))return left.get(a)===b&&right.get(b)===a;
  left.set(a,b);right.set(b,a);
  const keys=Object.keys(a),other=Object.keys(b);
  return keys.length===other.length&&keys.every((key,i)=>key===other[i]&&sameHistoryValue(a[key],b[key],left,right,depth+1));
}
function historySnapshot(value,previous) {
  if(!Array.isArray(value)||!Array.isArray(previous)||!value.every(item=>item&&typeof item.id==='string'))return structuredClone(value);
  const byId=new Map(previous.filter(item=>item&&typeof item.id==='string').map(item=>[item.id,item]));
  return value.map(item=>{const old=byId.get(item.id);return old&&sameHistoryValue(item,old)?old:structuredClone(item);});
}
export class History {
  constructor(initial = []) { this.entries = [structuredClone(initial)]; this.index = 0; }
  commit(value) { const snapshot=historySnapshot(value,this.entries[this.index]);this.entries.splice(this.index + 1); this.entries.push(snapshot); if (this.entries.length > 101) this.entries.shift(); this.index = this.entries.length - 1; return this.current; }
  get current() { return structuredClone(this.entries[this.index]); }
  get canUndo() { return this.index > 0; }
  get canRedo() { return this.index < this.entries.length - 1; }
  undo() { if (this.canUndo) this.index--; return this.current; }
  redo() { if (this.canRedo) this.index++; return this.current; }
}
// A single writer per document. Edits arriving during a disk write are drained
// before flush resolves; callers never overwrite a newer edit with an old one.
export class SaveQueue {
  constructor(write, report = () => {}) { this.write = write; this.report = report; this.revision = 0; this.editRevision = 0; this.saved = 0; this.error = null; this.running = null; this.timer = null; }
  schedule({background = false} = {}) {
    this.revision++;
    if (!background) { this.editRevision = this.revision; this.error = null; this.report(this); }
    // Reading position is saved quietly after a pause. It must never delay an edit.
    if (background && this.editsPending) return;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => { this.flush().catch(() => {}); }, background ? 2000 : 300);
  }
  async flush() {
    clearTimeout(this.timer);
    if (this.running) { await this.running; if (this.saved < this.revision) return this.flush(); return; }
    this.running = (async () => {
      try {
        while (this.saved < this.revision) { const next = this.revision; await this.write(next); this.saved = next; this.error = null; this.report(this); }
      } catch (error) { this.error = error; this.report(this); throw error; }
    })();
    try { await this.running; } finally { this.running = null; }
  }
  get pending() { return this.saved < this.revision; }
  get editsPending() { return this.saved < this.editRevision; }
}

// Independent from fast autosave. One event-driven timer per edited document;
// reading and pointer motion outside annotation input never start a timer.
export class AnnotationCheckpoints {
  constructor(write,report=()=>{},{now=()=>Date.now(),setTimer=(fn,ms)=>setTimeout(fn,ms),clearTimer=id=>clearTimeout(id),interval=300000,idle=60000}={}) {
    Object.assign(this,{write,report,now,setTimer,clearTimer,interval,idle});
    this.revision=0;this.saved=0;this.started=0;this.lastInput=0;this.timer=null;this.due=0;this.running=null;this.error=null;this.disposed=false;
  }
  get pending(){return this.saved<this.revision;}
  schedule(){if(this.disposed)return;if(!this.pending||this.error)this.started=this.now();this.revision++;this.error=null;this.activity();}
  activity(){if(!this.pending||this.disposed)return;this.lastInput=this.now();this.arm();}
  arm(){
    if(!this.pending||this.disposed||this.error||this.running)return;
    const due=Math.min(this.started+this.interval,this.lastInput+this.idle);
    // Keep an earlier wake-up rather than recreating timers for every pen point.
    if(this.timer!==null&&this.due<=due)return;
    if(this.timer!==null)this.clearTimer(this.timer);this.due=due;
    this.timer=this.setTimer(()=>{this.timer=null;if(this.now()<Math.min(this.started+this.interval,this.lastInput+this.idle))this.arm();else void this.flush().catch(()=>{});},Math.max(0,due-this.now()));
  }
  async flush({force=false}={}){
    if(this.disposed)return;if(this.timer!==null)this.clearTimer(this.timer);this.timer=null;
    if(this.running){await this.running;if(force||this.pending)return this.flush({force});return;}
    if(!force&&!this.pending)return;
    this.running=(async()=>{
      try{
        do{const next=this.revision;await this.write();this.saved=next;this.error=null;}while(force&&this.pending);
        if(this.pending)this.started=this.now();this.report(this);
      }catch(error){this.error=error;this.report(this);throw error;}
    })();
    try{await this.running;}finally{this.running=null;this.arm();}
  }
  dispose(){this.disposed=true;if(this.timer!==null)this.clearTimer(this.timer);this.timer=null;}
}
