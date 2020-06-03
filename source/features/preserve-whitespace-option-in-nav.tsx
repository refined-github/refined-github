import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	for (const a of select.all<HTMLAnchorElement>('[data-hotkey="p"], [data-hotkey="n"]')) {
		const linkUrl = new URLSearchParams(a.search);
		linkUrl.set('w', '1');
		a.search = String(linkUrl);
	}
}

void features.add({
	id: __filebasename,
	description: 'Preserves the "ignore whitespace" setting when navigating with Next/Previous in PR review mode.',
	screenshot: false
}, {
	include: [
		pageDetect.isRepo
	],
	exclude: [
		() => new URLSearchParams(location.search).get('w') !== '1'
	],
	init
});
