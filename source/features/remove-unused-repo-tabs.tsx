import cache from 'webext-storage-cache';
import select from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import fetchDom from '../helpers/fetch-dom';
import getTabCount from '../github-helpers/get-tab-count';
import looseParseInt from '../helpers/loose-parse-int';
import {getWorkflows} from './next-scheduled-github-action';
import abbreviateNumber from '../helpers/abbreviate-number';
import {getProjectsTab} from './remove-projects-tab';
import {onlyShowInDropdown} from './more-dropdown';
import {buildRepoURL, getRepo} from '../github-helpers';

function tabCannotBeHidden(tab: HTMLElement | undefined): boolean {
	if (
		!tab || // Tab disabled 🎉
		tab.matches('.selected') ||// User is on tab 👀
		// Repo/Organization owners should see the tab. If they don't need it, they should disable the feature altogether
		pageDetect.canUserEditRepo() ||
		pageDetect.canUserEditOrganization()
	) {
		return true;
	}

	return false;
}

function setTabCounter(tab: HTMLElement, count: number): void {
	const tabCounter = select('.Counter', tab)!;
	tabCounter.textContent = abbreviateNumber(count);
	tabCounter.title = count > 999 ? String(count) : '';
}

const getWikiPageCount = cache.function(async (): Promise<number> => {
	const wikiPages = await fetchDom(buildRepoURL('wiki'), '#wiki-pages-box .Counter');
	if (!wikiPages) {
		return 0;
	}

	return looseParseInt(wikiPages);
}, {
	maxAge: {hours: 1},
	staleWhileRevalidate: {days: 5},
	cacheKey: () => __filebasename + 'wiki:' + getRepo()!.nameWithOwner
});

async function initWiki(): Promise<void | false> {
	const wikiTab = await elementReady('[data-hotkey="g w"]');
	if (!wikiTab) {
		return false;
	}

	const wikiPageCount = await getWikiPageCount();
	if (tabCannotBeHidden(wikiTab) || wikiPageCount > 0) {
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

	const actionsCount = (await getWorkflows()).length;
	if (tabCannotBeHidden(actionsTab) || actionsCount > 0) {
		setTabCounter(actionsTab, actionsCount);
	} else {
		onlyShowInDropdown('actions-tab');
	}
}

async function initProjects(): Promise<void | false> {
	const projectsTab = await getProjectsTab();
	if (tabCannotBeHidden(projectsTab) || await getTabCount(projectsTab!) > 0) {
		return false;
	}

	if (pageDetect.isOrganizationProfile()) {
		projectsTab!.remove();
		return;
	}

	onlyShowInDropdown('projects-tab');
}

void features.add(__filebasename, {
	include: [
		pageDetect.isRepo,
		pageDetect.isUserProfile,
		pageDetect.isOrganizationProfile
	],
	awaitDomReady: false,
	init: initProjects
}, {
	include: [
		pageDetect.isRepo
	],
	awaitDomReady: false,
	init: initActions
}, {
	include: [
		pageDetect.isRepo
	],
	awaitDomReady: false,
	init: initWiki
});
