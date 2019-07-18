import select from 'select-dom';
import features from '../libs/features';

function init(): void {
	for (const link of select.all<HTMLAnchorElement>('.js-issue-row a[aria-label*="comment"], .js-pinned-issue-list-item a[aria-label*="comment"]')) {
		link.hash = '#partial-timeline';
	}
}

features.add({
	id: __featureName__,
	description: 'Clicking the comments icon in issue lists will take you to latest comment.',
	include: [
		features.isDiscussionList
	],
	load: features.onAjaxedPages,
	init
});
