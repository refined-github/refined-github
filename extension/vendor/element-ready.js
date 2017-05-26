// https://github.com/sindresorhus/element-ready/blob/master/index.js 1.0.0
'use strict';

const selectorCache = new Map();

window.elementReady = selector => {
	if (selectorCache.has(selector)) {
		return selectorCache.get(selector);
	}

	const promise = new Promise(resolve => {
		const el = document.querySelector(selector);

		// Shortcut if the element already exists
		if (el) {
			resolve(el);
			selectorCache.delete(selector);
			return;
		}

		// Interval to keep checking for it to come into the DOM
		const awaitElement = setInterval(() => {
			const el = document.querySelector(selector);

			if (el) {
				resolve(el);
				clearInterval(awaitElement);
				selectorCache.delete(selector);
			}
		}, 50);
	});

	selectorCache.set(selector, promise);

	return promise;
};
