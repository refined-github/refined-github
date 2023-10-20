import {$, $$} from 'select-dom';
import * as pageDetect from 'github-url-detection';
import debounceFn from 'debounce-fn';
import delegate, {DelegateEvent} from 'delegate-it';

import features from '../feature-manager.js';
import clickAll from '../helpers/click-all.js';
import showToast from '../github-helpers/toast.js';
import getItemsBetween from '../helpers/get-items-between.js';
import onAbort from '../helpers/abort-controller.js';

let previousFile: HTMLElement | undefined;
let runningBatch = false;

function remember(event: DelegateEvent): void {
	// Only remember if the user clicked it. `isTrusted` doesn't work because `remember` is called on a fake `submit` event
	if (!runningBatch) {
		previousFile = event.delegateTarget.closest('.js-file')!;
	}
}

function isChecked(file: HTMLElement): boolean {
	return file.querySelector('input.js-reviewed-checkbox')!.checked;
}

// A single click is somehow causing two separate trusted `click` events, so it needs to be debounced
const batchToggle = debounceFn((event: DelegateEvent<MouseEvent, HTMLFormElement>): void => {
	if (!event.shiftKey) {
		return;
	}

	event.stopImmediatePropagation();

	const files = $$('.js-file');
	const thisFile = event.delegateTarget.closest('.js-file')!;
	const isThisBeingFileChecked = !isChecked(thisFile); // Flip it because the value hasn't changed yet

	runningBatch = true;
	const selectedFiles = getItemsBetween(files, previousFile, thisFile);
	for (const file of selectedFiles) {
		if (file !== thisFile && isChecked(file) !== isThisBeingFileChecked) {
			$('.js-reviewed-checkbox', file)!.click();
		}
	}

	runningBatch = false;
}, {
	before: true,
	after: false,
});

function markAsViewedSelector(target: HTMLElement): string {
	const checked = isChecked(target) ? ':not([checked])' : '[checked]';
	return '.js-reviewed-checkbox' + checked;
}

const markAsViewed = clickAll(markAsViewedSelector);

// A single click is somehow causing two separate trusted `click` events, so it needs to be debounced
const onAltClick = debounceFn((event: DelegateEvent<MouseEvent, HTMLInputElement>): void => {
	if (!event.altKey || !event.isTrusted) {
		return;
	}

	const newState = isChecked(event.delegateTarget) ? 'unviewed' : 'viewed';
	void showToast(async () => {
		markAsViewed(event);
	}, {
		message: `Marking visible files as ${newState}`,
		doneMessage: `Files marked as ${newState}`,
	});
}, {
	before: true,
	after: false,
});

function avoidSelectionOnShiftClick(event: MouseEvent): void {
	if (event.shiftKey) {
		event.preventDefault();
	}
}

function init(signal: AbortSignal): void {
	delegate('.js-reviewed-toggle', 'click', onAltClick, {signal});
	delegate('.js-reviewed-toggle', 'click', batchToggle, {signal});
	delegate('.js-reviewed-toggle', 'mousedown', avoidSelectionOnShiftClick, {signal});
	delegate('.js-toggle-user-reviewed-file-form', 'submit', remember, {signal});
	onAbort(signal, () => {
		previousFile = undefined;
	});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRFiles,
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
