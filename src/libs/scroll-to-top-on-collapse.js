export default () => {
	$('.js-diff-progressive-container').on('click', '.js-details-target', function() {
		// get the parent file container
		const parent = $(this).closest('.file')[0]

		// calculate the scroll offset
		// https://stackoverflow.com/a/11396681/3736051
		const bodyOffset = document.body.getBoundingClientRect().top
		const parentOffset = parent.getBoundingClientRect().top
		const toolbarHeight = $('.pr-toolbar').height()

		// parentOffset is relative to the viewport
		if (parentOffset < toolbarHeight) {
			window.scrollTo(
				// maintain the horizontal scroll
				window.scrollX,
				// put the top of the container at the foot of the toolbar
				parentOffset - bodyOffset - toolbarHeight)
		}
	})
}
