export default function parseRenderedText(element: Element, filter?: NodeFilter): string {
	const walker = document.createTreeWalker(element, NodeFilter.SHOW_ALL, filter);

	let parsedText = '';
	// eslint-disable-next-line @typescript-eslint/no-restricted-types
	let currentNode = walker.currentNode as Node | null;

	while (currentNode) {
		if (currentNode.nodeName === 'CODE') {
			const {textContent} = currentNode;
			// Restore backticks that GitHub loses when rendering them
			parsedText += textContent ? `\`${textContent}\`` : '';
			currentNode = walker.nextSibling();
			continue;
		}

		if (currentNode.nodeType === Node.TEXT_NODE) {
			parsedText += currentNode.nodeValue;
		}

		currentNode = walker.nextNode();
	}

	return parsedText.trim();
}
