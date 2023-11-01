import './highlight-collaborators-and-own-conversations.css';
import {CachedFunction} from 'webext-storage-cache';
import {$$} from 'select-dom';
import domLoaded from 'dom-loaded';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import fetchDom from '../helpers/fetch-dom.js';
import {buildRepoURL, cacheByRepo, getUsername} from '../github-helpers/index.js';

const collaborators = new CachedFunction('repo-collaborators', {
	async updater(): Promise<string[]> {
		const dom = await fetchDom(buildRepoURL('issues/show_menu_content?partial=issues/filters/authors_content'));
		return $$('.SelectMenu-item img[alt]', dom)
			.map(avatar => avatar.alt.slice(1));
	},
	maxAge: {days: 1},
	staleWhileRevalidate: {days: 20},
	cacheKey: cacheByRepo,
});

async function highlightCollaborators(): Promise<void> {
	const list = await collaborators.get();
	await domLoaded;
	for (const author of $$('.js-issue-row [data-hovercard-type="user"]')) {
		if (list.includes(author.textContent.trim())) {
			author.classList.add('rgh-collaborator');
		}
	}
}

function highlightSelf(): void {
	// "Opened by {user}" and "Created by {user}"
	for (const author of $$(`.opened-by a[title$="ed by ${CSS.escape(getUsername()!)}"]`)) {
		author.classList.add('rgh-collaborator');
		author.style.fontStyle = 'italic';
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoIssueOrPRList,
	],
	exclude: [
		pageDetect.isBlank,
	],
	deduplicate: 'has-rgh-inner',
	init: highlightCollaborators,
}, {
	include: [
		pageDetect.isIssueOrPRList,
	],
	awaitDomReady: true, // Small pages, could be improved though
	init: highlightSelf,
});
