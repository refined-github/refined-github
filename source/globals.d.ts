// TODO: Type anything that is of type AnyObject
// for browser, we can cherry pick from the chrome namespace from @types/chrome
// ensuring that functions return Promises where applicable.
type AnyObject = Record<string, any>;

declare module 'select-dom' {
	import 'select-dom';

	function select<T extends HTMLElement = HTMLElement>(selector: string, parent?: string|Element|DocumentFragment): T | null;
	namespace select {
		export function exists(selector: string, parent?: Element): boolean;
		export function all<T extends HTMLElement = HTMLElement>(selector: string, parent?: Element | Element[] | NodeList | DocumentFragment): T[];
	}
	export = select;
}
