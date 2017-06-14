export default el => {
	const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
	const next = () => {
		const value = walker.nextNode();
		return {
			value,
			done: !value
		};
	};
	walker[Symbol.iterator] = () => ({next});
	return walker;
};
