import React from 'dom-chef';
import select from 'select-dom';
import delegate, {DelegateEvent} from 'delegate-it';
import features from '../libs/features';
import * as icons from '../libs/icons';
import {groupSiblings} from '../libs/group-buttons';

function handleClick({delegateTarget: button}: DelegateEvent<MouseEvent, HTMLButtonElement>): void {
	const file = button.closest('.Box, .js-gist-file-update-container')!;
	const content = select.all('.blob-code-inner', file!)
		.map(({innerText: line}) => line === '\n' ? '' : line) // Must be `.innerText`
		.join('\n');

	button.setAttribute('value', content);
}

function renderButton(): void {
	for (const button of select.all('.file-actions .btn, [data-hotkey="b"]')) {
		button
			.parentElement! // `BtnGroup`
			.prepend(
				<clipboard-copy
					aria-label="Copy to clipboard"
					className="ClipboardButton btn btn-sm js-clipboard-copy rgh-copy-file"
					role="button">
					<span className="js-clipboard-clippy-icon">
						{icons.clippy()}
					</span>
					<span className="js-clipboard-check-icon d-none text-green">
						{icons.check()}
					</span>
				</clipboard-copy>
			);
		groupSiblings(button);
	}
}

function init(): void {
	if (select.exists('.blob.instapaper_body')) {
		delegate('.rgh-md-source', 'rgh:view-markdown-source', renderButton);
		delegate('.rgh-md-source', 'rgh:view-markdown-rendered', () => {
			const button = select('.rgh-copy-file');
			if (button) {
				button.remove();
			}
		});
	} else {
		renderButton();
	}

	delegate('.rgh-copy-file', 'click', handleClick, true);
}

features.add({
	id: __featureName__,
	description: 'Adds a button to copy a file’s content.',
	screenshot: 'https://cloud.githubusercontent.com/assets/170270/14453865/8abeaefe-00c1-11e6-8718-9406cee1dc0d.png',
	include: [
		features.isSingleFile,
		features.isGist
	],
	load: features.onAjaxedPages,
	init
});
