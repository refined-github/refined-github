import jsdom from 'jsdom';

const {JSDOM} = jsdom;

const {window} = new JSDOM('…');

(global as any).navigator = window.navigator;
(global as any).document = window.document;
(global as any).location = new URL('https://github.com');
(global as any).HTMLAnchorElement = window.HTMLAnchorElement;
(global as any).DocumentFragment = window.DocumentFragment;
(global as any).NodeFilter = window.NodeFilter;
(global as any).Node = window.Node;
(global as any).Location = window.Location;

// Use JSDOM’s implementation because Node’s uses `pathname`’s accessors while the browser doesn’t
(global as any).URL = window.URL;

document.head.insertAdjacentHTML('beforeend', '<link href="https://github.com/avajs/ava/commits/master.atom" rel="alternate" title="Recent Commits to ava:master" type="application/atom+xml">');
