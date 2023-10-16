import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

function linkify(header: HTMLElement): void {
	header.append(
		<a className="color-fg-inherit" href={'/' + header.textContent.trim()}>
			{header.firstChild}
		</a>,
	);
}

function init(signal: AbortSignal): void {
	observe('.js-notifications-group h6', linkify, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isNotifications,
	],
	exclude: [
		pageDetect.isBlank, // Empty notification list
	],
	init,
});
