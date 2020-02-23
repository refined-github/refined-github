import features from '../libs/features';
import select from 'select-dom';
import {poll} from '../libs/utils';
import delegate, {DelegateEvent} from 'delegate-it';

const FILE_FINDER_INPUT_SELECTOR = '.js-tree-finder > .breadcrumb > #tree-finder-field';

let fileFinderMemory: string;

// The current search term & buffer is fetched from local storage onto variable
const initializeValues = async (): Promise<void> => {
	const valuesFromStorage = (await browser.storage.local.get({fileFinderMemory: '', fileFinderBuffer: ''}));
	fileFinderMemory = valuesFromStorage.fileFinderMemory;
};

// The current search term is stored in local storage
const setText = async (value: string): Promise<void> => {
	fileFinderMemory = value;
	await browser.storage.local.set({fileFinderMemory});
};

const inputHandler = async (event: DelegateEvent<InputEvent, HTMLInputElement>): Promise<void> => {
	const value: string = (event.delegateTarget).value;
	await setText(value);
};

// Set the input field value & trigger event
const setValueInField = (value: string): void => {
	const inputElement = select<HTMLInputElement>(FILE_FINDER_INPUT_SELECTOR);
	if (inputElement) {
		inputElement.value = value;
		inputElement.dispatchEvent(new Event('input')); // Manually trigger event to trigger search
	}
};

// Function that will set the current value of input field to buffer or memory
const setValueFromBufferOrText = async (): Promise<void> => {
	setValueInField(fileFinderMemory);
};

// Function that is used for polling until file finder input becomes ready
function pollFn(): boolean | null {
	const inputElement = select<HTMLInputElement>(FILE_FINDER_INPUT_SELECTOR);
	if (inputElement) {
		setValueFromBufferOrText();
		return true;
	}

	return null;
}

async function init(): Promise<void> {
	await initializeValues();
	if (features.isFileFinder()) {
		await setValueFromBufferOrText();
		delegate(FILE_FINDER_INPUT_SELECTOR, 'input', inputHandler);
	} else { // Wait for file finder page to be opened
		poll(pollFn, 300);
	}
}

features.add({
	id: __featureName__,
	description: 'Preserve search term in file finder',
	screenshot: false,
	include: [
		features.isRepo
	],
	load: features.onAjaxedPages,
	init
});
