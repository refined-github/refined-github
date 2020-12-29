import React from 'dom-chef';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';
import copyToClipboard from 'copy-text-to-clipboard';

import features from '.';
import {groupButtons} from '../github-helpers/group-buttons';

function handleClick({delegateTarget: button}: delegate.Event<MouseEvent, HTMLButtonElement>): void {
	const file = button.closest('.Box, .js-gist-file-update-container')!;
	const content = $$('.blob-code-inner', file)
		.map(({innerText: line}) => line === '\n' ? '' : line) // Must be `.innerText`
		.join('\n');
	copyToClipboard(content);

	button.textContent = 'Copied!';
	button.classList.remove('tooltipped');
	setTimeout(() => {
		button.textContent = 'Copy';
		button.classList.add('tooltipped');
	}, 2000);
}

function renderButton(): void {
	for (const button of $$([
		'.file-actions .btn[href*="/raw/"]', // `isGist`
		'[data-hotkey="b"]'
	])) {
		const copyButton = (
			<button
				className="btn btn-sm tooltipped tooltipped-n BtnGroup-item rgh-copy-file"
				aria-label="Copy file to clipboard"
				type="button"
			>
				Copy
			</button>
		);
		const group = button.closest('.BtnGroup');
		if (group) {
			group.prepend(copyButton);
		} else {
			groupButtons([button, copyButton]);
		}
	}
}

function removeButton(): void {
	$('.rgh-copy-file')?.remove();
}

function init(): void {
	delegate(document, '.rgh-copy-file', 'click', handleClick);

	if ($.exists('.blob > .markdown-body')) {
		delegate(document, '.rgh-md-source', 'rgh:view-markdown-source', renderButton);
		delegate(document, '.rgh-md-source', 'rgh:view-markdown-rendered', removeButton);
	} else {
		renderButton();
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isSingleFile,
		pageDetect.isGist
	],
	init
});
