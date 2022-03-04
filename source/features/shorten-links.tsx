import onetime from 'onetime';
import {observe} from 'selector-observer';
import {applyToLink} from 'shorten-repo-url';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {linkifiedURLClass} from '../github-helpers/dom-formatters';

function init(): void {
	observe(`a[href]:not(.${linkifiedURLClass})`, {
		constructor: HTMLAnchorElement,
		add(link) {
			if (!isLinkInCode(link)) {
				applyToLink(link, location.href);
			}
		},
	});

	for (const link of document.querySelectorAll('.comment-body a[href*="/tree/"]')) {
		if (!isLinkInCode(link)) {
			applyToLink(link, location.href);
		}
	}
}

function isLinkInCode(link: HTMLAnchorElement): boolean {
	// Don't shorten links in code or code suggestions (but shorten them in review comments)
	// Code explanation: Exclude links if the closest element found is not `.comment-body`
	// https://github.com/refined-github/refined-github/pull/4759#discussion_r702460890
	return Boolean(link.closest('.blob-code, .comment-body, .js-suggested-changes-blob')?.matches('.blob-code'));
}

void features.add(import.meta.url, {
	exclude: [
		// Due to GitHub’s bug: #2828
		pageDetect.isGlobalSearchResults,
	],
	init: onetime(init),
});
