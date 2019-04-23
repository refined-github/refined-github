import React from 'dom-chef';
import select from 'select-dom';
import copyToClipboard from 'copy-text-to-clipboard';
import features from '../libs/features';
import {fetchSource} from './view-markdown-source';

// Copy to clipboard can't be async, and must be event driven
let markdown: Element;
let loaded = false;
let loading: Promise<any>;
const isMarkDown = features.isMarkDown();

async function loadFile(): Promise<void> {
	loaded = true;
	console.log('loading');
	loading = new Promise((resolve => {
		resolve(fetchSource());
	}));
	const markdown = await loading;
	console.log('the val', markdown);
}

function handleClick({currentTarget: button}: React.MouseEvent<HTMLButtonElement>): void {
	console.log(1, markdown)
	if (isMarkDown) {
		const content = select.all('.blame-hunk', markdown)
			.map(line => select('.blob-code', line))
			// .filter(blob => blob !== null && !blob === false)
			.map(blob => blob!.innerText)
			.join('\n');
		console.log(2, markdown, content);
		copyToClipboard(content);
	} else {
		console.log("not markdown")
		const file = button.closest('.Box');

		const content = select.all('.blob-code-inner', file!)
			.map(blob => blob.innerText) // Must be `.innerText`
			.map(line => line === '\n' ? '' : line)
			.join('\n');

		copyToClipboard(content);
	}
}

async function init(): Promise<void> {
	// This selector skips binaries + markdowns with code
	console.log(1000000000000);

	if (isMarkDown) {
		console.log(11111);
		if (loaded === false) {
			console.log(222222);

			await loadFile();
		}

		loaded = false;
		await loading; // Keeps button from appearing util there's something to copy
	}

	for (const code of select.all('[data-hotkey="b"]')) { // Blame button, avoiding binary files
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
		features.isMarkDown
	],
	load: features.onNavigation,
	init: loadFile
});

features.add({
	id: 'copy-file',
	include: [
		features.isSingleFile,
		features.isGist
	],
	load: features.onAjaxedPages,
	init
});

/// /////////////////////////////////////////////////////////////////////////////////////////////////

// import React from 'dom-chef';
// import select from 'select-dom';
// import copyToClipboard from 'copy-text-to-clipboard';
// import features from '../libs/features';

// function handleClick({ currentTarget: button }: React.MouseEvent<HTMLButtonElement>): void {
// 	const file = button.closest('.Box');

// 	const content = select.all('.blob-code-inner', file!)
// 		.map(blob => blob.innerText) // Must be `.innerText`
// 		.map(line => line === '\n' ? '' : line)
// 		.join('\n');

// 	copyToClipboard(content);
// }

// function init(): void {
// 	// This selector skips binaries + markdowns with code
// 	for (const code of select.all('.blob-wrapper > .highlight:not(.rgh-copy-file)')) {
// 		code.classList.add('rgh-copy-file');
// 		code
// 			.closest('.Box')! // Closest common container
// 			.querySelector('[data-hotkey="b"]')! // Easily-found `Blame` button
// 			.parentElement! // `BtnGroup`
// 			.prepend(
// 				<button
// 					onClick={handleClick}
// 					className="btn btn-sm copy-btn tooltipped tooltipped-n BtnGroup-item"
// 					aria-label="Copy file to clipboard"
// 					type="button">
// 					Copy
// 				</button>
// 			);
// 	}
// }

// features.add({
// 	id: 'copy-file',
// 	include: [
// 		features.isSingleFile,
// 		features.isGist
// 	],
// 	load: features.onAjaxedPages,
// 	init
// });
