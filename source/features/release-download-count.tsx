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

	if (pageDetect.isSingleTag() && select.exists('.Box-footer .octicon-package')) {
		const name = select('.Box svg.octicon-tag ~ span')!.textContent!.trim();
		releases.set(name, select('.Box-footer')!);
	} else {
		for (const release of select.all('[data-test-selector="release-card"] > .Box')) {
			if (!select.exists('.octicon-package', release)) {
				continue;
			}

			// Get the tag name from the heading link
			const name = select('.Box-body a.Link--primary', release)!.href.split('/').pop()!;
			releases.set(name, release);
		}
	}

	if (releases.size === 0) {
		return false;
	}

	const assets = await getAssetsForTag([...releases.keys()]);

	for (const [name, release] of releases) {
		const sortedDownloads = assets[api.escapeKey(name)].sort((a, b) => b.downloadCount - a.downloadCount);
		for (const assetName of select.all('.octicon-package ~ a .text-bold', release)) {
			// Match the asset in the DOM to the asset in the API response
			for (const [index, {name, downloadCount}] of sortedDownloads.entries()) {
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

				if (index === 0) {
					classes.push('text-bold');
				}

				assetSize
					.after(
						<small
							className={classes.join(' ').replace('text-sm-left', 'text-sm-right')}
							title="Downloads"
						>
							{abbreviateNumber(downloadCount)} <DownloadIcon/>
						</small>,
					);
			}
		}
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isReleasesOrTags,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
