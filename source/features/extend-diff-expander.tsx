import select from 'select-dom';
import delegate, { DelegateEvent } from 'delegate';
import features from '../libs/features';

function expandDiff(event: DelegateEvent) {
	// Skip if the user clicked directly on the icon
	if (!(event.target as Element).closest('.js-expand')!) {
		select<HTMLAnchorElement>('.js-expand', event.delegateTarget as Element)!.click();
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
