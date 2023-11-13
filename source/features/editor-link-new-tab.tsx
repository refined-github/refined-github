import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import delegate, { DelegateEvent } from 'delegate-it';

function openInNewTab(event: DelegateEvent<MouseEvent, HTMLLinkElement>): void {
	event.preventDefault();
	window.open(event.delegateTarget.href, '_blank');
}

function init(signal: AbortSignal): void {
	delegate('div.js-preview-body a, div.html-blob a', 'click', openInNewTab, { signal });
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasRichTextEditor,
		pageDetect.isEditingFile
	],
	init
});

/*

## Test URLs

https://github.com/refined-github/sandbox/issues/new

*/
