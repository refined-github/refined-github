import delegate, {type DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';
import {$, $closest} from 'select-dom';

import features from '../feature-manager.js';
import {getFeatureId} from '../helpers/feature-helpers.js';
import observe from '../helpers/selector-observer.js';
import addToolTip from '../helpers/tooltip.js';

const id = getFeatureId(import.meta.url);

const unplannedCheckbox = 'input[name="state_reason"][value="not_planned"]';

function update(dropdown: HTMLElement): void {
	const form = $closest('form', dropdown);
	const radio = $(unplannedCheckbox, dropdown);
	const mainButton = $('[name="comment_and_close"]', form);
	const icon = $('.octicon-skip', dropdown);

	const checkbox = radio.cloneNode();
	checkbox.hidden = true;
	checkbox.type = 'checkbox';

	addToolTip({label: 'Done, closed, fixed, resolved', direction: 'nw'}, mainButton);

	const unplannedButton = mainButton.cloneNode();
	unplannedButton.append(icon);
	unplannedButton.id = id;
	unplannedButton.classList.add('btn', 'mr-0');
	// Prevent content from being changed #7024
	unplannedButton.classList.remove('js-comment-and-button');

	dropdown.replaceWith(unplannedButton);
	addToolTip({
		label: 'Close as not planned.\nWon’t fix, can’t repro, duplicate, stale',
		direction: 'nw',
	}, unplannedButton);
	form.append(checkbox);
}

function updateCheckbox({delegateTarget: button}: DelegateEvent<MouseEvent, HTMLInputElement>): void {
	$(unplannedCheckbox, button.form!).checked = button.id === id;
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
