import './remove-label-with-a-single-click.css';
import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import XIcon from 'octicon/x.svg';
import * as pageDetect from 'github-url-detection';
import oneTime from 'onetime';

import features from '.';
import onReplacedElement from '../helpers/on-replaced-element';
import * as api from '../github-helpers/api';
import {getRepoURL, getConversationNumber} from '../github-helpers';

const canEditLabels = oneTime((): boolean => select.exists('.sidebar-labels .octicon-gear'));

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

async function removeButtonClickHandler(event: delegate.Event<MouseEvent, HTMLSpanElement>): Promise<void> {
	event.preventDefault();

	const removeButton = event.delegateTarget;

	// Prevent multiple clicks
	if (removeButton.dataset.disabled) {
		return;
	}

	removeButton.dataset.disabled = 'true';
	await api.v3(`repos/${getRepoURL()}/issues/${getConversationNumber()!}/labels/${removeButton.dataset.name!}`, {
		method: 'DELETE'
	});

	updateSidebar();
}

function makeRemoveButton(labelName: string, color: string, backgroundColor: string) {
	const closeButton = (
		<span
			aria-label="Remove this label"
			className="tooltipped tooltipped-nw rgh-remove-label-with-a-single-click"
			data-name={labelName}
		>
			<XIcon/>
		</span>
	);

	closeButton.style.setProperty('--rgh-remove-label-bg', color);
	closeButton.style.setProperty('--rgh-remove-label-color', backgroundColor);

	return closeButton;
}

function init(): void {
	if (!canEditLabels()) {
		return;
	}

	for (const label of select.all('.labels > a')) {
		// Override !important rule
		label.style.setProperty('display', 'inline-flex', 'important');
		label.append(makeRemoveButton(label.dataset.name!, label.style.color, label.style.backgroundColor));
	}

	delegate(document, '.rgh-remove-label-with-a-single-click', 'click', removeButtonClickHandler);
}

void features.add({
	id: __filebasename,
	description: '',
	screenshot: false
}, {
	include: [
		pageDetect.isIssue,
		pageDetect.isPR
	],
	additionalListeners: [
		() => void onReplacedElement('#partial-discussion-sidebar', init)
	],
	init
});
