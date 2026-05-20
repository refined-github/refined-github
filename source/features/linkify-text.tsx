import * as pageDetect from 'github-url-detection';

import {elementExists} from 'select-dom';

import features from '../feature-manager.js';
import {linkifyIssues} from '../github-helpers/dom-formatters.js';
import {getRepo} from '../github-helpers/index.js';
import {logError} from '../helpers/errors.js';
import observe from '../helpers/selector-observer.js';

function linkifyIssue(paragraph: HTMLParagraphElement): void {
	// Already linkified
	if (elementExists('a', paragraph)) {
		logError(new Error(`${paragraph.textContent} is already linkified`));
	}

	linkifyIssues(getRepo()!, paragraph);
}

function init(signal: AbortSignal): void {
	observe(
		[
			'[data-component="TitleArea"] .markdown-title', // Issue and PR React View Title
			'.js-issue-title', // Discussions and legacy PR Files title
		],
		linkifyIssue,
		{signal},
	);
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

- https://github.com/refined-github/sandbox/issues/108
- https://github.com/refined-github/sandbox/pull/70
- https://github.com/refined-github/sandbox/pull/70/files
- https://github.com/File-New-Project/EarTrumpet/discussions/877

*/
