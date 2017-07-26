import select from 'select-dom';
import elementReady from 'element-ready';
import domLoaded from 'dom-loaded';

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

	// Run first
	listener([]);

	// Run on updates
	return new MutationObserver(listener).observe(el, options);
};

// Concats arrays but does so like a zipper instead of appending them
// [[0, 1, 2], [0, 1]] => [0, 0, 1, 1, 2]
// Like lodash.zip
export const flatZip = (table) => {
	const maxColumns = Math.max(...table.map(row => row.length));
	const zipped = [];
	for (let col = 0; col < maxColumns; col++) {
		for (const row of table) {
			if (row[col]) {
				zipped.push(row[col]);
			}
		}
	}
	return zipped;
};
