/*
Add button to view the markdown source whereas GitHub only lets you see the rendered version.
https://user-images.githubusercontent.com/1402241/54814836-7bc39c80-4ccb-11e9-8996-9ecf4f6036cb.png
*/
import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import features from '../libs/features';
import fetchDom from '../libs/fetch-dom';
import * as icons from '../libs/icons';
import {blurAccessibly} from './comment-fields-keyboard-shortcuts';

const btnBodyMap = new WeakMap<Element, Element | Promise<Element>>();

async function fetchSource(): Promise<Element> {
	const path = location.pathname.replace(/([^/]+\/[^/]+\/)(blob)/, '$1blame');
	const dom = await fetchDom(location.origin + path, '.blob-wrapper');
	dom.classList.add('rgh-markdown-source');
	return dom;
}

// Hide tooltip after click, it’s shown on :focus
function blurButton(button: HTMLElement): void {
	if (button === document.activeElement) {
		blurAccessibly(button);
	}
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

	const source = btnBodyMap.get(sourceButton) || fetchSource();
	const rendered = btnBodyMap.get(renderedButton) as Element || select('.blob.instapaper_body')!;

	btnBodyMap.set(sourceButton, source);
	btnBodyMap.set(renderedButton, rendered);

	rendered.replaceWith(await source);

	sourceButton.disabled = false;

	sourceButton.classList.add('selected');
	renderedButton.classList.remove('selected');
	blurButton(sourceButton);
}

async function showRendered(): Promise<void> {
	const sourceButton = select<HTMLButtonElement>('.rgh-md-source')!;
	const renderedButton = select<HTMLButtonElement>('.rgh-md-rendered')!;

	renderedButton.disabled = true;

	(await btnBodyMap.get(sourceButton))!.replaceWith(btnBodyMap.get(renderedButton) as Element);

	renderedButton.disabled = false;

	sourceButton.classList.remove('selected');
	renderedButton.classList.add('selected');
	blurButton(renderedButton);
}

async function init(): Promise<false | void> {
	if (!select.exists('.blob.instapaper_body')) {
		return false;
	}

	delegate('.rgh-md-source:not(.selected)', 'click', showSource);
	delegate('.rgh-md-rendered:not(.selected)', 'click', showRendered);

	select('.repository-content .Box-header .d-flex')!.prepend(
		<div className="BtnGroup">
			<button className="btn btn-sm BtnGroup-item tooltipped tooltipped tooltipped-n rgh-md-source" type="button" aria-label="Display the source blob">
				{icons.code()}
			</button>
			<button className="btn btn-sm BtnGroup-item tooltipped tooltipped-n rgh-md-rendered selected" type="button" aria-label="Display the rendered blob">
				{icons.file()}
			</button>
		</div>
	);

	// Add support for permalinks to the code
	if (location.hash.startsWith('#L')) {
		showSource();
	}
}

features.add({
	id: 'view-markdown-source',
	include: [
		features.isSingleFile
	],
	load: features.onAjaxedPages,
	init
});
