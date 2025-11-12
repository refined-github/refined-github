import React from 'dom-chef';
import {CachedFunction} from 'webext-storage-cache';
import {isFirefox} from 'webext-detect';
import * as pageDetect from 'github-url-detection';
import AlertIcon from 'octicons-plain-react/Alert';
import GitPullRequestIcon from 'octicons-plain-react/GitPullRequest';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import getDefaultBranch from '../github-helpers/get-default-branch.js';
import {buildRepoURL, cacheByRepo} from '../github-helpers/index.js';
import GitHubFileURL from '../github-helpers/github-file-url.js';
import observe from '../helpers/selector-observer.js';
import listPrsForFileQuery from './list-prs-for-file.gql';
import {expectToken} from '../github-helpers/github-token.js';

function getPRUrl(prNumber: number): string {
	// https://caniuse.com/url-scroll-to-text-fragment
	const hash = isFirefox() ? '' : `#:~:text=${new GitHubFileURL(location.href).filePath}`;
	return buildRepoURL('pull', prNumber, 'files') + hash;
}

function getHovercardUrl(prNumber: number): string {
	return buildRepoURL('pull', prNumber, 'hovercard');
}

const buttonId = 'rgh-list-prs-for-file-';
let count = 0;

function getDropdown(prs: number[]): HTMLElement {
	const isEditing = pageDetect.isEditingFile();
	const icon = isEditing
		? <AlertIcon className='color-fg-attention' />
		: <GitPullRequestIcon />;

	count++;
	return (
		<div>
			<button
				type='button'
				className='Button Button--secondary color-fg-muted'
				id={buttonId + count}
				// @ts-expect-error HTML standard
				popovertarget={buttonId + 'popover-' + count}
			>
				{icon}
				<span className='color-fg-default'> {prs.length} </span>
				<div className='dropdown-caret' />
			</button>

			<anchored-position
				id={buttonId + 'popover-' + count}
				anchor={buttonId + count}
				popover='auto'
			>
				<div className='Overlay Overlay--size-auto'>
					<div className='px-3 pt-3 h6 color-fg-muted'>
						File also being edited in
					</div>
					<ul className='ActionListWrap ActionListWrap--inset'>
						{prs.map(prNumber => (
							<li className='ActionListItem'>
								<a
									className='ActionListContent js-hovercard-left'
									href={getPRUrl(prNumber)}
									data-hovercard-url={getHovercardUrl(prNumber)}
								>
									#{prNumber}
								</a>
							</li>
						))}
					</ul>
				</div>
			</anchored-position>
		</div>
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
				files[path] ??= [];
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

async function add(anchor: HTMLElement): Promise<false | void> {
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
	if (anchor.parentElement!.matches('.gap-2')) {
		// `isSingleFile`
		anchor.before(dropdown);
	} else {
		// `isEditingFile`
		dropdown.classList.add('mr-2');
		anchor.parentElement!.prepend(dropdown);
	}
}

async function init(signal: AbortSignal): Promise<void> {
	await expectToken();

	observe([
		'[data-testid="more-file-actions-button-nav-menu-wide"]', // `isSingleFile`
		'[data-testid="more-file-actions-button-nav-menu-narrow"]', // `isSingleFile`
		'[data-hotkey="Mod+s"]', // `isEditingFile`
	], add, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isSingleFile,
		pageDetect.isEditingFile,
	],
	init,
});

/*

## Test URLs

- isSingleFile: https://github.com/refined-github/sandbox/blob/6619/6619
- isEditingFile: https://github.com/refined-github/sandbox/edit/6619/6619

*/
