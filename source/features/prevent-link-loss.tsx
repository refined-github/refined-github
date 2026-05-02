import debounceFn from 'debounce-fn';
import delegate, {type DelegateEvent} from 'delegate-it';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import AlertIcon from 'octicons-plain-react/Alert';
import {$, $closest, $optional} from 'select-dom';
import {replaceFieldText} from 'text-field-edit';

import features from '../feature-manager.js';
import createBanner from '../github-helpers/banner.js';
import {
	discussionUrlRegex,
	prCommitUrlRegex,
	prCompareUrlRegex,
	preventDiscussionLinkLoss,
	preventPrCommitLinkLoss,
	preventPrCompareLinkLoss,
} from '../github-helpers/prevent-link-loss.js';

const fieldSelector = [
	'textarea.js-comment-field',
	'textarea[aria-labelledby="comment-composer-heading"]', // React view
] as const;

const documentation
	= 'https://github.com/refined-github/refined-github/wiki/Extended-feature-descriptions#prevent-link-loss';

function handleButtonClick({currentTarget: fixButton}: React.MouseEvent<HTMLButtonElement>): void {
	const field = $(
		fieldSelector,
		$closest([
			'form',
			'[data-testid="markdown-editor-comment-composer"]',
		], fixButton),
	);

	replaceFieldText(field, prCommitUrlRegex, preventPrCommitLinkLoss);
	replaceFieldText(field, prCompareUrlRegex, preventPrCompareLinkLoss);
	replaceFieldText(field, discussionUrlRegex, preventDiscussionLinkLoss);
	$closest('.flash', fixButton).remove();
}

function getUi(container: HTMLElement): HTMLElement {
	return $optional('.rgh-prevent-link-loss-container', container) ?? (createBanner({
		icon: <AlertIcon className="m-0" />,
		text: <>
			{' Your link may be '}
			<a href={documentation} target="_blank" rel="noopener noreferrer" data-hovercard-type="issue">
				misinterpreted
			</a>
			{' by GitHub.'}
		</>,
		classes: [
			'rgh-prevent-link-loss-container',
			'flash-warn',
			'my-2',
			container.tagName === 'FORM' ? 'mx-2' : '',
		],
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

function updateUi({delegateTarget: field}: DelegateEvent<Event, HTMLTextAreaElement>): void {
	if (isVulnerableToLinkLoss(field.value)) {
		if (field.form) {
			$('file-attachment .js-write-bucket', field.form).append(getUi(field.form));
		} else {
			// React view
			const container = $closest('[data-testid="markdown-editor-comment-composer"]', field);
			container.append(getUi(container));
		}
	} else {
		getUi(field).remove();
	}
}

const updateUiDebounced = debounceFn(updateUi, {
	wait: 300,
});

function init(signal: AbortSignal): void {
	delegate(fieldSelector, 'input', updateUiDebounced, {signal});
	delegate(fieldSelector, 'focusin', updateUi, {signal});
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
