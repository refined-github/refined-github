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

declare module 'webext-options-sync' {
	interface DefineOptions {
		defaults: {
			disabledFeatures: string;
			customCSS: string;
			personalToken: string;
			logging: boolean;
		};
		migrations: [(options: {disabledFeatures: string}) => void, () => void];
	}

	export default class OptionsSync {
		static migrations: {
			removeUnused: () => void;
		}

		getAll: <T>() => T;

		syncForm: (selector: string) => void;

		define: (options: DefineOptions) => void;
	}
}

declare module 'webext-domain-permission-toggle' {
	export function addContextMenu(): void;
}

declare module 'webext-dynamic-content-scripts' {
	export function addToFutureTabs(): void;
}
