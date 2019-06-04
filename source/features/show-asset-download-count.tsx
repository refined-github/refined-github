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
	const {repository} = await api.v4(
		`{
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
		}`
	);

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

	let num = newValue.toPrecision(3);

	num = `${num} ${suffixes[suffixNum]}`;
	return num;
}

async function init(): Promise<void | false> {
	// If every release only has the source code downloads then skip
	if (select.all('.release .release-main-section .Counter').every(count => Number(count.textContent!) <= 2)) {
		return;
	}

	let tags = select.all('svg.octicon-tag ~ span').map(tag => tag.textContent!);
	tags = [...new Set(tags)];
	if (tags.length === 0) {
		return false;
	}

	const tagAssets = await getAssetsForTag(tags);
	for (const release of select.all('.release')) {
		const tagName = api.escapeKey(select('svg.octicon-tag ~ span', release)!.textContent!);
		for (const assetTag of select.all('.release-main-section .Box-body.flex-justify-between', release)) {
			const assetName = select('svg.octicon-package ~ span', assetTag)!.textContent!;
			const asset = tagAssets[tagName].find((a: any) => a.name === assetName)!;
			const assetSize = select('small', assetTag)!;
			wrap(assetSize, <div className="flex-shrink-0">
				<span className="mr-2">
					{icons.cloudDownload()}
					<small className="ml-1">{prettyNumber(asset.downloadCount)}</small>
				</span>
			</div>);
		}
	}
}

features.add({
	id: 'show-asset-download-count',
	description: 'Adds a donwload count next to assets.',
	include: [
		features.isReleasesOrTags
	],
	load: features.onAjaxedPages,
	init
});
