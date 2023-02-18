import React from 'dom-chef';
import {css} from 'code-tag';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils';
import features from '../feature-manager';
import observe from '../helpers/selector-observer';

function addToConversation(discussionHeader: HTMLElement): void {
	// Avoid native `title` by disabling pointer events, we have our own `aria-label`. We can't drop the `title` attribute because some features depend on it.
	discussionHeader.style.pointerEvents = 'none';

	const lastCloseEvent = select.last(`
		.TimelineItem-badge :is(
			.octicon-issue-closed,
			.octicon-git-merge,
			.octicon-git-pull-request-closed,
			.octicon-skip
		)
	`)!.closest('.TimelineItem')!;
	wrap(discussionHeader,
		<a
			aria-label="Scroll to most recent close event"
			className="tooltipped tooltipped-s"
			href={'#' + lastCloseEvent.id}
		/>,
	);
}

function init(signal: AbortSignal): void {
	observe(
		css`
			#partial-discussion-header :is(
				[title^="Status: Closed"],
				[title^="Status: Merged"]
			)
		`,
		addToConversation,
		{signal},
	);
}

void features.add(import.meta.url, {
	asLongAs: [
		pageDetect.isConversation,
	],
	include: [
		pageDetect.isClosedIssue,
		pageDetect.isClosedPR,
	],
	awaitDomReady: true, // we're specifically looking for the last event
	init,
});

/*
## Test URLs
Closed Issue: https://github.com/refined-github/sandbox/issues/2
Closed Issue (Not Planned): https://github.com/refined-github/sandbox/issues/24
Merged PR: https://github.com/refined-github/sandbox/pull/23
Closed PR: https://github.com/refined-github/sandbox/pull/22
*/
