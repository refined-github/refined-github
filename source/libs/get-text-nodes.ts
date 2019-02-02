export default el => {
	const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
	const nodes = [];
	/**
	 * @type ChildNode
	 */
	let node;

	do {
		node = walker.nextNode();
		if (node) {
			nodes.push(node);
		}
	} while (node);

	return nodes;
};
