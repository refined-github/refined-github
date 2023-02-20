import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils';
import features from '../feature-manager';
import {buildRepoURL, getRepo} from '../github-helpers';

function init(): void {
	const references = getRepo()!
		.path
		.replace('compare/', '')
		.split('...')
		.reverse();

	// Compares against the "base" branch if the URL only has one reference
	if (references.length === 1) {
		references.unshift(select('.branch span')!.textContent!);
	}

	const icon = select('.range-editor .octicon-arrow-left')!;
	icon.parentElement!.attributes['aria-label'].value += '.\nClick to swap.';
	wrap(icon, <a href={buildRepoURL('compare/' + references.join('...'))} data-turbo-frame="repo-content-turbo-frame"/>);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isCompare,
	],
	exclude: [
		() => /\.\.+/.exec(location.pathname)?.[0]!.length === 2,
	],
	awaitDomReady: true,
	deduplicate: 'has-rgh',
	init,
});
