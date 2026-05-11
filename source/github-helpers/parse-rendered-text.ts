import getTextNodes from '../helpers/get-text-nodes.js';

export const excludeFromDomTextExtraction = 'rgh-exclude-from-dom-text-extraction';

export default function parseRenderedText(element: Element): string {
	return getTextNodes(element)
		.map(node => {
			if (node.parentElement?.tagName === 'CODE') {
				return `\`${node.nodeValue?.trim()}\``;
			}

			if (
				node.parentElement?.tagName === 'BUTTON'
				|| node.parentElement?.classList.contains(excludeFromDomTextExtraction)
			) {
				return '';
			}

			return node.nodeValue;
		})
		.join('')
		.trim();
}
