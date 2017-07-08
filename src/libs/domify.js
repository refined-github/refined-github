export default html => {
	const template = document.createElement('template');
	template.innerHTML = html;

	const fragment = template.content;

	// If it's a single element, return just the element
	if (fragment.firstChild === fragment.lastChild) {
		return fragment.firstChild;
	}

	// Return fragment for querying
	return fragment;
};
