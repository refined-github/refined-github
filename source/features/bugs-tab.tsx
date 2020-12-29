import React from 'dom-chef';
import cache from 'webext-storage-cache';
import {BugIcon} from '@primer/octicons-react';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import SearchQuery from '../github-helpers/search-query';
import {getRepo} from '../github-helpers';

const numberFormatter = new Intl.NumberFormat();
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
	const isBugsPage = new SearchQuery(location).includes('label:bug');
	if (!isBugsPage && await countPromise === 0) {
		return false;
	}

	const issuesTab = (await elementReady('.js-repo-nav [data-hotkey="g i"]'))?.parentElement;
	if (!issuesTab) {
		// Repo is archived
		return false;
	}

	if (isBugsPage) {
		// Hide pinned issues on the tab page, they might not belong there
		// Don't await; if there are no pinned issues, this would delay the bug count update
		void elementReady('.js-pinned-issues-reorder-container').then(pinnedIssues => pinnedIssues?.remove());
	}

	// Copy Issues tab
	const bugsTab = issuesTab.cloneNode(true);

	// Disable unwanted behavior #3001
	const bugsLink = $('a', bugsTab)!;
	bugsLink.removeAttribute('data-hotkey');
	bugsLink.removeAttribute('data-selected-links');
	$('a', issuesTab)!.removeAttribute('data-selected-links');

	// Update its appearance
	const bugsTabTitle = $('[data-content]', bugsTab);
	if (bugsTabTitle) {
		bugsTabTitle.dataset.content = 'Bugs';
		bugsTabTitle.textContent = 'Bugs';
		$('.octicon', bugsTab)!.replaceWith(<BugIcon className="UnderlineNav-octicon d-none d-sm-inline"/>);

		// Un-select one of the tabs if necessary
		const selectedTabLink = !isBugsPage || pageDetect.isPRList() ? bugsLink : $('.selected', issuesTab);
		selectedTabLink?.classList.remove('selected');
		selectedTabLink?.removeAttribute('aria-current');
	} else {
		// Pre "Repository refresh" layout
		$('[itemprop="name"]', bugsTab)!.textContent = 'Bugs';
		$('.octicon', bugsTab)!.replaceWith(<BugIcon/>);

		// Change the Selected tab if necessary
		bugsLink.classList.toggle('selected', isBugsPage && !pageDetect.isPRList());
		$('.selected', issuesTab)?.classList.toggle('selected', !isBugsPage);
	}

	// Set temporary counter
	const bugsCounter = $('.Counter', bugsTab)!;
	bugsCounter.textContent = '0';
	bugsCounter.title = '';

	// Update Bugs’ link
	new SearchQuery(bugsLink).add('label:bug');

	issuesTab.after(bugsTab);

	// Update bugs count
	try {
		bugsCounter.textContent = numberFormatter.format(await countPromise);
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
