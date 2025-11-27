import type {
	RghMessage, RghMessageEvent, RghMessageName, RghMessageNameOut, RghMessageValue,
} from '../main/message-manager.js';

export function sendMessage(messageName: string, target: EventTarget, value: RghMessageValue): void {
	const event = new CustomEvent(
		`rgh:${messageName}` satisfies RghMessageName,
		{
			bubbles: true,
			detail: {value},
		},
	) satisfies RghMessageEvent;

	target.dispatchEvent(event);
}

export async function sendMessageAndWaitForResponse<ExpectedResponse extends RghMessageValue>(
	messageName: string,
	target: EventTarget,
	value?: RghMessageValue,
): Promise<ExpectedResponse> {
	return new Promise(resolve => {
		target.addEventListener(
			`rgh:out:${messageName}` satisfies RghMessageNameOut,
			event => {
				resolve((event as RghMessage<ExpectedResponse>).detail);
			},
			{once: true},
		);

		sendMessage(messageName, target, value);
	});
}
