import React from 'dom-chef';
import features from '../libs/features';
import select from 'select-dom';

const pjaxStartHandler = ((event: CustomEvent): void => {
	const destinationURL: string = event.detail?.url || '';
	if (destinationURL.split('/')[5] === 'find') {
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
}) as EventListener; // Explicit type cast. See https://github.com/microsoft/TypeScript/issues/28357#issuecomment-436484705

const pjaxCompleteHandler = (): void => {
	const fileFinderInput = select<HTMLInputElement>('.js-tree-finder > .breadcrumb > #tree-finder-field');
	const hiddenInput = select<HTMLInputElement>('#rgh-file-finder-buffer');
	if (hiddenInput && fileFinderInput) {
		fileFinderInput.value = hiddenInput.value;
		fileFinderInput.dispatchEvent(new Event('input')); // Manually trigger event to trigger search
		document.body.removeChild(hiddenInput);
	}
};

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
