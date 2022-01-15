import React from 'dom-chef';
import cache from 'webext-storage-cache';
import {isChrome} from 'webext-detect-page';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import {GitPullRequestIcon} from '@primer/octicons-react';

import features from '.';
import * as api from '../github-helpers/api';
import getDefaultBranch from '../github-helpers/get-default-branch';
import addAfterBranchSelector from '../helpers/add-after-branch-selector';
import {buildRepoURL, getRepo} from '../github-helpers';

function getPRUrl(prNumber: number): string {
	return buildRepoURL('pull', prNumber, 'files');
}

function getDropdown(prs: number[]): HTMLElement {
	// Markup copied from https://primer.style/css/components/dropdown
	return (
		<details className="dropdown details-reset details-overlay d-inline-block flex-self-center">
			<summary aria-haspopup="true" className="btn btn-sm">
				<GitPullRequestIcon className="v-align-middle"/>
				<span className="v-align-middle"> {prs.length} </span>
				<div className="dropdown-caret"/>
			</summary>

			<ul className="dropdown-menu dropdown-menu-se">
				<div className="dropdown-header">
					File touched by PRs
				</div>
				{prs.map(prNumber => (
					<li
						className="issue-link js-issue-link tooltipped tooltipped-e"
						data-error-text="Failed to load PR title"
						data-permission-text="PR title is private"
						data-url={buildRepoURL('issues', prNumber)}
						data-id={`rgh-pr-${prNumber}`}
					>
						<a className="dropdown-item" href={getPRUrl(prNumber)} data-pjax="#js-repo-pjax-container">
							#{prNumber}
						</a>
					</li>
				))}
			</ul>
		</details>
	);
}

function getSingleButton(prNumber: number): HTMLElement {
	return (
		<a
			href={getPRUrl(prNumber)}
			className="btn btn-sm flex-self-center"
		>
			<GitPullRequestIcon className="v-align-middle"/>
			<span className="v-align-middle"> #{prNumber}</span>
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
	cacheKey: () => 'files-with-prs:' + getRepo()!.nameWithOwner,
});

async function getCurrentPath(): Promise<string> {
	// `[aria-label="Copy path"]` on blob page, `#blob-edit-path` on edit page
	const element = await elementReady('[aria-label="Copy path"], #blob-edit-path');
	return element!.getAttribute('value')!;
}

async function init(): Promise<void> {
	const path = await getCurrentPath();
	const {[path]: prs} = await getPrsByFile();

	if (!prs) {
		return;
	}

	const [prNumber] = prs; // First one or only one

	const button = prs.length === 1 ? getSingleButton(prNumber) : getDropdown(prs);

	if (prs.length === 1) {
		button.classList.add('tooltipped', 'tooltipped-ne');
		button.setAttribute('aria-label', `This file is touched by PR #${prNumber}`);
		button.dataset.pjax = '#js-repo-pjax-container';
	}

	await addAfterBranchSelector(button);
}

async function initEditing(): Promise<void> {
	const path = await getCurrentPath();
	let {[path]: prs} = await getPrsByFile();

	if (!prs) {
		return;
	}

	const editingPRNumber = new URLSearchParams(location.search).get('pr')?.split('/').slice(-1);
	if (editingPRNumber) {
		prs = prs.filter(pr => pr !== Number(editingPRNumber));
		if (prs.length === 0) {
			return;
		}
	}

	const [prNumber] = prs; // First one or only one

	(await elementReady('.file'))!.after(
		<div className="form-warning p-3 mb-3 mx-lg-3">
			{
				prs.length === 1
					? <>Careful, PR <a href={getPRUrl(prNumber)}>#{prNumber}</a> is already touching this file</>
					: (
						<>
							Careful, {prs.length} open PRs are already touching this file
							<span className="ml-2 BtnGroup">
								{prs.map(pr => {
									const button = getSingleButton(pr) as unknown as HTMLAnchorElement;

									// Only Chrome supports Scroll To Text Fragment
									// https://caniuse.com/url-scroll-to-text-fragment
									if (isChrome()) {
										button.hash = `:~:text=${path}`;
									}

									return button;
								})}
							</span>
						</>
					)
			}
		</div>,
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isSingleFile,
	],
	awaitDomReady: false,
	deduplicate: 'has-rgh-inner',
	init,
}, {
	include: [
		pageDetect.isEditingFile,
	],
	awaitDomReady: false,
	init: initEditing,
});
