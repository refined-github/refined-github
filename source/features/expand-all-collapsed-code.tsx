import select from 'select-dom';
import delegate, {DelegateEvent} from 'delegate-it';
import features from '../libs/features';

// When diff table's childlist changes, select and click expand button to load more lines
const clickOnAutoexpandObserver = new MutationObserver(mutations => {
	for (const mutation of mutations) {
		if (mutation.type === 'childList') {
			const btn = select('.js-expand.directional-expander.single-expander', mutation.target as HTMLElement);
			if (btn) {
				btn.click();
			}
		}
	}
});

function clickOnAutoexpand(element: HTMLElement): void {
	clickOnAutoexpandObserver.observe(element, {childList: true});
}

function unfoldOnAltClick(event: DelegateEvent<MouseEvent>): void {
	if (event.altKey) {
		event.preventDefault();
		unfold();
	}
}

const addListenersObserver = new MutationObserver(mutations => {
	for (const mutation of mutations) {
		if (mutation.type === 'childList') {
			delegate(
				mutation.target as HTMLElement,
				'.js-expand.directional-expander.single-expander',
				'click',
				unfoldOnAltClick
			);
		}
	}
});

// When user clicks on expand button without alt, we need to add alt-click listeners to newly created buttons
function addListenersOnExpand(element: HTMLElement): void {
	addListenersObserver.observe(element, {childList: true});
}

function unfold(): void {
	const diffTables = select.all('.diff-table > tbody');

	for (const diffTable of diffTables) {
		clickOnAutoexpand(diffTable);
	}

	const expandButtons = select.all('.js-expand.directional-expander.single-expander');
	for (const button of expandButtons) {
		button.click();
	}
}

function init(): void {
	const diffTables = select.all('.diff-table > tbody');

	for (const diffTable of diffTables) {
		addListenersOnExpand(diffTable);
	}

	// Add alt-click listener to the initial expand buttons
	delegate('.js-expand.directional-expander.single-expander', 'click', unfoldOnAltClick);
}

features.add({
	id: __featureName__,
	description: 'Unfolds all files when user alt-clicks on any expand button when viewing PR or commit.',
	screenshot: '',
	include: [features.isPRCommit, features.isPRFiles, features.isSingleCommit],
	load: features.onAjaxedPages,
	init
});
