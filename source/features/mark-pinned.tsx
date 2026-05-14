import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import PinIcon from 'octicons-plain-react/Pin';
import {elementExists} from 'select-dom';

import features from '../feature-manager.js';
import {getIdentifiers} from '../helpers/feature-helpers.js';
import observe from '../helpers/selector-observer.js';

const {class: featureClass} = getIdentifiers(import.meta.url);

function getPinnedIssueSelector(issueLink: HTMLAnchorElement): string {
	// The href attribute in the pinned issue list contains the absolute URL
	return `[class*='PinnedIssues-module__container'] a[href="${issueLink.href}"]`;
}

function mark(issueLink: HTMLAnchorElement): void {
	if (
		// Is pinned
		elementExists(getPinnedIssueSelector(issueLink))

		// Is not already titled with the pin emoji
		&& !issueLink.textContent.startsWith('📌')
	) {
		issueLink.prepend(
			<PinIcon className={`${featureClass} color-fg-muted mr-1 v-align-text-bottom`} />,
		);
	}
}

function init(signal: AbortSignal): void {
	observe('a[data-testid="issue-pr-title-link"]', mark, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoIssueList,
	],
	init,
});

/*

Test URLs:

- Prepend to pinned issues: https://github.com/gulpjs/gulp/issues?q=in%3Atitle%20update%20docs%20for
- Don't alter issues that already have an emoji: https://github.com/yaotingwangofficial/Awesome-MCoT/issues

*/
