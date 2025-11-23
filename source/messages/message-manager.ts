export type RghMessageEvent<T> = CustomEvent<{value: T}>;

type MessageHandler = (event: RghMessageEvent<unknown>) => unknown;

export default function addMessageHandler(messageName: string, handler: MessageHandler): void {
	document.addEventListener(messageName, event => {
		if (!(event instanceof CustomEvent)) {
			throw new TypeError('Message event should be an instance of CustomEvent');
		}

		const value = handler(event);
		if (event.target) {
			sendBack(event.target, messageName, value);
		}
	});
}

function sendBack<T>(target: EventTarget, messageName: string, value: T): void {
	const event = new CustomEvent(`out:${messageName}`, {detail: {value}}) satisfies RghMessageEvent<T>;
	target.dispatchEvent(event);
}
