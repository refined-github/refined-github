import React from 'dom-chef';
import {CachedFunction} from 'webext-storage-cache';
import {countElements} from 'select-dom';
import {$optional} from 'select-dom/strict.js';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import fetchDom from '../helpers/fetch-dom.js';
import api from '../github-helpers/api.js';
import getTabCount from '../github-helpers/get-tab-count.js';
import looseParseInt from '../helpers/loose-parse-int.js';
import abbreviateNumber from '../helpers/abbreviate-number.js';
import {buildRepoUrl, cacheByRepo, getRepo} from '../github-helpers/index.js';
import {
	wikiTab,
	actionsTab,
	projectsTab,
	securityTab,
	insightsTab,
} from '../github-helpers/selectors.js';

async function canUserEditOrganization(): Promise<boolean> {
	return Boolean(await elementReady('.btn-primary[href$="repositories/new"]'));
}

function mustKeepTab(tab: HTMLElement): boolean {
	return (
		// User is on tab
		tab.matches('[aria-current="page"]')
		// Repo owners should see the tab. If they don't need it, they should disable the feature altogether
		|| pageDetect.canUserAdminRepo()
	);
}

function setTabCounter(tab: HTMLElement, count: number): void {
	let tabCounter = $optional('[data-component="counter"]', tab);
	if (!tabCounter) {
		tabCounter = <span className="Counter" /> as HTMLSpanElement;
		tab.append(<span data-component="counter">{tabCounter}</span>);
	}

	tabCounter.textContent = abbreviateNumber(count);
	tabCounter.title = count > 999 ? String(count) : '';
}

function hideTab(tab: HTMLElement): void {
	const li = tab.closest('li');
	if (li) {
		li.hidden = true;
	}
}

const wikiPageCount = new CachedFunction('wiki-page-count', {
	async updater(): Promise<number> {
		const dom = await fetchDom(buildRepoUrl('wiki'));
		const counter = dom.querySelector('#wiki-pages-box .Counter');

		if (counter) {
			return looseParseInt(counter);
		}

		return countElements('#wiki-content > .Box .Box-row', dom);
	},
	maxAge: {hours: 1},
	staleWhileRevalidate: {days: 5},
	cacheKey: cacheByRepo,
});

const hasActionRuns = new CachedFunction('workflows-count', {
	async updater(repoWithOwner: string): Promise<boolean> {
		return api.v3hasAnyItems(`/repos/${repoWithOwner}/actions/runs`);
	},
	maxAge: {days: 1},
	staleWhileRevalidate: {days: 10},
});

async function updateWikiTab(): Promise<void | false> {
	const tab = await elementReady(wikiTab);
	if (!tab || mustKeepTab(tab)) {
		return false;
	}

	const count = await wikiPageCount.get();
	if (count > 0) {
		setTabCounter(tab, count);
	} else {
		hideTab(tab);
	}
}

async function updateActionsTab(): Promise<void | false> {
	const tab = await elementReady(actionsTab);
	if (!tab || mustKeepTab(tab) || await hasActionRuns.get(getRepo()!.nameWithOwner)) {
		return false;
	}

	hideTab(tab);
}

async function updateProjectsTab(): Promise<void | false> {
	const tab = await elementReady(projectsTab);
	if (!tab || mustKeepTab(tab) || await getTabCount(tab) > 0) {
		return false;
	}

	if (pageDetect.isRepo()) {
		hideTab(tab);
		return;
	}

	if (await canUserEditOrganization()) {
		// Leave Project tab visible to those who can create a new project
		return;
	}

	tab.remove();
}

async function hideRareTabs(): Promise<void | false> {
	const security = await elementReady(securityTab);
	if (security && !mustKeepTab(security) && await getTabCount(security) === 0) {
		hideTab(security);
	}

	const insights = await elementReady(insightsTab);
	if (insights && !mustKeepTab(insights)) {
		hideTab(insights);
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasRepoHeader,
	],
	init: [
		updateActionsTab,
		updateWikiTab,
		updateProjectsTab,
		hideRareTabs,
	],
}, {
	include: [
		pageDetect.isOrganizationProfile,
	],
	init: updateProjectsTab,
});

/*

Test URLs:

- Org with 0 projects: https://github.com/babel
- Repo with 0 projects: https://github.com/babel/flavortown
- Repo with 0 wiki: https://github.com/babel/babel-sublime-snippets
- Repo with 0 actions: https://github.com/babel/jade-babel
- Repo with some actions not on main branch: https://github.com/quatquatt/no-actions-menu
- Repo with security alerts: (requires a repo you own with Dependabot alerts enabled)

*/
