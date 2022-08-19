import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

const selector = `
	:is(.js-issue-row, .js-pinned-issue-list-item)
	.Link--muted:is([aria-label$="comment"], [aria-label$="comments"])
`;

function init(): void {
	for (const link of select.all<HTMLAnchorElement>(selector)) {
		link.hash = '#partial-timeline';
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isIssueOrPRList,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
