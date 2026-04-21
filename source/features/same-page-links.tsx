import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

function fix(button: HTMLAnchorElement): void {
	button.removeAttribute('target');
}

function init(signal: AbortSignal): void {
	observe([
		'a[target="_blank"][class^="ClosedEvent-module__closerLink"]', // "Closing issue" link
		'a[target="_blank"][class^="LinkedPullRequest-module__pullRequestLink"]', // Linked PR links in issue headers
		'a[target="_blank"][class^="prc-ActionList-ActionListContent"][aria-keyshortcuts="#"]', // Linked PR links in issue header menu
		'ul[data-testid="issue-viewer-linked-pr-container"] a[target="_blank"]', // Linked PR and release links on issue sidebar
		'a[target="_blank"][class^="ReferencedEventInner-module__commitHashLink"]', // Commit linkbacks on issue timeline
		'div[data-testid="list-row-linked-pull-requests"] > a[target="_blank"]', // Linked PRs on issue list
	], fix, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isIssueList,
		pageDetect.isIssue,
	],
	init,
});

/*

Test URLs

- "Closing issue" link: https://github.com/refined-github/refined-github/issues/8346#event-16947543136
- Linked PR links on issue page: https://github.com/refined-github/refined-github/issues/8346
- Linked PR links in issue header menu: https://github.com/refined-github/sandbox/issues/130
- Commit linkbacks: https://github.com/sindresorhus/np/issues/82#event-22200037448, https://github.com/cli/cli/issues/10238
- Linked PRs on issue list: https://github.com/refined-github/refined-github/issues?q=is%3Aissue%20has%3Alinked%20reason%3Acompleted
*/
