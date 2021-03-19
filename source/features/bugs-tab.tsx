import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import {BugIcon} from '@primer/octicons-react';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import {getRepo} from '../github-helpers';
import SearchQuery from '../github-helpers/search-query';
import abbreviateNumber from '../helpers/abbreviate-number';

const countBugs = cache.function(async (): Promise<number> => {
	const {search} = await api.v4(`
		search(type: ISSUE, query: "label:bug is:open is:issue repo:${getRepo()!.nameWithOwner}") {
			issueCount
		}
	`);

	return search.issueCount;
}, {
	maxAge: {minutes: 30},
	staleWhileRevalidate: {days: 4},
	cacheKey: (): string => __filebasename + ':' + getRepo()!.nameWithOwner
});

async function init(): Promise<void | false> {
	// Query API as early as possible, even if it's not necessary on archived repos
	const countPromise = countBugs();

	// On a label:bug listing:
	// - always show the tab, as soon as possible
	// - update the count later
	// On other pages:
	// - only show the tab if needed
	const isBugsPage = new SearchQuery(location.search).includes('label:bug');
	if (!isBugsPage && await countPromise === 0) {
		return false;
	}

	const issuesTab = (await elementReady('.js-repo-nav [data-hotkey="g i"]', {waitForChildren: false}))?.parentElement;
	if (!issuesTab) {
		// Repo is archived
		return false;
	}

	if (isBugsPage) {
		// Hide pinned issues on the tab page, they might not belong there
		// eslint-disable-next-line promise/prefer-await-to-then -- Don't await; if there are no pinned issues, this would delay the bug count update
		void elementReady('.js-pinned-issues-reorder-container', {waitForChildren: false}).then(pinnedIssues => pinnedIssues?.remove());
	}

	// Copy Issues tab
	const bugsTab = issuesTab.cloneNode(true);

	// Disable unwanted behavior #3001
	const bugsLink = select('a', bugsTab)!;
	bugsLink.removeAttribute('data-hotkey');
	bugsLink.removeAttribute('data-selected-links');
	select('a', issuesTab)!.removeAttribute('data-selected-links');

	// Update its appearance
	const bugsTabTitle = select('[data-content]', bugsTab);
	if (bugsTabTitle) {
		bugsTabTitle.dataset.content = 'Bugs';
		bugsTabTitle.textContent = 'Bugs';
		select('.octicon', bugsTab)!.replaceWith(<BugIcon className="UnderlineNav-octicon d-none d-sm-inline"/>);

		// Un-select one of the tabs if necessary
		const selectedTabLink = !isBugsPage || pageDetect.isPRList() ? bugsLink : select('.selected', issuesTab);
		selectedTabLink?.classList.remove('selected');
		selectedTabLink?.removeAttribute('aria-current');
	} else {
		// Pre "Repository refresh" layout
		select('[itemprop="name"]', bugsTab)!.textContent = 'Bugs';
		select('.octicon', bugsTab)!.replaceWith(<BugIcon/>);

		// Change the Selected tab if necessary
		bugsLink.classList.toggle('selected', isBugsPage && !pageDetect.isPRList());
		select('.selected', issuesTab)?.classList.toggle('selected', !isBugsPage);
	}

	// Set temporary counter
	const bugsCounter = select('.Counter', bugsTab)!;
	bugsCounter.textContent = '0';

	// Update Bugs’ link
	new SearchQuery(bugsLink).add('label:bug');

	issuesTab.after(bugsTab);

	// Update bugs count
	try {
		const bugCount = await countPromise;
		bugsCounter.textContent = abbreviateNumber(bugCount);
		bugsCounter.title = String(bugCount);
	} catch (error: unknown) {
		bugsCounter.remove();
		features.error(__filebasename, error);
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isRepo
	],
	awaitDomReady: false,
	init
});
