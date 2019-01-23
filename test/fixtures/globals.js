import {JSDOM} from 'jsdom';

const {window} = new JSDOM('...');
global.navigator = window.navigator;
global.document = window.document;
global.location = new URL('https://github.com');
