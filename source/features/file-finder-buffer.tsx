/** @jsx h */
import {h} from 'preact';
import select from 'select-dom';
import onetime from 'onetime';
import * as pageDetect from 'github-url-detection';

import render from '../helpers/render';

import features from '.';
import isSafari from '../helpers/browser-detection';

const getBufferField = onetime((): HTMLInputElement => {
	const input = document.createElement('input');

	input.type="text"
	input.className="p-0 border-0"
	input.style.backgroundColor = 'transparent',
	input.style.outline = 'none',
	input.style.color = 'var(--color-text-primary)'
	input.placeholder="Search file…"
	return input;
});

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
		render(<span className="mx-1 flex-self-stretch">/</span>),
		render(<span className="flex-self-stretch mr-2">{bufferField}</span>)
	);
	bufferField.focus();
	for (const element of select.all('.pagehead-actions, .rgh-ci-link, .octotree-bookmark-btn')) {
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
		pageDetect.isRepo
	],
	exclude: [
		isSafari
	],
	awaitDomReady: false,
	init: onetime(init)
});
