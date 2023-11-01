import './release-download-count.css';
import React from 'dom-chef';
import {$$, elementExists} from 'select-dom';
import {DownloadIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';
import {abbreviateNumber} from 'js-abbreviation-number';

import getReleaseDownloadCount from './release-download-count.gql';
import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import observe from '../helpers/selector-observer.js';
import {createHeatIndexFunction} from '../helpers/math.js';

type Asset = {
	name: string;
	downloadCount: number;
};

async function getAssetsForTag(tag: string): Promise<Record<string, number>> {
	const {repository} = await api.v4(getReleaseDownloadCount, {variables: {tag}});
	const assets: Asset[] = repository.release.releaseAssets.nodes;
	return Object.fromEntries(assets.map(({name, downloadCount}) => ([name, downloadCount])));
}

async function addCounts(assetsList: HTMLElement): Promise<void> {
	// TODO: Use :has selector instead
	if (!elementExists('.octicon-package', assetsList)) {
		return;
	}

	// Both pages have .Box but in the list .Box doesn't include the tag
	const container = assetsList.closest('section') // Single-release page
		?? assetsList.closest('.Box:not(.Box--condensed)')!; // Releases list, excludes the assets list’s own .Box

	const releaseName = container
		.querySelector('.octicon-tag ~ span')!
		.textContent
		.trim();

	const assets = await getAssetsForTag(releaseName);

	const calculateHeatIndex = createHeatIndexFunction(Object.values(assets));
	for (const assetLink of $$('.octicon-package ~ a', assetsList)) {
		// Match the asset in the DOM to the asset in the API response
		const downloadCount = assets[assetLink.pathname.split('/').pop()!] ?? 0;

		// Place next to asset size
		const assetSize = assetLink
			.closest('.Box-row')!
			.querySelector(':scope > .flex-justify-end > :first-child')!;

		assetSize.parentElement!.classList.add('rgh-release-download-count');

		const classes = new Set(assetSize.classList);
		classes.delete('text-sm-left');

		if (downloadCount === 0) {
			classes.add('v-hidden');
		}

		assetSize.before(
			<span className={[...classes].join(' ')}>
				<span
					className="d-inline-block text-right"
					title={`${downloadCount} downloads`}
					data-rgh-heat={calculateHeatIndex(downloadCount)}
				>
					{abbreviateNumber(downloadCount)} <DownloadIcon/>
				</span>
			</span>,
		);
	}
}

function init(signal: AbortSignal): void {
	observe('.Box-footer .Box--condensed', addCounts, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isReleasesOrTags,
		pageDetect.isSingleReleaseOrTag,
	],
	init,
});

/*

Test URLs

- One release: https://github.com/cli/cli/releases/tag/v2.30.0
- List of releases: https://github.com/cli/cli/releases
- Lots of assets: https://github.com/notepad-plus-plus/notepad-plus-plus/releases

*/
