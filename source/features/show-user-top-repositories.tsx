import React from 'jsx-dom';
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

void features.add(__filebasename, {
	include: [
		pageDetect.isUserProfileMainTab
	],
	init
});
