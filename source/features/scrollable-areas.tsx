import './scrollable-areas.css';

import delegate, {type DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import {is, not} from '../helpers/css-selectors.js';

// These selectors must be kept in sync with the selectors in scrollable-areas.css
const scrollableSelector = is(
	'.comment-body',
	'[data-testid="markdown-body"]',
)
+ ' '
+ is(
	'blockquote',
	'pre',
) + not(
	/* Exclude clicked areas */
	'.rgh-scrollable-expanded',
	/* Exclude nested scrollable areas */
	'blockquote *',
	'pre *',
);

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
