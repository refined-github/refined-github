import './quick-label-removal.css';
import React from 'dom-chef';
import select from 'select-dom';
import {XIcon} from '@primer/octicons-react';
import onetime from 'onetime';
import delegate from 'delegate-it';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import {getConversationNumber} from '../github-helpers';

const canNotEditLabels = onetime((): boolean => !select.exists('.label-select-menu .octicon-gear'));

async function removeLabelButtonClickHandler(event: delegate.Event<MouseEvent, HTMLButtonElement>): Promise<void> {
	event.preventDefault();

	const removeLabelButton = event.delegateTarget;

	removeLabelButton.disabled = true;
	await api.v3(`issues/${getConversationNumber()!}/labels/${removeLabelButton.dataset.name!}`, {
		method: 'DELETE',
	});

	removeLabelButton.closest('a')!.remove();

	// Force update of label selector if necessary
	if (!select.exists('.sidebar-labels include-fragment')) {
		const deferredContentWrapper = select('.sidebar-labels .hx_rsm-content')!;
		const menu = deferredContentWrapper.closest('[src]')!;
		deferredContentWrapper.textContent = '';
		deferredContentWrapper.append(<include-fragment src={menu.getAttribute('src')!}/>);
	}
}

async function init(): Promise<void> {
	await api.expectToken();

	observe('.js-issue-labels .IssueLabel:not(.quick-label-removal-hiding-already-added)', {
		constructor: HTMLElement,
		add(label) {
			label.classList.add('rgh-quick-label-removal-already-added');
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
		},
	});

	delegate(document, '.rgh-quick-label-removal:not([disabled])', 'click', removeLabelButtonClickHandler);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isConversation,
	],
	exclude: [
		canNotEditLabels,
	],
	deduplicate: 'has-rgh-inner',
	init: onetime(init),
});
