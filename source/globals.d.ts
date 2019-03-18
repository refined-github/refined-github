// TODO: Type anything that is of type AnyObject
type AnyObject = Record<string, any> | undefined;

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

	// TODO: Get this working
	// interface Element extends SVGElement {}
	// interface IntrinsicElements extends AllElementsTagNameMap {
	interface IntrinsicElements {
		// [name: string]: any; // or full list, to test one by one
		a: any;
		link: any;
		em: any;
		strong: any;
		label: any;
		input: any;
		p: any;
		h2: any;
		h3: any;
		del: any;
		button: any;
		form: any;
		details: any;
		summary: any;
		ul: any;
		li: any;
		kbd: any;
		bdo: any;
		span: any;
		img: any;
		i: any;
		svg: any;
		div: any;
		style: any;
		path: any;
		'include-fragment': {src: string};
		'has-rgh': {};
		'relative-time': {datetime: string; title: string};
		'details-dialog': any;
	}
}

