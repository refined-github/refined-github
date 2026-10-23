import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';
import {$optional} from 'select-dom';
import features from '../feature-manager.js';

const forkButtonSelector = '[data-testid="fork-button"]';
const forkDropdownSelector = '[data-testid="fork-dropdown-button"]';

function openDropdown(event: MouseEvent): void {
	const dropdown = $optional(forkDropdownSelector);
	// Let modified clicks (new tab, etc) through
	if (!dropdown || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
		return;
	}

	event.preventDefault();
	event.stopImmediatePropagation();
	dropdown.click();
}

function init(signal: AbortSignal): void {
	delegate(forkButtonSelector, 'click', openDropdown, {signal, capture: true});
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
