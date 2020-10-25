import './highlight-collaborators-and-own-conversations.css';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import domLoaded from 'dom-loaded';
import * as pageDetect from 'github-url-detection';

import features from '.';
import fetchDom from '../helpers/fetch-dom';
import {getRepoURL, getUsername} from '../github-helpers';

// eslint-disable-next-line import/prefer-default-export
export const getCollaborators = cache.function(async (): Promise<string[]> => {
	const dom = await fetchDom(getRepoURL() + '/issues/show_menu_content?partial=issues/filters/authors_content');
	return select
		.all<HTMLImageElement>('.SelectMenu-item [alt]', dom)
		.map(avatar => avatar.alt.slice(1));
}, {
	maxAge: {days: 1},
	staleWhileRevalidate: {days: 20},
	cacheKey: () => 'repo-collaborators:' + getRepoURL()
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
	for (const author of select.all(`.opened-by a[title$="ed by ${CSS.escape(getUsername())}"]`)) {
		author.classList.add('rgh-collaborator');
		author.style.fontStyle = 'italic';
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isRepoConversationList
	],
	exclude: [
		() => select.exists('.blankslate')
	],
	awaitDomReady: false,
	init: highlightCollaborators
}, {
	include: [
		pageDetect.isConversationList
	],
	init: highlightSelf
});
