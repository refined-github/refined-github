import React from 'dom-chef';
import {$} from 'select-dom';
import {AlertIcon} from '@primer/octicons-react';
import debounceFn from 'debounce-fn';
import * as pageDetect from 'github-url-detection';
import {replaceFieldText} from 'text-field-edit';
import delegate, {DelegateEvent} from 'delegate-it';

import features from '../feature-manager.js';
import {
	prCommitUrlRegex,
	preventPrCommitLinkLoss,
	prCompareUrlRegex,
	preventPrCompareLinkLoss,
	discussionUrlRegex,
	preventDiscussionLinkLoss,
} from '../github-helpers/prevent-link-loss.js';
import createBanner from '../github-helpers/banner.js';

const documentation = 'https://github.com/refined-github/refined-github/wiki/GitHub-markdown-linkifier-bug';

function handleButtonClick({currentTarget: fixButton}: React.MouseEvent<HTMLButtonElement>): void {
	/* There's only one rich-text editor even when multiple fields are visible; the class targets it #4678 */
	const field = fixButton.form!.querySelector('textarea.js-comment-field')!;
	replaceFieldText(field, prCommitUrlRegex, preventPrCommitLinkLoss);
	replaceFieldText(field, prCompareUrlRegex, preventPrCompareLinkLoss);
	replaceFieldText(field, discussionUrlRegex, preventDiscussionLinkLoss);
	fixButton.parentElement!.remove();
}

function getUI(field: HTMLTextAreaElement, ...classes: string[]): HTMLElement {
	return $('.rgh-prevent-link-loss-container', field.form!) ?? (createBanner({
		icon: <AlertIcon className="m-0"/>,
		text: (
			<>
				{' Your link may be '}
				<a href={documentation} target="_blank" rel="noopener noreferrer" data-hovercard-type="issue">
					misinterpreted
				</a>
				{' by GitHub.'}
			</>
		),
		classes: ['flash-warn', 'rgh-prevent-link-loss-container', ...classes],
		action: handleButtonClick,
		buttonLabel: 'Fix link',
	}));
}

function isVulnerableToLinkLoss(value: string): boolean {
	// The replacement logic is not just in the regex, so it alone can't be used to detect the need for the replacement
	return value !== value.replace(prCommitUrlRegex, preventPrCommitLinkLoss)
		|| value !== value.replace(prCompareUrlRegex, preventPrCompareLinkLoss)
		|| value !== value.replace(discussionUrlRegex, preventDiscussionLinkLoss);
}

const updateUI = debounceFn(({delegateTarget: field}: DelegateEvent<Event, HTMLTextAreaElement>): void => {
	if (!isVulnerableToLinkLoss(field.value)) {
		getUI(field).remove();
	} else if (pageDetect.isNewIssue() || pageDetect.isNewRelease() || pageDetect.isCompare()) {
		$('file-attachment', field.form!)!.append(
			getUI(field, 'mt-2', 'mx-0', 'mx-md-2'),
		);
	} else {
		$('.form-actions', field.form!)!.before(
			getUI(field, 'mx-md-2', 'mb-2'),
		);
	}
}, {
	wait: 300,
});

function init(signal: AbortSignal): void {
	delegate([
		'form:is(#new_issue, #new_release) textarea',
		'form.js-new-comment-form textarea',
		'textarea.comment-form-textarea',
	].join(','), 'input', updateUI, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasRichTextEditor,
	],
	init,
});
