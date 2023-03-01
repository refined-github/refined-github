import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import {TagIcon} from '@primer/octicons-react';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import observe from '../helpers/selector-observer';
import features from '../feature-manager';
import * as api from '../github-helpers/api';
import looseParseInt from '../helpers/loose-parse-int';
import abbreviateNumber from '../helpers/abbreviate-number';
import createDropdownItem from '../github-helpers/create-dropdown-item';
import {buildRepoURL, cacheByRepo} from '../github-helpers';
import {releasesSidebarSelector} from './clean-repo-sidebar';
import {appendBefore, highlightTab, unhighlightTab} from '../helpers/dom-utils';

const cacheName = 'releases-count';

async function parseCountFromDom(): Promise<number> {
	const moreReleasesCountElement = await elementReady(releasesSidebarSelector + ' .Counter');
	if (moreReleasesCountElement) {
		return looseParseInt(moreReleasesCountElement);
	}

	return 0;
}

async function fetchFromApi(): Promise<number> {
	const {repository} = await api.v4(`
		repository() {
			releases {
				totalCount
			}
		}
	`);

	return repository.releases.totalCount;
}

// Release count can be not found in DOM if:
// - It is disabled by repository owner on the home page (release DOM element won't be there)
// - It only contains pre-releases (count badge won't be shown)
// For this reason, if we can't find a count from the DOM, we ask the API instead (see #6298)
export const getReleaseCount = cache.function(cacheName, async () => await parseCountFromDom() || fetchFromApi(), {
	maxAge: {hours: 1},
	staleWhileRevalidate: {days: 3},
	cacheKey: cacheByRepo,
});

async function addReleasesTab(): Promise<false | void> {
	// Always prefer the information in the DOM
	if (pageDetect.isRepoRoot()) {
		await cache.delete(cacheName + ':' + cacheByRepo());
	}

	const count = await getReleaseCount();
	if (count === 0) {
		return false;
	}

	// Wait for the tab bar to be loaded
	const repoNavigationBar = (await elementReady('.UnderlineNav-body'))!;
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

	const dropdownMenu = await elementReady('.js-responsive-underlinenav .dropdown-menu ul');

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
