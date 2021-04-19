import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

function buildUrl(): URL {
	const url = new URL(location.pathname, location.href);
	url.searchParams.set('tab', 'repositories');
	url.searchParams.set('sort', 'stargazers');
	return url;
}

function init(): void {
	// Showcase title
	select('.js-pinned-items-reorder-container .text-normal')!.firstChild!.after(
		' / ',
		<a href={String(buildUrl())}>Top repositories</a>
	);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isUserProfileMainTab
	],
	init
});
