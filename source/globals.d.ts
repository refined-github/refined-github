// TODO: Type anything that is of type AnyObject
type AnyObject = Record<string, any>;

declare module 'intervalometer' {
	function timerIntervalometer(callback: () => void, timeInMillis: number);
}

// TODO: Type for @bfre-it's repo or convert it to TS
declare module 'shorten-repo-url' {
	function applyToLink(anchor: HTMLAnchorElement, url: string): void;
}

declare module 'github-reserved-names'; // TODO: PR types to that repo or DT

// Custom UI events specific to RGH
interface GlobalEventHandlersEventMap {
	'details:toggled': UIEvent;
}

// TODO: Add to dom-chef types
// type AllElementsTagNameMap = SVGElementTagNameMap & HTMLElementTagNameMap & {
// 	"has-rgh": any;
// };
declare namespace JSX {
	type AllElementsTagNameMap = SVGElementTagNameMap & HTMLElementTagNameMap
	type All = SVGElement | HTMLElement;
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

