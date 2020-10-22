import select from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';

function unloadHandler(): void {
	const inputElement = select<HTMLInputElement>('#tree-finder-field');
	if (inputElement) {
		history.replaceState({
			...history.state,
			rghFileFinderTerm: inputElement.value
		}, document.title);
	}
}

// Set the input field value & trigger event
async function setValueInField(): Promise<void> {
	const preservedValue = history.state?.rghFileFinderTerm;
	const inputElement = select<HTMLInputElement>('#tree-finder-field');
	if (inputElement && !inputElement.value && preservedValue) {
		await elementReady('.js-tree-browser-results > li', {stopOnDomReady: false});	// For search to work
		inputElement.value = preservedValue;
		inputElement.dispatchEvent(new Event('input')); // Trigger search
	}
}

async function init(): Promise<void> {
	await setValueInField();
	window.addEventListener('beforeunload', unloadHandler);
	window.addEventListener('pjax:start', unloadHandler);
}

function deinit(): void {
	window.removeEventListener('beforeunload', unloadHandler);
	window.removeEventListener('pjax:start', unloadHandler);
}

void features.add(__filebasename, {}, {
	include: [
		pageDetect.isFileFinder
	],
	init,
	deinit
});
