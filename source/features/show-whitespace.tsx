import './show-whitespace.css';
import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';
import getTextNodes from '../libs/get-text-nodes';
import onPrFileLoad from '../libs/on-pr-file-load';
import onNewComments from '../libs/on-new-comments';

// `splitText` is used before and after each whitespace group so a new whitespace-only text node is created. This new node is then wrapped in a <span>
function showWhiteSpacesOn(line: Element): void {
	const shouldAvoidSurroundingSpaces = Boolean(line.closest('.blob-wrapper-embedded')); // #2285
	const textNodesOnThisLine = getTextNodes(line);
	for (const [nodeIndex, textNode] of textNodesOnThisLine.entries()) {
		// `textContent` reads must be cached #2737
		let text = textNode.textContent!;

		const startingCharacter = shouldAvoidSurroundingSpaces && nodeIndex === 0 ? 1 : 0;
		const skipLastCharacter = shouldAvoidSurroundingSpaces && nodeIndex === textNodesOnThisLine.length - 1;
		const endingCharacter = text.length - 1 - Number(skipLastCharacter);

		// Loop goes in reverse otherwise `splitText`'s `index` parameter needs to keep track of the previous split
		for (let i = endingCharacter; i >= startingCharacter; i--) {
			const thisCharacter = text[i];

			// Exclude irrelevant characters
			if (thisCharacter !== ' ' && thisCharacter !== '\t') {
				continue;
			}

			if (i < text.length - 1) {
				textNode.splitText(i + 1);
			}

			// Find the same character so they can be wrapped together, but stop at `startingCharacter`
			while (text[i - 1] === thisCharacter && !(i === startingCharacter)) {
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

const viewportObserver = new IntersectionObserver(changes => {
	for (const change of changes) {
		if (change.isIntersecting) {
			showWhiteSpacesOn(change.target);
			viewportObserver.unobserve(change.target);
		}
	}
});

async function init(): Promise<void> {
	for (const line of select.all('.blob-code-inner:not(.rgh-observing-whitespace)')) {
		line.classList.add('rgh-observing-whitespace');
		viewportObserver.observe(line);
	}
}

features.add({
	id: __filebasename,
	description: 'Shows whitespace characters.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/61187598-f9118380-a6a5-11e9-985a-990a7f798805.png'
}, {
	include: [
		pageDetect.hasCode
	],
	additionalListeners: [
		onNewComments,
		onPrFileLoad
	],
	init
});
