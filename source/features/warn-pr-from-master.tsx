import React from 'dom-chef';
import {$, elementExists} from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import getDefaultBranch, {defaultBranchOfRepo} from '../github-helpers/get-default-branch.js';
import {getRepo} from '../github-helpers/index.js';

async function init(): Promise<false | void> {
	let defaultBranch;
	if (elementExists('.is-cross-repo')) {
		const forkedRepository = getRepo($('[title^="head: "]')!.textContent)!;
		defaultBranch = await defaultBranchOfRepo.get(forkedRepository);
	} else {
		defaultBranch = await getDefaultBranch();
	}

	// Expected: /user/repo/compare/master...user:master
	if (!location.pathname.endsWith(':' + defaultBranch)) {
		return false;
	}

	$('.js-compare-pr')!.before(
		<div className="flash flash-error my-3">
			<strong>Note:</strong> Creating a PR from the default branch is an <a href="https://blog.jasonmeridth.com/posts/do-not-issue-pull-requests-from-your-master-branch/" target="_blank" rel="noopener noreferrer">anti-pattern</a>.
		</div>,
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isCompare,
	],
	exclude: [
		pageDetect.isBlank,
	],
	awaitDomReady: true,
	deduplicate: 'has-rgh',
	init,
});
