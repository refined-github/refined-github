import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';

function pjaxStartHandler(event: CustomEvent): void {
	const destinationURL = event.detail?.url || '';
	if (destinationURL.split('/')[5] !== 'find') {
		return;
	}

	const hiddenInput = (
		<input
			type="text"
			className="sr-only"
			id="rgh-file-finder-buffer"
		/>
	);
	document.body.prepend(hiddenInput);
	hiddenInput.focus();
}

function pjaxCompleteHandler(): void {
	const fileFinderInput = select<HTMLInputElement>('#tree-finder-field');
	const hiddenInput = select<HTMLInputElement>('#rgh-file-finder-buffer');
	if (hiddenInput && fileFinderInput) {
		fileFinderInput.value = hiddenInput.value;
		fileFinderInput.dispatchEvent(new Event('input')); // Manually trigger event to trigger search
		hiddenInput.remove();
	}
}

function init(): void {
	window.addEventListener('pjax:start', pjaxStartHandler);
	window.addEventListener('pjax:complete', pjaxCompleteHandler);
}

features.add({
	id: __featureName__,
	description: 'Buffering for search term pressed after `t`',
	screenshot: false,
	include: [
		features.isRepo
	],
	init
});
