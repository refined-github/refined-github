import select from 'select-dom';
import delegate from 'delegate';

export default () => {
	const toolbar = select('.pr-toolbar');

	for (const container of select.all('.js-diff-progressive-container')) {
		delegate(container, '.file', 'details:toggled', ({target}) => {
			const elOffset = target.getBoundingClientRect().top;
			const toolbarHeight = toolbar.getBoundingClientRect().top;

			// Bring element in view if it's above the PR toolbar
			if (elOffset < toolbarHeight) {
				window.scrollBy(0, elOffset - toolbarHeight);
			}
		});
	}
};
