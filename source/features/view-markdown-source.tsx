import './view-markdown-source.css';
import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import FileIcon from 'octicon/file.svg';
import CodeIcon from 'octicon/code.svg';
import KebabHorizontalIcon from 'octicon/kebab-horizontal.svg';

import features from '.';
import fetchDom from '../helpers/fetch-dom';
import GitHubURL from '../github-helpers/github-url';
import {getRepoURL} from '../github-helpers';

const lineActions = onetime(() => (
	<details
		className="details-reset details-overlay BlobToolbar position-absolute js-file-line-actions dropdown d-none"
		aria-hidden="true"
	>
		<summary
			className="btn-octicon ml-0 px-2 p-0 bg-white border border-gray-dark rounded-1"
			aria-label="Inline file action toolbar"
			aria-haspopup="menu"
			role="button"
		>
			<KebabHorizontalIcon/>
		</summary>
		<details-menu role="menu">
			<ul
				className="BlobToolbar-dropdown dropdown-menu dropdown-menu-se mt-2"
				style={{width: '185px'}}
			>
				<li>
					<clipboard-copy
						role="menuitem"
						className="dropdown-item zeroclipboard-link"
						id="js-copy-lines"
					>
						Copy line
					</clipboard-copy>
				</li>
				<li>
					<clipboard-copy
						role="menuitem"
						className="dropdown-item zeroclipboard-link"
						id="js-copy-permalink"
					>
						Copy permalink
					</clipboard-copy>
				</li>
				<li>
					<a
						className="dropdown-item js-update-url-with-hash"
						id="js-view-git-blame"
						role="menuitem"
						href={new GitHubURL(location.href).assign({route: 'blame'}).href}
					>
						View git blame
					</a>
				</li>
				<li>
					<a
						className="dropdown-item"
						id="js-new-issue"
						role="menuitem"
						href={`/${getRepoURL()}/issues/new`}
					>
						Reference in new issue
					</a>
				</li>
			</ul>
		</details-menu>
	</details>
));

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
	(await source).before(lineActions());

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
	lineActions().remove();

	dispatchEvent(sourceButton, 'rgh:view-markdown-rendered');
}

async function init(): Promise<void> {
	delegate(document, '.rgh-md-source:not(.selected)', 'click', showSource);
	delegate(document, '.rgh-md-rendered:not(.selected)', 'click', showRendered);

	const fileButtons =
		select('.repository-content .Box-header.flex-md-items-center .d-flex') ??
		// Pre "Repository refresh" layout
		select('.repository-content .Box-header .d-flex')!;
	fileButtons.prepend(
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

void features.add({
	id: __filebasename,
	description: 'Adds a button to view the source of Markdown files.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/54814836-7bc39c80-4ccb-11e9-8996-9ecf4f6036cb.png',
	testOn: ''
}, {
	include: [
		pageDetect.isSingleFile
	],
	exclude: [
		() => !select.exists('.blob .markdown-body')
	],
	init
});
