import './minimize-upload-bar.css';
import React from 'dom-chef';
import select from 'select-dom';
import cloudUploadIcon from 'octicon/cloud-upload.svg';
import delegate, {DelegateEvent} from 'delegate-it';
import features from '../libs/features';

function addButton(): void {
	for (const toolbarButton of select.all('md-ref')) {
		toolbarButton.after(
			<button type="button" className="toolbar-item tooltipped tooltipped-n rgh-upload-btn" aria-label="Attach files">
				{cloudUploadIcon()}
			</button>
		);
		toolbarButton.closest('form')!.classList.add('rgh-minimize-upload-bar');
	}
}

function triggerUpload(event: DelegateEvent<Event, HTMLButtonElement>): void {
	event.delegateTarget
		.form!
		.querySelector<HTMLInputElement>('[type="file"]')!
		.click(); // Open UI
}

function init(): void {
	addButton();
	delegate('.rgh-upload-btn', 'click', triggerUpload);
}

features.add({
	id: __featureName__,
	description: 'Reduces the upload bar to a small button.',
	screenshot: 'https://user-images.githubusercontent.com/55841/59802383-3d994180-92e9-11e9-835d-60de67611c30.png'
}, {
	include: [
		features.hasRichTextEditor
	],
	load: features.onAjaxedPages,
	init
});
