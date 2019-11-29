/* eslint-disable @typescript-eslint/no-explicit-any */

// TODO: Drop some definitions when their related bugs are resolved
// TODO: Improve JSX types for event listeners so we can use `MouseEvent` instead of `React.MouseEvent`, which is incompatible with regular `addEventListeners` calls

type AnyObject = Record<string, any>;
type AsyncVoidFunction = () => Promise<void>;
type Unpromise<MaybePromise> = MaybePromise extends Promise<infer Type> ? Type : MaybePromise;
type AsyncReturnType<T extends (...args: any) => any> = Unpromise<ReturnType<T>>;

interface FeatureInfo {
	name: string;
	description: string;
	screenshot?: string;
	disabled?: string;
}

declare const __featuresList__: string[];
declare const __featuresInfo__: FeatureInfo[];
declare const __featureName__: 'use the __featureName__ variable';

interface Window {
	collectFeatures: Map<string, FeatureDetails>;
	content: GlobalFetch;
}

declare module 'size-plugin';

// Custom UI events specific to RGH
interface GlobalEventHandlersEventMap {
	'details:toggled': CustomEvent;
	'rgh:view-markdown-source': CustomEvent;
	'rgh:view-markdown-rendered': CustomEvent;
	'filterable:change': CustomEvent;
}

declare namespace JSX {
	interface Element extends SVGElement, HTMLElement, DocumentFragment {}
	type BaseIntrinsicElement = IntrinsicElements['div'];
	type LabelIntrinsicElement = IntrinsicElements['label'];
	interface IntrinsicElements {
		'has-rgh': {};
		'label': LabelIntrinsicElement & {for?: string};
		'include-fragment': BaseIntrinsicElement & {src?: string};
		'details-menu': BaseIntrinsicElement & {src?: string; preload?: boolean};
		'time-ago': BaseIntrinsicElement & {datetime: string; format?: string};
		'relative-time': BaseIntrinsicElement & {datetime: string; title: string};
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
