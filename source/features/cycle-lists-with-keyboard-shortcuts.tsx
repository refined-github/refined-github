import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	let selectableItems: HTMLElement[] = [];
	let lastSelectableItemIndex: number;

	function populateSelectableItems(): void {
		requestAnimationFrame(() => {
			selectableItems = select.all([
				'.js-active-navigation-container .select-menu-list:not([hidden]) .js-navigation-item:not([hidden])', // All selectable items in the current tab
				'.js-active-navigation-container .js-new-label-modal:not(.d-none) .js-navigation-item', // "Create label" button, when selecting labels
				'.js-active-navigation-container a.js-navigation-item.js-label-options' // "Edit labels" link, when selecting labels
			]);

			lastSelectableItemIndex = selectableItems.length - 1;
		});
	}

	function performSwapFocus(event: KeyboardEvent, from: number, to: number): void {
		event.preventDefault();
		event.stopPropagation();

		selectableItems[from].classList.remove('navigation-focus');
		selectableItems[from].setAttribute('aria-selected', 'false');
		selectableItems[to].classList.add('navigation-focus');
		selectableItems[to].setAttribute('aria-selected', 'true');

		selectableItems[to].scrollIntoView({
			block: 'nearest'
		});
	}

	function handleKeyDown(event: KeyboardEvent): void {
		if (selectableItems.length === 0) { // Empty projects and milestones list
			return;
		}

		if (selectableItems[0].matches('.navigation-focus') && event.key === 'ArrowUp') {
			performSwapFocus(event, 0, lastSelectableItemIndex);
		} else if (selectableItems[lastSelectableItemIndex].matches('.navigation-focus') && event.key === 'ArrowDown') {
			performSwapFocus(event, lastSelectableItemIndex, 0);
		}
	}

	// Input fields for projects and milestones are added dynamically to the page
	// GitHub triggers events on the document element for us, which can be used to detect new input elements
	delegate(document, '.js-filterable-field', 'filterable:change', populateSelectableItems);
	delegate(document, '.js-filterable-field', 'keydown', handleKeyDown);
}

void features.add(__filebasename, {}, {
	include: [
		pageDetect.isPRConversation,
		pageDetect.isIssue,
		pageDetect.isCompare
	],
	init
});
