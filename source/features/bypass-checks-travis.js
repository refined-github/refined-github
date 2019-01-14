import select from 'select-dom';
import domify from '../libs/domify';
import features from '../libs/features';

async function init() {
	// If anything errors, RGH will display the error next to the feature name
	await Promise.all(select.all('[href="/apps/travis-ci"]').map(bypass));
}

async function bypass(check) {
	const details = select('.status-actions', check.parentNode);

	const response = await fetch(details.href);

	if (!response.ok) {
		return;
	}

	const dom = domify(await response.text());
	// On errored build check pages, there's a link that points
	// to the first errored Travis build instead of the current one.
	// e.g. the failed "PR build" instead of the "branch build"
	// .text-small selects the right one.
	const directLink = select('[href^="https://travis-ci.com"].text-small', dom);
	details.href = directLink.href;
}

features.add({
	id: 'bypass-checks-travis',
	include: [
		features.isPRConversation
	],
	load: features.onAjaxedPages,
	init
});
