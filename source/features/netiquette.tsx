import React from 'dom-chef';
import FlameIcon from 'octicons-plain-react/Flame';
import * as pageDetect from 'github-url-detection';
import toMilliseconds from '@sindresorhus/to-milliseconds';
import {expectElement as $, $$, elementExists} from 'select-dom';
import twas from 'twas';
import InfoIcon from 'octicons-plain-react/Info';
import GitPullRequestDraftIcon from 'octicons-plain-react/GitPullRequestDraft';

import createBanner from '../github-helpers/banner.js';
import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import {buildRepoURL, isAnyRefinedGitHubRepo, isOwnConversation} from '../github-helpers/index.js';
import {closedOrMergedMarkerSelector, getLastCloseEvent} from './jump-to-conversation-close-event.js';

import {newCommentField} from '../github-helpers/selectors.js';
import {userIsModerator} from '../github-helpers/get-user-permission.js';

const isClosedOrMerged = (): boolean => elementExists(closedOrMergedMarkerSelector);

/** Returns milliseconds passed since `date` */
function timeAgo(date: Date): number {
	return Date.now() - date.getTime();
}

function getCloseDate(): Date {
	const datetime = $('relative-time', getLastCloseEvent()).getAttribute('datetime')!;
	console.assert(datetime, 'Datetime attribute missing from relative-time');
	return new Date(datetime);
}

function isPopular(): boolean {
	return $$('.timeline-comment').length > 30 || $$('.participant-avatar').length > 10;
}

const threeMonths = toMilliseconds({days: 90});

export function wasClosedLongAgo(): boolean {
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
	newCommentField.prepend(
		createBanner({
			icon: <InfoIcon className="m-0" />,
			classes: 'p-2 m-2 text-small color-fg-muted border-0'.split(' '),
			text: getNoticeText(),
		}),
	);
}

function addPopularBanner(newCommentField: HTMLElement): void {
	newCommentField.prepend(
		createBanner({
			icon: <FlameIcon className="m-0" />,
			classes: 'p-2 m-2 text-small color-fg-muted border-0'.split(' '),
			text: 'This issue is highly active. Reconsider commenting unless you have read all the comments and have something to add.',
		}),
	);
}

function addDraftBanner(newCommentField: HTMLElement): void {
	newCommentField.prepend(
		createBanner({
			icon: <GitPullRequestDraftIcon className="m-0" />,
			classes: 'p-2 my-2 mx-md-2 text-small color-fg-muted border-0'.split(' '),
			text: <>This is a <strong>draft PR</strong>, it might not be ready for review.</>,
		}),
	);
}

function initDraft(signal: AbortSignal): void {
	observe(newCommentField, addDraftBanner, {signal});
}

async function initBanner(signal: AbortSignal): Promise<void | false> {
	// Do not move to `asLongAs` because those conditions are run before `isConversation`
	if (wasClosedLongAgo()) {
		observe(newCommentField, addConversationBanner, {signal});
	} else if (isPopular() && !(await userIsModerator())) {
		observe(newCommentField, addPopularBanner, {signal});
	} else {
		return false;
	}
}

function makeFieldKinder(field: HTMLParagraphElement): void {
	if (field.textContent.trim() === 'Add your comment here...') {
		// Regular issue/PR comment field, or single review comments
		// https://github.com/refined-github/refined-github/pull/6991
		field.textContent = 'Add your comment here, be kind';
	} else if (field.textContent.trim() === 'Leave a comment') {
		// Main review comment field
		// https://github.com/refined-github/refined-github/pull/6991/files
		field.textContent = 'Leave a comment, be kind';
	} else {
		throw new Error(`Unexpected placeholder text: ${field.textContent}`);
	}
}

function makeReactFieldKinder(field: HTMLTextAreaElement): void {
	field.placeholder = 'Add your comment here, be kind';
}

function initKindness(signal: AbortSignal): void {
	observe('p.CommentBox-placeholder', makeFieldKinder, {signal});
	observe('textarea[placeholder="Use Markdown to format your comment"]', makeReactFieldKinder, {signal});
}

void features.add(import.meta.url, {
	exclude: [
		isAnyRefinedGitHubRepo,
	],
	include: [
		pageDetect.isConversation,
	],
	awaitDomReady: true, // We're specifically looking for the last event
	init: initBanner,
}, {
	include: [
		pageDetect.isDraftPR,
	],
	exclude: [
		isOwnConversation,
	],
	awaitDomReady: true,
	init: initDraft,
}, {
	include: [
		pageDetect.hasComments,
	],
	init: initKindness,
});

/*

Test URLs

- Old issue: https://togithub.com/facebook/react/issues/227
- Old PR: https://togithub.com/facebook/react/pull/209
- Popular issue: https://togithub.com/facebook/react/issues/13991
- Draft PR: https://github.com/refined-github/sandbox/pull/7

*/
