import test from 'node:test';
import assert from 'node:assert/strict';
import {TEXT_STYLE_PRESETS,validTextStyle,validTextStyles,textLook,textLines} from '../public/src/text-style.js';
import {validateAnnotations} from '../public/src/model.js';
import {normalizePreferences} from '../public/src/preferences.js';

const base={id:'n1',color:'#e53935',width:3,opacity:1,points:[{x:0,y:0}],text:'memo'};
test('presets are valid and styles are checked strictly',()=>{
  assert.ok(TEXT_STYLE_PRESETS.length>=8);for(const p of TEXT_STYLE_PRESETS)assert.deepEqual(validTextStyle(p.style),p.style);
  assert.deepEqual(validTextStyle({size:20.4,bold:true,color:'#ABCDEF',background:null,border:'pen'}),{size:20,bold:true,color:'#abcdef',background:null,border:'pen'});
  for(const bad of [{size:9,bold:false,color:'pen'},{size:20,bold:'yes',color:'pen'},{size:20,bold:false,color:null},{size:20,bold:false,color:'red'},{size:20,bold:false,color:'pen',background:'url(x)'}])assert.equal(validTextStyle(bad),null);
  assert.deepEqual(validTextStyles([{id:'a',name:' 내 것 ',style:TEXT_STYLE_PRESETS[1].style},{id:'b',name:'',style:TEXT_STYLE_PRESETS[1].style},{id:'c',name:'x',style:{size:1}}]).map(s=>s.name),['내 것']);
});
test('memos made before styles keep their exact look; styled ones follow the style',()=>{
  assert.deepEqual(textLook({...base,type:'note'}),{size:14,weight:400,color:'#544a30',background:'#fff9df',border:'#e53935',boxed:true,pad:12,lineHeight:22,chars:24,baseline:13});
  assert.deepEqual(textLook({...base,type:'text'}),{size:18,weight:400,color:'#e53935',background:null,border:null,boxed:false,pad:0,lineHeight:22,chars:24,baseline:16});
  const board=textLook({...base,type:'text',style:TEXT_STYLE_PRESETS.find(p=>p.id==='board').style});
  assert.equal(board.background,'#263238');assert.equal(board.color,'#ffffff');assert.equal(board.boxed,true);assert.equal(board.pad,12);
  const title=textLook({...base,type:'note',style:TEXT_STYLE_PRESETS.find(p=>p.id==='title').style});
  assert.equal(title.color,'#e53935');assert.equal(title.weight,700);assert.equal(title.boxed,false);assert.ok(title.chars<24);
  assert.deepEqual(textLines('abcdef\nxy',4),['abcd','ef','xy']);
});
test('a style is kept only on memo boxes and free text, in documents and settings',()=>{
  const style=TEXT_STYLE_PRESETS[2].style;
  assert.deepEqual(validateAnnotations([{...base,type:'note',style}])[0].style,style);
  assert.throws(()=>validateAnnotations([{...base,type:'pen',style}]),/스타일/);
  assert.throws(()=>validateAnnotations([{...base,type:'note',style:{size:200,bold:false,color:'pen'}}]),/스타일/);
  const prefs=normalizePreferences({annotation:{textStyle:style,textStyles:[{id:'mine-1',name:'내 메모',style}]}});
  assert.deepEqual(prefs.annotation.textStyle,style);assert.equal(prefs.annotation.textStyles[0].name,'내 메모');
  assert.equal(normalizePreferences({annotation:{textStyle:null}}).annotation.textStyle,undefined);
  assert.throws(()=>normalizePreferences({annotation:{textStyle:{size:5}}}),/스타일/);
});
