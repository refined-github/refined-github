/*
GitHub shows a widget to create a new Pull Request from a recently-pushed branch,
but only on the repo root and on the PR list pages.
https://blog.github.com/changelog/2018-08-14-quickly-create-a-new-pull-request-from-your-repositorys-pull-requests-page/

This feature also adds this widget to the Issues List, Issue page and PR page
*/

import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import {getRepoURL} from '../libs/utils';
import {isRepoRoot} from '../libs/page-detect';

const fragmentURL = `/${getRepoURL()}/show_partial?partial=tree%2Frecently_touched_branches_list`;
const selector = `[data-url='${fragmentURL}'], [src='${fragmentURL}']`;

// Ajaxed pages will load a new fragment on every ajaxed load;
// but we only really need the one generated on the first load
function removeDuplicateList(): void {
	const duplicate = select(selector, select('main')!);

	if (duplicate) {
		duplicate.remove();
	}
}

async function getWidget(): Promise<HTMLElement | false> {
	if (isRepoRoot()) {
		return select(selector)!;
	}

	// We need to verify that the repo has any recently pushed branches or else it will break the page
	// https://github.com/sindresorhus/refined-github/issues/1964
	const repoRootUrl = location.pathname.split('/', 3).join('/');
	const response = await fetch(location.origin + repoRootUrl);
	const html = await response.text();

	if (html.includes(fragmentURL)) {
		return <include-fragment src={fragmentURL}/>;
	}

	return false;
}

async function init(): Promise<false | void> {
	const widget = await getWidget();

	if (!widget) {
		return false;
	}

	// Make it smaller and `position:fixed` to avoid jumps
	document.body.classList.add('rgh-recently-pushed-branches');

	// Move or add list next to the notifications bell
	select('.Header-item--full')!.after(widget);
}

features.add({
	id: 'recently-pushed-branches-enhancements',
	include: [
		features.isRepo
	],
	load: features.onDomReady,
	init
});

features.add({
	id: 'recently-pushed-branches-enhancements',
	include: [
		features.isRepo
	],
	load: features.onAjaxedPages,
	init: removeDuplicateList
});
