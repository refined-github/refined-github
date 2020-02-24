import features from '../libs/features';
import select from 'select-dom';
import elementReady from 'element-ready';

const FILE_FINDER_INPUT_SELECTOR = '.js-tree-finder > .breadcrumb > #tree-finder-field';

const unloadHandler = (): void => {
	sessionStorage.setItem('rgh-file-finder-term', select<HTMLInputElement>(FILE_FINDER_INPUT_SELECTOR)!.value);
};

// Set the input field value & trigger event
const setValueInField = async (): Promise<void> => {
	const value: string = sessionStorage.getItem('rgh-file-finder-term') ?? '';
	const inputElement = select<HTMLInputElement>(FILE_FINDER_INPUT_SELECTOR);
	if (inputElement && !inputElement.value && value) {
		await elementReady('.js-tree-browser-results > li', {stopOnDomReady: false});	// For search to work
		inputElement.value = value;
		inputElement.dispatchEvent(new Event('input')); // Manually trigger event to trigger search
	}
};

async function init(): Promise<void> {
	await setValueInField();
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
