import * as pageDetect from 'github-url-detection';

import observe from '../helpers/selector-observer';
import features from '../feature-manager';

function daysDiff(date1: Date, date2 = new Date()): number {
	const diffTime = Math.abs(date2.getTime() - date1.getTime());
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	return diffDays;
}

function addHeatIndex(timeAgo: HTMLElement): void {
	const dateDiff = daysDiff(new Date(timeAgo.attributes.datetime.value));
	timeAgo.dataset.rghHeat = String(Math.sqrt(dateDiff / 2.5).toFixed(0));
}

function init(signal: AbortSignal): void {
	observe('.js-navigation-item time-ago', addHeatIndex, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoTree,
	],
	init,
});
