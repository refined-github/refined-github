import select from 'select-dom';
import {RequireAtLeastOne} from 'type-fest';
import {isDefined, objectEntries} from 'ts-extras';

import hashString from './hash-string';

type Position = 'append' | 'prepend' | 'before' | 'after';

type Attachment<NewElement extends Element> = RequireAtLeastOne<{
	// eslint-disable-next-line @typescript-eslint/ban-types --  Allows dom traversing without requiring `!`
	anchor: Element | string | undefined | null;
	className?: string;
	append: () => NewElement;
	prepend: () => NewElement;
	before: () => NewElement;
	after: () => NewElement;
	allowMissingAnchor?: boolean;
}, Position>;

// Get a unique position in the code
function getSnapshotUUID(index = 3): string {
	return hashString(new Error('Get stack').stack!.split('\n')[index]);
}

export default function attachElement<NewElement extends Element>({
	anchor,
	className = 'rgh-' + getSnapshotUUID(),
	append,
	prepend,
	before,
	after,
	allowMissingAnchor = false,
}: Attachment<NewElement>): NewElement[] | void {
	const anchorElement = typeof anchor === 'string' ? select(anchor) : anchor;
	if (!anchorElement) {
		if (allowMissingAnchor) {
			return;
		}

		throw new Error('Element not found');
	}

	if (select.exists('.' + className, anchorElement.parentElement ?? anchorElement)) {
		return;
	}

	return objectEntries({append, prepend, before, after})
		.map(([position, getNewElement]) => {
			if (!getNewElement) {
				return;
			}

			const element = getNewElement();
			element.classList.add(className);
			anchorElement[position](element);
			return element;
		})
		// eslint-disable-next-line unicorn/no-array-callback-reference -- It only works this way. TS AMIRITE
		.filter(isDefined);
}
