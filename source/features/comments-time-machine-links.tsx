import React from 'dom-chef';
import select from 'select-dom';
import ClockIcon from 'octicon/clock.svg';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';
import {getRepoURL} from '../libs/utils';
import {appendBefore} from '../libs/dom-utils';

function addInlineLinks(comment: HTMLElement, timestamp: string): void {
	const links = select.all<HTMLAnchorElement>(`
		[href^="${location.origin}"][href*="/blob/"]:not(.rgh-linkified-code),
		[href^="${location.origin}"][href*="/tree/"]:not(.rgh-linkified-code)
	`, comment);

	for (const link of links) {
		const linkParts = link.pathname.split('/');
		// Skip permalinks
		if (/^[\da-f]{40}$/.test(linkParts[4])) {
			continue;
		}

		linkParts[4] = `HEAD@{${timestamp}}`; // Change git ref
		link.after(
			' ',
			<a
				href={linkParts.join('/') + link.hash}
				className="muted-link tooltipped tooltipped-n"
				aria-label="Visit as permalink"
			>
				<ClockIcon/>
			</a>
		);
	}
}

function addDropdownLink(comment: HTMLElement, timestamp: string): void {
	const dropdown = select('.show-more-popover', comment);

	// Comment-less reviews don't have a dropdown
	if (!dropdown) {
		return;
	}

	appendBefore(dropdown, '.dropdown-divider',
		<>
			<div className="dropdown-divider"/>
			<a
				href={`/${getRepoURL()}/tree/HEAD@{${timestamp}}`}
				className="dropdown-item btn-link"
				role="menuitem"
				title="Browse repository like it appeared on this day"
			>
				View repo at this time
			</a>
		</>
	);
}

function init(): void {
	// PR reviews' main content has nested `.timeline-comment`, but the deepest one doesn't have `relative-time`. These are filtered out with `:not([id^="pullrequestreview"])`
	const comments = select.all(`
		:not(.js-new-comment-form):not([id^="pullrequestreview"]) > .timeline-comment:not(.rgh-time-machine-links),
		.review-comment > .previewable-edit:not(.is-pending):not(.rgh-time-machine-links)
	`);

	for (const comment of comments) {
		const timestamp = select('relative-time', comment)!.attributes.datetime.value;

		addDropdownLink(comment, timestamp);
		addInlineLinks(comment, timestamp);
		comment.classList.add('rgh-time-machine-links');
	}
}

features.add({
	id: __filebasename,
	description: 'Adds links to browse the repository and linked files at the time of each comment.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/56450896-68076680-635b-11e9-8b24-ebd11cc4e655.png'
}, {
	include: [
		pageDetect.hasComments
	],
	init
});
