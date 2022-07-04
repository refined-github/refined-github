import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import {AlertIcon} from '@primer/octicons-react';
import debounceFn from 'debounce-fn';
import * as pageDetect from 'github-url-detection';
import * as textFieldEdit from 'text-field-edit';

import features from '.';
import {
	prCommitUrlRegex,
	preventPrCommitLinkLoss,
	prCompareUrlRegex,
	preventPrCompareLinkLoss,
	discussionUrlRegex,
	preventDiscussionLinkLoss,
} from '../github-helpers/prevent-link-loss';
import {getRghIssueUrl} from '../helpers/rgh-issue-link';

function handleButtonClick({delegateTarget: fixButton}: delegate.Event<MouseEvent, HTMLButtonElement>): void {
	/* There's only one rich-text editor even when multiple fields are visible; the class targets it #4678 */
	const field = fixButton.form!.querySelector('textarea.js-comment-field')!;
	textFieldEdit.replace(field, prCommitUrlRegex, preventPrCommitLinkLoss);
	textFieldEdit.replace(field, prCompareUrlRegex, preventPrCompareLinkLoss);
	textFieldEdit.replace(field, discussionUrlRegex, preventDiscussionLinkLoss);
	fixButton.parentElement!.remove();
}

function getUI(field: HTMLTextAreaElement): HTMLElement {
	return select('.rgh-prevent-link-loss-container', field.form!) ?? (
		<div className="flash flash-warn rgh-prevent-link-loss-container">
			<AlertIcon/>
			{' Your link may be '}
			<a href={getRghIssueUrl(2327)} target="_blank" rel="noopener noreferrer" data-hovercard-type="issue">
				misinterpreted
			</a>
			{' by GitHub.'}
			<button type="button" className="btn btn-sm primary flash-action rgh-prevent-link-loss">Fix link</button>
		</div>
	);
}

function isVulnerableToLinkLoss(value: string): boolean {
	// The replacement logic is not just in the regex, so it alone can't be used to detect the need for the replacement
	return value !== value.replace(prCommitUrlRegex, preventPrCommitLinkLoss)
		|| value !== value.replace(prCompareUrlRegex, preventPrCompareLinkLoss)
		|| value !== value.replace(discussionUrlRegex, preventDiscussionLinkLoss);
}

const updateUI = debounceFn(({delegateTarget: field}: delegate.Event<Event, HTMLTextAreaElement>): void => {
	if (!isVulnerableToLinkLoss(field.value)) {
		getUI(field).remove();
	} else if (pageDetect.isNewIssue() || pageDetect.isNewRelease() || pageDetect.isCompare()) {
		select('file-attachment', field.form!)!.append(
			<div className="mt-2">{getUI(field)}</div>,
		);
	} else {
		select('.form-actions', field.form!)!.before(
			<div className="mx-2 mb-2">{getUI(field)}</div>,
		);
	}
}, {
	wait: 300,
});

function init(): Deinit {
	return [
		updateUI.cancel,
		delegate(document, 'form:is(#new_issue, #new_release) textarea, form.js-new-comment-form textarea, textarea.comment-form-textarea', 'input', updateUI),
		delegate(document, '.rgh-prevent-link-loss', 'click', handleButtonClick),
	];
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasRichTextEditor,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
