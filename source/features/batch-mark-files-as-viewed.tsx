import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import {CheckIcon, XIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '.';

let previousFile: HTMLElement | undefined;

function remember(event: delegate.Event<Event, HTMLFormElement>): void {
	previousFile = event.delegateTarget.closest<HTMLElement>('.js-file')!;
}

function isChecked(file: HTMLElement): boolean {
	// Use the attribute because the `checked` property seems unreliable in the `click` handler
	return file.querySelector('.js-reviewed-checkbox')!.hasAttribute('checked');
}

function markAll(event: delegate.Event<MouseEvent, HTMLFormElement>): void {
	if (!event.altKey) {
		return;
	}

	const bulkActionsWorking = (
		<div
			role="log"
			style={{zIndex: 101}}
			className="position-fixed bottom-0 right-0 ml-5 mb-5 anim-fade-in fast Toast Toast--loading"
		>
			<span className="Toast-icon">
				<svg className="Toast--spinner" viewBox="0 0 32 32" width="18" height="18">
					<path fill="#959da5" d="M16 0 A16 16 0 0 0 16 32 A16 16 0 0 0 16 0 M16 4 A12 12 0 0 1 16 28 A12 12 0 0 1 16 4"/>
					<path fill="#ffffff" d="M16 0 A16 16 0 0 1 32 16 L28 16 A12 12 0 0 0 16 4z"/>
				</svg>
			</span>
			<span className="Toast-content">Bulk actions currently being processed.</span>
		</div>
	);

	const bulkActionsFinished = (
		<div
			role="log"
			style={{zIndex: 101}}
			className="position-fixed bottom-0 right-0 ml-5 mb-5 anim-fade-in fast Toast Toast--success"
		>
			<span className="Toast-icon">
				<CheckIcon/>
			</span>
			<span className="Toast-content">Bulk action processing complete.</span>
			<button className="Toast-dismissButton" type="button" aria-label="Close">
				<XIcon/>
			</button>
		</div>
	);
	document.body.append(bulkActionsWorking);

	for (const file of select.all('.js-file')) {
		if (!isChecked(file)) {
			select('.js-reviewed-checkbox', file)!.click();
		}
	}

	bulkActionsWorking.replaceWith(bulkActionsFinished);
}

function batchToggle(event: delegate.Event<MouseEvent, HTMLFormElement>): void {
	if (!event.shiftKey || !previousFile) {
		return;
	}

	event.preventDefault();
	event.stopImmediatePropagation();

	const previousFileState = isChecked(previousFile);
	const thisFile = event.delegateTarget.closest<HTMLElement>('.js-file')!;
	const files = select.all('.js-file');
	const selectedFiles = files.slice(...[
		files.indexOf(previousFile) + 1,
		files.indexOf(thisFile) + 1
	].sort((a, b) => a - b));

	for (const file of selectedFiles) {
		if (isChecked(file) !== previousFileState) {
			select('.js-reviewed-checkbox', file)!.click();
		}
	}
}

function init(): void {
	// `mousedown` required to avoid mouse selection on shift-click
	delegate(document, '.js-toggle-user-reviewed-file-form', 'mousedown', batchToggle);
	delegate(document, '.js-toggle-user-reviewed-file-form', 'submit', remember);
	delegate(document, '.diffbar-item progress-bar', 'click', markAll);
}

function deinit(): void {
	previousFile = undefined;
}

void features.add(__filebasename, {
	awaitDomReady: false,
	include: [
		pageDetect.isPRFiles
	],
	init,
	deinit
});
