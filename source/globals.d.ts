// TODO: Type anything that is of type AnyObject
type AnyObject = Record<string, any>;

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

