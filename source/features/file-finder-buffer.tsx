import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';

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
		const bufferField = getBufferField();
		fileFinderInput.value = bufferField.value;
		fileFinderInput.selectionStart = bufferField.selectionStart;
		fileFinderInput.selectionEnd = bufferField.selectionEnd;
		fileFinderInput.dispatchEvent(new Event('input')); // Trigger search
	}
}

function init(): void {
	window.addEventListener('pjax:start', pjaxStartHandler);
	window.addEventListener('pjax:complete', pjaxCompleteHandler);
}

features.add({
	id: __filebasename,
	description: 'Lets you start typing your search immediately after invoking the File Finder (`t`), instead of having you wait for it to load first.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/75542106-1c811700-5a5a-11ea-8aa5-bea0472c59e2.gif'
}, {
	include: [
		pageDetect.isRepo
	],
	waitForDomReady: false,
	repeatOnAjax: false,
	init
});
