// Responsive books now close their drawer on small screens. Open it through
// the visible app menu before testing a control inside it; never bypass CSS.
export async function toggleDocumentSidebarFromToolbar(page){
  const menu='.document-host:not([hidden]) [data-action="toggle-sidebar"]';
  if(await page.evaluate(`!!document.querySelector(${JSON.stringify(menu)})?.getClientRects().length`))await page.click(menu);
  else{await page.click('#toolbar [data-action=more]');await page.click('[data-more=sidebar]');}
}
export async function revealDocumentControl(page,selector){
  await page.evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
  const close=await page.evaluate(`(()=>{const f=document.querySelector('.document-host:not([hidden]) iframe.document-frame'),d=f?.contentDocument,n=d?.querySelector(${JSON.stringify(selector)}),sidebar=d?.querySelector('[data-htmlmemo-native-sidebar]');return !!n&&!n.matches('#reader-menu,[data-action=toggle-sidebar]')&&!n.closest('[data-htmlmemo-native-sidebar]')&&d.documentElement.hasAttribute('data-htmlmemo-compact-ui')&&!!sidebar?.getClientRects().length;})()`);
  // The app row stays visible even when a static document has scrolled its
  // iframe out of view. Use that real control, and wait for the drawer to close.
  if(close){await toggleDocumentSidebarFromToolbar(page);await page.waitFor(`!document.querySelector('.document-host:not([hidden]) iframe.document-frame')?.contentDocument?.querySelector('[data-htmlmemo-native-sidebar]')?.getClientRects().length`);}
  const hidden=await page.evaluate(`(()=>{const f=document.querySelector('.document-host:not([hidden]) iframe.document-frame'),n=f?.contentDocument?.querySelector(${JSON.stringify(selector)});const sidebar=n?.closest('[data-htmlmemo-native-sidebar]');return !!sidebar&&!sidebar.getClientRects().length;})()`);
  if(!await page.evaluate(`!!document.querySelector('.document-host:not([hidden]) iframe.document-frame')?.contentDocument?.querySelector(${JSON.stringify(selector)})?.closest('[data-htmlmemo-native-sidebar]')`))return;
  if(hidden)await toggleDocumentSidebarFromToolbar(page);
  try{await page.waitFor(`!!document.querySelector('.document-host:not([hidden]) iframe.document-frame')?.contentDocument?.querySelector('[data-htmlmemo-native-sidebar]')?.getClientRects().length`);}catch(error){throw Error(error.message+' '+JSON.stringify(await page.evaluate(`(()=>{const d=document.querySelector('.document-host:not([hidden]) iframe.document-frame').contentDocument,n=d.querySelector('[data-htmlmemo-native-sidebar]');return {root:d.documentElement.outerHTML.slice(0,350),body:d.body.className,sidebar:n?.outerHTML.slice(0,250),display:n&&d.defaultView.getComputedStyle(n).display};})()`)));}
  const parents=await page.evaluate(`(()=>{const d=document.querySelector('.document-host:not([hidden]) iframe.document-frame').contentDocument,n=d.querySelector(${JSON.stringify(selector)}),path=e=>e.id?'#'+CSS.escape(e.id):e.parentElement?path(e.parentElement)+' > '+e.localName+':nth-child('+([...e.parentElement.children].indexOf(e)+1)+')':e.localName,result=[];for(let g=n?.parentElement;g;g=g.parentElement)if(g.localName==='details'&&!g.open&&!g.querySelector(':scope > summary')?.contains(n))result.unshift(path(g));return result;})()`);
  for(const parent of parents){
    const point=await page.evaluate(`(async()=>{const f=document.querySelector('.document-host:not([hidden]) iframe.document-frame'),e=f.contentDocument.querySelector(${JSON.stringify(parent+' > summary')});e.scrollIntoView({block:'nearest'});await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));const b=f.getBoundingClientRect(),r=e.getBoundingClientRect(),z=b.width/f.offsetWidth;return {x:b.left+(r.left+r.width/2)*z,y:b.top+(r.top+r.height/2)*z};})()`);
    for(const type of ['mousePressed','mouseReleased'])await page.send('Input.dispatchMouseEvent',{type,...point,button:'left',clickCount:1});
    await page.waitFor(`document.querySelector('.document-host:not([hidden]) iframe.document-frame').contentDocument.querySelector(${JSON.stringify(parent)}).open`);
  }

}

export async function revealAppOutline(page,selector){
  const parents=await page.evaluate(`(()=>{const n=document.querySelector(${JSON.stringify(selector)}),parents=[];for(let p=n?.parentElement;p;p=p.parentElement)if(p.matches('details[data-outline-group]')&&!p.open&&!p.querySelector(':scope > summary')?.contains(n))parents.unshift(p.dataset.outlineGroup);return parents;})()`);
  for(const parent of parents){const group='#sidebar [data-outline-group="'+parent+'"]';await page.click(group+' > summary');await page.waitFor(`document.querySelector(${JSON.stringify(group)}).open`);}
}
