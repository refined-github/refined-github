import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '../libs/features';
import {preventPrCommitLinkBreak} from '../libs/utils';

function init(): void {
	delegate(document, 'form#new_issue, form.js-new-comment-form', 'submit', updateTextArea);
}

function updateTextArea(event: delegate.Event): void {
	const field = event.delegateTarget.querySelector('textarea')!;
	field.value = preventPrCommitLinkBreak(field.value);
}

features.add({
	id: __filebasename,
	description: 'Prevents Github from displaying PR commit links as non-PR commit links by modifying them before submission. This fixes the comment before submission, it can’t work on existing links. This is a GitHub bug.',
	screenshot: false
}, {
	include: [
		pageDetect.hasComments
	],
	init
});
