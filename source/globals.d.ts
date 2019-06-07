type AnyObject = Record<string, any>;

declare const __featuresList__: string[];

interface Window {
	collectFeatures: Map<string, FeatureDetails>;
}

// TODO: Drop after https://github.com/sindresorhus/p-memoize/issues/9
declare module 'mem' {
	function mem<T = VoidFunction>(fn: T): T;
	export = mem;
}

// TODO: Drop when Firefox adds RegEx lookbehind support
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

// TODO: Drop when Firefox adds RegEx lookbehind support
// https://github.com/sindresorhus/refined-github/pull/1936#discussion_r276515991
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
