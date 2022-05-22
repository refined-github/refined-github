/* eslint-disable @typescript-eslint/consistent-indexed-object-style */

type AnyObject = Record<string, any>;
type DeinitHandle = MutationObserver | ResizeObserver | IntersectionObserver | {destroy: VoidFunction} | {abort: VoidFunction} | VoidFunction;
type Deinit = DeinitHandle | DeinitHandle[];

type FeatureID = string & {feature: true};
interface FeatureMeta {
	id: FeatureID;
	description: string;
	screenshot?: string;
}

interface Window {
	content: GlobalFetch;
}

declare module 'markdown-wasm/dist/markdown.node.js';

declare module 'size-plugin';

declare module '*.md' { // It should be just for readme.md, but 🤷‍♂️
	export const importedFeatures: FeatureID[];
	export const featuresMeta: FeatureMeta[];
}

// Custom UI events specific to RGH
interface GlobalEventHandlersEventMap {
	'details:toggled': CustomEvent;
	'filterable:change': CustomEvent;
	'menu:activated': CustomEvent;
	'pjax:error': CustomEvent;
	'page:loaded': CustomEvent;
	'pjax:start': CustomEvent;
	'session:resume': CustomEvent;
	'socket:message': CustomEvent;
	'input': InputEvent; // Remove once no longer necessary (2022?)
}

declare namespace JSX {
	interface IntrinsicElements {
		'clipboard-copy': IntrinsicElements.button & {for?: string};
		'details-dialog': IntrinsicElements.div & {tabindex: string};
		'details-menu': IntrinsicElements.div & {src?: string; preload?: boolean};
		'has-rgh': IntrinsicElements.div;
		'has-rgh-inner': IntrinsicElements.div;
		'include-fragment': IntrinsicElements.div & {src?: string};
		'label': IntrinsicElements.label & {for?: string};
		'relative-time': IntrinsicElements.div & {datetime: string};
		'tab-container': IntrinsicElements.div;
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
