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
	const {nameWithOwner, path} = getRepo()!;
	const base = getRepo(nameWithOwner)!;

	// Expected: master...owner:repo:master
	const ownerRepoBranchParts = path.split('...')[1].split(':');
	const head = {
		branch: ownerRepoBranchParts.pop()!,
		...getRepo(ownerRepoBranchParts.join('/'))!,
	};

	return head.owner !== base.owner && head.branch === await defaultBranchOfRepo.get(head);
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

https://github.com/refined-github/refined-github/compare/main...fregante:refined-github:main

*/
