import * as pageDetect from 'github-url-detection';
import domLoaded from 'dom-loaded';
import delay from 'delay';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

const regex = /\/files\/[\da-f]{40}..[\da-f]{40}$/;
const rghParameter = 'latest-changes';

function trimLink(link: HTMLAnchorElement): void {
	if (regex.test(link.pathname)) {
		link.pathname = link.pathname.replace(regex, '');
		link.hash = '#partial-timeline';
		const search = new URLSearchParams(link.search);
		search.set('rgh', rghParameter);
		link.search = String(search);
	}
}

async function scrollToLatestChanges(): Promise<void> {
	const url = new URL(location.href);
	url.searchParams.delete('rgh');
	url.hash = '';
	history.replaceState(history.state, '', url.href);

	const controller = new AbortController();
	observe('new changes since you last visited', element => {
		element.scrollIntoView();
		controller.abort();
	}, {signal: controller.signal});

	// It won't appear after this point
	await domLoaded;
	await delay(100); // Allow the observer to trigger just in case
	controller.abort();
}

function init(signal: AbortSignal): void {
	// It's ok if it's not 100% safe because trimLink's regex is super specific
	observe('[href*="/pull/"][href*="/files/"][href*=".."]', trimLink, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isNotifications,
	],
	init,
}, {
	include: [
		() => new URLSearchParams(location.search).get('rgh') === rghParameter,
	],
	init: scrollToLatestChanges,
});

/*

Test URL:

https://github.com/notifications

*/
