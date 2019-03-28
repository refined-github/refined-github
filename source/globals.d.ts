// TODO: Type anything that is of type AnyObject
type AnyObject = Record<string, any>;

declare module 'github-reserved-names'; // TODO: PR types to that repo or DT

// TODO: This actually causes more errors than it solves
// declare module 'delegate-it' {
// 	// Custom event types used in RGH
// 	type EventType = keyof GlobalEventHandlersEventMap | 'details:toggled';
// }

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

