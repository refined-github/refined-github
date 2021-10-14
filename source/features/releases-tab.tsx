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
import {appendBefore} from '../helpers/dom-utils';
import abbreviateNumber from '../helpers/abbreviate-number';
import {createDropdownItem} from './more-dropdown-links';
import {buildRepoURL, getRepo} from '../github-helpers';

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

const deinit: VoidFunction[] = [];

async function updateReleasesTabHighlighting(): Promise<void> {
	const selectorObserver = observe('.UnderlineNav-item.selected:not(.rgh-releases-tab)', {
		add(selected) {
			selected.classList.remove('selected');
			selected.removeAttribute('aria-current');
			selectorObserver.abort();
		},
	});
	deinit.push(selectorObserver.abort);

	const releasesTab = await elementReady('.rgh-releases-tab', {stopOnDomReady: false, timeout: 10_000});
	releasesTab!.classList.add('selected');
	releasesTab!.setAttribute('aria-current', 'page');
}

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
				<TagIcon className="UnderlineNav-octicon"/>
				<span data-content="Releases">Releases</span>
				{count && <span className="Counter" title={count > 999 ? String(count) : ''}>{abbreviateNumber(count)}</span>}
			</a>
		</li>
	);
	repoNavigationBar.append(releasesTab);

	// This re-triggers the overflow listener forcing it to also hide this tab if necessary #3347
	repoNavigationBar.replaceWith(repoNavigationBar);

	appendBefore(
		select('.js-responsive-underlinenav .dropdown-menu ul')!,
		'.dropdown-divider', // Won't exist if `more-dropdown` is disabled
		createDropdownItem('Releases', buildRepoURL('releases'), {
			'data-menu-item': 'rgh-releases-item',
		}),
	);
}

void features.add(__filebasename, {
	shortcuts: {
		'g r': 'Go to Releases',
	},
	include: [
		pageDetect.isRepo,
	],
	awaitDomReady: false,
	init,
}, {
	include: [
		pageDetect.isReleasesOrTags,
	],
	awaitDomReady: false,
	deduplicate: false,
	init: updateReleasesTabHighlighting,
	deinit,
});
