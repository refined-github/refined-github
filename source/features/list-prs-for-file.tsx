import React from 'dom-chef';
import {CachedFunction} from 'webext-storage-cache';
import {isFirefox} from 'webext-detect-page';
import * as pageDetect from 'github-url-detection';
import {AlertIcon, GitPullRequestIcon} from '@primer/octicons-react';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import getDefaultBranch from '../github-helpers/get-default-branch.js';
import {buildRepoURL, cacheByRepo} from '../github-helpers/index.js';
import GitHubFileURL from '../github-helpers/github-file-url.js';
import observe from '../helpers/selector-observer.js';
import listPrsForFileQuery from './list-prs-for-file.gql';

function getPRUrl(prNumber: number): string {
	// https://caniuse.com/url-scroll-to-text-fragment
	const hash = isFirefox() ? '' : `#:~:text=${new GitHubFileURL(location.href).filePath}`;
	return buildRepoURL('pull', prNumber, 'files') + hash;
}

function getHovercardUrl(prNumber: number): string {
	return buildRepoURL('pull', prNumber, 'hovercard');
}

function getDropdown(prs: number[]): HTMLElement {
	const isEditing = pageDetect.isEditingFile();
	const icon = isEditing
		? <AlertIcon className="v-align-middle color-fg-attention"/>
		: <GitPullRequestIcon className="v-align-middle"/>;
	// Markup copied from https://primer.style/css/components/dropdown
	return (
		<details className="dropdown details-reset details-overlay flex-self-center">
			<summary className="btn btn-sm">
				{icon}
				<span className="v-align-middle"> {prs.length} </span>
				<div className="dropdown-caret"/>
			</summary>

			<details-menu className="dropdown-menu dropdown-menu-sw" style={{width: '13em'}}>
				<div className="dropdown-header">
					File also being edited in
				</div>
				{prs.map(prNumber => (
					<a
						className="dropdown-item"
						href={getPRUrl(prNumber)}
						data-hovercard-url={getHovercardUrl(prNumber)}
					>
						#{prNumber}
					</a>
				))}
			</details-menu>
		</details>
	);
}

/**
@returns prsByFile {"filename1": [10, 3], "filename2": [2]}
*/
const getPrsByFile = new CachedFunction('files-with-prs', {
	async updater(): Promise<Record<string, number[]>> {
		const {repository} = await api.v4(listPrsForFileQuery, {
			variables: {
				defaultBranch: await getDefaultBranch(),
			},
		});

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
	},
	maxAge: {hours: 2},
	staleWhileRevalidate: {days: 9},
	cacheKey: cacheByRepo,
});

async function addToSingleFile(moreFileActionsDropdown: HTMLElement): Promise<void> {
	const path = new GitHubFileURL(location.href).filePath;
	const prsByFile = await getPrsByFile.get();
	const prs = prsByFile[path];

	if (prs) {
		const dropdown = getDropdown(prs);
		if (!moreFileActionsDropdown.parentElement!.matches('.gap-2')) {
			dropdown.classList.add('mr-2');
		}

		moreFileActionsDropdown.before(dropdown);
	}
}

async function addToEditingFile(saveButton: HTMLElement): Promise<false | void> {
	const path = new GitHubFileURL(location.href).filePath;
	const prsByFile = await getPrsByFile.get();
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

	const dropdown = getDropdown(prs);
	dropdown.classList.add('mr-2');
	saveButton.parentElement!.prepend(dropdown);
}

function initSingleFile(signal: AbortSignal): void {
	observe('[aria-label="More file actions"]', addToSingleFile, {signal});
}

function initEditingFile(signal: AbortSignal): void {
	observe('[data-hotkey="Meta+s,Control+s"]', addToEditingFile, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isSingleFile,
	],
	exclude: [
		pageDetect.isRepoFile404,
	],
	init: initSingleFile,
}, {
	include: [
		pageDetect.isEditingFile,
	],
	exclude: [
		pageDetect.isBlank,
	],
	awaitDomReady: true, // End of the page; DOM-based detections
	init: initEditingFile,
});

/*

## Test URLs

- isSingleFile: One PR https://github.com/refined-github/sandbox/blob/6619/6619
- isSingleFile: Multiple PRs https://github.com/refined-github/sandbox/blob/default-a/README.md
- isEditingFile: One PR https://github.com/refined-github/sandbox/edit/6619/6619
- isEditingFile: Multiple PRs https://github.com/refined-github/sandbox/edit/default-a/README.md

*/
