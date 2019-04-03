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

const repoUrl = getRepoURL();

function getList() {
	const fragmentURL = `/${repoUrl}/show_partial?partial=tree%2Frecently_touched_branches_list`;

	return (
		select(`[data-url='${fragmentURL}'], [src='${fragmentURL}']`) || // Already on page
		<include-fragment src={fragmentURL}></include-fragment> // Generate it if not
	);
}

async function init() {
	// Make it smaller and `position:fixed` to avoid jumps
	document.body.classList.add('rgh-recently-pushed-branches');

	// Move or add list
	select('.HeaderMenu > :last-child').before(
		<div className="position-relative" style={{marginLeft: 'auto'}}>{getList()}</div>
	);
}

features.add({
	id: 'recently-pushed-branches-enhancements',
	include: [
		features.isRepo
	],
	load: features.onDomReady,
	init
});
