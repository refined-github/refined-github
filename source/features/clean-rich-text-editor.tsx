import './clean-rich-text-editor.css';
import onetime from 'onetime';
import * as pageDetect from 'github-url-detection';

import features from '.';

function hideButtons(): void {
	document.body.classList.add('rgh-clean-rich-text-editor');
}

function hideTextareaTooltip(): void {
	for (const textarea of $$('.comment-form-textarea')) {
		textarea.title = '';
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.hasRichTextEditor
	],
	init: hideTextareaTooltip
}, {
	include: [
		pageDetect.isRepo
	],
	awaitDomReady: false,
	init: onetime(hideButtons)
});
