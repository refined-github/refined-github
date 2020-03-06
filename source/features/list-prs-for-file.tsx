import './list-prs-for-file.css';
import React from 'dom-chef';
import select from 'select-dom';
import cache from 'webext-storage-cache';
import pullRequestIcon from 'octicon/git-pull-request.svg';
import * as api from '../libs/api';
import features from '../libs/features';
import {getRepoURL, getRepoGQL} from '../libs/utils';
import {isSingleFile} from '../libs/page-detect';
import getDefaultBranch from '../libs/get-default-branch';

function getPRUrl(prNumber: number): string {
	return `/${getRepoURL()}/pull/${prNumber}/files`;
}

function getDropdown(prs: number[]): HTMLElement {
	// Markup copied from https://primer.style/css/components/dropdown
	return (
		<details className="ml-2 dropdown details-reset details-overlay d-inline-block">
			<summary aria-haspopup="true" className="btn btn-sm">
				{pullRequestIcon()} {prs.length} <div className="dropdown-caret"/>
			</summary>

			<ul className="dropdown-menu dropdown-menu-se">
				<div className="dropdown-header">
					File touched by
				</div>
				{prs.map(prNumber => (
					<li>
						<a className="dropdown-item" href={getPRUrl(prNumber)}>
							#{prNumber}
						</a>
					</li>
				))}
			</ul>
		</details>
	);
}

function getSingleButton(prNumber: number, _?: number, prs?: number[]): HTMLElement {
	return (
		<a
			href={getPRUrl(prNumber)}
			className={'btn btn-sm btn-outline tooltipped tooltipped-ne' + (prs ? ' BtnGroup-item' : '')}
			aria-label={`This file is touched by PR #${prNumber}`}
		>
			{pullRequestIcon()} #{prNumber}
		</a>
	);
}

async function init(): Promise<void> {
	// `clipboard-copy` on blob page, `#blob-edit-path` on edit page
	const path = select('clipboard-copy, #blob-edit-path')!.getAttribute('value')!;
	const {[path]: prs} = await getPrsByFile();
	if (!prs) {
		return;
	}

	if (isSingleFile()) {
		select('.breadcrumb')!.before(
			prs.length === 1 ?
				<span className="ml-2">{getSingleButton(prs[0])}</span> :
				getDropdown(prs)
		);
	} else {
		select('.file')!.after(
			<div className="form-warning p-3 mb-3 mx-lg-3">
				{
					prs.length === 1 ?
						<>Careful, PR <a href={getPRUrl(prs[0])}>#{prs[0]}</a> is already touching this file</> :
						<>
							Careful, {prs.length} open PRs are already touching this file
							<span className="ml-2 BtnGroup">
								{prs.map(getSingleButton)}
							</span>
						</>
				}
			</div>
		);
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
