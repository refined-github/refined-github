import React from 'dom-chef';
import select from 'select-dom';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils';
import features from '.';

function init(): Deinit {
	return observe('#partial-discussion-header :is([title="Status: Closed"], [title="Status: Merged"], [title="Status: Closed as not planned"]):not(.rgh-jump-to-conversation-close-event)', {
		constructor: HTMLSpanElement,
		add(messageContainer) {
			messageContainer.classList.add('rgh-jump-to-conversation-close-event');
			// Hide the native title
			messageContainer.style.pointerEvents = 'none';
			messageContainer.style.cursor = 'default';

			const lastCloseEvent = select.last('.TimelineItem-badge :is(.octicon-issue-closed, .octicon-git-merge, .octicon-git-pull-request-closed)')!.closest('.TimelineItem')!;
			wrap(messageContainer,
				<a
					aria-label="Jump to the last close event."
					className="tooltipped tooltipped-s"
					href={location.origin + location.pathname + '#' + lastCloseEvent.id}
				/>,
			);
		},
	});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isClosedPR,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
