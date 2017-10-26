import {h} from 'dom-chef';
import select from 'select-dom';
import elementReady from 'element-ready';
import domLoaded from 'dom-loaded';

/**
 * Prevent fn's errors from blocking the remaining tasks.
 * https://github.com/sindresorhus/refined-github/issues/678
 * The code looks weird but it's synchronous and fn is called without args.
 */
export const safely = async fn => fn();

export const getUsername = () => select('meta[name="user-login"]').getAttribute('content');

export const groupBy = (array, grouper) => array.reduce((map, item) => {
	const key = grouper(item);
	map[key] = map[key] || [];
	map[key].push(item);
	return map;
}, {});

export const emptyElement = element => {
	// https://stackoverflow.com/a/3955238/288906
	while (element.firstChild) {
		element.firstChild.remove();
	}
};

/**
 * Automatically stops checking for an element to appear once the DOM is ready.
 */
export const safeElementReady = selector => {
	const waiting = elementReady(selector);
	domLoaded.then(() => requestAnimationFrame(() => waiting.cancel()));
	return waiting;
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
				if (limit !== Infinity && zipped.length === limit) {
					return zipped;
				}
			}
		}
	}
	return zipped;
};

export const groupButtons = buttons => {
	// HTMLCollections like .children require this here
	const iterable = Array.from(buttons);
	const firstButton = iterable[0];

	// They may already be part of a group
	let group = firstButton.closest('.BtnGroup');

	// If it doesn't exist, create it and wrap all the elements
	if (!group) {
		group = <div class="BtnGroup"></div>;
		$(iterable).wrapAll(group);
	}

	// Some element might still not have the right class
	for (const btn of iterable) {
		btn.classList.add('BtnGroup-item');
	}

	return group;
};
