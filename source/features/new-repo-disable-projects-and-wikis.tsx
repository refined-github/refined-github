import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import {getRepoURL} from '../github-helpers';

async function disableWikiAndProjects(): Promise<void | false> {
	if (sessionStorage.rghNewRepo !== getRepoURL()) {
		return false;
	}

	sessionStorage.removeItem('rghNewRepo');

	api.v3(`repos/${getRepoURL()}`, {
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

function setStorage(): void | false {
	if (!select<HTMLInputElement>('[name="rgh-disable-project"]')!.checked) {
		return false;
	}

	const owner = select('#repository-owner')!.textContent!.trim();
	const repository = select<HTMLInputElement>('.js-repo-name')!.value;
	sessionStorage.rghNewRepo = owner + '/' + repository;
}

async function init(): Promise<void> {
	await api.expectToken();

	select.last('.js-repo-init-setting-container')!.after(
		<div className="form-checkbox checked mt-0 mb-3">
			<label>
				<input checked type="checkbox" name="rgh-disable-project"/>
				Remove Projects and Wiki`s
			</label>
			<span className="note">
				After creating the repository remove the projects and the wiki
			</span>
		</div>
	);

	delegate(document, '#new_repository', 'submit', setStorage);
}

void features.add({
	id: __filebasename,
	description: 'Automatically disables projects and wikis when creating a repository',
	screenshot: 'https://user-images.githubusercontent.com/16872793/92678588-58901100-f2f4-11ea-8b9f-d3101fbe00c2.png'
}, {
	include: [
		() => location.pathname === '/new'
	],
	init
}, {
	include: [
		pageDetect.isRepoHome
	],
	waitForDomReady: false,
	init: disableWikiAndProjects
});
