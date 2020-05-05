import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';
import getDefaultBranch from '../libs/get-default-branch';

async function init(): Promise<false | void> {
	const defaultBranch = await getDefaultBranch();
	// Expected: /user/repo/compare/master...user:master
	if (!location.pathname.endsWith(':' + defaultBranch)) {
		return false;
	}

	select('.gh-header-new-pr')!.append(
		<div className="flash flash-error my-3">
			<strong>Note:</strong> Creating a PR from the default branch is an <a href="https://blog.jasonmeridth.com/posts/do-not-issue-pull-requests-from-your-master-branch/" target="_blank" rel="noopener noreferrer">anti-pattern</a>.
		</div>
	);
}

features.add({
	id: __filebasename,
	description: 'Warns you when creating a pull request from the default branch, as it’s an anti-pattern.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/52543516-3ca94e00-2de5-11e9-9f80-ff8f9fe8bdc4.png'
}, {
	include: [
		pageDetect.isCompare
	],
	init
});
