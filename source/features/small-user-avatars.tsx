import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import getUserAvatarURL from '../github-helpers/get-user-avatar';

function init(): void {
	for (const link of select.all(
		':is(.js-issue-row, .js-pinned-issue-list-item) [data-hovercard-type="user"]', // Excludes bots
	)) {
		const username = link.textContent!;
		const size = 16;

		link.prepend(
			<img
				className="avatar avatar-user mr-1"
				src={getUserAvatarURL(username, size)!}
				width={size}
				height={size}
				alt={`@${username}`}
				loading="lazy"
			/>,
		);
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isIssueOrPRList,
	],
	awaitDomReady: true,
	deduplicate: 'has-rgh-inner',
	init,
});
