import * as pageDetect from 'github-url-detection';
import {CachedFunction} from 'webext-storage-cache';
import {writable} from 'svelte/store';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {cacheByRepo, buildRepoUrl} from '../github-helpers/index.js';
import fetchDom from '../helpers/fetch-dom.js';
import looseParseInt from '../helpers/loose-parse-int.js';
import {overrideTab} from '../components/extensible-nav-store.js';
import {expectTokenScope} from '../github-helpers/github-token.js';
import RepoCountInfo from './extended-repo-tabs.gql';

type RepoTabsCounts = {
	projects: number;
	actionRuns: number;
};

const cacheOptions = {
	maxAge: {days: 1},
	staleWhileRevalidate: {days: 10},
	cacheKey: cacheByRepo,
} as const;

const repoTabsCounts = new CachedFunction('repo-tabs-counts', {
	async updater(): Promise<RepoTabsCounts> {
		await expectTokenScope('read:project');
		const {repository} = await api.v4(RepoCountInfo);

		return {
			// Projects undefined if not enabled in the repo
			projects: repository.projectsV2?.totalCount ?? 0,
			actionRuns: repository.defaultBranchRef.target.checkSuites.totalCount,
		};
	},
	...cacheOptions,
});

const wikiPageCount = new CachedFunction('wiki-page-count', {
	async updater(): Promise<number> {
		// No v3/v4 API access at all
		const counter = await fetchDom(buildRepoUrl('wiki'), '#wiki-pages-box .Counter');
		return looseParseInt(counter);
	},
	...cacheOptions,
});

async function updateWikiTab(): Promise<void> {
	const count = await wikiPageCount.get();
	if (count > 0) {
		overrideTab('wiki', {counter: writable(count)});
	} else {
		overrideTab('wiki', {demoted: true, label: 'Wiki (empty)'});
	}
}

async function updateActionsAndProjectsTabs(): Promise<void> {
	const {projects, actionRuns} = await repoTabsCounts.get();

	if (actionRuns === 0) {
		overrideTab('actions', {demoted: true, label: 'Actions (empty)'});
	}

	if (projects > 0) {
		overrideTab('projects', {counter: writable(projects)});
	} else {
		overrideTab('projects', {demoted: true, label: 'Projects (empty)'});
	}
}

function init(): void {
	overrideTab('pull-requests', {label: 'Pulls'});
	overrideTab('agents', {demoted: true});
	overrideTab('security-and-quality', {demoted: true});
	overrideTab('insights', {demoted: true});

	void updateWikiTab();
	void updateActionsAndProjectsTabs();
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasRepoHeader,
	],
	// The feature partially works without a token
	// requiresToken: true,
	init,
});

/*

Test URLs:

- Org with 0 projects: https://github.com/babel
- Repo with 0 projects: https://github.com/babel/flavortown
- Repo with some projects: https://github.com/github/docs/projects
- Repo with 0 wiki: https://github.com/babel/babel-sublime-snippets
- Repo with some wiki: https://github.com/refined-github/refined-github
- Repo with 0 actions: https://github.com/babel/jade-babel
- Repo with some actions not on main branch: https://github.com/quatquatt/no-actions-menu
- Repo with security alerts: (requires a repo you own with Dependabot alerts enabled)

*/
