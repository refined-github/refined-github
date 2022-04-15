import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	for (const header of select.all('.js-notifications-group h6')) {
		header.append(
			<a className="text-inherit color-fg-inherit" href={'/' + header.textContent!.trim()}>
				{header.firstChild}
			</a>,
		);
	}
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
