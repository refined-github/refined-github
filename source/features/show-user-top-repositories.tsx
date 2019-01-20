/*
Find a user’s most starred repositories in their profile.
https://user-images.githubusercontent.com/1402241/48474026-43e3ae80-e82c-11e8-93de-159ad4c6f283.png
*/

import {React} from 'dom-chef/react';
import select from 'select-dom';
import features from '../libs/features';
import {getCleanPathname} from '../libs/utils';

function init() {
	const showcaseTitle = select('.js-pinned-repos-reorder-container .text-normal');
	if (!showcaseTitle) {
		return false;
	}

	const url = `/search?o=desc&q=user%3A${getCleanPathname()}&s=stars&type=Repositories`;
	showcaseTitle.firstChild.after(' / ', <a href={url}>Top repositories</a>);
}

features.add({
	id: 'show-user-top-repositories',
	include: [
		features.isUserProfile
	],
	load: features.onAjaxedPages,
	init
});
