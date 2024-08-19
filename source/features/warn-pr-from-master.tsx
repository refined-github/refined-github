import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import elementReady from 'element-ready';

import features from '../feature-manager.js';
import {getRepo} from '../github-helpers/index.js';
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
	const {nameWithOwner, path, name} = getRepo()!;
	const base = getRepo(nameWithOwner)!;

	/**
	 * There is two possible formats for the head repo:
	 * - owner:branch
	 * - owner:repo:branch
	 */
	const headParts = path.split('...')[1].split(':');
	const headBranch = headParts.pop();
	const [headOwner, headRepo = name] = headParts;

	const head = getRepo(`${headOwner}/${headRepo}`)!;

	return head.owner !== base.owner && headBranch === await defaultBranchOfRepo.get(head);
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
