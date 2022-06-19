import select from 'select-dom';

type Position = 'append' | 'prepend' | 'before' | 'after';

interface Attachment {
	anchor: Element | string | undefined; // `undefined` allows `select(nonExistent)` without requiring `!`
	getNewElement: () => Element;
	className: string;
	position: Position;
}

export default function attach({
	anchor,
	getNewElement,
	className,
	position,
}: Attachment): void {
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
}
