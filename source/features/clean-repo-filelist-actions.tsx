import React from 'dom-chef';
import {$, $optional} from 'select-dom/strict.js';
import * as pageDetect from 'github-url-detection';
import PlusIcon from 'octicons-plain-react/Plus';

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

function cleanFilelistActions(addFileButton: Element): void {
	const container = addFileButton.parentElement!.parentElement!;
	const codeButton = $optional('& > button', container);
	container.classList.add('rgh-clean-repo-filelist-actions');

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
