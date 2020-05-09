import select from 'select-dom';

import onElementRemoval from './on-element-removal';

/**
Tracks the replacement of an element, identified via selector.

@param selector The unique selector used to find the element and its future replacements
@param callback The function to call after it's replaced
*/

export default async function onReplacedElement(selector: string, callback: VoidCallback): Promise<void> {
	let trackedElement = select(selector);
	if (!trackedElement) {
		throw new Error('The element can’t be found');
	}

	while (trackedElement) {
		// eslint-disable-next-line no-await-in-loop
		await onElementRemoval(trackedElement);
		trackedElement = select(selector);
		if (trackedElement) {
			callback();
		}
	}
}
