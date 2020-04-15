import select from 'select-dom';
import delegate from 'delegate-it';
import features from '../libs/features';

let previousFile: HTMLElement | undefined;

function remember(event: delegate.Event<Event, HTMLFormElement>): void {
	console.log('isTrusted', event.delegateTarget);
	previousFile = event.delegateTarget.closest<HTMLElement>('.js-file')!;
}

function isChecked(file: HTMLElement): boolean {
	// Use the attribute because the `checked` property seems unreliable in the `click` handler
	return file.querySelector('.js-reviewed-checkbox')!.hasAttribute('checked');
}

function batchToggle(event: delegate.Event<MouseEvent, HTMLFormElement>): void {
	if (!event.shiftKey || !previousFile) {
		return;
	}

	event.preventDefault();
	event.stopImmediatePropagation();

	const previousFileState = isChecked(previousFile);
	const thisFile = event.delegateTarget.closest<HTMLElement>('.js-file')!;
	const files = select.all('.js-file');
	const selectedFiles = files.slice(
		files.indexOf(previousFile) + 1,
		files.indexOf(thisFile) + 1
	);

	for (const file of selectedFiles) {
		if (isChecked(file) !== previousFileState) {
			select('.js-reviewed-checkbox', file)!.click();
		}
	}
}

function init(): void {
	// `mousedown` required to avoid mouse selection on shift-click
	delegate(document, '.js-toggle-user-reviewed-file-form', 'mousedown', batchToggle);
	delegate(document, '.js-toggle-user-reviewed-file-form', 'submit', remember);
}

function deinit(): void {
	previousFile = undefined;
}

features.add({
	id: __featureName__
}, {
	waitForDomReady: false,
	include: [
		features.isPRFiles
	],
	init,
	deinit
});
