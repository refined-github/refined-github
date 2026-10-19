import './mark-pinned.css';

import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import PinIcon from 'octicons-plain-react/Pin';
import {$, closestElement, elementExists} from 'select-dom';
import {assertDefined} from 'ts-extras';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import {issueIcons} from './select-notifications.js';

function mark(issueLink: HTMLAnchorElement): void {
	if (!elementExists(`ul[aria-label='Drag and drop pinned issues list.'] a[href$="${issueLink.pathname}"]`)) {
		return;
	}

	// Keep the container and its classes, replace just the contents
	const paths = (<PinIcon />).children;
	const icon = $(issueIcons, closestElement('li', issueLink));
	icon.replaceChildren(...paths);
	icon.parentElement!.classList.add('rgh-pinned-issue-icon');

	const colorClass = [...icon.classList].find(className => className.startsWith('fgColor'));
	assertDefined(colorClass);
	icon.parentElement!.classList.add(colorClass);
}

function init(signal: AbortSignal): void {
	observe('a[data-testid="issue-listitem-title-link"]', mark, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoIssueList,
	],
	init,
});

/*

Test URLs:

https://github.com/bfred-it-org/one-file-repo/issues (click "clear" on search field or else pinned issues don't show)

*/
