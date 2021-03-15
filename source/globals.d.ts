/* eslint-disable @typescript-eslint/consistent-indexed-object-style */

type AnyObject = Record<string, any>;

type FeatureID = 'use the __filebasename variable';
interface FeatureMeta {
	id: FeatureID;
	description: string;
	screenshot?: string;
}

declare const __features__: FeatureID[];
declare const __featuresMeta__: FeatureMeta[];
declare const __filebasename: FeatureID;

interface Window {
	content: GlobalFetch;
}

declare module 'markdown-wasm/dist/markdown.node.js';

declare module 'size-plugin';

// Custom UI events specific to RGH
interface GlobalEventHandlersEventMap {
	'details:toggled': CustomEvent;
	'filterable:change': CustomEvent;
	'menu:activated': CustomEvent;
	'rgh:view-markdown-rendered': CustomEvent;
	'rgh:view-markdown-source': CustomEvent;
	'pjax:error': CustomEvent;
	'page:loaded': CustomEvent;
	'pjax:start': CustomEvent;
	'session:resume': CustomEvent;
}

declare namespace JSX {
	interface Element extends SVGElement, HTMLElement, DocumentFragment {}
	interface IntrinsicElements {
		'clipboard-copy': IntrinsicElements.button & {for?: string};
		'details-dialog': IntrinsicElements.div & {tabindex: string};
		'details-menu': IntrinsicElements.div & {src?: string; preload?: boolean};
		'has-rgh': IntrinsicElements.div;
		'include-fragment': IntrinsicElements.div & {src?: string};
		'label': IntrinsicElements.label & {for?: string};
		'relative-time': IntrinsicElements.div & {datetime: string};
		'time-ago': IntrinsicElements.div & {datetime: string; format?: string};
	}

	type BaseElement = IntrinsicElements['div'];
	interface IntrinsicAttributes extends BaseElement {
		width?: number;
		height?: number;
	}
}

// Drop after https://github.com/Microsoft/TypeScript/issues/30928
interface NamedNodeMap {
	[key: string]: Attr;
}

// Drop after https://github.com/Microsoft/TypeScript/issues/30928
interface HTMLFormControlsCollection {
	[key: string]: HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement;
}

declare module 'react' {
	const FC = (): JSX.Element => JSX.Element;
	const React = {FC};
	export default React;
}

// Make `element.cloneNode()` preserve its type instead of returning Node
interface Node extends EventTarget {
	cloneNode(deep?: boolean): this;
}
