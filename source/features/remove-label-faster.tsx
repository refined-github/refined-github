import './remove-label-faster.css';
import React from 'dom-chef';
import {XIcon} from '@primer/octicons-react';
import select from 'select-dom';
import onetime from 'onetime';
import delegate from 'delegate-it';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import {getRepoURL, getConversationNumber} from '../github-helpers';

const canNotEditLabels = onetime((): boolean => !select.exists('.sidebar-labels .octicon-gear'));

async function removeLabelButtonClickHandler(event: delegate.Event<MouseEvent, HTMLButtonElement>): Promise<void> {
	event.preventDefault();

	const removeLabelButton = event.delegateTarget;

	removeLabelButton.disabled = true;
	await api.v3(`repos/${getRepoURL()}/issues/${getConversationNumber()!}/labels/${removeLabelButton.dataset.name!}`, {
		method: 'DELETE'
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

	observe('.sidebar-labels .IssueLabel:not(.rgh-remove-label-faster-already-added)', {
		constructor: HTMLElement,
		add(label) {
			label.classList.add('rgh-remove-label-faster-already-added');
			label.append(
				<button
					type="button"
					aria-label="Remove this label"
					className="btn-link tooltipped tooltipped-nw rgh-remove-label-faster"
					data-name={label.dataset.name}
					style={/* eslint-disable-line @typescript-eslint/consistent-type-assertions */{
						'--rgh-remove-label-faster-color': label.style.backgroundColor
					} as React.CSSProperties}
				>
					<XIcon/>
				</button>
			);
		}
	});

	delegate(document, '.rgh-remove-label-faster:not([disabled])', 'click', removeLabelButtonClickHandler);
}

void features.add({
	id: __filebasename,
	description: 'Adds one-click buttons to remove labels in conversations.',
	screenshot: 'https://user-images.githubusercontent.com/36174850/89980178-0bc80480-dc7a-11ea-8ded-9e25f5f13d1a.gif'
}, {
	include: [
		pageDetect.isConversation
	],
	exclude: [
		canNotEditLabels
	],
	init: onetime(init)
});
