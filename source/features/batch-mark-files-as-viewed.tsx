import select from 'select-dom';
import delegate from 'delegate-it';
import oneMutation from 'one-mutation';
import * as pageDetect from 'github-url-detection';

import features from '.';
import showToast from '../github-helpers/toast';
import {clickAll} from './toggle-everything-with-alt';

let previousFile: HTMLElement | undefined;

function remember(event: delegate.Event<Event, HTMLFormElement>): void {
	previousFile = event.delegateTarget.closest<HTMLElement>('.js-file')!;
}

function isChecked(file: HTMLElement): boolean {
	// Use the attribute because the `checked` property seems unreliable in the `click` handler
	return file.querySelector('.js-reviewed-checkbox')!.hasAttribute('checked');
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

function markAsViewedSelector(target: HTMLElement): string {
	const checked = (target as HTMLInputElement).checked ? ':not([checked])' : '[checked]';
	return '.js-reviewed-checkbox' + checked;
}

const markAsViewed = clickAll(markAsViewedSelector);

async function onAltClick(event: delegate.Event<MouseEvent, HTMLElement>): Promise<void> {
	if (event.altKey && event.isTrusted) {
		const lastCheckboxCompleted = oneMutation(select.last(markAsViewedSelector(event.delegateTarget))!, {attributes: true});
		const hideToast = await showToast();
		markAsViewed(event);
		await lastCheckboxCompleted; // Without this, done will be called too early
		await hideToast();
	}
}

function init(): void {
	// `mousedown` required to avoid mouse selection on shift-click
	delegate(document, '.js-toggle-user-reviewed-file-form', 'mousedown', batchToggle);
	delegate(document, '.js-toggle-user-reviewed-file-form', 'submit', remember);
	delegate(document, '.js-reviewed-checkbox', 'click', onAltClick);
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
