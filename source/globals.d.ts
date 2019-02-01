type ArgumentTypes<TFunction> = TFunction extends (...args: infer TInferredArgs) => infer TInferredReturnType ? TInferredArgs : never;

type FirstArg<TFunction extends any[]> =
	TFunction extends [infer TFirstArg, ...any[]] ? TFirstArg :
		TFunction extends [] ? undefined :
			never;

type TailArgs<TFunction extends any[]> = ((...args: TFunction) => any) extends ((
	_: infer First,
	...rest: infer Rest
) => any)
	? TFunction extends any[] ? Rest : ReadonlyArray<Rest[number]>
	: [];

// TODO: Cherry pick from @types/chrome only the parts of the API used in Refined GitHub
// and ensure where necessary, functions return Promises.
declare const browser: AnyObject;

// TODO: Type anything that is of type AnyObject
// for browser, we can cherry pick from the chrome namespace from @types/chrome
// ensuring that functions return Promises where applicable.
type AnyObject = Record<string, any>;

declare module 'select-dom' {
	import 'select-dom';

	function select(selector: string, parent?: any): any | null;
	namespace select {
		export function exists(selector: string, parent?: Element): boolean;
		export function all(selector: string, parent?: Element | Element[] | NodeList | DocumentFragment): any[];
	}
	export = select;
}

declare module 'webext-options-sync' {
	export default class OptionsSync {
		getAll: <T>() => T;
	}
}

