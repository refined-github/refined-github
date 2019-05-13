import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import {v4, escapeKey} from '../libs/api';
import {cloudDownload} from '../libs/icons';
import {getOwnerAndRepo, getRepoPath} from '../libs/utils';
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
	const data = await v4(
		'{' +
			tags.map(tag =>
				escapeKey(tag) + `: repository(owner: "${ownerName}", name: "${repoName}") { release(tagName:"${tag}") { releaseAssets(first: 100) { edges { node { name downloadCount } } } } }`
			) +
		'}'
	);
	const assets: Tag = {};
	for (const [tag, repo] of Object.entries(data)) {
		assets[tag] = repo.release.releaseAssets.edges.map((edge: any) => edge.node);
	}

	return assets;
}

async function init(): Promise<void | false> {
	if (getRepoPath() === null || !(getRepoPath() as string).startsWith('releases')) {
		return;
	}

	const tags = select.all('svg.octicon-tag ~ span').map(tag => tag.textContent!);
	const tagAssets = await getAssetsForTag(tags);
	for (const release of select.all('.release-entry:not(.release-timeline-tags)')) {
		const tagName = escapeKey(select('svg.octicon-tag ~ span', release)!.textContent!);
		if (!tagAssets[tagName]) {
			continue;
		}

		for (const assetTag of select.all('.release-main-section details.details-reset .Box-body.flex-justify-between', release)) {
			const assetName = select('svg.octicon-package ~ span', assetTag)!.textContent!;
			const asset = tagAssets[tagName].find((a: any) => a.name === assetName);
			if (!asset) {
				continue;
			}

			const right = select('small', assetTag)!;
			wrap(right, <div className="flex-shrink-0">
				<span className="mr-2">
					{cloudDownload()}
					<small className="ml-1">{asset.downloadCount}</small>
				</span>
			</div>);
		}
	}
}

features.add({
	id: 'show-asset-download-count',
	include: [
		features.isReleasesOrTags
	],
	load: features.onAjaxedPages,
	init
});
