import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import looseParseInt from '../helpers/loose-parse-int';

function init(): void | false {
	const nextButton = select('a[data-hotkey="ArrowRight"]');
	if (!nextButton) {
		return false;
	}

	const lastNotificationPageNode = select('.js-notifications-list-paginator-counts')!.lastChild!;
	const lastNotificationPageNumber = looseParseInt(lastNotificationPageNode);
	const lastCursor = Math.floor(lastNotificationPageNumber / 50) * 50;
	const nextButtonSearch = new URLSearchParams(nextButton.search);
	nextButtonSearch.set('after', btoa('cursor:' + String(lastCursor)));
	nextButton.search = nextButtonSearch.toString();
	lastNotificationPageNode.replaceWith(' of ',
		<a
			style={{textDecoration: 'underline'}}
			className="rgh-last-notification-page-button"
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
