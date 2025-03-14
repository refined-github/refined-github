import React from 'dom-chef';
import {$, $optional} from 'select-dom/strict.js';
import {elementExists} from 'select-dom';
import * as pageDetect from 'github-url-detection';
import CodeIcon from 'octicons-plain-react/Code';
import PlusIcon from 'octicons-plain-react/Plus';
import SearchIcon from 'octicons-plain-react/Search';

import observe from '../helpers/selector-observer.js';
import {assertNodeContent, wrap} from '../helpers/dom-utils.js';
import features from '../feature-manager.js';
import './clean-repo-filelist-actions.css';

/** Add tooltip on a wrapper to avoid breaking dropdown functionality */
function addTooltipToSummary(childElement: Element, tooltip: string): void {
	wrap(
		childElement,
		<div className="tooltipped tooltipped-n" aria-label={tooltip} />,
	);
}

function oldCleanFilelistActions(searchButton: Element): void {
	searchButton.classList.add('tooltipped', 'tooltipped-ne');
	searchButton.setAttribute('aria-label', 'Go to file');

	// Replace "Go to file" with  icon
	searchButton.firstChild!.replaceWith(<SearchIcon />);

	// This button doesn't appear on `isSingleFile`
	const addFileDropdown = searchButton.nextElementSibling!.querySelector('.dropdown-caret');
	if (addFileDropdown) {
		addFileDropdown.parentElement!.classList.replace('d-md-flex', 'd-md-block');

		// Replace label with icon
		assertNodeContent(addFileDropdown.previousSibling, 'Add file')
			.replaceWith(<PlusIcon />);

		addTooltipToSummary(addFileDropdown.closest('details')!, 'Add file');
	}

	if (!pageDetect.isRepoRoot()) {
		return;
	}

	const codeDropdownButton = $('get-repo summary');
	addTooltipToSummary(codeDropdownButton.closest('details')!, 'Clone, open or download');

	const label = $('.Button-label', codeDropdownButton);
	if (!elementExists('.octicon-code', codeDropdownButton)) {
		// The icon is missing for users without Codespaces https://github.com/refined-github/refined-github/pull/5074#issuecomment-983251719
		label.before(<span className="Button-visual Button-leadingVisual"><CodeIcon /></span>);
	}

	label.remove();
}

function cleanFilelistActions(addFileButton: Element): void {
	const container = addFileButton.parentElement!.parentElement!;
	const codeButton = $optional('& > button', container);

	const searchInput = $('.TextInput-wrapper', addFileButton.parentElement!);
	searchInput.classList.add('rgh-clean-repo-filelist-actions-search');

	cleanAddFileButton(addFileButton);

	if (!pageDetect.isRepoRoot() || !codeButton) {
		return;
	}

	cleanCodeButton(codeButton);
}

function cleanAddFileButton(addFileButton: Element): void {
	const fileButtonContent = $('[data-component="buttonContent"] > span', addFileButton);

	assertNodeContent(fileButtonContent, 'Add file')
		.replaceWith(<PlusIcon />);
	addTooltipToSummary(addFileButton, 'Add file');
}

function cleanCodeButton(codeButton: Element): void {
	const codeButtonContent = $('[data-component="text"]', codeButton);
	codeButtonContent.remove();
	addTooltipToSummary(codeButton, 'Clone, open or download');
}

function init(signal: AbortSignal): void {
	// `.btn` selects the desktop version
	observe('.btn[data-hotkey="t"]', oldCleanFilelistActions, {signal}); // TODO: Drop after August 2025
	observe('.react-directory-remove-file-icon', cleanFilelistActions, {signal});
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
