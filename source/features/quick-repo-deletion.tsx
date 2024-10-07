import React from 'dom-chef';
import elementReady from 'element-ready';
import {$, expectElement} from 'select-dom';
import * as pageDetect from 'github-url-detection';
import {setFieldText} from 'text-field-edit';
import TrashIcon from 'octicons-plain-react/Trash';

import {assertError} from 'ts-extras';

import delegate, {DelegateEvent} from 'delegate-it';

import features from '../feature-manager.js';
import {buildRepoURL, getForkedRepo, getRepo} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';
import {expectTokenScope} from '../github-helpers/github-token.js';
import addNotice from '../github-widgets/notice-bar.js';
import api, {RefinedGitHubAPIError} from '../github-helpers/api.js';
import { messageBackground } from '../helpers/messaging.js';

type DeleteButton = HTMLAnchorElement | HTMLButtonElement;
type RepoRootClickEvent = React.MouseEvent<HTMLAnchorElement, MouseEvent>;
type RepoSettingsClickEvent = DelegateEvent<MouseEvent, HTMLButtonElement>;

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

async function tokenHasDeleteRepoScope(): Promise<boolean> {
	try {
		await expectTokenScope('delete_repo');
		return true;
	} catch {
		return false;
	}
}

async function notifyMissingTokenScope() {
	await addNotice(['Token does not have delete_repo scope.'], {
		type: 'error',
		action: (
			<a className="btn btn-sm primary flash-action" href="https://github.com/settings/tokens">
				Update token…
			</a>
		),
	});
}

function setButtonText(button: DeleteButton, text: string) {
	if (button instanceof HTMLAnchorElement) {
		button.textContent = text;
	} else {
		const label = $('.Button-label', button)!;
		label.textContent = text;
	}
}

function removeButtonIfAtRepoRoot(button: DeleteButton) {
	if (button instanceof HTMLAnchorElement) {
		const buttonContainer = button.closest('li')!;
		buttonContainer.remove();
	}
}

async function notifyDeletionFailure(error: Error): Promise<void> {
	await addNotice([
		'Could not delete the repository. ',
		(error as RefinedGitHubAPIError).response?.message ?? error.message,
	], {
		type: 'error',
	});
}

async function deleteRepository(nameWithOwner: string) {
	await api.v3('/repos/' + nameWithOwner, {
		method: 'DELETE',
		json: false,
	});
}

async function modifyUIAfterSuccessfulDeletion(): Promise<void> {
	const {nameWithOwner, owner} = getRepo()!;
	const forkSource = '/' + getForkedRepo()!;
	const restoreURL = pageDetect.isOrganizationRepo()
		? `/organizations/${owner}/settings/deleted_repositories`
		: '/settings/deleted_repositories';
	const otherForksURL = `/${owner}?tab=repositories&type=fork`;

	await addNotice(
		<>
			<TrashIcon />
			<span>
				Repository <strong>{nameWithOwner}</strong> deleted. <a href={restoreURL}>Restore it</a>, <a href={forkSource}>visit the source repo</a>, or see <a href={otherForksURL}>your other forks.</a>
			</span>
		</>,
		{action: false},
	);
	$('.application-main')!.remove();
	
	if (document.hidden) {
		// Try closing the tab if in the background. Could fail, so we still update the UI above
		void messageBackground({closeTab: true});
	}
}

async function performDeletion(button: DeleteButton) {
	if (!(await tokenHasDeleteRepoScope())) {
		notifyMissingTokenScope();
		return;
	}

	const originalButtonText = button.textContent;
	const {nameWithOwner} = getRepo()!;

	setButtonText(button, 'Deleting repo…');

	try {
		deleteRepository(nameWithOwner);
	} catch (error) {
		assertError(error);
		removeButtonIfAtRepoRoot(button);
		notifyDeletionFailure(error);

		throw error;
	}

	setButtonText(button, originalButtonText);
	modifyUIAfterSuccessfulDeletion();
}

function deleteButtonClicked(event: RepoRootClickEvent | RepoSettingsClickEvent): void {
	if (event.ctrlKey && event.altKey && confirm('Are you sure you want to delete this fork?')) {
		event.preventDefault();
		performDeletion(event.target as HTMLAnchorElement | HTMLButtonElement);
	}
}

function addButton(header: HTMLElement): void {
	header.prepend(
		<li>
			<a
				href={buildRepoURL('settings', buttonHashSelector)}
				className="btn btn-sm btn-danger"
				onClick={deleteButtonClicked}
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

async function initRepoRoot(signal: AbortSignal): Promise<void | false> {
	observe('.pagehead-actions', addButton, {signal});
}

async function initRepoSettings(signal: AbortSignal): Promise<void | false> {
	delegate(buttonHashSelector, 'click', deleteButtonClicked, {signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		pageDetect.isRepoRoot,
		pageDetect.isForkedRepo,
		canUserDeleteRepository,
		isRepoUnpopular,
	],
	init: initRepoRoot,
}, {
	include: [
		() => location.hash === buttonHashSelector,
	],
	awaitDomReady: true, // The expected element is towards the bottom of the page
	init: initSettingsPage,
});

features.add(import.meta.url, {
	asLongAs: [
		pageDetect.isRepoSettings,
		pageDetect.isForkedRepo,
		canUserDeleteRepository,
		isRepoUnpopular,
	],
	awaitDomReady: true,
	init: initRepoSettings,
});

/*

Test URLs:

1. Fork a repo, like https://github.com/left-pad/left-pad
2. Star it to see if the "Delete fork" button disappears
3. Click "Delete fork"
4. The confirmation dialog should appear
5. On the last step, the repo name field should be auto-filled

*/
