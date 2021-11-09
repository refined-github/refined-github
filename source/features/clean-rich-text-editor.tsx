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

void features.add(import.meta.url, {
	include: [
		pageDetect.hasRichTextEditor,
	],
	deduplicate: 'has-rgh-inner',
	init: hideTextareaTooltip,
}, {
	include: [
		pageDetect.isRepo,
	],
	awaitDomReady: false,
	init: onetime(hideButtons),
});
