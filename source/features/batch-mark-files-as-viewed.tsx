import {onAbort} from 'abort-utils';
import delegate, {type DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';
import {
$, $$, $closest, elementExists,
} from 'select-dom';

import features from '../feature-manager.js';
import showToast from '../github-helpers/toast.js';
import clickAll from '../helpers/click-all.js';
import {is} from '../helpers/css-selectors.js';
import getItemsBetween from '../helpers/get-items-between.js';

export const viewedToggleSelector = [
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
const checkedSelector = is(
':has(.octicon-checkbox-fill)',
'[checked]',
);

let previousFile: HTMLElement | undefined;

function remember(event: DelegateEvent<MouseEvent, HTMLElement>): void {
previousFile = $closest(fileSelector, event.delegateTarget);
}

function isChecked(file: HTMLElement): boolean {
const viewedToggle = $(viewedToggleSelector, file);

return viewedToggle instanceof HTMLInputElement
? viewedToggle.checked
: elementExists('.octicon-checkbox-fill', viewedToggle);
}

function batchToggle(event: DelegateEvent<MouseEvent, HTMLElement>): void {
event.stopImmediatePropagation();

const files = $$(fileSelector);
const thisFile = $closest(fileSelector, event.delegateTarget);
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
const checkedState = isChecked(file) ? `:not(${checkedSelector})` : checkedSelector;
// The `hidden` attribute excludes filtered-out files
// https://github.com/refined-github/refined-github/issues/7819
return is(fileSelector) + ':not([hidden]) ' + is(viewedToggleSelector) + checkedState;
}

const markAsViewed = clickAll(markAsViewedSelector);

function onAltClick(event: DelegateEvent<MouseEvent, HTMLElement>): void {
const file = $closest(fileSelector, event.delegateTarget);
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
