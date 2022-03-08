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
			// Exclude the link if the closest element found is not `.comment-body`
			// This avoids shortening links in code and code suggestions, but still shortens them in review comments
			// https://github.com/refined-github/refined-github/pull/4759#discussion_r702460890
			if (link.closest('pre, .blob-code, .js-suggested-changes-blob, .comment-body')?.classList.contains('comment-body')) {
				applyToLink(link, location.href);
			}
		},
	});
}

void features.add(import.meta.url, {
	exclude: [
		// Due to GitHub’s bug: #2828
		pageDetect.isGlobalSearchResults,
	],
	init: onetime(init),
});
