import select from 'select-dom';
import onetime from 'onetime';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';

import features from '.';
import onConversationHeaderUpdate from '../github-events/on-conversation-header-update';
import {linkifiedURLClass, linkifyURLs, linkifyIssues} from '../github-helpers/dom-formatters';
import {selectors} from './show-whitespace';

function initTitle(): void {
	for (const title of select.all('.js-issue-title')) {
		if (!select.exists('a', title)) {
			linkifyIssues(title);
		}
	}
}

function init(): void {
	observe(`:is(${selectors}):not(.${linkifiedURLClass})`, {
		add(wrappers) {
			linkifyURLs(wrappers);

			// Linkify issue refs in comments
			for (const element of select.all('.pl-c', wrappers)) {
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
