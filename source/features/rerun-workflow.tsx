import {$optional} from 'select-dom/strict.js';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import {registerHotkey} from '../github-helpers/hotkey.js';

function rerunFailedJobs(): void {
	const button = $optional('button[data-show-dialog-id="rerun-dialog-failed"]');
	button?.click();
}

function init(signal: AbortSignal): void {
	registerHotkey('shift r', rerunFailedJobs, {signal});
}

void features.add(import.meta.url, {
	shortcuts: {
		'shift r': 'Re-run failed GitHub Actions jobs',
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
