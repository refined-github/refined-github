type AnyObject = Record<string, any>;

// TODO: Move types to tiny-version-compare repo
declare module 'tiny-version-compare' {
	function compareVersions(versionA: string, versionB: string): number

	export = compareVersions
}

// TODO: Move types to https://github.com/sindresorhus/linkify-urls repository.
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

// TODO: Move types to the https://github.com/sindresorhus/linkify-issues repository.
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

// TODO: Move types in intervalometer repo
declare module 'intervalometer' {
	function timerIntervalometer(callback: () => void, timeInMillis: number);
}

// TODO: Move to shorten-repo-url repo
declare module 'shorten-repo-url' {
	function applyToLink(anchor: HTMLAnchorElement, url: string): void;
}

// TODO: Move types to github-reserver-names repo
declare module 'github-reserved-names';

// Custom UI events specific to RGH
interface GlobalEventHandlersEventMap {
	'details:toggled': UIEvent;
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

// Fixes access to attributes via a string indexer.
interface NamedNodeMap {
	[key: string]: Attr;
}
// TODO: add support for `class` in JSX
// The following code works if it's inside the file with JSX, but here it breaks all JSX definitions.
// The `namespace JSX`  merges fine because in react's types it's `global`, but `namespace React` isn't
//
// import React from 'dom-chef';
// declare global {
// 	namespace React {
// 		interface DOMAttributes<T> {
// 			class?: string;
// 		}
// 	}
// }
