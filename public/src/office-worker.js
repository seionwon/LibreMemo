import {renderOffice} from './office-render.js';
import {t,loadLanguage} from './i18n.js';
import {FORMATS} from './locales/en/formats.js';
// The app's own conversion messages are passed on as they are; anything else
// (a library's English internals) becomes one plain explanation.
const OWN=Object.values(FORMATS).flatMap(text=>text.split('|')).map(text=>new RegExp('^'+text.split(/\{\w+\}/).map(part=>part.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('[\\s\\S]*')+'$'));
const own=message=>/[가-힣]/.test(message)||OWN.some(pattern=>pattern.test(message));
self.onmessage=async({data})=>{
  if(data.language)await loadLanguage(data.language);
  try{self.postMessage({result:await renderOffice(data.bytes,data.format,data.title,(page,pages)=>self.postMessage({progress:{page,pages}}))});}
  catch(error){const message=String(error?.message||error);self.postMessage({error:own(message)?message:/encrypt|password/i.test(message)?t('암호가 설정된 문서는 암호 없이 저장한 사본으로 가져와 주세요.'):t('문서를 읽지 못했습니다. 파일이 손상되었거나 지원 범위를 벗어났습니다. 원래 앱에서 다시 저장한 사본을 가져와 주세요.')});}
};
