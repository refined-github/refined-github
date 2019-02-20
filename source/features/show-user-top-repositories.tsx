/*
Find a user’s top repositories in their profile.
https://user-images.githubusercontent.com/13842856/52824495-da6f7800-3086-11e9-995d-ab8bd784e9ab.png
*/

import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import {getCleanPathname} from '../libs/utils';

function buildUrl(queryField) {
	const url = new URL('/search', location.href);
	url.searchParams.set('o', 'desc');
	url.searchParams.set('q', `user:${getCleanPathname()}`);
	url.searchParams.set('s', queryField);
	url.searchParams.set('type', 'Repositories');
	return url;
}

function init() {
	const showcaseTitle = select('.js-pinned-items-reorder-container .text-normal');
	if (!showcaseTitle) {
		return false;
	}

	showcaseTitle.firstChild.after(
		' / ',
		<a href={buildUrl('stars')}>Top repositories</a>,
		' / ',
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
