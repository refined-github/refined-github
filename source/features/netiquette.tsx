import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import toMilliseconds from '@sindresorhus/to-milliseconds';
import select from 'select-dom';
import twas from 'twas';

import {CSSProperties} from 'react';

import createBanner from '../github-helpers/banner';
import features from '../feature-manager';
import observe from '../helpers/selector-observer';
import {wrap, assertNodeContent} from '../helpers/dom-utils';
import {buildRepoURL} from '../github-helpers';
import {getLastCloseEvent} from './jump-to-conversation-close-event';

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

function getCloseDate(): Date {
	const datetime = select('relative-time', getLastCloseEvent())!.getAttribute('datetime')!;
	console.assert(datetime, 'Datetime attribute missing from relative-time');
	return new Date(datetime);
}

const threeMonths = toMilliseconds({days: 90});

function addConversationBanner(guidelinesInfoIcon: SVGElement): void {
	assertNodeContent(guidelinesInfoIcon.nextSibling, /contributions/);
	if (!isClosedOrMerged()) {
		return;
	}

	const closingDate = getCloseDate();
	if (timeAgo(closingDate) < threeMonths) {
		return;
	}

	const age = twas(closingDate.getTime());

	guidelinesInfoIcon.parentElement!.replaceChildren(
		<div className="d-flex flex-items-center gap-1">
			{guidelinesInfoIcon}
			<span style={{textWrap: 'balance'} as CSSProperties}>This issue was closed {age}. Please consider opening a <a href={buildRepoURL('issues/new/choose')}>new issue</a> instead of leaving a comment here.</span>
		</div>,
	);

	wrap(
		guidelinesInfoIcon.closest('div[data-view-component="true"]')!,
		<div className="flash p-0 mt-3"/>,
	);
}

function init(signal: AbortSignal): void {
	observe('#issuecomment-new svg.octicon-info', addConversationBanner, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isConversation,
	],
	awaitDomReady: true, // We're specifically looking for the last event
	init,
});

console.log(1);
