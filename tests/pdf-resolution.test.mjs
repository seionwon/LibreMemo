import test from 'node:test';
import assert from 'node:assert/strict';
import * as rendering from '../public/src/pdf/page-rendering.js';
import {PdfReader} from '../public/src/pdf-reader.js';
import {documentFor} from './dom.mjs';

function rasterFixture(t,{holdDetail=false}={}){
  const previous=globalThis.window;globalThis.window={devicePixelRatio:3};t.after(()=>{globalThis.window=previous;});
  const doc=documentFor('<html><head></head><body><section><div></div></section></body></html>'),create=doc.createElement.bind(doc),renders=[];let release,held=false;
  const gate=new Promise(resolve=>release=resolve);
  doc.createElement=name=>{const node=create(name);if(name==='canvas'){node.getContext=()=>({canvas:node});node.toBlob=done=>done(new Blob(['raster'],{type:'image/png'}));}return node;};
  const page={getViewport:({scale})=>({width:600*scale,height:800*scale}),render(options){renders.push({width:options.canvasContext.canvas.width,height:options.canvasContext.canvas.height,transform:options.transform});return {promise:holdDetail&&!held&&options.transform[0]>1.1?(held=true,gate):Promise.resolve(),cancel(){release();}};}};
  return {doc,renders,pdf:{getPage:async()=>page},release,isHeld:()=>held};
}
async function settle(predicate){for(let i=0;i<100;i++){if(predicate())return;await new Promise(resolve=>setImmediate(resolve));}throw Error('PDF rendering did not settle');}

test('PDF raster uses the real three-pixel display density without a two-pixel cap',async t=>{
  const fixture=rasterFixture(t),image=new rendering.PdfPageImage(fixture.doc.querySelector('div'));
  await rendering.renderPdfPageImage({doc:fixture.pdf,pageNumber:1,width:600,sliceTop:0,sliceBottom:1,rasterZoom:1,maxPixels:16*1024*1024,priority:()=>0,signal:new AbortController().signal,image,renderOptions:()=>({}),waitForIdle:async()=>{},onSize:()=>{}});
  assert.equal(fixture.renders.at(-1).width,1800);assert.equal(fixture.renders.at(-1).height,2400);image.dispose();
});

test('PDF completes a newer zoom request even when the previous raster is still painting',async t=>{
  const fixture=rasterFixture(t,{holdDetail:true}),slot={page:1,node:fixture.doc.querySelector('section'),inner:fixture.doc.querySelector('div'),controller:new AbortController()};slot.image=new rendering.PdfPageImage(slot.inner);
  const pdf=Object.create(PdfReader.prototype);Object.assign(pdf,{doc:fixture.doc,pdf:fixture.pdf,pdfjs:{AnnotationMode:{ENABLE:1}},scale:1,slots:new Map([[1,slot]]),reader:{zoom:1,callbacks:{onError:error=>{throw error;}}},size:()=>({width:600,height:800}),pageAt:()=>1,pixelRatio:()=>3,visibleRegion:()=>({left:0,top:0,width:300,height:400,rasterZoom:pdf.reader.zoom,visible:{left:0,top:0,width:300,height:400}})});
  let schedules=0;pdf.schedule=()=>{schedules++;if(schedules>6)throw Error('PDF raster refresh loop');queueMicrotask(()=>pdf.renderPage(slot));};
  pdf.renderPage(slot);await settle(fixture.isHeld);pdf.reader.zoom=2;pdf.renderPage(slot);fixture.release();
  await settle(()=>!slot.painting&&!slot.detailPainting);
  assert.ok(fixture.renders.some(render=>render.transform[0]>=6),'the latest zoom must reach the display pixel density without requiring another scroll');
  slot.controller.abort();slot.image.dispose();slot.detail?.dispose();
});

test('PDF crops the visible rectangle in both directions without shifting its page coordinates',async t=>{
  const fixture=rasterFixture(t),image=new rendering.PdfPageImage(fixture.doc.querySelector('div'));
  await rendering.renderPdfPageImage({doc:fixture.pdf,pageNumber:1,width:600,sliceLeft:.25,sliceRight:.75,sliceTop:.25,sliceBottom:.75,rasterZoom:1,pixelRatio:3,maxPixels:rendering.PDF_DETAIL_PIXELS,preview:false,priority:()=>0,signal:new AbortController().signal,image,renderOptions:()=>({}),waitForIdle:async()=>{},onSize:()=>{}});
  assert.equal(fixture.renders.length,1);assert.deepEqual(fixture.renders[0],{width:900,height:1200,transform:[3,0,0,3,-450,-600]});
  assert.deepEqual(image.raster,{left:150,top:200,width:300,height:400,pixelWidth:900,pixelHeight:1200});image.dispose();
});

