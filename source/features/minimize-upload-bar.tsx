import './minimize-upload-bar.css';
import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import features from '../libs/features';
import * as icons from '../libs/icons';

async function addButton(): Promise<void> {
	for (const toolbar of select.all('form:not(.rgh-has-upload-field) markdown-toolbar')) {
		select(':scope > div:last-child', toolbar)!.prepend(
			<button type="button" className="toolbar-item tooltipped tooltipped-n rgh-upload-btn" aria-label="Attach files">
				{icons.cloudUpload()}
			</button>
		);
		toolbar.closest('form')!.classList.add('rgh-has-upload-field');
	}
}

function triggerUpload(event: KeyboardEvent): void {
	(event.target as Element)
		.closest('form')!
		.querySelector<HTMLInputElement>('.js-manual-file-chooser')!
		.click(); // Open UI
}

function init(): void {
	addButton();
	delegate('.rgh-upload-btn', 'click', triggerUpload);
}

features.add({
	id: 'minimize-upload-bar',
	description: 'Add upload button and removes upload message',
	include: [
		features.hasRichTextEditor
	],
	load: features.onAjaxedPages,
	init
});
