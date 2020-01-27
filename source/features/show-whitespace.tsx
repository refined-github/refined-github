import './show-whitespace.css';
import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import onPrFileLoad from '../libs/on-pr-file-load';
import onNewComments from '../libs/on-new-comments';
import getTextNodes from '../libs/get-text-nodes';

// `splitText` is used before and after each whitespace group so a new whitespace-only text node is created. This new node is then wrapped in a <span>
function showWhiteSpacesOn(line: Element): void {
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

			if (i < text.length - 1) {
				textNode.splitText(i + 1);
			}

			// Find the same character so they can be wrapped together
			while (text[i - 1] === thisCharacter) {
				i--;
			}

			textNode.splitText(i);

			// Update cached variable here because it just changed
			text = textNode.textContent!;

			const whitespace = textNode.nextSibling!.textContent!
				.replace(/ /g, '·')
				.replace(/\t/g, '→');

			textNode.after(
				<span data-rgh-whitespace={whitespace}>
					{textNode.nextSibling}
				</span>
			);
		}
	}
}

async function run(): Promise<void> {
	let timeKeeper = Date.now();
	for (const line of select.all('.blob-code-inner')) {
		line.classList.add('rgh-showing-whitespace');
		showWhiteSpacesOn(line);
		if (timeKeeper + 100 < Date.now()) {
			await new Promise(resolve => setTimeout(resolve, 50));
			timeKeeper = Date.now();
		}
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
