import './scrollable-areas.css';

import delegate, {type DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';

const scrollableSelector = [
	'.comment-body blockquote',
	'.comment-body pre',
	'[data-testid="markdown-body"] blockquote',
	'[data-testid="markdown-body"] pre',
];

function disableScroll(event: DelegateEvent<MouseEvent, HTMLElement>): void {
	const area = event.delegateTarget;
	if (area.scrollHeight <= area.clientHeight) {
		return;
	}

	window.scrollBy(0, area.scrollTop);
	area.classList.add('rgh-scrollable-expanded');
}

function init(signal: AbortSignal): void {
	delegate(scrollableSelector, 'click', disableScroll, {signal});
}

void features.addCssFeature(import.meta.url);
void features.add(import.meta.url, {
	include: [
		pageDetect.hasComments,
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/refined-github/pull/1146#issuecomment-377296024

*/
