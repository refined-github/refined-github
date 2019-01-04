import {h} from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import domLoaded from 'dom-loaded';
import elementReady from 'element-ready';
import OptionsSync from 'webext-options-sync';
import ghInjection from 'github-injection';

const options = new OptionsSync().getAll();

/*
 *`github-injection` happens even when the user navigates in history
 * This causes listeners to run on content that has already been updated.
 * If a feature needs to be disabled when navigating away,
 * use the regular `github-injection`
 */
export function safeOnAjaxedPages(callback) {
	ghInjection(() => {
		if (!select.exists('has-rgh')) {
			callback();
		}
	});
}

/*
 * Enable toggling each feature via options.
 * Prevent fn's errors from blocking the remaining tasks.
 * https://github.com/sindresorhus/refined-github/issues/678
 */
export const enableFeature = async fn => {
	const {disabledFeatures = '', logging = false} = await options;
	const log = logging ? console.log : () => {};

	const filename = fn.name.replace(/_/g, '-');
	if (/^$|^anonymous$/.test(filename)) {
		console.warn('This feature is nameless', fn);
	} else if (disabledFeatures.includes(filename)) {
		log('↩️', 'Skipping', filename);
		return;
	}
	try {
		await fn();
		log('✅', filename);
	} catch (error) {
		console.log('❌', filename);
		console.error(error);
	}
};

export const isFeatureEnabled = async featureName => {
	const {disabledFeatures = ''} = await options;
	return disabledFeatures.includes(featureName);
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

/*
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

export const anySelector = selector => {
	const prefix = document.head.style.MozOrient === '' ? 'moz' : 'webkit';
	return selector.replace(/:any\(/g, `:-${prefix}-any(`);
};

export const injectCustomCSS = async () => {
	const {customCSS = ''} = await options;

	if (customCSS.length > 0) {
		document.head.append(<style>{customCSS}</style>);
	}
};

export const escapeForGql = string => '_' + string.replace(/[./-]/g, '_');
