import {$$, countElements} from 'select-dom';
import {$} from 'select-dom/strict.js';

function enableToggleAll(this: HTMLButtonElement): void {
	const section = $('details#toggle-all');
	section.hidden = false;
	section.open = true;
	this.hidden = true; // Hide button in "Debugging" section
}

function disableAllFeatures(): void {
	for (const enabledFeature of $$('.feature-checkbox:checked')) {
		enabledFeature.click();
	}

	$('details#features').open = true;
}

function enableAllFeatures(): void {
	for (const disabledFeature of $$('.feature-checkbox:not(:checked)')) {
		disabledFeature.click();
	}

	$('details#features').open = true;
}

export default function initToggleAllButtons(): void {
	const initialButton = $('#toggle-all-features');
	// Show "Toggle All" section if the user already disabled a lot of features
	if (countElements('.feature-checkbox:not(:checked)') > 50) {
		$('details#toggle-all').hidden = false;
		initialButton.hidden = true; // Hide button in "Debugging" section
	} else {
		initialButton.addEventListener('click', enableToggleAll);
	}

	$('#disable-all-features').addEventListener('click', disableAllFeatures);
	$('#enable-all-features').addEventListener('click', enableAllFeatures);
}
