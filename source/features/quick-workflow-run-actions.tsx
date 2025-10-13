import React from 'dom-chef';
import TrashIcon from 'octicons-plain-react/Trash';
import SquareCircleIcon from 'octicons-plain-react/SquareCircle';
import * as pageDetect from 'github-url-detection';
import {$, $optional} from 'select-dom/strict.js';

import observe from '../helpers/selector-observer.js';
import features from '../feature-manager.js';
import './quick-workflow-run-actions.css';

function transformIntoIconButton(button: HTMLButtonElement, icon: React.JSX.Element): HTMLButtonElement {
	button.ariaLabel = button.textContent.trim();
	button.replaceChildren(icon);
	button.classList = 'lh-condensed color-fg-muted btn-link';
	return button;
}

function addQuickButtons(contextMenu: HTMLElement): void {
	const contextMenuDetails = contextMenu.closest('details')!;
	const rightControlsContainer = contextMenuDetails.parentElement!;

	const deleteWorkflowMenuItem = $optional('li:has(> button[data-show-dialog-id^="delete-workflow-run"])', contextMenuDetails)?.cloneNode(true);
	if (deleteWorkflowMenuItem) {
		const deleteWorkflowButton = $('button', deleteWorkflowMenuItem);
		transformIntoIconButton(deleteWorkflowButton, <TrashIcon />);
		deleteWorkflowButton.classList.add('rgh-delete-workflow-run');
		rightControlsContainer.prepend(deleteWorkflowMenuItem);
	}

	const cancelForm = $optional('form[action$="/cancel"]', contextMenuDetails)?.cloneNode(true);
	if (cancelForm) {
		const cancelWorkflowButton = $('button', cancelForm);
		transformIntoIconButton(cancelWorkflowButton, <SquareCircleIcon />);
		cancelWorkflowButton.classList.add('rgh-cancel-workflow-run');
		rightControlsContainer.prepend(cancelForm);
	}

	if (cancelForm || deleteWorkflowMenuItem) {
		rightControlsContainer.classList.add('d-flex', 'flex-column-reverse');
		$('summary', contextMenuDetails).classList.add('lh-condensed', 'my-1', 'p-0');
	}
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
