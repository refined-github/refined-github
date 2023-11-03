import React from 'dom-chef';
import {CachedFunction} from 'webext-storage-cache';
import {TagIcon} from '@primer/octicons-react';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import {$} from 'select-dom';

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

export async function getReleases(): Promise<[0] | [number, 'Tags' | 'Releases']> {
	const repo = getRepo()!.nameWithOwner;
	return releasesCount.get(repo);
}

async function fetchCounts(nameWithOwner: string): Promise<[0] | [number, 'Tags' | 'Releases'] > {
	const [owner, name] = nameWithOwner.split('/');
	const {repository: {releases, tags}} = await api.v4(GetReleasesCount, {
		variables: {name, owner},
	});

	if (releases.totalCount) {
		return [releases.totalCount, 'Releases'];
	}

	if (tags.totalCount) {
		return [tags.totalCount, 'Tags'];
	}

	return [0];
}

export const releasesCount = new CachedFunction('releases-count', {
	updater: fetchCounts,
	shouldRevalidate: cachedValue => typeof cachedValue === 'number',
	maxAge: {hours: 1},
	staleWhileRevalidate: {days: 3},
	cacheKey: cacheByRepo,
});

async function addReleasesTab(repoNavigationBar: HTMLElement): Promise<false | void> {
	const [count, type] = await getReleases();
	if (!type) {
		return false;
	}

	// Wait for the dropdown because `observe` fires as soon as it encounter the container. `releases-tab` must be appended.
	await elementReady(repoUnderlineNavUl);

	repoNavigationBar.append(
		<li className="d-flex">
			<a
				href={buildRepoURL(type.toLowerCase())}
				className="js-selected-navigation-item UnderlineNav-item hx_underlinenav-item no-wrap js-responsive-underlinenav-item rgh-releases-tab"
				data-hotkey="g r"
				data-selected-links="repo_releases"
				data-tab-item="rgh-releases-item"
				data-turbo-frame="repo-content-turbo-frame" /* Required for `data-selected-links` to work */
			>
				<TagIcon className="UnderlineNav-octicon d-none d-sm-inline"/>
				<span data-content={type}>{type}</span>
				<span className="Counter" title={count > 999 ? String(count) : ''}>{abbreviateNumber(count)}</span>
			</a>
		</li>,
	);

	triggerRepoNavOverflow();
}

async function addReleasesDropdownItem(dropdownMenu: HTMLElement): Promise<false | void> {
	const [, type] = await getReleases();

	if (!type) {
		$('.dropdown-divider', dropdownMenu)?.remove();
		return false;
	}

	appendBefore(
		dropdownMenu,
		'.dropdown-divider', // Won't exist if `more-dropdown` is disabled
		createDropdownItem(type, buildRepoURL(type.toLowerCase()), {
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

Releases: https://github.com/refined-github/refined-github
Tags: https://github.com/python/cpython

*/
