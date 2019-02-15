// TODO: Type anything that is of type AnyObject
type AnyObject = Record<string, any> | undefined;

declare module "github-reserved-names"; // TODO: PR types to that repo or DT

// TODO: PR types to that repo or DT
declare module "delegate" {
	type EventHandler = ((event: Event) => Promise<void>)| ((event: Event) => void);

	export default function delegate(selector: string, eventType: keyof GlobalEventHandlersEventMap, eventHandler: EventHandler);
}

// TODO: Add to dom-chef types
// type AllElementsTagNameMap = SVGElementTagNameMap & HTMLElementTagNameMap & {
// 	"has-rgh": any;
// };
// declare namespace JSX {
// 	interface Element { }
// 	interface IntrinsicElements extends AllElementsTagNameMap {}
// }

interface KeyboardEvent {
	// This does not appear to be a standard property.
	// It is not in lib.dom.d.ts or on MDN
	delegateTarget: EventTarget;
}
