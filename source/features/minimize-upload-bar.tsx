import './minimize-upload-bar.css';
import React from 'dom-chef';
import select from 'select-dom';
import delegate, {DelegateEvent} from 'delegate-it';
import features from '../libs/features';
import * as icons from '../libs/icons';

async function addButton(): Promise<void> {
	for (const toolbarGroup of select.all('form:not(.rgh-minimize-upload-bar) markdown-toolbar > :last-child')) {
		toolbarGroup.prepend(
			<button type="button" className="toolbar-item tooltipped tooltipped-n rgh-upload-btn" aria-label="Attach files">
				{icons.cloudUpload()}
			</button>
		);
		toolbarGroup.closest('form')!.classList.add('rgh-minimize-upload-bar');
	}
}

function triggerUpload(event: DelegateEvent<Event, HTMLButtonElement>): void {
	event.delegateTarget
		.form!
		.querySelector<HTMLInputElement>('.js-manual-file-chooser')!
		.click(); // Open UI
}

function init(): void {
	addButton();
	delegate('.rgh-upload-btn', 'click', triggerUpload);
}

features.add({
	id: 'minimize-upload-bar',
	description: 'Add upload button to the comment toolbar and remove the upload message',
	screenshot: 'https://user-images.githubusercontent.com/55841/59802383-3d994180-92e9-11e9-835d-60de67611c30.png',
	include: [
		features.hasRichTextEditor
	],
	load: features.onAjaxedPages,
	init
});
