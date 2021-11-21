import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import getDefaultBranch from '../github-helpers/get-default-branch';
import {getRepo} from '../github-helpers';

async function init(): Promise<false | void> {
	let defaultBranch;
	if (select.exists('.is-cross-repo')) {
		const forkedRepository = getRepo(select('[title^="head: "]')!.textContent!);
		defaultBranch = await getDefaultBranch(forkedRepository);
	} else {
		defaultBranch = await getDefaultBranch();
	}

	// Expected: /user/repo/compare/master...user:master
	if (!location.pathname.endsWith(':' + defaultBranch)) {
		return false;
	}

	select('.js-compare-pr')!.before(
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
		() => select.exists('.blankslate'),
	],
	init,
});
