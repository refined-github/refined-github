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

function handleToggle(event: delegate.Event<Event, HTMLDetailsElement>): void {
	const hasContent = select.exists(`
		[data-hotkey="g i"] .Counter:not([hidden]),
		[data-hotkey="g p"] .Counter:not([hidden]),
		.rgh-open-prs-of-forks
	`);

	if (hasContent && !confirm('This fork has open issues/PRs, are you sure you want to delete everything?')) {
		// Close the <details> element again
		event.delegateTarget.open = false;
	} else {
		setTimeout(start, 1); // Without the timeout, the same toggle event will also trigger the AbortController
	}
}

async function buttonTimeout(button: HTMLElement): Promise<boolean> {
	const abortController = new AbortController();
	const animation = button.animate({
		transform: 'scale(4)'
	}, {
		easing: 'ease-in',
		fill: 'forwards',
		duration: 5000
	});

	abortController.signal.addEventListener('abort', () => {
		button.textContent = 'Delete fork';
		animation.cancel();
	});

	// Watch for cancellations
	button.closest('details')!.addEventListener('toggle', () => {
		abortController.abort();
	}, {once: true});

	let secondsLeft = 5;
	do {
		button.textContent = `Deleting fork in ${pluralize(secondsLeft, '$$ second')}. Cancel?`;
		await delay(1000); // eslint-disable-line no-await-in-loop
	} while (--secondsLeft && !abortController.signal.aborted);

	return !abortController.signal.aborted;
}

async function start(): Promise<void> {
	const button = select('.rgh-quick-fork-deletion span')!;
	if (!await buttonTimeout(button)) {
		return;
	}

	button.textContent = 'Deleting fork…';

	const {nameWithOwner} = getRepo()!;
	try {
		await api.v3('/repos/' + nameWithOwner, {
			method: 'DELETE'
		});
		addNotice(`Repository ${nameWithOwner} deleted`, {showCloseButton: false});
		select('.application-main')!.remove();
	} catch (error: unknown) {
		button.closest('details')!.remove();
		addNotice(
			<>
				<p>
					Could not delete repository. Make sure <a href="https://github.com/settings/tokens">your token</a> has the <code>delete_repo</code> scope.
				</p>
				<p>
					Full error: {(error as any).response?.message ?? (error as any).message}
				</p>
			</>,
			{
				showCloseButton: false
			}
		);

		throw error;
	}
}

async function init(): Promise<void | false> {
	const stars = await elementReady('.starring-container .social-count');
	if (looseParseInt(stars!) > 0) {
		return false;
	}

	await api.expectToken();

	// (Ab)use the details element as state and an accessible "click-anywhere-to-cancel" utility
	stars!.closest('.pagehead-actions')!.prepend(
		<li>
			<details className="details-reset details-overlay select-menu rgh-quick-fork-deletion">
				<summary aria-haspopup="menu" role="button">
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
