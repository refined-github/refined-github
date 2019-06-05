import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import * as api from '../libs/api';
import * as icons from '../libs/icons';
import {getOwnerAndRepo} from '../libs/utils';
import {wrap} from '../libs/dom-utils';

interface Asset {
	name: string;
	downloadCount: number;
}
interface Tag {
	[key: string]: Asset[];
}
async function getAssetsForTag(tags: string[]): Promise<Tag> {
	const {ownerName, repoName} = getOwnerAndRepo();
	const {repository} = await api.v4(`
		{
			repository(owner: "${ownerName}", name: "${repoName}") {
				${tags.map(tag => `
					${api.escapeKey(tag)}: release(tagName:"${tag}") {
						releaseAssets(first: 100) {
							nodes {
								name
								downloadCount
							}
						}
					}
				`)}
			}
		}
	`);

	const assets: Tag = {};
	for (const [tag, release] of Object.entries(repository)) {
		assets[tag] = (release as any).releaseAssets.nodes;
	}

	return assets;
}

function prettyNumber(value: number): string {
	if (value <= 999) {
		return value.toString();
	}
	let newValue = value;
	const suffixes = ['', 'K', 'M', 'B', 'T'];
	let suffixNum = 0;
	while (newValue >= 1000) {
		newValue /= 1000;
		suffixNum++;
	}

	return `${newValue.toPrecision(3)} ${suffixes[suffixNum]}`;
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
					// Place next to asset size, keeping both aligned right
					wrap(assetName.closest('.Box-body')!.querySelector('small')!,
						<div className="flex-shrink-0 text-gray">
							<small className="mr-2" style={index === 0 ? {fontWeight: 'bold'} : {}} title="Downloads">
								{icons.cloudDownload()} {prettyNumber(downloadCount)}
							</small>
						</div>
					);
				}
			}
		}
	}
}

features.add({
	id: 'show-asset-download-count',
	description: 'Adds a download count next to release assets.',
	screenshot: 'https://user-images.githubusercontent.com/14323370/58944460-e1aeb480-874f-11e9-8052-2d4dc794ecab.png',
	include: [
		features.isReleasesOrTags
	],
	load: features.onAjaxedPages,
	init
});
