import React from 'dom-chef';
import InfoIcon from 'octicons-plain-react/Info';
import * as pageDetect from 'github-url-detection';

import createBanner from '../github-helpers/banner.js';
import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import {isAnyRefinedGitHubRepo} from '../github-helpers/index.js';
import {getNoticeText, wasClosedLongAgo} from './netiquette.js';
import TimelineItem from '../github-helpers/timeline-item.js';

function addConversationBanner(newCommentBox: HTMLElement): void {
	const button = (
		<button
			type="button"
			className="btn-link"
			onClick={() => {
				newCommentBox.hidden = false;

				// Unlink this button
				button.replaceWith(button.firstChild!);

				// Keep the banner, make it visible
				banner.firstElementChild!.classList.replace('rgh-bg-none', 'flash-error');

				window.scrollBy({
					top: 100,
					behavior: 'smooth',
				});
			}}
		>comment
		</button>
	);
	const banner = (
		<TimelineItem>
			{createBanner({
				classes: ['rgh-bg-none'],
				icon: <InfoIcon className="mr-1"/>,
				text: <>{getNoticeText()} If you want to say something helpful, you can leave a {button}. <strong>Do not</strong> report issues here.</>,
			})}
		</TimelineItem>
	);
	newCommentBox.before(banner);
	newCommentBox.hidden = true;
}

function init(signal: AbortSignal): void | false {
	// Do not move to `asLongAs` because those conditions are run before `isConversation`
	if (!wasClosedLongAgo()) {
		return false;
	}

	observe('#issuecomment-new:has(file-attachment)', addConversationBanner, {signal});
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
