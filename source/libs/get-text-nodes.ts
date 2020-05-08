export default function getTextNodes(element: Node): Text[] {
	const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
	const nodes: Text[] = [];
	let node;

	do {
		node = walker.nextNode();
		if (node) {
			nodes.push(node as Text);
		}
	} while (node);

	return nodes;
}
