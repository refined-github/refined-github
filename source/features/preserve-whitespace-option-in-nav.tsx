/*
When navigating with next/previous in review mode, preserve whitespace option.
*/

import select from 'select-dom';
import features, {FeatureInit} from '../libs/features';

function init(): FeatureInit {
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
	include: [
		features.isRepo
	],
	load: features.onAjaxedPages,
	init
});
