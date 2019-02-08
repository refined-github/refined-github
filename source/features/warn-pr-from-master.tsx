/*
Creating a PR from master branch is an anti-pattern. This feature produces a
warning when a user attempts to create a PR from their fork's default branch.

See:
https://blog.jasonmeridth.com/posts/do-not-issue-pull-requests-from-your-master-branch/
*/

import select from 'select-dom';
import features from '../libs/features';
import {getUsername} from '../libs/utils';
import getDefaultBranch from '../libs/get-default-branch';

async function init() {
	const defaultBranch = await getDefaultBranch();
	if (!location.pathname.endsWith(`${getUsername()}:${defaultBranch}`)) {
		return;
	}

	const warningDiv = document.createElement('div');
	warningDiv.classList.add('rgh-alert');

	const warningHeader = document.createElement('h1');
	warningHeader.innerHTML = `
		DO NOT CREATE PULL REQUESTS FROM THE DEFAULT BRANCH
	`;

	const warning = document.createElement('p');
	warning.innerHTML = `
		Pull requests (PRs) should <strong>not</strong> be created from the
		default branch (e.g. the master branch). A separate PR-specific
		branch should be created with your changes. Doing so will help
		prevent unintentional changes from being included in your PR.
	`;

	warningDiv.append(warningHeader);
	warningDiv.append(warning);
	const container = select('.blankslate');
	container.prepend(warningDiv);
}

features.add({
	id: 'warn-pr-from-master',
	include: [
		features.isCompare
	],
	load: features.onAjaxedPages,
	init
});
