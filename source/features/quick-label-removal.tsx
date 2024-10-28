import './quick-label-removal.css';

import React from 'dom-chef';
import {elementExists} from 'select-dom';
import {$} from 'select-dom/strict.js';
import XIcon from 'octicons-plain-react/X';
import {assertError} from 'ts-extras';
import * as pageDetect from 'github-url-detection';
import delegate, {DelegateEvent} from 'delegate-it';

import onetime from '../helpers/onetime.js';
import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import showToast from '../github-helpers/toast.js';
import {getConversationNumber} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';
import {expectToken} from '../github-helpers/github-token.js';

const canNotEditLabels = onetime((): boolean => !elementExists('.label-select-menu .octicon-gear'));

function getLabelList(): HTMLElement {
	return $('.label-select-menu [src] .hx_rsm-content');
}

function removeLabelList(): void {
	const list = getLabelList();
	list.closest('details')!.addEventListener('toggle', restoreLabelList, {once: true});
	list.replaceChildren();
}

function restoreLabelList(): void {
	const list = getLabelList();
	list.replaceChildren(
		<include-fragment src={list.closest('[src]')!.getAttribute('src')!} />,
	);
}

async function removeLabelButtonClickHandler(event: DelegateEvent<MouseEvent, HTMLButtonElement>): Promise<void> {
	event.preventDefault();

	const removeLabelButton = event.delegateTarget;
	const label = removeLabelButton.closest('a')!;

	try {
		label.hidden = true;
		// Disable dropdown list to avoid race conditions in the UI.
		// Each deletion would be followed by a reload of the list _at the wrong time_
		removeLabelList();

		await api.v3(`issues/${getConversationNumber()!}/labels/${removeLabelButton.dataset.name!}`, {
			method: 'DELETE',
		});
	} catch (error) {
		assertError(error);
		void showToast(error);
		removeLabelButton.blur();
		label.hidden = false;
		return;
	}

	label.remove();
}

function addRemoveLabelButton(label: HTMLElement): void {
	label.classList.add('d-inline-flex');
	label.append(
		<button
			type="button"
			className="btn-link rgh-quick-label-removal"
			data-name={label.dataset.name}
		>
			<XIcon />
		</button>,
	);
}

async function init(signal: AbortSignal): Promise<void> {
	await expectToken();

	delegate('.rgh-quick-label-removal:enabled', 'click', removeLabelButtonClickHandler, {signal});
	observe('.js-issue-labels .IssueLabel', addRemoveLabelButton, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isConversation,
	],
	exclude: [
		canNotEditLabels,
		pageDetect.isArchivedRepo,
	],
	awaitDomReady: true, // The sidebar is near the end of the page
	init,
});

/*

Test URLs:

https://github.com/refined-github/refined-github/pull/3454
https://github.com/refined-github/refined-github/issues/3440

*/
