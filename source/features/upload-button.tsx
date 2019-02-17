import React from 'dom-chef';
import select from 'select-dom';
import delegate, { DelegateEvent } from 'delegate';
import onetime from 'onetime';
import features from '../libs/features';
import * as icons from '../libs/icons';

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

function triggerUploadUI({target}: DelegateEvent) {
	(target as Element)
		.closest('form')!
		.querySelector('.js-manual-file-chooser')! // Find <input [type=file]>
		.click(); // Open UI
}

const listenOnce = onetime(() => {
	delegate('.rgh-upload-btn', 'click', triggerUploadUI);
});

function init() {
	addButtons();
	listenOnce();
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
