type AnyObject = Record<string, any>;

// TODO: Waiting in lookbehind support in FireFox, https://github.com/sindresorhus/refined-github/pull/1936#discussion_r276515991
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

	export = linkifyUrls
}

// TODO: Waiting in lookbehind support in FireFox, https://github.com/sindresorhus/refined-github/pull/1936#discussion_r276515991
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

	export = linkifyIssues
}

// Custom UI events specific to RGH
interface GlobalEventHandlersEventMap {
	'details:toggled': CustomEvent;
	'focusin': UIEvent; // Drop when it reaches W3C Recommendation https://github.com/Microsoft/TSJS-lib-generator/pull/369
}

declare namespace JSX {
	interface Element extends SVGElement, HTMLElement, DocumentFragment {}
	type BaseIntrinsicElement = IntrinsicElements['div'];
	interface IntrinsicElements {
		'has-rgh': {};
		'include-fragment': BaseIntrinsicElement & {src?: string};
		'details-menu': BaseIntrinsicElement & {src: string; preload: boolean};
		'relative-time': BaseIntrinsicElement & {datetime: string; title: string};
		'details-dialog': BaseIntrinsicElement & {tabindex: string};
	}
}

// TODO: Drop when this bug fix is shipped in a version of TypeScript https://github.com/Microsoft/TypeScript/issues/30928
interface NamedNodeMap {
	[key: string]: Attr;
}
