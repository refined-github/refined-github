import {$} from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';

async function sessionResumeHandler(): Promise<void> {
	await Promise.resolve(); // The `session:resume` event fires a bit too early
	const cancelMergeButton = $('.merge-branch-form .js-details-target');
	if (cancelMergeButton) {
		cancelMergeButton.click();
		document.removeEventListener('session:resume', sessionResumeHandler);
	}
}

function init(signal: AbortSignal): void {
	document.addEventListener('session:resume', sessionResumeHandler, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRConversation,
	],
	init,
});
