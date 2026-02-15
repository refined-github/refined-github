import {$$, elementExists} from 'select-dom';
import {$} from 'select-dom/strict.js';
import {onAbort} from 'abort-utils';
import * as pageDetect from 'github-url-detection';
import delegate, {type DelegateEvent} from 'delegate-it';

import features from '../feature-manager.js';
import clickAll from '../helpers/click-all.js';
import showToast from '../github-helpers/toast.js';
import getItemsBetween from '../helpers/get-items-between.js';

const viewedToggleSelector = [
	'button[class*="MarkAsViewedButton"]',
	// Old view
	'input.js-reviewed-checkbox',
] as const;
const fileSelector = [
	'[class^="Diff-module__diffTargetable"]',
	// Old view
	'.js-file',
] as const;
// New view, Old view
const checkedSelector = ':is(:has(.octicon-checkbox-fill), [checked])';

let previousFile: HTMLElement | undefined;

function remember(event: DelegateEvent): void {
	if (event.isTrusted) {
		previousFile = event.delegateTarget.closest(fileSelector)!;
	}
}

function isChecked(file: HTMLElement): boolean {
	const viewedToggle = $(viewedToggleSelector, file);

	return viewedToggle instanceof HTMLInputElement
		? viewedToggle.checked
		: elementExists('.octicon-checkbox-fill', viewedToggle);
}

function batchToggle(event: DelegateEvent<MouseEvent, HTMLFormElement>): void {
	if (!event.shiftKey) {
		return;
	}

	event.stopImmediatePropagation();

	const files = $$(fileSelector);
	const thisFile = event.delegateTarget.closest(fileSelector)!;
	const isThisBeingFileChecked = isChecked(thisFile);

	const selectedFiles = getItemsBetween(files, previousFile, thisFile);
	for (const file of selectedFiles) {
		if (
			file !== thisFile
			// `checkVisibility` excludes filtered-out files
			// https://github.com/refined-github/refined-github/issues/7819
			&& file.checkVisibility()
			&& isChecked(file) !== isThisBeingFileChecked
		) {
			$(viewedToggleSelector, file).click();
		}
	}
}

function markAsViewedSelector(file: HTMLElement): string {
	// The `hidden` attribute excludes filtered-out files
	// https://github.com/refined-github/refined-github/issues/7819
	return `:is(${fileSelector.join(',')}):not([hidden]) `
		+ `:is(${viewedToggleSelector.join(',')})`
		+ (isChecked(file) ? `:not(${checkedSelector})` : checkedSelector);
}

const markAsViewed = clickAll(markAsViewedSelector);

const onAltClick = (event: DelegateEvent<MouseEvent, HTMLInputElement>): void => {
	if (!event.altKey || !event.isTrusted) {
		return;
	}

	const file = event.delegateTarget.closest(fileSelector)!;
	const newState = isChecked(file) ? 'viewed' : 'unviewed';

	void showToast(async () => {
		markAsViewed(event);
	}, {
		message: `Marking visible files as ${newState}`,
		doneMessage: `Files marked as ${newState}`,
	});
};

function init(signal: AbortSignal): void {
	delegate(viewedToggleSelector, 'click', onAltClick, {signal});
	delegate(viewedToggleSelector, 'click', batchToggle, {signal});
	delegate(viewedToggleSelector, 'click', remember, {signal});
	onAbort(signal, () => {
		previousFile = undefined;
	});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRFiles,
	],
	exclude: [
		pageDetect.isPRFile404,
		pageDetect.isPRCommit,
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/sandbox/pull/55/files

Use this style to avoid layout shift while testing:

```css
table {display: none !important;}
```

*/
