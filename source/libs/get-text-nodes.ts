export default (el: Element) => {
	const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
	const nodes: Element[] = [];
	/**
	 * @type ChildNode
	 */
	let node: Element;

	do {
		node = walker.nextNode() as Element;
		if (node) {
			nodes.push(node);
		}
	} while (node);

	return nodes;
};
