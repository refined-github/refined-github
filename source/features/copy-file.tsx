import React from 'dom-chef';
import select from 'select-dom';
import copyToClipboard from 'copy-text-to-clipboard';
import delegate from 'delegate-it';
import features from '../libs/features';

function handleClick({currentTarget: button}: React.MouseEvent<HTMLButtonElement>): void {
	const isMarkdown = features.isMarkDown();
	const file = button.closest('.Box');
	const content = select.all(isMarkdown ? '.blame-hunk' : '.blob-code-inner', file!);
	let parsed: string | string[];
	if (isMarkdown) {
		parsed = content
			.map(line => select.all('.blob-code', line))
			.map(line => {
				return line.map(x => x.innerText).map(line => line === '\n' ? '' : line).join('\n');
			});
	} else {
		parsed = content
			.map(blob => blob.innerText); // Must be `.innerText`
	}

	parsed = parsed
		.map(line => line === '\n' ? '' : line)
		.join('\n');
	copyToClipboard(parsed);
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
	for (const code of select.all('[data-hotkey="b"]')) { // Blame button
		code
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
