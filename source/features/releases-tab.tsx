import React from 'dom-chef';
import {CachedFunction} from 'webext-storage-cache';
import TagIcon from 'octicons-plain-react/Tag';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import {$optional} from 'select-dom/strict.js';

import observe from '../helpers/selector-observer.js';
import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import abbreviateNumber from '../helpers/abbreviate-number.js';
import createDropdownItem from '../github-helpers/create-dropdown-item.js';
import {
	buildRepoURL,
	cacheByRepo,
	getRepo,
	isNewRepoNav,
	triggerRepoNavOverflow,
} from '../github-helpers/index.js';
import {appendBefore} from '../helpers/dom-utils.js';
import {repoUnderlineNavUl, repoUnderlineNavDropdownUl} from '../github-helpers/selectors.js';
import GetReleasesCount from './releases-tab.gql';
import {expectToken} from '../github-helpers/github-token.js';

function detachHighlightFromCodeTab(codeTab: HTMLAnchorElement): void {
	codeTab.dataset.selectedLinks = codeTab.dataset.selectedLinks!.replace('repo_releases ', '');
}

const releasesCount = new CachedFunction('releases-count', {
	updater: fetchCounts,
	shouldRevalidate: cachedValue => typeof cachedValue === 'number',
	maxAge: {hours: 1},
	staleWhileRevalidate: {days: 3},
	cacheKey: cacheByRepo,
});

export async function getReleases(): Promise<[0] | [number, 'Tags' | 'Releases']> {
	const repo = getRepo()!.nameWithOwner;
	return releasesCount.get(repo);
}

async function fetchCounts(nameWithOwner: string): Promise<[0] | [number, 'Tags' | 'Releases']> {
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

async function addReleasesTab(repoNavigationBar: HTMLElement): Promise<false | void> {
	const [count, type] = await getReleases();
	if (!type) {
		return false;
	}

	if (isNewRepoNav()) {
		// Copy native tab styling from an existing non-selected tab
		const nativeTab = $optional('nav[aria-label="Repository"] ul[role="list"] a:not([aria-current])');
		const nativeClassName = nativeTab ? `${nativeTab.className} rgh-releases-tab` : 'rgh-releases-tab';

		repoNavigationBar.append(
			<li>
				<a
					href={buildRepoURL(type.toLowerCase())}
					className={nativeClassName}
					data-hotkey="g r"
					data-turbo-frame="repo-content-turbo-frame"
					title="Hotkey: G R"
				>
					<span data-component="icon"><TagIcon /></span>
					<span data-component="text" data-content={type}>{type}</span>
					<span data-component="counter">
						<span className="Counter" aria-hidden="true" title={count > 999 ? String(count) : ''}>{abbreviateNumber(count)}</span>
					</span>
				</a>
			</li>,
		);
		triggerRepoNavOverflow();
	} else {
		// Old ViewComponent nav
		// Wait for the dropdown because `observe` fires as soon as it encounter the container
		await elementReady(repoUnderlineNavUl.join?.(',') ?? repoUnderlineNavUl);

		repoNavigationBar.append(
			<li className="d-flex">
				<a
					href={buildRepoURL(type.toLowerCase())}
					className="js-selected-navigation-item UnderlineNav-item hx_underlinenav-item no-wrap js-responsive-underlinenav-item rgh-releases-tab"
					data-hotkey="g r"
					data-selected-links="repo_releases"
					data-tab-item="rgh-releases-item"
					data-turbo-frame="repo-content-turbo-frame"
					title="Hotkey: G R"
				>
					<TagIcon className="UnderlineNav-octicon d-none d-sm-inline" />
					<span data-content={type}>{type}</span>
					<span className="Counter" title={count > 999 ? String(count) : ''}>{abbreviateNumber(count)}</span>
				</a>
			</li>,
		);

		triggerRepoNavOverflow();
	}
}

async function addReleasesDropdownItem(dropdownMenu: HTMLElement): Promise<false | void> {
	const [, type] = await getReleases();

	if (!type) {
		$optional('.dropdown-divider', dropdownMenu)?.remove();
		return false;
	}

	appendBefore(
		dropdownMenu,
		'.dropdown-divider', // Won't exist if `clean-repo-tabs` is disabled
		createDropdownItem({
			label: type,
			href: buildRepoURL(type.toLowerCase()),
			icon: TagIcon,
			'data-menu-item': 'rgh-releases-item',
		}),
	);

	triggerRepoNavOverflow();
}

async function init(signal: AbortSignal): Promise<void> {
	await expectToken();
	observe(repoUnderlineNavUl, addReleasesTab, {signal});

	// Old nav only: overflow dropdown items and code-tab highlight detachment
	if (!isNewRepoNav()) {
		observe(repoUnderlineNavDropdownUl, addReleasesDropdownItem, {signal});
		observe(['[data-menu-item="i0code-tab"] a', 'a#code-tab'], detachHighlightFromCodeTab, {signal});
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

Releases: https://github.com/refined-github/refined-github
Tags: https://github.com/python/cpython

*/
