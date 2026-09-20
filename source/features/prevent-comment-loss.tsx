/**
@description While writing/editing comments, open the preview links in new tab instead of navigating away from the page.
@screenshot https://user-images.githubusercontent.com/17681399/282616531-2befcabe-5c80-4b9a-bfb5-7b9917847bb5.gif
*/

import delegate, {type DelegateEvent} from 'delegate-it';
import filterAlteredClicks from 'filter-altered-clicks';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';

export const openInNewTab = filterAlteredClicks((event: DelegateEvent<MouseEvent, HTMLAnchorElement>) => {
	event.preventDefault();
	window.open(event.delegateTarget.href, '_blank');
});

function init(signal: AbortSignal): void {
	delegate(
		[
			// Ignore self-reference links: https://github.com/refined-github/refined-github/pull/8854#issuecomment-3794351054
			'.js-preview-body a[href]', // `hasRichTextEditor`
			'.html-blob a', // `isEditingFile`
		],
		'click',
		openInNewTab,
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
