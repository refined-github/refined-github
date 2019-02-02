import select from 'select-dom';
import domLoaded from 'dom-loaded';
import elementReady from 'element-ready';

/*
 * Automatically stops checking for an element to appear once the DOM is ready.
 */
export const safeElementReady = selector => {
	const waiting = elementReady(selector);

	// Don't check ad-infinitum
	// eslint-disable-next-line promise/prefer-await-to-then
	domLoaded.then(() => requestAnimationFrame(() => waiting.cancel()));

	// If cancelled, return null like a regular select() would
	return waiting.catch(() => null);
};

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
export const appendBefore = (parent, before, child) => {
	if (typeof parent === 'string') {
		parent = select(parent);
	}

	// Select direct children only
	before = select(`:scope > ${before}`, parent);
	if (before) {
		before.before(child);
	} else {
		parent.append(child);
	}
};

export const wrap = (target, wrapper) => {
	target.before(wrapper);
	wrapper.append(target);
};

export const wrapAll = (targets, wrapper) => {
	targets[0].before(wrapper);
	wrapper.append(...targets);
};
