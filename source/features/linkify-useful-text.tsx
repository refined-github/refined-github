import * as pageDetect from 'github-url-detection';

import {elementExists} from 'select-dom';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import {getRepo} from '../github-helpers/index.js';
import {linkifyIssues} from '../github-helpers/dom-formatters.js';

export const linkifyIssue = (paragraph: HTMLParagraphElement): void => {
	// Already linkified
	if (elementExists('a', paragraph)) {
		return;
	}

	// No issue reference found
	if (!/#\d+/.test(paragraph.textContent)) {
		return;
	}

	linkifyIssues(getRepo()!, paragraph);
};

function init(signal: AbortSignal): void {
	observe('.discussion-sidebar-item:has(.octicon-issue-opened) p', linkifyIssue, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isDiscussion,
	],
	init,
});

/*

Test URLs

- https://github.com/renovatebot/renovate/discussions/24775

*/
