import React from 'dom-chef';
import elementReady from 'element-ready';
import {$, $optional} from 'select-dom/strict.js';
import * as pageDetect from 'github-url-detection';
import {setFieldText} from 'text-field-edit';
import TrashIcon from 'octicons-plain-react/Trash';
import delegate, {type DelegateEvent} from 'delegate-it';

import features from '../feature-manager.js';
import {buildRepoURL, getForkedRepo, getRepo} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';
import {userIsAdmin} from '../github-helpers/get-user-permission.js';
import {expectTokenScope} from '../github-helpers/github-token.js';
import addNotice from '../github-widgets/notice-bar.js';
import api from '../github-helpers/api.js';
import showToast from '../github-helpers/toast.js';

const tooltip = 'Instant deletion: shift-alt-click';
const buttonHashSelector = '#dialog-show-repo-delete-menu-dialog';

// Only if the repository hasn't been starred
async function isRepoUnpopular(): Promise<boolean> {
	const counter = await elementReady('.starring-container .Counter');
	return counter!.textContent === '0';
}

async function deleteRepository(): Promise<void> {
	const {nameWithOwner} = getRepo()!;
	await expectTokenScope('delete_repo');
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
	$('.application-main').remove();
}

async function handleShiftAltClick(event: DelegateEvent<MouseEvent, HTMLElement>): Promise<void> {
	if (!event.shiftKey || !event.altKey) {
		return;
	}

	event.preventDefault();

	// Can't really prevent default, so we must close the dialog if we're on the repo settings page
	// https://github.com/refined-github/refined-github/pull/7866#issuecomment-2396270060
	$optional<HTMLDialogElement>('#' + event.delegateTarget.getAttribute('data-show-dialog-id')!)?.close();

	if (confirm('Are you sure you want to delete this repository?')) {
		await showToast(deleteRepository, {
			message: 'Deleting repo…',
			doneMessage: 'Repo deleted',
		});

		await modifyUIAfterSuccessfulDeletion();
	}
}

function addShortcutTooltip(button: HTMLElement): void {
	button.setAttribute('title', tooltip);
}

function addButton(header: HTMLElement): void {
	header.prepend(
		<li>
			<a
				href={buildRepoURL('settings', buttonHashSelector)}
				className="btn btn-sm btn-danger rgh-quick-repo-deletion"
				title={tooltip}
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

function autoOpenModal(signal: AbortSignal): void {
	$(buttonHashSelector).click();
	observe('.js-repo-delete-proceed-confirmation', autoFill, {signal});
}

async function initRepoRoot(signal: AbortSignal): Promise<void | false> {
	observe('.pagehead-actions', addButton, {signal});
	delegate('.rgh-quick-repo-deletion', 'click', handleShiftAltClick, {signal});
}

async function initRepoSettings(signal: AbortSignal): Promise<void | false> {
	delegate(buttonHashSelector, 'click', handleShiftAltClick, {signal});
	observe(buttonHashSelector, addShortcutTooltip, {signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		pageDetect.isRepoRoot,
		pageDetect.isForkedRepo,
		userIsAdmin,
		isRepoUnpopular,
	],
	init: initRepoRoot,
}, {
	include: [
		pageDetect.isRepoSettings,
	],
	init: initRepoSettings,
}, {
	include: [
		() => location.hash === buttonHashSelector,
	],
	awaitDomReady: true, // The expected element is towards the bottom of the page
	init: autoOpenModal,
});

/*

Test URLs:

1. Fork a repo, like https://github.com/left-pad/left-pad
2. Star it to see if the "Delete fork" button disappears
3. Click "Delete fork"
4. The confirmation dialog should appear
5. On the last step, the repo name field should be auto-filled

*/
