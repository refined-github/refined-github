import select from 'select-dom';
import elementReady from 'element-ready';
import features from '../libs/features';

function unloadHandler(): void {
	const inputElement = select<HTMLInputElement>('#tree-finder-field');
	if (inputElement) {
		sessionStorage.setItem('rgh-file-finder-term', inputElement.value);
	}
}

// Set the input field value & trigger event
async function setValueInField(): Promise<void> {
	const preservedValue = sessionStorage.getItem('rgh-file-finder-term');
	const inputElement = select<HTMLInputElement>('#tree-finder-field');
	if (inputElement && !inputElement.value && preservedValue) {
		await elementReady('.js-tree-browser-results > li', {stopOnDomReady: false});	// For search to work
		inputElement.value = preservedValue;
		inputElement.dispatchEvent(new Event('input')); // Trigger search
	}
}

function init(): void {
	setValueInField();
	window.addEventListener('beforeunload', unloadHandler);
	window.addEventListener('pjax:start', unloadHandler);
}

function deinit(): void {
	window.removeEventListener('beforeunload', unloadHandler);
	window.removeEventListener('pjax:start', unloadHandler);
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
