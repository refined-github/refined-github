import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import {getUsername} from '../github-helpers';
import observe from '../helpers/selector-observer';

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
	include: [
		pageDetect.isDashboard,
	],
	awaitDomReady: false,
	init,
});
