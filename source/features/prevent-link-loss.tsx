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
	preventDiscussionLinkLoss
} from '../github-helpers/prevent-link-loss';

function handleButtonClick({delegateTarget: fixButton}: delegate.Event<MouseEvent, HTMLButtonElement>): void {
	const field = fixButton.form!.querySelector('textarea')!;
	textFieldEdit.replace(field, prCommitUrlRegex, preventPrCommitLinkLoss);
	textFieldEdit.replace(field, prCompareUrlRegex, preventPrCompareLinkLoss);
	textFieldEdit.replace(field, discussionUrlRegex, preventDiscussionLinkLoss);
	fixButton.parentElement!.remove();
}

function getRghIssueLink(issueNumber: number): Element {
	return <a target="_blank" rel="noopener noreferrer" href={`https://github.com/sindresorhus/refined-github/issues/${issueNumber}`}>#{issueNumber}</a>;
}

function getUI(field: HTMLTextAreaElement): HTMLElement {
	return select('.rgh-prevent-link-loss-container', field.form!) ?? (
		<div className="flash flash-warn mb-2 rgh-prevent-link-loss-container">
			<AlertIcon/> Your link may be misinterpreted by GitHub (see {getRghIssueLink(2327)}, {getRghIssueLink(3528)}, {getRghIssueLink(4357)}).
			<button type="button" className="btn btn-sm primary flash-action rgh-prevent-link-loss">Fix link</button>
		</div>
	);
}

function isVulnerableToLinkLoss(value: string): boolean {
	// The replacement logic is not just in the regex, so it alone can't be used to detect the need for the replacement
	return value !== value.replace(prCommitUrlRegex, preventPrCommitLinkLoss) ||
		value !== value.replace(prCompareUrlRegex, preventPrCompareLinkLoss) ||
		value !== value.replace(discussionUrlRegex, preventDiscussionLinkLoss);
}

const updateUI = debounceFn(({delegateTarget: field}: delegate.Event<Event, HTMLTextAreaElement>): void => {
	if (!isVulnerableToLinkLoss(field.value)) {
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
	delegate(document, '.rgh-prevent-link-loss', 'click', handleButtonClick);
}

void features.add(__filebasename, {
	include: [
		pageDetect.hasRichTextEditor
	],
	init
});
