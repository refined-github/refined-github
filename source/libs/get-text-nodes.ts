export default (el: Element) => {
	const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
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
