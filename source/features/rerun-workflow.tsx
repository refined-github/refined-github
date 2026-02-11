import React from 'dom-chef';
import {$, $$, $optional} from 'select-dom/strict.js';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import {registerHotkey} from '../github-helpers/hotkey.js';
import observe from '../helpers/selector-observer.js';

function rerunFailedJobs(): void {
	$('button[data-show-dialog-id="rerun-dialog-failed"]').click();
}

function replaceRerunDropdown(menu: HTMLElement): void {
	const triggerButton = $optional('focus-group > button', menu);

	// The observer matches all action-menus; only transform the "Re-run jobs" dropdown
	if (triggerButton?.textContent.trim() !== 'Re-run jobs') {
		return;
	}

	const container = menu.parentElement!;

	for (const button of $$('button.ActionListContent', menu)) {
		const clone = button.cloneNode(true);
		clone.className = 'Button--secondary Button--medium Button';
		container.append(clone);
	}

	container.classList.add('d-flex', 'gap-2');
	menu.classList.add('d-none');

	// Add shortcut hint to the "Re-run failed jobs" button
	$optional(':scope > [data-show-dialog-id="rerun-dialog-failed"]', container)
		?.append(
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
		'r f': 'Re-run failed GitHub Actions jobs',
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
