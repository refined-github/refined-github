import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as domFormatters from '../github-helpers/dom-formatters';
import observeElement from '../helpers/simplified-element-observer';

function init(): void {
	for (const title of select.all('.js-issue-title')) {
		if (!select.exists('a, code', title)) {
			domFormatters.linkifyIssues(title);
			domFormatters.parseBackticks(title);
		}
	}
}

void features.add({
	id: __filebasename,
	description: 'Make issue/PR references in issue/PR titles clickable and parse `code in backticks` that appear as Markdown',
	screenshot: 'https://user-images.githubusercontent.com/22439276/58927232-71ae2780-876b-11e9-941e-bb56a7389123.png'
}, {
	include: [
		pageDetect.isPR,
		pageDetect.isIssue
	],
	init() {
		observeElement(select('#partial-discussion-header')!.parentElement!, init, {
			subtree: true,
			childList: true
		});
	}
});
