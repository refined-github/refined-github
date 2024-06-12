import React from 'react';
import * as pageDetect from 'github-url-detection';
import elementReady from 'element-ready';
import {$, expectElement} from 'select-dom';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import {assertNodeContent} from '../helpers/dom-utils.js';
import {paginationButtonSelector} from '../github-helpers/selectors.js';
import {isMac, scrollIntoViewIfNeeded} from '../github-helpers/index.js';

const hiddenCommentsForm = '#js-progressive-timeline-item-container';

// Don't use `data-hotkey` because it always prevents default
function scrollOnSearch(event: KeyboardEvent): void {
	if (
		(isMac ? event.metaKey : event.ctrlKey)
		&& !event.shiftKey
		&& !event.altKey
		&& event.key === 'f'
	) {
		const collapsedEvents = $(paginationButtonSelector);
		if (collapsedEvents) {
			scrollIntoViewIfNeeded(collapsedEvents);
		}
	}
}

function addIndicator(headerCommentCount: HTMLSpanElement): void {
	const loadMoreButton = expectElement(paginationButtonSelector);
	assertNodeContent(headerCommentCount, /^\d+ comments$/);
	assertNodeContent(loadMoreButton, /^\d+ hidden items$/);
	const spacer = new Text(' • ');
	const link = (
		<a
			className="Link--muted"
			href={hiddenCommentsForm}
			onClick={() => {
				// The count will be outdated after the first expansion. We can remove it until the next header update by GitHub.
				spacer.remove();
				link.remove();
			}}
		>
			{loadMoreButton.textContent}
		</a>
	);
	headerCommentCount.append(spacer);
	headerCommentCount.after(link,
	);
}

async function init(signal: AbortSignal): Promise<void> {
	if (await elementReady(`${hiddenCommentsForm} ${paginationButtonSelector}`)) {
		observe('.gh-header-meta relative-time + span', addIndicator, {signal});
		window.addEventListener('keydown', scrollOnSearch, {signal});
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isIssue,
	],
	init,
});

/*

Test URLs

https://togithub.com/prettier/prettier/issues/7475

*/
