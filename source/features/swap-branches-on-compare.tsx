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
	id: 'swap-branches-on-compare',
	description: 'Swap head and base branches in the branch compare view',
	include: [
		features.isCompare
	],
	load: features.onAjaxedPages,
	init
});
