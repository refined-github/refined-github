import features from '../libs/features';
import select from 'select-dom';
import {poll} from '../libs/utils';
import delegate, {DelegateEvent} from 'delegate-it';

const FILE_FINDER_INPUT_SELECTOR = '.js-tree-finder > .breadcrumb > #tree-finder-field';

let flag = false;
let fileFinderBuffer: string;
let fileFinderMemory: string;

// check if key pressed is valid search term character
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

// the current search term & buffer is fetched from local storage onto variable
const initializeValues = async (): Promise<void> => {
  const valuesFromStorage = (await browser.storage.local.get({fileFinderMemory: '', fileFinderBuffer: ''}));
  fileFinderMemory = valuesFromStorage.fileFinderMemory;
  fileFinderBuffer = valuesFromStorage.fileFinderBuffer;
};

const keyDownHandler = ({key, target}: KeyboardEvent): void => {
  if ((target as Element).nodeName !== 'INPUT') {
    if (flag) {
      const input = select<HTMLInputElement>(FILE_FINDER_INPUT_SELECTOR);
      if (!input && isValidCharacter(key)) {
        setBuffer(fileFinderBuffer.concat(key))
      }
    } else if (key === 't') {
      flag = true;
    }
  }
};

// the current search term is stored in local storage
const setText = async (value: string): Promise<void> => {
  fileFinderMemory = value;
  await browser.storage.local.set({fileFinderMemory});
};

// chars pressed after 't' is stored in local storage
const setBuffer = async (value: string): Promise<void> => {
  fileFinderBuffer = value;
  await browser.storage.local.set({fileFinderBuffer});
};

const inputHandler = async (event: DelegateEvent<InputEvent, HTMLInputElement>): Promise<void> => {
  const value: string = (event.delegateTarget as HTMLInputElement).value;
  await setText(value);
};

// set the input field value & trigger event
const setValueInField = (value: string): void => {
  const inputElement = select<HTMLInputElement>(FILE_FINDER_INPUT_SELECTOR);
  if ( inputElement ) {
    inputElement.value = value;
    inputElement.dispatchEvent(new Event('input'));  // manually trigger event to trigger search
  }
};

// function that will set the current value of input field to buffer or memory
const setValueFromBufferOrText = async (): Promise<void> => {
  if ( fileFinderBuffer.length > 0 ) {
    setValueInField(fileFinderBuffer)
    await setText(fileFinderBuffer);
    await setBuffer('');
  } else if ( fileFinderMemory ) {
    setValueInField(fileFinderMemory)
  }
};

// function that is used for polling until file finder input becomes ready
const pollFn = (): boolean | null => {
  const inputElement = select<HTMLInputElement>(FILE_FINDER_INPUT_SELECTOR);
  if ( inputElement ) {
    setValueFromBufferOrText();
    flag = false;
    return true;
  } else {
    return null;
  }
};

async function init(): Promise<void> {
  await initializeValues();
  if (features.isFileFinder()) {
    await setValueFromBufferOrText();
    delegate(FILE_FINDER_INPUT_SELECTOR, 'input', inputHandler);
  } else {  // wait for file finder page to be opened
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
    features.isRepo,
  ],
	load: features.onAjaxedPages,
	init,
	deinit
});