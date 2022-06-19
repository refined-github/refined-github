import select from 'select-dom';

import hashString from './hash-string';

type Position = 'append' | 'prepend' | 'before' | 'after';

interface Attachment<NewElement extends Element> {
	// eslint-disable-next-line @typescript-eslint/ban-types --  Allows dom traversing without requiring `!`
	anchor: Element | string | undefined | null;
	getNewElement: () => NewElement;
	className?: string;
	position: Position;
	allowMissingAnchor?: boolean;
}

// Get a unique position in the code
function getSnapshotUUID(index = 3): string {
	return hashString(new Error('Get stack').stack!.split('\n')[index]);
}

export default function attach<NewElement extends Element>({
	anchor,
	getNewElement,
	className = 'rgh-' + getSnapshotUUID(),
	position,
	allowMissingAnchor = false,
}: Attachment<NewElement>): NewElement | void {
	anchor = typeof anchor === 'string' ? select(anchor) : anchor;
	if (!anchor) {
		if (allowMissingAnchor) {
			return;
		}

		throw new Error('Element not found');
	}

	if (select.exists('.' + className, anchor.parentElement ?? anchor)) {
		return;
	}

	const ship = getNewElement();
	ship.classList.add(className);
	anchor[position](ship);
	return ship;
}
