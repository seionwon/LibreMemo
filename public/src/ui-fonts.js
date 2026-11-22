// Percentages use each UI element's original type size as the baseline.
export const UI_FONT_MIN = 60;
export const UI_FONT_MAX = 200;
export const UI_FONT_GROUPS = [
  {title:'사이드바', fields:[
    ['sidebar','사이드바 전체','all'], ['sidebar-nav','상단 버튼의 개수','sidebar'],
    ['outline','목차','sidebar'], ['search','검색창과 결과','sidebar'],
    ['annotations','주석 목록','sidebar'], ['bookmarks','북마크 목록','sidebar'],
  ]},
  {title:'내 서재', fields:[
    ['library','서재 전체','all'], ['library-folders','폴더와 경로','library'],
    ['library-title','문서 제목','library'], ['library-info','파일명·날짜·개수','library'],
  ]},
  {title:'도구와 안내', fields:[
    ['tabs','문서 탭','all'], ['reader','문서 상단 읽기 도구','all'],
    ['tools','주석 도구와 메뉴','all'], ['speech','읽어주기 플레이어','all'],
    ['dialogs','설정과 대화상자','all'], ['help','도움말','dialogs'],
    ['status','상태 표시와 알림','all'],
  ]},
];
export const UI_FONT_FIELDS = [['all','화면 전체',null], ...UI_FONT_GROUPS.flatMap(group => group.fields)];
export function normalizeUIFonts(input = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw Error('UI 글자 크기 설정이 올바르지 않습니다.');
  const result = {};
  for (const [key] of UI_FONT_FIELDS) {
    if (!Object.hasOwn(input,key)) continue;
    const value = input[key];
    if (!Number.isInteger(value) || value < UI_FONT_MIN || value > UI_FONT_MAX) throw Error('UI 글자 크기는 60~200% 사이의 정수로 입력하세요.');
    if (key !== 'all' || value !== 100) result[key] = value;
  }
  return result;
}
export function effectiveUIFonts(settings) {
  const values = {};
  for (const [key,,parent] of UI_FONT_FIELDS) values[key] = settings[key] ?? values[parent] ?? 100;
  return values;
}
export function uiFontStyle(settings) {
  if (!Object.keys(settings).length) return '';
  const sizes = effectiveUIFonts(settings);
  const vars = Object.entries(sizes).filter(([,value]) => value !== 100)
    .map(([key,value]) => '--lm-font-'+key+':'+(value/100)+'px');
  if (!vars.length) return '';
  if (sizes.reader > 100) {
    vars.push('--lm-reader-row:'+(24*sizes.reader/100)+'px','--lm-reader-control:'+(20*sizes.reader/100)+'px','--lm-reader-font-width:'+(58*sizes.reader/100)+'px');
  }
  // Embedded books keep their own body, root font size, canvas and annotation geometry.
  let css = ':root{'+vars.join(';')+'}';
  if (sizes.reader !== 100) css += '[data-htmlmemo-doc-topbar] .reader-position{font-size:calc(12.48 * var(--lm-font-reader))!important}';
  if (sizes.outline !== 100) {
    const item = '[data-htmlmemo-native-sidebar] :is(a,summary,[role=treeitem],[aria-expanded]):not([data-htmlmemo-doc-sidebar-ui] *)';
    css += item+'{font-size:calc(12 * var(--lm-font-outline))!important;line-height:1.6!important}'+item+' :is(span,strong,small){font-size:inherit!important}';
  }
  return css;
}
export function applyUIFontStyle(doc, css) {
  if (!doc?.head) return;
  let style = doc.getElementById('htmlmemo-ui-font-style');
  if (!css) { style?.remove(); return; }
  if (!style) {
    style = doc.createElement('style');
    style.id = 'htmlmemo-ui-font-style';
    style.setAttribute('data-htmlmemo-ui','');
    style.textContent = css;
    doc.head.append(style);
  } else if (style.textContent !== css) style.textContent = css;
}
