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
