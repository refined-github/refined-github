import './mark-pinned.css';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import PinIcon from 'octicons-plain-react/Pin';
import {$, closestElement, elementExists} from 'select-dom';

import features from '../feature-manager.js';
import {is} from '../helpers/css-selectors.js';
import observe from '../helpers/selector-observer.js';
import {issueIcons} from './select-notifications.js';

function mark(issueLink: HTMLAnchorElement): void {
	// The href attribute in the pinned issue list contains the absolute URL
	if (!elementExists(`[class*='PinnedIssues-module__container'] a[href="${issueLink.href}"]`)) {
		return;
	}

	// Keep the container and its classes, replace just the contents
	const paths = (<PinIcon />).children;
	const icon = $(is(issueIcons), closestElement('li', issueLink));
	icon.replaceChildren(...paths);
	icon.parentElement!.classList.add('rgh-pinned-issue-icon');
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

https://github.com/refined-github/sandbox/issues?q=title

Only for the screenshot: https://github.com/gulpjs/gulp/issues?q=in%3Atitle%20update%20docs%20for%20sort%3Aupdated-asc

*/
