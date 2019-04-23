import React from 'dom-chef';
import select from 'select-dom';
import copyToClipboard from 'copy-text-to-clipboard';
import features from '../libs/features';
import {fetchSource} from './view-markdown-source'
import fetchDom from '../libs/fetch-dom';

let a 
fetchSource().then(x=>{a=x})

 function handleClick({currentTarget: button}: React.MouseEvent<HTMLButtonElement>): void {
	const file = button.closest('.Box');
	// const a = //await fetchSource()
	console.log(1, select.all('.blame-hunk', a))
	let res
	const content = select.all('.blame-hunk', a)// select.all('.blame-hunk', file!)//select.all('.blob-code-inner', file!)
		.map(line => select('.blob-code', line))
		.map(blob => blob.innerText) // Must be `.innerText`
		// .map(line => line === '\n' ? '' : line)
		.join('\n');
	console.log(2, content)

	copyToClipboard(content);
}

// function handleClick({ currentTarget: button }: React.MouseEvent<HTMLButtonElement>): void {
// 	const file = button.closest('.Box');
// 	const a = await fetchSource()
// 	console.log(1, a.querySelectorAll('.blame-hunk'))
// 	let res
// 	const content = a.querySelectorAll('.blame-hunk')// select.all('.blame-hunk', file!)//select.all('.blob-code-inner', file!)
// 		.map(blob => blob.innerText) // Must be `.innerText`
// 		.map(line => line === '\n' ? '' : line)
// 		.join('\n');

// 	copyToClipboard(content);
// }


async function init(): Promise<any> {
	// const a = await fetchSource()
	const a = await fetchSource()
	console.log(1, select.all('.blame-hunk', a))
	// // This selector skips binaries + markdowns with code
	for (const code of select.all('[data-hotkey="b"]')) {
		// code.classList.add('rgh-copy-file');
		code
			// .closest('.Box')! // Closest common container
			// .querySelector('[data-hotkey="b"]')! // Easily-found `Blame` button
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
		features.isSingleFile,
		features.isGist
	],
	load: features.on
})
