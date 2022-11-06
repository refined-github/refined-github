import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import looseParseInt from '../helpers/loose-parse-int';
import {assertNodeContent} from '../helpers/dom-utils';
import observe from '../helpers/selector-observer';

function linkify(nextButton: HTMLAnchorElement): void {
	const lastNotificationPageNode = select('.js-notifications-list-paginator-counts')!.lastChild!;
	assertNodeContent(lastNotificationPageNode, /^of \d+$/);
	const lastNotificationPageNumber = looseParseInt(lastNotificationPageNode);
	const lastCursor = Math.floor(lastNotificationPageNumber / 50) * 50;
	const nextButtonSearch = new URLSearchParams(nextButton.search);
	nextButtonSearch.set('after', btoa(`cursor:${lastCursor}`));
	lastNotificationPageNode.replaceWith(
		' of ',
		<a href={'?' + String(nextButtonSearch)}>
			{lastNotificationPageNumber}
		</a>,
	);
}

function init(signal: AbortSignal): void {
	// When there's no "next page", this element becomes `<button disabled>`
	observe('a[aria-label="Next"]', linkify, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isNotifications,
	],
	init,
});
