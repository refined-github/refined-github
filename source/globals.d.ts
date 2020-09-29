type AnyObject = Record<string, any>;
type AsyncVoidFunction = () => Promise<void>;

type FeatureID = 'use the __filebasename variable';

type FeatureShortcuts = Record<string, string>;
interface FeatureMeta {
	/**
	If it's disabled, this should be the issue that explains why, as a reference
	@example '#123'
	*/
	disabled?: string;
	id: FeatureID;
	description: string;
	screenshot: string | false;
	shortcuts?: FeatureShortcuts;
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
	'pjax:error': CustomEvent;
	'menu:activated': CustomEvent;
	'details:toggled': CustomEvent;
	'rgh:view-markdown-source': CustomEvent;
	'rgh:view-markdown-rendered': CustomEvent;
	'filterable:change': CustomEvent;
	'page:loaded': CustomEvent;
	'pjax:start': CustomEvent;
}

declare namespace JSX {
	interface Element extends SVGElement, HTMLElement, DocumentFragment {}
	type BaseIntrinsicElement = IntrinsicElements['div'];
	type LabelIntrinsicElement = IntrinsicElements['label'];
	interface IntrinsicElements {
		'has-rgh': BaseIntrinsicElement;
		'label': LabelIntrinsicElement & {for?: string};
		'include-fragment': BaseIntrinsicElement & {src?: string};
		'details-menu': BaseIntrinsicElement & {src?: string; preload?: boolean};
		'time-ago': BaseIntrinsicElement & {datetime: string; format?: string};
		'relative-time': BaseIntrinsicElement & {datetime: string};
		'details-dialog': BaseIntrinsicElement & {tabindex: string};
		'clipboard-copy': IntrinsicElements['button'] & {for?: string};
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
	// Not equivalent
	// eslint-disable-next-line @typescript-eslint/method-signature-style
	cloneNode(deep?: boolean): this;
}
