import test from 'node:test';
import assert from 'node:assert/strict';
import {documentFor} from './dom.mjs';
import {YouTubePane} from '../public/src/youtube-ui.js';
import {makeVideoNote,videoNotesHTML} from '../public/src/youtube-notes.js';

const videoId='M7lc1UVf-VE';

async function mountScene(start,{duration=200,ready=true}={}){
  const note=makeVideoNote(videoId,start,'다시 들을 설명');
  const metadata={youtube:{videoId},annotations:[note],view:{}};
  const doc=documentFor('<html><body><article data-youtube-empty></article></body></html>');
  const host=documentFor(`<html><body><section class="youtube-pane"><div class="youtube-frame"></div>
    <button data-yt="loop-stop" hidden></button><button data-yt="size"></button><button data-yt="play"></button>
    <select data-yt="rate"><option value="1" selected>1</option></select><span data-yt="clock"></span>
    <span data-yt="now"></span></section></body></html>`);
  const pane=Object.create(YouTubePane.prototype);
  const calls=[],events=[];
  Object.assign(pane,{
    pane:host.querySelector('section'),tab:{host:host.body},reader:{doc,metadata},youtube:metadata.youtube,
    $:name=>host.querySelector(`[data-yt="${name}"]`),cues:[],current:-1,savedAt:0,follow:false,
    callbacks:{onTime:()=>events.push('save'),onEnded:()=>events.push('ended'),onNote:()=>events.push('edit')},
  });
  class Player{
    constructor(frame,options){this.events=options.events;this.time=0;this.state=5;}
    dispatch(state){this.state=state;this.events.onStateChange({data:state});}
    seekTo(time){calls.push(['seek',time]);this.time=time;}
    playVideo(){calls.push(['play']);this.dispatch(1);}
    pauseVideo(){calls.push(['pause']);this.dispatch(2);}
    getPlayerState(){return this.state;}
    getCurrentTime(){return this.time;}
    getDuration(){return duration;}
  }
  const oldWindow=globalThis.window,oldLocation=globalThis.location;
  try{
    globalThis.window={YT:{Player}};globalThis.location={origin:'https://example.org'};
    pane.renderNotes();
    await pane.mount();
    if(ready)pane.player.events.onReady();
  }finally{
    if(oldWindow===undefined)delete globalThis.window;else globalThis.window=oldWindow;
    if(oldLocation===undefined)delete globalThis.location;else globalThis.location=oldLocation;
  }
  const button=pane.notes.querySelector('[data-scene-loop]');
  const stamp=seconds=>{pane.player.time=seconds;pane.tick();};
  return {pane,player:pane.player,calls,events,metadata,note,button,stamp};
}

test('a note menu repeats its ten seconds only while playing, without repeated position writes',async()=>{
  const {pane,player,calls,events,button,stamp}=await mountScene(83);
  assert.equal(pane.$('loop-stop').hidden,true);assert.equal(button.getAttribute('aria-pressed'),'false');
  button.click();
  assert.equal(button.getAttribute('aria-pressed'),'true');assert.equal(pane.$('loop-stop').hidden,false);
  assert.deepEqual(calls,[['seek',83],['play']]);
  stamp(89);stamp(92.99);assert.equal(calls.length,2);
  stamp(93);assert.equal(player.time,83);assert.equal(calls.length,3);
  assert.deepEqual(events,['save'],'the initial scene is saved once while subsequent laps stay in memory');
  player.pauseVideo();const paused=calls.length;
  stamp(93);assert.equal(calls.length,paused);assert.equal(player.state,2);assert.deepEqual(events,['save','save']);
  player.playVideo();stamp(93.25);assert.equal(player.time,83);
  button.click();assert.equal(button.getAttribute('aria-pressed'),'false');assert.equal(pane.$('loop-stop').hidden,true);
  stamp(95);assert.equal(player.time,95);assert.equal(player.state,1);
});

test('repeat uses the remaining seconds at the video end and honors navigation and removal',async()=>{
  const {pane,player,button,stamp,events,metadata,note}=await mountScene(198);
  button.click();
  player.time=0;player.dispatch(0); // An ended player can already show its poster at zero.
  assert.equal(player.time,198);assert.equal(player.state,1);assert.deepEqual(events,['save']);
  pane.seek(20,true);assert.equal(pane.sceneLoop,null);assert.equal(player.time,20);
  button.click();stamp(40);assert.equal(pane.sceneLoop,null);assert.equal(player.time,40);
  button.click();metadata.annotations=[];pane.renderNotes();assert.equal(pane.sceneLoop,null);
  metadata.annotations=[note];pane.renderNotes();pane.notes.querySelector('[data-scene-loop]').click();
  pane.addSceneNote();assert.equal(pane.sceneLoop,null);assert.equal(player.state,2);
  player.dispatch(0);assert.ok(events.includes('ended'));
  const atEnd=await mountScene(200);atEnd.button.click();
  assert.equal(atEnd.pane.sceneLoop,null);assert.deepEqual(atEnd.calls,[]);
  assert.match(atEnd.pane.notes.querySelector('[data-scene-status]').textContent,/영상 끝/);
});

test('a pending repeat can be canceled or hidden before ready, and is never included in exported HTML',async()=>{
  const hidden=await mountScene(12,{ready:false});hidden.button.click();
  assert.deepEqual(hidden.calls,[]);hidden.pane.tab.host.hidden=true;hidden.player.events.onReady();
  assert.equal(hidden.pane.sceneLoop,null);assert.deepEqual(hidden.calls,[]);
  const canceled=await mountScene(12,{ready:false});canceled.button.click();canceled.button.click();
  canceled.player.events.onReady();assert.deepEqual(canceled.calls,[]);
  const active=await mountScene(12,{ready:false});active.button.click();active.player.events.onReady();
  assert.deepEqual(active.calls,[['seek',12],['play']]);
  const exported=documentFor(videoNotesHTML(active.metadata));
  assert.equal(exported.querySelector('[data-scene-loop], [data-scene-menu], [data-scene-status]'),null);
  assert.equal(exported.querySelector('[data-htmlmemo-video-notes] a').href,`https://www.youtube.com/watch?v=${videoId}&t=12s`);
});
