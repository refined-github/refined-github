import './suggest-commit-title-limit.css';
import delegate, {type DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import onCommitTitleUpdate from '../github-events/on-commit-title-update.js';
import {formatPrCommitTitle} from './sync-pr-commit-title.js';

// https://github.com/refined-github/refined-github/issues/2178#issuecomment-505940703
const limit = 72;

function validateCommitTitle({delegateTarget: field}: DelegateEvent<Event, HTMLInputElement>): void {
	field.classList.toggle('rgh-title-over-limit', field.value.length > limit);
}

function validatePrTitle({delegateTarget: field}: DelegateEvent<Event, HTMLInputElement>): void {
	// Include the PR number in the title length calculation because it will be added to the commit title
	field.classList.toggle('rgh-title-over-limit', formatPrCommitTitle(field.value).length > limit);
}

function init(signal: AbortSignal): void {
	document.body.classList.add('rgh-suggest-commit-title-limit');
	onCommitTitleUpdate(validateCommitTitle, signal);
	delegate('#issue_title', 'input', validatePrTitle, {signal, passive: true});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isEditingFile,
		pageDetect.isPR,
	],
	init,
});

/*

# Test data

## Commit title

123456789 123456789 123456789 123456789 123456789 123456789 123456789 123

## Test URLs

- Any mergeable PR
- https://github.com/refined-github/sandbox/pull/8
- Any editable file
- https://github.com/refined-github/refined-github/edit/main/readme.md

*/
