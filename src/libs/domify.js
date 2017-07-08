export default html => {
	const fragment = document.createElement('template');
	fragment.innerHTML = html;

	const content = fragment.content;

	// If it's a single element, return just the element
	if (content.firstChild === content.lastChild) {
		return content.firstChild;
	}

	// Return template for querying
	return content;
};
