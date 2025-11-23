import type {RghMessageEvent} from '../messages/message-manager.js';

export function sendMessage<T>(messageName: string, target: EventTarget, value: T): void {
	const event = new CustomEvent(messageName, {bubbles: true, detail: {value}}) satisfies RghMessageEvent<T>;
	target.dispatchEvent(event);
}

export async function sendMessageAndWaitForResponse<T>(
	messageName: string,
	target: EventTarget,
	value?: unknown,
): Promise<T | undefined> {
	return new Promise(resolve => {
		target.addEventListener(`out:${messageName}`, event => {
			const value = (event as RghMessageEvent<unknown>).detail?.value as T | undefined;
			resolve(value);
		}, {once: true});

		sendMessage(messageName, target, value);
	});
}
