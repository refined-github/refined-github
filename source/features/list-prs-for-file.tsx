import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';
import {GitPullRequestIcon} from '@primer/octicons-react';

import features from '.';
import * as api from '../github-helpers/api';
import getDefaultBranch from '../github-helpers/get-default-branch';
import {buildRepoURL, getRepo} from '../github-helpers';

function getPRUrl(prNumber: number): string {
	return buildRepoURL('pull', prNumber, 'files');
}

function getDropdown(prs: number[]): HTMLElement {
	// Markup copied from https://primer.style/css/components/dropdown
	return (
		<details className="ml-2 dropdown details-reset details-overlay d-inline-block flex-self-center">
			<summary aria-haspopup="true" className="btn btn-sm">
				<GitPullRequestIcon/> {prs.length} <div className="dropdown-caret"/>
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
			className={'btn btn-sm btn-outline flex-self-center' + (prs ? ' BtnGroup-item' : '')}
		>
			<GitPullRequestIcon/> #{prNumber}
		</a>
	);
}

/**
@returns prsByFile {"filename1": [10, 3], "filename2": [2]}
*/
const getPrsByFile = cache.function(async (): Promise<Record<string, number[]>> => {
	const {repository} = await api.v4(`
		repository() {
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
			files[path] = files[path] ?? [];
			if (files[path].length < 10) {
				files[path].push(pr.number);
			}
		}
	}

	return files;
}, {
	maxAge: {hours: 2},
	staleWhileRevalidate: {days: 9},
	cacheKey: () => __filebasename + ':' + getRepo()!.nameWithOwner
});

async function init(): Promise<void> {
	// `clipboard-copy` on blob page, `#blob-edit-path` on edit page
	const path = select('clipboard-copy, #blob-edit-path')!.getAttribute('value')!;
	const {[path]: prs} = await getPrsByFile();
	if (!prs) {
		return;
	}

	const [prNumber] = prs; // First one or only one

	if (pageDetect.isEditingFile()) {
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

void features.add(__filebasename, {
	include: [
		pageDetect.isEditingFile,
		pageDetect.isSingleFile
	],
	init
});
