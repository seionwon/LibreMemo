import test from 'node:test';
import assert from 'node:assert/strict';
import {sentenceCues,toLanguage,defaultLanguage,guessLanguage,needsTranslation,batches,toSRT,cuesOf,translateTexts,QuotaError} from '../public/src/translate.js';

test('the wanted language defaults to the device language LibreMemo supports',()=>{
  assert.equal(defaultLanguage(['ko-KR','en']),'ko');assert.equal(defaultLanguage(['en-US']),'en');
  assert.equal(defaultLanguage(['zh-TW']),'zh-Hant');assert.equal(defaultLanguage(['zh-CN']),'zh-Hans');assert.equal(defaultLanguage(['xx']),'ko');
});
test('a subtitle language comes from its file name, else from its letters',()=>{
  assert.equal(guessLanguage('talk-ted-ko.srt',''),'ko');assert.equal(guessLanguage('talk-ted-en.srt',''),'en');
  assert.equal(guessLanguage('[English] Talk [DownSub.com].srt',''),'en');assert.equal(guessLanguage('강의 (한국어).srt',''),'ko');
  assert.equal(guessLanguage('a.srt','1\n00:00:01,000 --> 00:00:02,000\n대학에 다닐 때\n'),'ko');
  assert.equal(guessLanguage('a.srt','1\n00:00:01,000 --> 00:00:02,000\nHi, you all. I am a professor here.\n'),'latin');
  assert.equal(guessLanguage('a.srt','こんにちは、皆さん。今日は'),'ja');
  assert.equal(needsTranslation('en','ko'),true);assert.equal(needsTranslation('ko','ko'),false);
  assert.equal(needsTranslation('latin','ko'),true);assert.equal(needsTranslation('latin','en'),null);assert.equal(needsTranslation('zh-Hans','zh-Hant'),true);
});
test('cues are sent in small batches and come back as SRT with the same timings',()=>{
  const texts=['a'.repeat(200),'b'.repeat(200),'c'.repeat(200)];
  assert.deepEqual(batches(texts).map(b=>b.map(x=>x.index)),[[0,1],[2]]);
  const srt='1\n00:00:01,500 --> 00:00:03,000\nHello\nthere\n\n2\n00:01:02,000 --> 00:01:04,250\nBye\n';
  const cues=cuesOf({text:srt,format:'srt'});
  const again=cuesOf({text:toSRT(cues.map(c=>({...c,text:c.text.toUpperCase()}))),format:'srt'});
  assert.deepEqual(again.map(c=>[c.start,c.end,c.text]),[[1500,3000,'HELLO\nTHERE'],[62000,64250,'BYE']]);
});
test('an on-device translator translates every cue',async()=>{
  const result=await translateTexts(['one','two'],{from:'en',to:'ko',translator:{translate:async t=>'번역:'+t}});
  assert.deepEqual(result,{texts:['번역:one','번역:two'],done:2});
});
test('the free service stops at its daily limit and keeps the rest to continue later',async t=>{
  const original=globalThis.fetch;t.after(()=>{globalThis.fetch=original;});let calls=0;
  globalThis.fetch=async url=>{calls++;const q=new URL(url).searchParams.get('q');
    if(calls>1)return new Response(JSON.stringify({quotaFinished:true,responseStatus:429,responseDetails:'MYMEMORY WARNING: YOU USED ALL AVAILABLE FREE TRANSLATIONS FOR TODAY'}),{status:429});
    return new Response(JSON.stringify({responseStatus:200,responseData:{translatedText:q.split('\n').map(l=>'번역 '+l).join('\n')}}));};
  const texts=['x'.repeat(200),'y'.repeat(200),'z'.repeat(200)];
  const first=await translateTexts(texts,{from:'en',to:'ko'});
  assert.equal(first.done,2);assert.equal(first.quota,true);assert.deepEqual(first.texts.map(s=>s.slice(0,3)),['번역 ','번역 ','zzz']);
  globalThis.fetch=async url=>new Response(JSON.stringify({responseStatus:200,responseData:{translatedText:'번역 '+new URL(url).searchParams.get('q')}}));
  const rest=await translateTexts(first.texts,{from:'en',to:'ko',start:first.done});
  assert.equal(rest.done,3);assert.ok(rest.texts[2].startsWith('번역 z'));assert.equal(rest.texts[0],first.texts[0]);
  assert.ok(QuotaError);
});

test('caption fragments are joined into sentences before translating, keeping their times',()=>{
  const cues=[{start:0,end:1880,text:"Hi, you all. I'm Chris Peach. I'm a"},{start:1880,end:4000,text:'professor here at Stanford University.'},{start:4000,end:5440,text:'I teach some large intro'},{start:5440,end:8560,text:'classes'}];
  assert.deepEqual(sentenceCues(cues).map(c=>[c.start,c.end,c.text]),[[0,4000,"Hi, you all. I'm Chris Peach. I'm a professor here at Stanford University."],[4000,8560,'I teach some large intro classes']]);
  assert.equal(sentenceCues([{start:0,end:7000,text:'one'},{start:7000,end:14000,text:'two'},{start:14000,end:15000,text:'three'}]).length,2);
  assert.equal(toLanguage('한국어'),'한국어로');assert.equal(toLanguage('English'),'English로');assert.equal(toLanguage('日本語'),'日本語로');
});
