import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import AlertIcon from 'octicon/alert.svg';
import * as pageDetect from 'github-url-detection';

import features from '../libs/features';
import {prCommitRegex, preventPrCommitLinkBreak} from '../libs/utils';

function init(): void {
	delegate(document, 'form#new_issue textarea, form.js-new-comment-form textarea, textarea.comment-form-textarea', 'input', handleTextAreaChange);
	delegate(document, '.rgh-fix-pr-commit-links', 'click', (event: delegate.Event<MouseEvent, HTMLButtonElement>) => {
		const field = event.delegateTarget.form!.querySelector('textarea')!;
		field.value = preventPrCommitLinkBreak(field.value);
	});
}

function handleTextAreaChange(event: delegate.Event<InputEvent, HTMLTextAreaElement>): void {
	const field = event.delegateTarget;

	const formWarningExists = select.exists('.rgh-fix-pr-commit-links', field.form!);

	if(!prCommitRegex.test(field.value) && formWarningExists) {
		select('.rgh-fix-pr-commit-links-container', field.form!)!.remove();
	}

	if (prCommitRegex.test(field.value) && !formWarningExists) {
		select('.form-actions', field.form!)!.prepend(
			<div className="flash flash-warn mb-2 rgh-fix-pr-commit-links-container">
				<AlertIcon/>Your PR Commit link may be <a target="_blank" rel="noopener noreferrer" href="https://github.com/sindresorhus/refined-github/issues/2327">misinterpreted by GitHub.</a>
				<button type="button" className="btn btn-sm primary flash-action rgh-fix-pr-commit-links">Fix link</button>
			</div>
		);
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
