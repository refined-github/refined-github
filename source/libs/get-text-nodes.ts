export default (el: Node): Text[] => {
	const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
	const nodes: Text[] = [];
	let node;

	do {
		node = walker.nextNode();
		if (node) {
			nodes.push(node as Text);
		}
	} while (node);

	return nodes;
};
