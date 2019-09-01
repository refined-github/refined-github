import './highlight-collaborators-prs.css';
import select from 'select-dom';
import features from '../libs/features';
import {getRepoURL} from '../libs/utils';
import fetchDom from '../libs/fetch-dom';

async function init(): Promise<false | void> {
	const authors = select.all('.js-issue-row [data-hovercard-type="user"]');
	if (authors.length === 0) {
		return false;
	}

	const dom = await fetchDom(getRepoURL() + '/issues/show_menu_content?partial=issues/filters/authors_content');
	const collaborators = select.all('.select-menu-item-text', dom).map(collaborator => {
		return collaborator.firstChild!.textContent!.trim();
	});

	for (const author of authors) {
		if (collaborators.includes(author.textContent!.trim())) {
			author.classList.add('rgh-collaborator');
		}
	}
}

features.add({
	id: __featureName__,
	description: 'Highlights discussions opened by organization collaborators.',
	screenshot: '',
	include: [
		features.isDiscussionList
	],
	load: features.onAjaxedPages,
	init
});
