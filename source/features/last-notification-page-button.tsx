import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import looseParseInt from '../helpers/loose-parse-int';
import {assertNodeContent} from '../helpers/dom-utils';

function init(): void | false {
	const nextButton = select('a[data-hotkey="ArrowRight"]')?.cloneNode();
	if (!nextButton) {
		return false;
	}

	const lastNotificationPageNode = select('.js-notifications-list-paginator-counts')!.lastChild!;
	assertNodeContent(lastNotificationPageNode, 'of');
	const lastNotificationPageNumber = looseParseInt(lastNotificationPageNode);
	const lastCursor = Math.floor(lastNotificationPageNumber / 50) * 50;
	const nextButtonSearch = new URLSearchParams(nextButton.search);
	nextButtonSearch.set('after', btoa('cursor:' + String(lastCursor)));
	nextButton.search = String(nextButtonSearch);
	lastNotificationPageNode.replaceWith(
		' of ',
		<a
			className="text-underline rgh-last-notification-page-button"
			href={nextButton.href}
		>
			{lastNotificationPageNumber}
		</a>,
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isNotifications,
	],
	exclude: [
		() => select.exists('.rgh-last-notification-page-button'),
	],
	init,
});
