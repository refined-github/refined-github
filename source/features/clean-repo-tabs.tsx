import cache from 'webext-storage-cache';
import select from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import fetchDom from '../helpers/fetch-dom';
import * as api from '../github-helpers/api';
import getTabCount from '../github-helpers/get-tab-count';
import looseParseInt from '../helpers/loose-parse-int';
import abbreviateNumber from '../helpers/abbreviate-number';
import {buildRepoURL, getRepo} from '../github-helpers';
import {unhideOverflowDropdown} from './more-dropdown-links';

async function canUserEditOrganization(): Promise<boolean> {
	return Boolean(await elementReady('.btn-primary[href$="repositories/new"]'));
}

function mustKeepTab(tab: HTMLElement | undefined): boolean {
	return (
		!tab // Tab disabled 🎉
		|| tab.matches('.selected')// User is on tab 👀
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

const getWikiPageCount = cache.function(async (): Promise<number> => {
	const wikiPages = await fetchDom(buildRepoURL('wiki'), '#wiki-pages-box .Counter');
	return looseParseInt(wikiPages);
}, {
	maxAge: {hours: 1},
	staleWhileRevalidate: {days: 5},
	cacheKey: () => 'wiki-page-count:' + getRepo()!.nameWithOwner,
});

const getWorkflowsCount = cache.function(async (): Promise<number> => {
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
	cacheKey: () => 'workflows-count:' + getRepo()!.nameWithOwner,
});

async function initWiki(): Promise<void | false> {
	const wikiTab = await elementReady('[data-hotkey="g w"]');
	if (!wikiTab) {
		return false;
	}

	const wikiPageCount = await getWikiPageCount();
	if (wikiPageCount > 0 || mustKeepTab(wikiTab)) {
		setTabCounter(wikiTab, wikiPageCount);
	} else {
		onlyShowInDropdown('wiki-tab');
	}
}

async function initActions(): Promise<void | false> {
	const actionsTab = await elementReady('[data-hotkey="g a"]');
	if (!actionsTab) {
		return false;
	}

	const actionsCount = await getWorkflowsCount();
	if (actionsCount > 0 || mustKeepTab(actionsTab)) {
		setTabCounter(actionsTab, actionsCount);
	} else {
		onlyShowInDropdown('actions-tab');
	}
}

async function initProjects(): Promise<void | false> {
	const projectsTab = await elementReady('[data-hotkey="g b"]');
	if (await getTabCount(projectsTab!) > 0 || mustKeepTab(projectsTab)) {
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

	projectsTab!.remove();
}

async function init(): Promise<void> {
	// The user may have disabled `more-dropdown-links` so un-hide it
	await unhideOverflowDropdown();

	// Wait for the nav dropdown to be loaded #5244
	await elementReady('.UnderlineNav-actions ul');
	onlyShowInDropdown('security-tab');
	onlyShowInDropdown('insights-tab');
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepo,
	],
	awaitDomReady: false,
	init,
}, {
	include: [
		pageDetect.isRepo,
		pageDetect.isOrganizationProfile,
	],
	awaitDomReady: false,
	init: initProjects,
}, {
	include: [
		pageDetect.isRepo,
	],
	awaitDomReady: false,
	init: initActions,
}, {
	include: [
		pageDetect.isRepo,
	],
	awaitDomReady: false,
	init: initWiki,
});
