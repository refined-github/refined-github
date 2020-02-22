import features from '../libs/features';
import select from 'select-dom';
import {poll} from '../libs/utils';
import delegate, {DelegateEvent} from 'delegate-it';

const FILE_FINDER_INPUT_SELECTOR = '.js-tree-finder > .breadcrumb > #tree-finder-field';

let flag = false;
let fileFinderBuffer: string;
let fileFinderMemory: string;

// Check if key pressed is valid search term character
const isValidCharacter = (char: string): boolean => (
	char >= 'a' &&
  char <= 'z'
) || (
	char >= 'A' &&
  char <= 'Z'
) || (
	char >= '0' &&
  char <= '9'
);

// The current search term & buffer is fetched from local storage onto variable
const initializeValues = async (): Promise<void> => {
	const valuesFromStorage = (await browser.storage.local.get({fileFinderMemory: '', fileFinderBuffer: ''}));
	fileFinderMemory = valuesFromStorage.fileFinderMemory;
	fileFinderBuffer = valuesFromStorage.fileFinderBuffer;
};

const keyDownHandler = ({key, target}: KeyboardEvent): void => {
	const nodeName = (target as Element).nodeName;
	if (nodeName !== 'INPUT' && nodeName !== 'TEXTAREA') {
		if (flag) {
			const input = select<HTMLInputElement>(FILE_FINDER_INPUT_SELECTOR);
			if (!input && isValidCharacter(key)) {
				setBuffer(fileFinderBuffer.concat(key));
			}
		} else if (key === 't') {
			flag = true;
		}
	}
};

// The current search term is stored in local storage
const setText = async (value: string): Promise<void> => {
	fileFinderMemory = value;
	await browser.storage.local.set({fileFinderMemory});
};

// Chars pressed after 't' is stored in local storage
const setBuffer = async (value: string): Promise<void> => {
	fileFinderBuffer = value;
	await browser.storage.local.set({fileFinderBuffer});
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
	if (fileFinderBuffer.length > 0) {
		setValueInField(fileFinderBuffer);
		await setText(fileFinderBuffer);
		await setBuffer('');
	} else if (fileFinderMemory) {
		setValueInField(fileFinderMemory);
	}
};

// Function that is used for polling until file finder input becomes ready
function pollFn(): boolean | null {
	const inputElement = select<HTMLInputElement>(FILE_FINDER_INPUT_SELECTOR);
	if (inputElement) {
		setValueFromBufferOrText();
		flag = false;
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

	window.addEventListener('keydown', keyDownHandler);
}

function deinit(): void {
	window.removeEventListener('keydown', keyDownHandler);
}

features.add({
	id: __featureName__,
	description: 'Preserve search term in file finder',
	screenshot: false,
	include: [
		features.isRepo
	],
	load: features.onAjaxedPages,
	init,
	deinit
});
