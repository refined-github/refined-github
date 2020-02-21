import features from '../libs/features';
import select from 'select-dom';
import {poll} from '../libs/utils';
import delegate, {DelegateEvent} from 'delegate-it';

const FILE_FINDER_INPUT_SELECTOR = '.js-tree-finder > .breadcrumb > #tree-finder-field';

let flag = false;
let buffer: string = '';
let fileFinderText: string;

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

// the current search term is fetched from local storage onto variable
const initializeValues = async (): Promise<void> => {
  const textFromStorage: string = (await browser.storage.local.get({fileFinderText: ''})).fileFinderText;
  fileFinderText = textFromStorage;
};

const keyDownHandler = ({key, target}: KeyboardEvent): void => {
  if ((target as Element).nodeName !== 'INPUT') {
    if (flag) {
      const input = select<HTMLInputElement>(FILE_FINDER_INPUT_SELECTOR);
      if (!input && isValidCharacter(key)) {
        buffer = buffer.concat(key);
      }
    } else if (key === 't') {
      flag = true;
    }
  }
};

// the current search term is stored in local storage
const setValueInStorage = async (value: string): Promise<void> => {
  fileFinderText = value;
  await browser.storage.local.set({fileFinderText});
};

const inputHandler = async (event: DelegateEvent<InputEvent, HTMLInputElement>): Promise<void> => {
  const value: string = (event.delegateTarget as HTMLInputElement).value;
  await setValueInStorage(value);
};

// function that is used for polling until file finder input becomes ready
const pollFn = (): boolean | null => {
  const inputElement = select<HTMLInputElement>(FILE_FINDER_INPUT_SELECTOR);
  if ( inputElement ) {
    if ( buffer.length > 0 ) {
      inputElement.value = buffer;
      inputElement.dispatchEvent(new Event('input'));  // manually trigger event for search to happen
      setValueInStorage(buffer);
    } else if ( fileFinderText ) {
      inputElement.value = fileFinderText;
      inputElement.dispatchEvent(new Event('input'));
    }
    flag = false;
    buffer = '';
    return true;
  } else {
    return null;
  }
};

async function init(): Promise<void> {
  await initializeValues();
  if (features.isFileFinder()) {
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