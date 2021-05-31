import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils';
import features from '.';
import {buildRepoURL, getRepo} from '../github-helpers';

function init(): void {
	const referencePath = getRepo()!
		.path
		.replace('compare/', '');
	const isDirectComparision: boolean = referencePath.includes('..');
	const branchDelimiter: string = isDirectComparision ? '..' : '...';
	const references: string[] = referencePath
		.split(branchDelimiter)
		.reverse();

	// Compares against the "base" branch if the URL only has one reference
	if (references.length === 1) {
		references.unshift(select('.branch span')!.textContent!);
	}

	const icon = select('.range-editor .octicon-arrow-left,.octicon-arrow-both')!;
	icon.parentElement!.attributes['aria-label'].value += '.\nClick to swap.';
	wrap(icon, <a href={buildRepoURL('compare/' + references.join(branchDelimiter))}/>);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isCompare
	],
	init
});
