import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import {getUsername} from '../github-helpers';
import observe from '../helpers/selector-observer';

function hide(item: HTMLElement): void {
	if (select.exists(`a[href^="/${getUsername()!}"]`, item)) {
		item.style.display = 'none';
	}
}

function init(signal: AbortSignal): void {
	/* TODO: Use :has() and skip select.exists */
	/* TODO: Revert `classes` #6072 */
	observe(`
		#dashboard .news :is(
			[classes~='watch_started'],
			[classes~='fork'],
			.watch_started,
			.fork
		)
	`, hide, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isDashboard,
	],
	awaitDomReady: false,
	init,
});
