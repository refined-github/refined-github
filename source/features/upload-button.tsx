import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import {DelegateEvent} from 'delegate-it/types';
import features from '../libs/features';
import * as icons from '../libs/icons';

function addButtons() {
	for (const toolbar of select.all('form:not(.rgh-has-upload-field) markdown-toolbar')) {
		const form = toolbar.closest('form')!;
		if (!select.exists('.js-manual-file-chooser[type=file]', form)) {
			continue;
		}

		const toolbarGroup = select('.toolbar-group:last-child', toolbar);
		if (toolbarGroup) {
			toolbarGroup.append(
				<button type="button" className="toolbar-item rgh-upload-btn tooltipped tooltipped-nw" aria-label="Upload attachments" data-hotkey="u">
					{icons.cloudUpload()}
				</button>
			);
			form.classList.add('rgh-has-upload-field');
		}
	}
}

function triggerUploadUI({target}: DelegateEvent) {
	(target as Element)
		.closest('form')!
		.querySelector<HTMLElement>('.js-manual-file-chooser')! // Find <input [type=file]>
		.click(); // Open UI
}

function init() {
	addButtons();
	delegate('.rgh-upload-btn', 'click', triggerUploadUI);
}

features.add({
	id: 'upload-button',
	include: [
		features.hasRichTextEditor
	],
	load: features.onAjaxedPages,
	init
});
