import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {getCleanPathname} from '../github-helpers';

function buildUrl(queryField: string): URL {
	const url = new URL('/search', location.href);
	url.searchParams.set('o', 'desc');
	url.searchParams.set('q', `user:${getCleanPathname()}`);
	url.searchParams.set('s', queryField);
	url.searchParams.set('type', 'Repositories');
	return url;
}

function init(): void {
	// Showcase title
	select('.js-pinned-items-reorder-container .text-normal')!.firstChild!.after(
		' / ',
		<a href={String(buildUrl('stars'))}>Top repositories</a>
	);
}

void features.add({
	id: __filebasename,
	description: 'Adds a link to the user’s most starred repositories.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/48474026-43e3ae80-e82c-11e8-93de-159ad4c6f283.png',
	testOn: ''
}, {
	include: [
		pageDetect.isUserProfileMainTab
	],
	init
});
