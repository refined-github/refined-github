import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import TagIcon from 'octicon/tag.svg';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import {appendBefore} from '../helpers/dom-utils';
import {getRepoURL, getRepoGQL, looseParseInt} from '../github-helpers';

const repoUrl = getRepoURL();
const cacheKey = `releases-count:${repoUrl}`;

function parseCountFromDom(): number {
	const releasesCountElement = select('.numbers-summary a[href$="/releases"] .num');
	if (releasesCountElement) {
		return looseParseInt(releasesCountElement.textContent!);
	}

	// In "Repository refresh" layout, look for the "+ XXX releases" link in the sidebar
	const moreReleasesCountElement = select('.BorderGrid .text-small[href$="/releases"]');
	if (moreReleasesCountElement) {
		return looseParseInt(moreReleasesCountElement.textContent!) + 1;
	}

	return 0;
}

async function fetchFromApi(): Promise<number> {
	const {repository} = await api.v4(`
		repository(${getRepoGQL()}) {
			refs(refPrefix: "refs/tags/") {
				totalCount
			}
		}
	`);

	return repository.refs.totalCount;
}

const getReleaseCount = cache.function(async () => pageDetect.isRepoRoot() ? parseCountFromDom() : fetchFromApi(), {
	maxAge: 1,
	staleWhileRevalidate: 4,
	cacheKey: () => cacheKey
});

async function init(): Promise<false | void> {
	// Always prefer the information in the DOM
	if (pageDetect.isRepoRoot()) {
		await cache.delete(cacheKey);
	}

	const count = await getReleaseCount();
	if (count === 0) {
		return false;
	}

	await elementReady('.pagehead + *'); // Wait for the tab bar to be loaded

	const repoNavigationBar = select('.js-repo-nav.UnderlineNav');
	if (repoNavigationBar) {
		// "Repository refresh" layout

		const releasesTab = (
			<a href={`/${repoUrl}/releases`} className="js-selected-navigation-item UnderlineNav-item hx_underlinenav-item no-wrap js-responsive-underlinenav-item" data-hotkey="g r" data-selected-links="repo_releases" data-tab-item="releases-tab">
				<TagIcon className="UnderlineNav-octicon"/>
				<span data-content="Releases">Releases</span>
				{count === undefined ? '' : <span className="Counter">{count}</span>}
			</a>
		);

		select(':scope > ul', repoNavigationBar)!.append(releasesTab);

		// Update "selected" tab mark
		if (pageDetect.isReleasesOrTags()) {
			const selected = select('.UnderlineNav-item.selected');
			if (selected) {
				selected.classList.remove('selected');
				selected.removeAttribute('aria-current');
			}

			releasesTab.classList.add('selected');
			releasesTab.setAttribute('aria-current', 'page');
		}

		select('.js-responsive-underlinenav-overflow ul', repoNavigationBar)!.append(
			<li data-menu-item="releases-tab">
				<a role="menuitem" className="js-selected-navigation-item dropdown-item" data-selected-links={`/${repoUrl}/releases`} href={`/${repoUrl}/releases`}>
					Releases
				</a>
			</li>
		);

		return;
	}

	const releasesTab = (
		<a href={`/${repoUrl}/releases`} className="reponav-item" data-hotkey="g r">
			<TagIcon/>
			<span> Releases </span>
			{count === undefined ? '' : <span className="Counter">{count}</span>}
		</a>
	);

	appendBefore(
		// GHE doesn't have `.reponav > ul`
		select('.reponav > ul') ?? select('.reponav')!,
		'.reponav-dropdown, [data-selected-links^="repo_settings"]',
		releasesTab
	);

	// Update "selected" tab mark
	if (pageDetect.isReleasesOrTags()) {
		const selected = select('.reponav-item.selected');
		if (selected) {
			selected.classList.remove('js-selected-navigation-item', 'selected');
		}

		releasesTab.classList.add('js-selected-navigation-item', 'selected');
		releasesTab.dataset.selectedLinks = 'repo_releases'; // Required for ajaxLoad
	}
}

void features.add({
	id: __filebasename,
	description: 'Adds a `Releases` tab and a keyboard shortcut: `g` `r`.',
	screenshot: 'https://cloud.githubusercontent.com/assets/170270/13136797/16d3f0ea-d64f-11e5-8a45-d771c903038f.png',
	shortcuts: {
		'g r': 'Go to Releases'
	}
}, {
	include: [
		pageDetect.isRepo
	],
	waitForDomReady: false,
	init
});
