import React from 'dom-chef';
import FlameIcon from 'octicons-plain-react/Flame';
import * as pageDetect from 'github-url-detection';
import toMilliseconds from '@sindresorhus/to-milliseconds';
import {$optional} from 'select-dom/strict.js';
import {countElements, elementExists} from 'select-dom';
import twas from 'twas';
import InfoIcon from 'octicons-plain-react/Info';
import GitPullRequestDraftIcon from 'octicons-plain-react/GitPullRequestDraft';

import createBanner from '../github-helpers/banner.js';
import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import {
	buildRepoURL,
	getConversationNumber,
	isAnyRefinedGitHubRepo,
	isOwnConversation,
} from '../github-helpers/index.js';
import {newCommentField} from '../github-helpers/selectors.js';
import {userIsModerator} from '../github-helpers/get-user-permission.js';
import looseParseInt from '../helpers/loose-parse-int.js';
import api from '../github-helpers/api.js';

export async function getCloseDate(): Promise<Date | undefined> {
	if (pageDetect.isOpenConversation()) {
		return;
	}

	const {closed_at: closedAt} = await api.v3(`issues/${getConversationNumber()!}`);
	if (!closedAt) {
		throw new TypeError('closed_at field is null');
	}

	return new Date(closedAt);
}

const threeMonths = toMilliseconds({days: 90});

export function wasLongAgo(date: Date): boolean {
	return (Date.now() - date.getTime()) > threeMonths;
}

function isPopular(): boolean {
	return (
		countElements('[data-testid="comment-header"]') > 30
		|| looseParseInt($optional('[aria-label*="other participants"]')?.ariaLabel) > 30
		|| elementExists('[data-testid="issue-timeline-load-more-count-front"]')
		// TODO: Drop in April 2025; old conversation style
		|| countElements('.timeline-comment') > 30
		|| countElements('.participant-avatar') > 10
	);
}

export function getResolvedText(closingDate: Date): JSX.Element {
	const ago = <strong>{twas(closingDate.getTime())}</strong>;
	const newIssue = <a href={buildRepoURL('issues/new/choose')}>new issue</a>;
	return (
		<>
			This {pageDetect.isPR() ? 'PR' : 'issue'} was closed {ago}. Please consider opening a {newIssue} instead of leaving a comment here.
		</>
	);
}

function addResolvedBanner(newCommentField: HTMLElement, closingDate: Date): void {
	if (elementExists('.rgh-resolved-banner')) {
		return;
	}

	const reactWrapper = newCommentField.closest('[class^="InlineAutocomplete"]');
	const banner = createBanner({
		icon: <InfoIcon className="m-0" />,
		classes: 'm-0 p-2 text-small color-fg-muted border-0 rounded-0 rgh-resolved-banner'.split(' '),
		text: getResolvedText(closingDate),
	});

	if (reactWrapper) {
		reactWrapper.parentElement?.classList.add('flex-column');
		reactWrapper.prepend(banner);
	} else {
		banner.classList.replace('rounded-0', 'm-2');
		newCommentField.prepend(banner);
	}
}

function addPopularBanner(newCommentField: HTMLElement): void {
	if (elementExists('.rgh-popular-banner')) {
		return;
	}

	const reactWrapper = newCommentField.closest('[class^="InlineAutocomplete"]');
	const banner = createBanner({
		icon: <FlameIcon className="m-0" />,
		classes: 'p-2 text-small color-fg-muted border-0 rounded-0 rgh-popular-banner'.split(' '),
		text: 'This issue is highly active. Reconsider commenting unless you have read all the comments and have something to add.',
	});

	if (reactWrapper) {
		reactWrapper.prepend(banner);
	} else {
		banner.classList.replace('rounded-0', 'm-2');
		newCommentField.prepend(banner);
	}
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

function initBanner(signal: AbortSignal): void {
	observe(newCommentField, async (field: HTMLElement) => {
		// Check inside the observer because React views load after dom-ready
		const closingDate = await getCloseDate();
		if (closingDate && wasLongAgo(closingDate)) {
			addResolvedBanner(field, closingDate);
		} else if (isPopular() && !(await userIsModerator())) {
			addPopularBanner(field);
		}
	}, {signal});
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
	observe([
		'textarea[placeholder="Use Markdown to format your comment"]', // On issues
		'textarea[placeholder="Leave a comment"]', // On single commits
	], makeReactFieldKinder, {signal});
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
