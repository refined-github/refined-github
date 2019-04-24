import React from 'dom-chef';
import select from 'select-dom';
import copyToClipboard from 'copy-text-to-clipboard';
import features from '../libs/features';

function spaceLines (dom: NodeListOf<ChildNode>|HTMLElement){
	console.log(dom)
	return dom.innerText
}

function handleClickFactory(markdown?: Element) {
	return function handleClick({ currentTarget: button }: React.MouseEvent<HTMLButtonElement>): void {
		console.log(1, markdown)
		if (features.isMarkDown()) {
			const content = select.all('.blame-hunk', markdown)
				.map(line => select.all('.blob-code', line))
				.map(line=>{
					return line.map(spaceLines).map(line => line === '\n' ? '' : line).join("\n")
					// if (line.childNodes.length !== 1){
					// 	return Array.from(line.childNodes).map(spaceLines).join()
					// }
					// return spaceLines(line)
				})
				// .filter(blob => blob !== null && !blob === false)
				// .map(line => {
				// 	let a = line.innerText
				// 	// console.log(typeof a, a.length, a, 1, a == '\n')
				// 	return line!.innerText === '\n' ? "" : line})
				// .map(blob => blob!.innerText)
				// .map(blob=> blob+"\n")
				// .join("");
				.map(line => line === '\n' ? '' : line)
				.join('\n');
			console.log(2, content.substr(0, 900));
			console.log(copyToClipboard(content))
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
}

async function init(): Promise<void> {
	// This selector skips binaries + markdowns with code
	if (features.isMarkDown()) {
		document.addEventListener('rgh:view-markdown-source', function (e) {
			renderButton((e as CustomEvent).detail)
		});
	} else {
		renderButton()
	}
}

function renderButton(markdown?: Element) {
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
