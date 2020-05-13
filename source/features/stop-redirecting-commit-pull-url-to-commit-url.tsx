import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '../libs/features';

function init(): void {
	delegate(document, 'form#new_issue, form.js-new-comment-form', 'submit', updateTextArea);
}

function updateTextArea(event: delegate.Event): void {
	const field = event.delegateTarget.querySelector('textarea')!;
	field.value = preventPrCommitLinkBreak(field.value);
}

features.add({
	id: __filebasename,
	description: 'Prevents Github from converting PR links into commit links',
	screenshot: false
}, {
	include: [
		pageDetect.hasComments
	],
	init
});
