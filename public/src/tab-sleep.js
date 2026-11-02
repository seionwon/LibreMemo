// A hidden tab runs no code, but a long document stays in memory and every
// garbage collection in the app still walks it. Small documents stay ready.
export const TAB_SLEEP_DELAY=30000;
export const TAB_SLEEP_ELEMENTS=50000;
export function canSleep(tab){
  const reader=tab?.reader;
  if(tab?.type!=='document'||!reader?.doc||tab.opening||tab.closing||tab.closePromise||!tab.persisted)return false;
  // PDFs render on demand and script state exists only in the live page.
  if(reader.pdf||reader.runtime||reader.metadata?.execution?.allowScripts)return false;
  if(tab.queue?.error||tab.checkpoints?.error)return false;
  return reader.doc.getElementsByTagName('*').length>=TAB_SLEEP_ELEMENTS;
}
export function cancelTabSleep(tab){clearTimeout(tab.sleepTimer);tab.sleepTimer=null;}
export function scheduleTabSleep(tab,sleep,delay=TAB_SLEEP_DELAY){
  if(tab.sleepTimer||tab.type!=='document'||tab.asleep)return;
  tab.sleepTimer=setTimeout(()=>{tab.sleepTimer=null;void Promise.resolve(sleep(tab)).catch(()=>{});},delay);
}
