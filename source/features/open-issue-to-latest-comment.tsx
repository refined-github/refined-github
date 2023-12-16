import {$$} from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import {openIssueToLastComment} from '../github-helpers/selectors.js';

function init(): void {
	for (const link of $$(openIssueToLastComment)) {
		link.hash = '#issue-comment-box';
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isIssueOrPRList,
	],
	awaitDomReady: true,
	init,
});
