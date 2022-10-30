import * as pageDetect from 'github-url-detection';

import observe from '../helpers/selector-observer';
import features from '../feature-manager';

const heatMap = new Map([
	['3', '1'],
	['6', '2'],
	['15', '3'],
	['24', '4'],
	['40', '5'],
	['70', '6'],
	['100', '7'],
	['160', '8'],
	['275', '9'],
	['30000', '10'],
]);

function daysDiff(date1: Date, date2 = new Date()): number {
	const diffTime = Math.abs(date2.getTime() - date1.getTime());
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	return diffDays;
}

function addHeatIndex(timeAgo: HTMLElement): void {
	const dateDiff = daysDiff(new Date(timeAgo.attributes.datetime.value));
	let heatIndex = '0';
	for (const [days, heat] of heatMap) {
		if (dateDiff <= Number(days)) {
			heatIndex = heat;
			return;
		}
	}

	timeAgo.dataset.rghHeat = heatIndex;
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
