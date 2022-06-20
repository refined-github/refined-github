import React from 'dom-chef';

import getTextNodes from './get-text-nodes';

// `splitText` is used before and after each whitespace group so a new whitespace-only text node is created. This new node is then wrapped in a <span>
export default function showWhiteSpacesOnLine(line: Element, shouldAvoidSurroundingSpaces = false): Element {
	const textNodesOnThisLine = getTextNodes(line);
	for (const [nodeIndex, textNode] of textNodesOnThisLine.entries()) {
		// `textContent` reads must be cached #2737
		let text = textNode.textContent!;
		if (text.length > 1000) { // #5092
			continue;
		}

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

			textNode.after(
				<span data-rgh-whitespace={thisCharacter === '\t' ? 'tab' : 'space'}>
					{textNode.nextSibling}
				</span>,
			);
		}
	}

	return line;
}
