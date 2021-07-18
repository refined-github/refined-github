import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	for (const link of select.all('.js-issue-row a[aria-label*="comment"], .js-pinned-issue-list-item a[aria-label*="comment"]')) {
		link.hash = '#partial-timeline';
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isConversationList,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
