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

async function highlightBugsTabOnIssuePage(): Promise<void | false> {
	if (await countBugs() === 0 || !await elementReady('#partial-discussion-sidebar .IssueLabel[href$="/bug" i]')) {
		return false;
	}

	const bugsTab = await elementReady('.rgh-bug-tab', {stopOnDomReady: false, timeout: 10_000});
	bugsTab!.classList.add('selected');

	const issuesTab = select('.UnderlineNav-item[data-hotkey="g i"]')!;
	issuesTab.classList.remove('selected');
	issuesTab.removeAttribute('aria-current');
}

const cacheKey = (): string => 'bugs-label' + ':' + getRepo()!.nameWithOwner;
const countBugs = cache.function(async (): Promise<number> => {
	if (!await cache.get(cacheKey())) {
		const {repository} = await api.v4(`
			repository() {
				labels(query: "bug", first: 10) {
					nodes {
						name
						issues(states: OPEN) {
							totalCount
						}
					}
				}
			}
		`);

		const {name: bugLabel, issues} = [...repository.labels.nodes].find(label => [':bug: bug', 'bug', 'confirmed-bug', 'type: bug'].includes(label.name.toLowerCase()));
		void cache.set(cacheKey(), bugLabel ?? '');
		return issues?.totalCount ?? 0;
	}

	const {repository} = await api.v4(`
		repository() {
			label(name: "${await cache.get(cacheKey()) ?? 'bug'}") {
				issues(states: OPEN) {
					totalCount
				}
			}
		}
	`);

	return repository.label?.issues.totalCount ?? 0;
}, {
	maxAge: {minutes: 0},
	staleWhileRevalidate: {days: 4},
	cacheKey: (): string => __filebasename + ':' + getRepo()!.nameWithOwner,
});

async function init(): Promise<void | false> {
	// Query API as early as possible, even if it's not necessary on archived repos
	const countPromise = countBugs();

	// On a label:bug listing:
	// - always show the tab, as soon as possible
	// - update the count later
	// On other pages:
	// - only show the tab if needed
	const isBugsPage = new SearchQuery(location.search).includes(`label:${await cache.get(cacheKey()) ?? 'bug'}`);
	if (!isBugsPage && await countPromise === 0) {
		return false;
	}

	const issuesTab = await elementReady('a.UnderlineNav-item[data-hotkey="g i"]', {waitForChildren: false});
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
	bugsTab.classList.add('rgh-bug-tab');

	// Disable unwanted behavior #3001
	bugsTab.removeAttribute('data-hotkey');
	bugsTab.removeAttribute('data-selected-links');
	issuesTab.removeAttribute('data-selected-links');

	// Update its appearance
	const bugsTabTitle = select('[data-content]', bugsTab)!;
	bugsTabTitle.dataset.content = 'Bugs';
	bugsTabTitle.textContent = 'Bugs';
	select('.octicon', bugsTab)!.replaceWith(<BugIcon className="UnderlineNav-octicon d-none d-sm-inline"/>);

	// Un-select one of the tabs if necessary
	const selectedTab = !isBugsPage || pageDetect.isPRList() ? bugsTab : issuesTab;
	selectedTab.classList.remove('selected');
	selectedTab.removeAttribute('aria-current');

	// Set temporary counter
	const bugsCounter = select('.Counter', bugsTab)!;
	bugsCounter.textContent = '0';
	bugsCounter.title = '';

	// Update Bugs’ link
	new SearchQuery(bugsTab).add(`label:${await cache.get(cacheKey()) ?? 'bug'}`);

	// In case GitHub changes its layout again #4166
	if (issuesTab.parentElement!.tagName === 'LI') {
		issuesTab.parentElement!.after(<li className="d-flex">{bugsTab}</li>);
	} else {
		issuesTab.after(bugsTab);
	}

	// Update bugs count
	try {
		const bugCount = await countPromise;
		bugsCounter.textContent = abbreviateNumber(bugCount);
		bugsCounter.title = bugCount > 999 ? String(bugCount) : '';
	} catch (error: unknown) {
		bugsCounter.remove();
		features.error(__filebasename, error);
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isRepo,
	],
	awaitDomReady: false,
	init,
}, {
	include: [
		pageDetect.isIssue,
	],
	awaitDomReady: false,
	deduplicate: false,
	init: highlightBugsTabOnIssuePage,
});
