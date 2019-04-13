export type EventType = keyof GlobalEventHandlersEventMap;

export type DelegateSubscription = {
	destroy: VoidFunction;
};

export type Setup = {
	selector: string;
	type: EventType;
	useCapture?: boolean | AddEventListenerOptions;
}

export type DelegateEventHandler<TEvent extends Event = Event, TElement extends Element = Element> = (event: DelegateEvent<TEvent, TElement>) => void;

export type DelegateEvent<TEvent extends Event = Event, TElement extends Element = Element> = TEvent & {
	delegateTarget: TElement;
}
