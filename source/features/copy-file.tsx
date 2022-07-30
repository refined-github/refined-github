import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';
import delegate, {DelegateEvent} from 'delegate-it';

import features from '.';
import {groupButtons} from '../github-helpers/group-buttons';

function handleClick({delegateTarget: button}: DelegateEvent<MouseEvent, HTMLButtonElement>): void {
	const file = button.closest('.js-gist-file-update-container')!;
	const content = select.all('.blob-code-inner', file)
		// eslint-disable-next-line unicorn/prefer-dom-node-text-content -- Must be `.innerText`
		.map(({innerText: line}) => line === '\n' ? '' : line)
		.join('\n');
	button.setAttribute('value', content);
}

function renderButton(): void {
	for (const button of select.all('.file-actions .btn[href*="/raw/"]')) {
		const copyButton = (
			<clipboard-copy
				className="btn btn-sm js-clipboard-copy tooltipped tooltipped-n BtnGroup-item rgh-copy-file"
				aria-label="Copy file to clipboard"
				data-tooltip-direction="n"
				role="button"
				data-copy-feedback="Copied!"
			>
				Copy
			</clipboard-copy>
		);
		const group = button.closest('.BtnGroup');
		if (group) {
			group.prepend(copyButton);
		} else {
			groupButtons([button, copyButton]);
		}
	}
}

function init(signal: AbortSignal): void {
	renderButton();
	delegate(document, '.rgh-copy-file:not([value])', 'click', handleClick, {capture: true, signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		() => select.exists('table.highlight'), // Rendered page
	],
	include: [
		pageDetect.isGist,
	],
	deduplicate: '.rgh-copy-file', // #3945
	init,
});
