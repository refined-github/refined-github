import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import toMilliseconds from '@sindresorhus/to-milliseconds';
import select from 'select-dom';
import twas from 'twas';
import {InfoIcon} from '@primer/octicons-react';

import createBanner from '../github-helpers/banner';
import features from '../feature-manager';
import observe from '../helpers/selector-observer';
import {buildRepoURL} from '../github-helpers';
import {closedOrMergedMarkerSelector, getLastCloseEvent} from './jump-to-conversation-close-event';

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

function addConversationBanner(newCommentField: HTMLElement): void {
	if (!isClosedOrMerged()) {
		return;
	}

	const closingDate = getCloseDate();
	if (timeAgo(closingDate) < threeMonths) {
		return;
	}

	const ago = <strong>{twas(closingDate.getTime())}</strong>;
	const newIssue = <a href={buildRepoURL('issues/new/choose')}>new issue</a>;

	newCommentField.before(
		createBanner({
			classes: 'p-2 m-2 text-small color-fg-muted border-0'.split(' '),
			text: (
				<div className="d-flex flex-items-center gap-2">
					<InfoIcon className="m-0"/>
					{/* TODO: Drop any after https://github.com/frenic/csstype/issues/177 */}
					<span style={{textWrap: 'balance'} as any}>
						This {pageDetect.isPR() ? 'PR' : 'issue'} was closed {ago}. Please consider opening a {newIssue} instead of leaving a comment here.
					</span>
				</div>
			),
		}),
	);
}

function init(signal: AbortSignal): void {
	observe('#issue-comment-box file-attachment', addConversationBanner, {signal});
}

void features.add(import.meta.url, {
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
