import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import * as icons from '../libs/icons';
import {getEventDelegator} from '../libs/dom-utils';

function addButtons() {
	for (const toolbar of select.all('form:not(.rgh-has-upload-field) markdown-toolbar')) {
		const form = toolbar.closest('form');
		if (!select.exists('.js-manual-file-chooser[type=file]', form)) {
			continue;
		}

		const toolbarGroup = select('.toolbar-group:last-child', toolbar);
		if (toolbarGroup) {
			toolbarGroup.append(
				<button type="button" class="toolbar-item rgh-upload-btn tooltipped tooltipped-nw" aria-label="Upload attachments" hotkey="u">
					{icons.cloudUpload()}
				</button>
			);
			form.classList.add('rgh-has-upload-field');
		}
	}
}

function triggerUploadUI(event) {
	if (!getEventDelegator(event, '.rgh-upload-btn')) {
		return;
	}

	event.target
		.closest('form')
		.querySelector('.js-manual-file-chooser') // Find <input [type=file]>
		.click(); // Open UI
}

function init() {
	addButtons();
	document.addEventListener('click', triggerUploadUI);
}

features.add({
	id: 'upload-button',
	include: [
		features.isPR,
		features.isIssue,
		features.isNewIssue,
		features.isCompare,
		features.isCommit
	],
	load: features.onAjaxedPages,
	init
});
