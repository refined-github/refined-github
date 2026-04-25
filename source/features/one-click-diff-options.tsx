import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import CheckIcon from 'octicons-plain-react/Check';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import {registerHotkey} from '../github-helpers/hotkey.js';

function isHidingWhitespace(): boolean {
	return new URL(location.href).searchParams.get('w') === '1';
}

function getAlternateUrl(): string {
	const url = new URL(location.href);

	if (isHidingWhitespace()) {
		url.searchParams.delete('w');
	} else {
		url.searchParams.set('w', '1');
	}

	return url.href;
}

function addShortcut(signal: AbortSignal): void {
	registerHotkey('d w', getAlternateUrl(), {signal});
}

function attachButtons(nativeDiffButtons: HTMLElement): void {
	nativeDiffButtons.parentElement!.after(
		<a
			href={getAlternateUrl()}
			data-hotkey="d w"
			className={'float-right mr-3 tooltipped tooltipped-s btn btn-sm tooltipped ' + (isHidingWhitespace() ? 'color-fg-subtle' : '')}
			aria-label={`${isHidingWhitespace() ? 'Show' : 'Hide'} whitespace changes`}
		>
			{isHidingWhitespace() && <CheckIcon />} No Whitespace
		</a>,
	);
}

function init(signal: AbortSignal): void {
	observe('[action="/users/diffview"]', attachButtons, {signal});
}

const shortcuts = {
	'd w': 'Show/hide whitespaces in diffs',
};

void features.add(import.meta.url, {
	shortcuts,
	include: [
		pageDetect.isPRFiles,
		pageDetect.isSingleCommit,
	],
	exclude: [
		pageDetect.isPRFile404,
	],
	init: addShortcut,
}, {
	shortcuts,
	include: [
		pageDetect.isCompare,
	],
	init,
});

/*
# Test URLs

Shortcut only:
- PR files: https://github.com/refined-github/refined-github/pull/6261/files
- Single commit: https://github.com/rancher/rancher/commit/e82921075436c21120145927d5a66037661fcf4e

Button:
- Compare, in "Files changed" tab: https://github.com/rancher/rancher/compare/v2.6.3...v2.6.6
- Compare, without tab: https://github.com/rancher/rancher/compare/v2.6.5...v2.6.6

*/
