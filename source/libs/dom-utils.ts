import select from 'select-dom';

/**
 * Append to an element, but before a element that might not exist.
 * @param  {Element|string} parent  Element (or its selector) to which append the `child`
 * @param  {string}         before  Selector of the element that `child` should be inserted before
 * @param  {Element}        child   Element to append
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
export const appendBefore = (parent: string|Element, before: string, child: Element): void => {
	if (typeof parent === 'string') {
		parent = select(parent)!;
	}

	// Select direct children only
	const beforeEl = select(`:scope > ${before}`, parent);
	if (beforeEl) {
		beforeEl.before(child);
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

export async function elementFinder<T extends HTMLElement = HTMLElement>(selector: string, frequency: number): Promise<T> {
	return new Promise(resolve => {
		(function loop() {
			const element = select<T>(selector);
			if (element) {
				resolve(element);
			} else {
				setTimeout(loop, frequency);
			}
		})();
	});
}
