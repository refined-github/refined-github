import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import searchIcon from 'octicon/search.svg';

export const isActionPage = (): boolean => location.pathname.split('/', 3).join('/') === '/marketplace/actions';

function init(): void {
	const actionRepo = select('.d-block.mb-2')!
		.getAttribute('href')!
		.replace(location.origin, '')
		.replace('/', '');

	const actionURL = new URL('search', location.origin);
	actionURL.searchParams.set('q', `${actionRepo} path:.github/workflows/ language:YAML`);
	actionURL.searchParams.set('o', 'desc');
	actionURL.searchParams.set('s', 'indexed');
	actionURL.searchParams.set('type', 'Code');

	const styledSearchIcon = searchIcon();
	styledSearchIcon.setAttribute('width', '14');
	styledSearchIcon.classList.add('text-gray-dark', 'mr-2');
	
	select('.d-block.mb-2[href^="/contact"]')!.after(
		<a href={String(actionURL)} className="d-block mb-2">
			{styledSearchIcon} Usage examples
		</a>
	);

features.add({
	id: __filebasename,
	description: 'Lets you see how others are using the current Action in the Marketplace.',
	screenshot: 'https://user-images.githubusercontent.com/8360597/80221147-2cc20680-8645-11ea-8493-befb47ddebd4.png'
}, {
	include: [
		isActionPage
	],
	init
});
