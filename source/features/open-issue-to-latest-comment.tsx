import select from 'select-dom';
import features from '../libs/features';

function init(): void | false {
	for (const link of select.all<HTMLAnchorElement>('a[aria-label*="comment"]')) {
		link.href = `${link.href}#partial-timeline`;
	}
}

features.add({
	id: 'open-issue-to-latest-comment',
	include: [
		features.isDiscussionList
	],
	load: features.onAjaxedPages,
	init
});
