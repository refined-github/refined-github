import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';
import {DiffRenamedIcon} from '@primer/octicons-react';

import features from '.';
import * as api from '../github-helpers/api';
import GitHubURL from '../github-helpers/github-url';

interface File {
	previous_filename: string;
	filename: string;
	status: string;
}
// eslint-disable-next-line import/prefer-default-export
export async function getCommitInfo(oid: string): Promise<AnyObject> {
	// API v4 doesn't support it: https://github.community/t/what-is-the-corresponding-object-in-graphql-api-v4-for-patch-which-is-available-in-rest-api-v3/13590
	return api.v3(`commits/${oid}`);
}

async function linkify(button: HTMLButtonElement, filePath: String): Promise<void | false> {
	const isNewer = button.textContent === 'Newer';

	const fromKey = isNewer ? 'previous_filename' : 'filename';
	const toKey = isNewer ? 'filename' : 'previous_filename';
	const sha = (isNewer ? select : select.last)('clipboard-copy[aria-label="Copy the full SHA"]')!;

	const {files} = await getCommitInfo(sha.getAttribute('value')!);

	for (const file of (files as File[])) {
		if (file[fromKey] === filePath) {
			if (file.status === 'renamed') {
				const linkifiedURL = new GitHubURL(location.href);
				linkifiedURL.assign({
					route: 'commits',
					filePath: file[toKey],
					// Clear the search from the URL
					search: '',
				});
				button.replaceWith(
					<a
						href={String(linkifiedURL)}
						aria-label={`Renamed ${isNewer ? 'to' : 'from'} ${file[toKey]}`}
						className="btn btn-outline BtnGroup-item tooltipped tooltipped-n tooltipped-no-delay"
					>
						{isNewer && <DiffRenamedIcon className="mr-1" transform="rotate(180)"/>}
						{button.textContent}
						{!isNewer && <DiffRenamedIcon className="ml-1"/>}
					</a>,
				);
			}

			return;
		}
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
