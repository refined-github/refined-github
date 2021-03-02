import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';
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

function init(): void {
	// `mousedown` required to avoid mouse selection on shift-click
	delegate(document, '.js-toggle-user-reviewed-file-form', 'mousedown', batchToggle);
	delegate(document, '.js-toggle-user-reviewed-file-form', 'submit', remember);
	delegate(document, '.js-reviewed-checkbox', 'click', clickAll(markAsViewedSelector));
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
