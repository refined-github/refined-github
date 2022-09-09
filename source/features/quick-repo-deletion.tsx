import './quick-repo-deletion.css';
import delay from 'delay';
import React from 'dom-chef';
import select from 'select-dom';
import {TrashIcon} from '@primer/octicons-react';
import elementReady from 'element-ready';
import {assertError} from 'ts-extras';
import * as pageDetect from 'github-url-detection';
import delegate, {DelegateEvent} from 'delegate-it';

import features from '.';
import * as api from '../github-helpers/api';
import {getForkedRepo, getRepo} from '../github-helpers';
import pluralize from '../helpers/pluralize';
import addNotice from '../github-widgets/notice-bar';
import looseParseInt from '../helpers/loose-parse-int';
import parseBackticks from '../github-helpers/parse-backticks';
import attachElement from '../helpers/attach-element';

function handleToggle(event: DelegateEvent<Event, HTMLDetailsElement>): void {
	const hasContent = select.exists([
		'[data-hotkey="g i"] .Counter:not([hidden])', // Open issues
		'[data-hotkey="g p"] .Counter:not([hidden])', // Open PRs
		'.rgh-open-prs-of-forks', // PRs opened in the source repo
	]);

	if (hasContent && !confirm('This repo has open issues/PRs, are you sure you want to delete everything?')) {
		// Close the <details> element again
		event.delegateTarget.open = false;
		return;
	}

	if (!pageDetect.isForkedRepo() && !confirm('⚠️ This action cannot be undone. This will permanently delete the repository, wiki, issues, comments, packages, secrets, workflow runs, and remove all collaborator associations.')) {
		event.delegateTarget.open = false;
		return;
	}

	// Without the timeout, the same toggle event will also trigger the AbortController
	setTimeout(start, 1, event.delegateTarget);
}

async function verifyScopesWhileWaiting(abortController: AbortController): Promise<void> {
	try {
		await api.expectTokenScope('delete_repo');
	} catch (error) {
		assertError(error);
		abortController.abort();
		addNotice([
			'Could not delete the repository. ',
			parseBackticks(error.message),
		], {
			type: 'error',
			action: (
				<a className="btn btn-sm primary flash-action" href="https://github.com/settings/tokens">
					Update token…
				</a>
			),
		});
	}
}

async function buttonTimeout(buttonContainer: HTMLDetailsElement): Promise<boolean> {
	const abortController = new AbortController();
	// Add a global click listener to avoid potential future issues with z-index
	document.addEventListener('click', event => {
		event.preventDefault();
		abortController.abort();
		buttonContainer.open = false;
	}, {once: true});

	void verifyScopesWhileWaiting(abortController);

	let secondsLeft = 5;
	const button = select('.btn', buttonContainer)!;
	try {
		do {
			button.style.transform = `scale(${1.2 - ((secondsLeft - 5) / 3)})`; // Dividend is zoom speed
			button.textContent = `Deleting repo in ${pluralize(secondsLeft, '$$ second')}. Cancel?`;
			await delay(1000, {signal: abortController.signal}); // eslint-disable-line no-await-in-loop
		} while (--secondsLeft);
	} catch {
		button.textContent = 'Delete fork';
		button.style.transform = '';
	}

	return !abortController.signal.aborted;
}

async function start(buttonContainer: HTMLDetailsElement): Promise<void> {
	if (!await buttonTimeout(buttonContainer)) {
		return;
	}

	select('.btn', buttonContainer)!.textContent = 'Deleting repo…';
	const {nameWithOwner, owner} = getRepo()!;
	try {
		await api.v3('/repos/' + nameWithOwner, {
			method: 'DELETE',
			json: false,
		});
	} catch (error) {
		assertError(error);
		buttonContainer.closest('li')!.remove(); // Remove button
		addNotice([
			'Could not delete the repository. ',
			(error as api.RefinedGitHubAPIError).response?.message ?? error.message,
		], {
			type: 'error',
		});

		throw error;
	}

	const forkSource = '/' + getForkedRepo()!;
	const restoreURL = pageDetect.isOrganizationRepo()
		? `/organizations/${owner}/settings/deleted_repositories`
		: '/settings/deleted_repositories';
	const otherForksURL = `/${owner}?tab=repositories&type=fork`;
	addNotice(
		<><TrashIcon/> <span>Repository <strong>{nameWithOwner}</strong> deleted. <a href={restoreURL}>Restore it</a>, <a href={forkSource}>visit the source repo</a>, or see <a href={otherForksURL}>your other forks.</a></span></>,
		{action: false},
	);
	select('.application-main')!.remove();
	if (document.hidden) {
		// Try closing the tab if in the background. Could fail, so we still update the UI above
		void browser.runtime.sendMessage({closeTab: true});
	}
}

async function init(signal: AbortSignal): Promise<void | false> {
	if (
		// Only if the user can delete the repository
		// TODO: Replace with https://github.com/refined-github/github-url-detection/issues/85
		!await elementReady('nav [data-content="Settings"]')

		// Only if the repository hasn't been starred
		|| looseParseInt(select('.starring-container .Counter')) > 0
	) {
		return false;
	}

	await api.expectToken();

	// (Ab)use the details element as state and an accessible "click-anywhere-to-cancel" utility
	attachElement({
		anchor: '.pagehead-actions',
		prepend: () => (
			<li>
				<details className="details-reset details-overlay select-menu rgh-quick-repo-deletion">
					<summary aria-haspopup="menu" role="button">
						{/* This extra element is needed to keep the button above the <summary>’s lightbox */}
						<span className="btn btn-sm btn-danger">Delete fork</span>
					</summary>
				</details>
			</li>
		),
	});

	delegate(document, '.rgh-quick-repo-deletion[open]', 'toggle', handleToggle, {capture: true, signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isForkedRepo,
	],
	awaitDomReady: false,
	deduplicate: false,
	init,
});
