import React from 'dom-chef';
import TrashIcon from 'octicons-plain-react/Trash';
import SquareCircleIcon from 'octicons-plain-react/SquareCircle';
import * as pageDetect from 'github-url-detection';
import {$, $optional} from 'select-dom/strict.js';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

function transformIntoIconButton(button: HTMLButtonElement, icon: React.JSX.Element): void {
	button.ariaLabel = button.textContent.trim();
	button.replaceChildren(icon);
	button.classList = 'Button Button--iconOnly Button--invisible';
}

function addQuickButtons(row: HTMLDivElement): void {
	const details = $('details:has(.octicon-kebab-horizontal)', row);
	const rightControlsContainer = details.parentElement!;

	const deleteWorkflowButton = $optional('button[data-show-dialog-id^="delete-workflow-run"]', details);
	if (deleteWorkflowButton) {
		const dialogHelper = $('dialog-helper', deleteWorkflowButton.parentElement!);
		dialogHelper.classList.add('text-left');
		transformIntoIconButton(deleteWorkflowButton, <TrashIcon />);
		rightControlsContainer.prepend(deleteWorkflowButton, dialogHelper);
	}

	const cancelForm = $optional('form[action$="/cancel"]', details);
	if (cancelForm) {
		const cancelWorkflowButton = $('button[type="submit"]', cancelForm);
		transformIntoIconButton(cancelWorkflowButton, <SquareCircleIcon />);
		rightControlsContainer.prepend(cancelForm);
	}

	rightControlsContainer.classList.toggle('d-flex', !!(cancelForm || deleteWorkflowButton));
}

function init(signal: AbortSignal): void {
	observe('#partial-actions-workflow-runs .Box-row', addQuickButtons, {signal});
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
