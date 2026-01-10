import React from 'dom-chef';
import {$, $optional} from 'select-dom/strict.js';
import delegate from 'delegate-it';
import domLoaded from 'dom-loaded';
import * as pageDetect from 'github-url-detection';
import {elementExists} from 'select-dom';

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

function add(blueprintRow: HTMLElement): void {
	const disableProjectsAndWikis = blueprintRow.cloneNode(true);

	disableProjectsAndWikis.classList.add('flash-warn');

	const title = $('.titleBox h3', disableProjectsAndWikis);
	title.textContent = 'Disable Projects and Wikis';

	const description = $('.descriptionBox p', disableProjectsAndWikis);
	description.replaceChildren(
		'After creating the repository disable the projects and wiki. ',
		<a href={documentation} target="_blank" rel="noreferrer">Suggestion by Refined GitHub.</a>,
	);

	const control = $('.blockControl', disableProjectsAndWikis);
	control.replaceChildren(
		// Padding/margin classes added to increate hit area
		<label className="d-flex gap-1 flex-items-center p-2 mr-n2">
			Disable
			<input
				checked
				// @ts-expect-error Safari only
				switch
				type="checkbox"
				id="rgh-disable-project"
			/>
		</label>,
	);
	control.classList.add('d-flex', 'flex-items-center');

	blueprintRow.parentElement!.append(disableProjectsAndWikis);
}

function addOld(submitButton: HTMLElement): void {
	// .github repos have a banner that matches this #8716
	if (elementExists('[data-testid="special-repo-name-banner"]')) {
		return;
	}

	submitButton.classList.add('mt-0'); // Normalize it. /new has margin, /:user/:repo/fork does not
	submitButton.parentElement!.before(
		<div className="flash flash-warn py-0 ml-n3 my-4">
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
	observe('[class^="ControlGroupContainer"]:has(#visibility-anchor-button)', add, {signal});
	observe('form:has(.octicon-info) [type=submit]', addOld, {signal});
	delegate('form', 'submit', setStorage, {signal, capture: true});
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
