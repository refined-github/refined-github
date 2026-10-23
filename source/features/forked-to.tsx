import * as pageDetect from 'github-url-detection';
import {$, $optional} from 'select-dom';
import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

const forkLinkSelector = '[data-testid="fork-button"]';
const dropdownSelector = '[data-testid="fork-dropdown-button"]';

// Turns the Fork button + arrow button group into a single button that opens the dropdown
function mergeButtons(dropdown: HTMLButtonElement): void {
	const group = dropdown.closest('[data-component="ButtonGroup"]');
	const forkLink = $optional(forkLinkSelector, group ?? undefined);
	if (!forkLink) {
		return;
	}

	const content = $('[data-component="buttonContent"]', forkLink);
	const arrow = $optional('svg', dropdown);
	if (arrow) {
		content.append(arrow);
		arrow.classList.add('ml-1');
	}

	// Icon-only styling doesn't fit a labeled button
	for (const className of dropdown.classList) {
		if (className.startsWith('prc-Button-IconButton')) {
			dropdown.classList.remove(className);
		}
	}

	delete dropdown.dataset.noVisuals;
	dropdown.prepend(content);
	forkLink.parentElement!.remove();
}

function init(signal: AbortSignal): void {
	observe(dropdownSelector, mergeButtons, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasRepoHeader,
	],
	init,
});

/*
Test URLs:

Repo you already forked (the dropdown lists your fork)
https://github.com/refined-github/refined-github

Repo you haven't forked (the dropdown offers to create a fork)
https://github.com/refined-github/sandbox
*/
