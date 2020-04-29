import React from 'dom-chef';
import select from 'select-dom';
import searchIcon from 'octicon/search.svg';
import features from '../libs/features';
import * as pageDetect from '../libs/page-detect';

function init(): void {
	const actionRepo = select('aside .octicon-repo')!
		.closest('a')!
		.pathname
		.slice(1);

	const actionURL = new URL('search', location.origin);
	actionURL.searchParams.set('q', `${actionRepo} path:.github/workflows/ language:YAML`);
	actionURL.searchParams.set('type', 'Code');
	actionURL.searchParams.set('s', 'indexed');
	actionURL.searchParams.set('o', 'desc');

	const styledSearchIcon = searchIcon();
	styledSearchIcon.setAttribute('width', '14');
	styledSearchIcon.classList.add('text-gray-dark', 'mr-2');

	select('.d-block.mb-2[href^="/contact"]')!.after(
		<a href={String(actionURL)} className="d-block mb-2">
			{styledSearchIcon}Usage examples
		</a>
	);
}

features.add({
	id: __filebasename,
	description: 'Lets you see how others are using the current Action in the Marketplace.',
	screenshot: 'https://user-images.githubusercontent.com/8360597/80250140-86d9c080-8673-11ea-9d28-f62faf9fd3d4.png'
}, {
	include: [
		pageDetect.isActionPage
	],
	init
});
