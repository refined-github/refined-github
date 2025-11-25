import type {Primitive} from 'type-fest';

import type {
	RghMessage, RghMessageEvent, RghMessageName, RghMessageNameOut,
} from '../main/message-manager.js';

export function sendMessage(messageName: string, target: EventTarget, value: Primitive): void {
	const event = new CustomEvent(
		`rgh:${messageName}` satisfies RghMessageName,
		{
			bubbles: true,
			detail: {value},
		},
	) satisfies RghMessageEvent;

	target.dispatchEvent(event);
}

export async function sendMessageAndWaitForResponse(
	messageName: string,
	target: EventTarget,
	value?: unknown,
): Promise<T | undefined> {
	return new Promise(resolve => {
		target.addEventListener(
			`rgh:out:${messageName}` satisfies RghMessageNameOut,
			event => {
				const value = (event as RghMessage<unknown>).detail as T | undefined;
				resolve(value);
			},
			{once: true},
		);

		sendMessage(messageName, target, value);
	});
}
