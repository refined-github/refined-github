import './release-download-count.css';
import React from 'dom-chef';
import select from 'select-dom';
import CloudDownloadIcon from 'octicon/cloud-download.svg';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';
import * as api from '../libs/api';
import {getRepoGQL} from '../libs/utils';

interface Asset {
	name: string;
	downloadCount: number;
}
interface Tag {
	[key: string]: Asset[];
}
async function getAssetsForTag(tags: string[]): Promise<Tag> {
	const {repository} = await api.v4(`
		repository(${getRepoGQL()}) {
			${tags.map(tag => `
				${api.escapeKey(tag)}: release(tagName:"${tag}") {
					releaseAssets(first: 100) {
						nodes {
							name
							downloadCount
						}
					}
				}
			`).join()}
		}
	`);

	const assets: Tag = {};
	for (const [tag, release] of Object.entries(repository)) {
		assets[tag] = (release as AnyObject).releaseAssets.nodes;
	}

	return assets;
}

function prettyNumber(value: number): string {
	let newValue = value;
	const suffixes = ['', 'K', 'M', 'B', 'T'];
	let suffixNumber = 0;
	while (newValue >= 1000) {
		newValue /= 1000;
		suffixNumber++;
	}

	return `${Number(newValue.toPrecision(3))} ${suffixes[suffixNumber]}`;
}

async function init(): Promise<void | false> {
	const releases = new Map();
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
				if (name === assetName.textContent) {
					const classes = 'rgh-release-download-count mr-2 text-gray' + (index === 0 ? ' text-bold' : '');
					// Place next to asset size
					assetName
						.closest('.Box-body')!
						.querySelector('small')!
						.before(
							<small className={classes} title="Downloads">
								{prettyNumber(downloadCount)} <CloudDownloadIcon/>
							</small>
						);
				}
			}
		}
	}
}

features.add({
	id: __filebasename,
	description: 'Adds a download count next to release assets.',
	screenshot: 'https://user-images.githubusercontent.com/14323370/58944460-e1aeb480-874f-11e9-8052-2d4dc794ecab.png'
}, {
	include: [
		pageDetect.isReleasesOrTags
	],
	init
});
