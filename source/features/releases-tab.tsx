import React from 'dom-chef';
import {CachedFunction} from 'webext-storage-cache';
import {TagIcon} from '@primer/octicons-react';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import observe from '../helpers/selector-observer.js';
import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import abbreviateNumber from '../helpers/abbreviate-number.js';
import createDropdownItem from '../github-helpers/create-dropdown-item.js';
import {buildRepoURL, cacheByRepo, getRepo, triggerRepoNavOverflow} from '../github-helpers/index.js';
import {appendBefore} from '../helpers/dom-utils.js';
import {repoUnderlineNavUl, repoUnderlineNavDropdownUl} from '../github-helpers/selectors.js';
import GetReleasesCount from './releases-tab.gql';

function detachHighlightFromCodeTab(codeTab: HTMLAnchorElement): void {
	codeTab.dataset.selectedLinks = codeTab.dataset.selectedLinks!.replace('repo_releases ', '');
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
	updater: fetchFromApi,
	maxAge: {hours: 1},
	staleWhileRevalidate: {days: 3},
	cacheKey: cacheByRepo,
});

async function addReleasesTab(repoNavigationBar: HTMLElement): Promise<false | void> {
	const repo = getRepo()!.nameWithOwner;
	const count = await releasesCount.get(repo);

	if (count === 0) {
		return false;
	}

	// Wait for the dropdown because `observe` fires as soon as it encounter the container. `releases-tab` must be appended.
	await elementReady(repoUnderlineNavUl);

	repoNavigationBar.append(
		<li className="d-flex">
			<a
				href={buildRepoURL('releases')}
				className="js-selected-navigation-item UnderlineNav-item hx_underlinenav-item no-wrap js-responsive-underlinenav-item rgh-releases-tab"
				data-hotkey="g r"
				data-selected-links="repo_releases"
				data-tab-item="rgh-releases-item"
				data-turbo-frame="repo-content-turbo-frame" /* Required for `data-selected-links` to work */
			>
				<TagIcon className="UnderlineNav-octicon d-none d-sm-inline"/>
				<span data-content="Releases">Releases</span>
				{count && <span className="Counter" title={count > 999 ? String(count) : ''}>{abbreviateNumber(count)}</span>}
			</a>
		</li>,
	);

	triggerRepoNavOverflow();
}

function addReleasesDropdownItem(dropdownMenu: HTMLElement): void {
	appendBefore(
		dropdownMenu,
		'.dropdown-divider', // Won't exist if `more-dropdown` is disabled
		createDropdownItem('Releases', buildRepoURL('releases'), {
			'data-menu-item': 'rgh-releases-item',
		}),
	);

	triggerRepoNavOverflow();
}

async function init(signal: AbortSignal): Promise<void> {
	observe(repoUnderlineNavUl, addReleasesTab, {signal});
	observe(repoUnderlineNavDropdownUl, addReleasesDropdownItem, {signal});
	observe(['[data-menu-item="i0code-tab"] a', 'a#code-tab'], detachHighlightFromCodeTab, {signal});
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
