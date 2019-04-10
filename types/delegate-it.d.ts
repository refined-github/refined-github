import { DelegateEventHandler, EventType, DelegateSubscription } from './types';
declare function delegate<TElement extends Element = Element, TEvent extends Event = Event>(selector: string, type: EventType, callback: DelegateEventHandler<TEvent, TElement>, useCapture?: boolean | AddEventListenerOptions): DelegateSubscription;
declare function delegate<TElement extends Element = Element, TEvent extends Event = Event>(elements: EventTarget | Document, selector: string, type: EventType, callback: DelegateEventHandler<TEvent, TElement>, useCapture?: boolean | AddEventListenerOptions): DelegateSubscription;
declare function delegate<TElement extends Element = Element, TEvent extends Event = Event>(elements: ArrayLike<Element> | string, selector: string, type: EventType, callback: DelegateEventHandler<TEvent, TElement>, useCapture?: boolean | AddEventListenerOptions): DelegateSubscription[];
export = delegate;
