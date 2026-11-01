import {readFile} from 'node:fs/promises';
import {IMAGE_EXTENSIONS} from '../public/src/image-formats.js';
import {subtitleFixtures} from './image-subtitle-fixtures.mjs';
// Cover every public extension, including aliases through the real duplicate
// choice. Individual format tests also validate pixels, source bytes and text.
export async function mediaFixtures(){
  const fixtures={};
  for(const extension of IMAGE_EXTENSIONS){const source={jpeg:'jpg',jpe:'jpg',jfif:'jpg'}[extension]||extension;fixtures[extension]=await readFile(new URL('fixtures/images/reading.'+source,import.meta.url));}
  for(const [extension,text] of Object.entries(subtitleFixtures))fixtures[extension]=Buffer.from(text);
  fixtures.djvu=await readFile(new URL('fixtures/djvu/bundled.djvu',import.meta.url));fixtures.djv=await readFile(new URL('fixtures/djvu/second.djv',import.meta.url));
  return fixtures;
}
