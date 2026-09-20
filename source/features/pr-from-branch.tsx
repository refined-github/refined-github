/**
@description Lets you open a PR in one click on the branch page.
@screenshot https://github.com/user-attachments/assets/7f42664a-76e6-4518-88b2-20b69a3260f9
*/

import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import GitPullRequestIcon from 'octicons-plain-react/GitPullRequest';
import {$optional} from 'select-dom';

import features from '../feature-manager.js';
import {assertTextContent} from '../helpers/dom-utils.js';
import observe from '../helpers/selector-observer.js';

function unwrap(button: HTMLButtonElement): void {
	assertTextContent(button, 'Contribute');

	const commitsAhead = $optional('[data-testid="branch-info-bar"] > span > a');
	// The link might be missing altogether if the branch is up to date
	if (!commitsAhead?.textContent.includes('ahead of')) {
		// The link is "x commits behind" so there's nothing to unwrap
		return;
	}

	button.replaceWith(
		<a className="btn" href={commitsAhead.href + '?expand=1'}>
			<GitPullRequestIcon className="mr-2 tmp-mr-2" />
			Open pull request
		</a>,
	);
}

function init(signal: AbortSignal): void {
	observe('[data-testid="branch-info-bar"] button[aria-haspopup="true"]', unwrap, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoRoot,
	],
	init,
});

/*

Test URLs:

- Ahead, can open PR: https://github.com/refined-github/sandbox/tree/new
- Behind, can't open PRs: https://github.com/refined-github/sandbox/tree/behind

*/
