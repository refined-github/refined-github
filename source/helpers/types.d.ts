/* eslint-disable @typescript-eslint/consistent-type-definitions -- Declaration merging necessary */
/* eslint-disable @typescript-eslint/ban-types -- The API does return `null`, not `undefined` */
import type {ParseSelector} from 'typed-query-selector/parser';

declare global {
	interface ParentNode {
		querySelector<S extends string>(selector: S): ParseSelector<S, HTMLElement> | null;

		querySelectorAll<S extends string>(
			selector: S,
		): NodeListOf<ParseSelector<S, HTMLElement>>;
	}

	interface Element {
		closest<S extends string>(selector: S): ParseSelector<S, HTMLElement> | null;
	}
}
