import './small-user-avatars.css';
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
		const size = 14;

		link.prepend(
			<img
				className="avatar avatar-user v-align-text-bottom mr-1 rgh-small-user-avatars"
				src={getUserAvatarURL(username, size)!}
				width={size}
				height={size}
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

/*

Test URLs:

https://github.com/refined-github/refined-github/issues

*/
