import React from 'dom-chef';
import {$} from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import {buildRepoURL, getRepo} from '../github-helpers/index.js';

const isTwoDotDiff = (): boolean => /\.\.+/.exec(location.pathname)?.[0]!.length === 2;

function init(): void {
	const references = getRepo()!
		.path
		.replace('compare/', '')
		.split('...')
		.reverse();

	// Compares against the "base" branch if the URL only has one reference
	if (references.length === 1) {
		references.unshift($('.branch span')!.textContent);
	}

	const referencePicker = $('.range-editor .d-inline-block + .range-cross-repo-pair')!;
	referencePicker.after(
		<a className="btn btn-sm mx-2" href={buildRepoURL('compare/' + references.join('...'))}>
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
		isTwoDotDiff,
		pageDetect.isBlank,
	],
	awaitDomReady: true,
	deduplicate: 'has-rgh',
	init,
});

/*
Test URLs:

- Compare: https://github.com/refined-github/refined-github/compare/23.2.1...main
- Blank: https://github.com/refined-github/refined-github/compare
*/
