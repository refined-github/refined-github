import select from 'select-dom';
import features from '../libs/features';
import {getUsername, getRepoURL} from '../libs/utils';

const repoUrl = getRepoURL();

function init(): void {
	const dropDownElement = select('#filters-select-menu a:last-child, .subnav-search-context li:last-child')!;
	const newDropDownElement = dropDownElement.cloneNode(true);
	const href = `/${repoUrl}/issues?q=is%3Aopen+commenter:${getUsername()}`;
	const newDropDownElementLink = newDropDownElement.matches('a') ? newDropDownElement : select('a', newDropDownElement)!;
	newDropDownElementLink.textContent = 'Everything commented by you';
	newDropDownElementLink.setAttribute('href', href);
	newDropDownElementLink.removeAttribute('target');
	dropDownElement.before(newDropDownElement);
}

features.add({
	id: __featureName__,
	description: 'Adds a `Everything commented by you` filter in the search box dropdown.',
	screenshot: 'https://user-images.githubusercontent.com/170270/27501170-f394a304-586b-11e7-92d8-d92d6922356b.png',
	include: [
		features.isRepoDiscussionList
	],
	load: features.onAjaxedPages,
	init
});
