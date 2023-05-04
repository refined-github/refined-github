import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

function addLink(showCaseTitle: Element): void {
	const url = new URL(location.pathname, location.href);
	// DO NOT add type: 'source' since forks could also have many stars
	url.search = new URLSearchParams({
		tab: 'repositories',
		sort: 'stargazers',
	}).toString();

	showCaseTitle.firstChild!.after(' / ', <a href={url.href}>Top repositories</a>);
}

function init(signal: AbortSignal): void {
	observe('.js-pinned-items-reorder-container h2', addLink, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isUserProfileMainTab,
	],
	init,
});
