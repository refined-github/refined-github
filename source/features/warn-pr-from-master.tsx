import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import elementReady from 'element-ready';

import features from '../feature-manager.js';
import parseCompareUrl from '../github-helpers/parse-compare-url.js';
import {defaultBranchOfRepo} from '../github-helpers/get-default-branch.js';

async function init(): Promise<void> {
	const anchor = await elementReady('.js-compare-pr');
	anchor?.before(
		<div className="flash flash-error my-3">
			<strong>Note:</strong> Creating a PR from the default branch is an <a href="https://blog.jasonmeridth.com/posts/do-not-issue-pull-requests-from-your-master-branch/" target="_blank" rel="noopener noreferrer">anti-pattern</a>.
		</div>,
	);
}

async function isCrossRepoCompareFromMaster(): Promise<boolean> {
	const c = parseCompareUrl(location.pathname);

	// eslint-disable-next-line no-implicit-coercion -- TS preference
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
