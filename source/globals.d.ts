declare const browser: AnyObject;

type AnyObject = { [key: string]: any };

declare module 'select-dom' {
	import 'select-dom';

	function select(selector: string, parent?: any): Element | null;
	namespace select {
		export function exists(selector: string, parent?: Element): boolean;
		export function all(
			selector: string,
			parent?: Element | Element[] | NodeList | DocumentFragment
		): Element[];
	}
	export = select;
}

declare module 'webext-options-sync' {
	export default class OptionsSync {
		getAll<TValue = object>(): Promise<TValue>
	}
}
