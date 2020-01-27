import './show-whitespace.css';
import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import onPrFileLoad from '../libs/on-pr-file-load';
import onNewComments from '../libs/on-new-comments';
import getTextNodes from '../libs/get-text-nodes';

// `splitText` is used before and after each whitespace group so a new whitespace-only text node is created. This new node is then wrapped in a <span>
function showWhiteSpacesOn(line: Element): void {
	const range = new Range();
	for (const textNode of getTextNodes(line)) {
		// `textContent` reads must be cached #2737
		let text = textNode.textContent!;

		// Loop goes in reverse otherwise `splitText`'s `index` parameter needs to keep track of the previous split
		for (let i = text.length - 1; i >= 0; i--) {
			const thisCharacter = text[i];

			// Exclude irrelevant characters
			if (thisCharacter !== ' ' && thisCharacter !== '\t') {
				continue;
			}

			range.setEnd(textNode, i + 1);

			// Find the same character so they can be wrapped together
			while (text[i - 1] === thisCharacter) {
				i--;
			}

			range.setStart(textNode, i);

			const whitespace = range.toString()
				.replace(/ /g, '·')
				.replace(/\t/g, '→');

			range.surroundContents(<span data-rgh-whitespace={whitespace}/>);

			// Update cached variable here because it just changed
			text = textNode.textContent!;
		}
	}
}

async function run(): Promise<void> {
	const lines = select.all([
		'table.js-file-line-container .blob-code-inner', // Single blob file, and gist
		'.file table.diff-table .blob-code-inner', // Split and unified diffs
		'.file table.d-table .blob-code-inner' // "Suggested changes" in PRs
	]);

	for (const line of lines) {
		line.classList.add('rgh-showing-whitespace');
		showWhiteSpacesOn(line);
	}
}

function init(): void {
	run();
	onNewComments(run);
	onPrFileLoad(run);
}

features.add({
	id: __featureName__,
	description: 'Shows whitespace characters.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/61187598-f9118380-a6a5-11e9-985a-990a7f798805.png',
	include: [
		features.hasCode
	],
	load: features.onAjaxedPages,
	init
});
