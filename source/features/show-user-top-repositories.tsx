/*
Find a user’s top repositories in their profile.
https://user-images.githubusercontent.com/1402241/48474026-43e3ae80-e82c-11e8-93de-159ad4c6f283.png
*/

import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import {getCleanPathname} from '../libs/utils';

const divider = ' / ';

function buildUrl(queryField) {
	const url = new URL('/search')
	url.searchParams.set('o', 'desc')
	url.searchParams.set('q', `user%3A${getCleanPathname()}`)
	url.searchParams.set('s', queryField)
	url.searchParams.set('type', 'Repositories')
	console.log({url})
	return url
}

function init() {
	const showcaseTitle = select('.js-pinned-repos-reorder-container .text-normal');
	if (!showcaseTitle) {
		return false;
	}

	showcaseTitle.firstChild.after(
		divider,
		<a href={buildUrl('stars')}>Top repositories</a>,
		divider,
		<a href={buildUrl('updated')}>Updated repositories</a>
	);
}

features.add({
	id: 'show-user-top-repositories',
	include: [
		features.isUserProfile
	],
	load: features.onAjaxedPages,
	init
});
