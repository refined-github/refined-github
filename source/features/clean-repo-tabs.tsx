import {CachedFunction} from 'webext-storage-cache';
import {$} from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import fetchDom from '../helpers/fetch-dom.js';
import api from '../github-helpers/api.js';
import getTabCount from '../github-helpers/get-tab-count.js';
import looseParseInt from '../helpers/loose-parse-int.js';
import abbreviateNumber from '../helpers/abbreviate-number.js';
import {buildRepoURL, cacheByRepo} from '../github-helpers/index.js';
import {unhideOverflowDropdown} from './more-dropdown-links.js';
import CountWorkflows from './clean-repo-tabs.gql';

async function canUserEditOrganization(): Promise<boolean> {
	return Boolean(await elementReady('.btn-primary[href$="repositories/new"]'));
}

function mustKeepTab(tab: HTMLElement): boolean {
	return (
		// User is on tab 👀
		tab.matches('.selected')
		// Repo owners should see the tab. If they don't need it, they should disable the feature altogether
		|| pageDetect.canUserEditRepo()
	);
}

function setTabCounter(tab: HTMLElement, count: number): void {
	const tabCounter = $('.Counter', tab)!;
	tabCounter.textContent = abbreviateNumber(count);
	tabCounter.title = count > 999 ? String(count) : '';
}

function onlyShowInDropdown(id: string): void {
	const tabItem = $(`[data-tab-item$="${id}"]`);
	if (!tabItem && pageDetect.isEnterprise()) { // GHE #3962
		return;
	}

	(tabItem!.closest('li') ?? tabItem!.closest('.UnderlineNav-item'))!.classList.add('d-none');

	const menuItem = $(`[data-menu-item$="${id}"]`)!;
	menuItem.removeAttribute('data-menu-item');
	menuItem.hidden = false;
	// The item has to be moved somewhere else because the overflow nav is order-dependent
	$('.UnderlineNav-actions ul')!.append(menuItem);
}

const wikiPageCount = new CachedFunction('wiki-page-count', {
	async updater(): Promise<number> {
		const dom = await fetchDom(buildRepoURL('wiki'));
		const counter = dom.querySelector('#wiki-pages-box .Counter');

		if (counter) {
			return looseParseInt(counter);
		}

		return dom.querySelectorAll('#wiki-content > .Box .Box-row').length;
	},
	maxAge: {hours: 1},
	staleWhileRevalidate: {days: 5},
	cacheKey: cacheByRepo,
});

const workflowCount = new CachedFunction('workflows-count', {
	async updater(): Promise<number> {
		const {repository: {workflowFiles}} = await api.v4(CountWorkflows);

		// TODO: Use native "totalCount" field
		return workflowFiles?.entries.length ?? 0;
	},
	maxAge: {days: 1},
	staleWhileRevalidate: {days: 10},
	cacheKey: cacheByRepo,
});

async function updateWikiTab(): Promise<void | false> {
	const wikiTab = await elementReady('[data-hotkey="g w"]');
	if (!wikiTab || mustKeepTab(wikiTab)) {
		return false;
	}

	const count = await wikiPageCount.get();
	if (count > 0) {
		setTabCounter(wikiTab, count);
	} else {
		onlyShowInDropdown('wiki-tab');
	}
}

async function updateActionsTab(): Promise<void | false> {
	const actionsTab = await elementReady('[data-hotkey="g a"]');
	if (!actionsTab || mustKeepTab(actionsTab) || await workflowCount.get() > 0) {
		return false;
	}

	onlyShowInDropdown('actions-tab');
}

async function updateProjectsTab(): Promise<void | false> {
	const projectsTab = await elementReady('[data-hotkey="g b"]');
	if (!projectsTab || mustKeepTab(projectsTab) || await getTabCount(projectsTab) > 0) {
		return false;
	}

	if (pageDetect.isRepo()) {
		onlyShowInDropdown('projects-tab');
		return;
	}

	if (await canUserEditOrganization()) {
		// Leave Project tab visible to those who can create a new project
		return;
	}

	projectsTab.remove();
}

async function moveRareTabs(): Promise<void | false> {
	// Wait for the nav dropdown to be loaded #5244
	await elementReady('.UnderlineNav-actions ul');
	onlyShowInDropdown('security-tab');
	onlyShowInDropdown('insights-tab');
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasRepoHeader,
	],
	deduplicate: 'has-rgh',
	init: [
		updateActionsTab,
		updateWikiTab,
		updateProjectsTab,
	],
}, {
	asLongAs: [
		// The user may have disabled `more-dropdown-links` so un-hide it
		unhideOverflowDropdown,
	],
	include: [
		pageDetect.hasRepoHeader,
	],
	deduplicate: 'has-rgh',
	init: moveRareTabs,
}, {
	include: [
		pageDetect.isOrganizationProfile,
	],
	deduplicate: 'has-rgh',
	init: updateProjectsTab,
});

/*

Test URLs:

- Org with 0 projects: https://github.com/babel
- Repo with 0 projects: https://github.com/babel/flavortown
- Repo with 0 wiki: https://github.com/babel/babel-sublime-snippets

*/
