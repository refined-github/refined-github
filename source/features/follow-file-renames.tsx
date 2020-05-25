import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import parseRoute from '../github-helpers/parse-route';
import {getRepoURL} from '../github-helpers';

interface File {
	previous_filename: string;
	filename: string;
	status: string;
}

async function findRename(lastCommitOnPage: string): Promise<File[]> {
	// API v4 doesn't support it: https://github.community/t5/GitHub-API-Development-and/What-is-the-corresponding-object-in-GraphQL-API-v4-for-patch/m-p/14502?collapse_discussion=true&filter=location&location=board:api&q=files%20changed%20commit&search_type=thread
	const {files} = await api.v3(`repos/${getRepoURL()}/commits/${lastCommitOnPage}`);
	return files;
}

function init(): false | void {
	const disabledPagination = select.all('.paginate-container [disabled], .paginate-container .disabled');
	const path = parseRoute(location.pathname);

	if (disabledPagination.length === 0 || !path.filePath) {
		return false;
	}

	disabledPagination.forEach(async button => {
		const isNewer = button.textContent === 'Newer';

		const fromKey = isNewer ? 'previous_filename' : 'filename';
		const toKey = isNewer ? 'filename' : 'previous_filename';
		const sha = (isNewer ? select : select.last)('.commit .sha')!;

		const files = await findRename(sha.textContent!.trim());

		for (const file of files) {
			if (file[fromKey] === path.filePath) {
				if (file.status === 'renamed') {
					const url = {
						...path,
						route: 'commits',
						filePath: file[toKey]
					}.toString();
					button.replaceWith(
						<a
							href={url}
							aria-label={`Renamed ${isNewer ? 'to' : 'from'} ${file[toKey]}`}
							className="btn btn-outline BtnGroup-item tooltipped tooltipped-n tooltipped-no-delay"
						>
							{button.textContent}
						</a>
					);
				}

				return;
			}
		}
	});
}

features.add({
	id: __filebasename,
	description: 'Enhances files’ commit lists navigation to follow file renames.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/54799957-7306a280-4c9a-11e9-86de-b9764ed93397.png'
}, {
	include: [
		pageDetect.isRepoCommitList
	],
	init
});
