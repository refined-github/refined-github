import select from 'select-dom';
import delegate, {DelegateEvent} from 'delegate-it';
import features from '../libs/features';

const expanderSelector = '.ajax-pagination-form';
const expanderButtonSelector = `${expanderSelector} .ajax-pagination-btn`;
const containerSelector = '#js-progressive-timeline-item-container';

function observe(expanderElement: HTMLElement) {
	// Waits for the next loaded comments and clicks on any additional "Load more..." buttons it finds
	const expandingCodeObserver = new MutationObserver(([mutation]) => {
		const expandButton = select(expanderButtonSelector, mutation.target as Element);

		if (expandButton) {
			expandButton.click();

			// Recursively observe the returned list
			observe(expandButton);
		}

		expandingCodeObserver.disconnect();
	});

	expandingCodeObserver.observe(
		expanderElement.closest(containerSelector)!,
		{childList: true}
	);
}

function handleAltClick(event: DelegateEvent<MouseEvent, HTMLButtonElement>): void {
	if (!event.altKey) {
		return;
	}

	observe(event.delegateTarget);
}

function init(): void {
	delegate(expanderSelector, 'click', handleAltClick);
}

features.add({
	id: __featureName__,
	description: 'Expands all the hidden comments when you alt-click on any "Load more..." button in issues.',
	screenshot: 'https://user-images.githubusercontent.com/7753001/73732470-338f5a80-4775-11ea-8756-070102ba3858.gif',
	include: [
		features.isIssue,
		features.isPRConversation
	],
	load: features.onAjaxedPages,
	init
});
