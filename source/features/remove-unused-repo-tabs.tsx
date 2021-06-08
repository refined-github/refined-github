import cache from 'webext-storage-cache';
import select from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import fetchDom from '../helpers/fetch-dom';
import looseParseInt from '../helpers/loose-parse-int';
import abbreviateNumber from '../helpers/abbreviate-number';
import {buildRepoURL, getRepo} from '../github-helpers';

function setTabCounter(tab: HTMLElement, count: number | false | undefined): void {
	if (!tab || !count || count === 0) {
		return;
	}

	const tabCounter = select('.Counter', tab)!;
	tabCounter.textContent = abbreviateNumber(count);
	tabCounter.title = count > 999 ? String(count) : '';
}

const getWikiPageCount = cache.function(async (): Promise<number | false> => {
	const wikiPages = await fetchDom(buildRepoURL('wiki'), '#wiki-pages-box .Counter');
	if (!wikiPages) {
		return false;
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
	setTabCounter(wikiTab, wikiPageCount);
}

// eslint-disable-next-line import/prefer-default-export
export const getWorkflows = cache.function(async (): Promise<AnyObject[] | false> => {
	const {repository: {workflowFiles}} = await api.v4(`
		repository() {
			workflowFiles: object(expression: "HEAD:.github/workflows") {
				... on Tree {
					entries {
						object {
							... on Blob {
								text
							}
						}
					}
				}
			}
		}
	`);

	const workflows = workflowFiles?.entries;
	if (!workflows) {
		return false;
	}

	return workflows;
}, {
	maxAge: {days: 1},
	staleWhileRevalidate: {days: 10},
	cacheKey: () => __filebasename + ':' + getRepo()!.nameWithOwner
});

async function initActions(): Promise<void | false> {
	const actionsTab = await elementReady('[data-hotkey="g a"]');

	if (!actionsTab) {
		return false;
	}

	const actionsCount = await getWorkflows();
	setTabCounter(actionsTab, actionsCount?.length);
}

void features.add(__filebasename, {
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
