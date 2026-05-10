export default function getTextNodes(element: Node, filter?: NodeFilter): Text[] {
	const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, filter);
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
