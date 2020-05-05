import select from 'select-dom';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';

function init(): void {
	for (const link of select.all<HTMLAnchorElement>('.js-issue-row a[aria-label*="comment"], .js-pinned-issue-list-item a[aria-label*="comment"]')) {
		link.hash = '#partial-timeline';
	}
}

features.add({
	id: __filebasename,
	description: 'Links the comments icon to the latest comment.',
	screenshot: 'https://user-images.githubusercontent.com/14323370/57962709-7019de00-78e8-11e9-8398-7e617ba7a96f.png'
}, {
	include: [
		pageDetect.isDiscussionList
	],
	init
});
