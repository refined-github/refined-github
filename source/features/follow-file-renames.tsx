import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';
import {DiffRenamedIcon} from '@primer/octicons-react';

import features from '.';
import * as api from '../github-helpers/api';
import GitHubURL from '../github-helpers/github-url';

export interface File {
	previous_name: string | undefined;
	name: string;
	status: string;
	url: string;
}
export interface CommitInfo {
	file: File | undefined;
	parentSha: string | undefined;
	date: Date;
	url: string;
}

export async function getChangesToFileInCommit(sha: string, filePath: string): Promise<CommitInfo> {
	// API v4 doesn't support it: https://github.community/t/what-is-the-corresponding-object-in-graphql-api-v4-for-patch-which-is-available-in-rest-api-v3/13590
	const commitObject = await api.v3(`commits/${sha}`);
	const commitInfo: CommitInfo = {
		file: undefined,
		parentSha: commitObject.parents[0],
		date: commitObject.commit.committer.date,
		url: commitObject.html_url,
	};
	for (const f of commitObject.files) {
		if ([f.filename, f.previous_filename].includes(filePath)) {
			commitInfo.file = {
				name: f.filename,
				previous_name: f.previous_filename,
				status: f.status,
				url: f.blob_url,
			};
		}
	}

	return commitInfo;
}

async function linkify(button: HTMLButtonElement, url: GitHubURL): Promise<void | false> {
	const isNewer = button.textContent === 'Newer';

	const toKey = isNewer ? 'name' : 'previous_name';
	const sha = (isNewer ? select : select.last)('clipboard-copy[aria-label="Copy the full SHA"]')!;

	const commitInfo = await getChangesToFileInCommit(sha.getAttribute('value')!, url.filePath);
	if (!commitInfo.file) {
		return;
	}

	if (commitInfo.file.status === 'renamed') {
		url.assign({
			route: 'commits',
			filePath: commitInfo.file[toKey],
		});
		button.replaceWith(
			<a
				href={String(url)}
				aria-label={`Renamed ${isNewer ? 'to' : 'from'} ${commitInfo.file[toKey] ?? ''}`}
				className="btn btn-outline BtnGroup-item tooltipped tooltipped-n tooltipped-no-delay"
			>
				{isNewer && <DiffRenamedIcon className="mr-1" transform="rotate(180)"/>}
				{button.textContent}
				{!isNewer && <DiffRenamedIcon className="ml-1"/>}
			</a>,
		);
	}
}

function init(): void | false {
	const disabledPagination = select.all('.paginate-container button[disabled]');
	const url = new GitHubURL(location.href);
	// Clear the search from the url, so it does not get passed to the rename link
	url.search = '';
	if (disabledPagination.length === 0 || !url.filePath) {
		return false;
	}

	for (const button of disabledPagination) {
		void linkify(button, url);
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isRepoCommitList,
	],
	init,
});
