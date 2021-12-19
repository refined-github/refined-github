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
