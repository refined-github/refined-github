import {h} from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import domLoaded from 'dom-loaded';
import elementReady from 'element-ready';
import OptionsSync from 'webext-options-sync';

const options = new OptionsSync().getAll();

/**
 * Enable toggling each feature via options.
 * Prevent fn's errors from blocking the remaining tasks.
 * https://github.com/sindresorhus/refined-github/issues/678
 */
export const enableFeature = async (fn, filename) => {
	const {disabledFeatures, logFeatures} = await options;
	const log = logFeatures ? console.log : () => {};

	filename = filename || fn.name.replace(/_/g, '-');
	if (/^$|^anonymous$/.test(filename)) {
		console.warn('This feature is nameless', fn);
	} else {
		log('✅', filename); // Testing only
		if (disabledFeatures.includes(filename)) {
			log('↩️', 'Skipping', filename); // Testing only
			return;
		}
	}
	fn();
};

export const getUsername = onetime(() => select('meta[name="user-login"]').getAttribute('content'));

export const groupBy = (iterable, grouper) => {
	const map = {};
	for (const item of iterable) {
		const key = grouper(item);
		map[key] = map[key] || [];
		map[key].push(item);
	}
	return map;
};

/**
 * Automatically stops checking for an element to appear once the DOM is ready.
 */
export const safeElementReady = selector => {
	const waiting = elementReady(selector);

	// Don't check ad-infinitum
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

export const observeEl = (el, listener, options = {childList: true}) => {
	if (typeof el === 'string') {
		el = select(el);
	}

	if (!el) {
		return;
	}

	// Run first
	listener([]);

	// Run on updates
	const observer = new MutationObserver(listener);
	observer.observe(el, options);
	return observer;
};

// Concats arrays but does so like a zipper instead of appending them
// [[0, 1, 2], [0, 1]] => [0, 0, 1, 1, 2]
// Like lodash.zip
export const flatZip = (table, limit = Infinity) => {
	const maxColumns = Math.max(...table.map(row => row.length));
	const zipped = [];
	for (let col = 0; col < maxColumns; col++) {
		for (const row of table) {
			if (row[col]) {
				zipped.push(row[col]);
				if (zipped.length === limit) {
					return zipped;
				}
			}
		}
	}
	return zipped;
};

export const isMac = /Mac/.test(window.navigator.platform);

export const metaKey = isMac ? 'metaKey' : 'ctrlKey';

export const groupButtons = buttons => {
	// Ensure every button has this class
	for (const button of buttons) {
		button.classList.add('BtnGroup-item');
	}

	// They may already be part of a group
	let group = buttons[0].closest('.BtnGroup');

	// If it doesn't exist, wrap them in a new group
	if (!group) {
		group = <div class="BtnGroup"></div>;
		wrapAll(buttons, group);
	}

	return group;
};
