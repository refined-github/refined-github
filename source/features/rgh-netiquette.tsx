import React from 'dom-chef';
import InfoIcon from 'octicons-plain-react/Info';
import * as pageDetect from 'github-url-detection';

import createBanner from '../github-helpers/banner.js';
import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import {isAnyRefinedGitHubRepo} from '../github-helpers/index.js';
import {getResolvedText, wasClosedLongAgo} from './netiquette.js';
import {TimelineItem, TimelineItemOld} from '../github-helpers/timeline-item.js';

function addConversationBanner(newCommentBox: HTMLElement): void {
	// Check inside the observer because React views load after dom-ready
	if (!wasClosedLongAgo()) {
		features.unload(import.meta.url);
		return;
	}

	const button = (
		<button
			type="button"
			className="btn-link"
			onClick={() => {
				newCommentBox.hidden = false;

				// Unlink this button
				button.replaceWith(button.firstChild!);

				// Keep the banner, make it visible
				// eslint-disable-next-line ts/no-use-before-define -- Cyclic
				banner.firstElementChild!.classList.replace('rgh-bg-none', 'flash-error');

				window.scrollBy({
					top: 100,
					behavior: 'smooth',
				});
			}}
		>comment
		</button>
	);

	const isReactView = newCommentBox.matches('[data-testid="comment-composer"]');
	const Wrapper = isReactView ? TimelineItem : TimelineItemOld;
	const banner = (
		<Wrapper>
			{createBanner({
				classes: ['rgh-bg-none'],
				icon: <InfoIcon className="mr-1" />,
				text: <>{getResolvedText()} If you want to say something helpful, you can leave a {button}. <strong>Do not</strong> report issues here.</>,
			})}
		</Wrapper>
	);
	newCommentBox.before(banner);
	newCommentBox.hidden = true;
}

function init(signal: AbortSignal): void | false {
	observe([
		'#issuecomment-new:has(file-attachment)',
		'[data-testid="comment-composer"]',
	], addConversationBanner, {signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		isAnyRefinedGitHubRepo,
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
