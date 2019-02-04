import {JSDOM} from 'jsdom';

const {window} = new JSDOM('...');

// Extending global to recognize the new properties we're adding on.
declare global {
  namespace NodeJS {
    interface Global {
			navigator: typeof window.navigator;
			document: typeof window.document;
			location: URL;
    }
  }
}

global.navigator = window.navigator;
global.document = window.document;
global.location = new URL('https://github.com');
