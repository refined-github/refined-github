import React from 'dom-chef';
import {InfoIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import createBanner from '../github-helpers/banner';
import features from '../feature-manager';
import observe from '../helpers/selector-observer';
import {isAnyRefinedGitHubRepo} from '../github-helpers';
import {getNoticeText, shouldDisplayNotice} from './netiquette';
import TimelineItem from '../github-helpers/timeline-item';

function addConversationBanner(newCommentBox: HTMLElement): void {
	const button = (
		<button
			type="button"
			className="btn-link"
			onClick={() => {
				banner.remove();
				newCommentBox.hidden = false;
			}}
		>leave a comment
		</button>
	);
	const banner = (
		<TimelineItem>
			{createBanner({
				icon: <InfoIcon className="mr-1"/>,
				text: <>{getNoticeText()} If it must really be here, you can {button}.</>,
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
