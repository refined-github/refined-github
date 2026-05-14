import debounceFn from 'debounce-fn';
import delegate, {type DelegateEvent} from 'delegate-it';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import memoize from 'memoize';
import AlertIcon from 'octicons-plain-react/Alert';
import {$, $closest} from 'select-dom';
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
import {getIdentifiers} from '../helpers/feature-helpers.js';

const feature = getIdentifiers(import.meta.url);
const fieldSelector = [
	'textarea.js-comment-field',
	'[class*="MarkdownInput-module__textArea"] textarea',
] as const;

// Where to append the banner
const bannerParent = [
	// Almost everywhere
	'fieldset',

	// Editing PR body
	'.CommentBox',
] as const;

const documentation
	= 'https://github.com/refined-github/refined-github/wiki/Extended-feature-descriptions#prevent-link-loss';

function handleButtonClick({currentTarget: fixButton}: React.MouseEvent<HTMLButtonElement>): void {
	const field = $(
		fieldSelector,
		$closest(bannerParent, fixButton),
	);

	replaceFieldText(field, prCommitUrlRegex, preventPrCommitLinkLoss);
	replaceFieldText(field, prCompareUrlRegex, preventPrCompareLinkLoss);
	replaceFieldText(field, discussionUrlRegex, preventDiscussionLinkLoss);
	$closest('.flash', fixButton).remove();
}

const getUi = memoize((_memoizeKeyOnly: HTMLElement): HTMLElement =>
	createBanner({
		icon: <AlertIcon className="m-0" />,
		text: <>
			{' Your link may be '}
			<a href={documentation} target="_blank" rel="noopener noreferrer" data-hovercard-type="issue">
				misinterpreted
			</a>
			{' by GitHub.'}
		</>,
		classes: [
			feature.class,
			'flash-warn',
			'my-2',
		],
		action: handleButtonClick,
		buttonLabel: 'Fix link',
	}), {
	cache: new WeakMap(),
});

function isVulnerableToLinkLoss(value: string): boolean {
	// The replacement logic is not just in the regex, so it alone can't be used to detect the need for the replacement
	return value !== value.replace(prCommitUrlRegex, preventPrCommitLinkLoss)
		|| value !== value.replace(prCompareUrlRegex, preventPrCompareLinkLoss)
		|| value !== value.replace(discussionUrlRegex, preventDiscussionLinkLoss);
}

function updateUi({delegateTarget: field}: DelegateEvent<Event, HTMLTextAreaElement>): void {
	if (isVulnerableToLinkLoss(field.value)) {
		$closest(bannerParent, field).append(getUi(field));
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

Test content:

```
https://github.com/refined-github/refined-github/pull/6954/commits/32d1c8b2e1b6971709fe273cfdd1f959b51e8d85
```

Test URLs:

New issue form: https://github.com/refined-github/refined-github/issues/new?assignees=&labels=bug&projects=&template=1_bug_report.yml
New comment form: https://github.com/refined-github/sandbox/issues/3
New review form: https://github.com/refined-github/sandbox/pull/4/files#review-changes-modal
New review comment form: https://github.com/refined-github/sandbox/pull/4/files

*/
