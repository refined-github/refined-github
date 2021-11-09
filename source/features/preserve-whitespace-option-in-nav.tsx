import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	for (const a of select.all('a[data-hotkey="p"], a[data-hotkey="n"]')) {
		const linkUrl = new URLSearchParams(a.search);
		linkUrl.set('w', '1');
		a.search = String(linkUrl);
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepo,
	],
	exclude: [
		() => new URLSearchParams(location.search).get('w') !== '1',
	],
	init,
});
