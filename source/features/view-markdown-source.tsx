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

const linkedDom = Symbol('Attached RGH dom');

async function fetchSource() {
	const path = location.pathname.replace(/([^/]+\/[^/]+\/)(blob)/, '$1blame');
	const dom = await fetchDom(location.origin + path, '.blob-wrapper');
	dom.classList.add('rgh-markdown-source');
	return dom;
}

/*
The dom of each version is stored on each button.
This acts as an auto-discarded cache without globals, timers, etc.
It should also work clicks on buttons sooner than the page loads.
*/
async function showSource() {
	const sourceButton = select('.rgh-md-source');
	const renderedButton = select('.rgh-md-rendered');

	document.dispatchEvent(new CustomEvent('pjax:start')); // Show loading bar

	const source = sourceButton[linkedDom] || fetchSource();
	const rendered = renderedButton[linkedDom] || select('.blob.instapaper_body');
	sourceButton[linkedDom] = source;
	renderedButton[linkedDom] = rendered;

	rendered.replaceWith(await source);

	document.dispatchEvent(new CustomEvent('pjax:end')); // Hide loading bar

	sourceButton.classList.add('selected');
	renderedButton.classList.remove('selected');
}

async function showRendered() {
	const sourceButton = select('.rgh-md-source');
	const renderedButton = select('.rgh-md-rendered');

	(await sourceButton[linkedDom]).replaceWith(renderedButton[linkedDom]);

	sourceButton.classList.remove('selected');
	renderedButton.classList.add('selected');
}

async function init(): Promise<false | void> {
	if (!select.exists('.blob.instapaper_body')) {
		return false;
	}

	delegate('.rgh-md-source:not(.selected)', 'click', showSource);
	delegate('.rgh-md-rendered:not(.selected)', 'click', showRendered);

	select('.repository-content .Box-header .d-flex').prepend(
		<div class="BtnGroup">
			<button class="btn btn-sm BtnGroup-item tooltipped tooltipped tooltipped-n rgh-md-source" type="button" aria-label="Display the source blob">
				{icons.code()}
			</button>
			<button class="btn btn-sm BtnGroup-item tooltipped tooltipped-n rgh-md-rendered selected" type="button" aria-label="Display the rendered blob">
				{icons.file()}
			</button>
		</div>
	);
}

features.add({
	id: 'view-markdown-source',
	include: [
		features.isSingleFile
	],
	load: features.onAjaxedPages,
	init
});
