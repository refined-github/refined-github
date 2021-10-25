import onetime from 'onetime';
import {observe} from 'selector-observer';
import shortenURL from 'shorten-repo-url';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {linkifiedURLClass} from '../github-helpers/dom-formatters';

const redirectDomains = new Set([
	'github-redirect.dependabot.com', // Dependabot
	'togithub.com', // Renovate
]);

function init(): void {
	observe(`a[href]:not(.${linkifiedURLClass})`, {
		constructor: HTMLAnchorElement,
		add(link) {
			if (redirectDomains.has(link.hostname)) {
				const {href} = link;
				link.hostname = 'github.com';

				if (
					(href === link.textContent!.trim() || href === `${link.textContent!}/`)
					&& !link.firstElementChild
				) {
					const shortened = shortenURL(link.href, location.href);
					link.innerHTML = shortened;
					return;
				}
			}

			shortenURL.applyToLink(link, location.href);
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
