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
	getDefaultBranch().then(defaultBranch => {
		if (!location.pathname.endsWith(`${getUsername()}:${defaultBranch}`)) {
			return;
		}

		let warning_div = document.createElement('div');
		warning_div.classList.add('rgh-alert');
		
		let warning_header = document.createElement('h1');
		warning_header.innerHTML = `
			DO NOT CREATE PULL REQUESTS FROM THE DEFAULT BRANCH
		`;
		
		let warning = document.createElement('p');
		warning.innerHTML = `
			Pull requests (PRs) should <strong>not</strong> be created from the
			default branch (e.g. the master branch). A separate PR-specific
			branch should be created with your changes. Doing so will help
			prevent unintentional changes from being included in your PR.
		`;
		
		warning_div.appendChild(warning_header);
		warning_div.appendChild(warning);
		const container = select('.blankslate');
		container.prepend(warning_div);
	});
}

features.add({
	id: 'warn-pr-from-master',
	include: [
		features.isCompare
	],
	load: features.onAjaxedPages,
	init
});
