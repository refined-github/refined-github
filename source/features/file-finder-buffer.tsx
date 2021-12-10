import './file-finder-buffer.css';
import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import * as pageDetect from 'github-url-detection';

import features from '.';
import isSafari from '../helpers/browser-detection';

const getBufferField = onetime((): HTMLInputElement => (
	<input
		type="text"
		className="p-0 border-0"
		style={{
			backgroundColor: 'transparent',
			outline: 0,
			color: 'var(--color-fg-default, var(--color-text-primary))',
		}}
		placeholder="Search file…"
	/> as unknown as HTMLInputElement
));

function pjaxStartHandler(event: CustomEvent): void {
	const destinationURL = event.detail?.url;
	if (!destinationURL || !pageDetect.isFileFinder(new URL(destinationURL))) {
		return;
	}

	const bufferField = getBufferField();
	bufferField.value = '';

	select('.pagehead h1 strong, [itemprop="name"]')!.after(
		<span className="mr-1 ml-n1 flex-self-stretch color-text-secondary color-fg-muted">/</span>,
		<span className="flex-self-stretch mr-2">{bufferField}</span>,
	);
	bufferField.focus();

	// Hide the header elements instead of removing them so they can be restored #4999
	document.body.classList.add('rgh-file-finder-buffer');
}

function pjaxCompleteHandler(): void {
	const bufferField = getBufferField();
	const fileFinderInput = select('input#tree-finder-field');
	if (fileFinderInput) {
		fileFinderInput.value = bufferField.value;
		fileFinderInput.selectionStart = bufferField.selectionStart;
		fileFinderInput.selectionEnd = bufferField.selectionEnd;
		fileFinderInput.dispatchEvent(new Event('input')); // Trigger search
	}

	// Make sure to clean up the repo header #4999
	if (document.body.classList.contains('rgh-file-finder-buffer')) {
		bufferField.parentElement!.previousElementSibling!.remove();
		bufferField.parentElement!.remove();
		document.body.classList.remove('rgh-file-finder-buffer');
	}
}

function init(): void {
	window.addEventListener('pjax:start', pjaxStartHandler);
	window.addEventListener('pjax:complete', pjaxCompleteHandler);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepo,
	],
	exclude: [
		isSafari,
	],
	awaitDomReady: false,
	init: onetime(init),
});
