import React from 'dom-chef';
import elementReady from 'element-ready';
import {expectElement} from 'select-dom';
import * as pageDetect from 'github-url-detection';
import {setFieldText} from 'text-field-edit';
import TrashIcon from 'octicons-plain-react/Trash';

import features from '../feature-manager.js';
import {buildRepoURL, getRepo} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';

const buttonHashSelector = '#dialog-show-repo-delete-menu-dialog';

// TODO: Replace with https://github.com/refined-github/github-url-detection/issues/85
async function canUserDeleteRepository(): Promise<boolean> {
	return Boolean(await elementReady('nav [data-content="Settings"]'));
}

// Only if the repository hasn't been starred
async function isRepoUnpopular(): Promise<boolean> {
	const counter = await elementReady('.starring-container .Counter');
	return counter!.textContent === '0';
}

function addButton(header: HTMLElement): void {
	header.prepend(
		<li>
			<a
				href={buildRepoURL('settings', buttonHashSelector)}
				className="btn btn-sm btn-danger"
			>
				<TrashIcon className="mr-2" />
				Delete fork
			</a>
		</li>,
	);
}

function autoFill(field: HTMLInputElement): void {
	setFieldText(field, getRepo()!.nameWithOwner);
}

function initSettingsPage(signal: AbortSignal): void {
	expectElement(buttonHashSelector).click();
	observe('.js-repo-delete-proceed-confirmation', autoFill, {signal});
}

async function init(signal: AbortSignal): Promise<void | false> {
	observe('.pagehead-actions', addButton, {signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		pageDetect.isRepoRoot,
		pageDetect.isForkedRepo,
		canUserDeleteRepository,
		isRepoUnpopular,
	],
	init,
}, {
	include: [
		() => location.hash === buttonHashSelector,
	],
	awaitDomReady: true, // The expected element is towards the bottom of the page
	init: initSettingsPage,
});

/*

Test URLs:

1. Fork a repo, like https://github.com/left-pad/left-pad
2. Star it to see if the "Delete fork" button disappears
3. Click "Delete fork"
4. The confirmation dialog should appear
5. On the last step, the repo name field should be auto-filled

*/
