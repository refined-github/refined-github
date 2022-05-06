import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

async function sessionResumeHandler(): Promise<void> {
	await Promise.resolve(); // The `session:resume` event fires a bit too early
	const cancelMergeButton = select('.merge-branch-form .js-details-target');
	if (cancelMergeButton) {
		cancelMergeButton.click();
		document.removeEventListener('session:resume', sessionResumeHandler);
	}
}

function init(signal: AbortSignal): void {
	document.addEventListener('session:resume', sessionResumeHandler, {signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		// The user is a maintainer, so they can probably merge the PR
		() => select.exists('.discussion-sidebar-item .octicon-lock'),
	],
	include: [
		pageDetect.isPRConversation,
	],
	exclude: [
		() => select.exists('#partial-discussion-header [title="Status: Draft"]'),
	],
	awaitDomReady: false,
	deduplicate: 'has-rgh-inner',
	init,
});
