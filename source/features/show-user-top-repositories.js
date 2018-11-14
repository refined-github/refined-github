/*
Find a user’s most starred repositories in their profile.
https://user-images.githubusercontent.com/1402241/48474026-43e3ae80-e82c-11e8-93de-159ad4c6f283.png
*/

import {h} from 'dom-chef';
import select from 'select-dom';
import {getCleanPathname} from '../libs/page-detect';

export default function () {
	const showcaseTitle = select('.js-pinned-repos-reorder-container .text-normal');
	if (showcaseTitle) {
		const url = `/search?o=desc&q=user%3A${getCleanPathname()}&s=stars&type=Repositories`;
		showcaseTitle.firstChild.after(' / ', <a href={url}>Top repositories</a>);
	}
}
