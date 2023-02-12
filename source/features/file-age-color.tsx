import * as pageDetect from 'github-url-detection';

import observe from '../helpers/selector-observer';
import features from '../feature-manager';

function addHeatIndex(timeAgo: HTMLElement): void {
	const diff = Date.now() - new Date(timeAgo.attributes.datetime.value).getTime();

	// Create heat square root curve
	timeAgo.dataset.rghHeat = String(Math.max(0, Math.min(10, Math.sqrt(diff / 400_000_000))));
}

function init(signal: AbortSignal): void {
	observe('.js-navigation-item time-ago', addHeatIndex, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoTree,
	],
	awaitDomReady: false,
	init,
});
