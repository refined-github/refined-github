import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import {AlertIcon} from '@primer/octicons-react';
import debounceFn from 'debounce-fn';
import * as pageDetect from 'github-url-detection';
import * as textFieldEdit from 'text-field-edit';

import features from '.';
import {prCommitUrlRegex, preventPrCommitLinkLoss, prCompareUrlRegex, preventPrCompareLinkLoss} from '../github-helpers';

function handleButtonClick({delegateTarget: fixButton}: delegate.Event<MouseEvent, HTMLButtonElement>): void {
	const field = fixButton.form!.querySelector('textarea')!;
	textFieldEdit.replace(field, prCommitUrlRegex, preventPrCommitLinkLoss);
	textFieldEdit.replace(field, prCompareUrlRegex, preventPrCompareLinkLoss);
	fixButton.parentElement!.remove();
}

function getUI(field: HTMLTextAreaElement): HTMLElement {
	return select('.rgh-fix-pr-commit-links-container', field.form!) ?? (
		<div className="flash flash-warn mb-2 rgh-fix-pr-commit-links-container">
			<AlertIcon/> Your PR Commit link may be <a target="_blank" rel="noopener noreferrer" href="https://github.com/sindresorhus/refined-github/issues/2327">misinterpreted by GitHub.</a>
			<button type="button" className="btn btn-sm primary flash-action rgh-fix-pr-commit-links">Fix link</button>
		</div>
	);
}

const updateUI = debounceFn(({delegateTarget: field}: delegate.Event<Event, HTMLTextAreaElement>): void => {
	// The replacement logic is not just in the regex, so it alone can't be used to detect the need for the replacement
	if (field.value === field.value.replace(prCommitUrlRegex, preventPrCommitLinkLoss) && field.value === field.value.replace(prCompareUrlRegex, preventPrCompareLinkLoss)) {
		getUI(field).remove();
	} else if (pageDetect.isNewIssue() || pageDetect.isCompare()) {
		select('file-attachment', field.form!)!.append(
			<div className="m-2">{getUI(field)}</div>
		);
	} else {
		select('.form-actions', field.form!)!.prepend(getUI(field));
	}
}, {
	wait: 300
});

function init(): void {
	delegate(document, 'form#new_issue textarea, form.js-new-comment-form textarea, textarea.comment-form-textarea', 'input', updateUI);
	delegate(document, '.rgh-fix-pr-commit-links', 'click', handleButtonClick);
}

void features.add(__filebasename, {
	include: [
		pageDetect.hasRichTextEditor
	],
	init
});
