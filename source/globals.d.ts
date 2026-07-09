/* eslint-disable @typescript-eslint/consistent-type-definitions -- Declaration merging */

declare module '*.svelte';
declare module '*.css';
declare module '*.gql' {
	export = string;
}

type AnyObject = Record<string, any>;
type FeatureId = string & {feature: true};
interface FeatureMeta {
	id: FeatureId;
	description: string;
	screenshot: string | null; // eslint-disable-line @typescript-eslint/no-restricted-types -- We use `null` in the JSON file
	css?: true;
	cssOnly?: true;
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

// Custom UI events specific to GitHub
interface GlobalEventHandlersEventMap {
	'pjax:error': CustomEvent;
	'page:loaded': CustomEvent;
	'turbo:visit': CustomEvent;
}

declare namespace JSX {
	interface IntrinsicElements {
		'anchored-position': IntrinsicElements.div;
		'batch-deferred-content': IntrinsicElements.div;
		'details-menu': IntrinsicElements.div & {src?: string; preload?: boolean};
		'feature-item': IntrinsicElements.HTMLElement & {id: string; 'data-text': string};
		'has-rgh-inner': IntrinsicElements.div;
		'has-rgh': IntrinsicElements.div;
		'include-fragment': IntrinsicElements.div & {src?: string};
		'relative-time': IntrinsicElements.div & {datetime: string};
		'segmented-control': IntrinsicElements.HTMLElement;
		'time-ago': IntrinsicElements.div & {datetime: string; format?: string};
		'tool-tip': IntrinsicElements.HTMLElement & {for?: string};
		label: IntrinsicElements.label & {for?: string};
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
