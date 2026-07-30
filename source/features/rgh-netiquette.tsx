import * as pageDetect from 'github-url-detection';
import {mount} from 'svelte';

import features from '../feature-manager.js';
import {isRefinedGitHubRepo} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';
import {getCloseDate, wasLongAgo} from '../github-helpers/netiquette.js';
import RghNetiquetteBanner from './rgh-netiquette.svelte';

async function addConversationBanner(newCommentBox: HTMLElement): Promise<void> {
	// Check inside the observer because React views load after dom-ready
	const closingDate = await getCloseDate();
	if (!closingDate || !wasLongAgo(closingDate)) {
		features.unload(import.meta.url);
		return;
	}

	mount(RghNetiquetteBanner, {
		target: newCommentBox.parentElement!,
		anchor: newCommentBox,
		props: {
			closingDate,
			onReveal() {
				newCommentBox.hidden = false;
				newCommentBox.scrollIntoView({behavior: 'smooth'});
			},
		},
	});
	newCommentBox.hidden = true;
}

function init(signal: AbortSignal): void | false {
	observe(
		[
			'#issuecomment-new:has(file-attachment)',
			'[data-testid="comment-composer"]',
		],
		addConversationBanner,
		{signal},
	);
}

void features.add(import.meta.url, {
	asLongAs: [
		isRefinedGitHubRepo,
	],
	include: [
		pageDetect.isConversation,
	],
	awaitDomReady: true, // The comment field is at the end
	init,
});

/*

Test URLs

- Old issue: https://github.com/refined-github/refined-github/issues/3076
- Old PR: https://github.com/refined-github/refined-github/pull/159

*/
