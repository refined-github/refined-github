import select from 'select-dom';

import {getScopedSelector} from '../github-helpers';

/**
 * Append to an element, but before a element that might not exist.
 * @param  parent  Element (or its selector) to which append the `child`
 * @param  before  Selector of the element that `child` should be inserted before
 * @param  child   Element to append
 * @example
 *
 * <parent>
 *   <yes/>
 *   <oui/>
 *   <nope/>
 * </parent>
 *
 * appendBefore('parent', 'nope', <sì/>);
 *
 * <parent>
 *   <yes/>
 *   <oui/>
 *   <sì/>
 *   <nope/>
 * </parent>
 */
export const appendBefore = (parent: string | Element, before: string, child: Element): void => {
	if (typeof parent === 'string') {
		parent = select(parent)!;
	}

	// Select direct children only
	const beforeElement = select(getScopedSelector(before), parent);
	if (beforeElement) {
		beforeElement.before(child);
	} else {
		parent.append(child);
	}
};

export const wrap = (target: Element | ChildNode, wrapper: Element): void => {
	target.before(wrapper);
	wrapper.append(target);
};

export const wrapAll = (targets: Array<Element | ChildNode>, wrapper: Element): void => {
	targets[0].before(wrapper);
	wrapper.append(...targets);
};

export const isEditable = (node: unknown): boolean => {
	return node instanceof HTMLTextAreaElement ||
		node instanceof HTMLInputElement ||
		(node instanceof HTMLElement && node.isContentEditable);
};
