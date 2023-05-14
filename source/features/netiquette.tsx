import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import toMilliseconds from '@sindresorhus/to-milliseconds';
import select from 'select-dom';
import twas from 'twas';
import {InfoIcon} from '@primer/octicons-react';

import createBanner from '../github-helpers/banner.js';
import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import {buildRepoURL, isAnyRefinedGitHubRepo} from '../github-helpers/index.js';
import {closedOrMergedMarkerSelector, getLastCloseEvent} from './jump-to-conversation-close-event.js';

const isClosedOrMerged = (): boolean => select.exists(closedOrMergedMarkerSelector);

/** Returns milliseconds passed since `date` */
function timeAgo(date: Date): number {
	return Date.now() - date.getTime();
}

function getCloseDate(): Date {
	const datetime = select('relative-time', getLastCloseEvent())!.getAttribute('datetime')!;
	console.assert(datetime, 'Datetime attribute missing from relative-time');
	return new Date(datetime);
}

const threeMonths = toMilliseconds({days: 90});

export function shouldDisplayNotice(): boolean {
	if (!isClosedOrMerged()) {
		return false;
	}

	const closingDate = getCloseDate();
	return timeAgo(closingDate) > threeMonths;
}

export function getNoticeText(): JSX.Element {
	const closingDate = getCloseDate();
	const ago = <strong>{twas(closingDate.getTime())}</strong>;
	const newIssue = <a href={buildRepoURL('issues/new/choose')}>new issue</a>;
	return (
		<>
			This {pageDetect.isPR() ? 'PR' : 'issue'} was closed {ago}. Please consider opening a {newIssue} instead of leaving a comment here.
		</>
	);
}

function addConversationBanner(newCommentField: HTMLElement): void {
	newCommentField.before(
		createBanner({
			icon: <InfoIcon className="m-0"/>,
			classes: 'p-2 my-2 mx-md-2 text-small color-fg-muted border-0'.split(' '),
			text: getNoticeText(),
		}),
	);
}

function init(signal: AbortSignal): void | false {
	// Do not move to `asLongAs` because those conditions are run before `isConversation`
	if (!shouldDisplayNotice()) {
		return false;
	}

	observe('#issuecomment-new file-attachment', addConversationBanner, {signal});
}

void features.add(import.meta.url, {
	exclude: [
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

- Old issue: https://github.com/facebook/react/issues/227
- Old PR: https://github.com/facebook/react/pull/209

*/
