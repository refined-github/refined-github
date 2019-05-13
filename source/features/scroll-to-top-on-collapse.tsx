import select from 'select-dom';
import delegate, {DelegateEvent} from 'delegate-it';
import features from '../libs/features';

function init(): void {
	const toolbar = select('.pr-toolbar')!;

	delegate('.js-diff-progressive-container', '.file', 'details:toggled', ({delegateTarget}: DelegateEvent) => {
		const elOffset = delegateTarget.getBoundingClientRect().top;
		const toolbarHeight = toolbar.getBoundingClientRect().top;

		// Bring element in view if it's above the PR toolbar
		if (elOffset < toolbarHeight) {
			window.scrollBy(0, elOffset - toolbarHeight);
		}
	});
}

features.add({
	id: 'scroll-to-top-on-collapse',
	description: 'Collapse/expand files in a pull request diff',
	include: [
		features.isPR
	],
	load: features.onAjaxedPages,
	init
});
