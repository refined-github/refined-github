export default function parseRenderedText(element: Element, filter?: NodeFilter): string {
	const walker = document.createTreeWalker(element, NodeFilter.SHOW_ALL, filter);

	// eslint-disable-next-line @typescript-eslint/no-restricted-types
	let currentNode = walker.currentNode as Node | null;
	let parsedText = '';

	while (currentNode) {
		if (currentNode.nodeName === 'CODE') {
			const {textContent} = currentNode;
			// Restore backticks that GitHub loses when rendering them
			// eslint-disable-next-line no-restricted-syntax -- textContent can be null on DOM nodes
			parsedText += `\`${textContent?.trim()}\``;

			// Skip the children
			currentNode = walker.nextSibling();
			while (!currentNode) {
				currentNode = walker.parentNode();

				if (currentNode === walker.root) {
					return parsedText.trim();
				}

				currentNode = walker.nextSibling();
			}

			continue;
		}

		if (currentNode.nodeType === Node.TEXT_NODE) {
			parsedText += currentNode.nodeValue;
		}

		currentNode = walker.nextNode();
	}

	return parsedText.trim();
}
