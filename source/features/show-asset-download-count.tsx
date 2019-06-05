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
		for (const assetName of select.all('.octicon-package ~ span', release)) {
			const {downloadCount} = assets[api.escapeKey(name)]
				.find(({name}: any) => name === assetName.textContent!)!;

			const assetSize = assetName.closest('.Box-body')!.querySelector('small')!;
			wrap(assetSize,
				<div className="flex-shrink-0 text-gray">
					<small className="mr-2">
						{icons.cloudDownload()} {prettyNumber(downloadCount)}
					</small>
				</div>
			);
		}
	}
}

features.add({
	id: 'show-asset-download-count',
	description: 'Adds a download count next to release assets.',
	include: [
		features.isReleasesOrTags
	],
	load: features.onAjaxedPages,
	init
});
