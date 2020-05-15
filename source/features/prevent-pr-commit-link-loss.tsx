import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import AlertIcon from 'octicon/alert.svg';
import * as pageDetect from 'github-url-detection';

import features from '../libs/features';
import {containsPrCommitLink, preventPrCommitLinkBreak} from '../libs/utils';

function init(): void {
	delegate(document, 'form#new_issue textarea, form.js-new-comment-form textarea', 'input', handleTextAreaChange);
}

function handleTextAreaChange(event: delegate.Event): void {
	const field = (event.delegateTarget as HTMLInputElement);
	const fieldValue = field.value;

	if (containsPrCommitLink(fieldValue) && !select.exists('#fix-pr-commit-links')) {
		const closestForm = field.closest('form')!;
		select('.form-actions', closestForm)?.prepend(
			<div className="flash flash-warn mb-2">
				<AlertIcon/> Your PR Commit link may be <a href="https://github.com/sindresorhus/refined-github/issues/2327">misinterpreted by GitHub.</a>
				<button type="button" className="btn btn-sm primary flash-action" id="fix-pr-commit-links">Fix link</button>
			</div>
		);

		delegate(document, '#fix-pr-commit-links', 'click', () => {
			field.value = preventPrCommitLinkBreak(field.value);
		});
	}
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
