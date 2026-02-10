import {$} from 'select-dom/strict.js';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import {registerHotkey} from '../github-helpers/hotkey.js';
import observe from '../helpers/selector-observer.js';

const rerunButtonSelector = 'button[data-show-dialog-id="rerun-dialog-failed"]';

function rerunFailedJobs(): void {
	$(rerunButtonSelector).click();
}

function addShortcutHint(button: HTMLButtonElement): void {
	button.setAttribute('title', 'Re-run failed jobs (r f)');
}

function init(signal: AbortSignal): void {
	registerHotkey('r f', rerunFailedJobs, {signal});
	observe(rerunButtonSelector, addShortcutHint, {signal});
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
