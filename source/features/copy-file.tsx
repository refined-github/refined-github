import React from 'dom-chef';
import select from 'select-dom';
import copyToClipboard from 'copy-text-to-clipboard';
import delegate from 'delegate-it';
import features from '../libs/features';

function handleClick({currentTarget: button}: React.MouseEvent<HTMLButtonElement>): void {
	const file = button.closest('.Box');
	const content = select.all('.blob-code-inner', file!)
		.map(blob => blob.innerText) // Must be `.innerText`
		.map(line => line === '\n' ? '' : line)
		.join('\n');
	copyToClipboard(content);
}

async function init(): Promise<void> {
	// This won't show button on markdown and binary files until the code is loaded
	if (select.exists('.blob.instapaper_body')) {
		delegate('.rgh-md-source', 'rgh:view-markdown-source', () => {
			// Prevents several buttons
			if (select.exists('.rgh-copy-file')) {
				return;
			}

			renderButton();
		});
		// Removes button if non-raw content is displayed
		delegate('.rgh-md-source', 'rgh:view-markdown-rendered', () => {
			const button = select('.rgh-copy-file');
			if (button) {
				button.remove()
			}
		});
	} else {
		renderButton();
	}
}

function renderButton(): void {
	for (const blameButton of select.all('[data-hotkey="b"]')) {
		blameButton
			.parentElement! // `BtnGroup`
			.prepend(
				<button
					onClick={handleClick}
					className="btn btn-sm rgh-copy-file tooltipped tooltipped-n BtnGroup-item"
					aria-label="Copy file to clipboard"
					type="button">
					Copy
				</button>
			);
	}
}

features.add({
	id: 'copy-file',
	include: [
		features.isSingleFile,
		features.isGist
	],
	load: features.onAjaxedPages,
	init
});
