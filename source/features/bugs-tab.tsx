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
import {highlightTab, unhighlightTab} from '../helpers/dom-utils';

const supportedLabels = /^(bug|confirmed-bug|type[:/]bug|kind[:/]bug|(:[\w-]+:|\p{Emoji})bug)$/iu;
const getBugLabelCacheKey = (): string => 'bugs-label:' + getRepo()!.nameWithOwner;
const getBugLabel = async (): Promise<string | undefined> => cache.get<string>(getBugLabelCacheKey());
const isBugLabel = (label: string): boolean => supportedLabels.test(label.replace(/\s/g, ''));

async function countBugsWithUnknownLabel(): Promise<number> {
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

	const label: AnyObject | undefined = repository.labels.nodes
		.find((label: AnyObject) => isBugLabel(label.name));
	if (!label) {
		return 0;
	}

	void cache.set(getBugLabelCacheKey(), label.name ?? false);
	return label.issues.totalCount ?? 0;
}

async function countIssuesWithLabel(label: string): Promise<number> {
	const {repository} = await api.v4(`
		repository() {
			label(name: "${label}") {
				issues(states: OPEN) {
					totalCount
				}
			}
		}
	`);

	return repository.label?.issues.totalCount ?? 0;
}

const countBugs = cache.function(async (): Promise<number> => {
	const bugLabel = await getBugLabel();
	return bugLabel
		? countIssuesWithLabel(bugLabel)
		: countBugsWithUnknownLabel();
}, {
	maxAge: {minutes: 30},
	staleWhileRevalidate: {days: 4},
	cacheKey: (): string => 'bugs:' + getRepo()!.nameWithOwner,
});

async function getSearchQueryBugLabel(): Promise<string> {
	return 'label:' + SearchQuery.escapeValue(await getBugLabel() ?? 'bug');
}

async function isBugsListing(): Promise<boolean> {
	return SearchQuery.from(location).includes(await getSearchQueryBugLabel());
}

async function addBugsTab(): Promise<void | false> {
	// Query API as early as possible, even if it's not necessary on archived repos
	const countPromise = countBugs();

	// On a label:bug listing:
	// - always show the tab, as soon as possible
	// - update the count later
	// On other pages:
	// - only show the tab if needed
	if (!await isBugsListing() && await countPromise === 0) {
		return false;
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
	const bugsTabTitle = select('[data-content]', bugsTab)!;
	bugsTabTitle.dataset.content = 'Bugs';
	bugsTabTitle.textContent = 'Bugs';
	select('.octicon', bugsTab)!.replaceWith(<BugIcon className="UnderlineNav-octicon d-none d-sm-inline"/>);

	// Set temporary counter
	const bugsCounter = select('.Counter', bugsTab)!;
	bugsCounter.textContent = '0';
	bugsCounter.title = '';

	// Update Bugs’ link
	bugsTab.href = SearchQuery.from(bugsTab).add(await getSearchQueryBugLabel()).href;

	// In case GitHub changes its layout again #4166
	if (issuesTab.parentElement instanceof HTMLLIElement) {
		issuesTab.parentElement.after(<li className="d-flex">{bugsTab}</li>);
	} else {
		issuesTab.after(bugsTab);
	}

	// Trigger a reflow to push the right-most tab into the overflow dropdown
	window.dispatchEvent(new Event('resize'));

	// Update bugs count
	try {
		const bugCount = await countPromise;
		bugsCounter.textContent = abbreviateNumber(bugCount);
		bugsCounter.title = bugCount > 999 ? String(bugCount) : '';
	} catch (error: unknown) {
		bugsCounter.remove();
		throw error; // Likely an API call error that will be handled by the init
	}
}

function highlightBugsTab(): void {
	// Remove highlighting from "Issues" tab
	unhighlightTab(select('.UnderlineNav-item[data-hotkey="g i"]')!);
	highlightTab(select('.rgh-bugs-tab')!);
}

async function removePinnedIssues(): Promise<void> {
	const pinnedIssues = await elementReady('.js-pinned-issues-reorder-container', {waitForChildren: false});
	pinnedIssues?.remove();
}

async function updateBugsTagHighlighting(): Promise<void | false> {
	if (await countBugs() === 0) {
		return false;
	}

	const bugLabel = await getBugLabel() ?? 'bug';
	if (
		(pageDetect.isRepoTaxonomyConversationList() && location.href.endsWith('/labels/' + encodeURIComponent(bugLabel)))
		|| (pageDetect.isRepoIssueList() && await isBugsListing())
	) {
		void removePinnedIssues();
		highlightBugsTab();
		return;
	}

	if (pageDetect.isIssue() && await elementReady(`#partial-discussion-sidebar .IssueLabel[data-name="${bugLabel}"]`)) {
		highlightBugsTab();
		return;
	}

	return false;
}

async function init(): Promise<void | false> {
	if (!select.exists('.rgh-bugs-tab')) {
		await addBugsTab();
	}

	await updateBugsTagHighlighting();
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepo,
	],
	awaitDomReady: false,
	deduplicate: false,
	init,
});
