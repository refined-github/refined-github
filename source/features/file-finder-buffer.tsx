import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import features from '../libs/features';

const getBufferField = onetime((): HTMLInputElement => (
	<input
		type="text"
		className="form-control tree-finder-input p-0 ml-1 border-0"
		style={{marginTop: '-0.19em'}}
	/> as unknown as HTMLInputElement
));

function pjaxStartHandler(event: CustomEvent): void {
	const destinationURL = event.detail?.url || '';
	if (destinationURL.split('/')[5] !== 'find') {
		return;
	}

	const bufferField = getBufferField();
	bufferField.value = '';

	const repoName = select('.pagehead h1 strong')!;
	repoName.classList.remove('mr-2');
	repoName.after(
		<span className="path-divider flex-self-stretch">/</span>,
		<span className="flex-self-stretch mr-2">{bufferField}</span>
	);
	bufferField.focus();
	select('.pagehead-actions')!.remove();
}

function pjaxCompleteHandler(): void {
	const fileFinderInput = select<HTMLInputElement>('#tree-finder-field');
	if (fileFinderInput) {
		fileFinderInput.value = getBufferField().value;
		fileFinderInput.dispatchEvent(new Event('input')); // Trigger search
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
