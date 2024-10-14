import {serializeError, deserializeError} from 'serialize-error';
import chromeP from 'webext-polyfill-kinda'; // Sigh Firefox…

/** They must return a promise to mark the message as handled */
export type MessageHandlers = Record<string, (...arguments_: any[]) => Promise<any>>;

export function handleMessages(handlers: MessageHandlers): void {
	chrome.runtime.onMessage.addListener((message: typeof handlers, sender, sendResponse): true | void => {
		for (const id of Object.keys(message)) {
			if (id in handlers) {
				handlers[id](message[id], sender).then(sendResponse, error => {
					sendResponse({$$error: serializeError(error)});
					throw error;
				});

				// Chrome does not support returning a promise
				return true;
			}
		}
	});
}

export async function messageBackground<Return>(message: Record<string, unknown>): Promise<Return> {
	const response = await chromeP.runtime.sendMessage(message);
	if (response?.$$error) {
		throw new Error(response.$$error.message, {
			cause: deserializeError(response.$$error),
		});
	}

	return response;
}
