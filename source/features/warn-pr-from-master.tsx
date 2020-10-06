import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import getDefaultBranch from '../github-helpers/get-default-branch';
import {getRepositoryInfo} from '../github-helpers';

async function init(): Promise<false | void> {
	let defaultBranch;
	if (select.exists('.is-cross-repo')) {
		const forkedRepository = getRepositoryInfo(select('[title^="head: "]')!.textContent!);
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
		</div>
	);
}

void features.add({
	id: __filebasename,
	description: 'Warns you when creating a pull request from the default branch, as it’s an anti-pattern.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/52543516-3ca94e00-2de5-11e9-9f80-ff8f9fe8bdc4.png'
}, {
	include: [
		pageDetect.isCompare
	],
	exclude: [
		() => select.exists('.blankslate')
	],
	init
});
