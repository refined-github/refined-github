import {$} from 'select-dom';

import onElementRemoval from './on-element-removal.js';

/**
Tracks the replacement of an element, identified via selector.

@param selector The unique selector used to find the element and its future replacements
@param callback The function to call after it's replaced
*/

export default async function onElementReplacement(
	selector: string,
	callback: (element: HTMLElement) => void,
	{runCallbackOnStart = false, signal}: {runCallbackOnStart?: boolean; signal?: AbortSignal} = {},
): Promise<void> {
	if (signal?.aborted) {
		return;
	}

	let trackedElement = $(selector);
	if (!trackedElement) {
		throw new Error('The element can’t be found');
	}

	if (runCallbackOnStart) {
		callback(trackedElement);
	}

	while (trackedElement) {
		// eslint-disable-next-line no-await-in-loop
		await onElementRemoval(trackedElement, signal);
		if (signal?.aborted) {
			return;
		}

		trackedElement = $(selector);
		if (trackedElement) {
			callback(trackedElement);
		}
	}
}
