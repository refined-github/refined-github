import React from 'dom-chef';
import select from 'select-dom';
import copyToClipboard from 'copy-text-to-clipboard';
import features from '../libs/features';

function handleClickFactory(markdown?: Element): ({ currentTarget: button }: React.MouseEvent<HTMLButtonElement>)=> void {
	return function handleClick ({currentTarget: button}: React.MouseEvent<HTMLButtonElement>): void {
		if (features.isMarkDown()) {
			const content = select.all('.blame-hunk', markdown)
				.map(line => select.all('.blob-code', line))
				.map(line => {
					return line.map(x => x.innerText).map(line => line === '\n' ? '' : line).join('\n');
				})
				.map(line => line === '\n' ? '' : line)
				.join('\n');
			copyToClipboard(content);
		} else {
			console.log('not markdown');
			const file = button.closest('.Box');

			const content = select.all('.blob-code-inner', file!)
				.map(blob => blob.innerText) // Must be `.innerText`
				.map(line => line === '\n' ? '' : line)
				.join('\n');

			copyToClipboard(content);
		}
	};
}

async function init(): Promise<void> {
	// This won't show button on markdown and binary files until the code is loaded
	if (features.isMarkDown() || select.all(".blob-wrapper > .highlight").length) {
		document.addEventListener('rgh:view-markdown-source', e => {
			renderButton((e as CustomEvent).detail);
		});
	} else {
		renderButton();
	}
}

function renderButton(markdown?: Element): void {
	for (const code of select.all('[data-hotkey="b"]')) { // Blame button, avoiding binary files
		code
			.parentElement! // `BtnGroup`
			.prepend(
				<button
					onClick={handleClickFactory(markdown)}
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
