import './clean-rich-text-editor.css';
import select from 'select-dom';
import onetime from 'onetime';
import * as pageDetect from 'github-url-detection';

import features from '.';

function hideButtons(): void {
	document.body.classList.add('rgh-clean-rich-text-editor');
}

function hideTextareaTooltip(): void {
	for (const textarea of select.all('.comment-form-textarea')) {
		textarea.title = '';
	}
}

void features.add({
	id: __filebasename,
	description: 'Hides unnecessary comment field tooltips and toolbar items.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/53629083-a4fe8900-3c47-11e9-8211-bfe2d254ffcb.png'
}, {
	include: [
		pageDetect.hasRichTextEditor
	],
	init: hideTextareaTooltip
}, {
	include: [
		pageDetect.isRepo
	],
	waitForDomReady: false,
	init: onetime(hideButtons)
});