test('PDF viewport crops keep 800% and a three-pixel display sharp within a bounded bitmap',()=>{
  const size={width:600,height:800},region=rendering.pdfVisibleRasterRegion({left:-1200,top:-2400,width:4800,height:6400},{left:0,top:0,width:1280,height:900},size);
  assert.deepEqual(region.visible,{left:150,top:300,width:160,height:112.5});assert.equal(region.rasterZoom,8);
  const density=rendering.pdfRasterDensity(region.width,region.height,region.rasterZoom,3,rendering.PDF_DETAIL_PIXELS);
  assert.equal(density,24);assert.ok(region.width*region.height*density*density<=rendering.PDF_DETAIL_PIXELS);
  assert.ok(region.width<size.width&&region.height<size.height);
  assert.equal(rendering.pdfVisibleRasterRegion({left:1300,top:0,width:600,height:800},{left:0,top:0,width:1280,height:900},size),null);
});

test('PDF reuses overscan while it covers the visible text, but refreshes uncovered or undersampled pixels',()=>{
  const raster={left:10,top:20,width:300,height:400,pixelWidth:900,pixelHeight:1200},region={visible:{left:30,top:60,width:240,height:300}};
  assert.ok(rendering.pdfRasterCovers(raster,region,3));assert.equal(rendering.pdfRasterCovers(raster,region,4),false);
  assert.equal(rendering.pdfRasterCovers(raster,{visible:{left:30,top:60,width:300,height:300}},3),false);
  const density=rendering.pdfRasterDensity(1000000,1,8,4,rendering.PDF_DETAIL_PIXELS);assert.ok(1000000*density<=8192);
});

test('decoded PDF detail releases the scratch canvas while keeping exact raster coordinates and quality',()=>{
  const doc=documentFor('<html><body><div></div></body></html>'),create=doc.createElement.bind(doc),images=[];
  doc.createElement=name=>{const node=create(name);if(name==='img')images.push(node);return node;};
  const canvas=create('canvas');canvas.width=900;canvas.height=1200;canvas.toBlob=done=>done(new Blob(['detail']));
  const image=new rendering.PdfPageImage(doc.querySelector('div'),{retainCanvas:false});image.publish(canvas,300,400,{left:150,top:200});images[0].onload();
  assert.equal(image.canvas,null);assert.equal(canvas.width,0);assert.equal(image.image.style.left,'150px');assert.equal(image.image.style.top,'200px');assert.equal(image.raster.pixelWidth,900);image.dispose();
});

test('PDF refresh uses the visible app frame and coalesces updates even if the source frame is throttled',async()=>{
  const pending=[],pdf=Object.create(PdfReader.prototype);let updates=0;
  pdf.appWindow={requestAnimationFrame:callback=>(pending.push(callback),pending.length)};
  pdf.doc={defaultView:{requestAnimationFrame(){throw Error('source iframe frame was throttled');}}};pdf.updateVisible=async()=>updates++;
  pdf.schedule();pdf.schedule();assert.equal(pending.length,1);pending[0]();await Promise.resolve();assert.equal(updates,1);assert.equal(pdf.frame,null);
});

test('PDF catches a silent display-density change once and skips hidden or disposed readers',()=>{
  const pdf=Object.create(PdfReader.prototype);let ratio=2,refreshes=0;
  Object.assign(pdf,{watchedPixelRatio:2,reader:{host:{hidden:false}},appWindow:{document:{hidden:false}},pixelRatio:()=>ratio,onResolutionChange(){refreshes++;this.watchedPixelRatio=ratio;}});
  pdf.checkPixelRatio();assert.equal(refreshes,0);ratio=3;pdf.checkPixelRatio();pdf.checkPixelRatio();assert.equal(refreshes,1);
  pdf.reader.host.hidden=true;ratio=4;pdf.checkPixelRatio();assert.equal(refreshes,1);
  pdf.reader.host.hidden=false;pdf.appWindow.document.hidden=true;pdf.checkPixelRatio();assert.equal(refreshes,1);
  pdf.appWindow.document.hidden=false;pdf.checkPixelRatio();assert.equal(refreshes,2);pdf.disposed=true;ratio=2;pdf.checkPixelRatio();assert.equal(refreshes,2);
});
