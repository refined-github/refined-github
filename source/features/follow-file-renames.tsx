import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';
import {DiffRenamedIcon} from '@primer/octicons-react';

import features from '.';
import * as api from '../github-helpers/api';
import GitHubURL from '../github-helpers/github-url';

interface File {
	previous_filename?: string;
	filename: string;
	status: string;
	blob_url: string;
}
export interface FileChanges {
	file: File;
	commit: {
		parentSha: string;
		date: Date;
		url: string;
	};
}

export async function getChangesToFileInCommit(sha: string, filePath: string): Promise<FileChanges | void> {
	// API v4 doesn't support it: https://github.community/t/what-is-the-corresponding-object-in-graphql-api-v4-for-patch-which-is-available-in-rest-api-v3/13590
	const commit = await api.v3(`commits/${sha}`);
	for (const fileInfo of commit.files as File[]) {
		if ([fileInfo.filename, fileInfo.previous_filename].includes(filePath)) {
			return {
				commit: {
					parentSha: commit.parents[0].sha,
					date: commit.commit.committer.date,
					url: commit.html_url,
				},
				file: fileInfo,
			};
		}
	}
}

async function linkify(button: HTMLButtonElement, filePath: string): Promise<void | false> {
	const isNewer = button.textContent === 'Newer';

	const toKey = isNewer ? 'filename' : 'previous_filename';
	const sha = (isNewer ? select : select.last)('clipboard-copy[aria-label="Copy the full SHA"]')!;

	const fileChanges = await getChangesToFileInCommit(sha.getAttribute('value')!, filePath);
	if (fileChanges?.file.status !== 'renamed') {
		return;
	}

	const linkifiedURL = new GitHubURL(location.href);
	linkifiedURL.assign({
		route: 'commits',
		filePath: fileChanges.file[toKey],
		// Clear the search from the url, so it does not get passed to the rename link
		search: '',
	});
	button.replaceWith(
		<a
			href={String(linkifiedURL)}
			aria-label={`Renamed ${isNewer ? 'to' : 'from'} ${fileChanges.file[toKey]!}`}
			className="btn btn-outline BtnGroup-item tooltipped tooltipped-n tooltipped-no-delay"
		>
			{isNewer && <DiffRenamedIcon className="mr-1" style={{transform: 'rotate(180deg)'}}/>}
			{button.textContent}
			{!isNewer && <DiffRenamedIcon className="ml-1"/>}
		</a>,
	);
}

async function init(): Promise<void | false> {
	const disabledPagination = select.all('.paginate-container button[disabled]');
	const url = new GitHubURL(location.href);

	const isFile = await fetch(
		`${location.protocol}//${location.hostname}${select('a[aria-label="View at this point in the history"]')!.getAttribute('href')}`,
		{method: 'HEAD'}
	)
	.then(response => {
		if (new GitHubURL(response.url).route === 'blob') {
			return true;
		} else {
			return false;
		}
	});

	if (disabledPagination.length === 0 || !url.filePath || !isFile ) {
		return false;
	}

	for (const button of disabledPagination) {
		void linkify(button, url.filePath);
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isRepoCommitList,
	],
	init,
});
