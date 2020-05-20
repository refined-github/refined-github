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

function parseCountFromDom(): number | false {
	if (pageDetect.isRepoRoot()) {
		const releasesCountElement = select('.numbers-summary a[href$="/releases"] .num');
		return Number(releasesCountElement ? looseParseInt(releasesCountElement.textContent!) : 0);
	}

	return false;
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

const getReleaseCount = cache.function(async () => parseCountFromDom() ?? fetchFromApi(), {
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

	const releasesTab = (
		<a href={`/${repoUrl}/releases`} className="reponav-item" data-hotkey="g r">
			<TagIcon/>
			<span> Releases </span>
			{count === undefined ? '' : <span className="Counter">{count}</span>}
		</a>
	);

	await elementReady('.pagehead + *'); // Wait for the tab bar to be loaded
	appendBefore('.reponav', '.reponav-dropdown, [data-selected-links^="repo_settings"]', releasesTab);

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

features.add({
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
