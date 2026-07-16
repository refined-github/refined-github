import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import BugIcon from 'octicons-plain-react/Bug';
import {CachedFunction} from 'webext-storage-cache';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import isBugLabel from '../github-helpers/bugs-label.js';
import {buildRepoUrl, cacheByRepo} from '../github-helpers/index.js';
import SearchQuery from '../github-helpers/search-query.js';
import {addTab, selectTab, updateTab} from '../helpers/extensible-nav-store.js';
import CountBugs from './bugs-tab.gql';
import onetime from '../helpers/onetime.js';

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

async function addBugsTabOnce(): Promise<void | false> {
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

	const {href} = new SearchQuery(buildRepoUrl('issues'))
		.append(await getSearchQueryBugLabel());

	addTab({
		id: 'bugs',
		href,
		label: 'Bugs',
		icon: BugIcon,
	}, 'pull-requests');

	// Update bugs count
	try {
		const {count: counter} = await bugsPromise;
		updateTab('bugs', {counter});
	} catch (error) {
		updateTab('bugs', {counter: undefined});
		throw error; // Likely an API call error that will be handled by the init
	}
}

async function removePinnedIssues(): Promise<void> {
	// TODO: Move to CSS, but it needs to be removed when the user navigates away from the bugs tab
	const pinnedIssues = await elementReady('ul[class*="PinnedIssues-module__area"]', {
		waitForChildren: false,
		stopOnDomReady: false,
		signal: AbortSignal.timeout(1000),
	});

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

void features.add(import.meta.url, {
	asLongAs: [
		pageDetect.hasRepoHeader,
		// Some repos may disable issues altogether
		() => Boolean(elementReady('li[data-tab-item="issues"]', {waitForChildren: false})),
	],
	requiresToken: true,
	init: onetime(addBugsTabOnce),
}, {
	include: [
		pageDetect.hasRepoHeader,
	],
	requiresToken: true,
	init: updateBugsTagHighlighting,
});

/*

Test URLs:

"bug" label: https://github.com/refined-github/refined-github/issues
"bug-fix" label: https://github.com/axios/axios/issues
Issues disabled: https://github.com/refined-github/yolo

*/
