import './view-markdown-source.css';
import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import CodeIcon from 'octicon/code.svg';
import FileIcon from 'octicon/file.svg';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';
import fetchDom from '../libs/fetch-dom';

const buttonBodyMap = new WeakMap<Element, Element | Promise<Element>>();

async function fetchSource(): Promise<Element> {
	const path = location.pathname.replace(/((?:[^/]+\/){2})(blob)/, '$1blame');
	const dom = await fetchDom(path, '.blob-wrapper');
	dom!.classList.add('rgh-markdown-source');
	return dom!;
}

// Hide tooltip after click, it’s shown on :focus
function blurButton(button: HTMLElement): void {
	if (button === document.activeElement) {
		button.blur();
	}
}

function dispatchEvent(element: HTMLElement, type: keyof GlobalEventHandlersEventMap): void {
	element.dispatchEvent(new CustomEvent(type, {bubbles: true}));
}

/*
The dom of each version is stored on each button.
This acts as an auto-discarded cache without globals, timers, etc.
It should also work clicks on buttons sooner than the page loads.
*/
async function showSource(): Promise<void> {
	const sourceButton = select<HTMLButtonElement>('.rgh-md-source')!;
	const renderedButton = select<HTMLButtonElement>('.rgh-md-rendered')!;

	sourceButton.disabled = true;

	const source = buttonBodyMap.get(sourceButton) ?? fetchSource();
	const rendered = await buttonBodyMap.get(renderedButton) ?? select('.blob.js-code-block-container')!;

	buttonBodyMap.set(sourceButton, source);
	buttonBodyMap.set(renderedButton, rendered);

	rendered.replaceWith(await source);

	sourceButton.disabled = false;

	sourceButton.classList.add('selected');
	renderedButton.classList.remove('selected');
	blurButton(sourceButton);

	dispatchEvent(sourceButton, 'rgh:view-markdown-source');
}

async function showRendered(): Promise<void> {
	const sourceButton = select<HTMLButtonElement>('.rgh-md-source')!;
	const renderedButton = select<HTMLButtonElement>('.rgh-md-rendered')!;

	renderedButton.disabled = true;

	(await buttonBodyMap.get(sourceButton))!.replaceWith(await buttonBodyMap.get(renderedButton)!);

	renderedButton.disabled = false;

	sourceButton.classList.remove('selected');
	renderedButton.classList.add('selected');
	blurButton(renderedButton);

	dispatchEvent(sourceButton, 'rgh:view-markdown-rendered');
}

async function init(): Promise<false | void> {
	if (!select.exists('.blob .markdown-body')) {
		return false;
	}

	delegate(document, '.rgh-md-source:not(.selected)', 'click', showSource);
	delegate(document, '.rgh-md-rendered:not(.selected)', 'click', showRendered);

	select('.repository-content .Box-header .d-flex')!.prepend(
		<div className="BtnGroup">
			<button className="btn btn-sm BtnGroup-item tooltipped tooltipped tooltipped-n rgh-md-source" type="button" aria-label="Display the source blob">
				<CodeIcon/>
			</button>
			<button className="btn btn-sm BtnGroup-item tooltipped tooltipped-n rgh-md-rendered selected" type="button" aria-label="Display the rendered blob">
				<FileIcon/>
			</button>
		</div>
	);

	// Add support for permalinks to the code
	if (location.hash.startsWith('#L')) {
		await showSource();

		// Enable selected line highlight
		window.dispatchEvent(new HashChangeEvent('hashchange', {
			oldURL: location.href,
			newURL: location.href
		}));
	}
}

features.add({
	id: __filebasename,
	description: 'Adds a button to view the source of Markdown files.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/54814836-7bc39c80-4ccb-11e9-8996-9ecf4f6036cb.png'
}, {
	include: [
		pageDetect.isSingleFile
	],
	init
});
