import './actions-run-removal.css';

import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import SquareCircleIcon from 'octicons-plain-react/SquareCircle';
import TrashIcon from 'octicons-plain-react/Trash';
import {$, $optional, closestElement} from 'select-dom';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

function addQuickButtons(contextMenuIcon: HTMLElement): void {
	const contextMenuDetails = closestElement('details', contextMenuIcon);

	// It might be missing if the user has no access to this repo
	const menuItem = $optional([
		'form[action$="/cancel"]',
		'li:has(> button[data-show-dialog-id^="delete-workflow-run"])',
	], contextMenuDetails)?.cloneNode(true) as HTMLElement;

	if (!menuItem) {
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
