import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';
import {PlusIcon, SearchIcon, CodeIcon} from '@primer/octicons-react';

import observe from '../helpers/selector-observer.js';
import {assertNodeContent, removeTextNodeContaining, wrap} from '../helpers/dom-utils.js';
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

	const codeDropdownButton = select('get-repo summary');
	if (codeDropdownButton) { // This dropdown doesn't appear on `isSingleFile`
		addTooltipToSummary(codeDropdownButton, 'Clone, open or download');

		// Users with Codespaces enabled already have an icon in the button https://github.com/refined-github/refined-github/pull/5074#issuecomment-983251719
		const codeIcon = select('.octicon-code', codeDropdownButton);
		if (codeIcon) {
			removeTextNodeContaining(codeIcon.nextSibling!, 'Code');
		} else {
			removeTextNodeContaining(codeDropdownButton.firstChild!, 'Code');
			codeDropdownButton.prepend(<CodeIcon/>);
		}
	}
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
	init,
});
