import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

function fix(button: HTMLAnchorElement): void {
	button.removeAttribute('target');
}

function init(signal: AbortSignal): void {
	observe([
		'[data-testid="state-reason-link"] + [target="_blank"]', // "Closing issue" link
		'[data-testid="issue-metadata-fixed"] [target="_blank"]', // Reference PR link in issue header
		'[data-testid^="timeline-row-border"] [target="_blank"]', // Commit linkbacks in PRs
	], fix, {signal});
}

function initIssueList(signal: AbortSignal): void {
	observe(
		'[data-testid="list-row-linked-pull-requests"] a[target="_blank"]', // Closing links on the issue list
		fix,
		{signal},
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isIssue,
	],
	init,
}, {
	include: [
		pageDetect.isIssueOrPRList,
	],
	init: initIssueList,
});

/*

Test URLs

- "Closing issue" link https://github.com/refined-github/refined-github/issues/8346#event-16947543136
- "Reference PR link" https://github.com/refined-github/refined-github/pull/8367
- "Commit Linkbacks" https://github.com/sindresorhus/np/issues/82#event-22200037448, https://github.com/cli/cli/issues/10238
- "Closing links on issue list" https://github.com/refined-github/refined-github/issues
*/
