import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

function fix(button: HTMLAnchorElement): void {
	button.removeAttribute('target');
}

function init(signal: AbortSignal): void {
	observe(
		[
			// "Linked a pull request" link
			// https://github.com/refined-github/refined-github/issues/9382
			'a[target="_blank"][class^="ConnectedEvent-module__linkedPullRequestLink"]',

			// "Closing issue" link
			// https://github.com/refined-github/refined-github/issues/8346#event-16947543136
			'a[target="_blank"][class^="ClosedEvent-module__closerLink"]',

			// Linked PR links in issue headers
			// https://github.com/refined-github/refined-github/issues/8346
			'a[target="_blank"][class^="LinkedPullRequest-module__pullRequestLink"]',

			// Linked PR links in issue header menu
			// https://github.com/refined-github/sandbox/issues/130
			'a[target="_blank"][class^="prc-ActionList-ActionListContent"][aria-keyshortcuts="#"]',

			// Linked PR and release links on issue sidebar
			// https://github.com/refined-github/refined-github/issues/9187
			'ul[data-testid="issue-viewer-linked-pr-container"] a[target="_blank"]',

			// Commit linkbacks on issue timeline
			// https://github.com/sindresorhus/np/issues/82#event-22200037448
			'a[target="_blank"][class^="ReferencedEventInner-module__commitHashLink"]',

			// Linked PRs on issue list
			// https://github.com/refined-github/refined-github/issues?q=is%3Aissue%20has%3Alinked%20reason%3Acompleted
			'div[data-testid="list-row-linked-pull-requests"] > a[target="_blank"]',

			// PR links on branches page
			// https://github.com/bfred-it-org/github-sandbox/branches
			'react-app[app-name="repos-branches"] a[target="_blank"][href*="/pull/"]',
		],
		fix,
		{signal},
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isIssueList,
		pageDetect.isIssue,
		pageDetect.isBranches,
	],
	init,
});

/*

Test URLs found inline

*/
