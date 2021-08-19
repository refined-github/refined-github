import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {groupButtons} from '../github-helpers/group-buttons';

function handleClick({delegateTarget: button}: delegate.Event<MouseEvent, HTMLButtonElement>): void {
	const file = button.closest('.Box, .js-gist-file-update-container')!;
	const content = select.all('.blob-code-inner', file)
		.map(({innerText: line}) => line === '\n' ? '' : line) // Must be `.innerText`
		.join('\n');
	button.setAttribute('value', content);
}

function renderButton(): void {
	for (const button of select.all([
		'.file-actions .btn[href*="/raw/"]', // `isGist`
		'[data-hotkey="b"]',
	])) {
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

function init(): void {
	delegate(document, '.rgh-copy-file:not([value])', 'click', handleClick, true);
	renderButton();
}

void features.add(__filebasename, {
	include: [
		pageDetect.isSingleFile,
		pageDetect.isGist,
	],
	exclude: [
		() => !select.exists('table.highlight'), // Rendered page
	],
	deduplicate: '.rgh-copy-file', // #3945
	init,
});
