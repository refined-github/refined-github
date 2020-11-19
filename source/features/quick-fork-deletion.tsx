import './wait-for-build.css';
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
import oneEvent from '../helpers/one-event';

async function handleClick(event: delegate.Event): Promise<void> {
	const button = event.delegateTarget;
	event.preventDefault();
	if (!button.classList.toggle('btn-sm')) { // Use as state check
		void start();
	}
}

async function buttonTimeout(button: HTMLElement): Promise<boolean> {
	const abortController = new AbortController();
	abortController.signal.addEventListener('abort', () => {
		button.textContent = 'Delete fork';
	});

	// Watch for cancellations
	button.addEventListener('click', () => abortController.abort(), {once: true});

	let secondsLeft = 5;
	do {
		if (abortController.signal.aborted) {
			return false;
		}

		button.textContent = `Deleting fork in ${pluralize(secondsLeft, '$$ second')}. Cancel?`;
		await delay(1000); // eslint-disable-line no-await-in-loop
	} while (--secondsLeft);

	return true;
}

async function start(): Promise<void> {
	const button = select<HTMLButtonElement>('.rgh-quick-fork-deletion')!;
	if (!await buttonTimeout(button)) {
		return;
	}

	button.disabled = true;
	button.textContent = 'Deleting fork…';

	const {nameWithOwner} = getRepo()!;
	try {
		await api.v3('/repos/' + nameWithOwner, {
			method: 'DELETE'
		});
		addNotice(`Repository ${nameWithOwner} deleted`, {showCloseButton: false});
		select('.application-main')!.remove();
	} catch (error: unknown) {
		button.remove();
		addNotice(
			<>
				<p>Could not delete repository. Make sure <a href="https://github.com/settings/tokens">your token</a> has the <code>delete_repo</code> scope.</p>
				<p>Full error: {(error as any).response?.message ?? (error as any).message}</p>
			</>, {
				showCloseButton: false
			}
		);

		throw error;
	}
}

async function init(): Promise<void> {
	await api.expectToken();

	(await elementReady('.pagehead-actions'))!.prepend(
		<li>
			<a
				href={getRepo()!.nameWithOwner + '/settings'}
				className="btn btn-sm btn-danger rgh-quick-fork-deletion"
				style={{
					fontVariantNumeric: 'tabular-nums'
				}}
			>
				Delete fork
			</a>
		</li>
	);

	delegate(document, '.rgh-quick-fork-deletion', 'click', handleClick);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isForkedRepo
	],
	awaitDomReady: false,
	init
});
