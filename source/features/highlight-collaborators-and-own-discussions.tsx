import './highlight-collaborators-and-own-discussions.css';
import select from 'select-dom';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';
import {getRepoURL, getUsername} from '../libs/utils';
import fetchDom from '../libs/fetch-dom';

async function highlightCollaborators(): Promise<false | void> {
	const authors = select.all('.js-issue-row [data-hovercard-type="user"]');
	if (authors.length === 0) {
		return false;
	}

	const dom = await fetchDom(getRepoURL() + '/issues/show_menu_content?partial=issues/filters/authors_content');
	const collaborators = select.all<HTMLImageElement>('.SelectMenu-item [alt]', dom).map(collaborator => {
		return collaborator.alt.slice(1)!;
	});

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

features.add({
	id: __filebasename,
	description: 'Highlights discussions opened by you or the current repo’s collaborators.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/65013882-03225d80-d947-11e9-8eb8-5507bc1fc14b.png'
}, {
	include: [
		pageDetect.isRepoDiscussionList
	],
	init: highlightCollaborators
}, {
	include: [
		pageDetect.isDiscussionList
	],
	init: highlightSelf
});

