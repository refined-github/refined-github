type AnyObject = Record<string, any>;
type AsyncVoidFunction = () => Promise<void>;
type Unpromise<MaybePromise> = MaybePromise extends Promise<infer Type> ? Type : MaybePromise;
type AsyncReturnType<T extends (...args: any) => any> = Unpromise<ReturnType<T>>;

type FeatureName = 'use the __featureName__ variable';
interface FeatureInfo { // TODO: merge with FeatureMeta
	name: string;
	description: string;
	screenshot?: string;
	disabled?: string;
}

interface FeatureConfig {
	[featureName: string]: string | boolean;
}

declare const __featuresOptionDefaults__: FeatureConfig;
declare const __featuresInfo__: FeatureInfo[];
declare const __featureName__: FeatureName;

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
	export default (): SVGElement => SVGElement;
}

interface Node extends EventTarget {
	cloneNode(deep?: boolean): this;
}

