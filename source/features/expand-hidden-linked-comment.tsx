import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import {$, closestElementOptional} from 'select-dom';

import features from '../feature-manager.js';

async function expandLinkedComment(): Promise<void> {
	const id = location.hash.slice(1);
	if (!id) {
		return;
	}

	const target = await elementReady(`#${CSS.escape(id)}`, {waitForChildren: false});
	if (!target) {
		return;
	}

	// TODO [2027-01-01]: Old timeline UI, drop
	// Scoped to `.minimized-comment .timeline-comment-header-text` (same selector as `preview-hidden-comments`)
	// because `target` can also contain unrelated `<details>` dropdowns (e.g. the "..." menu, reactions popover)
	const header = $('.minimized-comment .timeline-comment-header-text', target);
	const details = closestElementOptional('details', header);
	if (details) {
		if (!details.open) {
			details.open = true;
			target.scrollIntoView();
		}

		return;
	}

	// New React-based Issues UI
	const unfoldButton = closestElementOptional('[data-testid="comment-header"]', target)
		?.querySelector<HTMLButtonElement>('button:has(> .octicon-unfold)');
	if (unfoldButton) {
		unfoldButton.click();
		target.scrollIntoView();
	}
}

async function init(signal: AbortSignal): Promise<void> {
	await expandLinkedComment();
	globalThis.addEventListener('hashchange', expandLinkedComment, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasComments,
	],
	init,
});

/*

Test URLs

Legacy timeline UI, hidden comment: https://github.com/refined-github/sandbox/pull/47#issuecomment-1257136170
Legacy timeline UI, hidden review comment: https://github.com/refined-github/sandbox/pull/47#discussion_r979366049
New Issues UI, hidden comment: https://github.com/refined-github/sandbox/issues/131#issuecomment-4297544223

*/
