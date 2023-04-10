import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

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

	const editor = select('.range-editor')!;
	editor.append(
		<a className="btn btn-sm" href={buildRepoURL('compare/' + references.join('...'))}>
			Swap
		</a>,
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isCompare,
	],
	exclude: [
		// Disable on Two-dot Git diff comparison #4453
		() => /\.\.+/.exec(location.pathname)?.[0]!.length === 2,
	],
	awaitDomReady: true,
	deduplicate: 'has-rgh',
	init,
});

/*
Test URLs:

https://github.com/refined-github/refined-github/compare/23.2.1...main
*/
