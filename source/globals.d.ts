// TODO: Type anything that is of type AnyObject
type AnyObject = Record<string, any>;

declare module 'tiny-version-compare' {
	function compareVersions(versionA: string, versionB: string): number

	export = compareVersions
}

// TODO: Create types in the https://github.com/sindresorhus/linkify-urls repository.
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

// TODO: Create types in the https://github.com/sindresorhus/linkify-issues repository.
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

declare module 'intervalometer' {
	function timerIntervalometer(callback: () => void, timeInMillis: number);
}

// TODO: Type for @bfre-it's repo or convert it to TS
declare module 'shorten-repo-url' {
	function applyToLink(anchor: HTMLAnchorElement, url: string): void;
}

// TODO: Types
declare module 'type-fest' {
	type JsonObject = Record<string, any>;
}

declare module 'github-reserved-names'; // TODO: PR types to that repo or DT

// Custom UI events specific to RGH
interface GlobalEventHandlersEventMap {
	'details:toggled': UIEvent;
	'focusin': UIEvent;
}

// TODO: Add to dom-chef types
// type AllElementsTagNameMap = SVGElementTagNameMap & HTMLElementTagNameMap & {
// 	"has-rgh": any;
// };
declare namespace JSX {
	type Element = SVGElement | HTMLElement;

	// TODO: Get this working
	// interface Element extends SVGElement {}
	// interface IntrinsicElements extends AllElementsTagNameMap {
	interface IntrinsicElements {
		'include-fragment': {src: string};
		'has-rgh': {};
		'relative-time': {datetime: string; title: string};
		'details-dialog': any;
	}
}

