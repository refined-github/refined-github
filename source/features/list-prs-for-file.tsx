import './list-prs-for-file.css';
import React from 'dom-chef';
import select from 'select-dom';
import cache from 'webext-storage-cache';
import * as api from '../libs/api';
import features from '../libs/features';
import {getOwnerAndRepo, getRepoURL} from '../libs/utils';
import {isSingleFile} from '../libs/page-detect';
import getDefaultBranch from '../libs/get-default-branch';
import {groupSiblings} from '../libs/group-buttons';
import * as icons from '../libs/icons';

async function init(): Promise<void> {
	const {ownerName, repoName} = getOwnerAndRepo();
	const cacheKey = `list-prs-for-file:${ownerName}/${repoName}`;

	let files = await cache.get<Record<string, string[]>>(cacheKey);
	if (files === undefined) {
		files = await fetch();
		cache.set(cacheKey, files, 3);
	}

	const path = select('clipboard-copy, #blob-edit-path')!.getAttribute('value')!; // `clipboard-copy` on blob page, `#blob-edit-path` on edit page.
	if (!files[path]) {
		return;
	}

	const wrapper = <div className="rgh-list-prs-for-file" />;
	for (const pr of files[path].slice(0, 10)) {
		wrapper.append(
			<a
				href={`/${getRepoURL()}/pull/${pr}/files`}
				className="btn btn-sm btn-outline tooltipped tooltipped-ne"
				aria-label={`This file is touched by PR #${pr}`}>
				{icons.openPullRequest()} #{pr}
			</a>
		);
	}

	if (isSingleFile()) {
		select('.breadcrumb')!.before(wrapper);
	} else {
		select('.breadcrumb')!.append(wrapper);
	}

	if (wrapper.children.length > 1) {
		groupSiblings(wrapper.firstElementChild!);
	}
}

async function fetch(): Promise<Record<string, string[]>> {
	const {ownerName, repoName} = getOwnerAndRepo();

	const result = await api.v4(
		`{
			repository(owner: "${ownerName}", name: "${repoName}") {
				pullRequests(
					first: 25,
					states: OPEN,
					baseRefName: "${await getDefaultBranch()}",
					orderBy: {
						field: UPDATED_AT,
						direction: DESC
					}
				) {
					nodes {
						number
						files(first: 100) {
							nodes {
								path
							}
						}
					}
				}
			}
		}`
	);

	const files: Record<string, string[]> = {};
	for (const pr of result.repository.pullRequests.nodes) {
		for (const file of pr.files.nodes) {
			if (!files[file.path]) {
				files[file.path] = [];
			}

			files[file.path].push(pr.number);
		}
	}

	return files;
}

features.add({
	id: __featureName__,
	description: 'Lists PRs that touch the current file',
	screenshot: 'https://user-images.githubusercontent.com/55841/60622834-879e1f00-9de1-11e9-9a9e-bae5ec0b3728.png',
	include: [
		features.isEditingFile,
		features.isSingleFile
	],
	load: features.onAjaxedPages,
	init
});
