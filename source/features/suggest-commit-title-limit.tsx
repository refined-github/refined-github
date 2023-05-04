import './suggest-commit-title-limit.css';
import type {DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import onCommitTitleUpdate from '../github-events/on-commit-title-update.js';

function validateInput({delegateTarget: field}: DelegateEvent<Event, HTMLInputElement>): void {
	field.classList.toggle('rgh-title-over-limit', field.value.length > 72);
}

function init(signal: AbortSignal): void {
	document.body.classList.add('rgh-suggest-commit-title-limit');
	onCommitTitleUpdate(validateInput, signal);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isEditingFile,
		pageDetect.isPRConversation,
	],
	init,
});

/*

# Test data

## Commit title

123456789 123456789 123456789 123456789 123456789 123456789 123456789 123

## URLs

- Any mergeable PR
- https://github.com/refined-github/sandbox/pull/8
- Any editable file
- https://github.com/refined-github/refined-github/edit/main/readme.md

*/
