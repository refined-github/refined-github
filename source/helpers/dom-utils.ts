import select from 'select-dom';

import {getScopedSelector} from '../github-helpers';

/**
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
