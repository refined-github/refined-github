import select from 'select-dom';
import delegate from 'delegate';

function expandDiff(event) {
	// Skip if the user clicked directly on the icon
	if (!event.target.closest('.js-expand')) {
		select('.js-expand', event.delegateTarget).click();
	}
}

export default function () {
	delegate('.diff-view', '.js-expandable-line', 'click', expandDiff);
}
