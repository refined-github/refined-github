import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import BugIcon from '@primer/octicons/build/svg/bug.svg';
import elementReady from 'element-ready';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';
import * as api from '../libs/api';
import SearchQuery from '../libs/search-query';
import {getRepoURL} from '../libs/utils';

const numberFormatter = new Intl.NumberFormat();
const countBugs = cache.function(async (): Promise<number> => {
	const {search} = await api.v4(`
		search(type: ISSUE, query: "label:bug is:open is:issue repo:${getRepoURL()}") {
			issueCount
		}
	`);

	return search.issueCount;
}, {
	maxAge: 1 / 24 / 2, // Stale after half an hour
	staleWhileRevalidate: 4,
	cacheKey: (): string => __filebasename + ':' + getRepoURL()
});

async function init(): Promise<void | false> {
	// Query API as early as possible, even if it's not necessary on archived repos
	const countPromise = countBugs();

	// On a label:bug listing:
	// - always show the tab, as soon as possible
	// - update the count later
	// On other pages:
	// - only show the tab if needed
	const isBugsPage = new SearchQuery(location).includes('label:bug');
	if (!isBugsPage && await countPromise === 0) {
		return false;
	}

	const issuesTab = (await elementReady('.reponav [data-hotkey="g i"]'))?.parentElement;
	if (!issuesTab) {
		// Repo is archived
		return false;
	}

	if (isBugsPage) {
		// Hide pinned issues on the tab page, they might not belong there
		// Don't await; if there are no pinned issues, this would delay the bug count update
		elementReady('.js-pinned-issues-reorder-container').then(pinnedIssues => pinnedIssues?.remove());
	}

	// Copy Issues tab
	const bugsTab = issuesTab.cloneNode(true);

	// Update its appearance
	select('.octicon', bugsTab)!.replaceWith(<BugIcon/>);
	select('[itemprop="name"]', bugsTab)!.textContent = 'Bugs';

	// Set temporary counter
	const bugsCounter = select('.Counter', bugsTab)!;
	bugsCounter.textContent = '0';

	// Disable unwanted behavior #3001
	const bugsLink = select('a', bugsTab)!;
	bugsLink.removeAttribute('data-hotkey');
	bugsLink.removeAttribute('data-selected-links');

	// Update Bugs’ link
	new SearchQuery(bugsLink).add('label:bug');

	// Change the Selected tab if necessary
	bugsLink.classList.toggle('selected', isBugsPage);
	select('.selected', issuesTab)?.classList.toggle('selected', !isBugsPage);

	issuesTab.after(bugsTab);

	// Update bugs count
	try {
		bugsCounter.textContent = numberFormatter.format(await countPromise);
	} catch (error) {
		bugsCounter.remove();
		throw error;
	}
}

features.add({
	id: __filebasename,
	description: 'Adds a "Bugs" tab to repos, if there are any open issues with the "bug" label.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/73720910-a688d900-4755-11ea-9c8d-70e5ddb3bfe5.png'
}, {
	include: [
		pageDetect.isRepo
	],
	waitForDomReady: false,
	init
});
