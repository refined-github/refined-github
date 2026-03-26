import React from 'dom-chef';
import {CachedFunction} from 'webext-storage-cache';
import {countElements} from 'select-dom';
import {$, $optional} from 'select-dom/strict.js';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import fetchDom from '../helpers/fetch-dom.js';
import api from '../github-helpers/api.js';
import getTabCount from '../github-helpers/get-tab-count.js';
import looseParseInt from '../helpers/loose-parse-int.js';
import abbreviateNumber from '../helpers/abbreviate-number.js';
import {
	buildRepoURL,
	cacheByRepo,
	getRepo,
	isNewRepoNav,
} from '../github-helpers/index.js';
import {unhideOverflowDropdown} from './more-dropdown-links.js';

async function canUserEditOrganization(): Promise<boolean> {
	return Boolean(await elementReady('.btn-primary[href$="repositories/new"]'));
}

function mustKeepTab(tab: HTMLElement): boolean {
	return (
		// User is on tab 👀
		tab.matches('.selected, [aria-current="page"]')
		// Repo owners should see the tab. If they don't need it, they should disable the feature altogether
		|| pageDetect.canUserAdminRepo()
	);
}

function setTabCounter(tab: HTMLElement, count: number): void {
	let tabCounter = $optional([
		// Old nav
		'.Counter',
		'.num',
		// New Primer React nav
		'[data-component="counter"] span[aria-hidden]',
	], tab);
	if (!tabCounter) {
		tabCounter = <span className="Counter" /> as HTMLSpanElement;
		tab.append(<span data-component="counter">{tabCounter}</span>);
	}

	tabCounter.textContent = abbreviateNumber(count);
	tabCounter.title = count > 999 ? String(count) : '';
}

function onlyShowInDropdown(id: string): void {
	if (isNewRepoNav()) {
		// New React nav manages overflow internally; hide tab via CSS instead
		const tab = $optional(`a[data-hotkey][href*="${id.replace('-tab', '')}"]`)
			?? $optional(`[data-tab-item$="${id}"]`);
		tab?.closest('li')?.setAttribute('hidden', '');
		return;
	}

	// Old nav: move tab to overflow dropdown
	const tabItem = $optional(`li:not([hidden]) > [data-tab-item$="${id}"]`);
	if (!tabItem) { // #3962 #7140
		return;
	}

	tabItem.closest('li')!.hidden = true;

	const menuItem = $(`[data-menu-item$="${id}"]`);
	menuItem.removeAttribute('data-menu-item');
	menuItem.hidden = false;
	// The item has to be moved somewhere else because the overflow nav is order-dependent
	$('.UnderlineNav-actions ul').append(menuItem);
}

const wikiPageCount = new CachedFunction('wiki-page-count', {
	async updater(): Promise<number> {
		const dom = await fetchDom(buildRepoURL('wiki'));
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
	// Old nav uses hotkey; new React nav has no data-hotkey on tabs
	const wikiTab = await elementReady(
		'[data-hotkey="g w"], nav[aria-label="Repository"] ul[role="list"] a[href$="/wiki"]',
	);
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
	const actionsTab = await elementReady(
		'[data-hotkey="g a"], nav[aria-label="Repository"] ul[role="list"] a[href$="/actions"]',
	);
	if (!actionsTab || mustKeepTab(actionsTab) || await hasActionRuns.get(getRepo()!.nameWithOwner)) {
		return false;
	}

	onlyShowInDropdown('actions-tab');
}

async function updateProjectsTab(): Promise<void | false> {
	const projectsTab = await elementReady(
		'[data-hotkey="g b"], nav[aria-label="Repository"] ul[role="list"] a[href$="/projects"]',
	);
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
	if (isNewRepoNav()) {
		// New React nav: hide tabs directly via CSS; overflow is managed by React
		const securityTab = $optional('[data-hotkey="g s"]')
			?? $optional('nav[aria-label="Repository"] ul[role="list"] a[href$="/security"]');
		if (securityTab && !mustKeepTab(securityTab) && await getTabCount(securityTab) === 0) {
			onlyShowInDropdown('security-tab');
		}

		onlyShowInDropdown('insights-tab');
		return;
	}

	// Old nav: use overflow dropdown
	if (!await unhideOverflowDropdown()) {
		return false;
	}

	// Wait for the nav dropdown to be loaded #5244
	await elementReady('.UnderlineNav-actions ul');

	const securityTab = $optional('[data-tab-item$="security-tab"]');
	if (securityTab && !mustKeepTab(securityTab) && await getTabCount(securityTab) === 0) {
		onlyShowInDropdown('security-tab');
	}

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
	include: [
		pageDetect.hasRepoHeader,
	],
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
- Repo with 0 actions: https://github.com/babel/jade-babel
- Repo with some actions not on main branch: https://github.com/quatquatt/no-actions-menu
- Repo with security alerts: (requires a repo you own with Dependabot alerts enabled)

*/
