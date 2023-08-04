import React from 'dom-chef';
import {InfoIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import createBanner from '../github-helpers/banner.js';
import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import {isAnyRefinedGitHubRepo} from '../github-helpers/index.js';
import {getNoticeText, shouldDisplayNotice} from './netiquette.js';
import TimelineItem from '../github-helpers/timeline-item.js';
import {isHasSelectorSupported} from '../helpers/select-has.js';

function addConversationBanner(newCommentBox: HTMLElement): void {
	const button = (
		<button
			type="button"
			className="btn-link"
			onClick={() => {
				banner.remove();
				newCommentBox.hidden = false;
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
	if (!shouldDisplayNotice()) {
		return false;
	}

	observe('#issuecomment-new:has(file-attachment)', addConversationBanner, {signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		isAnyRefinedGitHubRepo,
		isHasSelectorSupported,
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
