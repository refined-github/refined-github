/* eslint-disable @typescript-eslint/consistent-indexed-object-style */

type AnyObject = Record<string, any>;

type FeatureID = 'use the __filebasename variable';
interface FeatureMeta {
	id: FeatureID;
	description: string;
	screenshot?: string;
}

interface FeatureConfig {
	[id: string]: string | boolean;
}

declare const __featuresOptionDefaults__: FeatureConfig;
declare const __featuresMeta__: FeatureMeta[];
declare const __filebasename: FeatureID;

interface Window {
	content: GlobalFetch;
}

declare module 'markdown-wasm/dist/markdown.node';

declare module 'size-plugin';

declare module 'terser-webpack-plugin';

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
}

declare namespace JSX {
	interface Element extends SVGElement, HTMLElement, DocumentFragment {}
	interface IntrinsicElements {
		'clipboard-copy': IntrinsicElements.button;
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

declare module '*.svg' {
	const Icon = (): JSX.Element => JSX.Element;
	export default Icon;
}

// Make `element.cloneNode()` preserve its type instead of returning Node
interface Node extends EventTarget {
	cloneNode(deep?: boolean): this;
}
