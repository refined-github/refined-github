import './recently-pushed-branches-enhancements.css';
import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {getRepoURL} from '../github-helpers';

const fragmentURL = `/${getRepoURL()}/show_partial?partial=tree%2Frecently_touched_branches_list`;
const selector = `[data-url='${fragmentURL}' i], [src='${fragmentURL}' i]`;

// Ajaxed pages will load a new fragment on every ajaxed load;
// but we only really need the one generated on the first load
function removeDuplicateList(): void {
	const duplicate = select(selector, select('main')!);

	if (duplicate) {
		duplicate.remove();
	}
}

async function getWidget(): Promise<HTMLElement | false> {
	if (pageDetect.isRepoRoot()) {
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
	select.last('.Header-item--full,.HeaderMenu nav')!.after(widget);
}

void features.add(__filebasename, {}, {
	include: [
		pageDetect.isRepo
	],
	init: onetime(init)
}, {
	include: [
		pageDetect.isRepo
	],
	init: removeDuplicateList
});
