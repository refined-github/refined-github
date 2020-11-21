import './quick-fork-deletion.css';
import delay from 'delay';
import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import {getRepo} from '../github-helpers';
import pluralize from '../helpers/pluralize';
import addNotice from '../github-widgets/notice-bar';
import looseParseInt from '../helpers/loose-parse-int';
import parseBackticks from '../github-helpers/parse-backticks';

function handleToggle(event: delegate.Event<Event, HTMLDetailsElement>): void {
	const hasContent = select.exists([
		'[data-hotkey="g i"] .Counter:not([hidden])', // Open issues
		'[data-hotkey="g p"] .Counter:not([hidden])', // Open PRs
		'.rgh-open-prs-of-forks' // PRs opened in the source repo
	]);

	if (hasContent && !confirm('This fork has open issues/PRs, are you sure you want to delete everything?')) {
		// Close the <details> element again
		event.delegateTarget.open = false;
	} else {
		// Without the timeout, the same toggle event will also trigger the AbortController
		setTimeout(start, 1, event.delegateTarget);
	}
}

async function buttonTimeout(buttonContainer: HTMLDetailsElement): Promise<boolean> {
	// Watch for cancellations
	const abortController = new AbortController();
	buttonContainer.addEventListener('toggle', () => {
		abortController.abort();
	}, {once: true});

	void api.expectTokenScope('delete_repo').catch((error: Error) => {
		abortController.abort();
		buttonContainer.open = false;
		addNotice([
			'Could not delete the repository. ',
			parseBackticks(error.message)
		], {
			type: 'error',
			action: (
				<a className="btn btn-sm primary flash-action" href="https://github.com/settings/tokens">
					Update token…
				</a>
			)
		});
	});

	let secondsLeft = 5;
	const button = select('.btn', buttonContainer)!;
	try {
		do {
			button.style.transform = `scale(${1.2 - ((secondsLeft - 5) / 3)})`; // Dividend is zoom speed
			button.textContent = `Deleting fork in ${pluralize(secondsLeft, '$$ second')}. Cancel?`;
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

	select('.btn', buttonContainer)!.textContent = 'Deleting fork…';

	try {
		const {nameWithOwner} = getRepo()!;
		await api.v3('/repos/' + nameWithOwner, {
			method: 'DELETE',
			json: false
		});
		if (document.hidden) {
			void browser.runtime.sendMessage({closeTab: true});
		} else {
			addNotice(`Repository ${nameWithOwner} deleted`, {action: false});
			select('.application-main')!.remove();
		}
	} catch (error: unknown) {
		buttonContainer.closest('li')!.remove(); // Remove button
		addNotice([
			'Could not delete the repository. ',
			(error as any).response?.message ?? (error as any).message
		], {
			type: 'error'
		});

		throw error;
	}
}

async function init(): Promise<void | false> {
	if (
		// Only if the user can delete the repository
		!await elementReady('[data-tab-item="settings-tab"]') ||

		// Only if the repository hasn't been starred
		looseParseInt(select('.starring-container .social-count')!) > 0
	) {
		return false;
	}

	await api.expectToken();

	// (Ab)use the details element as state and an accessible "click-anywhere-to-cancel" utility
	select('.pagehead-actions')!.prepend(
		<li>
			<details className="details-reset details-overlay select-menu rgh-quick-fork-deletion">
				<summary aria-haspopup="menu" role="button">
					{/* This extra element is needed to keep the button above the <summary>’s lightbox */}
					<span className="btn btn-sm btn-danger">Delete fork</span>
				</summary>
			</details>
		</li>
	);

	delegate(document, '.rgh-quick-fork-deletion[open]', 'toggle', handleToggle, true);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isForkedRepo
	],
	awaitDomReady: false,
	init
});
