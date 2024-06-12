import React from 'react';
import * as pageDetect from 'github-url-detection';
import elementReady from 'element-ready';
import {expectElement} from 'select-dom';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import {assertNodeContent} from '../helpers/dom-utils.js';
import {paginationButtonSelector} from '../github-helpers/selectors.js';

const hiddenCommentsForm = '#js-progressive-timeline-item-container';

function addIndicator(headerCommentCount: HTMLSpanElement): void {
	assertNodeContent(headerCommentCount, /^\d+ comments$/);
	const loadMoreButton = expectElement(paginationButtonSelector);
	assertNodeContent(loadMoreButton, /^\d+ hidden items$/);
	const spacer = new Text(' • ');
	const link = (
		<a
			className="Link--muted"
			href={hiddenCommentsForm}
			onClick={() => {
			// The count will be outdated after the first expansion. We can remove it and disable the feature
				spacer.remove();
				link.remove();
				features.unload(import.meta.url);
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
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isIssue,
	],
	init,
});

