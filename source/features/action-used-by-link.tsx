import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';

export const isActionPage = (): boolean => location.pathname.split('/', 3).join('/') === '/marketplace/actions';

async function init(): Promise<void> {
	const actionRepo = select('.d-block.mb-2')!
		.href
		.replace(location.origin, '');

	const actionURL = new URL('https://github.com');
	actionURL.searchParams.set('q', `${actionRepo} path:.github/workflows/ language:YAML`);
	actionURL.searchParams.set('o', 'desc');
	actionURL.searchParams.set('s', 'indexed');
	actionURL.searchParams.set('type', 'Code');

	select('.d-block.mb-2')!
		.parentElement!
		.append(
			<a href="{String(actionURL)}" class="d-block mb-2">
				<svg class="octicon octicon-search text-gray-dark mr-2" width="14" height="16" viewBox="0 0 16 16" version="1.1" aria-hidden="true"><path fill-rule="evenodd" d="M15.7 13.3l-3.81-3.83A5.93 5.93 0 0013 6c0-3.31-2.69-6-6-6S1 2.69 1 6s2.69 6 6 6c1.3 0 2.48-.41 3.47-1.11l3.83 3.81c.19.2.45.3.7.3.25 0 .52-.09.7-.3a.996.996 0 000-1.41v.01zM7 10.7c-2.59 0-4.7-2.11-4.7-4.7 0-2.59 2.11-4.7 4.7-4.7 2.59 0 4.7 2.11 4.7 4.7 0 2.59-2.11 4.7-4.7 4.7z"/></svg>Used by (find workflows)
			</a>
		);
}

features.add({
	id: __filebasename,
	description: 'Adds a link to access worklows using an action when seeing an action page on the Marketplace.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/80146153-ab6d6400-85b1-11ea-9f38-e87950692a62.png'
}, {
	include: [
		isActionPage
	],
	init
});
