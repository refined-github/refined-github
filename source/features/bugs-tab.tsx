import React from 'dom-chef';
import {CachedFunction} from 'webext-storage-cache';
import {$} from 'select-dom/strict.js';
import {elementExists} from 'select-dom';
import BugIcon from 'octicons-plain-react/Bug';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {cacheByRepo, triggerRepoNavOverflow} from '../github-helpers/index.js';
import SearchQuery from '../github-helpers/search-query.js';
import abbreviateNumber from '../helpers/abbreviate-number.js';
import {highlightTab, unhighlightTab} from '../helpers/dom-utils.js';
import isBugLabel from '../github-helpers/bugs-label.js';
import CountBugs from './bugs-tab.gql';
import {expectToken} from '../github-helpers/github-token.js';

type ApiResponse = {
	issues?: {
		totalCount?: number;
	};
	labels?: {
		nodes?: Array<{
			name: string;
			issues: {
				totalCount?: number;
			};
		}>;
	};
};

type Bugs = {
	label: string;
	count: number;
};

async function countBugs(): Promise<Bugs> {
	const {repository} = await api.v4(CountBugs) as {repository: ApiResponse};
	const bugTypeCount = repository?.issues?.totalCount ?? 0;

	let label = repository?.labels?.nodes?.find(label => label.name === 'bug');
	if (!label) {
		label = repository?.labels?.nodes?.find(label => isBugLabel(label.name));
	}

	const bugCount = bugTypeCount + (label?.issues?.totalCount ?? 0);
	return {label: label?.name ?? 'bug', count: bugCount};
}

const bugs = new CachedFunction('bugs', {
	updater: countBugs,
	maxAge: {minutes: 30},
	staleWhileRevalidate: {days: 4},
	cacheKey: cacheByRepo,
});

async function getSearchQueryBugLabel(): Promise<string> {
	const {label} = await bugs.getCached() ?? {};
	return `(label:${SearchQuery.escapeValue(label ?? 'bug')} OR type:Bug)`;
}

async function isBugsListing(): Promise<boolean> {
	return SearchQuery.from(location).includes(await getSearchQueryBugLabel());
}

async function addBugsTab(): Promise<void | false> {
	// Query API as early as possible, even if it's not necessary on archived repos
	const bugsPromise = bugs.get();

	// On a label:bug listing:
	// - always show the tab, as soon as possible
	// - update the count later
	// On other pages:
	// - only show the tab if needed
	if (!(await isBugsListing())) {
		const {count} = await bugsPromise;
		if (count === 0) {
			return false;
		}
	}

	const issuesTab = await elementReady('a.UnderlineNav-item[data-hotkey="g i"]', {waitForChildren: false});
	if (!issuesTab) {
		// Issues are disabled
		return false;
	}

	// Copy Issues tab
	const bugsTab = issuesTab.cloneNode(true);
	bugsTab.classList.add('rgh-bugs-tab');
	unhighlightTab(bugsTab);

	// Disable unwanted behavior #3001
	delete bugsTab.dataset.hotkey;
	delete bugsTab.dataset.selectedLinks;
	bugsTab.removeAttribute('id');

	// Update its appearance
	const bugsTabTitle = $('[data-content]', bugsTab);
	bugsTabTitle.dataset.content = 'Bugs';
	bugsTabTitle.textContent = 'Bugs';
	$('.octicon', bugsTab).replaceWith(<BugIcon className="UnderlineNav-octicon d-none d-sm-inline" />);

	// Set temporary counter
	const bugsCounter = $('.Counter', bugsTab);
	bugsCounter.textContent = '0';
	bugsCounter.title = '';

	// Update Bugs’ link
	bugsTab.href = SearchQuery.from(bugsTab).append(await getSearchQueryBugLabel()).href;

	// In case GitHub changes its layout again #4166
	if (issuesTab.parentElement instanceof HTMLLIElement) {
		issuesTab.parentElement.after(<li className="d-inline-flex">{bugsTab}</li>);
	} else {
		issuesTab.after(bugsTab);
	}

	triggerRepoNavOverflow();

	// Update bugs count
	try {
		const {count: bugCount} = await bugsPromise;
		bugsCounter.textContent = abbreviateNumber(bugCount);
		bugsCounter.title = bugCount > 999 ? String(bugCount) : '';
	} catch (error) {
		bugsCounter.remove();
		throw error; // Likely an API call error that will be handled by the init
	}
}

// TODO: Use native highlighting https://github.com/refined-github/refined-github/pull/6909#discussion_r1322607091
function highlightBugsTab(): void {
	// Remove highlighting from "Issues" tab
	unhighlightTab($('.UnderlineNav-item[data-hotkey="g i"]'));
	highlightTab($('.rgh-bugs-tab'));
}

async function removePinnedIssues(): Promise<void> {
	const pinnedIssues = await elementReady('.js-pinned-issues-reorder-container', {waitForChildren: false});
	pinnedIssues?.remove();
}

async function updateBugsTagHighlighting(): Promise<void | false> {
	const {count, label} = await bugs.get();
	if (count === 0) {
		return false;
	}

	if (
		(pageDetect.isRepoTaxonomyIssueOrPRList() && location.href.endsWith('/labels/' + encodeURIComponent(label)))
		|| (pageDetect.isRepoIssueList() && (await isBugsListing()))
	) {
		void removePinnedIssues();
		highlightBugsTab();
		return;
	}

	if (pageDetect.isIssue() && (await elementReady(`#partial-discussion-sidebar .IssueLabel[data-name="${label}"]`))) {
		highlightBugsTab();
		return;
	}

	return false;
}

async function init(): Promise<void | false> {
	await expectToken();

	if (!elementExists('.rgh-bugs-tab')) {
		await addBugsTab();
	}

	await updateBugsTagHighlighting();
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasRepoHeader,
	],
	init,
});

/*

Test URLs:

"bug" label: https://github.com/refined-github/refined-github/issues
"bug-fix" label: https://github.com/axios/axios/issues
Issues disabled: https://github.com/refined-github/yolo

*/
