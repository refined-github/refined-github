/*
GitHub shows a widget to create a new Pull Request from a recently-pushed branch,
but only on the repo root and on the PR list pages.
https://blog.github.com/changelog/2018-08-14-quickly-create-a-new-pull-request-from-your-repositorys-pull-requests-page/

This feature also adds this widget to the Issues List, Issue page and PR page
*/

import {React} from 'dom-chef/react';
import select from 'select-dom';
import features from '../libs/features';
import {getRepoURL} from '../libs/utils';

const repoUrl = getRepoURL();

async function init() {
	const fragmentURL = `/${repoUrl}/show_partial?partial=tree%2Frecently_touched_branches_list`;
	if (select.exists(`[data-url='${fragmentURL}'], [src='${fragmentURL}']`)) {
		return false;
	}

	const codeTabURL = select('[data-hotkey="g c"]').href;
	const response = await fetch(codeTabURL);
	const html = await response.text();

	// https://github.com/sindresorhus/refined-github/issues/216
	if (html.includes(fragmentURL)) {
		select('.repository-content').prepend(<include-fragment src={fragmentURL}></include-fragment>);
	}
}

features.add({
	id: 'show-recently-pushed-branches-on-more-pages',
	include: [
		features.isPR,
		features.isIssue,
		features.isIssueList,
		features.isCompare
	],
	load: features.onAjaxedPages,
	init
});
