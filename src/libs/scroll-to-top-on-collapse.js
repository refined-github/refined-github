export default () => {
	$('.js-diff-progressive-container').on('click', '.js-details-target', function () {
		// Get the parent file container
		const parent = $(this).closest('.file')[0];

		// Calculate the scroll offset
		// See: https://stackoverflow.com/a/11396681/3736051
		const bodyOffset = document.body.getBoundingClientRect().top;
		const parentOffset = parent.getBoundingClientRect().top;
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
