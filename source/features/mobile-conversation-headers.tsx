import * as pageDetect from 'github-url-detection';

import {$, $optional} from 'select-dom/strict.js';
import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import {isSmallDevice} from '../helpers/dom-utils.js';
import {hideAuthorClass} from './clean-conversation-headers.js';

function reducePrLabelSize(labelIcon: SVGSVGElement): void {
	const label = labelIcon.parentElement!;
	const stickyHeader = label.closest('div[class*="use-sticky-header"]')!;

	const rghLabel = label.cloneNode(true);
	rghLabel.dataset.size = 'small';
	rghLabel.classList.add('mr-2', 'd-inline', 'rgh-sticky-header-label');

	const currentRghLabel = $optional('.rgh-sticky-header-label', stickyHeader);
	if (currentRghLabel) {
		currentRghLabel.replaceWith(rghLabel);
	} else {
		const prTitle = $('a[href="#top"]', stickyHeader);
		label.parentElement!.classList.add('sr-only');
		prTitle.before(rghLabel);
		stickyHeader.classList.add(hideAuthorClass);
		stickyHeader.style.setProperty('padding-block', '2px', 'important');
	}
}

function reduceIssueLabelSize(label: HTMLElement): void {
	label.dataset.size = 'small';
	const container = label.closest('div[class*="contentContainer"]')!;
	container.classList.add('px-2');
}

function init(signal: AbortSignal): void {
	observe('div[class*="use-sticky-header"] span[class*="StateLabel"] > svg',
		reducePrLabelSize,
		{signal});

	observe('#issue-viewer-sticky-header span[class*="StateLabel"]',
		reduceIssueLabelSize,
		{signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		isSmallDevice,
	],
	include: [
		pageDetect.isConversation,
	],
	init,
});

/* Test URLs

- PR: https://github.com/refined-github/refined-github/pull/9176
- Issue: https://github.com/refined-github/refined-github/issues/9169

*/
