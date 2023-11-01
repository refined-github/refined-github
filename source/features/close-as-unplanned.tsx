import delegate, {DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import {$, expectElement} from 'select-dom';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

const id = features.getFeatureID(import.meta.url);

const unplannedCheckbox = 'input[name="state_reason"][value="not_planned"]';

function update(dropdown: HTMLElement): void {
	const form = dropdown.closest('form')!;
	const radio = expectElement(unplannedCheckbox, dropdown);
	const mainButton = expectElement('[name="comment_and_close"]', form);
	const icon = expectElement('.octicon-skip', dropdown);

	const checkbox = radio.cloneNode();
	checkbox.hidden = true;
	checkbox.type = 'checkbox';

	mainButton.classList.add('tooltipped', 'tooltipped-nw');
	mainButton.setAttribute('aria-label', 'Done, closed, fixed, resolved');

	const unplannedButton = mainButton.cloneNode();
	unplannedButton.append(icon);
	unplannedButton.id = id;
	unplannedButton.classList.add('btn', 'tooltipped', 'tooltipped-nw', 'mr-0');
	// Prevent content from being changed #7024
	unplannedButton.classList.remove('js-comment-and-button');
	unplannedButton.setAttribute('aria-label', 'Close as not planned.\nWon’t fix, can’t repro, duplicate, stale');

	dropdown.replaceWith(unplannedButton);
	form.append(checkbox);
}

function updateCheckbox({delegateTarget: button}: DelegateEvent<MouseEvent, HTMLInputElement>): void {
	$(unplannedCheckbox, button.form!)!.checked = button.id === id;
}

function init(signal: AbortSignal): void {
	observe('close-reason-selector .select-menu', update, {signal});
	delegate('[name="comment_and_close"]', 'click', updateCheckbox, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isIssue,
	],
	init,
});

/*

Test URLs: (any issue you can close)

https://github.com/refined-github/sandbox/issues/73

*/
