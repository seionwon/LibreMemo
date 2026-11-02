import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {canSleep,cancelTabSleep,scheduleTabSleep,TAB_SLEEP_ELEMENTS} from '../public/src/tab-sleep.js';
import {APP_FILES} from '../public/src/distribution.js';
const tabFor=(patch={},reader={})=>({type:'document',persisted:true,queue:{},checkpoints:{},reader:{metadata:{},doc:{getElementsByTagName:()=>({length:TAB_SLEEP_ELEMENTS})},...reader},...patch});
test('only long, saved, plain documents may sleep',()=>{
  assert.equal(canSleep(tabFor()),true);
  assert.equal(canSleep(tabFor({},{doc:{getElementsByTagName:()=>({length:TAB_SLEEP_ELEMENTS-1})}})),false);
  for(const patch of [{type:'browser'},{opening:true},{closing:true},{persisted:false},{queue:{error:Error('x')}},{checkpoints:{error:Error('x')}},{reader:null}])assert.equal(canSleep(tabFor(patch)),false);
  for(const reader of [{pdf:{}},{runtime:{}},{metadata:{execution:{allowScripts:true}}}])assert.equal(canSleep(tabFor({},reader)),false);
});
test('returning to a tab cancels its sleep, and a timer is armed only once',async()=>{
  let slept=0;const tab=tabFor(),sleep=()=>{slept++;};
  scheduleTabSleep(tab,sleep,5);const timer=tab.sleepTimer;scheduleTabSleep(tab,sleep,5);assert.equal(tab.sleepTimer,timer);
  cancelTabSleep(tab);await new Promise(r=>setTimeout(r,15));assert.equal(slept,0);
  scheduleTabSleep(tab,sleep,1);await new Promise(r=>setTimeout(r,15));assert.equal(slept,1);assert.equal(tab.sleepTimer,null);
  const asleep=tabFor({asleep:true});scheduleTabSleep(asleep,sleep,1);assert.equal(asleep.sleepTimer,undefined);
});
test('a failed sleep stays quiet and the tab stays usable',async()=>{
  const tab=tabFor();scheduleTabSleep(tab,async()=>{throw Error('flush failed');},1);await new Promise(r=>setTimeout(r,15));assert.equal(tab.sleepTimer,null);
});
test('a sleeping tab keeps its place, id, position source and undo steps',async()=>{
  const app=await readFile('public/src/app.js','utf8');
  assert.match(app,/reader\(\)\?\.flushPosition\(\);reader\(\)\?\.stopSpeech\(\)/);
  assert.match(app,/const history=tab\.reader\.history;tab\.checkpoints\.dispose\(\);tab\.reader\.dispose\(\)/);
  assert.match(app,/tabs\.splice\(wake\?\.position\?\?tabs\.length,0,tab\)/);
  assert.match(app,/if\(wake\?\.history\)tab\.reader\.history=wake\.history/);
  assert.ok(APP_FILES.includes('src/tab-sleep.js'));
});
