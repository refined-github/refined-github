import './release-download-count.css';
import React from 'dom-chef';
import select from 'select-dom';
import {DownloadIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';
import {abbreviateNumber} from 'js-abbreviation-number';

import features from '.';
import * as api from '../github-helpers/api';

interface Release {
	releaseAssets: {
		nodes: Asset[];
	};
}

interface Asset {
	name: string;
	downloadCount: number;
}

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

async function init(): Promise<void | false> {
	const releases = new Map<string, HTMLElement>();
	for (const release of select.all('.release')) {
		if (select.exists('.octicon-package', release)) {
			const name = select('svg.octicon-tag ~ span', release)!.textContent!;
			releases.set(name, release);
		}
	}

	if (releases.size === 0) {
		return false;
	}

	const assets = await getAssetsForTag([...releases.keys()]);

	for (const [name, release] of releases) {
		const sortedDownloads = assets[api.escapeKey(name)].sort((a, b) => b.downloadCount - a.downloadCount);
		for (const assetName of select.all('.octicon-package ~ span', release)) {
			// Match the asset in the DOM to the asset in the API response
			for (const [index, {name, downloadCount}] of sortedDownloads.entries()) {
				if (name === assetName.textContent && downloadCount > 0) {
					const classes = 'rgh-release-download-count mr-2 color-text-secondary color-fg-muted' + (index === 0 ? ' text-bold' : '');
					// Place next to asset size
					assetName
						.closest('.Box-body')!
						.querySelector('small')!
						.before(
							<small className={classes} title="Downloads">
								{abbreviateNumber(downloadCount)} <DownloadIcon/>
							</small>,
						);
				}
			}
		}
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isReleasesOrTags,
	],
	init,
});
