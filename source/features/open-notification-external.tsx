import {$$} from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';

function init(): void {
	for (const link of $$('a.notification-list-item-link')) {
		link.target = '_blank';
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isNotifications,
	],
	awaitDomReady: true,
	init,
});

/*

Test URLs:

https://github.com/notifications

*/
