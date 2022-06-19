import select from 'select-dom';

type Position = 'append' | 'prepend' | 'before' | 'after';

interface Attachment<NewElement extends Element> {
	// eslint-disable-next-line @typescript-eslint/ban-types --  Allows dom traversing without requiring `!`
	anchor: Element | string | undefined | null;
	getNewElement: () => NewElement;
	className: string;
	position: Position;
	allowMissingAnchor?: boolean;
}

export default function attach<NewElement extends Element>({
	anchor,
	getNewElement,
	className,
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
