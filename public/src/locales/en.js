// English interface text, keyed by the Korean source string. Each area keeps
// its own file so translations can be maintained independently.
import {APP} from './en/app.js';
import {SHELL} from './en/shell.js';
import {READER} from './en/reader.js';
import {DATA} from './en/data.js';
import {FORMATS} from './en/formats.js';
export const EN=Object.freeze({...FORMATS,...DATA,...READER,...SHELL,...APP});
