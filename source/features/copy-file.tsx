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
	id: 'copy-file',
	description: 'Copy a file’s content',
	include: [
		features.isSingleFile,
		features.isGist
	],
	load: features.onAjaxedPages,
	init
});
