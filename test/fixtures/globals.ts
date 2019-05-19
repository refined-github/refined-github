import {JSDOM} from 'jsdom';

const {window} = new JSDOM('...');

(global as any).navigator = window.navigator;
(global as any).document = window.document;
(global as any).location = new URL('https://github.com');
