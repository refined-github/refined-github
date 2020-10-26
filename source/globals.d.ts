/* eslint-disable @typescript-eslint/consistent-indexed-object-style */

type AnyObject = Record<string, any>;
type AsyncVoidFunction = () => Promise<void>;

type FeatureID = 'use the __filebasename variable';

type FeatureShortcuts = Record<string, string>;
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

declare module 'size-plugin';

declare module 'deep-weak-map' {
	export default WeakMap;
}

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
	type BaseIntrinsicElement = IntrinsicElements['div'];
	type LabelIntrinsicElement = IntrinsicElements['label'];
	interface IntrinsicElements {
		'clipboard-copy': IntrinsicElements['button'] & {for?: string};
		'details-dialog': BaseIntrinsicElement & {tabindex: string};
		'details-menu': BaseIntrinsicElement & {src?: string; preload?: boolean};
		'has-rgh': BaseIntrinsicElement;
		'include-fragment': BaseIntrinsicElement & {src?: string};
		'label': LabelIntrinsicElement & {for?: string};
		'relative-time': BaseIntrinsicElement & {datetime: string};
		'time-ago': BaseIntrinsicElement & {datetime: string; format?: string};
	}

	interface IntrinsicAttributes extends BaseIntrinsicElement {
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
