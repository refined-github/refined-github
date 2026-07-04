import {$, $$, countElements} from 'select-dom';

function enableToggleAll(this: HTMLButtonElement): void {
	const section = $('details#toggle-all');
	section.hidden = false;
	section.open = true;
	this.hidden = true; // Hide button in "Debugging" section
}

function setAllFeatures(checked: boolean): void {
	for (const checkbox of $$<HTMLInputElement>('.feature-checkbox')) {
		if (checkbox.checked === checked) {
			continue;
		}

		checkbox.checked = checked;
		checkbox.dispatchEvent(new Event('change', {bubbles: true}));
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

	$('#disable-all-features').addEventListener('click', () => {
		setAllFeatures(false);
	});
	$('#enable-all-features').addEventListener('click', () => {
		setAllFeatures(true);
	});
}
