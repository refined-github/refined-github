// TODO: Type anything that is of type AnyObject
type AnyObject = Record<string, any> | undefined;

declare module "copy-text-to-clipboard" {
	export default function copyToClipboard(data: string): void;
}

declare module "github-reserved-names"; // TODO: PR types to that repo or DT

// TODO: PR these types to the delegate repository.

declare module "delegate" {
	// Custom event types used in RGH
	type EventType = keyof GlobalEventHandlersEventMap | 'details:toggled';
}

// TODO: PR this into the delegate repo.
declare module "delegate" {
	export type EventType = keyof GlobalEventHandlersEventMap;

	export type DelegateEvent<T extends Event = Event> = T & {
		delegateTarget: EventTarget;
	}

	export type DelegateEventHandler<T extends Event> = ((event: DelegateEvent<T>) => Promise<void>)| ((event: DelegateEvent<T>) => void);
	export type DelegateSubscription = {
		destroy: VoidFunction;
	}

	/**
	 * Add event delegation with the default base (document)
	 *
	 * @param {string} selector A CSS selector
	 * @param {EventType} eventType An event type, e.g. 'click'
	 * @param {DelegateEventHandler<TEvent>} eventHandler An handler
	 * @param {boolean} [useCapture=false] whether ot not to use capture
	 *
	 * @returns {DelegateSubscription} a delegate subscription
	 */
	export default function delegate<TEvent extends Event = Event>(selector: string, eventType: EventType, eventHandler: DelegateEventHandler<TEvent>, useCapture = false): DelegateSubscription;

	/**
	 * Add event delegation with an element as base
	 *
	 * @param {TElement} element A DOM element
	 * @param {string} selector A CSS selector
	 * @param {EventType} eventType An event type, e.g. 'click'
	 * @param {DelegateEventHandler<TEvent>} eventHandler An event handler
	 * @param {boolean} [useCapture=false] whether ot not to use capture
	 *
	 * @returns {DelegateSubscription} a delegate subscription
	 */
	export default function delegate<TEvent extends Event = Event, TElement extends HTMLElement = HTMLElement>(element: TElement, selector: string, eventType: EventType, eventHandler: DelegateEventHandler<TEvent>, useCapture = false): DelegateSubscription;

	/**
	 * Add event delegation with a selector (of existing elements) as base
	 *
	 * @param {string} containerSelector A CSS selector
	 * @param {string} selector A CSS selector
	 * @param {EventType} eventType An event type, e.g. 'click'
	 * @param {DelegateEventHandler<TEvent>} eventHandler An event handler
	 * @param {boolean} [useCapture=false] whether ot not to use capture
	 *
	 * @returns {DelegateSubscription} a delegate subscription
	 */
	export default function delegate<TEvent extends Event = Event>(containerSelector: string, selector: string, eventType: EventType, eventHandler: DelegateEventHandler<TEvent>, useCapture = false): DelegateSubscription;

	/**
	 * Add event delegation with an array/array-like of elements as base
	 *
	 * @param {IterableIterator<TElements>} elements A nodelist of DOM elements
	 * @param {string} selector A CSS selector
	 * @param {EventType} eventType An event type, e.g. 'click'
	 * @param {DelegateEventHandler<TEvent>} eventHandler An event handler
	 * @param {boolean} [useCapture=false] whether ot not to use capture
	 *
	 * @returns {DelegateSubscription} a delegate subscription
	 */
	export default function delegate<TEvent extends Event = Event, TElements extends HTMLElement = HTMLElement>(elements: IterableIterator<TElements>, selector: string, eventType: EventType, eventHandler: DelegateEventHandler<TEvent>, useCapture = false): DelegateSubscription;
}

// TODO: Add to dom-chef types
// type AllElementsTagNameMap = SVGElementTagNameMap & HTMLElementTagNameMap & {
// 	"has-rgh": any;
// };
declare namespace JSX {
	type AllElementsTagNameMap = SVGElementTagNameMap & HTMLElementTagNameMap
	type All = SVGElement | HTMLElement;

	// TODO: Get this working
	//interface Element extends SVGElement {}

	interface IntrinsicElements {
		'include-fragment': any;
		'has-rgh': any;
		'relative-time': any;
	}
}

