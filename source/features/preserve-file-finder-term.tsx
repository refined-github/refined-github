import features from '../libs/features';
import select from 'select-dom';
import {poll} from '../libs/utils';
import delegate, {DelegateEvent, DelegateSubscription} from 'delegate-it';

let delegated: DelegateSubscription | null = null;
const FILE_FINDER_INPUT_SELECTOR = '.js-tree-finder > .breadcrumb > #tree-finder-field';

const persistText = (value: string): void => {
	sessionStorage.setItem('rgh-file-finder-term', value);
};

const inputHandler = (event: DelegateEvent<InputEvent, HTMLInputElement>): void => {
	const value: string = (event.delegateTarget).value;
	persistText(value);
};

// Set the input field value & trigger event
const setValueInField = async (): Promise<void> => {
	const value: string = sessionStorage.getItem('rgh-file-finder-term') ?? '';
	const inputElement = select<HTMLInputElement>(FILE_FINDER_INPUT_SELECTOR);
	if (inputElement) {
		if (inputElement.value) {		// Handle case where text is present in buffer
			persistText(inputElement.value);
		} else if (value) {
			await poll(() => select('.js-tree-browser-results > li'), 100);	// For search to work
			inputElement.value = value;
			inputElement.dispatchEvent(new Event('input')); // Manually trigger event to trigger search
		}
	}
};

async function init(): Promise<void> {
	await setValueInField();
	delegated = delegate(FILE_FINDER_INPUT_SELECTOR, 'input', inputHandler);
}

function deinit(): void {
	if (delegated) {
		delegated.destroy();
		delegated = null;
	}
}

features.add({
	id: __featureName__,
	description: 'Preserve search term in file finder',
	screenshot: false,
	include: [
		features.isFileFinder
	],
	load: features.onAjaxedPages,
	init,
	deinit
});
