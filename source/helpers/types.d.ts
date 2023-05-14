/* eslint-disable @typescript-eslint/consistent-type-definitions -- Declaration merging necessary */
/* eslint-disable @typescript-eslint/ban-types -- The API does return `null`, not `undefined` */
import type {StrictlyParseSelector} from 'typed-query-selector/parser.js';
import 'webextension-polyfill-global';

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
}
