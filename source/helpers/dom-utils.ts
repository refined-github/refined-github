import {$} from 'select-dom';
import {setFetch} from 'push-form';
// Nodes may be exactly `null`
import {type Nullable} from 'vitest';

// `content.fetch` is Firefox’s way to make fetches from the page instead of from a different context
// This will set the correct `origin` header without having to use XMLHttpRequest
// https://stackoverflow.com/questions/47356375/firefox-fetch-api-how-to-omit-the-origin-header-in-the-request
// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts#XHR_and_Fetch
if (window.content?.fetch) {
	setFetch(window.content.fetch);
}

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
		parent = $(parent)!;
	}

	// Select direct children only
	const beforeElement = $(`:scope > :is(${before})`, parent);
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

export const wrapAll = <Wrapper extends Element>(targets: Iterable<Element | ChildNode>, wrapper: Wrapper): Wrapper => {
	const [first, ...rest] = targets;
	first.before(wrapper);
	wrapper.append(first, ...rest);
	return wrapper;
};

export const isEditable = (node: unknown): boolean => node instanceof HTMLTextAreaElement
		|| node instanceof HTMLInputElement
		|| (node instanceof HTMLElement && node.isContentEditable);

export const frame = async (): Promise<number> => new Promise(resolve => {
	requestAnimationFrame(resolve);
});

export const highlightTab = (tabElement: Element): void => {
	tabElement.classList.add('selected');
	tabElement.setAttribute('aria-current', 'page');
};

export const unhighlightTab = (tabElement: Element): void => {
	tabElement.classList.remove('selected');
	tabElement.removeAttribute('aria-current');
};

const matchString = (matcher: RegExp | string, string: string): boolean =>
	typeof matcher === 'string' ? matcher === string : matcher.test(string);

const escapeMatcher = (matcher: RegExp | string): string =>
	typeof matcher === 'string' ? `"${matcher}"` : String(matcher);

const isTextNode = (node: Text | ChildNode): boolean =>
	node instanceof Text || ([...node.childNodes].every(childNode => childNode instanceof Text));

export const isTextNodeContaining = (node: Nullable<Text | ChildNode>, expectation: RegExp | string): boolean => {
	// Make sure only text is being considered, not links, icons, etc
	if (!node || !isTextNode(node)) {
		console.warn('TypeError', node);
		throw new TypeError(`Expected Text node, received ${String(node?.nodeName)}`);
	}

	const content = node.textContent.trim();
	return matchString(expectation, content);
};

export const assertNodeContent = <N extends Text | ChildNode>(node: Nullable<N>, expectation: RegExp | string): N => {
	if (isTextNodeContaining(node, expectation)) {
		return node!;
	}

	console.warn('Error', node!.parentElement);
	const content = node!.textContent.trim();
	throw new Error(`Expected node matching ${escapeMatcher(expectation)}, found ${escapeMatcher(content)}`);
};

export const removeTextNodeContaining = (node: Text | ChildNode, expectation: RegExp | string): void => {
	assertNodeContent(node, expectation);
	node.remove();
};
