import select from 'select-dom';
import onetime from 'onetime';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {codeElementsSelectors} from './show-whitespace';
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
	observe(`:is(${codeElementsSelectors}):not(.${linkifiedURLClass})`, {
		add(wrappers) {
			linkifyURLs(wrappers);

			// Linkify issue refs in comments
			for (const element of select.all('.pl-c', wrappers)) {
				linkifyIssues(element);
			}

			// Mark code block as touched to avoid linkifying twice https://github.com/refined-github/refined-github/pull/4710#discussion_r694896008
			wrappers.classList.add(linkifiedURLClass);
		},
	});
}

void features.add(import.meta.url, {
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
