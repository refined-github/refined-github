import * as pageDetect from 'github-url-detection';
import {$$} from 'select-dom';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

function parseTime(element: HTMLElement): number {
	// `datetime` can be missing before hydration. `NaN` keeps the time visible
	const datetime = element.getAttribute('datetime');
	return datetime ? Date.parse(datetime) : Number.NaN;
}

function remove(issue: HTMLElement): void {
	const [stateChangeTime, updateTime] = $$('relative-time', issue);
	// The update time is missing from the new lists when it's not shown at all
	if (!updateTime) {
		return;
	}

	if (parseTime(updateTime) - parseTime(stateChangeTime) < 10_000) { // Hide if within 10 seconds
		updateTime.parentElement!.remove();
	}
}

function init(signal: AbortSignal): void {
	observe([
		// Legacy lists
		'.js-navigation-item[id^="issue_"]',
		// React lists. The "Updated" part is a sibling of the state change time, in the same container
		'li[class*="listItem"] [data-testid="timestamp-container"]',
	], remove, {signal});
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

/*

Test URLs:

This feature applies to conversation lists sorted by updated time

- https://github.com/sindresorhus/refined-github/pulls?q=sort%3Aupdated-asc+is%3Aclosed
- https://github.com/sindresorhus/refined-github/issues?q=is%3Aissue+sort%3Aupdated-desc+is%3Aclosed+comments%3A0
- https://github.com/issues?q=is%3Aissue+is%3Aopen+author%3Afregante+archived%3Afalse+sort%3Aupdated-desc
- https://github.com/refined-github/refined-github/pulls?q=is%3Apr+is%3Aopen+sort%3Aupdated-desc

*/
