import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import BugIcon from 'octicons-plain-react/Bug';
import {CachedFunction} from 'webext-storage-cache';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import isBugLabel from '../github-helpers/bugs-label.js';
import {cacheByRepo} from '../github-helpers/index.js';
import SearchQuery from '../github-helpers/search-query.js';
import abbreviateNumber from '../helpers/abbreviate-number.js';
import {addTab, selectTab, updateTab} from '../helpers/extensible-nav-tabs.js';
import CountBugs from './bugs-tab.gql';

type ApiResponse = {
	issues: {
		totalCount: number;
	};
	labels: {
		nodes: Array<{
			name: string;
			issues: {
				totalCount: number;
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
	const bugTypeCount = repository.issues.totalCount;

	let label = repository.labels.nodes.find(({name}) => name === 'bug');
	label ??= repository.labels.nodes.find(({name}) => isBugLabel(name));

	// Label might not be found if the repo uses a non-standard bug label name
	const bugLabelCount = label?.issues.totalCount ?? 0;
	const bugCount = Math.max(bugTypeCount, bugLabelCount);

	// Label might not be found if the repo uses a non-standard bug label name
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

let added = false;

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

	const href = SearchQuery.from(location).append(await getSearchQueryBugLabel()).href;

	addTab({
		id: 'bugs',
		href,
		label: 'Bugs',
		icon: BugIcon,
		counter: '0',
	}, 'pull-requests');
	added = true;

	// Update bugs count
	try {
		const {count: bugCount} = await bugsPromise;
		updateTab('bugs', {counter: bugCount > 0 ? abbreviateNumber(bugCount) : undefined});
	} catch (error) {
		updateTab('bugs', {counter: undefined});
		throw error; // Likely an API call error that will be handled by the init
	}
}

async function removePinnedIssues(): Promise<void> {
	const pinnedIssues = await elementReady('.js-pinned-issues-reorder-container', {waitForChildren: false});
	// The repo might not have any pinned issues
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
		selectTab('bugs');
		return;
	}

	if (pageDetect.isIssue() && (await elementReady(`#partial-discussion-sidebar .IssueLabel[data-name="${label}"]`))) {
		selectTab('bugs');
		return;
	}

	return false;
}

async function init(): Promise<void | false> {
	if (!added) {
		await addBugsTab();
	}

	await updateBugsTagHighlighting();
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasRepoHeader,
	],
	requiresToken: true,
	init,
});

/*

Test URLs:

"bug" label: https://github.com/refined-github/refined-github/issues
"bug-fix" label: https://github.com/axios/axios/issues
Issues disabled: https://github.com/refined-github/yolo

*/
