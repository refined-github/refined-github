import React from 'dom-chef';
import GitPullRequestIcon from 'octicons-plain-react/GitPullRequest';
import * as pageDetect from 'github-url-detection';
import {$optional} from 'select-dom';

import {assertTextContent} from '../helpers/dom-utils.js';

import features from '../feature-manager.js';
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
