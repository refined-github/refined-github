import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import {mount} from 'svelte';

import features from '../feature-manager.js';
import {isRefinedGitHubRepo} from '../github-helpers/index.js';
import TimelineItem from '../github-helpers/timeline-item.js';
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

	const container = <TimelineItem />;
	newCommentBox.before(container);
	mount(RghNetiquetteBanner, {
		target: container,
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
	awaitDomReady: true, // We're specifically looking for the last event
	init,
});

/*

Test URLs

- Old issue: https://github.com/refined-github/refined-github/issues/3076
- Old PR: https://github.com/refined-github/refined-github/pull/159

*/
