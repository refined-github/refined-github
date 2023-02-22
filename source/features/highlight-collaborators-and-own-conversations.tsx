import './highlight-collaborators-and-own-conversations.css';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import domLoaded from 'dom-loaded';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import fetchDom from '../helpers/fetch-dom';
import {buildRepoURL, cacheByRepo, getUsername} from '../github-helpers';

const getCollaborators = cache.function('repo-collaborators', async (): Promise<string[]> => {
	const dom = await fetchDom(buildRepoURL('issues/show_menu_content?partial=issues/filters/authors_content'));
	return select
		.all('.SelectMenu-item img[alt]', dom)
		.map(avatar => avatar.alt.slice(1));
}, {
	maxAge: {days: 1},
	staleWhileRevalidate: {days: 20},
	cacheKey: cacheByRepo,
});

async function highlightCollaborators(): Promise<void> {
	const collaborators = await getCollaborators();
	await domLoaded;
	for (const author of select.all('.js-issue-row [data-hovercard-type="user"]')) {
		if (collaborators.includes(author.textContent!.trim())) {
			author.classList.add('rgh-collaborator');
		}
	}
}

function highlightSelf(): void {
	// "Opened by {user}" and "Created by {user}"
	for (const author of select.all(`.opened-by a[title$="ed by ${CSS.escape(getUsername()!)}"]`)) {
		author.classList.add('rgh-collaborator');
		author.style.fontStyle = 'italic';
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoIssueOrPRList,
	],
	exclude: [
		() => select.exists('.blankslate'),
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
