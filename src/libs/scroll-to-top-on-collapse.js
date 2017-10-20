import select from 'select-dom';

export default () => {
	const toolbar = select('.pr-toolbar');

	$('.js-diff-progressive-container').on('details:toggled', '.file', ({target}) => {
		const elOffset = target.getBoundingClientRect().top;
		const toolbarHeight = toolbar.getBoundingClientRect().top;

		if (elOffset < toolbarHeight) {
			window.scrollBy(0, elOffset - toolbarHeight);
		}
	});
};
