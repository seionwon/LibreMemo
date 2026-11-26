import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,statSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {DOMParser} from 'linkedom';
import {EN} from '../public/src/locales/en.js';
import {t,useLanguage,loadLanguage,language,localizeStatic,setLanguageChoice,languageChoice,LANGUAGES} from '../public/src/i18n.js';
// The English dictionary loads on demand; fetch it once, then return to Korean.
await loadLanguage('en');useLanguage('ko');

const root=join(dirname(fileURLToPath(import.meta.url)),'../public');
const sources=(dir=join(root,'src'))=>readdirSync(dir).flatMap(name=>{const path=join(dir,name);return statSync(path).isDirectory()?sources(path):name.endsWith('.js')?[path]:[];});
// Literal keys passed to t(): t('...'), t("...") or t(`...`) without ${}.
function calls(){
  const keys=new Map();
  for(const file of sources()){
    if(file.includes('/locales/')||file.endsWith('/i18n.js'))continue;
    const text=readFileSync(file,'utf8');
    for(const m of text.matchAll(/(?<![\w$.])t\(\s*(?:'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\$]|\\.)*)`)/g)){
      const raw=m[1]??m[2]??m[3];let key;
      try{key=Function('return '+(m[1]!==undefined?"'"+raw+"'":m[2]!==undefined?'"'+raw+'"':'`'+raw+'`'))();}catch{continue;}
      if(/[가-힣]/.test(key))keys.set(key,(keys.get(key)||[]).concat(file.slice(root.length+1)));
    }
  }
  return keys;
}
const placeholders=value=>[...String(value).matchAll(/\{(\w+)\}/g)].map(m=>m[1]).sort();

test('every interface string passed to t() has an English translation',()=>{
  const missing=[...calls()].filter(([key])=>typeof EN[key]!=='string').map(([key,files])=>`${files[0]}: ${key}`);
  assert.deepEqual(missing,[],missing.length+' strings have no English entry');
});

test('every contextual pt() string has an English translation for its context or its plain text',()=>{
  const missing=[];
  for(const file of sources()){
    if(file.includes('/locales/')||file.endsWith('/i18n.js'))continue;
    for(const m of readFileSync(file,'utf8').matchAll(/(?<![\w$.])pt\(\s*'([\w-]+)'\s*,\s*'([^'\\\n]*)'/g))
      if(typeof EN[m[2]+'#'+m[1]]!=='string'&&typeof EN[m[2]]!=='string')missing.push(m[1]+': '+m[2]);
  }
  assert.deepEqual(missing,[]);
});

test('English entries keep the same placeholders, are not left in Korean and are not empty',()=>{
  const problems=[];
  for(const [key,value] of Object.entries(EN)){
    if(typeof value!=='string'||!value.trim()){problems.push('empty: '+key);continue;}
    const english=value.split('|');
    for(const part of english)if(JSON.stringify(placeholders(part))!==JSON.stringify(placeholders(key).filter(name=>english.length===1||part.includes('{'+name+'}')||name!=='n')))problems.push('placeholders: '+key+' → '+value);
    if(/[가-힣]/.test(value)&&!/[A-Za-z]/.test(value))problems.push('still Korean: '+key);
  }
  assert.deepEqual(problems,[]);
});

test('Korean stays exactly as written; English replaces text, fills placeholders and picks plurals',()=>{
  const before=language();
  try{
    useLanguage('ko');
    assert.equal(t('주석 {n}개',{n:2}),'주석 2개');assert.equal(t('사전에 없는 문장'),'사전에 없는 문장');
    useLanguage('en');
    const [key]=Object.entries(EN).find(([k,v])=>!/\{/.test(k)&&!v.includes('|'))||[];
    if(key)assert.equal(t(key),EN[key]);
    assert.equal(t('사전에 없는 문장'),'사전에 없는 문장','unknown text falls back to Korean');
    const plural=Object.entries(EN).find(([k,v])=>v.includes('|')&&k.includes('{n}'));
    if(plural){const [one,other]=plural[1].split('|');assert.equal(t(plural[0],{n:1}),one.replace('{n}','1'));assert.equal(t(plural[0],{n:3}),other.replace('{n}','3'));}
  }finally{useLanguage(before);}
});

test('the static first screen is fully covered in English and translated in place',()=>{
  const html=readFileSync(join(root,'index.html'),'utf8');
  const doc=new DOMParser().parseFromString(html,'text/html');
  const before=language();
  try{
    useLanguage('en');localizeStatic(doc.body);for(const template of doc.querySelectorAll('template'))localizeStatic(template.content||template);
    const left=[];
    const visit=node=>{
      if(node.nodeType===3){const value=node.nodeValue.trim();if(/[가-힣]/.test(value))left.push('text: '+value.slice(0,60));return;}
      if(node.nodeType!==1)return;
      if(['SCRIPT','STYLE'].includes(node.nodeName))return;
      for(const name of ['placeholder','title','aria-label','alt'])if(/[가-힣]/.test(node.getAttribute(name)||''))left.push(name+': '+node.getAttribute(name).slice(0,60));
      for(const child of node.childNodes)visit(child);
      if(node.nodeName==='TEMPLATE'&&node.content)for(const child of node.content.childNodes)visit(child);
    };
    visit(doc.body);
    assert.deepEqual(left,[],left.length+' Korean texts remain on the English first screen');
  }finally{useLanguage(before);}
});

test('the language setting offers automatic, Korean and English and remembers the choice',()=>{
  assert.deepEqual(LANGUAGES.map(entry=>entry.id),['auto','ko','en']);
  const store=new Map(),saved=globalThis.localStorage;
  globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
  try{
    assert.equal(languageChoice(),'auto');setLanguageChoice('en');assert.equal(languageChoice(),'en');
    setLanguageChoice('auto');assert.equal(languageChoice(),'auto');assert.throws(()=>setLanguageChoice('fr'));
  }finally{globalThis.localStorage=saved;}
});

test('English help covers every Korean topic with the same ids, groups, links and section shape',async()=>{
  const ko=await import('../public/src/help-content.js'),en=await import('../public/src/help-content.en.js');
  assert.deepEqual(en.HELP_GROUPS.map(g=>g.id),ko.HELP_GROUPS.map(g=>g.id));
  assert.equal(en.HELP_TOPICS.length,ko.HELP_TOPICS.length);
  ko.HELP_TOPICS.forEach((topic,i)=>{
    const other=en.HELP_TOPICS[i];
    assert.equal(other.id,topic.id);assert.equal(other.group,topic.group);assert.deepEqual(other.related||[],topic.related||[]);
    assert.equal(other.sections.length,topic.sections.length,topic.id);
    topic.sections.forEach((section,j)=>{for(const key of ['paragraphs','steps','bullets'])assert.equal((other.sections[j][key]||[]).length,(section[key]||[]).length,topic.id+' '+key);});
    assert.ok(other.title&&!/[가-힣]/.test(other.title),topic.id+' title is English');
  });
});
