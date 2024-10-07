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
import showToast from '../github-helpers/toast.js';

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

async function notifyMissingTokenScope(): Promise<void> {
	await addNotice(['Token does not have delete_repo scope.'], {
		type: 'error',
		action: (
			<a className="btn btn-sm primary flash-action" href="https://github.com/settings/tokens">
				Update token…
			</a>
		),
	});
}

async function notifyDeletionFailure(error: Error): Promise<void> {
	await addNotice([
		'Could not delete the repository. ',
		(error as RefinedGitHubAPIError).response?.message ?? error.message,
	], {
		type: 'error',
	});
}

async function deleteRepository(nameWithOwner: string): Promise<void> {
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
}

async function performDeletion(): Promise<void> {
	// TODO: Add support for app tokens
	if (!(await tokenHasDeleteRepoScope())) {
		notifyMissingTokenScope();
		return;
	}

	const {nameWithOwner} = getRepo()!;

	try {
		await deleteRepository(nameWithOwner);
	} catch (error) {
		assertError(error);
		notifyDeletionFailure(error);

		throw new Error('Could not delete the repository', {cause: error});
	}

	modifyUIAfterSuccessfulDeletion();
}

function deleteButtonClicked(event: DelegateEvent<MouseEvent, HTMLElement>): void {
	if (!event.ctrlKey || !event.altKey) {
		return;
	}

	event.preventDefault();

	if (confirm('Are you sure you want to delete this repository?')) {
		showToast(performDeletion, {
			message: 'Deleting repo...',
			doneMessage: 'Repo deleted',
		});
	}
}

function addButton(header: HTMLElement): void {
	header.prepend(
		<li>
			<a
				href={buildRepoURL('settings', buttonHashSelector)}
				className="btn btn-sm btn-danger rgh-quick-repo-deletion"
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
	delegate('.rgh-quick-repo-deletion', 'click', deleteButtonClicked, {signal});
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
	asLongAs: [pageDetect.isRepoSettings],
	init: initRepoSettings,
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
