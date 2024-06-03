import './quick-label-removal.css';
import React from 'dom-chef';
import {expectElement as $, elementExists} from 'select-dom';
import onetime from 'onetime';
import XIcon from 'octicons-plain-react/X';
import {assertError} from 'ts-extras';
import * as pageDetect from 'github-url-detection';
import delegate, {DelegateEvent} from 'delegate-it';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import showToast from '../github-helpers/toast.js';
import {getConversationNumber} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';
import {expectToken} from '../github-helpers/github-token.js';

const canNotEditLabels = onetime((): boolean => !elementExists('.label-select-menu .octicon-gear'));

async function removeLabelButtonClickHandler(event: DelegateEvent<MouseEvent, HTMLButtonElement>): Promise<void> {
	event.preventDefault();

	const removeLabelButton = event.delegateTarget;
	const label = removeLabelButton.closest('a')!;

	// Force update of label selector if necessary
	if (!elementExists('.sidebar-labels include-fragment')) {
		const deferredContentWrapper = $('.sidebar-labels .hx_rsm-content');
		const menu = deferredContentWrapper.closest('[src]')!;
		deferredContentWrapper.textContent = '';
		deferredContentWrapper.append(<include-fragment src={menu.getAttribute('src')!}/>);
	}

	label.hidden = true;
	try {
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
			aria-label="Remove this label"
			className="btn-link tooltipped tooltipped-nw rgh-quick-label-removal"
			data-name={label.dataset.name}
		>
			<XIcon/>
		</button>,
	);
}

async function init(signal: AbortSignal): Promise<void> {
	await expectToken();

	delegate('.rgh-quick-label-removal:not([disabled])', 'click', removeLabelButtonClickHandler, {signal});

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
