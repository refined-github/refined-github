// GitHub natively marks `.js-upload-markdown-image textarea.js-comment-field` as invalid while a file is uploading.
// `button[data-disable-invalid]` are automatically disabled while the form is invalid, but some buttons don't have it.
// `textarea[data-required-trimmed]` conflicts with this behavior by overriding the validity states in the meantime.

import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

const attribute = 'data-required-trimmed';
const attributeBackup = 'data-rgh-required-trimmed';

function toggleSubmitButtons({target, type}: Event): void {
	const fileAttachment = target as HTMLElement;

	// Temporarily disable `data-required-trimmed` so that it doesn't conflict with the desired behavior.
	// The complex selector ensures that we don't add the attribute to fields that never had it in the first place.
	const textarea = select(`[${attribute}], [${attributeBackup}]`, fileAttachment)!;
	if (textarea) {
		if (type === 'upload:setup') {
			textarea.setAttribute(attributeBackup, textarea.getAttribute(attribute)!);
			textarea.removeAttribute(attribute);
		} else {
			textarea.setAttribute(attribute, textarea.getAttribute(attributeBackup)!);
			textarea.removeAttribute(attributeBackup);
		}
	}

	// Needed for "Update comment" and "Close with comment" buttons
	for (const button of select.all('button[type="submit"]', fileAttachment.closest('form')!)) {
		button.toggleAttribute('disabled', type === 'upload:setup');
	}
}

function init(): void {
	document.addEventListener('upload:setup', toggleSubmitButtons, true);
	document.addEventListener('upload:complete', toggleSubmitButtons);
	document.addEventListener('upload:error', toggleSubmitButtons);
	document.addEventListener('upload:invalid', toggleSubmitButtons);
}

void features.add(__filebasename, {
	include: [
		pageDetect.hasRichTextEditor
	],
	exclude: [
		pageDetect.isNewIssue
	],
	init
});
