import {$} from 'select-dom';
import delegate, {DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';

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

function toggleCSFile(event: DelegateEvent<MouseEvent>): void {
	const elementClicked = event.target as HTMLElement;
	const headerBar = event.delegateTarget;

	// The clicked element is either the bar itself or one of its 2 children and not the toggle button
	if (elementClicked === headerBar || (elementClicked.parentElement === headerBar && elementClicked.tagName !== 'BUTTON')) {
		$(['[aria-label^="Collapse "]', '[aria-label^="Expand "]'], headerBar)!
			.dispatchEvent(new MouseEvent('click', {bubbles: true, altKey: event.altKey}));
	}
}

function init(signal: AbortSignal): void {
	delegate('.file-header', 'click', toggleFile, {signal});
}

function initCS(signal: AbortSignal): void {
	delegate('div[data-testid="results-list"] > div > div:first-child', 'click', toggleCSFile, {signal});
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
	init: initCS,
});

/*

## Test URLs

- Pull Request:
- Code Search: https://github.com/search?q=repo%3Arefined-github%2Frefined-github%20easy&type=code

*/
