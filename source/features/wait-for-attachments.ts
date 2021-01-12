import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

function toggleSubmitButtons(target: HTMLElement, disabled: boolean): void {
	const textarea = select('textarea', target)!;
	if (disabled) {
		textarea.removeAttribute('data-required-trimmed');
	} else {
		textarea.dataset.requiredTrimmed = 'Text field is empty';
	}

	// Force the "Update comment"/"Create pull request" buttons to be disabled
	for (const button of select.all('button[type="submit"]', target!.closest('form')!)) {
		button.toggleAttribute('disabled', disabled);
	}
}

function handleUploadStart(event: Event): void {
	toggleSubmitButtons(event.target as HTMLElement, true);
}

function handleUploadStop(event: Event): void {
	toggleSubmitButtons(event.target as HTMLElement, false);
}

function init(): void {
	document.addEventListener('upload:setup', handleUploadStart, true);
	document.addEventListener('upload:complete', handleUploadStop);
	document.addEventListener('upload:error', handleUploadStop);
	document.addEventListener('upload:invalid', handleUploadStop);
}

void features.add(__filebasename, {
	include: [
		pageDetect.hasRichTextEditor
	],
	init
});
