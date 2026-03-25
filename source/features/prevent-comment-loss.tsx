import * as pageDetect from 'github-url-detection';
import delegate, {type DelegateEvent} from 'delegate-it';
import filterAlteredClicks from 'filter-altered-clicks';

import features from '../feature-manager.js';

function openInNewTab(event: DelegateEvent<MouseEvent, HTMLAnchorElement>): void {
	event.preventDefault();
	window.open(event.delegateTarget.href, '_blank');
}

function init(signal: AbortSignal): void {
	delegate(
		[
			// Ignore self-reference links: https://github.com/refined-github/refined-github/pull/8854#issuecomment-3794351054
			'.js-preview-body a[href]', // `hasRichTextEditor`
			'.html-blob a', // `isEditingFile`
		],
		'click',
		filterAlteredClicks(openInNewTab),
		{signal},
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasRichTextEditor,
		pageDetect.isEditingFile,
	],
	init,
});

/*

## Test URLs

https://github.com/refined-github/sandbox/issues/new
https://github.com/refined-github/refined-github/edit/main/readme.md

*/
