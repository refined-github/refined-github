import * as pageDetect from 'github-url-detection';
import {mount, unmount} from 'svelte';

import features from '../feature-manager.js';
import isConversationLocked from '../github-helpers/is-conversation-locked.js';
import observe from '../helpers/selector-observer.js';
import singleton from '../helpers/singleton.js';
import {featureClass as jumpToCloseEventClass} from './jump-to-conversation-close-event.js';
import LockedIndicator from './locked-issue.svelte';

function addLock(stateLabel: HTMLElement): () => void {
	const isWrapped = stateLabel.parentElement!.classList.contains(jumpToCloseEventClass);
	const container = isWrapped ? stateLabel.parentElement! : stateLabel;

	container.parentElement!.style.height = 'auto';
	container.parentElement!.classList.add('d-flex', 'gap-2');
	const app = mount(LockedIndicator, {target: container.parentElement!});
	return () => {
		void unmount(app);
	};
}

async function init(signal: AbortSignal): Promise<void | false> {
	// Observe separately due to singleton nature. PRs have two headers and therefore two widgets
	// Issues, PR normal header
	observe(
		[
			'div[data-testid^="issue-metadata"] span[class^="prc-StateLabel"]',
			'div[class*="PageHeader-Description"] span[class^="prc-StateLabel"]',
		],
		singleton(addLock),
		{signal},
	);

	// PR sticky header
	observe('div[class*="StickyPullRequestHeader"] span[class^="prc-StateLabel"]', singleton(addLock), {signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		pageDetect.isConversation,
		isConversationLocked,
	],
	requiresToken: true,
	init,
});

/*

## Test URLs

- Locked issue: https://github.com/refined-github/sandbox/issues/74
- Locked PR: https://github.com/refined-github/sandbox/pull/48

*/
