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
			// Don't shorten links in code or code suggestions (but shorten them in review comments) https://github.com/refined-github/refined-github/pull/4759#discussion_r702460890
			if (link.closest('.blob-code, .comment-body, .js-suggested-changes-blob')?.classList.contains('.comment-body') === false) {
				return;
			}

			applyToLink(link, location.href);
		},
	});
}

void features.add(__filebasename, {
	exclude: [
		// Due to GitHub’s bug: #2828
		pageDetect.isGlobalSearchResults,
	],
	init: onetime(init),
});
