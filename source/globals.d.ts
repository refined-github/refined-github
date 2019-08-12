type AnyObject = Record<string, any>;
type AsyncVoidFunction = () => Promise<void>;

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

// TODO: Drop after https://github.com/sindresorhus/p-memoize/issues/9
declare module 'mem' {
	function mem<T = VoidFunction>(fn: T, options?: AnyObject): T;
	export = mem;
}

declare module 'size-plugin';

// TODO: Drop linkify-* types when Firefox adds RegEx lookbehind support
// https://github.com/sindresorhus/refined-github/pull/1936#discussion_r276515991
declare module 'linkify-urls' {
	type Options = {
		user: string;
		repo: string;
		type: string;
		baseUrl: string;
		attributes: {
			rel: string;
			class: string;
		};
	};

	function linkifyUrls(input: string, options: Options): DocumentFragment;

	export = linkifyUrls;
}

declare module 'linkify-issues' {
	type Options = {
		user: string;
		repo: string;
		type: string;
		baseUrl: string;
		attributes: {
			rel: string;
			class: string;
		};
	};

	function linkifyIssues(input: string, options: Options): DocumentFragment;

	export = linkifyIssues;
}

// Custom UI events specific to RGH
interface GlobalEventHandlersEventMap {
	'details:toggled': CustomEvent;
	'focusin': UIEvent; // Drop when it reaches W3C Recommendation https://github.com/Microsoft/TSJS-lib-generator/pull/369
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
		'details-menu': BaseIntrinsicElement & {src: string; preload: boolean};
		'relative-time': BaseIntrinsicElement & {datetime: string; title: string};
		'details-dialog': BaseIntrinsicElement & {tabindex: string};
	}
}

// TODO: Drop when this bug is fixed
// https://github.com/Microsoft/TypeScript/issues/30928
interface NamedNodeMap {
	[key: string]: Attr;
}

// https://github.com/Microsoft/TypeScript/issues/30928
interface HTMLFormControlsCollection {
	[key: string]: HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement;
}

// TODO: Drop when this appears on npm https://github.com/microsoft/TypeScript/blob/340f81035ff1d753e6a1f0fedc2323d169c86cc6/src/lib/dom.generated.d.ts#L9686
interface KeyboardEvent {
	readonly isComposing: boolean;
}
