// Get DOM node from HTML
export default html => {
	// Shortcut for html`text` instead of html(`text`)
	if (html.raw) {
		html = String.raw(...arguments);
	}

	return document.createRange().createContextualFragment(html);
};
