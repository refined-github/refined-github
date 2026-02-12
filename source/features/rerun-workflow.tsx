import React from 'dom-chef';
import {$, $$, $optional} from 'select-dom/strict.js';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import {registerHotkey} from '../github-helpers/hotkey.js';
import observe from '../helpers/selector-observer.js';

const rerunFailedJobsButtonSelector = 'button[data-show-dialog-id="rerun-dialog-failed"]';

function rerunFailedJobs(): void {
	$optional(rerunFailedJobsButtonSelector)?.click();
}

function replaceRerunDropdown(menu: HTMLElement): void {
	const rerunFailedJobsButton = $optional(rerunFailedJobsButtonSelector, menu);
	if (!rerunFailedJobsButton) {
		return;
	}

	const container = menu.parentElement!;

	for (const button of $$('button.ActionListContent', menu)) {
		const clone = button.cloneNode(true);
		clone.className = 'Button--secondary Button--medium Button';
		clone.firstElementChild!.className = 'Button-label';
		container.append(clone);
	}

	container.classList.add('d-flex', 'gap-2');
	menu.classList.add('d-none');

	$(':scope > [data-show-dialog-id="rerun-dialog-failed"]', container)
		.append(
			<tool-tip data-direction="s" data-type="description" role="tooltip">
				Re-run failed jobs <kbd>r</kbd> <kbd>f</kbd>
			</tool-tip>,
		);
}

function init(signal: AbortSignal): void {
	registerHotkey('r f', rerunFailedJobs, {signal});
	observe('.PageHeader-actions action-menu', replaceRerunDropdown, {signal});
}

void features.add(import.meta.url, {
	shortcuts: {
		'r f': 'Re-run failed jobs',
	},
	include: [
		pageDetect.isActionRun,
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/refined-github/actions/runs/16143473286?pr=8544

*/
