import select from 'select-dom';
import onetime from 'onetime';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';

import features from '.';
import onConversationHeaderUpdate from '../github-events/on-conversation-header-update';
import {linkifiedURLClass, linkifyURLs, linkifyIssues} from '../github-helpers/dom-formatters';

function initTitle(): void {
	for (const title of select.all('.js-issue-title')) {
		if (!select.exists('a', title)) {
			linkifyIssues(title);
		}
	}
}

function init(): void {
	const selectors = [
		'.js-blob-wrapper tr:not(.inline-comments)', // File blocks in pages like `isPRFiles`, `isSingleFile`
		'.blob-wrapper tr', // File blocks in blob URLs
		'.comment-body', // Markdown code blocks
	].map(selector => selector + `:not(.${linkifiedURLClass})`).join(',');

	observe(selectors, {
		add(wrappers) {
			// Linkify full URLs
			// `.blob-code-inner` in diffs
			// `pre` in GitHub comments
			for (const element of select.all('.blob-code-inner, pre', wrappers)) {
				linkifyURLs(element);
			}

			// Linkify issue refs in comments
			for (const element of select.all('span.pl-c', wrappers)) {
				linkifyIssues(element);
			}

			// Mark code block as touched
			wrappers.classList.add(linkifiedURLClass);
		},
	});
}

void features.add(__filebasename, {
	include: [
		pageDetect.hasCode,
	],
	exclude: [
		pageDetect.isGist,
	],
	init: onetime(init),
}, {
	include: [
		pageDetect.isPR,
		pageDetect.isIssue,
	],
	additionalListeners: [
		onConversationHeaderUpdate,
	],
	deduplicate: 'has-rgh-inner',
	init: initTitle,
});
