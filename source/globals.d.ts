// eslint-disable-next-line no-unused-vars
declare const browser: AnyObject;

type AnyObject = {[key: string]: any};

declare module 'select-dom' {
	import 'select-dom';

	function select(selector: string, parent?: any): any | null;
	namespace select {
		export function exists(selector: string, parent?: Element): boolean;
		export function all(selector: string, parent?: Element | Element[] | NodeList | DocumentFragment): any[];
	}
	export = select;
}
