import * as pageDetect from 'github-url-detection';
import {CachedFunction} from 'webext-storage-cache';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {cacheByRepo, getRepo, buildRepoUrl} from '../github-helpers/index.js';
import fetchDom from '../helpers/fetch-dom.js';
import looseParseInt from '../helpers/loose-parse-int.js';
import {overrideTab} from '../components/extensible-nav-store.js';
import GetProjectCount from './clean-conversation-filters.gql';
import {expectTokenScope} from '../github-helpers/github-token.js';

const projectsCount = new CachedFunction('projects-count', {
	async updater(): Promise<number> {
		await expectTokenScope('read:project');
		const {repository} = await api.v4(GetProjectCount, {
			allowErrors: true,
		});

		return repository.projectsV2.totalCount;
	},
	maxAge: {days: 1},
	staleWhileRevalidate: {days: 20},
	cacheKey: cacheByRepo,
});

const wikiPageCount = new CachedFunction('wiki-page-count', {
	async updater(): Promise<number> {
		const counter = await fetchDom(buildRepoUrl('wiki'), '#wiki-pages-box .Counter');
		return looseParseInt(counter);
	},
	maxAge: {hours: 1},
	staleWhileRevalidate: {days: 5},
	cacheKey: cacheByRepo,
});

const hasActionRuns = new CachedFunction('workflows-count', {
	async updater(): Promise<boolean> {
		return api.v3hasAnyItems(`/repos/${getRepo()!.nameWithOwner}/actions/runs`);
	},
	maxAge: {days: 1},
	staleWhileRevalidate: {days: 10},
	cacheKey: cacheByRepo,
});

async function updateWikiTab(): Promise<void> {
	const count = await wikiPageCount.get();
	if (count === 0) {
		overrideTab('wiki', {demoted: true});
	}
}

async function updateActionsTab(): Promise<void> {
	if (!await hasActionRuns.get()) {
		overrideTab('actions', {demoted: true});
	}
}

async function updateProjectsTab(): Promise<void> {
	const count = await projectsCount.get();
	if (count === 0) {
		overrideTab('projects', {demoted: true});
	}
}

function init(): void {
	overrideTab('pull-requests', {label: 'Pulls'});
	overrideTab('agents', {demoted: true});
	overrideTab('security-and-quality', {demoted: true});
	overrideTab('insights', {demoted: true});

	void updateWikiTab();
	void updateActionsTab();
	void updateProjectsTab();
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasRepoHeader,
	],
	init,
});

/*

Test URLs:

- Org with 0 projects: https://github.com/babel
- Repo with 0 projects: https://github.com/babel/flavortown
- Repo with some projects: https://github.com/github/docs/projects
- Repo with 0 wiki: https://github.com/babel/babel-sublime-snippets
- Repo with 0 actions: https://github.com/babel/jade-babel
- Repo with some actions not on main branch: https://github.com/quatquatt/no-actions-menu
- Repo with security alerts: (requires a repo you own with Dependabot alerts enabled)

*/
