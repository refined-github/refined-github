import select from 'select-dom';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {getRepo} from '../github-helpers';
import {codeElementsSelector, linkifiedURLClass, linkifyURLs, linkifyIssues} from '../github-helpers/dom-formatters';
import onConversationHeaderUpdate from '../github-events/on-conversation-header-update';

function initTitle(): void {
	// If we are not in a repo, relative issue references won't make sense but `user`/`repo` needs to be set to avoid breaking errors in `linkify-issues`
	// https://github.com/refined-github/refined-github/issues/1305
	const currentRepo = getRepo() ?? {};

	for (const title of select.all('.js-issue-title')) {
		if (!select.exists('a', title)) {
			linkifyIssues(currentRepo, title);
		}
	}
}

function init(): Deinit {
	return observe(`:is(${codeElementsSelector}):not(.${linkifiedURLClass})`, {
		add(wrappers) {
			linkifyURLs(wrappers);

			// Linkify issue refs in comments
			const currentRepo = getRepo() ?? {};
			for (const element of select.all('.pl-c', wrappers)) {
				linkifyIssues(currentRepo, element);
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
	deduplicate: 'has-rgh-inner',
	init,
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
