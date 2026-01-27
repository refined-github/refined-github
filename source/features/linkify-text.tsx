import * as pageDetect from 'github-url-detection';

import {elementExists} from 'select-dom';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import {getRepo} from '../github-helpers/index.js';
import {linkifyIssues} from '../github-helpers/dom-formatters.js';
import {logError} from '../helpers/errors.js';

function linkifyIssue(paragraph: HTMLParagraphElement): void {
	// Already linkified
	if (elementExists('a', paragraph)) {
		logError(new Error(`${paragraph.textContent} is already linkified`));
	}

	linkifyIssues(getRepo()!, paragraph);
}

function init(signal: AbortSignal): void {
	observe([
		'.js-issue-title', // TODO: Drop in 2026
		'[data-component="TitleArea"] .markdown-title', // Issue and PR React View Title
		'.discussion-sidebar-item:has(.octicon-issue-opened) p', // Discussions sidebar item
	], linkifyIssue, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPR,
		pageDetect.isIssue,
		pageDetect.isDiscussion,
	],
	init,
});

/*

Test URLs

- https://github.com/refined-github/sandbox/pull/70/files
- Discussions (title): https://github.com/File-New-Project/EarTrumpet/discussions/877
- Discussions (sidebar item): https://github.com/renovatebot/renovate/discussions/24775

*/
