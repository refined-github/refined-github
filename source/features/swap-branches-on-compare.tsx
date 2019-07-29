import React from 'dom-chef';
import select from 'select-dom';
import {wrap} from '../libs/dom-utils';
import features from '../libs/features';
import {getRepoPath, getRepoURL} from '../libs/utils';

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
	wrap(icon, <a href={`/${getRepoURL()}/compare/${references.join('...')}`}></a>);
}

features.add({
	id: __featureName__,
	description: 'Adds link to swap branches in the branch compare view.',
	screenshot: 'https://user-images.githubusercontent.com/857700/42854438-821096f2-8a01-11e8-8752-76f7563b5e18.png',
	include: [
		features.isCompare
	],
	load: features.onAjaxedPages,
	init
});
