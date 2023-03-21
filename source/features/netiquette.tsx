import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import toMilliseconds from '@sindresorhus/to-milliseconds';
import select from 'select-dom';
import twas from 'twas';

import createBanner from '../github-helpers/banner';
import features from '../feature-manager';
import observe from '../helpers/selector-observer';
import { CSSProperties } from 'react';

const isClosedOrMerged = (): boolean => select.exists(`
	#partial-discussion-header :is(
		[title="Status: Closed"],
		[title="Status: Merged"]
	)
`);

/** Returns milliseconds passed since `date` */
function timeAgo(date: Date): number {
	return Date.now() - date.getTime();
}

function getConversationDate(): Date {
	const datetime = select('#partial-discussion-header relative-time')!.getAttribute('datetime')!;
	console.assert(datetime, 'Datetime attribute missing from relative-time');
	return new Date(datetime);
}

const threeMonths = toMilliseconds({days: 90});

function addConversationBanner(newCommentActions: HTMLElement): void {
	if (!isClosedOrMerged()) {
		return;
	}

	const closingDate = getConversationDate();
	console.log(closingDate, timeAgo(closingDate));
	if (timeAgo(closingDate) < threeMonths) {
		return;
	}


	const age = twas(closingDate.getTime());

	newCommentActions.parentElement!.prepend(
		createBanner({
			classes: ['flash-warn', 'p-3', 'mb-3'],
			url: 'https://github.com/refined-github/refined-github/issues/new/choose',
			buttonLabel: 'New issue',
			text: <span style={{textWrap: 'balance'} as CSSProperties}>This issue was closed {age}. Please consider opening a new issue instead of leaving a comment here.</span>,
		}),
	);
}

function init(signal: AbortSignal): void {
	observe('#partial-new-comment-form-actions', addConversationBanner, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isConversation,
	],
	awaitDomReady: true,
	init,
});

console.log(1);
