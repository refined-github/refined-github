import select from 'select-dom';
import delegate, {DelegateEvent} from 'delegate-it';
import features from '../libs/features';

function getSimilarItems(item: Element): HTMLButtonElement[] | HTMLLabelElement[] | HTMLElement[] {
	// Collapsed comments in PR conversations and files
	if (item.matches('summary')) {
		if ((item.parentElement! as HTMLDetailsElement).open === true) {
			return select.all('.minimized-comment details[open] summary');
		}

		return select.all('.minimized-comment details:not([open]) summary');
	}

	// "Load diff" buttons in PR files
	if (item.matches('.js-diff-load')) {
		return select.all('.js-file .js-diff-load');
	}

	// "Show comments" checkboxes
	if (item.matches('label')) {
		const inputs: HTMLInputElement[] = select.all('.js-file .dropdown-item .js-toggle-file-notes');
		if (((item as HTMLLabelElement).control! as HTMLInputElement).checked === true) {
			return inputs.filter(input => !input.checked).map(input => input.labels![0]);
		}

		return inputs.filter(input => input.checked).map(input => input.labels![0]);
	}

	return [];
}

function handleEvent(event: DelegateEvent<MouseEvent, HTMLButtonElement | HTMLLabelElement | HTMLElement>): void {
	if (event.altKey) {
		const clickedItem = event.delegateTarget as Element;
		const viewportOffset = clickedItem.getBoundingClientRect().top;
		const similarItems = getSimilarItems(clickedItem);

		for (const item of similarItems) {
			if (item !== clickedItem) {
				item.click();
			}
		}

		// Scroll to original position where the click occurred after the rendering of all click events is done
		requestAnimationFrame(() => {
			const newOffset = clickedItem.getBoundingClientRect().top;
			window.scrollBy(0, newOffset - viewportOffset);
		});
	}
}

function init(): void {
	delegate('.repository-content', '.minimized-comment details summary', 'click', handleEvent);
	delegate('.repository-content', '.js-file .js-diff-load', 'click', handleEvent);
	delegate('.repository-content', '.js-file .dropdown-menu label.dropdown-item:first-child', 'click', handleEvent);
}

features.add({
	id: 'toggle-all-things-with-alt',
	load: features.onAjaxedPages,
	description: 'Toggle all similar items while holding `alt`',
	init,
	include: [
		features.isPRConversation,
		features.isPRFiles,
		features.isCommit,
		features.isCompare
	]
});
