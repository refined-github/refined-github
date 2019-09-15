import select from 'select-dom';
import delegate, {DelegateEvent} from 'delegate-it';
import features from '../libs/features';

const expanderSelector = '.js-expand.directional-expander';

// Waits for the next loaded diff part and clicks on any additional "Expand" buttons it finds
const expandingCodeObserver = new MutationObserver(([mutation]) => {
	const expandButton = select(expanderSelector, mutation.target as Element);
	if (expandButton) {
		expandButton.click();
	} else {
		expandingCodeObserver.disconnect();
	}
});

function handleAltClick(event: DelegateEvent<MouseEvent, HTMLButtonElement>): void {
	if (!event.altKey) {
		return;
	}

	expandingCodeObserver.observe(
		event.delegateTarget.closest('.diff-table > tbody')!,
		{childList: true}
	);
}

function init(): void {
	delegate(expanderSelector, 'click', handleAltClick);
}

features.add({
	id: __featureName__,
	description: 'Expands the entire file when you alt-click on any "Expand code" button in diffs.',
	screenshot: 'https://user-images.githubusercontent.com/44227187/64923605-d0138900-d7e3-11e9-9dc2-461aba81c1cb.gif',
	include: [
		features.isPRCommit,
		features.isPRFiles,
		features.isSingleCommit
	],
	load: features.onAjaxedPages,
	init
});
