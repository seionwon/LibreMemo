// Pasted text becomes a document here. Kept apart from web.js so the Markdown
// renderer (about 100 KB) loads when text is pasted, not when the app starts.
import {t} from './i18n.js';
import {escapeHTML} from './utils.js';
import {renderMarkdown} from './markdown.js';
import {PASTE_LIMIT,webURL} from './web.js';

// The default title may arrive in either language; both mean “no title given”.
const DEFAULT_TITLE=t('붙여넣은 글'),isDefaultTitle=value=>value==='붙여넣은 글'||value===DEFAULT_TITLE;
export function pastedPage({text,title=DEFAULT_TITLE,url=''}={}){
  if(typeof text!=='string'||!text.trim())throw new Error(t('가져올 글을 붙여넣어주세요.'));
  if(text.length>PASTE_LIMIT)throw new Error(t('붙여넣기는 한 번에 200,000자까지 가능합니다.'));
  title=String(title).trim().slice(0,300)||DEFAULT_TITLE;if(url)url=webURL(url);
  const markdown=renderMarkdown(text,url);
  const useMarkdownHeading=!!markdown.heading&&(isDefaultTitle(title)||title===markdown.heading);
  if(isDefaultTitle(title)&&markdown.heading)title=markdown.heading.slice(0,300);
  const heading=useMarkdownHeading?'':'<h1>'+escapeHTML(title)+'</h1>';
  return {title,url,viewport:{width:960,height:800},warnings:[],html:'<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+escapeHTML(title)+'</title><style>body{max-width:820px;margin:40px auto;padding:0 24px;font:18px/1.9 system-ui,sans-serif;overflow-wrap:anywhere;background:var(--htmlmemo-reader-paper,#fff);color:var(--htmlmemo-reader-ink,#000)}h1{font-size:1.6em}h2{font-size:1.35em}h3{font-size:1.15em}h1,h2,h3,h4,h5,h6{line-height:1.4;margin:1.4em 0 .6em}p{white-space:normal}a{color:#25636b;text-underline-offset:3px}blockquote{margin:1em 0;padding:.2em 1em;border-left:3px solid var(--htmlmemo-reader-quote-line,#94a3b8);color:var(--htmlmemo-reader-muted,#475569)}pre{padding:16px;overflow:auto;background:var(--htmlmemo-reader-panel,#f1f5f9);border:1px solid var(--htmlmemo-reader-line,#e2e8f0);border-radius:8px;line-height:1.6}code{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:.88em}:not(pre)>code{padding:.1em .3em;background:var(--htmlmemo-reader-inline-code,#f1f5f9);border-radius:3px}table{display:block;max-width:100%;overflow:auto;border-collapse:collapse;font-size:.95em}th,td{padding:8px 12px;border:1px solid var(--htmlmemo-reader-table-line,#cbd5e1);text-align:left}th{background:var(--htmlmemo-reader-panel,#f1f5f9)}img{max-width:100%;height:auto}hr{border:0;border-top:1px solid var(--htmlmemo-reader-line,#cbd5e1);margin:1.5em 0}li>p{margin:.25em 0}.markdown-task{list-style:none}@media(max-width:480px){body{margin:20px auto;padding:0 16px}}</style></head><body><article>'+heading+markdown.html+(url?'<p><a href="'+escapeHTML(url)+'">'+t('원문 열기')+'</a></p>':'')+'</article></body></html>'};
}
