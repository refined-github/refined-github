import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils.js';
import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

function linkify(avatar: HTMLImageElement): void {
	const userName = avatar.alt.slice(1);
	// Linkify name first
	wrap(avatar.nextElementSibling!, <a className="Link--primary" href={`/${userName}`}/>);

	// Then linkify avatar
	wrap(avatar, <a href={`/${userName}`}/>);
}

function init(signal: AbortSignal): void {
	observe('details-dialog .Box-header .mr-3 > img:not([alt*="[bot]"])', linkify, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isConversation,
	],
	init,
});

/*

Test URLs:

- User edits: https://github.com/refined-github/sandbox/issues/24#issue-1299932109
- App edits: https://github.com/renovatebot/renovate/pull/30606#issue-2449330214
- Ghost edits: https://github.com/Mottie/GitHub-userscripts/issues/88#issuecomment-502933879

*/
