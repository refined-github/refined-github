import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import AlertIcon from 'octicon/alert.svg';
import * as pageDetect from 'github-url-detection';
import * as textFieldEdit from 'text-field-edit';

import features from '../libs/features';
import {prCommitRegex} from '../libs/utils';

function handleButtonClick(event: delegate.Event<MouseEvent, HTMLButtonElement>): void {
	const field = event.delegateTarget.form!.querySelector('textarea')!;
	textFieldEdit.replace(field, prCommitRegex, url => `[${url} ](${url})`);
	event.delegateTarget.parentElement!.remove();
}

function getUI(field: HTMLTextAreaElement): HTMLElement {
	return select('.rgh-fix-pr-commit-links-container', field.form!) ?? (
		<div className="flash flash-warn mb-2 rgh-fix-pr-commit-links-container">
			<AlertIcon/> Your PR Commit link may be <a target="_blank" rel="noopener noreferrer" href="https://github.com/sindresorhus/refined-github/issues/2327">misinterpreted by GitHub.</a>
			<button type="button" className="btn btn-sm primary flash-action rgh-fix-pr-commit-links">Fix link</button>
		</div>
	);
}

function updateUI(event: delegate.Event<InputEvent, HTMLTextAreaElement>): void {
	const field = event.delegateTarget;

	if (prCommitRegex.test(field.value)) {
		select('.form-actions', field.form!)!.prepend(getUI(field));
	} else {
		getUI(field).remove();
	}
}

function init(): void {
	delegate(document, 'form#new_issue textarea, form.js-new-comment-form textarea, textarea.comment-form-textarea', 'input', updateUI);
	delegate(document, '.rgh-fix-pr-commit-links', 'click', handleButtonClick);
}

features.add({
	id: __filebasename,
	description: 'Prevents Github from displaying PR commit links as non-PR commit links by modifying them before submission. This fixes the comment before submission, it can’t work on existing links. This is a GitHub bug.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/81925075-4a4d1500-95e0-11ea-90b7-1155fb2dfe20.png'
}, {
	include: [
		pageDetect.hasComments
	],
	init
});
