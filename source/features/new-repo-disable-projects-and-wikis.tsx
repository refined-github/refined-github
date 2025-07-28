import React from 'dom-chef';
import {$, $optional} from 'select-dom/strict.js';
import delegate from 'delegate-it';
import domLoaded from 'dom-loaded';
import * as pageDetect from 'github-url-detection';

import onetime from '../helpers/onetime.js';
import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import observe from '../helpers/selector-observer.js';
import {expectToken} from '../github-helpers/github-token.js';

const documentation = 'https://github.com/refined-github/refined-github/wiki/Extended-feature-descriptions#new-repo-disable-projects-and-wikis';

async function disableWikiAndProjectsOnce(): Promise<void> {
	delete sessionStorage.rghNewRepo;

	await api.v3('', {
		method: 'PATCH',
		body: {
			has_projects: false,
			has_wiki: false,
		},
	});
	await domLoaded;
	$optional('[data-menu-item$="wiki-tab"]')?.remove();
	$optional('[data-menu-item$="projects-tab"]')?.remove();
	$optional('li:has([data-content="Wiki"]')?.remove();
	$optional('li:has([data-content="Projects"])')?.remove();
}

function setStorage(): void {
	if ($('input#rgh-disable-project').checked) {
		sessionStorage.rghNewRepo = true;
	}
}

function add(submitButtonLine: HTMLElement): void {
	const readme = $optional('#add-readme')?.closest('.controlBoxContainer');

	if (readme) {
		const disableProjectsAndWikis = readme.cloneNode(true);

		const title = $('.titleBox h3', disableProjectsAndWikis);
		title.textContent = 'Disable Projects and Wikis';
		title.id = 'disable-projects-and-wikis';

		const description = $('.descriptionBox span', disableProjectsAndWikis);
		description.innerHTML = 'After creating the repository disable the projects and wiki. <a href="https://github.com/refined-github/refined-github/wiki/Extended-feature-descriptions#new-repo-disable-projects-and-wikis" target="_blank" rel="noreferrer">Suggestion by Refined GitHub.</a>';

		const control = $('.blockControl', disableProjectsAndWikis);
		control.replaceChildren(
			<label>
				<input
					checked
					type="checkbox"
					id="rgh-disable-project"
				/> Disable
			</label>,
		);
		control.classList.add('d-flex', 'flex-items-center');

		const groupContainer = readme.parentElement!.cloneNode(true);
		groupContainer.replaceChildren(disableProjectsAndWikis);
		readme.parentElement!.after(groupContainer);

		return;
	}

	submitButtonLine.before(
		<div className="flash flash-warn py-0 ml-n3 mt-4">
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
}

async function init(signal: AbortSignal): Promise<void> {
	await expectToken();
	observe('form :has(> [type=submit])', add, {signal});
	delegate('form', 'submit', setStorage, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isNewRepo,
		pageDetect.isNewRepoTemplate,
		pageDetect.isForkingRepo,
	],
	init,
}, {
	include: [
		() => Boolean(sessionStorage.rghNewRepo),
	],
	init: onetime(disableWikiAndProjectsOnce),
});

/*

Test URLs:

https://github.com/new
https://github.com/new?template_name=browser-extension-template&template_owner=fregante

*/
