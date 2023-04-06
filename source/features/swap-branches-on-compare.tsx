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

	const link = select('.js-toggle-range-editor-cross-repo')!;
	link.after(
		' or ',
		<a href={buildRepoURL('compare/' + references.join('...'))}>
			switch the base
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
		// Prefer the native "switch base" button if it is available
		// Do not use `pageDetect.isBlank` which gives false positives
		() => select.exists('.range-editor + .blankslate'),
	],
	awaitDomReady: true,
	deduplicate: 'has-rgh-inner',
	init,
});

/*
Test URLs:

https://github.com/refined-github/refined-github/compare/23.2.1...main
https://github.com/refined-github/refined-github/compare/main...23.2.1 (blank)
*/
