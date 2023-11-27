import React from 'dom-chef';
import {$} from 'select-dom';
import onetime from 'onetime';
import delegate from 'delegate-it';
import domLoaded from 'dom-loaded';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import selectHas from '../helpers/select-has.js';
import observe from '../helpers/selector-observer.js';

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
	$('[data-menu-item$="wiki-tab"]')?.remove();
	$('[data-menu-item$="projects-tab"]')?.remove();
	selectHas('li:has([data-content="Wiki"]')?.remove();
	selectHas('li:has([data-content="Projects"])')?.remove();
}

function setStorage(): void {
	if ($('input#rgh-disable-project')!.checked) {
		sessionStorage.rghNewRepo = true;
	}
}

function add(form: HTMLElement): void {
	const anchor = $('div:nth-last-child(3)', form);
	anchor?.after(
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
		</div>
	);
}

async function init(signal: AbortSignal): Promise<void> {
	await api.expectToken();
	observe('form[novalidate=""]', add, {signal});
	delegate('#new_repository, #new_new_repository', 'submit', setStorage, {signal});
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
	init: onetime(disableWikiAndProjects),
});

/*
Test URLs:
https://github.com/new
*/
