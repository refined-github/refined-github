import './highlight-collaborators-in-lists.css';
import select from 'select-dom';
import features from '../libs/features';
import {getRepoURL, getUsername} from '../libs/utils';
import fetchDom from '../libs/fetch-dom';

async function init(): Promise<false | void> {
	const authors = select.all('.js-issue-row [data-hovercard-type="user"]');
	if (authors.length === 0) {
		return false;
	}

	const dom = await fetchDom(getRepoURL() + '/issues/show_menu_content?partial=issues/filters/authors_content');
	const collaborators = select.all('.select-menu-item-text', dom).map(collaborator => {
		return collaborator.firstChild!.textContent!.trim();
	}).filter(collaborator => collaborator !== getUsername());

	for (const author of authors) {
		if (collaborators.includes(author.textContent!.trim())) {
			author.classList.add('rgh-collaborator');
		}
	}
}

features.add({
	id: __featureName__,
	description: 'Highlights discussions opened by the current repo’s collaborators.',
	screenshot: 'https://user-images.githubusercontent.com/55841/64478536-0a5ca500-d1aa-11e9-8284-a39114d37824.png',
	include: [
		features.isDiscussionList
	],
	load: features.onAjaxedPages,
	init
});
