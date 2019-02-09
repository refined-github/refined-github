export default (el: Element) => {
	const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
	const nodes: Text[] = [];
	let node: Text;

	do {
		node = walker.nextNode() as Text;
		if (node) {
			nodes.push(node);
		}
	} while (node);

	return nodes;
};
