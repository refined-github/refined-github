import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import looseParseInt from '../helpers/loose-parse-int';
import {wrap} from '../helpers/dom-utils';

function init(): void {
	const nextButtonURL = new URL(select('a[data-hotkey="ArrowRight"]')!.href);
	const nextButtonSearch = new URLSearchParams(nextButtonURL.search);
	const lastNotificationPage = select('.js-notifications-list-paginator-counts')!.lastChild!;
	const lastNotificationPageNumber = looseParseInt(lastNotificationPage);
	const lastCursor = Math.floor(lastNotificationPageNumber / 50) * 50;
	nextButtonSearch.set('after', btoa('cursor:' + String(lastCursor)));
	nextButtonURL.search = nextButtonSearch.toString();
	wrap(lastNotificationPage, <a href={nextButtonURL.href}/>);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isNotifications,
	],
	exclude: [
		pageDetect.isBlank, // Empty notification list
		() => !select.exists('[disabled="disabled"][data-hotkey="ArrowRight"]'), // No next page
	],
	deduplicate: 'has-rgh',
	init,
});
