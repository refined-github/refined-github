import select from 'select-dom';
import features from '../libs/features';
import * as pageDetect from '../libs/page-detect';

function init(): false | void {
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
	id: __featureName__,
	description: 'Preserves the "ignore whitespace" setting when navigating with Next/Previous in PR review mode.',
	screenshot: false
}, {
	include: [
		pageDetect.isRepo
	],
	init
});
