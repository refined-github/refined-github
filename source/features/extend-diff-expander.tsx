import select from 'select-dom';
import features from '../libs/features';
import {getEventDelegator} from '../libs/dom-utils';

function expandDiff(event) {
	// Skip if the user clicked directly on the icon
	if (!event.target.closest('.js-expand')) {
		return;
	}

	const delegateTarget = getEventDelegator(event, '.js-expandable-line');
	if (!delegateTarget) {
		select<HTMLAnchorElement>('.js-expand', delegateTarget).click();
	}
}

function init() {
	select('.diff-view').addEventListener('click', expandDiff);
}

features.add({
	id: 'extend-diff-expander',
	include: [
		features.isPRFiles
	],
	load: features.onAjaxedPages,
	init
});
