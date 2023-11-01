import React from 'dom-chef';

import getTextNodes from './get-text-nodes.js';

// `splitText` is used before and after each whitespace group so a new whitespace-only text node is created. This new node is then wrapped in a <span>
export default function showWhiteSpacesOnLine(line: Element, shouldAvoidSurroundingSpaces = false): Element {
	const textNodesOnThisLine = getTextNodes(line);
	for (const [nodeIndex, textNode] of textNodesOnThisLine.entries()) {
		// `textContent` reads must be cached #2737
		let text = textNode.textContent;
		if (text.length > 1000) { // #5092
			continue;
		}

		// This refers to the boundary text nodes, not actual whitespace nodes. Text nodes are generated by the syntax highlighter, so non-highlighted text will have one text node.
		const isLeading = nodeIndex === 0;
		const isTrailing = nodeIndex === textNodesOnThisLine.length - 1;

		const startingCharacterIndex = shouldAvoidSurroundingSpaces && isLeading ? 1 : 0;
		const skipLastCharacter = shouldAvoidSurroundingSpaces && isTrailing;
		const endingCharacterIndex = text.length - 1 - Number(skipLastCharacter);

		// Loop goes in reverse otherwise `splitText`'s `index` parameter needs to keep track of the previous split
		for (let i = endingCharacterIndex; i >= startingCharacterIndex; i--) {
			const thisCharacter = text[i];
			const endingIndex = i;

			// Exclude irrelevant characters
			if (thisCharacter !== ' ' && thisCharacter !== '\t') {
				continue;
			}

			// Find the same character so they can be wrapped together, but stop at `startingCharacterIndex`
			while (text[i - 1] === thisCharacter && !(i === startingCharacterIndex)) {
				i--;
			}

			// Skip non-boundary single spaces
			if (!isLeading && !isTrailing && i === endingIndex && thisCharacter === ' ') {
				continue;
			}

			if (endingIndex < text.length - 1) {
				textNode.splitText(endingIndex + 1);
			}

			textNode.splitText(i);

			// Update cached variable here because it just changed
			text = textNode.textContent;

			textNode.after(
				<span data-rgh-whitespace={thisCharacter === '\t' ? 'tab' : 'space'}>
					{textNode.nextSibling}
				</span>,
			);
		}
	}

	return line;
}
