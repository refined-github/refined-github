
/*
*/

import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import * as api from '../libs/api';
import {getCleanPathname, getOwnerAndRepo } from '../libs/utils';

async function findRename(
	user: string,
	repo: string,
	lastCommitOnPage: string
) {
	// API v4 doesn't support it: https://github.community/t5/GitHub-API-Development-and/What-is-the-corresponding-object-in-GraphQL-API-v4-for-patch/m-p/14502?collapse_discussion=true&filter=location&location=board:api&q=files%20changed%20commit&search_type=thread
	return api.v3(`repos/${user}/${repo}/commits/${lastCommitOnPage}`);
}

function linkifyButton(button: Element, sha: string, name: string, newName: boolean = false) {
	const {ownerName, repoName} = getOwnerAndRepo();
	const url = `/${ownerName}/${repoName}/commits/${sha}/${name}`;
	button.replaceWith(
		<a
			href={url}
			aria-label={`Renamed ${newName ? 'to' : 'from'} ${name}`}
			className="btn btn-outline BtnGroup-item tooltipped tooltipped-n tooltipped-no-delay">
			{button.textContent}
		</a>
	);
}
async function init(): Promise<false | void> {
	const disabledPagination = select.all('.paginate-container [disabled]');

	if (disabledPagination.length === 0) {
		return false;
	}

	const [user, repo,, ref, ...path] = getCleanPathname().split('/');
	const currentFilename = path.join('/');

	disabledPagination.forEach(async button => {
		if (button.textContent === 'Newer') {
			const sha = select('.commit .sha')!.textContent!.trim();
			const content = await findRename(user, repo, sha);

			for (const file of content.files) {
				if (file.previous_filename === currentFilename) {
					if (file.status === 'renamed') {
						linkifyButton(button, ref, file.filename, true);
					}
					return;
				}
			}
		} else {
			const sha = select.all('.commit .sha').pop()!.textContent!.trim();
			const content = await findRename(user, repo, sha);

			for (const file of content.files) {
				if (file.filename === currentFilename) {
					if (file.status === 'renamed') {
						linkifyButton(button, ref, file.previous_filename);
					}
					return;
				}
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
