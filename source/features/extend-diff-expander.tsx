import './extend-diff-expander.css';

import {$} from 'select-dom/strict.js';
import delegate, {type DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';

const diffSelectors = [
	'.diff-view .js-expandable-line',
	'.diff-line-row:has(button[data-direction])',
];

const diffExpandSelector = [
	'.js-expand',
	'button[data-direction]',
];

function expandDiff(event: DelegateEvent): void {
	// Skip if the user clicked directly on the icon
	if (!(event.target as Element).closest(diffExpandSelector)) {
		$(diffExpandSelector, event.delegateTarget).click();
	}
}

function init(signal: AbortSignal): void {
	document.body.classList.add('rgh-extend-diff-expander');
	delegate(diffSelectors, 'click', expandDiff, {signal});
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
