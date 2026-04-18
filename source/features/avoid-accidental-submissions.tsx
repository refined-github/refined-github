import delegate, { type DelegateEvent } from 'delegate-it';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import { elementExists } from 'select-dom';

import features from '../feature-manager.js';
import { modKey as moduleKey } from '../github-helpers/hotkey.js';

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

	if (
		elementExists([
			'button[data-hotkey="Mod+Enter"]:disabled',
			'button[type="submit"]:disabled',
		], form)
	) {
		return;
	}

	const isLegacyInput = field.matches(legacyInputElements);

	const spacingClasses = pageDetect.isNewFile() || pageDetect.isEditingFile()
		? isLegacyInput ? 'my-1' : 'mb-3 mt-n2'
		: 'mt-2 mb-n1';

	const message = (
		<p className={'rgh-avoid-accidental-submissions ' + spacingClasses}>
			A submission via <kbd>enter</kbd> has been prevented. You can press <kbd>enter</kbd> again or use{' '}
			<kbd>{moduleKey}</kbd>
			<kbd>enter</kbd>.
		</p>
	);

	if (isLegacyInput) {
		if (pageDetect.isNewFile() || pageDetect.isEditingFile()) {
			field.after(message);
		} else {
			field.parentElement!.append(message);
		}
	} else {
		field.parentElement!.after(message);
	}

	event.preventDefault();
}

const legacyInputElements = [
	'input#pull_request_title', // Old `isCompare` - TODO: Remove after August 2026
	'input#commit-summary-input', // Old `isEditingFile`, `isNewFile` - TODO: Remove after July 2026
];

const inputElements = [
	'input[name="pull_request[title]"]', // `isCompare`
	'#commit-message-input', // `isEditingFile`, `isNewFile`
];

function init(signal: AbortSignal): void {
	delegate([...inputElements, ...legacyInputElements], 'keydown', onKeyDown, { signal, capture: true });
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isNewFile,
		pageDetect.isCompare,
		pageDetect.isEditingFile,
	],
	init,
});

/*

Test URLs:

isNewFile: https://github.com/refined-github/sandbox/new/default-a
isCompare: https://github.com/refined-github/sandbox/compare/default-a...quick-pr-branch?expand=1
isEditingFile: https://github.com/refined-github/sandbox/edit/default-a/README.md

*/
