import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import elementReady from 'element-ready';

import features from '.';
import * as api from '../github-helpers/api';
import {getRepoURL} from '../github-helpers';

async function disableWikiAndProjects(): Promise<void> {
	delete sessionStorage.rghNewRepo;

	void api.v3(`repos/${getRepoURL()}`, {
		method: 'PATCH',
		body: {
			has_projects: false,
			has_wiki: false
		}
	});

	const wiki = await elementReady('[data-tab-item="wiki-tab"]');
	wiki?.closest('.d-flex')!.remove();
	const projects = await elementReady('[data-content="Projects"]');
	projects?.closest('.d-flex')!.remove();
}

function setStorage(): void {
	if (select<HTMLInputElement>('[name="rgh-disable-project"]')!.checked) {
		sessionStorage.rghNewRepo = true;
	}
}

async function init(): Promise<void> {
	await api.expectToken();

	select.last('.js-repo-init-setting-container')!.after(
		<div className="form-checkbox checked mt-0 mb-3">
			<label>
				<input checked type="checkbox" name="rgh-disable-project"/>
				Disable Projects and Wikis
			</label>
			<span className="note mb-2">
				After creating the repository disable the projects and wiki
			</span>
		</div>
	);

	delegate(document, '#new_repository', 'submit', setStorage);
}

void features.add({
	id: __filebasename,
	description: 'Automatically disables projects and wikis when creating a repository.',
	screenshot: 'https://user-images.githubusercontent.com/16872793/92732383-61103800-f344-11ea-8fd7-d677151fd85f.png'
}, {
	include: [
		() => location.pathname === '/new'
	],
	init
}, {
	include: [
		() => Boolean(sessionStorage.rghNewRepo)
	],
	waitForDomReady: false,
	init: disableWikiAndProjects
});
