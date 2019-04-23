import React from 'dom-chef';
import select from 'select-dom';
import copyToClipboard from 'copy-text-to-clipboard';
import features from '../libs/features';
import {fetchSource} from './view-markdown-source'

//Copy to clipboard can't be async, and must be event driven
let a: Element
let loaded: boolean = false
let loading: Promise<any>
let isMarkDown = features.isMarkDown()

async function loadFile() {
	loaded = true
	loading = new Promise(async function (resolve, reject) {
		a = await fetchSource()
		resolve()
	})
}

function handleClick({ currentTarget: button }: React.MouseEvent<HTMLButtonElement>): void {
	if (isMarkDown){
		const content = select.all('.blame-hunk', a)
			.map(line => select('.blob-code', line))
			.map(blob => blob.innerText)
			.join('\n');
		console.log(2, content, features.isMarkDown())
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

async function init(): void {
	// This selector skips binaries + markdowns with code
	if (isMarkDown){
		if (loaded == false) {
			await loadFile()
		}
		loaded = false
		await loading //Keeps button from appearing util there's something to copy
	}

	for (const code of select.all('[data-hotkey="b"]')) { //Blame button, avoiding binary files
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

features.add({
	id: 'copy-file',
	include: [
		features.isMarkDown
	],
	load: features.onNavigation,
	init: loadFile
})
////////////////////////////////////////////////////////////////////////////////////////////////////

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
