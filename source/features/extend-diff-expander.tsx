/**
@description Widens the <code>Expand diff</code> button to be clickable across the screen.
@screenshot https://user-images.githubusercontent.com/1402241/152118201-f25034c7-6fae-4be0-bb3f-c217647e32b7.gif
*/

import './extend-diff-expander.css';

import delegate, {type DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';
import {$, closestElementOptional} from 'select-dom';

import features from '../feature-manager.js';

const lineSelectors = [
	'.diff-view .js-expandable-line', // Expandable lines in old view
	'.diff-line-row:has(button[data-direction])', // React view
];

const nativeButtonSelector = [
	'.js-expand', // Expand button in old view
	'button[data-direction]', // React view
];

function expandDiff(event: DelegateEvent): void {
	// Skip if the user clicked directly on the icon
	if (!closestElementOptional(nativeButtonSelector, event.target as Node)) {
		$(nativeButtonSelector, event.delegateTarget).click();
	}
}

function init(signal: AbortSignal): void {
	document.body.classList.add('rgh-extend-diff-expander');
	delegate(lineSelectors, 'click', expandDiff, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasFiles,
	],
	init,
});

/*

Test URLs:

- PR: https://github.com/refined-github/refined-github/pull/940/files
- Compare: https://github.com/microsoft/TypeScript/compare/v4.1.2...v4.1.3
- Commit: https://github.com/microsoft/TypeScript/commit/9d25e593ab722d9cf203690de94e36f8588e968e
*/
