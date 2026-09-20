/**
@description Enables toggling file diffs by clicking on their header bar.
@screenshot https://user-images.githubusercontent.com/47531779/99855419-be173e00-2b7e-11eb-9a55-0f6251aeb0ef.gif
*/

import delegate, {type DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';
import {$} from 'select-dom';

import features from '../feature-manager.js';
import {codeSearchHeader} from '../github-helpers/selectors.js';
import {wasInteractiveElementClicked} from './easy-toggle-commit-messages.js';

function toggleFile(event: DelegateEvent<MouseEvent>): void {
	if (wasInteractiveElementClicked(event)) {
		return;
	}

	const headerBar = event.delegateTarget;
	$('button:has(> .octicon-chevron-down, > .octicon-chevron-right)', headerBar)
		.dispatchEvent(new MouseEvent('click', {bubbles: true, altKey: event.altKey}));
}

function toggleCodeSearchFile(event: DelegateEvent<MouseEvent>): void {
	const elementClicked = event.target as HTMLElement;
	const headerBar = event.delegateTarget;
	const toggle = $(':scope > button', headerBar);

	// The clicked element is either the bar itself or one of its children excluding the button
	if (elementClicked === headerBar || (elementClicked !== toggle && elementClicked.parentElement === headerBar)) {
		toggle.dispatchEvent(new MouseEvent('click', {bubbles: true, altKey: event.altKey}));
	}
}

function init(signal: AbortSignal): void {
	delegate(
		[
			'.file-header',
			// React
			'[class^="Diff-module__diffHeaderWrapper"]',
		],
		'click',
		toggleFile,
		{signal},
	);
}

function initSearchPage(signal: AbortSignal): void {
	delegate(codeSearchHeader, 'click', toggleCodeSearchFile, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasFiles,
		pageDetect.isGistRevision,
	],
	init,
}, {
	include: [
		pageDetect.isGlobalSearchResults,
	],
	init: initSearchPage,
});

/*

## Test URLs

- Pull Request: https://github.com/refined-github/refined-github/pull/7036/files
- Code Search: https://github.com/search?q=repo%3Arefined-github%2Frefined-github%20easy&type=code

*/
