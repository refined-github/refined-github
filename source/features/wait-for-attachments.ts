import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

function toggleSubmitButtons({target, type}: Event): void {
	// `data-required-trimmed` overrides the `disabled` state of the form
	const textarea = select('textarea', target as HTMLFormElement)!;
	if (type === 'upload:setup') {
		delete textarea.dataset.requiredTrimmed;
	} else {
		textarea.dataset.requiredTrimmed = 'Text field is empty';
	}
}

function init(): void {
	document.addEventListener('upload:setup', toggleSubmitButtons, true);
	document.addEventListener('upload:complete', toggleSubmitButtons);
	document.addEventListener('upload:error', toggleSubmitButtons);
	document.addEventListener('upload:invalid', toggleSubmitButtons);
}

void features.add(__filebasename, {
	include: [
		pageDetect.hasRichTextEditor
	],
	exclude: [
		pageDetect.isNewIssue
	],
	init
});
