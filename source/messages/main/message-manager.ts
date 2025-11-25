import type {Primitive} from 'type-fest';

export type RghMessageValue =
	| Primitive
	| readonly RghMessageValue[]
	| {readonly [key: string]: RghMessageValue};

export type RghMessageEvent<T extends RghMessageValue = RghMessageValue> = CustomEvent<T>;

export type RghMessage<
	Value extends RghMessageValue = RghMessageValue,
	Target extends EventTarget = EventTarget,
> = RghMessageEvent<Value> & {target: Target};

export type RghMessageName = `rgh:${string}`;

export type RghMessageNameOut = `rgh:out:${string}`;

export type RghMessageListener = (message: RghMessage) => RghMessageValue;

export function addMessageListener(name: string, listener: RghMessageListener, target: EventTarget = document): void {
	target.addEventListener(
		`rgh:${name}` satisfies RghMessageName,
		event => {
			validateInputEvent(event);
			const output = listener(event);
			sendBack(name, output, event.target);
		});
}

function sendBack(name: string, value: RghMessageValue, target: EventTarget): void {
	const event = new CustomEvent(
		`rgh:out:${name}` satisfies RghMessageNameOut,
		{detail: value},
		// Is it possible to validate Event.type?
	) satisfies RghMessageEvent;

	target.dispatchEvent(event);
}

function validateInputEvent(event: Event): asserts event is RghMessage {
	if (!(event instanceof CustomEvent)) {
		throw new TypeError('RGH Message should be an instance of CustomEvent');
	}

	if (!event.target) {
		throw new TypeError('RGH Message should have a target');
	}
}
