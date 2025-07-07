import * as pageDetect from 'github-url-detection';

import {$} from 'select-dom/strict.js';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import {getRepo} from '../github-helpers/index.js';
import {linkifyIssues} from '../github-helpers/dom-formatters.js';

function linkifyIssue(container: HTMLElement): void {
	const paragraph = $('p', container);

	if (!/#\d+/.test(paragraph.textContent)) {
		return;
	}

	linkifyIssues(getRepo()!, paragraph);
}

function init(signal: AbortSignal): void {
	observe('.discussion-sidebar-item:has(.octicon-issue-opened)', linkifyIssue, {signal});
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
