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

	if (!pageDetect.isEnterprise() && pageDetect.isSingleTag() && select.exists('.Box-footer .octicon-package')) {
		// Single release page -- Releases UI refresh #4902
		const name = select('.Box svg.octicon-tag ~ span')!.textContent!.trim();
		releases.set(name, select('.Box-footer')!);
	} else {
		for (const release of select.all('.release, .js-release-expandable')) {
			if (select.exists('.octicon-package', release)) {
				const name = pageDetect.isEnterprise()
					? select('svg.octicon-tag ~ span', release)!.textContent!
					: select('.Box-body a.Link--primary', release)!.href.split('/').pop()!; // Get the tag name from the link to the release -- Releases UI refresh #4902

				releases.set(name, release);
			}
		}
	}

	if (releases.size === 0) {
		return false;
	}

	const assets = await getAssetsForTag([...releases.keys()]);

	for (const [name, release] of releases) {
		const sortedDownloads = assets[api.escapeKey(name)].sort((a, b) => b.downloadCount - a.downloadCount);
		for (const assetName of select.all(pageDetect.isEnterprise() ? '.octicon-package ~ span' : '.octicon-package ~ a .text-bold', release)) {
			// Match the asset in the DOM to the asset in the API response
			for (const [index, {name, downloadCount}] of sortedDownloads.entries()) {
				if (name !== assetName.textContent || downloadCount === 0) {
					continue;
				}

				const classes = (index === 0 ? 'text-bold' : '') + (pageDetect.isEnterprise() ? '' : ' float-right');
				const downloadCountElement = (
					<small className={'rgh-release-download-count mr-2 color-text-secondary color-fg-muted ' + classes} title="Downloads">
						{abbreviateNumber(downloadCount)} <DownloadIcon/>
					</small>
				);

				// Place next to asset size
				if (pageDetect.isEnterprise()) {
					assetName
						.closest('.Box-body')!
						.querySelector('small')!
						.before(downloadCountElement);
				} else {
					// Releases UI refresh #4902
					assetName
						.closest('.Box-row')!
						.querySelector('.float-right')!
						.after(downloadCountElement);
				}
			}
		}
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isReleasesOrTags,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
