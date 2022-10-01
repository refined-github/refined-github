import select from 'select-dom';
import {RequireAtLeastOne} from 'type-fest';
import {isDefined} from 'ts-extras';

import hashString from './hash-string';

type Position = 'append' | 'prepend' | 'before' | 'after' | 'forEach';

// NOTE: Do not turn the Callback into an async function or else the deduplication won't work. A placeholder element MUST be returned synchronously. The deduplication logic is DOM-based.
type Attachment<NewElement extends Element, Callback = (E: Element) => NewElement> = RequireAtLeastOne<{
	className?: string;
	append: Callback;
	prepend: Callback;
	before: Callback;
	after: Callback;
	forEach: Callback;
	allowMissingAnchor?: boolean;
}, Position>;

/**
Get unique ID by using the line:column of the call (or its parents) as seed. Every call from the same place will return the same ID, as long as the index is set to the parents that matters to you.

@param ancestor Which call in the stack should be used as key. 0 means the exact line where getSnapshotUUID is called. Defaults to 1 because it's usually used inside a helper.
*/
export function getSnapshotUUID(ancestor = 1): string {
	const stack = new Error('Get stack').stack!.split('\n');
	if (stack[0] === 'Error: Get stack') {
		stack.splice(0, 1);
	}

	return hashString(stack[ancestor + 1]);
}

export default function attachElement<NewElement extends Element>(
	// eslint-disable-next-line @typescript-eslint/ban-types --  Allows dom traversing without requiring `!`
	anchor: Element | string | undefined | null,
	{
		className = 'rgh-' + getSnapshotUUID(),
		append,
		prepend,
		before,
		after,
		forEach,
		allowMissingAnchor = false,
	}: Attachment<NewElement>): NewElement[] {
	const anchorElement = typeof anchor === 'string' ? select(anchor) : anchor;
	if (!anchorElement) {
		if (allowMissingAnchor) {
			return [];
		}

		throw new Error('Element not found');
	}

	if (select.exists('.' + className, anchorElement.parentElement ?? anchorElement)) {
		return [];
	}

	const call = (position: Position, create: (anchorElement: Element) => NewElement): NewElement => {
		const element = create(anchorElement);
		element.classList.add(className);

		// Attach the created element, unless the callback already took care of that
		if (position !== 'forEach') {
			anchorElement[position](element);
		}

		return element;
	};

	return [
		append && call('append', append),
		prepend && call('prepend', prepend),
		before && call('before', before),
		after && call('after', after),
		forEach && call('forEach', forEach),
		// eslint-disable-next-line unicorn/no-array-callback-reference -- It only works this way. TS, AMIRITE?
	].filter(isDefined);
}

export function attachElements<NewElement extends Element>(anchors: string | string[], {
	className = 'rgh-' + getSnapshotUUID(),
	...options
}: Attachment<NewElement>): NewElement[] {
	return select.all(`:is(${String(anchors)}):not(.${className})`)
		.flatMap(anchor => attachElement(anchor, {...options, className}));
}
