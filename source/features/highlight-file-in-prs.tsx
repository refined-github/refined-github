import React from 'dom-chef';
import select from 'select-dom';
import * as api from '../libs/api';
import features from '../libs/features';
import {getOwnerAndRepo, getRepoURL} from '../libs/utils';
import {isSingleFile} from '../libs/page-detect';
import getDefaultBranch from '../libs/get-default-branch';
import {groupSiblings} from '../libs/group-buttons';
// TODO: implement caching:
// import cache from 'webext-storage-cache';
import * as icons from '../libs/icons';

async function init(): Promise<void> {
	const {ownerName, repoName} = getOwnerAndRepo();
	const defaultBranch = await getDefaultBranch();
	const cacheKey = `highlight-file-in-prs:${ownerName}/${repoName}`;
	console.log(cacheKey, defaultBranch, getRepoURL());

	// TODO: replace first (2x) with 100.
	const result = await api.v4(
		`{
			repository(owner: "${ownerName}", name: "${repoName}") {
				pullRequests(first: 2, states: OPEN, baseRefName: "${defaultBranch}") {
					nodes {
						number
						files(first: 3) {
							nodes {
								path
							}
						}
					}
				}
			}
		}`
	);
	console.log('result', result, result.repository.pullRequests.nodes);

	const files: any = {};
	for (const node of result.repository.pullRequests.nodes) {
		console.log('node', node);
		for (const file of node.files.nodes) {
			console.log('file', file);
			if (!files[file.path]) {
				files[file.path] = [];
			}

			files[file.path].push(node.number);
		}
	}

	console.log('files', files);

	const path = select<HTMLElement>('clipboard-copy, #blob-edit-path')!.getAttribute('value')!; // `clipboard-copy` on blob page, `#blob-edit-path` on edit page.
	console.log('path', path);
	if (!files[path]) {
		return;
	}

	const wrapper = <div className="rgh-highlight-file-in-prs"></div>;
	for (const pr of files[path]) {
		wrapper.append(
			<a
				href={`/${getRepoURL()}/pull/${pr}/files`}
				target="_blank"
				className="btn btn-sm btn-outline tooltipped tooltipped-ne"
				aria-label={`This file is altered in PR #${pr}`}>
				{icons.openPullRequest()} #{pr}
			</a>
		);
	}

	const breadcrumbs = select('.breadcrumb')!;
	if (isSingleFile()) {
		breadcrumbs.before(wrapper);
	} else {
		breadcrumbs.append(wrapper);
	}

	if (wrapper.children.length > 1) {
		groupSiblings(wrapper.firstElementChild!);
	}

	// TODO: implement caching:
	// const cacheEntry = {
	// 	repoProjectCount: result.repository.projects.totalCount,
	// 	orgProjectCount: result.organization ? result.organization.projects.totalCount : 0,
	// 	milestoneCount: result.repository.milestones.totalCount
	// };
	// cache.set(cacheKey, cacheEntry, 1);
}

features.add({
	id: __featureName__,
	description: '',
	include: [
		features.isEditingFile,
		features.isSingleFile
	],
	load: features.onAjaxedPages,
	init
});
