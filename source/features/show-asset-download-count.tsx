import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import {v4} from '../libs/api';
import {cloudDownload} from '../libs/icons';
import {getOwnerAndRepo, getRepoPath} from '../libs/utils';
import {wrap} from '../libs/dom-utils';

interface Asset {
	name: string;
	downloadCount: number;
}

async function getAssetsForTag(tag: string): Promise<Asset[]> {
	const {ownerName, repoName} = getOwnerAndRepo();
	const {repository} = await v4(`{
		repository(owner: "${ownerName}", name: "${repoName}") {
			release(tagName:"${tag}") {
				releaseAssets(first: 100) {
					edges {
						node {
							name
							downloadCount
						}
					}
				}
			}
		}
	}
	`);
	return repository.release.releaseAssets.edges.map((edge: any) => edge.node);
}

async function init(): Promise<void | false> {
	if (getRepoPath() === null || !(getRepoPath() as string).startsWith('releases')) {
		return;
	}

	let tag: any = /releases\/tag\/([^/]+)/.exec(getRepoPath()!);
	const tags: {[key: string]: any} = {};
	if (tag !== null) {
		[, tag] = tag;
		tags[tag] = await getAssetsForTag(tag);
	}

	for (const release of select.all('.release')) {
		const tagName = select('svg.octicon-tag ~ span', release)!.innerText;
		if (!tags[tagName]) {
			return;
		}

		for (const assetTag of select.all('.release-main-section details.details-reset .Box-body.flex-justify-between')) {
			const assetName = select('svg.octicon-package ~ span', assetTag)!.innerText;
			const asset = tags[tagName].find((a: any) => a.name === assetName);
			if (!asset) {
				return;
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
