import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';
import clickAll from '../helpers/click-all';
import showToast from '../github-helpers/toast';
import getItemsBetween from '../helpers/get-items-between';

let previousFile: HTMLElement | undefined;
let runningBatch = false;

function remember(event: delegate.Event): void {
	// Only remember if the user clicked it. `isTrusted` doesn't work because `remember` is called on a fake `submit` event
	if (!runningBatch) {
		previousFile = event.delegateTarget.closest('.js-file')!;
	}
}

function isChecked(file: HTMLElement): boolean {
	return file.querySelector('input.js-reviewed-checkbox')!.checked;
}

function batchToggle(event: delegate.Event<MouseEvent, HTMLFormElement>): void {
	if (!event.shiftKey) {
		return;
	}

	event.preventDefault();
	event.stopImmediatePropagation();

	const files = select.all('.js-file');
	const thisFile = event.delegateTarget.closest('.js-file')!;
	const isThisBeingFileChecked = !isChecked(thisFile); // Flip it because the value hasn't changed yet

	runningBatch = true;
	const selectedFiles = getItemsBetween(files, previousFile, thisFile);
	for (const file of selectedFiles) {
		if (file !== thisFile && isChecked(file) !== isThisBeingFileChecked) {
			select('.js-reviewed-checkbox', file)!.click();
		}
	}

	runningBatch = false;
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

function init(): Deinit[] {
	return [
		// `mousedown` required to avoid mouse selection on shift-click
		delegate(document, '.js-reviewed-toggle', 'mousedown', batchToggle),
		delegate(document, '.js-toggle-user-reviewed-file-form', 'submit', remember),
		delegate(document, '.js-reviewed-toggle', 'click', onAltClick),
		() => {
			previousFile = undefined;
		},
	];
}

void features.add(import.meta.url, {
	awaitDomReady: false,
	include: [
		pageDetect.isPRFiles,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
