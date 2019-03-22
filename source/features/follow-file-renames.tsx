
/*
*/

import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import * as api from '../libs/api';
import {getCleanPathname} from '../libs/utils';

async function findRename(
	user: string,
	repo: string,
	lastCommitOnPage: string
) {
	// API v4 doesn't support it: https://github.community/t5/GitHub-API-Development-and/What-is-the-corresponding-object-in-GraphQL-API-v4-for-patch/m-p/14502?collapse_discussion=true&filter=location&location=board:api&q=files%20changed%20commit&search_type=thread
	return api.v3(`repos/${user}/${repo}/commits/${lastCommitOnPage}`);
}

async function init(): Promise<false | void> {
	const disabledPagination = select.all('.paginate-container [disabled]');

	if (disabledPagination.length === 0) {
		return false;
	}

	const [user, repo,, ref, ...path] = getCleanPathname().split('/');
	const currentFilename = path.join('/');

	disabledPagination.forEach(async button => {
		const isNewer = button.textContent === 'Newer';

		const fromKey = isNewer ? 'previous_filename' : 'filename';
		const toKey = isNewer ? 'filename' : 'previous_filename';
		const sha = isNewer ? select('.commit .sha') : select.all('.commit .sha').pop();

		const content = await findRename(user, repo, sha.textContent.trim());

		for (const file of content.files) {
			if (file[fromKey] === currentFilename) {
				if (file.status === 'renamed') {
					const url = `/${user}/${repo}/commits/${ref}/${file[toKey]}`;
					button.replaceWith(
						<a
							href={url}
							aria-label={`Renamed ${isNewer ? 'to' : 'from'} ${file[toKey]}`}
							className="btn btn-outline BtnGroup-item tooltipped tooltipped-n tooltipped-no-delay">
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
	id: 'follow-file-renames',
	include: [
		features.isCommitList
	],
	load: features.onAjaxedPages,
	init
});
