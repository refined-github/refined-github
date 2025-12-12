/* eslint-disable no-var,@typescript-eslint/triple-slash-reference -- TypeScript weirdness */

/// <reference types="@types/dom-navigation" />

declare var content: {
	fetch: GlobalFetch;
} | undefined;

// eslint-disable-next-line unicorn/prefer-global-this -- Types not available there
declare var navigation: typeof window.navigation;

type GlobalFetch = typeof fetch;
type Arrayable<X> = X | X[];
type AnyObject = Record<string, any>;
type Deinit = {disconnect: VoidFunction} | {clear: VoidFunction} | {destroy: VoidFunction} | {abort: VoidFunction} | VoidFunction;

type FeatureID = string & {feature: true};
interface FeatureMeta {
	id: FeatureID;
	description: string;
	screenshot: string | null; // eslint-disable-line @typescript-eslint/no-restricted-types -- We use `null` in the JSON file
	css?: true;
}

// These types are unnecessarily loose
// https://dom.spec.whatwg.org/#dom-node-textcontent
interface ChildNode {
	textContent: string;
}
interface Text {
	textContent: string;
}
interface Element {
	textContent: string;
}

declare module 'size-plugin';

declare module '*.gql' {
	export = string;
}

// Custom UI events specific to RGH
interface GlobalEventHandlersEventMap {
	'details:toggled': CustomEvent;
	'pjax:error': CustomEvent;
	'page:loaded': CustomEvent;
	'turbo:visit': CustomEvent;
	'session:resume': CustomEvent;
	// No input:InputEvent match
	// https://github.com/microsoft/TypeScript-DOM-lib-generator/issues/1174#issuecomment-933042088
}

declare namespace JSX {
	interface IntrinsicElements {
		'clipboard-copy': IntrinsicElements.button & {for?: string};
		'details-dialog': IntrinsicElements.div & {tabindex: string};
		'details-menu': IntrinsicElements.div & {src?: string; preload?: boolean};
		'has-rgh': IntrinsicElements.div;
		'has-rgh-inner': IntrinsicElements.div;
		'include-fragment': IntrinsicElements.div & {src?: string};
		label: IntrinsicElements.label & {for?: string};
		'relative-time': IntrinsicElements.div & {datetime: string};
		'tab-container': IntrinsicElements.div;
		'batch-deferred-content': IntrinsicElements.div;
		'time-ago': IntrinsicElements.div & {datetime: string; format?: string};
		'anchored-position': IntrinsicElements.div;
	}

	type BaseElement = IntrinsicElements['div'];
	interface IntrinsicAttributes extends BaseElement {
		width?: number;
		height?: number;
	}
}

// Drop after https://github.com/Microsoft/TypeScript/issues/30928
// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style -- Declaration merging
interface NamedNodeMap {
	[key: string]: Attr;
}

// Drop after https://github.com/Microsoft/TypeScript/issues/30928
// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style, @typescript-eslint/naming-convention -- Declaration merging
interface HTMLFormControlsCollection {
	[key: string]: HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement | HTMLSelectElement;
}

// Make `element.cloneNode()` preserve its type instead of returning Node
interface Node extends EventTarget {
	cloneNode(deep?: boolean): this;
}

interface SignalAsOptions {
	signal?: AbortSignal;
}

// TODO: Bump to v9 and drop this after
// https://github.com/sindresorhus/element-ready/issues/62
declare module 'element-ready' {
	import type {ParseSelector} from 'typed-query-selector/parser.js';

	export type Options = {
	/**
	The element that's expected to contain a match.

	@default document
	*/
		readonly target?: ParentNode;

		/**
	`AbortSignal` for stopping the search and resolving the promise to `undefined`.

	@example
	```
	import elementReady from 'element-ready';

	// 5-second delay
	const element = await elementReady('.unicorn', {signal: AbortSignal.timeout(5_000)});
	```

	@example
	```
	import elementReady from 'element-ready';

	// For additional abort conditions
	const controller = new AbortController();

	const element = await elementReady('.unicorn', {signal: AbortSignal.any([controller.signal, AbortSignal.timeout(5_000)])});
	```
	*/
		readonly signal?: AbortSignal;

		/**
	Automatically stop checking for the element to be ready after the DOM ready event. The promise is then resolved to `undefined`.

	@default true
	*/
		readonly stopOnDomReady?: boolean;

		/**
	Since the current documentâ€™s HTML is downloaded and parsed gradually, elements may appear in the DOM before _all_ of their children are â€œreadyâ€.

	By default, `element-ready` guarantees the element and all of its children have been parsed. This is useful if you want to interact with them or if you want to `.append()` something inside.

	By setting this to `false`, `element-ready` will resolve the promise as soon as it finds the requested selector, regardless of its content. This is ok if you're just checking if the element exists or if you want to read/change its attributes.

	@default true
	*/
		readonly waitForChildren?: boolean;

		/**
	A predicate function will be called for each element that matches the selector. If it returns `true`, the element will be returned.

	@default undefined

	For example, if the content is dynamic or a selector cannot be specific enough, you could check `.textContent` of each element and only match the one that has the required text.

	@example
	```html
	<ul id="country-list">
		<li>country a</li>
		...
		<li>wanted country</li>
		...
	</ul>
	```

	```
	import elementReady from 'element-ready';

	const wantedCountryElement = await elementReady('#country-list li', {
		predicate: listItemElement => listItemElement.textContent === 'wanted country'
	});
	```
	*/
		predicate?(element: HTMLElement): boolean;
	};

	/**
Detect when an element is ready in the DOM.

@param selector - [CSS selector.](https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Getting_Started/Selectors) Prefix the element type to get a better return type. For example, `button.my-btn` instead of `.my-btn`.
@returns The matching element, or `undefined` if the element could not be found.

@example
```
import elementReady from 'element-ready';

const element = await elementReady('#unicorn');

console.log(element.id);
//=> 'unicorn'
```
*/
	export default function elementReady<Selector extends string, Selected extends Element = ParseSelector<Selector, HTMLElement>>(
		selector: Selector | readonly Selector[],
		options?: Options
	): Promise<Selected | undefined>;
	export default function elementReady<Selected extends Element = HTMLElement>(
		selector: string | readonly string[],
		options?: Options
	): Promise<Selected | undefined>;

	/**
Detect when elements are ready in the DOM.

Useful for user-scripts that modify elements when they are added.

@param selector - [CSS selector.](https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Getting_Started/Selectors) Prefix the element type to get a better return type. For example, `button.my-btn` instead of `.my-btn`.
@returns An async iterable which yields with each new matching element.

@example
```
import {observeReadyElements} from 'element-ready';

for await (const element of observeReadyElements('#unicorn')) {
	console.log(element.id);
	//=> 'unicorn'

	if (element.id === 'elephant') {
		break;
	}
}
```
*/
	export function observeReadyElements<Selector extends string, Selected extends Element = ParseSelector<Selector, HTMLElement>>(
		selector: Selector | readonly Selector[],
		options?: Options
	): AsyncIterable<Selected>;
	export function observeReadyElements<Selected extends Element = HTMLElement>(
		selector: string | readonly string[],
		options?: Options
	): AsyncIterable<Selected>;
}
