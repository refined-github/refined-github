import select from 'select-dom';
import features from '../libs/features';

function init() {
	if (new URLSearchParams(location.search).get('w') !== '1') {
		return false;
	}

	for (const a of select.all<HTMLAnchorElement>('[data-hotkey="p"], [data-hotkey="n"]')) {
		const linkUrl = new URLSearchParams(a.search);
		linkUrl.set('w', '1');
		a.search = String(linkUrl);
	}
}

features.add({
	id: 'preserve-whitespace-option-in-nav',
	description: 'When navigating with next/previous in review mode, preserve whitespace option',
	include: [
		features.isRepo
	],
	load: features.onAjaxedPages,
	init
});
