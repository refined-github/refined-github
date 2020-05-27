import {JSDOM} from 'jsdom';

const {window} = new JSDOM('…');

(global as any).navigator = window.navigator;
(global as any).document = window.document;
(global as any).location = new URL('https://github.com');
(global as any).HTMLAnchorElement = window.HTMLAnchorElement;
(global as any).Location = window.Location;

document.head.insertAdjacentHTML('beforeend', '<link href="https://github.com/avajs/ava/commits/master.atom" rel="alternate" title="Recent Commits to ava:master" type="application/atom+xml">');
