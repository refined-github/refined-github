import React from 'dom-chef';
import select from 'select-dom';
import copyToClipboard from 'copy-text-to-clipboard';
import features from '../libs/features';

function handleClick({target: button}) {
	const file = button.closest('.Box');

	const content = select.all('.blob-code-inner', file)
		.map(blob => blob.innerText)
		.map(line => line === '\n' ? '' : line)
		.join('\n');

	copyToClipboard(content);
}

function init() {
	// This selector skips binaries + markdowns with code
	for (const code of select.all('.blob-wrapper > .highlight:not(.rgh-copy-file)')) {
		code.classList.add('rgh-copy-file');
		code
			.closest('.Box') // Closest common container
			.querySelector('[data-hotkey="b"]') // Easily-found `Blame` button
			.parentElement // `BtnGroup`
			.prepend(
				<button onClick={handleClick} class="btn btn-sm copy-btn tooltipped tooltipped-n BtnGroup-item" aria-label="Copy file to clipboard" type="button">Copy</button>
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
