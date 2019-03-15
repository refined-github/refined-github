// TODO: Type anything that is of type AnyObject
type AnyObject = Record<string, any> | undefined;

declare module 'github-reserved-names'; // TODO: PR types to that repo or DT

// TODO: PR these types to the delegate repository.

declare module 'delegate-it' {
	// Custom event types used in RGH
	type EventType = keyof GlobalEventHandlersEventMap | 'details:toggled';
}

// TODO: Add to dom-chef types
// type AllElementsTagNameMap = SVGElementTagNameMap & HTMLElementTagNameMap & {
// 	"has-rgh": any;
// };
declare namespace JSX {
	type AllElementsTagNameMap = SVGElementTagNameMap & HTMLElementTagNameMap
	type All = SVGElement | HTMLElement;

	// TODO: Get this working
	// interface Element extends SVGElement {}

	interface IntrinsicElements {
		'include-fragment': any;
		'has-rgh': any;
		'relative-time': any;
	}
}

