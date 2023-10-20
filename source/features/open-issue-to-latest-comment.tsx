import {$$} from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';

const selector = `
	:is(.js-issue-row, .js-pinned-issue-list-item)
	.Link--muted:is(a[aria-label$="comment"], a[aria-label$="comments"])
`;

function init(): void {
	for (const link of $$(selector)) {
		link.hash = '#partial-timeline';
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isIssueOrPRList,
	],
	awaitDomReady: true,
	deduplicate: 'has-rgh-inner',
	init,
});
