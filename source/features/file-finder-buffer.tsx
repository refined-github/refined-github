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
			color: 'var(--color-text-primary)',
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

	const repoName = select('.pagehead h1 strong, [itemprop="name"]')!;
	repoName.classList.remove('mr-2');
	repoName.after(
		<span className="mx-1 flex-self-stretch color-text-secondary color-fg-muted">/</span>,
		<span className="flex-self-stretch mr-2">{bufferField}</span>,
	);
	bufferField.focus();
	for (const element of select.all('.pagehead-actions, .rgh-ci-link details, .octotree-bookmark-btn')) {
		element.remove();
	}
}

function pjaxCompleteHandler(): void {
	const fileFinderInput = select('input#tree-finder-field');
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

void features.add(__filebasename, {
	include: [
		pageDetect.isRepo,
	],
	exclude: [
		isSafari,
	],
	awaitDomReady: false,
	init: onetime(init),
});
