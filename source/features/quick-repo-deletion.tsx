import './quick-repo-deletion.css';
import delay from 'delay';
import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import delegate from 'delegate-it';
import {TrashIcon} from '@primer/octicons-react';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import {getRepo} from '../github-helpers';
import addNotice from '../github-widgets/notice-bar';
import {getCacheKey} from './forked-to';
import looseParseInt from '../helpers/loose-parse-int';
import parseBackticks from '../github-helpers/parse-backticks';

function handleToggle(event: delegate.Event<Event, HTMLDetailsElement>): void {
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
	} catch (error: unknown) {
		abortController.abort();
		addNotice([
			'Could not delete the repository. ',
			parseBackticks((error as Error).message),
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
	const abortHandler = (event: Event): void => {
		event.preventDefault();
		abortController.abort();
		buttonContainer.open = false;
	};

	// Add a global click listener to avoid potential future issues with z-index
	document.addEventListener('click', abortHandler, {once: true});
	// Abort on keypress
	document.addEventListener('keypress', abortHandler, {once: true});

	void verifyScopesWhileWaiting(abortController);

	try {
		await delay(5000, {signal: abortController.signal});
	} catch {}

	document.removeEventListener('click', abortHandler);
	document.removeEventListener('keypress', abortHandler);

	return !abortController.signal.aborted;
}

async function start(buttonContainer: HTMLDetailsElement): Promise<void> {
	if (!await buttonTimeout(buttonContainer)) {
		return;
	}

	try {
		const {nameWithOwner, owner} = getRepo()!;
		await api.v3('/repos/' + nameWithOwner, {
			method: 'DELETE',
			json: false,
		});
		const restoreURL = pageDetect.isOrganizationRepo()
			? `/organizations/${owner}/settings/deleted_repositories`
			: '/settings/deleted_repositories';
		const otherForksURL = `/${owner}?tab=repositories&type=fork`;
		addNotice(
			<span>Repository {nameWithOwner} deleted. You might be able to <a href={restoreURL}>restore it</a> or see <a href={otherForksURL}>your other forks.</a></span>,
			{action: false},
		);
		select('.application-main')!.remove();
		await cache.delete(getCacheKey());
		if (document.hidden) {
			// Try closing the tab if in the background. Could fail, so we still update the UI above
			void browser.runtime.sendMessage({closeTab: true});
		}
	} catch (error: unknown) {
		buttonContainer.closest('li')!.remove(); // Remove button
		addNotice([
			'Could not delete the repository. ',
			(error as any).response?.message ?? (error as any).message,
		], {
			type: 'error',
		});

		throw error;
	}
}

async function init(): Promise<VoidFunction | false> {
	if (
		// Only if the user can delete the repository
		!await elementReady('nav [data-content="Settings"]')

		// Only if the repository hasn't been starred
		// TODO [2022-06-01]: Remove `.social-count` (GHE)
		|| looseParseInt(select('.starring-container :is(.Counter, .social-count)')) > 0
	) {
		return false;
	}

	await api.expectToken();

	// (Ab)use the details element as state and an accessible "click-anywhere-to-cancel" utility
	select('.pagehead-actions')!.prepend(
		<li>
			<details className="details-reset details-overlay rgh-quick-repo-deletion">
				<summary role="button">
					{/* This extra element is needed to keep the button above the <summary>’s lightbox */}
					<span className="btn btn-sm btn-danger">
						<TrashIcon className="v-align-text-top mr-2"/>
					</span>
				</summary>
			</details>
		</li>,
	);

	delegate(document, '.rgh-quick-repo-deletion[open]', 'toggle', handleToggle, true);

	return async () => {
		// Wait for PJAX to restore DOM
		await delay(0);
		select('details.rgh-quick-repo-deletion')!.open = false;
	};
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isForkedRepo,
	],
	awaitDomReady: false,
	init,
});
