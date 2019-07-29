import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import copyToClipboard from 'copy-text-to-clipboard';
import features from '../libs/features';

function handleClick({currentTarget: button}: React.MouseEvent<HTMLButtonElement>): void {
	const file = button.closest('.Box');
	const content = select.all('.blob-code-inner', file!)
		.map(({innerText: line}) => line === '\n' ? '' : line) // Must be `.innerText`
		.join('\n');
	copyToClipboard(content);
}

function renderButton(): void {
	for (const blameButton of select.all('[data-hotkey="b"]')) {
		blameButton
			.parentElement! // `BtnGroup`
			.prepend(
				<button
					onClick={handleClick}
					className="btn btn-sm tooltipped tooltipped-n BtnGroup-item rgh-copy-file"
					aria-label="Copy file to clipboard"
					type="button">
					Copy
				</button>
			);
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
