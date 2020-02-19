import React from 'dom-chef';
import select from 'select-dom';
import cache from 'webext-storage-cache';
import pullRequestIcon from 'octicon/git-pull-request.svg';
import * as api from '../libs/api';
import features from '../libs/features';
import {getRepoURL, getRepoGQL} from '../libs/utils';
import {isSingleFile} from '../libs/page-detect';
import getDefaultBranch from '../libs/get-default-branch';
import {groupSiblings} from '../libs/group-buttons';

async function init(): Promise<void> {
	// `clipboard-copy` on blob page, `#blob-edit-path` on edit page
	const path = select('clipboard-copy, #blob-edit-path')!.getAttribute('value')!;
	const {[path]: prs} = await getPrsByFile();
	if (!prs) {
		return;
	}

	const wrapper = <span className="ml-2"/>;
	for (const pr of prs) {
		wrapper.append(
			<a
				href={`/${getRepoURL()}/pull/${pr}/files`}
				className="btn btn-sm btn-outline tooltipped tooltipped-ne"
				aria-label={`This file is touched by PR #${pr}`}
			>
				{pullRequestIcon()} #{pr}
			</a>
		);
	}

	if (isSingleFile()) {
		select('.breadcrumb')!.before(wrapper);
	} else {
		wrapper.style.cssText = 'margin-top: -0.8em; margin-bottom: -0.5em;'; // Vertical alignment
		select('.file')!.after(
			<div className="form-warning p-3 mb-3 mx-lg-3">
				Careful, some open PRs are already touching this file {wrapper}
			</div>
		);
	}

	if (wrapper.children.length > 1) {
		wrapper.classList.add('BtnGroup'); // Avoids extra wrapper
		groupSiblings(wrapper.firstElementChild!);
	}
}

/**
@returns prsByFile {"filename1": [10, 3], "filename2": [2]}
*/
const getPrsByFile = cache.function(async (): Promise<Record<string, number[]>> => {
	const {repository} = await api.v4(`
		repository(${getRepoGQL()}) {
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
	`);

	const files: Record<string, number[]> = {};

	for (const pr of repository.pullRequests.nodes) {
		for (const {path} of pr.files.nodes) {
			files[path] = files[path] || [];
			if (files[path].length < 10) {
				files[path].push(pr.number);
			}
		}
	}

	return files;
}, {
	maxAge: 1,
	staleWhileRevalidate: 9,
	cacheKey: () => __featureName__ + ':' + getRepoURL()
});

features.add({
	id: __featureName__,
	description: 'Shows PRs that touch the current file.',
	screenshot: 'https://user-images.githubusercontent.com/55841/60622834-879e1f00-9de1-11e9-9a9e-bae5ec0b3728.png',
	include: [
		features.isEditingFile,
		features.isSingleFile
	],
	load: features.onAjaxedPages,
	init
});
