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
			return inputs.filter(input => input.checked).map(input => input.labels![0]);
		}

		return inputs.filter(input => !input.checked).map(input => input.labels![0]);
	}

	return [];
}

async function handleEvent(event: DelegateEvent<MouseEvent, HTMLElement>): Promise<void> {
	if (!event.altKey || !event.isTrusted || event.target instanceof HTMLInputElement) {
		return;
	}

	const clickedItem = event.delegateTarget;

	// The closest parent element that is not `position: sticky`, i.e. scrolls with page
	let anchorElement = clickedItem.parentElement!;
	let viewportOffset = anchorElement.getBoundingClientRect().top;

	if (clickedItem instanceof HTMLLabelElement) {
		anchorElement = clickedItem.closest('.js-file')! as HTMLElement;
		viewportOffset = anchorElement.getBoundingClientRect().top;

		const checkedState = (clickedItem.control as HTMLInputElement)!.checked;

		for (const item of getSimilarItems(clickedItem) as HTMLLabelElement[]) {
			if (item === clickedItem) {
				continue;
			}

			(item.control as HTMLInputElement)!.checked = !checkedState;
			item.setAttribute('aria-checked', String(!checkedState));
			item.closest('.js-file')!.classList.toggle('show-inline-notes', !checkedState);
		}
	} else {
		for (const item of getSimilarItems(clickedItem)) {
			if (item !== clickedItem) {
				item.click();
			}
		}
	}

	// Scroll to original position where the click occurred after the rendering of all click events is done
	requestAnimationFrame(() => {
		const newOffset = anchorElement.getBoundingClientRect().top;
		window.scrollBy(0, newOffset - viewportOffset);

		// For "Show comments", `.click()` calls change the focused element, restore focus
		if (clickedItem instanceof HTMLLabelElement) {
			clickedItem.closest('details')!.querySelector('summary')!.focus();
		}
	});
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
	description: 'Adds a shortcut to toggle all similar items (minimized comments, deferred diffs, etc) at once: `alt` `click` on each button or checkbox.',
	init,
	include: [
		features.isPRConversation,
		features.isPRFiles,
		features.isCommit,
		features.isCompare
	]
});
