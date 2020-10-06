import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import TagIcon from 'octicon/tag.svg';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import looseParseInt from '../helpers/loose-parse-int';
import {appendBefore} from '../helpers/dom-utils';
import {createDropdownItem} from './more-dropdown';
import {getRepoURL, getRepoGQL} from '../github-helpers';

const repoUrl = getRepoURL();
const cacheKey = `releases-count:${repoUrl}`;

function parseCountFromDom(): number {
	const releasesCountElement = select('.numbers-summary a[href$="/releases"] .num');
	if (releasesCountElement) {
		return looseParseInt(releasesCountElement.textContent!);
	}

	// In "Repository refresh" layout, look for the releases link in the sidebar
	const moreReleasesCountElement = select('[href$="/tags"] strong');
	if (moreReleasesCountElement) {
		return looseParseInt(moreReleasesCountElement.textContent!);
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
	maxAge: {hours: 1},
	staleWhileRevalidate: {days: 3},
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

	// Wait for the tab bar to be loaded
	await elementReady([
		'.pagehead + *', // Pre "Repository refresh" layout
		'.UnderlineNav-body + *'
	].join());

	const repoNavigationBar = select('.js-responsive-underlinenav');
	if (repoNavigationBar) {
		// "Repository refresh" layout
		const releasesTab = (
			<a
				href={`/${repoUrl}/releases`}
				className="js-selected-navigation-item UnderlineNav-item hx_underlinenav-item no-wrap js-responsive-underlinenav-item"
				data-hotkey="g r"
				data-selected-links="repo_releases"
				data-tab-item="rgh-releases-item"
			>
				<TagIcon className="UnderlineNav-octicon"/>
				<span data-content="Releases">Releases</span>
				{count && <span className="Counter">{count}</span>}
			</a>
		);

		select(':scope > ul', repoNavigationBar)!.append(
			<li className="d-flex">
				{releasesTab}
			</li>
		);

		// This re-triggers the overflow listener forcing it to also hide this tab if necessary #3347
		repoNavigationBar.replaceWith(repoNavigationBar);

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

		select('.dropdown-divider', repoNavigationBar)!.before(
			createDropdownItem('Releases', `/${repoUrl}/releases`, {
				'data-menu-item': 'rgh-releases-item'
			})
		);

		// Hide redundant 'Releases' section from repo sidebar
		if (pageDetect.isRepoRoot()) {
			const sidebarReleases = await elementReady('.BorderGrid-cell a[href$="/releases"]');
			sidebarReleases!.closest('.BorderGrid-row')!.setAttribute('hidden', '');
		}

		return;
	}

	const releasesTab = (
		<a href={`/${repoUrl}/releases`} className="reponav-item" data-hotkey="g r">
			<TagIcon/>
			<span> Releases </span>
			{count && <span className="Counter">{count}</span>}
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
	testOn: '',
	shortcuts: {
		'g r': 'Go to Releases'
	}
}, {
	include: [
		pageDetect.isRepo
	],
	awaitDomReady: false,
	init
});
