import delegate, {DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import select from 'select-dom';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

const id = features.getFeatureID(import.meta.url);

const unplannedCheckbox = 'input[name="state_reason"][value="not_planned"]';

// TODO: Replace with https://github.com/fregante/select-dom/issues/20
// @ts-expect-error idc, temporary
const selectExpect: typeof select = (selector: string, context?: Element) => {
	const element = select(selector, context);
	if (element) {
		return element;
	}

	features.log.error(import.meta.url, `Expected element not found:\n${selector}`);
};

function update(dropdown: HTMLElement): void {
	const form = dropdown.closest('form')!;
	const radio = selectExpect(unplannedCheckbox, dropdown);
	const mainButton = selectExpect('[name="comment_and_close"]', form);
	const icon = selectExpect('.octicon-skip', dropdown);

	if (!mainButton || !radio || !icon) {
		return;
	}

	const checkbox = radio.cloneNode();
	checkbox.hidden = true;
	checkbox.type = 'checkbox';

	mainButton.classList.add('tooltipped', 'tooltipped-nw');
	mainButton.setAttribute('aria-label', 'Done, closed, fixed, resolved');

	const unplannedButton = mainButton.cloneNode();
	unplannedButton.append(icon);
	unplannedButton.id = id;
	unplannedButton.classList.add('btn', 'tooltipped', 'tooltipped-nw', 'mr-0');
	unplannedButton.setAttribute('aria-label', 'Close as not planned.\nWon’t fix, can’t repro, duplicate, stale');

	dropdown.replaceWith(unplannedButton);
	form.append(checkbox);
}

function updateCheckbox({delegateTarget: button}: DelegateEvent<MouseEvent, HTMLInputElement>): void {
	console.log(button.id, id, button.id === id);

	select(unplannedCheckbox, button.form!)!.checked = button.id === id;
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
