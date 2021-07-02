import './view-markdown-source.css';
import React from 'dom-chef';
import domify from 'doma';
import select from 'select-dom';
import onetime from 'onetime';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';
import {CodeIcon, FileIcon} from '@primer/octicons-react';

import features from '.';
import fetchDom from '../helpers/fetch-dom';
import GitHubURL from '../github-helpers/github-url';
import {buildRepoURL} from '../github-helpers';

const lineActions = onetime(async () => {
	// Avoid having to create the entire 60 lines of JSX. The URL is hardcoded to a file we know the DOM exists.
	const randomKnownFile = 'https://github.com/sindresorhus/refined-github/blob/b1229bbaeb8cf071f0711bc2ed1b40dd96cd7a05/.editorconfig';

	// Fetch background.js due to CORB policies
	const html = await browser.runtime.sendMessage({fetch: randomKnownFile});
	const blobToolbar = domify(html).querySelector('.BlobToolbar')!;
	select('a#js-view-git-blame', blobToolbar)!.href = new GitHubURL(location.href).assign({route: 'blame'}).href;
	select('a#js-new-issue', blobToolbar)!.href = buildRepoURL('issues/new');
	return blobToolbar;
});

const buttonBodyMap = new WeakMap<Element, Element | Promise<Element>>();

async function fetchSource(): Promise<Element> {
	const path = location.pathname + '?plain=1';
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
	const currentURL = new URL(window.location.href);
	currentURL.searchParams.append('plain', '1');

	const newURL = currentURL.toString();

	window.history.pushState({path: newURL}, '', newURL);

	const sourceButton = select('button.rgh-md-source')!;
	const renderedButton = select('button.rgh-md-rendered')!;

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

	(await source).before(await lineActions());
}

async function showRendered(): Promise<void> {
	const currentURL = new URL(window.location.href);
	currentURL.searchParams.delete('plain');

	const newURL = currentURL.toString();

	window.history.pushState({path: newURL}, '', newURL);

	const sourceButton = select('button.rgh-md-source')!;
	const renderedButton = select('button.rgh-md-rendered')!;

	renderedButton.disabled = true;

	(await buttonBodyMap.get(sourceButton))!.replaceWith(await buttonBodyMap.get(renderedButton)!);

	renderedButton.disabled = false;

	sourceButton.classList.remove('selected');
	renderedButton.classList.add('selected');
	blurButton(renderedButton);
	dispatchEvent(sourceButton, 'rgh:view-markdown-rendered');

	(await lineActions()).remove();
}

async function init(): Promise<void> {
	delegate(document, '.rgh-md-source:not(.selected)', 'click', showSource);
	delegate(document, '.rgh-md-rendered:not(.selected)', 'click', showRendered);

	select('#raw-url')!.closest('.d-flex')!.prepend(
		<div className="BtnGroup">
			<button className="btn btn-sm BtnGroup-item tooltipped tooltipped tooltipped-nw rgh-md-source" type="button" aria-label="Display the source blob">
				<CodeIcon/>
			</button>
			<button className="btn btn-sm BtnGroup-item tooltipped tooltipped-nw rgh-md-rendered selected" type="button" aria-label="Display the rendered blob">
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

void features.add(__filebasename, {
	include: [
		pageDetect.isSingleFile
	],
	exclude: [
		() => !select.exists('.blob .markdown-body')
	],
	deduplicate: '.rgh-md-source', // #3945
	init
});
