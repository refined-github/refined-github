import {elementExists} from 'select-dom';
import {RequireAtLeastOne} from 'type-fest';

import getCallerID from './caller-id.js';

type Position = 'before' | 'after';

// NOTE: Do not turn the Callback into an async function or else the deduplication won't work. A placeholder element MUST be returned synchronously. The deduplication logic is DOM-based.
type Attachment<NewElement extends Element, Callback = (E: Element) => NewElement> = RequireAtLeastOne<{
	className?: string;
	before: Callback;
	after: Callback;
}, Position>;

export default function attachElement<NewElement extends Element>(
	anchor: Element | undefined,
	{
		before,
		after,
	}: Attachment<NewElement>,
): void {
	const className = 'rgh-' + getCallerID();
	if (!anchor) {
		throw new Error('Element not found');
	}

	if (elementExists('.' + className, anchor.parentElement!)) {
		return;
	}

	if (before) {
		const element = before(anchor);
		element.classList.add(className);
		anchor.before(element);
	}

	if (after) {
		const element = after(anchor);
		element.classList.add(className);
		anchor.after(element);
	}
}
