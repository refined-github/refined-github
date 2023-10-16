/* eslint-disable @typescript-eslint/consistent-type-definitions -- Declaration merging necessary */
/* eslint-disable @typescript-eslint/consistent-indexed-object-style */

// TODO: Drop after https://github.com/sindresorhus/type-fest/issues/270
type Arrayable<X> = X | X[];
type AnyObject = Record<string, any>;
type Deinit = {disconnect: VoidFunction} | {clear: VoidFunction} | {destroy: VoidFunction} | {abort: VoidFunction} | VoidFunction;

type FeatureID = string & {feature: true};
interface FeatureMeta {
	id: FeatureID;
	description: string;
	screenshot?: string;
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

interface Window {
	content: GlobalFetch;
}

declare module 'size-plugin';

declare module '*.md' { // It should be just for readme.md, but 🤷‍♂️
	export const importedFeatures: FeatureID[];
	export const featuresMeta: FeatureMeta[];
}

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
		'label': IntrinsicElements.label & {for?: string};
		'relative-time': IntrinsicElements.div & {datetime: string};
		'tab-container': IntrinsicElements.div;
		'batch-deferred-content': IntrinsicElements.div;
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
	[key: string]: HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement | HTMLSelectElement;
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

interface SignalAsOptions {
	signal?: AbortSignal;
}
