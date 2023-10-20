import React from 'dom-chef';
import {$, elementExists} from 'select-dom';
import * as pageDetect from 'github-url-detection';
import {CodeIcon, PlusIcon, SearchIcon} from '@primer/octicons-react';

import observe from '../helpers/selector-observer.js';
import {assertNodeContent, wrap} from '../helpers/dom-utils.js';
import features from '../feature-manager.js';

/** Add tooltip on a wrapper to avoid breaking dropdown functionality */
function addTooltipToSummary(childElement: Element, tooltip: string): void {
	wrap(
		childElement.closest('details')!,
		<div className="tooltipped tooltipped-ne" aria-label={tooltip}/>,
	);
}

function cleanFilelistActions(searchButton: Element): void {
	searchButton.classList.add('tooltipped', 'tooltipped-ne');
	searchButton.setAttribute('aria-label', 'Go to file');

	// Replace "Go to file" with  icon
	searchButton.firstChild!.replaceWith(<SearchIcon/>);

	// This button doesn't appear on `isSingleFile`
	const addFileDropdown = searchButton.nextElementSibling!.querySelector('.dropdown-caret');
	if (addFileDropdown) {
		addFileDropdown.parentElement!.classList.replace('d-md-flex', 'd-md-block');

		// Replace label with icon
		assertNodeContent(addFileDropdown.previousSibling, 'Add file')
			.replaceWith(<PlusIcon/>);

		addTooltipToSummary(addFileDropdown, 'Add file');
	}

	if (!pageDetect.isRepoRoot()) {
		return;
	}

	const codeDropdownButton = $('get-repo summary')!;
	addTooltipToSummary(codeDropdownButton, 'Clone, open or download');

	const label = $('.Button-label', codeDropdownButton)!;
	if (!elementExists('.octicon-code', codeDropdownButton)) {
		// The icon is missing for users without Codespaces https://github.com/refined-github/refined-github/pull/5074#issuecomment-983251719
		label.before(<span className="Button-visual Button-leadingVisual"><CodeIcon/></span>);
	}

	label.remove();
}

function init(signal: AbortSignal): void {
	// `.btn` selects the desktop version
	observe('.btn[data-hotkey="t"]', cleanFilelistActions, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoTree,
		pageDetect.isSingleFile,
	],
	exclude: [
		pageDetect.isRepoFile404,
	],
	init,
});

/*

Test URLs
https://github.com/refined-github/sandbox
https://github.com/refined-github/sandbox/tree/branch/with/slashes

*/
