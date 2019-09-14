import select from 'select-dom';
import delegate, {DelegateEvent} from 'delegate-it';
import features from '../libs/features';

const expanderSelector = '.js-expand.directional-expander';

// When diff table's childlist changes, select and click expand button to load more lines
const clickOnAutoexpandObserver = new MutationObserver(mutations => {
	for (const mutation of mutations) {
		const btn = select(expanderSelector, mutation.target as HTMLElement);
		if (btn) {
			btn.click();
		}
	}
});

function unfold(event: DelegateEvent<MouseEvent>): void {
	if (!event.altKey) {
		return;
	}

	const table = (event.target as Element).closest('.diff-table > tbody');

	if (table) {
		clickOnAutoexpandObserver.observe(table, {childList: true});
	}
}

function init(): void {
	// Add alt-click listener to expand buttons
	delegate(expanderSelector, 'click', unfold);
}

features.add({
	id: __featureName__,
	description: 'Unfolds all files when user alt-clicks on any expand button when viewing PR or commit.',
	screenshot: '',
	include: [
		features.isPRCommit,
		features.isPRFiles,
		features.isSingleCommit
	],
	load: features.onAjaxedPages,
	init
});
