import select from 'select-dom';
import onetime from 'onetime';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {getUsername} from '../github-helpers';

async function init(): Promise<void> {
	for (const item of select.all('#dashboard .news .watch_started, #dashboard .news .fork')) {
		if (select.exists(`a[href^="/${getUsername()}"]`, item)) {
			item.style.display = 'none';
		}
	}
}

void features.add({
	id: __filebasename,
	description: 'Hides "starred" events for your own repos on the newsfeed.',
	screenshot: false
}, {
	include: [
		pageDetect.isDashboard
	],
	onlyAdditionalListeners: true,
	init: onetime(init)
});
