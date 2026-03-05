import {$, $$, $optional} from 'select-dom/strict.js';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import {registerHotkey} from '../github-helpers/hotkey.js';
import observe from '../helpers/selector-observer.js';

function rerunFailedJobs(): void {
	$('button[data-show-dialog-id="rerun-dialog-failed"]').click();
}

function replaceRerunDropdown(signal: AbortSignal, menu: HTMLElement): void {
	const menuButton = $optional('focus-group > button', menu);
	// The observer matches all action-menus; only transform the "Re-run jobs" dropdown
	if (menuButton?.textContent.trim() !== 'Re-run jobs') {
		return;
	}

	registerHotkey('r f', rerunFailedJobs, {signal});

	const container = menu.parentElement!;

	for (const button of $$('button.ActionListContent', menu)) {
		const clone = button.cloneNode(true);
		clone.className = 'Button--secondary Button--medium Button';
		clone.firstElementChild!.className = 'Button-label';
		container.append(clone);
	}

	container.classList.add('d-flex', 'gap-2');
	menu.classList.add('d-none');
}

function init(signal: AbortSignal): void {
	observe('.PageHeader-actions action-menu', replaceRerunDropdown.bind(undefined, signal), {signal});
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

https://github.com/refined-github/refined-github/actions
	- Run with failed jobs
	- Run without failed jobs

*/
