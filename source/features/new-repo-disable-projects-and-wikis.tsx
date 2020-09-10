import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import domLoaded from 'dom-loaded';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import {getRepoURL} from '../github-helpers';

async function disableWikiAndProjects(): Promise<void> {
	delete sessionStorage.rghNewRepo;

	await api.v3(`repos/${getRepoURL()}`, {
		method: 'PATCH',
		body: {
			has_projects: false,
			has_wiki: false
		}
	});
	await domLoaded;
	select('[data-content="Wiki"]')?.closest('.d-flex')!.remove();
	select('[data-content="Projects"]')?.closest('.d-flex')!.remove();
}

function setStorage(): void {
	if (select<HTMLInputElement>('#rgh-disable-project')!.checked) {
		sessionStorage.rghNewRepo = true;
	}
}

async function init(): Promise<void> {
	await api.expectToken();

	select.last('.js-repo-init-setting-container')!.after(
		<div className="form-checkbox checked mt-0 mb-3">
			<label>
				<input
					checked
					type="checkbox"
					id="rgh-disable-project"
				/> Disable Projects and Wikis
			</label>
			<span className="note mb-2">
				After creating the repository disable the projects and wiki.
			</span>
		</div>
	);

	delegate(document, '#new_repository', 'submit', setStorage);
}

void features.add({
	id: __filebasename,
	description: 'Automatically disables projects and wikis when creating a repository.',
	screenshot: 'https://user-images.githubusercontent.com/16872793/92803886-dc460e00-f385-11ea-8af6-d6b7a0d3bf91.png'
}, {
	include: [
		pageDetect.isNewRepo
	],
	init
}, {
	include: [
		() => Boolean(sessionStorage.rghNewRepo)
	],
	waitForDomReady: false,
	init: disableWikiAndProjects
});
