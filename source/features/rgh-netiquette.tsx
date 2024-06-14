import React from 'dom-chef';
import InfoIcon from 'octicons-plain-react/Info';
import * as pageDetect from 'github-url-detection';

import createBanner from '../github-helpers/banner.js';
import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import {isAnyRefinedGitHubRepo} from '../github-helpers/index.js';
import {getNoticeText, wasClosedLongAgo} from './netiquette.js';
import TimelineItem from '../github-helpers/timeline-item.js';

function hasNoCommentsRequest(): boolean {
	const firstComment = document.querySelector<HTMLDivElement>('.js-comment-body');
	if (!firstComment) {
		return false;
	}

	/**
	 * This regex matches:
	 * - do not/don't comment
	 * - don't leave comments
	 * - don't leave "me too" comments
	 **/
	const regex = /(don('?)t|do not) (leave ("[^"]+" )?)?comment(s?)/i;

	return regex.test(firstComment.textContent?.trim());
}

function addNoCommentsRequestBanner(newCommentBox: HTMLElement): void {
	const button = (
		<button
			type="button"
			className="btn-link"
			onClick={() => {
				banner.remove();
				newCommentBox.hidden = false;
			}}
		>
			comment
		</button>
	);

	const banner = (
		<TimelineItem>
			{createBanner({
				classes: ['rgh-bg-none'],
				icon: <InfoIcon className="mr-1"/>,
				text: (
					<>
						This {pageDetect.isPR() ? 'PR' : 'issue'}&apos;s author asked to <strong>not leave comments here</strong>. However, if you think you have something helpful to say, you may leave a {button}.
					</>
				),
			})}
		</TimelineItem>
	);

	newCommentBox.before(banner);
	newCommentBox.hidden = true;
}

function addClosedLongAgoBanner(newCommentBox: HTMLElement): void {
	const button = (
		<button
			type="button"
			className="btn-link"
			onClick={() => {
				banner.remove();
				newCommentBox.hidden = false;
			}}
		>
			comment
		</button>
	);

	const banner = (
		<TimelineItem>
			{createBanner({
				classes: ['rgh-bg-none'],
				icon: <InfoIcon className="mr-1"/>,
				text: (
					<>
						{getNoticeText()} If you want to say something helpful, you can leave a {button}. <strong>Do not</strong> report issues here.
					</>
				),
			})}
		</TimelineItem>
	);

	newCommentBox.before(banner);
	newCommentBox.hidden = true;
}

function init(signal: AbortSignal): void | false {
	if (hasNoCommentsRequest()) {
		// Do not move to `asLongAs` because those conditions are run before `isConversation`
		observe('#issuecomment-new file-attachment', addNoCommentsRequestBanner, {signal});
	} else if (wasClosedLongAgo()) {
		// Do not move to `asLongAs` because those conditions are run before `isConversation`
		observe('#issuecomment-new file-attachment', addClosedLongAgoBanner, {signal});
	} else {
		return false;
	}
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

- Old issue: https://github.com/refined-github/refined-github/issues/1
- Old PR: https://github.com/refined-github/refined-github/pull/159

- https://github.com/refined-github/refined-github/issues/7404
- https://github.com/refined-github/refined-github/issues/7000
- https://github.com/refined-github/refined-github/issues/6000

*/
