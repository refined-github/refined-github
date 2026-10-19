import {onAbort} from 'abort-utils';
import delegate, {type DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';
import {$, $$, closestElement} from 'select-dom';

import features from '../feature-manager.js';
import showToast from '../github-helpers/toast.js';
import clickAll from '../helpers/click-all.js';
import {is} from '../helpers/css-selectors.js';
import getItemsBetween from '../helpers/get-items-between.js';

export const viewedToggleSelector = [
	'button[aria-label="Viewed"]',
	'button[aria-label="Not Viewed"]',
	// Old view
	'input.js-reviewed-checkbox',
] as const;
const fileSelector = [
	'[class*="diffTargetable"]',
	// Old view
	'.js-file',
] as const;
const checkedSelector = is(
	// New view
	'[aria-pressed="true"]',
	// Old view
	'[checked]',
);

let previousFile: HTMLElement | undefined;

function remember(event: DelegateEvent<MouseEvent, HTMLElement>): void {
	previousFile = closestElement(fileSelector, event.delegateTarget);
}

function isChecked(file: HTMLElement): boolean {
	const viewedToggle = $(viewedToggleSelector, file);

	return viewedToggle instanceof HTMLInputElement
		? viewedToggle.checked
		: viewedToggle.matches('[aria-pressed="true"]');
}

function batchToggle(event: DelegateEvent<MouseEvent, HTMLElement>): void {
	event.stopImmediatePropagation();

	const files = $$(fileSelector);
	const thisFile = closestElement(fileSelector, event.delegateTarget);
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

function markAsViewedSelector(toggle: HTMLElement): string {
	const checkedState = isChecked(closestElement(fileSelector, toggle)) ? `:not(${checkedSelector})` : checkedSelector;
	// The `hidden` attribute excludes filtered-out files
	// https://github.com/refined-github/refined-github/issues/7819
	return is(fileSelector) + ':not([hidden]) ' + is(viewedToggleSelector) + checkedState;
}

const markAsViewed = clickAll(markAsViewedSelector);

function onAltClick(event: DelegateEvent<MouseEvent, HTMLElement>): void {
	const file = closestElement(fileSelector, event.delegateTarget);
	const newState = isChecked(file) ? 'viewed' : 'unviewed';

	void showToast(async () => {
		markAsViewed(event);
	}, {
		message: `Marking visible files as ${newState}`,
		doneMessage: `Files marked as ${newState}`,
	});
}

function handleClick(event: DelegateEvent<MouseEvent, HTMLElement>): void {
	if (!event.isTrusted) {
		return;
	}

	if (event.altKey) {
		onAltClick(event);
	} else if (event.shiftKey) {
		batchToggle(event);
	}

	remember(event);
}

function init(signal: AbortSignal): void {
	delegate(viewedToggleSelector, 'click', handleClick, {signal});
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
