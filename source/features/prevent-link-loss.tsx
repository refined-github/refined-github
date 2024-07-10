import React from 'dom-chef';
import {$} from 'select-dom';
import AlertIcon from 'octicons-plain-react/Alert';
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

const documentation = 'https://github.com/refined-github/refined-github/wiki/Extended-feature-descriptions#prevent-link-loss';

function handleButtonClick({currentTarget: fixButton}: React.MouseEvent<HTMLButtonElement>): void {
	/* There's only one rich-text editor even when multiple fields are visible; the class targets it #4678 */
	const field = fixButton.form!.querySelector('textarea.js-comment-field')!;
	replaceFieldText(field, prCommitUrlRegex, preventPrCommitLinkLoss);
	replaceFieldText(field, prCompareUrlRegex, preventPrCompareLinkLoss);
	replaceFieldText(field, discussionUrlRegex, preventDiscussionLinkLoss);
	fixButton.closest('.flash')!.remove();
}

function getUI(field: HTMLTextAreaElement): HTMLElement {
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
		classes: ['rgh-prevent-link-loss-container', 'flash-warn', 'my-2', 'mx-2'],
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

function updateUI({delegateTarget: field}: DelegateEvent<Event, HTMLTextAreaElement>): void {
	if (isVulnerableToLinkLoss(field.value)) {
		$('file-attachment .js-write-bucket', field.form!)!.append(getUI(field));
	} else {
		getUI(field).remove();
	}
}

const updateUIDebounced = debounceFn(updateUI, {
	wait: 300,
});

function init(signal: AbortSignal): void {
	delegate('textarea.js-comment-field', 'input', updateUIDebounced, {signal});
	delegate('textarea.js-comment-field', 'focusin', updateUI, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasRichTextEditor,
	],
	init,
});

/*

Test URLs:

Test link: `https://github.com/refined-github/refined-github/pull/6954/commits/32d1c8b2e1b6971709fe273cfdd1f959b51e8d85`

New issue form: https://github.com/refined-github/refined-github/issues/new?assignees=&labels=bug&projects=&template=1_bug_report.yml
New comment form: https://github.com/refined-github/sandbox/issues/3
New review form: https://github.com/refined-github/sandbox/pull/4/files#review-changes-modal
New review comment form: https://github.com/refined-github/sandbox/pull/4/files

*/
