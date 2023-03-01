import cache from 'webext-storage-cache';
import select from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import fetchDom from '../helpers/fetch-dom';
import * as api from '../github-helpers/api';
import getTabCount from '../github-helpers/get-tab-count';
import looseParseInt from '../helpers/loose-parse-int';
import abbreviateNumber from '../helpers/abbreviate-number';
import {buildRepoURL, cacheByRepo} from '../github-helpers';
import {unhideOverflowDropdown} from './more-dropdown-links';

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
	const tabCounter = select('.Counter', tab)!;
	tabCounter.textContent = abbreviateNumber(count);
	tabCounter.title = count > 999 ? String(count) : '';
}

function onlyShowInDropdown(id: string): void {
	const tabItem = select(`[data-tab-item$="${id}"]`);
	if (!tabItem && pageDetect.isEnterprise()) { // GHE #3962
		return;
	}

	(tabItem!.closest('li') ?? tabItem!.closest('.UnderlineNav-item'))!.classList.add('d-none');

	const menuItem = select(`[data-menu-item$="${id}"]`)!;
	menuItem.removeAttribute('data-menu-item');
	menuItem.hidden = false;
	// The item has to be moved somewhere else because the overflow nav is order-dependent
	select('.UnderlineNav-actions ul')!.append(menuItem);
}

const getWikiPageCount = cache.function('wiki-page-count', async (): Promise<number> => {
	const dom = await fetchDom(buildRepoURL('wiki'));
	const counter = dom.querySelector('#wiki-pages-box .Counter');

	if (counter) {
		return looseParseInt(counter);
	}

	return dom.querySelectorAll('#wiki-content > .Box .Box-row').length;
}, {
	maxAge: {hours: 1},
	staleWhileRevalidate: {days: 5},
	cacheKey: cacheByRepo,
});

const getWorkflowsCount = cache.function('workflows-count', async (): Promise<number> => {
	const {repository: {workflowFiles}} = await api.v4(`
		repository() {
			workflowFiles: object(expression: "HEAD:.github/workflows") {
				... on Tree { entries { oid } }
			}
		}
	`);

	return workflowFiles?.entries.length ?? 0;
}, {
	maxAge: {days: 1},
	staleWhileRevalidate: {days: 10},
	cacheKey: cacheByRepo,
});

async function updateWikiTab(): Promise<void | false> {
	const wikiTab = await elementReady('[data-hotkey="g w"]');
	if (!wikiTab || mustKeepTab(wikiTab)) {
		return false;
	}

	const wikiPageCount = await getWikiPageCount();
	if (wikiPageCount > 0) {
		setTabCounter(wikiTab, wikiPageCount);
	} else {
		onlyShowInDropdown('wiki-tab');
	}
}

async function updateActionsTab(): Promise<void | false> {
	const actionsTab = await elementReady('[data-hotkey="g a"]');
	if (!actionsTab || mustKeepTab(actionsTab) || await getWorkflowsCount() > 0) {
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
	// The user may have disabled `more-dropdown-links` so un-hide it
	if (!await unhideOverflowDropdown()) {
		return false;
	}

	// Wait for the nav dropdown to be loaded #5244
	await elementReady('.UnderlineNav-actions ul');
	onlyShowInDropdown('security-tab');
	onlyShowInDropdown('insights-tab');
}

async function init(): Promise<void> {
	await Promise.all([
		moveRareTabs(),
		updateActionsTab(),
		updateWikiTab(),
		updateProjectsTab(),
	]);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasRepoHeader,
	],
	deduplicate: 'has-rgh',
	init,
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
