import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import observe from '../helpers/selector-observer.js';
import features from '../feature-manager.js';
import parseCompareUrl from '../github-helpers/parse-compare-url.js';
import {defaultBranchOfRepo} from '../github-helpers/get-default-branch.js';

async function addWarning(anchor: HTMLElement): Promise<void> {
	anchor.before(
		<div className="flash flash-error my-3">
			<strong>Note:</strong> Creating a PR from the default branch is an <a href="https://blog.jasonmeridth.com/posts/do-not-issue-pull-requests-from-your-master-branch/" target="_blank" rel="noopener noreferrer">anti-pattern</a>.
		</div>,
	);
}

function init(signal: AbortSignal): void {
	observe('.js-compare-pr', addWarning, {signal});
}

async function isCrossRepoCompareFromMaster(): Promise<boolean> {
	const c = parseCompareUrl(location.pathname);

	return !!c && c.isCrossRepo && c.head.branch === await defaultBranchOfRepo.get(c.head.repo);
}

void features.add(import.meta.url, {
	asLongAs: [
		pageDetect.isCompare,
		isCrossRepoCompareFromMaster,
	],
	init,
});

/*

Test URLs:

- Simple: https://github.com/refined-github/refined-github/compare/main...fregante:main
- Renamed fork and changed default branch: https://github.com/refined-github/sandbox/compare/default-a...bfred-it-org:github-sandbox:main?expand=1
- Non-standard default name: https://github.com/refined-github/refined-github/compare/sandbox/keep-branch...yakov116:upstream

*/
