import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import oneTime from 'onetime';

import features from '../libs/features';
import {getUsername} from '../libs/utils';
import {lazilyObserveSelector, ElementCallback} from '../libs/once-visible-observer';

function hide(element: HTMLElement): void {
	if (select.exists(`a[href^="/${getUsername()}"]`, element)) {
		element.style.display = 'none';
	}
}

function init(): void {
	lazilyObserveSelector(`
		#dashboard .news .watch_started,
		#dashboard .news .fork
	`, hide as ElementCallback);
}

features.add({
	id: __filebasename,
	description: 'Hides "starred" events for your own repos on the newsfeed.',
	screenshot: false
}, {
	include: [
		pageDetect.isDashboard
	],
	repeatOnAjax: false,
	init: oneTime(init)
});
