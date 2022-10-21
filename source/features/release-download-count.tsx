import './release-download-count.css';
import React from 'dom-chef';
import select from 'select-dom';
import {DownloadIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';
import {abbreviateNumber} from 'js-abbreviation-number';

import features from '../feature-manager';
import * as api from '../github-helpers/api';
import observe from '../helpers/selector-observer';
import {createHeatIndexFunc} from '../helpers/math';

type Release = {
	releaseAssets: {
		nodes: Asset[];
	};
};

type Asset = {
	name: string;
	downloadCount: number;
};

type Tag = Record<string, Asset[]>;
async function getAssetsForTag(tags: string[]): Promise<Tag> {
	const {repository} = await api.v4(`
		repository() {
			${tags.map(tag => `
				${api.escapeKey(tag)}: release(tagName:"${tag}") {
					releaseAssets(first: 100) {
						nodes {
							name
							downloadCount
						}
					}
				}
			`).join(',')}
		}
	`);

	const assets: Tag = {};
	for (const [tag, release] of Object.entries(repository)) {
		assets[tag] = (release as Release).releaseAssets.nodes;
	}

	return assets;
}

async function addCounts(assetsList: HTMLElement): Promise<void> {
	const releaseName = assetsList
		.closest('[data-test-selector="release-card"]')!
		.parentElement!
		.querySelector('.octicon-tag ~ span')!
		.textContent!
		.trim();

	const assets = await getAssetsForTag([releaseName]);

	// TODO: Use batchedFunction instead
	const releases = [[releaseName, assetsList]] as const;
	for (const [name, release] of releases) {
		const sortedDownloads = assets[api.escapeKey(name)].sort((a, b) => b.downloadCount - a.downloadCount);
		const calculateHeatIndex = createHeatIndexFunc(sortedDownloads.map(asset => asset.downloadCount));
		for (const assetName of select.all('.octicon-package ~ a .text-bold', release)) {
			// Match the asset in the DOM to the asset in the API response
			for (const {name, downloadCount} of sortedDownloads) {
				if (name !== assetName.textContent || downloadCount === 0) {
					continue;
				}

				// Place next to asset size
				const assetSize = assetName
					.closest('.Box-row')!
					.querySelector(':scope > .flex-justify-end > :first-child')!;

				const classes = [
					'rgh-release-download-count',
					...assetSize.classList,
				];

				assetSize.after(
					<small
						className={classes.join(' ').replace('text-sm-left', 'text-sm-right')}
						title="Downloads"
					>
						<span className="rgh-heat-color-dark" data-heat={calculateHeatIndex(downloadCount)}>
							{abbreviateNumber(downloadCount)}
						</span>
						<DownloadIcon/>
					</small>,
				);
			}
		}
	}
}

function init(signal: AbortSignal): void {
	// TODO: Replace with :has selector to be safer
	observe('[data-test-selector="release-card"] details .Box ul', addCounts, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isReleasesOrTags,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
