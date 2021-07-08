import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';
import showToast from '../github-helpers/toast';
import {clickAll} from './toggle-everything-with-alt';

let previousFile: HTMLElement | undefined;

function remember(event: delegate.Event): void {
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
		files.indexOf(thisFile) + 1,
	].sort((a, b) => a - b));

	for (const file of selectedFiles) {
		if (isChecked(file) !== previousFileState) {
			select('.js-reviewed-checkbox', file)!.click();
		}
	}
}

function markAsViewedSelector(target: HTMLElement): string {
	const checked = isChecked(target) ? '[checked]' : ':not([checked])';
	return '.js-reviewed-checkbox' + checked;
}

const markAsViewed = clickAll(markAsViewedSelector);

function onAltClick(event: delegate.Event<MouseEvent, HTMLInputElement>): void {
	if (!event.altKey || !event.isTrusted) {
		return;
	}

	void showToast(async () => {
		markAsViewed(event);
	}, {
		message: isChecked(event.delegateTarget)
			? 'Marking visible files as unviewed'
			: 'Marking visible files as viewed',
		doneMessage: 'Marking files completed',
	});
}

function init(): void {
	// `mousedown` required to avoid mouse selection on shift-click
	delegate(document, '.js-reviewed-toggle', 'mousedown', batchToggle);
	delegate(document, '.js-toggle-user-reviewed-file-form', 'submit', remember);
	delegate(document, '.js-reviewed-toggle', 'click', onAltClick);
}

function deinit(): void {
	previousFile = undefined;
}

void features.add(__filebasename, {
	awaitDomReady: false,
	include: [
		pageDetect.isPRFiles,
	],
	init,
	deinit,
});
