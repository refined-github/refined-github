/*
Creating a PR from the master branch is an anti-pattern. This feature produces a
warning when a user attempts to create a PR from their fork's default branch.

See:
https://blog.jasonmeridth.com/posts/do-not-issue-pull-requests-from-your-master-branch/
*/

import {React} from 'dom-chef/react';
import select from 'select-dom';
import features from '../libs/features';
import {getUsername} from '../libs/utils';
import getDefaultBranch from '../libs/get-default-branch';

async function init() {
	const defaultBranch = await getDefaultBranch();
	if (!location.pathname.endsWith(`${getUsername()}:${defaultBranch}`)) {
		return false;
	}

	select('.compare-pr').append(
		<div class="flash flash-error my-3">
			<strong>Note:</strong> Creating a PR from the the default branch is an <a href="https://blog.jasonmeridth.com/posts/do-not-issue-pull-requests-from-your-master-branch/" target="_blank">anti-pattern</a>.
		</div>
	);
}

features.add({
	id: 'warn-pr-from-master',
	include: [
		features.isCompare
	],
	load: features.onAjaxedPages,
	init
});
