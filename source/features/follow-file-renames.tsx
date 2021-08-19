import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';
import {DiffRenamedIcon} from '@primer/octicons-react';

import features from '.';
import * as api from '../github-helpers/api';
import GitHubURL from '../github-helpers/github-url';

interface File {
	previous_filename: string | undefined;
	filename: string;
	status: string;
	blob_url: string;
}
interface CommitInfo {
	parentSha: string | undefined;
	date: Date;
	url: string;
}
export interface FileChanges {
	commit: CommitInfo;
	file: File;
}

export async function getChangesToFileInCommit(sha: string, filePath: string): Promise<FileChanges | void> {
	// API v4 doesn't support it: https://github.community/t/what-is-the-corresponding-object-in-graphql-api-v4-for-patch-which-is-available-in-rest-api-v3/13590
	const commit = await api.v3(`commits/${sha}`);
	const commitInfo: CommitInfo = {
		parentSha: commit.parents[0],
		date: commit.commit.committer.date,
		url: commit.html_url,
	};
	for (const fileInfo of commit.files as File[]) {
		if ([fileInfo.filename, fileInfo.previous_filename].includes(filePath)) {
			return {
				commit: commitInfo,
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
	if (fileChanges?.file?.status !== 'renamed') {
		return;
	}

	if (fileChanges.file.status === 'renamed') {
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
        aria-label={`Renamed ${isNewer ? 'to' : 'from'} ${fileChanges.file[toKey]}`}
        className="btn btn-outline BtnGroup-item tooltipped tooltipped-n tooltipped-no-delay"
      >
        {isNewer && <DiffRenamedIcon className="mr-1" style={{transform: 'rotate(180deg)'}}/>}
        {button.textContent}
        {!isNewer && <DiffRenamedIcon className="ml-1"/>}
      </a>,
    );
	}
}

function init(): void | false {
	const disabledPagination = select.all('.paginate-container button[disabled]');
	const url = new GitHubURL(location.href);
	if (disabledPagination.length === 0 || !url.filePath) {
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
