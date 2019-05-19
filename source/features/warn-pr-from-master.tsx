import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import getDefaultBranch from '../libs/get-default-branch';

async function init(): Promise<false | void> {
	const defaultBranch = await getDefaultBranch();
	// Expected: /user/repo/compare/master...user:master
	if (!location.pathname.endsWith(':' + defaultBranch)) {
		return false;
	}

	select('.gh-header-new-pr')!.append(
		<div className="flash flash-error my-3">
			<strong>Note:</strong> Creating a PR from the the default branch is an <a href="https://blog.jasonmeridth.com/posts/do-not-issue-pull-requests-from-your-master-branch/" target="_blank">anti-pattern</a>.
		</div>
	);
}

features.add({
	id: 'warn-pr-from-master',
	description: 'Warns you when creating a pull request from the default branch, as it’s an anti-pattern',
	include: [
		features.isCompare
	],
	load: features.onAjaxedPages,
	init
});
