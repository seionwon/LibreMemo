import test from 'node:test';
import assert from 'node:assert/strict';
import {documentFor} from './dom.mjs';
import {openVideoNoteDialog} from '../public/src/youtube-note-dialog.js';
import {makeVideoNote,findVideoNote} from '../public/src/youtube-notes.js';
const videoId='M7lc1UVf-VE';
function setup({fixed=false,note=null}={}){
  const existing=note||makeVideoNote(videoId,83,'기존 내용'),record={id:'video',title:'영상',metadata:{youtube:{videoId},annotations:[existing]}},saved=[];let dialog;
  const old=globalThis.requestAnimationFrame;globalThis.requestAnimationFrame=f=>f();
  try{openVideoNoteDialog({videoId:fixed?videoId:'',seconds:fixed?83:0,note,records:[record],findNote:({video,seconds})=>structuredClone(findVideoNote(record.metadata,video?.videoId,seconds)),save:async value=>{saved.push(value);},modal:(html,ready)=>{
    dialog=documentFor('<html><body><dialog open>'+html+'</dialog></body></html>').querySelector('dialog');dialog.open=true;dialog.close=()=>{dialog.open=false;dialog.dispatchEvent(new dialog.ownerDocument.defaultView.Event('close'));};
    const select=dialog.querySelector('select');let selected;Object.defineProperty(select,'value',{get:()=>selected??select.querySelector('option')?.value??'',set:v=>{selected=v;}});ready(dialog);
  }});}finally{globalThis.requestAnimationFrame=old;}
  const q=s=>dialog.querySelector(s),input=(s,value)=>{q(s).value=value;q(s).oninput?.();};
  return {q,input,saved,existing,submit:()=>q('form').onsubmit({preventDefault(){}})};
}
test('same video and second opens the existing note and saves its identity with added text',async()=>{
  const t=setup();t.input('[data-youtube-url]','https://youtu.be/'+videoId+'?t=83');assert.equal(t.q('[data-scene-text]').value,'기존 내용');assert.equal(t.q('[data-scene-save]').textContent,'변경 저장');
  t.input('[data-scene-text]','기존 내용\n추가한 내용');await t.submit();assert.equal(t.saved.length,1);assert.equal(t.saved[0].note.id,t.existing.id);assert.equal(t.saved[0].text,'기존 내용\n추가한 내용');
});
test('switching between new and existing seconds preserves both unsaved drafts',()=>{
  const t=setup();t.input('[data-youtube-url]','https://youtu.be/'+videoId+'?t=10');t.input('[data-scene-text]','새 시점 초안');t.input('[data-scene-time]','1:23');assert.equal(t.q('[data-scene-text]').value,'기존 내용');t.input('[data-scene-text]','기존 내용 보충');
  t.input('[data-scene-time]','10');assert.equal(t.q('[data-scene-text]').value,'새 시점 초안');assert.equal(t.q('[data-scene-save]').textContent,'시점 메모 저장');t.input('[data-scene-time]','83');assert.equal(t.q('[data-scene-text]').value,'기존 내용 보충');
});
test('current-time entry opens an existing note, while explicit editing can move its time',async()=>{
  const current=setup({fixed:true});assert.equal(current.q('[data-scene-text]').value,'기존 내용');
  const note=makeVideoNote(videoId,83,'옮길 메모'),t=setup({fixed:true,note});t.input('[data-scene-time]','95');await t.submit();assert.equal(t.saved[0].note.id,note.id);assert.equal(t.saved[0].seconds,95);
});


test('a link within three seconds opens the closest existing note at its saved time',async()=>{
  const t=setup();t.input('[data-youtube-url]','https://youtu.be/'+videoId+'?t=86');assert.equal(t.q('[data-scene-time]').value,'1:23');assert.equal(t.q('[data-scene-text]').value,'기존 내용');assert.match(t.q('[data-scene-hint]').textContent,/1:23.*3초/);
  t.input('[data-scene-text]','기존 내용 보충');await t.submit();assert.equal(t.saved[0].note.id,t.existing.id);assert.equal(t.saved[0].seconds,83);
  const outside=setup();outside.input('[data-youtube-url]','https://youtu.be/'+videoId+'?t=87');assert.equal(outside.q('[data-scene-save]').textContent,'시점 메모 저장');assert.equal(outside.q('[data-scene-text]').value,'');
});
