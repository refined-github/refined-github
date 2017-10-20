export default () => {
	$('.js-diff-progressive-container').on('details:toggled', '.file', ({target}) => {
		const toolbarHeight = $('.pr-toolbar').height();
		const elOffset = target.getBoundingClientRect().top;

		if (elOffset < toolbarHeight) {
			window.scrollBy(0, elOffset - toolbarHeight);
		}
	});
};
