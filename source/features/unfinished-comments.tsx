import select from 'select-dom';
import cache from 'webext-storage-cache';
import * as pageDetect from 'github-url-detection';

import features from '.';

const cacheKey = __filebasename + ':' + window.location.href;

function init(): void {
	if (document.body.dataset.visibilityListenerAdded) {
		return;
	}

	const textareas = select.all('textarea');

	document.addEventListener('visibilitychange', async () => {
		if (document.visibilityState === 'hidden') {
			if (textareas.some(textarea => (textarea.offsetWidth > 0 || textarea.offsetHeight > 0) && textarea.value.length > 0)) {
				await cache.set(cacheKey, document.title);
				document.title = '(Draft comment) ' + document.title;
			}

			return;
		}

		if (await cache.has(cacheKey)) {
			document.title = String(await cache.get(cacheKey));
			await cache.delete(cacheKey);
		}
	});
	document.body.dataset.visibilityListenerAdded = String(true);
}

void features.add(__filebasename, {
	include: [
		pageDetect.hasComments
	],
	init
});
