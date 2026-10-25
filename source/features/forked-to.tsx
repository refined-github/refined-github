import * as pageDetect from 'github-url-detection';
import {$, closestElement} from 'select-dom';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

function mergeButtons(dropdown: HTMLButtonElement): void {
	const group = closestElement('[data-component="ButtonGroup"]', dropdown);
	const forkLink = $('[data-testid="fork-button"]', group);
	const content = $('[data-component="buttonContent"]', forkLink).cloneNode(true);
	const arrow = $('svg', dropdown);
	arrow.classList.add('ml-1');
	content.append(arrow);

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
	observe('[data-testid="fork-dropdown-button"]', mergeButtons, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoHome,
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
