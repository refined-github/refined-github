import './minimize-upload-bar.css';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

function addMinimizeUploadBarClassname(): void {
	for (const toolbarButton of select.all('md-ref')) {
		toolbarButton.closest('form')!.classList.add('rgh-minimize-upload-bar');
	}
}

function init(): void {
	addMinimizeUploadBarClassname();
}

void features.add(__filebasename, {
	include: [
		pageDetect.hasRichTextEditor
	],
	init
});
