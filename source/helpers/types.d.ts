/* eslint-disable @typescript-eslint/no-restricted-types -- The API does return `null`, not `undefined` */
import type {StrictlyParseSelector} from 'typed-query-selector/parser.js';

// Enables import.meta.glob: https://stackoverflow.com/q/75685623/288906
import 'vite/client';

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
