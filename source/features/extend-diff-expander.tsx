import select from 'select-dom';
import delegate from 'delegate';
import features from '../libs/features';

function expandDiff(event) {
	// Skip if the user clicked directly on the icon
	if (!event.target.closest('.js-expand')) {
		select('.js-expand', event.delegateTarget).click();
	}
}

function init() {
	delegate('.diff-view', '.js-expandable-line', 'click', expandDiff);
}

features.add({
	id: 'extend-diff-expander',
	include: [
		features.isPRFiles
	],
	load: features.onAjaxedPages,
	init
});
