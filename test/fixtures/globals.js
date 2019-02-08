import {JSDOM} from 'jsdom';

const {window} = new JSDOM('...');

// Extending global to recognize the new properties we're adding on.
declare global {
	// Disabling this rule here, because this has to match exactly like in lib.dom.d.ts for merge declaration to happen.
	// eslint-disable-next-line @typescript-eslint/no-namespace
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
