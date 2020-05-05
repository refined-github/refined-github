import React from 'dom-chef';
import select from 'select-dom';
import cache from 'webext-storage-cache';
import PullRequestIcon from 'octicon/git-pull-request.svg';
import * as api from '../libs/api';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';
import {getRepoURL, getRepoGQL} from '../libs/utils';
import {isEditingFile} from 'github-page-detection';
import getDefaultBranch from '../libs/get-default-branch';

function getPRUrl(prNumber: number): string {
	return `/${getRepoURL()}/pull/${prNumber}/files`;
}

function getDropdown(prs: number[]): HTMLElement {
	// Markup copied from https://primer.style/css/components/dropdown
	return (
		<details className="ml-2 dropdown details-reset details-overlay d-inline-block">
			<summary aria-haspopup="true" className="btn btn-sm">
				<PullRequestIcon/> {prs.length} <div className="dropdown-caret"/>
			</summary>

			<ul className="dropdown-menu dropdown-menu-se">
				<div className="dropdown-header">
					File touched by PRs
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
			className={'btn btn-sm btn-outline' + (prs ? ' BtnGroup-item' : '')}
		>
			<PullRequestIcon/> #{prNumber}
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

	const [prNumber] = prs; // First one or only one

	if (isEditingFile()) {
		select('.file')!.after(
			<div className="form-warning p-3 mb-3 mx-lg-3">
				{
					prs.length === 1 ?
						<>Careful, PR <a href={getPRUrl(prNumber)}>#{prNumber}</a> is already touching this file</> :
						<>
							Careful, {prs.length} open PRs are already touching this file
							<span className="ml-2 BtnGroup" style={{verticalAlign: '-0.6em'}}>
								{prs.map(getSingleButton)}
							</span>
						</>
				}
			</div>
		);

		return;
	}

	if (prs.length > 1) {
		select('.breadcrumb')!.before(getDropdown(prs));
		return;
	}

	const link = getSingleButton(prNumber);
	link.classList.add('ml-2', 'tooltipped', 'tooltipped-ne');
	link.setAttribute('aria-label', `This file is touched by PR #${prNumber}`);
	select('.breadcrumb')!.before(link);
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
	cacheKey: () => __filebasename + ':' + getRepoURL()
});

features.add({
	id: __filebasename,
	description: 'Shows PRs that touch the current file.',
	screenshot: 'https://user-images.githubusercontent.com/55841/60622834-879e1f00-9de1-11e9-9a9e-bae5ec0b3728.png'
}, {
	include: [
		pageDetect.isEditingFile,
		pageDetect.isSingleFile
	],
	init
});
