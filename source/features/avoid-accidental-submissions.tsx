import React from 'dom-chef';
import {elementExists} from 'select-dom';
import * as pageDetect from 'github-url-detection';
import delegate, {type DelegateEvent} from 'delegate-it';

import features from '../feature-manager.js';
import {modKey as moduleKey} from '../github-helpers/hotkey.js';

function onKeyDown(event: DelegateEvent<KeyboardEvent, HTMLInputElement>): void {
	const field = event.delegateTarget;
	const form = field.form!;
	if (
		event.key !== 'Enter'
		|| event.ctrlKey
		|| event.metaKey
		|| event.isComposing // #4323
		|| elementExists([
			'.suggester', // GitHub’s autocomplete dropdown
			'.rgh-avoid-accidental-submissions',
		], form)
	) {
		return;
	}

	if (elementExists('.btn-primary[type="submit"]:disabled', form)) {
		return;
	}

	const spacingClasses = pageDetect.isNewFile() || pageDetect.isEditingFile() ? 'my-1' : 'mt-2 mb-n1';

	const message = (
		<p className={'rgh-avoid-accidental-submissions ' + spacingClasses}>
			A submission via <kbd>enter</kbd> has been prevented. You can press <kbd>enter</kbd> again or use <kbd>{moduleKey}</kbd><kbd>enter</kbd>.
		</p>
	);
	if (pageDetect.isNewFile() || pageDetect.isEditingFile() || pageDetect.isPRConversation()) {
		field.after(message);
	} else {
		field.parentElement!.append(message);
	}

	event.preventDefault();
}

const inputElements = [
	'form.new_issue input#issue_title',
	'input#pull_request_title',
	'input#commit-summary-input',
	'#merge_title_field',
];

function init(signal: AbortSignal): void {
	delegate(inputElements, 'keydown', onKeyDown, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isNewIssue,
		pageDetect.isNewFile,
		pageDetect.isCompare,
		pageDetect.isEditingFile,
		pageDetect.isPRConversation,
	],
	init,
});

/*

Test URLs:

isNewIssue: https://github.com/refined-github/sandbox/issues/new
isNewFile: https://github.com/refined-github/sandbox/new/default-a
isCompare: https://github.com/refined-github/sandbox/compare/default-a...quick-pr-branch
isEditingFile: https://github.com/refined-github/sandbox/edit/default-a/README.md
isPRConversation: https://github.com/refined-github/sandbox/pull/4

*/
