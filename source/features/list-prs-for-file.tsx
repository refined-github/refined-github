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

function getHovercardUrl(prNumber: number): string {
	return buildRepoURL('pull', prNumber, 'hovercard');
}

function getDropdown(prs: number[]): HTMLElement {
	// Markup copied from https://primer.style/css/components/dropdown
	return (
		<details className="dropdown details-reset details-overlay flex-self-center">
			<summary className="btn btn-sm">
				<GitPullRequestIcon className="v-align-middle"/>
				<span className="v-align-middle"> {prs.length} </span>
				<div className="dropdown-caret"/>
			</summary>

			<details-menu className="dropdown-menu dropdown-menu-sw">
				<div className="dropdown-header">
					File touched by PRs
				</div>
				{prs.map(prNumber => (
					<a
						className="dropdown-item"
						href={getPRUrl(prNumber)}
						data-pjax="#js-repo-pjax-container"
						data-hovercard-url={getHovercardUrl(prNumber)}
					>
						#{prNumber}
					</a>
				))}
			</details-menu>
		</details>
	);
}

function getSingleButton(prNumber: number): HTMLElement {
	return (
		<a
			href={getPRUrl(prNumber)}
			className="btn btn-sm flex-self-center"
			data-hovercard-url={getHovercardUrl(prNumber)}
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
	const [path, prsByFile] = await Promise.all([
		getCurrentPath(),
		getPrsByFile(),
	]);
	const prs = prsByFile[path];

	if (!prs) {
		return;
	}

	const [prNumber] = prs; // First one or only one

	const button = prs.length === 1 ? getSingleButton(prNumber) : getDropdown(prs);

	if (prs.length === 1) {
		button.dataset.pjax = '#js-repo-pjax-container';
	}

	await addAfterBranchSelector(button);
}

async function initEditing(): Promise<false | void> {
	const [path, prsByFile] = await Promise.all([
		getCurrentPath(),
		getPrsByFile(),
	]);
	let prs = prsByFile[path];

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

	const file = await elementReady('.file');
	if (!file && pageDetect.isBlank()) {
		return false;
	}

	file!.after(
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
									button.classList.add('BtnGroup-item');

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
