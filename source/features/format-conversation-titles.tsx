import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import observeElement from '../helpers/simplified-element-observer';
import {linkifyFeature} from './rgh-linkify-features';
import * as domFormatters from '../github-helpers/dom-formatters';
import {isNotRefinedGitHubRepo} from '../github-helpers';


function init(): void {
	for (const title of select.all('.js-issue-title')) {
		if (!select.exists('a, code', title)) {
			domFormatters.linkifyIssues(title);
			domFormatters.parseBackticks(title);
			if (isNotRefinedGitHubRepo()) {
				continue;
			}

			for (const possibleFeature of select.all('code', title)) {
				linkifyFeature(possibleFeature);
			}
		}
	}
}

void features.add(__filebasename, {
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
