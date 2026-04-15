import './actions-run-removal.css';

import React from 'dom-chef';
import TrashIcon from 'octicons-plain-react/Trash';
import SquareCircleIcon from 'octicons-plain-react/SquareCircle';
import * as pageDetect from 'github-url-detection';
import {$, $optional} from 'select-dom/strict.js';

import observe from '../helpers/selector-observer.js';
import features from '../feature-manager.js';

function addQuickButtons(contextMenuIcon: HTMLElement): void {
	const contextMenuDetails = contextMenuIcon.closest('details')!;

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-arguments -- Wrong
	const menuItem = $optional<HTMLElement>([
		'form[action$="/cancel"]',
		'li:has(> button[data-show-dialog-id^="delete-workflow-run"])',
	], contextMenuDetails)?.cloneNode(true);

	if (!menuItem) {
		// No access to this repo
		return;
	}

	const button = $('button', menuItem);
	button.ariaLabel = button.textContent.trim();
	button.replaceChildren(menuItem.tagName === 'FORM' ? <SquareCircleIcon /> : <TrashIcon />);
	button.classList = 'timeline-comment-action color-fg-muted btn-link rgh-actions-run-removal p-1';
	$('summary', contextMenuDetails).classList.add('p-1');
	const rightControlsContainer = contextMenuDetails.parentElement!;
	// Prepending so that the cloned dialog opens instead of the one inside the menu, as it is hidden when the menu is closed
	rightControlsContainer.classList.add('d-flex', 'flex-column-reverse', 'mt-n2', 'mb-n2');
	rightControlsContainer.prepend(menuItem);
}

function init(signal: AbortSignal): void {
	observe('#partial-actions-workflow-runs .Box-row details .octicon-kebab-horizontal', addQuickButtons, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepositoryActions,
	],
	init,
});

/*

Test URLs

https://github.com/refined-github/refined-github/actions

*/
