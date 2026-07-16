import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import BugIcon from 'octicons-plain-react/Bug';
import {writable} from 'svelte/store';
import {CachedFunction} from 'webext-storage-cache';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import isBugLabel from '../github-helpers/bugs-label.js';
import {buildRepoUrl, cacheByRepo} from '../github-helpers/index.js';
import SearchQuery from '../github-helpers/search-query.js';
import {addTab} from '../helpers/extensible-nav-store.js';
import onetime from '../helpers/onetime.js';
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
	// TODO: misses plain `label:bug` queries because the helper returns `(label:bug OR type:Bug)`
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

	const counter = writable<number | undefined>();
	addTab({
		id: 'rgh-bugs',
		href,
		label: 'Bugs',
		icon: BugIcon,
		counter,
		// eslint-disable-next-line @typescript-eslint/no-use-before-define -- TODO later, smaller diff now
		selected: isBugsTabSelected,
	}, 'pull-requests');

	// Update bugs count
	try {
		const {count: bugCount} = await bugsPromise;
		counter.set(bugCount);
	} catch (error) {
		counter.set(undefined);
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

async function isBugsTabSelected(): Promise<boolean> {
	// Early return when it's certain that it's not selected.
	// This avoids delaying the `selected` check for other tabs.
	if (!pageDetect.isRepoIssueList() && !pageDetect.isIssue()) {
		return false;
	}

	const {count, label} = await bugs.get();
	if (count === 0) {
		return false;
	}

	if (
		(pageDetect.isRepoTaxonomyIssueOrPRList() && location.pathname.endsWith('/labels/' + encodeURIComponent(label)))
		|| (pageDetect.isRepoIssueList() && (await isBugsListing()))
	) {
		// TODO: eh. This side effect should be moved
		void removePinnedIssues();
		return true;
	}

	return pageDetect.isIssue() && Boolean(await elementReady(`#partial-discussion-sidebar .IssueLabel[data-name="${label}"]`));
}

void features.add(import.meta.url, {
	asLongAs: [
		pageDetect.hasRepoHeader,
		// Some repos may disable issues altogether
		() => Boolean(elementReady('li[data-tab-item="issues"]', {waitForChildren: false})),
	],
	requiresToken: true,
	init: onetime(addBugsTabOnce),
});

/*

Test URLs:

- label:bug https://github.com/refined-github/refined-github/issues
- label:"Type: Bug" https://github.com/react/react/issues
- type:Bug: https://github.com/keepassxreboot/keepassxc/issues
- Issues disabled: https://github.com/refined-github/yolo

*/
