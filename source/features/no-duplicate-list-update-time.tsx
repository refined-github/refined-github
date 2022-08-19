import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

function parseTime(element: HTMLElement): number {
	return new Date(element.getAttribute('datetime')!).getTime();
}

function init(): void {
	for (const issue of select.all('.js-navigation-item[id^="issue_"]')) {
		const [stateChangeTime, updateTime] = select.all('relative-time', issue);
		if (parseTime(updateTime) - parseTime(stateChangeTime) < 10_000) { // Hide if within 10 seconds
			updateTime.parentElement!.remove();
		}
	}
}

void features.add(import.meta.url, {
	asLongAs: [
		() => location.search.includes('sort%3Aupdated-'),
	],
	include: [
		pageDetect.isIssueOrPRList,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
