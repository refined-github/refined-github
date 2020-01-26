import './show-whitespace.css';
import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import onPrFileLoad from '../libs/on-pr-file-load';
import onNewComments from '../libs/on-new-comments';
import getTextNodes from '../libs/get-text-nodes';

function showWhiteSpacesOn(line: Element): void {
	for (const textNode of getTextNodes(line)) {
		let text = textNode.textContent!;
		for (let i = text.length - 1; i >= 0; i--) {
			const thisCharacter = text[i];
			if (thisCharacter !== ' ' && thisCharacter !== '\t') {
				continue;
			}

			let l = i;
			while (text[l - 1] === text[i]) {
				l--;
			}

			if (i < text.length - 2) {
				textNode.splitText(i + 1);
			}

			textNode.splitText(l);
			text = textNode.textContent!; // Update cached variable here because it just changed

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
