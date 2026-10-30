import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import BugIcon from 'octicons-plain-react/Bug';
import {writable} from 'svelte/store';
import {CachedFunction} from 'webext-storage-cache';

import {addTab, overrideTab} from '../components/extensible-nav-store.js';
import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import isBugLabel from '../github-helpers/bugs-label.js';
import {buildRepoUrl, cacheByRepo, getRepo} from '../github-helpers/index.js';
import SearchQuery from '../github-helpers/search-query.js';
import onetime from '../helpers/onetime.js';
import CountExactBugs from './bugs-tab-exact.gql';
import CountBugs from './bugs-tab.gql';

type ApiResponse = {
	repository: {
		labels: {
			nodes: Array<{name: string}>;
		};
	};
	search: {
		issueCount: number;
	};
};

type Bugs = {
	label?: string;
	count: number;
};

function getFullSearchQuery(bugsLabel: string | undefined): string {
	return bugsLabel ? `(label:${SearchQuery.escapeValue(bugsLabel)} OR type:Bug)` : 'type:Bug';
}

function getBugsSearch(bugsLabel: string | undefined): SearchQuery {
	return new SearchQuery(buildRepoUrl('issues')).append(getFullSearchQuery(bugsLabel));
}

function getApiQuery(bugsLabel: string | undefined): string {
	return `repo:${getRepo()!.nameWithOwner} ${getBugsSearch(bugsLabel).query}`;
}

async function countBugs(): Promise<Bugs> {
	// Search "bug" already, the most common label, to avoid a second request in most repos
	const {repository, search} = await api.v4(CountBugs, {
		variables: {query: getApiQuery('bug')},
	}) as ApiResponse;

	const names = repository.labels.nodes.map(({name}) => name);
	// Label might not be found if the repo uses a non-standard bug label name or only the Bug issue type
	const label = names.find(name => name === 'bug') ?? names.find(name => isBugLabel(name));

	// Search ignores labels that don't exist, so it's already exact if there's no label (type only) or it's "bug"
	if (label === undefined || label.toLowerCase() === 'bug') {
		return {label, count: search.issueCount};
	}

	const {search: exact} = await api.v4(CountExactBugs, {variables: {query: getApiQuery(label)}});
	return {label, count: exact.issueCount};
}

const bugs = new CachedFunction('bugs', {
	updater: countBugs,
	maxAge: {minutes: 30},
	staleWhileRevalidate: {days: 4},
	cacheKey: cacheByRepo,
});

async function getBugsLabel(): Promise<string | undefined> {
	const cached = await bugs.getCached();
	return cached ? cached.label : 'bug';
}

async function isBugsListing(): Promise<boolean> {
	const query = SearchQuery.from(location);
	const bugsLabel = await getBugsLabel();
	return (bugsLabel !== undefined && query.includes(`label:${SearchQuery.escapeValue(bugsLabel)}`))
		|| query.includes(getFullSearchQuery(bugsLabel));
}

async function addBugsTabOnce(): Promise<void> {
	// Query API as early as possible, even if it's not necessary on archived repos
	const bugsPromise = bugs.get();

	// Always show the tab right away, without waiting for the API.
	// It's hidden later if there are no bugs, or never added if issues are disabled.
	const cached = await bugs.getCached();
	// `cached` is missing on the first visit to a repo
	const counter = writable<number | undefined>(cached?.count);
	addTab({
		id: 'rgh-bugs',
		href: getBugsSearch(cached ? cached.label : 'bug').href,
		label: 'Bugs',
		icon: BugIcon,
		counter,
		// `cached` is missing on the first visit to a repo
		removed: cached?.count === 0,
		// eslint-disable-next-line @typescript-eslint/no-use-before-define -- TODO later, smaller diff now
		selected: isBugsTabSelected,
	}, 'issues');

	try {
		const {label, count} = await bugsPromise;
		counter.set(count);
		overrideTab('rgh-bugs', {href: getBugsSearch(label).href, removed: count === 0});
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
		(label !== undefined && pageDetect.isRepoTaxonomyIssueOrPRList()
			&& location.pathname.endsWith('/labels/' + encodeURIComponent(label)))
		|| (pageDetect.isRepoIssueList() && (await isBugsListing()))
	) {
		// TODO: eh. This side effect should be moved
		void removePinnedIssues();
		return true;
	}

	return label !== undefined
		&& pageDetect.isIssue()
		&& Boolean(await elementReady(`#partial-discussion-sidebar .IssueLabel[data-name="${label}"]`));
}

void features.add(import.meta.url, {
	asLongAs: [
		pageDetect.hasRepoHeader,
	],
	requiresToken: true,
	init: onetime(addBugsTabOnce),
});

/*

Test URLs:

- label:bug https://github.com/refined-github/refined-github/issues
- label:"Type: Bug" https://github.com/react/react/issues
- type:Bug: https://github.com/keepassxreboot/keepassxc/issues
- Issues disabled: https://github.com/bfred-it-org/no-issues/labels

*/
