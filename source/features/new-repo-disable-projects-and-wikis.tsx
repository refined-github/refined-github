import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import domLoaded from 'dom-loaded';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import selectHas from '../helpers/select-has';

const documentation = 'https://github.com/refined-github/refined-github/wiki/Extended-feature-descriptions#new-repo-disable-projects-and-wikis';

async function disableWikiAndProjects(): Promise<void> {
	delete sessionStorage.rghNewRepo;

	await api.v3('', {
		method: 'PATCH',
		body: {
			has_projects: false,
			has_wiki: false,
		},
	});
	await domLoaded;
	select('[data-menu-item$="wiki-tab"]')?.remove();
	select('[data-menu-item$="projects-tab"]')?.remove();
	selectHas('li:has([data-content="Wiki"]')?.remove();
	selectHas('li:has([data-content="Projects"])')?.remove();
}

function setStorage(): void {
	if (select('input#rgh-disable-project')!.checked) {
		sessionStorage.rghNewRepo = true;
	}
}

async function init(signal: AbortSignal): Promise<void> {
	await api.expectToken();

	select.last([
		'.js-repo-init-setting-container', // IsNewRepo
		'.form-checkbox', // IsNewRepoTemplate
	])!.after(
		<div className="flash flash-warn py-0">
			<div className="form-checkbox checked">
				<label>
					<input
						checked
						type="checkbox"
						id="rgh-disable-project"
					/> Disable Projects and Wikis
				</label>
				<span className="note mb-2">
					After creating the repository disable the projects and wiki. <a href={documentation} target="_blank" rel="noreferrer">Suggestion by Refined GitHub.</a>
				</span>
			</div>
		</div>,
	);

	delegate(document, '#new_repository, #new_new_repository', 'submit', setStorage, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isNewRepo,
		pageDetect.isNewRepoTemplate,
	],
	init,
}, {
	include: [
		() => Boolean(sessionStorage.rghNewRepo),
	],
	awaitDomReady: false,
	init: disableWikiAndProjects,
});
