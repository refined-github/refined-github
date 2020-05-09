import './minimize-upload-bar.css';
import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';
import CloudUploadIcon from 'octicon/cloud-upload.svg';

import features from '../libs/features';

function addButton(): void {
	for (const toolbarButton of select.all('md-ref')) {
		toolbarButton.after(
			<button type="button" className="toolbar-item tooltipped tooltipped-n rgh-upload-btn" aria-label="Attach files">
				<CloudUploadIcon/>
			</button>
		);
		toolbarButton.closest('form')!.classList.add('rgh-minimize-upload-bar');
	}
}

function triggerUpload(event: delegate.Event<Event, HTMLButtonElement>): void {
	event.delegateTarget
		.form!
		.querySelector<HTMLInputElement>('[type="file"]')!
		.click(); // Open UI
}

function init(): void {
	addButton();
	delegate(document, '.rgh-upload-btn', 'click', triggerUpload);
}

features.add({
	id: __filebasename,
	description: 'Reduces the upload bar to a small button.',
	screenshot: 'https://user-images.githubusercontent.com/55841/59802383-3d994180-92e9-11e9-835d-60de67611c30.png'
}, {
	include: [
		pageDetect.hasRichTextEditor
	],
	init
});
