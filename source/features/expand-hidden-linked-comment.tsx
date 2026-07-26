import * as pageDetect from 'github-url-detection';

import {$optional, closestElementOptional} from 'select-dom';

import features from '../feature-manager.js';
import {waitForElement} from '../helpers/selector-observer.js';

async function expandLinkedComment(signal: AbortSignal): Promise<void> {
	const id = location.hash;
	if (!id) {
		return;
	}

	// `elementReady` resolves at "dom ready", but comments are loaded after that, so `waitForElement` is needed instead
	const target = await waitForElement(id, {
		signal: AbortSignal.any([signal, AbortSignal.timeout(5000)]),
	});
	if (!target) {
		return;
	}

	// TODO [2027-01-01]: Old timeline UI, drop
	// `.minimized-comment > details` avoids matching unrelated `<details>` dropdowns (e.g. the "..." menu, reactions popover)
	const details = $optional('.minimized-comment > details', target);
	if (details) {
		details.open = true;
		return;
	}

	// React-based UI
	const unfoldButton = closestElementOptional('[data-testid="comment-header"]', target)
		?.querySelector<HTMLButtonElement>('button:has(> .octicon-unfold)');
	if (unfoldButton) {
		unfoldButton.click();
	}
}

async function init(signal: AbortSignal): Promise<void> {
	await expandLinkedComment(signal);
	globalThis.addEventListener('hashchange', () => {
		void expandLinkedComment(signal);
	}, {signal});
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
Hidden issue comment: https://github.com/refined-github/sandbox/issues/131#issuecomment-4297544223

*/
