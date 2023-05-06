import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import {getUsername} from '../github-helpers/index.js';
import {isHasSelectorSupported} from '../helpers/select-has.js';
import observe from '../helpers/selector-observer.js';

function hide(item: HTMLElement): void {
	item.hidden = true;
}

function init(signal: AbortSignal): void {
	const own = `:has(a[href^="/${getUsername()!}"])`;
	observe([
		// Single events
		`#dashboard :is(.watch_started, .fork)${own}`,

		// Grouped events
		`#dashboard .body:has(.watch_started, .fork)${own}`,
	], hide, {signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		isHasSelectorSupported,
	],
	include: [
		pageDetect.isDashboard,
	],
	init,
});
