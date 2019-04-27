import React from 'dom-chef';
import select from 'select-dom';
import copyToClipboard from 'copy-text-to-clipboard';
import delegate from 'delegate-it';
import features from '../libs/features';

function handleClick({currentTarget: button}: React.MouseEvent<HTMLButtonElement>): void {
	if (features.isMarkDown()) {
		const file = button.closest('.Box');
		const content = select.all('.blame-hunk', file!)
			.map(line => select.all('.blob-code', line))
			.map(line => {
				return line.map(x => x.innerText).map(line => line === '\n' ? '' : line).join('\n');
			})
			.map(line => line === '\n' ? '' : line)
			.join('\n');
		copyToClipboard(content);
	} else {
		const file = button.closest('.Box');
		const content = select.all('.blob-code-inner', file!)
			.map(blob => blob.innerText) // Must be `.innerText`
			.map(line => line === '\n' ? '' : line)
			.join('\n');
		copyToClipboard(content);
	}
}

async function init(): Promise<void> {
	// This won't show button on markdown and binary files until the code is loaded
	if (features.isMarkDown() || select.all('.blob-wrapper > .highlight').length === 0) {
		delegate('.rgh-md-source', 'rgh:view-markdown-source', () => {
			renderButton();
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
					className="btn btn-sm copy-btn tooltipped tooltipped-n BtnGroup-item"
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
