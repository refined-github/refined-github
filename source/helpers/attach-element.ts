import select from 'select-dom';
import {RequireAtLeastOne} from 'type-fest';
import {isDefined} from 'ts-extras';

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

type Attachments<NewElement extends Element> = Attachment<NewElement> & {
	anchor: string;
};

/**
Get unique ID by using the line:column of the call (or its parents) as seed. Every call from the same place will return the same ID, as long as the index is set to the parents that matters to you.

@param index The line of the Error#stack generated inside this function
*/
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

	const call = (position: Position, create: () => NewElement): NewElement => {
		const element = create();
		element.classList.add(className);
		anchorElement[position](element);
		return element;
	};

	return [
		append && call('append', append),
		prepend && call('prepend', prepend),
		before && call('before', before),
		after && call('after', after),
		// eslint-disable-next-line unicorn/no-array-callback-reference -- It only works this way. TS AMIRITE
	].filter(isDefined);
}

export function attachElements<NewElement extends Element>({
	anchor: anchors,
	className = 'rgh-' + getSnapshotUUID(),
	...options
}: Attachments<NewElement>): NewElement[] {
	return select.all(`:is(${anchors}):not(.${className})`)
		.flatMap(anchor => attachElement({...options, anchor, className}));
}
