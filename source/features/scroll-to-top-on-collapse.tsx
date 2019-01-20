import select from 'select-dom';
import delegate from 'delegate';
import features from '../libs/features';

function init() {
	const toolbar = select('.pr-toolbar');

	delegate('.js-diff-progressive-container', '.file', 'details:toggled', ({target}) => {
		const elOffset = target.getBoundingClientRect().top;
		const toolbarHeight = toolbar.getBoundingClientRect().top;

		// Bring element in view if it's above the PR toolbar
		if (elOffset < toolbarHeight) {
			window.scrollBy(0, elOffset - toolbarHeight);
		}
	});
}

features.add({
	id: 'scroll-to-top-on-collapse',
	include: [
		features.isPR
	],
	load: features.onAjaxedPages,
	init
});
