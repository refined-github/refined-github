import React from 'dom-chef';
import select from 'select-dom';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils';
import features from '.';

function addToConversation(discussionHeader: HTMLElement): void {
	discussionHeader.classList.add('rgh-jump-to-conversation-close-event');
	// Avoid native `title` by disabling pointer events, we have our own `aria-label`. We can't drop the `title` attribute because some features depend on it.
	discussionHeader.style.pointerEvents = 'none';

	const lastCloseEvent = select.last('.TimelineItem-badge :is(.octicon-issue-closed, .octicon-git-merge, .octicon-git-pull-request-closed, .octicon-skip)')!.closest('.TimelineItem')!;
	wrap(discussionHeader,
		<a
			aria-label="Scroll to most recent close event"
			className="tooltipped tooltipped-s"
			href={'#' + lastCloseEvent.id}
		/>,
	);
}

function init(): Deinit {
	return observe('#partial-discussion-header :is([title="Status: Closed"], [title="Status: Merged"], [title="Status: Closed as not planned"]):not(.rgh-jump-to-conversation-close-event)', {
		constructor: HTMLElement,
		add: addToConversation,
	});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isClosedConversation,
	],
	deduplicate: 'has-rgh-inner',
	init,
});

/*
## Test URLs
Closed Issue: https://github.com/refined-github/sandbox/issues/2
Closed Issue (Not Planned): https://github.com/refined-github/sandbox/issues/24
Merged PR: https://github.com/refined-github/sandbox/pull/23
Closed PR: https://github.com/refined-github/sandbox/pull/22
*/
