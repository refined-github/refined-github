/*
Find a user’s most starred repositories in their profile.
https://user-images.githubusercontent.com/1402241/48474026-43e3ae80-e82c-11e8-93de-159ad4c6f283.png
*/

import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import {getCleanPathname} from '../libs/utils';

function buildUrl(queryField: string): URL {
	const url = new URL('/search', location.href);
	url.searchParams.set('o', 'desc');
	url.searchParams.set('q', `user:${getCleanPathname()}`);
	url.searchParams.set('s', queryField);
	url.searchParams.set('type', 'Repositories');
	return url;
}

function init(): false | void {
	const showcaseTitle = select('.js-pinned-items-reorder-container .text-normal')!;
	if (!showcaseTitle) {
		return false;
	}

	showcaseTitle.firstChild!.after(
		' / ',
		<a href={String(buildUrl('stars'))}>Top repositories</a>
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
