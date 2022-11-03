import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import looseParseInt from '../helpers/loose-parse-int';
import {wrap} from '../helpers/dom-utils';

function init(): void {
	const nextButtonSearch = new URLSearchParams(select('a[aria-label="Next"][data-hotkey="ArrowRight"]')!.search);
	const lastNotificationPage = select('.js-notifications-list-paginator-counts')!.lastChild!;
	const lastNotificationPageNumber = looseParseInt(lastNotificationPage);
	const lastCursor = Math.floor(lastNotificationPageNumber / 50) * 50;
	nextButtonSearch.set('after', btoa('cursor:' + String(lastCursor)));
	wrap(lastNotificationPage, <a href={nextButtonSearch}/>);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isNotifications,
	],
	deduplicate: 'has-rgh',
	init,
});
