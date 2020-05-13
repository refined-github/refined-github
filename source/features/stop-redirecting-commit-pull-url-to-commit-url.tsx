import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '../libs/features';

function init(): void {
	delegate(document, 'form#new_issue, form.js-new-comment-form', 'submit', updateTextArea);
}

function updateTextArea(event: delegate.Event): void {
	const field = event.delegateTarget.querySelector('textarea');

	field!.value = field!.value.replace(/\bhttps?:\/\/github.com\/.*\/pull\/.*\b/gi, (match): string => {
		const parts = match.split('/');
		const sha = parts[parts.length - 1].slice(0, 7);
		return `[${sha}](${match})`;
	});
}

features.add({
	id: __filebasename,
	description: 'Prevents Github from converting PR links into commit links',
	screenshot: false
}, {
	include: [
		pageDetect.isIssue,
		pageDetect.isPRConversation
	],
	init
});
