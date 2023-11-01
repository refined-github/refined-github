import {$$} from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

function parseTime(element: HTMLElement): number {
	return new Date(element.getAttribute('datetime')!).getTime();
}

function remove(issue: HTMLElement): void {
	const [stateChangeTime, updateTime] = $$('relative-time', issue);
	if (parseTime(updateTime) - parseTime(stateChangeTime) < 10_000) { // Hide if within 10 seconds
		updateTime.parentElement!.remove();
	}
}

function init(signal: AbortSignal): void {
	observe('.js-navigation-item[id^="issue_"]', remove, {signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		() => location.search.includes('sort%3Aupdated-'),
	],
	include: [
		pageDetect.isIssueOrPRList,
	],
	init,
});
