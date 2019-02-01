export default (element: Element) => {
	const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
	const nodes: Node[] = [];
	let node: Node;

	do {
		node = walker.nextNode();
		if (node) {
			nodes.push(node);
		}
	} while (node);

	return nodes;
};
