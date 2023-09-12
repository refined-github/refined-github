import React from 'dom-chef';
import {CachedFunction} from 'webext-storage-cache';
import select from 'select-dom';
import {TagIcon} from '@primer/octicons-react';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import observe from '../helpers/selector-observer.js';
import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import looseParseInt from '../helpers/loose-parse-int.js';
import abbreviateNumber from '../helpers/abbreviate-number.js';
import createDropdownItem from '../github-helpers/create-dropdown-item.js';
import {buildRepoURL, cacheByRepo, getRepo} from '../github-helpers/index.js';
import {releasesSidebarSelector} from './clean-repo-sidebar.js';
import {appendBefore, highlightTab, unhighlightTab} from '../helpers/dom-utils.js';
import {repoUnderlineNavUrl, repoUnderlineNavDropdownUl} from '../github-helpers/selectors.js';
import GetReleasesCount from './releases-tab.gql';

async function parseCountFromDom(): Promise<number> {
	const moreReleasesCountElement = await elementReady(releasesSidebarSelector + ' .Counter');
	if (moreReleasesCountElement) {
		return looseParseInt(moreReleasesCountElement);
	}

	return 0;
}

async function fetchFromApi(nameWithOwner: string): Promise<number> {
	const [owner, name] = nameWithOwner.split('/');
	const {repository} = await api.v4(GetReleasesCount, {
		variables: {name, owner},
	});

	return repository.releases.totalCount;
}

// Release count can be not found in DOM if:
// - It is disabled by repository owner on the home page (release DOM element won't be there)
// - It only contains pre-releases (count badge won't be shown)
// For this reason, if we can't find a count from the DOM, we ask the API instead (see #6298)
export const releasesCount = new CachedFunction('releases-count', {
	updater: async (nameWithOwner: string) => await parseCountFromDom() || fetchFromApi(nameWithOwner),
	maxAge: {hours: 1},
	staleWhileRevalidate: {days: 3},
	cacheKey: cacheByRepo,
});

async function addReleasesTab(): Promise<false | void> {
	const repo = getRepo()!.nameWithOwner;
	const count = pageDetect.isRepoRoot()
		// Always prefer the information in the DOM
		? await releasesCount.getFresh(repo)
		: await releasesCount.get(repo);

	if (count === 0) {
		return false;
	}

	// Wait for the tab bar to be loaded
	const repoNavigationBar = (await elementReady(repoUnderlineNavUrl))!;
	const releasesTab = (
		<li className="d-flex">
			<a
				href={buildRepoURL('releases')}
				className="js-selected-navigation-item UnderlineNav-item hx_underlinenav-item no-wrap js-responsive-underlinenav-item rgh-releases-tab"
				data-hotkey="g r"
				data-selected-links="repo_releases"
				data-tab-item="rgh-releases-item"
			>
				<TagIcon className="UnderlineNav-octicon d-none d-sm-inline"/>
				<span data-content="Releases">Releases</span>
				{count && <span className="Counter" title={count > 999 ? String(count) : ''}>{abbreviateNumber(count)}</span>}
			</a>
		</li>
	);
	repoNavigationBar.append(releasesTab);

	// This re-triggers the overflow listener forcing it to also hide this tab if necessary #3347
	repoNavigationBar.replaceWith(repoNavigationBar);

	// Trigger a reflow to push the right-most tab into the overflow dropdown (second attempt #4254)
	window.dispatchEvent(new Event('resize'));

	const dropdownMenu = await elementReady(repoUnderlineNavDropdownUl);

	appendBefore(
		dropdownMenu!,
		'.dropdown-divider', // Won't exist if `more-dropdown` is disabled
		createDropdownItem('Releases', buildRepoURL('releases'), {
			'data-menu-item': 'rgh-releases-item',
		}),
	);
}

function highlightReleasesTab(signal: AbortSignal): void {
	observe('.UnderlineNav-item.selected:not(.rgh-releases-tab)', unhighlightTab, {signal});
	highlightTab(select('.rgh-releases-tab')!);
}

async function init(signal: AbortSignal): Promise<void> {
	if (!select.exists('.rgh-releases-tab')) {
		await addReleasesTab();
	}

	if (pageDetect.isReleasesOrTags()) {
		highlightReleasesTab(signal);
	}
}

void features.add(import.meta.url, {
	shortcuts: {
		'g r': 'Go to Releases',
	},
	include: [
		pageDetect.hasRepoHeader,
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/refined-github

*/
