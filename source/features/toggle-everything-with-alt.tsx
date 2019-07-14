import select from 'select-dom';
import delegate, {DelegateEvent} from 'delegate-it';
import features from '../libs/features';

function getSimilarItems(item: HTMLElement): HTMLElement[] {
	// Collapsed comments in PR conversations and files
	if (item.matches('summary')) {
		if ((item.parentElement as HTMLDetailsElement).open) {
			return select.all('.minimized-comment details[open] summary');
		}

		return select.all('.minimized-comment details:not([open]) summary');
	}

	// "Load diff" buttons in PR files
	if (item.matches('.js-diff-load')) {
		return select.all('.js-file .js-diff-load');
	}

	// Review comments in PR
	if (item.matches('.js-resolvable-thread-toggler')) {
		const targets = select.all('.js-resolvable-thread-toggler');
		if (select.exists('svg.octicon-unfold', item)) {
			return targets.filter(target => !target.matches('.d-none') && select.exists('svg.octicon-unfold', target));
		}

		return targets.filter(target => !target.matches('.d-none') && select.exists('svg.octicon-fold', target));
	}

	// "Show comments" checkboxes
	if (item instanceof HTMLLabelElement) {
		const inputs = select.all<HTMLInputElement>('.js-file .dropdown-item .js-toggle-file-notes');
		if ((item.control as HTMLInputElement).checked) {
			return inputs.filter(input => !input.checked).map(input => input.labels![0]);
		}

		return inputs.filter(input => input.checked).map(input => input.labels![0]);
	}

	return [];
}

async function handleEvent(event: DelegateEvent<MouseEvent, HTMLElement>): Promise<void> {
	if (!event.altKey) {
		return;
	}

	const clickedItem = event.delegateTarget;

	let timeKeeper = Date.now();
	for (const item of getSimilarItems(clickedItem)) {
		if (item !== clickedItem) {
			// Avoid holding the thread for much longer than 50ms
			if (Date.now() - timeKeeper > 50) {
				// eslint-disable-next-line no-await-in-loop
				await new Promise(resolve => setTimeout(resolve));
			}

			timeKeeper = Date.now();
			item.click();
		}
	}
}

function init(): void {
	delegate('.repository-content', '.minimized-comment details summary', 'click', handleEvent);
	delegate('.repository-content', '.js-file .js-diff-load', 'click', handleEvent);
	delegate('.repository-content', '.js-file .dropdown-menu label.dropdown-item:first-child', 'click', handleEvent);
	delegate('.repository-content', '.js-file .js-resolvable-thread-toggler', 'click', handleEvent);
}

features.add({
	id: __featureName__,
	load: features.onAjaxedPages,
	description: 'Toggle all similar items (minimized comments, deferred diffs, etc) while holding `alt`',
	init,
	include: [
		features.isPRConversation,
		features.isPRFiles,
		features.isCommit,
		features.isCompare
	]
});
