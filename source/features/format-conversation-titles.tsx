import * as pageDetect from 'github-url-detection';

import features from '.';
import observeElement from '../helpers/simplified-element-observer';
import * as domFormatters from '../github-helpers/dom-formatters';

function init(): void {
	for (const title of $$('.js-issue-title')) {
		if (!$.exists('a, code', title)) {
			domFormatters.linkifyIssues(title);
			domFormatters.parseBackticks(title);
		}
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isPR,
		pageDetect.isIssue
	],
	init() {
		observeElement($('#partial-discussion-header')!.parentElement!, init, {
			subtree: true,
			childList: true
		});
	}
});
