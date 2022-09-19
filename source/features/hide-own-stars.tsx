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
	observe('#dashboard .news .watch_started, #dashboard .news .fork', hide, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isDashboard,
	],
	deduplicate: 'has-rgh',
	init,
});
