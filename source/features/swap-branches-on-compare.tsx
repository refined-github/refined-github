import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils';
import features from '.';
import {getRepoPath, getRepoURL} from '../github-helpers';

function init(): void {
	const references = getRepoPath()!
		.replace('compare/', '')
		.split('...')
		.reverse();

	// Compares against the "base" branch if the URL only has one reference
	if (references.length === 1) {
		references.unshift(select('.branch span')!.textContent!);
	}

	const icon = select('.octicon-arrow-left')!;
	icon.parentElement!.attributes['aria-label'].value += '.\nClick to swap.';
	wrap(icon, <a href={`/${getRepoURL(true)}/compare/${references.join('...')}`}/>);
}

void features.add({
	id: __filebasename,
	description: 'Adds link to swap branches in the branch compare view.',
	screenshot: 'https://user-images.githubusercontent.com/857700/42854438-821096f2-8a01-11e8-8752-76f7563b5e18.png'
}, {
	include: [
		pageDetect.isCompare
	],
	init
});
