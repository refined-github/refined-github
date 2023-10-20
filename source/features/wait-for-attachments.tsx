// GitHub natively marks `.js-upload-markdown-image textarea.js-comment-field` as invalid while a file is uploading.
// `textarea[data-required-trimmed]` conflicts with this behavior by overriding the validity states in the meantime.
// `button[data-disable-invalid]` are automatically disabled while the form is invalid, but some buttons don't have it.

import {$, $$} from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';

const attribute = 'data-required-trimmed';
const attributeBackup = 'data-rgh-required-trimmed';

function toggleSubmitButtons({target, type}: Event): void {
	const fileAttachment = target as HTMLElement;

	for (const button of $$('.btn-primary[type="submit"]:not([data-disable-invalid])', fileAttachment.closest('form')!)) {
		button.dataset.disableInvalid = '';
	}

	// Temporarily disable `data-required-trimmed` so that it doesn't conflict with the desired behavior.
	// The complex selector ensures that we don't add the attribute to fields that never had it in the first place.
	const textarea = $(`[${attribute}], [${attributeBackup}]`, fileAttachment)!;
	if (textarea) {
		if (type === 'upload:setup') {
			textarea.setAttribute(attributeBackup, textarea.getAttribute(attribute)!);
			textarea.removeAttribute(attribute);
		} else {
			textarea.setAttribute(attribute, textarea.getAttribute(attributeBackup)!);
			textarea.removeAttribute(attributeBackup);
		}
	}
}

function init(signal: AbortSignal): void {
	document.addEventListener('upload:setup', toggleSubmitButtons, {signal, capture: true});
	document.addEventListener('upload:complete', toggleSubmitButtons, {signal});
	document.addEventListener('upload:error', toggleSubmitButtons, {signal});
	document.addEventListener('upload:invalid', toggleSubmitButtons, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasRichTextEditor,
	],
	exclude: [
		pageDetect.isNewIssue,
	],
	init,
});
