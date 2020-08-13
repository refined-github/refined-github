import './remove-label-faster.css';
import React from 'dom-chef';
import XIcon from 'octicon/x.svg';
import select from 'select-dom';
import oneTime from 'onetime';
import delegate from 'delegate-it';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';

import {getRepoURL, getConversationNumber} from '../github-helpers';

const canNotEditLabels = oneTime((): boolean => !select.exists('.sidebar-labels .octicon-gear'));

function updateSidebar() {
	select('#partial-discussion-sidebar')!.dispatchEvent(new CustomEvent('socket:message', {
		detail: {
			name: '',
			data: {},
			cached: false
		}
	}));
}

async function removeLabelButtonClickHandler(event: delegate.Event<MouseEvent, HTMLButtonElement>): Promise<void> {
	event.preventDefault();

	const removeLabelButton = event.delegateTarget;

	removeLabelButton.disabled = true;
	await api.v3(`repos/${getRepoURL()}/issues/${getConversationNumber()!}/labels/${removeLabelButton.dataset.name!}`, {
		method: 'DELETE'
	});

	updateSidebar();
}

// TODO: set variable via JSX and inline function in `init` after https://github.com/vadimdemedes/dom-chef/issues/66
function makeRemoveLabelButton(labelName: string, backgroundColor: string) {
	const removeLabelButton = (
		<button
			type="button"
			aria-label="Remove this label"
			className="btn-link tooltipped tooltipped-nw rgh-remove-label-faster"
			data-name={labelName}
		>
			<XIcon/>
		</button>
	);

	removeLabelButton.style.setProperty('--rgh-remove-label-faster-color', backgroundColor);

	return removeLabelButton;
}

async function init(): Promise<void> {
	await api.expectToken();

	observe('.labels > a:not(.rgh-remove-label-faster-already-added)', {
		constructor: HTMLElement,
		add(label) {
			label.classList.add('rgh-remove-label-faster-already-added');
			label.append(makeRemoveLabelButton(label.dataset.name!, label.style.backgroundColor));
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
		pageDetect.isIssue,
		pageDetect.isPRConversation
	],
	exclude: [
		canNotEditLabels
	],
	init: oneTime(init)
});
