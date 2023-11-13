import * as pageDetect from 'github-url-detection';
import delegate, {DelegateEvent} from 'delegate-it';
import filterAlteredClicks from 'filter-altered-clicks';

import features from '../feature-manager.js';

function openInNewTab(event: DelegateEvent<MouseEvent, HTMLLinkElement>): void {
	event.preventDefault();
	window.open(event.delegateTarget.href, '_blank');
}

function init(signal: AbortSignal): void {
	delegate([
		'div.js-preview-body a', // For rich text editors in issues, PRs, comments, etc.
		'div.html-blob a', // For rich text editors when editing files (READMEs)
	].join(', '),
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
