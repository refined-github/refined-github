import select from 'select-dom';
import features from '../libs/features';
import {getEventDelegator} from '../libs/dom-utils';

function init() {
	const toolbar = select('.pr-toolbar');

	select('.js-diff-progressive-container').addEventListener('details:toggled', event => {
		if (!getEventDelegator(event, '.file')) {
			return;
		}

		const elOffset = (event.target as Element).getBoundingClientRect().top;
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
