export default html => {
	const fragment = document.createRange().createContextualFragment(html);

	// If it's a single element, return just the element
	if (fragment.firstChild === fragment.lastChild) {
		return fragment.firstChild;
	}
	return fragment;
};
