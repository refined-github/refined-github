import {$} from 'select-dom';
import delegate, {DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import {codeSearchHeader} from '../github-helpers/selectors.js';
import features from '../feature-manager.js';

function toggleFile(event: DelegateEvent<MouseEvent>): void {
	const elementClicked = event.target as HTMLElement;
	const headerBar = event.delegateTarget;

	// The clicked element is either the bar itself or one of its 2 children
	if (elementClicked === headerBar || elementClicked.parentElement === headerBar) {
		$('[aria-label="Toggle diff contents"]', headerBar)!
			.dispatchEvent(new MouseEvent('click', {bubbles: true, altKey: event.altKey}));
	}
}

function toggleCodeSearchFile(event: DelegateEvent<MouseEvent>): void {
	const elementClicked = event.target as HTMLElement;
	const headerBar = event.delegateTarget;
	const toggle = $(':scope > button', headerBar)!;

	// The clicked element is either the bar itself or one of its children excluding the button
	if (elementClicked === headerBar || (elementClicked.parentElement === headerBar && elementClicked !== toggle)) {
		toggle.dispatchEvent(new MouseEvent('click', {bubbles: true, altKey: event.altKey}));
	}
}

function init(signal: AbortSignal): void {
	delegate('.file-header', 'click', toggleFile, {signal});
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
