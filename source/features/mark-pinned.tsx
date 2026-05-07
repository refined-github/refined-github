import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import PinIcon from 'octicons-plain-react/Pin';
import {elementExists} from 'select-dom';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import {getIdentifiers} from '../helpers/feature-helpers.js';

const {class: featureClass} = getIdentifiers(import.meta.url);

function getPinnedIssueSelector(issueLink: HTMLAnchorElement): string {
	const href = issueLink.getAttribute('href')!;
	return `.js-pinned-issues-reorder-container a[href="${CSS.escape(href)}"]`;
}

function mark(issueLink: HTMLAnchorElement): void {
	if (!elementExists(getPinnedIssueSelector(issueLink))) {
		return;
	}

	const {firstChild} = issueLink;
	if (
		firstChild instanceof Text
		&& firstChild.data.startsWith('📌')
	) {
		firstChild.splitText(1).previousSibling!.remove();
	}

	issueLink.prepend(<PinIcon className={`${featureClass} color-fg-muted mr-1 v-align-text-bottom`} />);
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

https://github.com/eslint/eslint/issues/?q=is%3Aissue%20state%3Aopen%20dashboard
https://github.com/yaotingwangofficial/Awesome-MCoT/issues

*/
