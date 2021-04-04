import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import {TagIcon} from '@primer/octicons-react';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import looseParseInt from '../helpers/loose-parse-int';
import {appendBefore} from '../helpers/dom-utils';
import abbreviateNumber from '../helpers/abbreviate-number';
import {createDropdownItem} from './more-dropdown';
import {buildRepoURL, getRepo} from '../github-helpers';

const getCacheKey = (): string => `releases-count:${getRepo()!.nameWithOwner}`;

async function parseCountFromDom(): Promise<number> {
	const releasesCountElement = select('.numbers-summary a[href$="/releases"] .num');
	if (releasesCountElement) {
		return looseParseInt(releasesCountElement);
	}

	// In "Repository refresh" layout, look for the tags link in the header
	const moreReleasesCountElement = await elementReady('.repository-content .file-navigation [href$="/tags"] strong');
	if (moreReleasesCountElement) {
		return looseParseInt(moreReleasesCountElement);
	}

	return 0;
}

async function fetchFromApi(): Promise<number> {
	const {repository} = await api.v4(`
		repository() {
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
	cacheKey: getCacheKey
});

async function init(): Promise<false | void> {
	// Always prefer the information in the DOM
	if (pageDetect.isRepoRoot()) {
		await cache.delete(getCacheKey());
	}

	const count = await getReleaseCount();
	if (count === 0) {
		return false;
	}

	// Wait for the tab bar to be loaded
	await elementReady([
		'.pagehead', // Pre "Repository refresh" layout
		'.UnderlineNav-body'
	].join());

	const repoNavigationBar = select('.js-responsive-underlinenav .UnderlineNav-body');
	if (repoNavigationBar) {
		// "Repository refresh" layout
		const releasesTab = (
			<a
				href={buildRepoURL('releases')}
				className="js-selected-navigation-item UnderlineNav-item hx_underlinenav-item no-wrap js-responsive-underlinenav-item"
				data-hotkey="g r"
				data-selected-links="repo_releases"
				data-tab-item="rgh-releases-item"
			>
				<TagIcon className="UnderlineNav-octicon"/>
				<span data-content="Releases">Releases</span>
				{count && <span className="Counter" title={count > 999 ? String(count) : ''}>{abbreviateNumber(count)}</span>}
			</a>
		);
		repoNavigationBar.append(releasesTab);

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

		appendBefore(
			select('.js-responsive-underlinenav .dropdown-menu ul')!,
			'.dropdown-divider', // Won't exist if `more-dropdown` is disabled
			createDropdownItem('Releases', buildRepoURL('releases'), {
				'data-menu-item': 'rgh-releases-item'
			})
		);

		return;
	}

	const releasesTab = (
		<a href={buildRepoURL('releases')} className="reponav-item" data-hotkey="g r">
			<TagIcon/>
			<span> Releases </span>
			{count && <span className="Counter" title={count > 999 ? String(count) : ''}>{abbreviateNumber(count)}</span>}
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
		select('.reponav-item.selected')?.classList.remove('js-selected-navigation-item', 'selected');
		releasesTab.classList.add('js-selected-navigation-item', 'selected');
		releasesTab.dataset.selectedLinks = 'repo_releases'; // Required for ajaxLoad
	}
}

void features.add(__filebasename, {
	shortcuts: {
		'g r': 'Go to Releases'
	},
	include: [
		pageDetect.isRepo
	],
	awaitDomReady: false,
	init
});
