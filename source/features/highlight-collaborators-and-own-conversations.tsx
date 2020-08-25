import './highlight-collaborators-and-own-conversations.css';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import fetchDom from '../helpers/fetch-dom';
import {getRepoURL, getUsername} from '../github-helpers';

const getCollaborators = cache.function(async (): Promise<string[]> => {
	const dom = await fetchDom(getRepoURL() + '/issues/show_menu_content?partial=issues/filters/authors_content');
	return select
		.all<HTMLImageElement>('.SelectMenu-item [alt]', dom)
		.map(avatar => avatar.alt.slice(1));
}, {
	maxAge: {
		days: 1
	},
	staleWhileRevalidate: {
		days: 20
	},
	cacheKey: () => 'repo-collaborators:' + getRepoURL()
});

async function highlightCollaborators(): Promise<false | void> {
	const authors = select.all('.js-issue-row [data-hovercard-type="user"]');
	if (authors.length === 0) {
		return false;
	}

	const collaborators = await getCollaborators();

	for (const author of authors) {
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

void features.add({
	id: __filebasename,
	description: 'Highlights conversations opened by you or the current repo’s collaborators.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/65013882-03225d80-d947-11e9-8eb8-5507bc1fc14b.png'
}, {
	include: [
		pageDetect.isRepoConversationList
	],
	init: highlightCollaborators
}, {
	include: [
		pageDetect.isConversationList
	],
	init: highlightSelf
});
