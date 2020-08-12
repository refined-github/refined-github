import './remove-label-button.css';
import React from 'dom-chef';
import XIcon from 'octicon/x.svg';
import select from 'select-dom';
import oneTime from 'onetime';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import onReplacedElement from '../helpers/on-replaced-element';
import {getRepoURL, getConversationNumber} from '../github-helpers';

const canNotEditLabels = oneTime((): boolean => !select.exists('.sidebar-labels .octicon-gear'));

function updateSidebar() {
	select('#partial-discussion-sidebar')!.dispatchEvent(new CustomEvent('socket:message', {
		bubbles: false,
		cancelable: false,
		detail: {
			name: '',
			data: {},
			cached: false
		}
	}));
}

async function removeLabelButtonClickHandler(event: delegate.Event<MouseEvent, HTMLSpanElement>): Promise<void> {
	event.preventDefault();

	const removeLabelButton = event.delegateTarget;

	removeLabelButton.dataset.disabled = 'true';
	await api.v3(`repos/${getRepoURL()}/issues/${getConversationNumber()!}/labels/${removeLabelButton.dataset.name!}`, {
		method: 'DELETE'
	});

	updateSidebar();
}

function makeRemoveLabelButton(labelName: string, color: string, backgroundColor: string) {
	const removeLabelButton = (
		<span
			aria-label="Remove this label"
			className="tooltipped tooltipped-nw rgh-remove-label-button"
			data-name={labelName}
		>
			<XIcon/>
		</span>
	);

	removeLabelButton.style.setProperty('--rgh-remove-label-bg', color);
	removeLabelButton.style.setProperty('--rgh-remove-label-color', backgroundColor);

	return removeLabelButton;
}

async function init(): Promise<void> {
	await api.expectToken();

	for (const label of select.all('.labels > a')) {
		// Override !important rule
		label.style.setProperty('display', 'inline-flex', 'important');
		label.append(makeRemoveLabelButton(label.dataset.name!, label.style.color, label.style.backgroundColor));
	}

	delegate(document, '.rgh-remove-label-button:not([disabled])', 'click', removeLabelButtonClickHandler);
}

void features.add({
	id: __filebasename,
	description: 'Adds one-click buttons to remove labels in conversations.',
	screenshot: 'https://user-images.githubusercontent.com/36174850/89980178-0bc80480-dc7a-11ea-8ded-9e25f5f13d1a.gif'
}, {
	include: [
		pageDetect.isIssue,
		pageDetect.isPR
	],
	exclude: [
		canNotEditLabels
	],
	additionalListeners: [
		() => void onReplacedElement('#partial-discussion-sidebar', init)
	],
	init
});
