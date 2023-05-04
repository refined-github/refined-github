/* eslint-disable @typescript-eslint/consistent-type-definitions -- Declaration merging necessary */
/* eslint-disable @typescript-eslint/ban-types -- The API does return `null`, not `undefined` */
import type {StrictlyParseSelector} from 'typed-query-selector/parser.js';

declare global {
	interface ParentNode {
		querySelector<S extends string>(selector: S | readonly S[]): StrictlyParseSelector<S, HTMLElement> | null;

		querySelectorAll<S extends string>(
			selector: S | readonly S[],
		): NodeListOf<StrictlyParseSelector<S, HTMLElement>>;
	}

	interface Element {
		closest<S extends string>(selector: S | readonly S[]): StrictlyParseSelector<S, HTMLElement> | null;
		matches(selectors: string | readonly string[]): boolean;
	}

	// This cannot be a regular import because it turns `globals.d.ts` in a "module definition", which it isn't
	type Browser = import('webextension-polyfill').Browser;
	const browser: Browser;

}
