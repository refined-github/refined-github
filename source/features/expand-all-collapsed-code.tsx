import select from 'select-dom';
import delegate, {DelegateEvent} from 'delegate-it';
import features from '../libs/features';

const expanderSelector = '.js-expand.directional-expander';

// Waits for the next loaded diff part and clicks on any additional "Expand" buttons it finds
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

	const table = (event.target as Element).closest('.diff-table > tbody')!;

	if (table) {
		clickOnAutoexpandObserver.observe(table, {childList: true});
	}
}

function init(): void {
	delegate(expanderSelector, 'click', unfold);
}

features.add({
	id: __featureName__,
	description: 'Expands the entire file when you alt-click on any "Expand code" button in diffs.',
	screenshot: '',
	include: [
		features.isPRCommit,
		features.isPRFiles,
		features.isSingleCommit
	],
	load: features.onAjaxedPages,
	init
});
