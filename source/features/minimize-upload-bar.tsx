import './minimize-upload-bar.css';
import React from 'dom-chef';
import select from 'select-dom';
import delegate, {DelegateEvent} from 'delegate-it';
import features from '../libs/features';
import * as icons from '../libs/icons';

async function addButton(): Promise<void> {
	for (const toolbarGroup of select.all('markdown-toolbar:not(.rgh-has-upload-btn) > :last-child')) {
		toolbarGroup.prepend(
			<button type="button" className="toolbar-item tooltipped tooltipped-n rgh-upload-btn" aria-label="Attach files">
				{icons.cloudUpload()}
			</button>
		);
		toolbarGroup.parentElement!.classList.add('rgh-has-upload-btn');
		toolbarGroup.closest('form')!.classList.add('rgh-has-upload-field');
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
	description: 'Add upload button and removes upload message',
	include: [
		features.hasRichTextEditor
	],
	load: features.onAjaxedPages,
	init
});
