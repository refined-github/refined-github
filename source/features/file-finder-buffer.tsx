import './file-finder-buffer.css';
import React from 'dom-chef';
import features from '../libs/features';
import select from 'select-dom';

const FILE_FINDER_INPUT_SELECTOR = '.js-tree-finder > .breadcrumb > #tree-finder-field';

const pjaxStartHandler = ((event: CustomEvent): void => {
	const destinationURL: string = event.detail?.url || '';
	if (destinationURL.includes('/find/')) {
		const hiddenInput = select<HTMLInputElement>('#rgh-file-finder-buffer') ?? document.body.insertBefore(
			<input
				type="text"
				className="visuallyhidden"
				id="rgh-file-finder-buffer"
			/>,
			document.body.firstChild
		);
		hiddenInput.focus();
	}
}) as EventListener; // Explicit type cast. See https://github.com/microsoft/TypeScript/issues/28357#issuecomment-436484705

const pjaxCompleteHandler = (): void => {
	const fileFinderInput = select<HTMLInputElement>(FILE_FINDER_INPUT_SELECTOR);
	const hiddenInput = select<HTMLInputElement>('#rgh-file-finder-buffer');
	if (hiddenInput && fileFinderInput) {
		fileFinderInput.value = hiddenInput.value;
		fileFinderInput.dispatchEvent(new Event('input')); // Manually trigger event to trigger search
		hiddenInput.value = '';
	}
};

function init(): void {
	window.addEventListener('pjax:start', pjaxStartHandler);
	window.addEventListener('pjax:complete', pjaxCompleteHandler);
}

function deinit(): void {
	window.removeEventListener('pjax:beforeSend', pjaxStartHandler);
	window.removeEventListener('pjax:complete', pjaxCompleteHandler);
}

features.add({
	id: __featureName__,
	description: 'Buffering for search term pressed after `t`',
	screenshot: false,
	include: [
		features.isRepo
	],
	load: features.onAjaxedPages,
	init,
	deinit
});
