export default () => {
	$('.js-diff-progressive-container').on('details:toggled', '.file', ({target}) => {
		// Calculate the scroll offset
		// See: https://stackoverflow.com/a/11396681/3736051
		const bodyOffset = document.body.getBoundingClientRect().top;
		const parentOffset = target.getBoundingClientRect().top;
		const toolbarHeight = $('.pr-toolbar').height();

		// Parent offset is relative to the viewport
		if (parentOffset < toolbarHeight) {
			window.scrollTo(
				// Maintain the horizontal scroll
				window.scrollX,
				// Put the top of the container at the foot of the toolbar
				parentOffset - bodyOffset - toolbarHeight);
		}
	});
};
