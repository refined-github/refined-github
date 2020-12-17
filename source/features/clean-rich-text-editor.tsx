import './clean-rich-text-editor.css';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import cssOnlyFeature from '../helpers/css-only-feature';

function hideTextareaTooltip(): void {
	for (const textarea of select.all('.comment-form-textarea')) {
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
	init() {
		// Hide buttons
		void cssOnlyFeature(__filebasename);
	}
});
