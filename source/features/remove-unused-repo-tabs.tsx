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
import {buildRepoURL, getRepo} from '../github-helpers';

async function tabCanBeRemoved(tab: HTMLElement | undefined, counterFunction: Function): Promise<void | false> {
	if (
		!tab || // Tab disabled 🎉
		tab.matches('.selected') || // User is on tab 👀
		await counterFunction(tab)?.length > 0 // There are open whatever
	) {
		return false;
	}
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

	if (await tabCanBeRemoved(wikiTab, getWikiPageCount)) {
		wikiTab!.remove();
	}

	if (wikiTab) {
		setTabCounter(wikiTab, await getWikiPageCount());
	}
}

async function initActions(): Promise<void | false> {
	const actionsTab = await elementReady('[data-hotkey="g a"]');

	if (await tabCanBeRemoved(actionsTab, getWorkflows)) {
		actionsTab!.remove();
	}

	if (actionsTab) {
		const actionsCount = await getWorkflows() as AnyObject[];
		setTabCounter(actionsTab, actionsCount.length);
	}
}

async function initProjects(): Promise<void | false> {
	const projectsTab = await getProjectsTab();
	if (await tabCanBeRemoved(projectsTab, getTabCount)) {
		projectsTab!.remove();
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isRepo,
		pageDetect.isUserProfile,
		pageDetect.isOrganizationProfile
	],
	exclude: [
		// Repo/Organization owners should see the tab. If they don't need it, they should disable Projects altogether
		pageDetect.canUserEditRepo,
		pageDetect.canUserEditOrganization
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
