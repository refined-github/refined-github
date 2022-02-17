import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import {observe} from 'selector-observer';
import {TagIcon} from '@primer/octicons-react';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import looseParseInt from '../helpers/loose-parse-int';
import abbreviateNumber from '../helpers/abbreviate-number';
import {createDropdownItem} from './more-dropdown-links';
import {buildRepoURL, getRepo} from '../github-helpers';
import {appendBefore, highlightTab, unhighlightTab} from '../helpers/dom-utils';

const getCacheKey = (): string => `releases-count:${getRepo()!.nameWithOwner}`;

async function parseCountFromDom(): Promise<number> {
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
	cacheKey: getCacheKey,
});

async function addReleasesTab(): Promise<false | number> {
	// Always prefer the information in the DOM
	if (pageDetect.isRepoRoot()) {
		await cache.delete(getCacheKey());
	}

	const count = await getReleaseCount();
	if (count === 0) {
		return false;
	}

	// Wait for the tab bar to be loaded
	const repoNavigationBar = (await elementReady('.UnderlineNav-body'))!;
	repoNavigationBar.append(
		<li className="d-inline-flex">
			<a
				href={buildRepoURL('releases')}
				className="js-selected-navigation-item UnderlineNav-item hx_underlinenav-item no-wrap js-responsive-underlinenav-item rgh-releases-tab"
				data-hotkey="g r"
				data-selected-links="repo_releases"
				data-tab-item="rgh-releases-item"
			>
				<TagIcon className="UnderlineNav-octicon"/>
				<span data-content="Releases">Releases</span>
				{count && <span className="Counter" title={count > 999 ? String(count) : ''}>{abbreviateNumber(count)}</span>}
			</a>
		</li>,
	);

	appendBefore(
		select('.js-responsive-underlinenav .dropdown-menu ul')!,
		'li:not([data-menu-item])', // Add the dropdown item after the last overflow item linked to a native tab
		createDropdownItem('Releases', buildRepoURL('releases'), {
			'data-menu-item': 'rgh-releases-item',
			// Hide on creation because the overflow mechanism isn't triggered when navigating to the "Releases" page from another tab
			// https://github.com/refined-github/refined-github/pull/5333#pullrequestreview-860658750
			hidden: '',
		}),
	);

	return window.setTimeout(checkReleaseTabOverflow, 5000);
}

// Fallback to ensure the tab is always hidden when it overflows, because GitHub's mechanism is unreliable
function checkReleaseTabOverflow(): void {
	const releaseTab = select('.rgh-releases-tab')!;
	if (releaseTab.classList.contains('d-none')) {
		return;
	}

	const {right: releaseTabRight} = releaseTab.getBoundingClientRect();
	const {left: dropdownLeft} = select('.UnderlineNav-actions')!.getBoundingClientRect();
	if (releaseTabRight >= dropdownLeft) { // The tab overlaps with the dropdown button
		releaseTab.classList.add('d-none');
		select('[data-menu-item="rgh-releases-item"]')!.removeAttribute('hidden');
	}
}

function highlightReleasesTab(): VoidFunction {
	const selectorObserver = observe('.UnderlineNav-item.selected:not(.rgh-releases-tab)', {
		add(selectedTab) {
			unhighlightTab(selectedTab);
			selectorObserver.abort();
		},
	});
	highlightTab(select('.rgh-releases-tab')!);

	return selectorObserver.abort;
}

async function init(): Promise<void | VoidFunction[]> {
	const deinit: VoidFunction[] = [];

	if (!select.exists('.rgh-releases-tab')) {
		const timeoutID = await addReleasesTab();
		if (timeoutID !== false) {
			deinit.push(() => {
				window.clearTimeout(timeoutID);
			});
		}
	}

	if (pageDetect.isReleasesOrTags()) {
		deinit.push(highlightReleasesTab());
	}

	return deinit;
}

void features.add(import.meta.url, {
	shortcuts: {
		'g r': 'Go to Releases',
	},
	include: [
		pageDetect.isRepo,
	],
	awaitDomReady: false,
	deduplicate: false,
	init,
});
