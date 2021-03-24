import select from 'select-dom';
import pushForm from 'push-form';

// `content.fetch` is Firefox’s way to make fetches from the page instead of from a different context
// This will set the correct `origin` header without having to use XMLHttpRequest
// https://stackoverflow.com/questions/47356375/firefox-fetch-api-how-to-omit-the-origin-header-in-the-request
// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts#XHR_and_Fetch
pushForm.fetch = window.content?.fetch ?? window.fetch;

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
	const beforeElement = select(`:scope > :is(${before})`, parent);
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

export const removeClassFromAll = (className: string): void => {
	for (const element of select.all('.' + className)) {
		element.classList.remove(className);
	}
};

export const frame = async (): Promise<number> => new Promise(resolve => {
	requestAnimationFrame(resolve);
});
