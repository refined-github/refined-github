import select from 'select-dom';

type Position = 'append' | 'prepend' | 'before' | 'after';

interface Attachment<NewElement extends Element> {
	anchor: Element | string | undefined; // `undefined` allows `select(nonExistent)` without requiring `!`
	getNewElement: () => NewElement;
	className: string;
	position: Position;
}

export default function attach<NewElement extends Element>({
	anchor,
	getNewElement,
	className,
	position,
}: Attachment<NewElement>): NewElement | void {
	anchor = typeof anchor === 'string' ? select(anchor) : anchor;
	if (!anchor) {
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
